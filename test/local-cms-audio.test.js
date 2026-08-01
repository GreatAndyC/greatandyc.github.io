const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  SECURITY_HEADERS,
  normalizeAudioPostKey,
  sanitizeAudioFilename,
  decodeStrictBase64,
  validateAudioUploadFile,
  uploadAudioFile,
  resolveAudioPublicPath,
  parseAudioRangeHeader,
  renderMarkdownPreview
} = require('../tools/local-cms');

function audioBuffer(extension) {
  if (extension === '.mp3') {
    return Buffer.from([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  }
  if (extension === '.m4a') {
    return Buffer.from([
      0x00, 0x00, 0x00, 0x10,
      0x66, 0x74, 0x79, 0x70,
      0x4d, 0x34, 0x41, 0x20,
      0x00, 0x00, 0x00, 0x00
    ]);
  }
  if (extension === '.ogg') {
    return Buffer.from([0x4f, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00]);
  }
  if (extension === '.wav') {
    return Buffer.from([
      0x52, 0x49, 0x46, 0x46,
      0x04, 0x00, 0x00, 0x00,
      0x57, 0x41, 0x56, 0x45
    ]);
  }
  throw new Error(`Unsupported fixture extension: ${extension}`);
}

function uploadFile(name, type, content = audioBuffer(path.extname(name).toLowerCase())) {
  return {
    name,
    type,
    size: content.length,
    content: content.toString('base64')
  };
}

function temporaryProject(t) {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'local-cms-audio-'));
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));
  return {
    projectRoot,
    audioDir: path.join(projectRoot, 'source', 'audio'),
    audioPostsDir: path.join(projectRoot, 'source', 'audio', 'posts')
  };
}

test('audio post keys and filenames are normalized without accepting paths', () => {
  assert.equal(normalizeAudioPostKey('2026-07-30-demo-post'), '2026-07-30-demo-post');
  assert.equal(normalizeAudioPostKey('中文-文章-1'), '中文-文章-1');
  assert.throws(() => normalizeAudioPostKey('../outside'), { statusCode: 400 });
  assert.throws(() => normalizeAudioPostKey('nested/post'), { statusCode: 400 });
  assert.throws(() => normalizeAudioPostKey('.hidden'), { statusCode: 400 });

  assert.equal(sanitizeAudioFilename('My Local Song.MP3'), 'My-Local-Song.mp3');
  assert.equal(sanitizeAudioFilename('  访谈 01.ogg  '), '访谈-01.ogg');
  assert.throws(() => sanitizeAudioFilename('../song.mp3'), { statusCode: 400 });
  assert.throws(() => sanitizeAudioFilename('cover.jpg'), { statusCode: 415 });
});

test('strict base64 decoding rejects whitespace, missing padding, invalid data and oversize content', () => {
  assert.deepEqual(decodeStrictBase64('TQ=='), Buffer.from('M'));
  assert.throws(() => decodeStrictBase64('TQ'), { statusCode: 400 });
  assert.throws(() => decodeStrictBase64('TQ==\n'), { statusCode: 400 });
  assert.throws(() => decodeStrictBase64('!!!!'), { statusCode: 400 });
  assert.throws(() => decodeStrictBase64(Buffer.alloc(5).toString('base64'), 4), { statusCode: 413 });
});

test('audio validation accepts the four supported formats and checks MIME, size and magic bytes', () => {
  const fixtures = [
    ['track.mp3', 'audio/mpeg'],
    ['track.m4a', 'audio/mp4'],
    ['track.ogg', 'audio/ogg'],
    ['track.wav', 'audio/wav']
  ];

  fixtures.forEach(([name, type]) => {
    const result = validateAudioUploadFile(uploadFile(name, type));
    assert.equal(result.name, name);
    assert.equal(result.content.length > 0, true);
  });

  assert.equal(
    validateAudioUploadFile(uploadFile('track.m4a', 'audio/m4a')).mimeType,
    'audio/mp4'
  );
  assert.equal(
    validateAudioUploadFile(uploadFile('track.mp3', '')).mimeType,
    'audio/mpeg'
  );

  assert.throws(
    () => validateAudioUploadFile(uploadFile('track.mp3', 'image/png')),
    { statusCode: 415 }
  );
  assert.throws(
    () => validateAudioUploadFile({
      ...uploadFile('track.mp3', 'audio/mpeg'),
      size: 999
    }),
    { statusCode: 400 }
  );
  assert.throws(
    () => validateAudioUploadFile(uploadFile('track.mp3', 'audio/mpeg', Buffer.from('not an mp3'))),
    { statusCode: 415 }
  );
  assert.throws(
    () => validateAudioUploadFile(uploadFile('track.flac', 'audio/flac', Buffer.from('fLaC'))),
    { statusCode: 415 }
  );
});

