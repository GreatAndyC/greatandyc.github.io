'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  DRAFT_SCHEMA_VERSION,
  DraftStore,
  createDraftStore,
} = require('../tools/local-cms/draft-store');

const IDS = [
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000004',
];

function makeStore(t, options = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'local-cms-drafts-'));
  let idIndex = 0;
  t.after(() => {
    fs.rmSync(directory, { recursive: true, force: true });
  });

  return {
    directory,
    store: createDraftStore(directory, {
      createId: () => IDS[idIndex++],
      ...options,
    }),
  };
}

test('creates one private JSON file and returns the complete draft schema', t => {
  const now = '2026-07-31T03:00:00.000Z';
  const { directory, store } = makeStore(t, { now: () => now });
  const payload = {
    zh: { title: '第一篇草稿', body: '正文' },
    en: { title: 'First draft', tags: ['CMS', 'draft'] },
  };

  const created = store.upsert({
    contentKey: 'posts/first-draft',
    baseRevision: 'sha256:before-edit',
    payload,
  });

  assert.deepEqual(created, {
    schemaVersion: DRAFT_SCHEMA_VERSION,
    id: IDS[0],
    contentKey: 'posts/first-draft',
    baseRevision: 'sha256:before-edit',
    createdAt: now,
    updatedAt: now,
    payload,
  });

  const entries = fs.readdirSync(directory);
  assert.deepEqual(entries, [`${IDS[0]}.json`]);
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(directory, entries[0]), 'utf8')),
    created
  );
  assert.equal(fs.statSync(path.join(directory, entries[0])).mode & 0o777, 0o600);
});

test('reuses the stable UUID for the same contentKey and keeps only one file', t => {
  const timestamps = [
    '2026-07-31T03:00:00.000Z',
    '2026-07-31T03:01:00.000Z',
    '2026-07-31T03:02:00.000Z',
  ];
  let timestampIndex = 0;
  const { directory, store } = makeStore(t, {
    now: () => timestamps[timestampIndex++],
  });

  const first = store.upsert({
    contentKey: 'posts/one',
    baseRevision: 'revision-1',
    payload: { body: 'first' },
  });
  const second = store.upsert({
    contentKey: 'posts/one',
    baseRevision: 'revision-2',
    payload: { body: 'second' },
  });
  const third = store.upsert({
    id: first.id,
    contentKey: 'posts/one',
    payload: { body: 'third' },
  });

  assert.equal(second.id, first.id);
  assert.equal(third.id, first.id);
  assert.equal(third.createdAt, first.createdAt);
  assert.equal(second.updatedAt, timestamps[1]);
  assert.equal(third.updatedAt, timestamps[2]);
  assert.equal(third.baseRevision, 'revision-2', 'omitting baseRevision preserves it');
  assert.deepEqual(store.get(first.id).payload, { body: 'third' });
  assert.deepEqual(fs.readdirSync(directory), [`${first.id}.json`]);
});

test('deep-clones payloads on write and every read', t => {
  const { store } = makeStore(t, {
    now: () => '2026-07-31T03:00:00.000Z',
  });
  const source = { nested: { title: 'Original' }, blocks: [{ text: 'A' }] };
  const created = store.upsert({
    contentKey: 'posts/cloning',
    payload: source,
  });

  source.nested.title = 'Changed outside';
  source.blocks[0].text = 'Changed outside';
  created.payload.nested.title = 'Changed return value';

  const firstRead = store.get(created.id);
  assert.deepEqual(firstRead.payload, {
    nested: { title: 'Original' },
    blocks: [{ text: 'A' }],
  });

  firstRead.payload.blocks[0].text = 'Changed first read';
  const listed = store.list();
  listed[0].payload.nested.title = 'Changed list result';

  assert.deepEqual(store.get(created.id).payload, {
    nested: { title: 'Original' },
    blocks: [{ text: 'A' }],
  });
});

test('lists drafts by updatedAt descending and persists across store instances', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'local-cms-drafts-'));
  t.after(() => {
    fs.rmSync(directory, { recursive: true, force: true });
  });

  const timestamps = [
    '2026-07-31T01:00:00.000Z',
    '2026-07-31T03:00:00.000Z',
    '2026-07-31T02:00:00.000Z',
  ];
  let timestampIndex = 0;
  let idIndex = 0;
  const firstStore = new DraftStore(directory, {
    now: () => timestamps[timestampIndex++],
    createId: () => IDS[idIndex++],
  });

  firstStore.upsert({ contentKey: 'posts/oldest', payload: { order: 3 } });
  const newest = firstStore.upsert({ contentKey: 'posts/newest', payload: { order: 1 } });
  firstStore.upsert({ contentKey: 'posts/middle', payload: { order: 2 } });

  const reopenedStore = new DraftStore(directory);
  assert.deepEqual(
    reopenedStore.list().map(draft => draft.contentKey),
    ['posts/newest', 'posts/middle', 'posts/oldest']
  );
  assert.deepEqual(reopenedStore.get(newest.id), newest);
});

test('deletes drafts idempotently', t => {
  const { directory, store } = makeStore(t, {
    now: () => '2026-07-31T03:00:00.000Z',
  });
  const created = store.upsert({
    contentKey: 'posts/to-delete',
    payload: { body: 'temporary' },
  });

  assert.equal(store.delete(created.id), true);
  assert.equal(store.get(created.id), null);
  assert.equal(store.delete(created.id), false);
  assert.deepEqual(fs.readdirSync(directory), []);
});

test('rejects invalid inputs and non-JSON payloads', t => {
  const { store } = makeStore(t, {
    now: () => '2026-07-31T03:00:00.000Z',
  });

  assert.throws(() => new DraftStore(''), /directory/);
  assert.throws(() => store.upsert(null), /input/);
  assert.throws(() => store.upsert({ contentKey: 'posts/a' }), /payload/);
  assert.throws(
    () => store.upsert({ contentKey: '', payload: {} }),
    /contentKey/
  );
  assert.throws(
    () => store.upsert({ contentKey: '/private/outside', payload: {} }),
    /absolute path/
  );
  assert.throws(
    () => store.upsert({ contentKey: 'posts/../../outside', payload: {} }),
    /path traversal/
  );
  assert.throws(
    () => store.upsert({ contentKey: 'posts/null\0byte', payload: {} }),
    /null bytes/
  );
  assert.throws(
    () => store.upsert({ contentKey: 'posts/array', payload: [] }),
    /plain object/
  );
  assert.throws(
    () => store.upsert({ contentKey: 'posts/date', payload: { date: new Date() } }),
    /JSON-compatible/
  );
  assert.throws(
    () => store.upsert({ contentKey: 'posts/undefined', payload: { body: undefined } }),
    /JSON-compatible/
  );
  assert.throws(
    () => store.upsert({ contentKey: 'posts/nan', payload: { score: Number.NaN } }),
    /non-finite/
  );
  assert.throws(
    () => store.upsert({ contentKey: 'posts/revision', baseRevision: {}, payload: {} }),
    /baseRevision/
  );

  const circular = {};
  circular.self = circular;
  assert.throws(
    () => store.upsert({ contentKey: 'posts/circular', payload: circular }),
    /circular reference/
  );
});

test('rejects traversal-shaped ids without touching files outside the store', t => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'local-cms-drafts-parent-'));
  const directory = path.join(parent, 'drafts');
  const sentinel = path.join(parent, 'outside.json');
  fs.writeFileSync(sentinel, '{"safe":true}\n');
  t.after(() => {
    fs.rmSync(parent, { recursive: true, force: true });
  });

  const store = new DraftStore(directory);
  ['../outside', '../../outside', '/tmp/outside', '..\\outside'].forEach(id => {
    assert.throws(() => store.get(id), /valid UUID/);
    assert.throws(() => store.delete(id), /valid UUID/);
  });
  assert.throws(
    () =>
      store.upsert({
        id: '../../outside',
        contentKey: 'posts/safe',
        payload: {},
      }),
    /valid UUID/
  );
  assert.equal(fs.readFileSync(sentinel, 'utf8'), '{"safe":true}\n');
});

test('prevents duplicate content keys and rejects missing explicit ids', t => {
  const timestamps = ['2026-07-31T03:00:00.000Z', '2026-07-31T03:01:00.000Z'];
  let timestampIndex = 0;
  const { store } = makeStore(t, {
    now: () => timestamps[timestampIndex++],
  });
  const first = store.upsert({ contentKey: 'posts/one', payload: { body: 'one' } });
  const second = store.upsert({ contentKey: 'posts/two', payload: { body: 'two' } });

  assert.throws(
    () =>
      store.upsert({
        id: second.id,
        contentKey: first.contentKey,
        payload: { body: 'collision' },
      }),
    /already uses contentKey/
  );
  assert.throws(
    () =>
      store.upsert({
        id: IDS[3],
        contentKey: 'posts/missing',
        payload: {},
      }),
    /draft not found/
  );
  assert.equal(store.list().length, 2);
});

test('uses same-directory temporary files and leaves no partial file after replacement', t => {
  const { directory, store } = makeStore(t, {
    now: () => '2026-07-31T03:00:00.000Z',
  });
  const created = store.upsert({
    contentKey: 'posts/atomic',
    payload: { body: 'before' },
  });
  store.upsert({
    id: created.id,
    contentKey: created.contentKey,
    payload: { body: 'after' },
  });

  const entries = fs.readdirSync(directory);
  assert.deepEqual(entries, [`${created.id}.json`]);
  assert.equal(entries.some(name => name.endsWith('.tmp')), false);
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(directory, entries[0]), 'utf8')).payload.body,
    'after'
  );
});