test('audio upload writes under the server-derived post directory and never overwrites a collision', t => {
  const paths = temporaryProject(t);
  const file = uploadFile('My Song.mp3', 'audio/mpeg');
  const options = {
    projectRoot: paths.projectRoot,
    audioPostsDir: paths.audioPostsDir
  };

  const first = uploadAudioFile('2026-07-30-demo', file, options);
  const second = uploadAudioFile('2026-07-30-demo', file, options);

  assert.equal(first.path, '/audio/posts/2026-07-30-demo/My-Song.mp3');
  assert.equal(second.path, '/audio/posts/2026-07-30-demo/My-Song-2.mp3');
  assert.match(first.embed, /^<audio controls preload="none" src="\/audio\/posts\//);
  assert.deepEqual(
    fs.readFileSync(path.join(paths.audioPostsDir, '2026-07-30-demo', 'My-Song.mp3')),
    audioBuffer('.mp3')
  );
  assert.deepEqual(
    fs.readFileSync(path.join(paths.audioPostsDir, '2026-07-30-demo', 'My-Song-2.mp3')),
    audioBuffer('.mp3')
  );
});

test('invalid audio is rejected before upload directories are created', t => {
  const paths = temporaryProject(t);

  assert.throws(
    () => uploadAudioFile(
      '2026-07-30-demo',
      uploadFile('fake.mp3', 'audio/mpeg', Buffer.from('not audio')),
      {
        projectRoot: paths.projectRoot,
        audioPostsDir: paths.audioPostsDir
      }
    ),
    { statusCode: 415 }
  );
  assert.equal(fs.existsSync(paths.audioPostsDir), false);
});

test('public audio resolution is allowlisted, contained and rejects symbolic links', t => {
  const paths = temporaryProject(t);
  const uploaded = uploadAudioFile(
    '2026-07-30-demo',
    uploadFile('track.mp3', 'audio/mpeg'),
    {
      projectRoot: paths.projectRoot,
      audioPostsDir: paths.audioPostsDir
    }
  );

  const resolved = resolveAudioPublicPath(uploaded.path, {
    projectRoot: paths.projectRoot,
    audioDir: paths.audioDir
  });
  assert.equal(resolved.contentType, 'audio/mpeg');
  assert.equal(resolved.size, audioBuffer('.mp3').length);

  assert.throws(
    () => resolveAudioPublicPath('/audio/posts/../secret.mp3', {
      projectRoot: paths.projectRoot,
      audioDir: paths.audioDir
    }),
    error => error.statusCode === 400 || error.statusCode === 404
  );
  assert.throws(
    () => resolveAudioPublicPath('/audio/posts/2026-07-30-demo/cover.jpg', {
      projectRoot: paths.projectRoot,
      audioDir: paths.audioDir
    }),
    { statusCode: 404 }
  );

  const outsideDirectory = path.join(paths.projectRoot, 'outside');
  fs.mkdirSync(outsideDirectory, { recursive: true });
  fs.writeFileSync(path.join(outsideDirectory, 'track.mp3'), audioBuffer('.mp3'));
  fs.symlinkSync(outsideDirectory, path.join(paths.audioPostsDir, 'linked'), 'dir');

  assert.throws(
    () => resolveAudioPublicPath('/audio/posts/linked/track.mp3', {
      projectRoot: paths.projectRoot,
      audioDir: paths.audioDir
    }),
    { statusCode: 404 }
  );
});

test('audio byte ranges support complete, open-ended and suffix ranges', () => {
  assert.deepEqual(parseAudioRangeHeader('', 100), null);
  assert.deepEqual(parseAudioRangeHeader('bytes=0-9', 100), {
    start: 0,
    end: 9,
    length: 10
  });
  assert.deepEqual(parseAudioRangeHeader('bytes=90-', 100), {
    start: 90,
    end: 99,
    length: 10
  });
  assert.deepEqual(parseAudioRangeHeader('bytes=-15', 100), {
    start: 85,
    end: 99,
    length: 15
  });
  assert.deepEqual(parseAudioRangeHeader('bytes=95-999', 100), {
    start: 95,
    end: 99,
    length: 5
  });

  assert.throws(() => parseAudioRangeHeader('bytes=100-110', 100), {
    statusCode: 416,
    headers: {
      'Content-Range': 'bytes */100',
      'Accept-Ranges': 'bytes'
    }
  });
  assert.throws(() => parseAudioRangeHeader('bytes=0-1,5-6', 100), { statusCode: 416 });
  assert.throws(() => parseAudioRangeHeader('items=0-1', 100), { statusCode: 416 });
});

test('Markdown preview preserves local audio HTML', () => {
  const markdown = [
    '正文',
    '',
    '<audio controls preload="none" src="/audio/posts/demo/track.mp3">您的浏览器不支持音频播放。</audio>'
  ].join('\n');
  const html = renderMarkdownPreview(markdown);

  assert.match(html, /<audio controls preload="none" src="\/audio\/posts\/demo\/track\.mp3">/);
  assert.match(html, /您的浏览器不支持音频播放。<\/audio>/);
});

test('CMS CSP allows local media and only the NetEase frame origin', () => {
  const csp = SECURITY_HEADERS['Content-Security-Policy'];
  assert.match(csp, /media-src 'self'/);
  assert.match(csp, /frame-src https:\/\/music\.163\.com/);
  assert.doesNotMatch(csp, /frame-src \*/);
});
