'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DRAFT_SCHEMA_VERSION = 1;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_CONTENT_KEY_LENGTH = 1024;
const MAX_BASE_REVISION_LENGTH = 4096;

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertJsonValue(value, fieldPath, ancestors = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${fieldPath} must not contain a non-finite number`);
    }
    return;
  }

  if (Array.isArray(value)) {
    if (ancestors.has(value)) {
      throw new TypeError(`${fieldPath} must not contain a circular reference`);
    }

    ancestors.add(value);
    value.forEach((item, index) => {
      assertJsonValue(item, `${fieldPath}[${index}]`, ancestors);
    });
    ancestors.delete(value);
    return;
  }

  if (!isPlainObject(value)) {
    throw new TypeError(`${fieldPath} must contain JSON-compatible values only`);
  }

  if (ancestors.has(value)) {
    throw new TypeError(`${fieldPath} must not contain a circular reference`);
  }

  const symbolKeys = Object.getOwnPropertySymbols(value);
  if (symbolKeys.length > 0) {
    throw new TypeError(`${fieldPath} must not contain symbol keys`);
  }

  ancestors.add(value);
  Object.entries(value).forEach(([key, item]) => {
    assertJsonValue(item, `${fieldPath}.${key}`, ancestors);
  });
  ancestors.delete(value);
}

function cloneJsonObject(payload) {
  if (!isPlainObject(payload)) {
    throw new TypeError('payload must be a plain object');
  }

  assertJsonValue(payload, 'payload');
  return JSON.parse(JSON.stringify(payload));
}

function normalizeContentKey(contentKey) {
  if (typeof contentKey !== 'string') {
    throw new TypeError('contentKey must be a string');
  }

  const normalized = contentKey.trim();
  if (!normalized) {
    throw new TypeError('contentKey must not be empty');
  }
  if (normalized.length > MAX_CONTENT_KEY_LENGTH) {
    throw new RangeError(`contentKey must not exceed ${MAX_CONTENT_KEY_LENGTH} characters`);
  }
  if (normalized.includes('\0')) {
    throw new TypeError('contentKey must not contain null bytes');
  }
  if (path.posix.isAbsolute(normalized) || path.win32.isAbsolute(normalized)) {
    throw new TypeError('contentKey must not be an absolute path');
  }

  const segments = normalized.split(/[\\/]+/);
  if (segments.includes('..')) {
    throw new TypeError('contentKey must not contain path traversal segments');
  }

  return normalized;
}

function normalizeId(id, fieldName = 'id') {
  if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
    throw new TypeError(`${fieldName} must be a valid UUID`);
  }
  return id.toLowerCase();
}

function normalizeBaseRevision(baseRevision) {
  if (baseRevision === undefined || baseRevision === null) {
    return null;
  }

  if (typeof baseRevision === 'number') {
    if (!Number.isFinite(baseRevision)) {
      throw new TypeError('baseRevision must be a finite number, string, or null');
    }
    return baseRevision;
  }

  if (typeof baseRevision !== 'string') {
    throw new TypeError('baseRevision must be a finite number, string, or null');
  }
  if (baseRevision.length > MAX_BASE_REVISION_LENGTH) {
    throw new RangeError(`baseRevision must not exceed ${MAX_BASE_REVISION_LENGTH} characters`);
  }

  return baseRevision;
}

function normalizeTimestamp(value, fieldName) {
  if (typeof value !== 'string') {
    throw new TypeError(`${fieldName} must be an ISO timestamp`);
  }

  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) {
    throw new TypeError(`${fieldName} must be an ISO timestamp`);
  }

  return value;
}

function validateStoredDraft(record, expectedId) {
  if (!isPlainObject(record)) {
    throw new TypeError('stored draft must be an object');
  }
  if (record.schemaVersion !== DRAFT_SCHEMA_VERSION) {
    throw new TypeError(`stored draft has unsupported schemaVersion: ${record.schemaVersion}`);
  }

  const id = normalizeId(record.id, 'stored draft id');
  if (expectedId && id !== expectedId) {
    throw new TypeError(`stored draft id does not match its filename: ${expectedId}.json`);
  }

  const createdAt = normalizeTimestamp(record.createdAt, 'stored draft createdAt');
  const updatedAt = normalizeTimestamp(record.updatedAt, 'stored draft updatedAt');
  if (Date.parse(updatedAt) < Date.parse(createdAt)) {
    throw new TypeError('stored draft updatedAt must not precede createdAt');
  }

  return {
    schemaVersion: DRAFT_SCHEMA_VERSION,
    id,
    contentKey: normalizeContentKey(record.contentKey),
    baseRevision: normalizeBaseRevision(record.baseRevision),
    createdAt,
    updatedAt,
    payload: cloneJsonObject(record.payload),
  };
}

class DraftStore {
  /**
   * @param {string} directory Dedicated private directory for draft JSON files.
   * @param {{ now?: () => Date|string|number, createId?: () => string }} [options]
   */
  constructor(directory, options = {}) {
    if (typeof directory !== 'string' || !directory.trim()) {
      throw new TypeError('draft directory must be a non-empty string');
    }
    if (!isPlainObject(options)) {
      throw new TypeError('draft store options must be an object');
    }
    if (options.now !== undefined && typeof options.now !== 'function') {
      throw new TypeError('options.now must be a function');
    }
    if (options.createId !== undefined && typeof options.createId !== 'function') {
      throw new TypeError('options.createId must be a function');
    }

    this.directory = path.resolve(directory);
    this._now = options.now || (() => new Date());
    this._createId = options.createId || (() => crypto.randomUUID());
    this._ensureDirectory();
  }

  list() {
    const records = this._readAll();
    records.sort((left, right) => {
      const updatedDifference = Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
      if (updatedDifference !== 0) return updatedDifference;

      const createdDifference = Date.parse(right.createdAt) - Date.parse(left.createdAt);
      if (createdDifference !== 0) return createdDifference;

      return left.id.localeCompare(right.id);
    });
    return records.map(record => cloneJsonObject(record));
  }

  get(id) {
    const normalizedId = normalizeId(id);
    const filePath = this._draftPath(normalizedId);

    try {
      const stat = fs.lstatSync(filePath);
      if (!stat.isFile() || stat.isSymbolicLink()) {
        throw new TypeError(`draft file is not a regular file: ${normalizedId}.json`);
      }
    } catch (error) {
      if (error && error.code === 'ENOENT') return null;
      throw error;
    }

    return cloneJsonObject(this._readDraftFile(filePath, normalizedId));
  }

  upsert(input) {
    if (!isPlainObject(input)) {
      throw new TypeError('draft input must be an object');
    }
    if (!Object.prototype.hasOwnProperty.call(input, 'payload')) {
      throw new TypeError('draft input must include payload');
    }

    const contentKey = normalizeContentKey(input.contentKey);
    const payload = cloneJsonObject(input.payload);
    const records = this._readAll();
    const requestedId =
      input.id === undefined || input.id === null || input.id === ''
        ? null
        : normalizeId(input.id);
    const byId = requestedId ? records.find(record => record.id === requestedId) : null;
    const byContentKey = records.find(record => record.contentKey === contentKey) || null;

    if (requestedId && !byId) {
      throw new Error(`draft not found: ${requestedId}`);
    }
    if (byId && byContentKey && byId.id !== byContentKey.id) {
      throw new Error(`another draft already uses contentKey: ${contentKey}`);
    }

    const existing = byId || byContentKey;
    const now = this._currentTimestamp();
    const baseRevision =
      input.baseRevision === undefined && existing
        ? existing.baseRevision
        : normalizeBaseRevision(input.baseRevision);

    const record = {
      schemaVersion: DRAFT_SCHEMA_VERSION,
      id: existing ? existing.id : this._newUniqueId(records),
      contentKey,
      baseRevision,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
      payload,
    };

    if (Date.parse(record.updatedAt) < Date.parse(record.createdAt)) {
      throw new Error('current time must not precede the draft creation time');
    }

    this._writeAtomic(record);
    return cloneJsonObject(record);
  }

  delete(id) {
    const normalizedId = normalizeId(id);
    const filePath = this._draftPath(normalizedId);

    try {
      const stat = fs.lstatSync(filePath);
      if (!stat.isFile() || stat.isSymbolicLink()) {
        throw new TypeError(`draft file is not a regular file: ${normalizedId}.json`);
      }
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      if (error && error.code === 'ENOENT') return false;
      throw error;
    }
  }

  _ensureDirectory() {
    fs.mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    const stat = fs.statSync(this.directory);
    if (!stat.isDirectory()) {
      throw new TypeError(`draft store path is not a directory: ${this.directory}`);
    }
  }

  _currentTimestamp() {
    const supplied = this._now();
    const date = supplied instanceof Date ? new Date(supplied.getTime()) : new Date(supplied);
    if (!Number.isFinite(date.getTime())) {
      throw new TypeError('options.now returned an invalid date');
    }
    return date.toISOString();
  }

  _newUniqueId(records) {
    const existingIds = new Set(records.map(record => record.id));

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = normalizeId(this._createId(), 'generated draft id');
      if (!existingIds.has(candidate) && !fs.existsSync(this._draftPath(candidate))) {
        return candidate;
      }
    }

    throw new Error('could not generate a unique draft id');
  }

  _draftPath(id) {
    const normalizedId = normalizeId(id);
    const filePath = path.join(this.directory, `${normalizedId}.json`);
    if (path.dirname(filePath) !== this.directory) {
      throw new TypeError('draft id resolved outside the draft directory');
    }
    return filePath;
  }

  _readAll() {
    this._ensureDirectory();
    const entries = fs.readdirSync(this.directory, { withFileTypes: true });

    return entries
      .filter(entry => entry.name.endsWith('.json'))
      .map(entry => {
        if (!entry.isFile() || entry.isSymbolicLink()) {
          throw new TypeError(`draft entry is not a regular file: ${entry.name}`);
        }

        const id = normalizeId(entry.name.slice(0, -'.json'.length), 'draft filename');
        return this._readDraftFile(path.join(this.directory, entry.name), id);
      });
  }

  _readDraftFile(filePath, expectedId) {
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      throw new Error(`could not read draft ${expectedId}`, { cause: error });
    }

    try {
      return validateStoredDraft(parsed, expectedId);
    } catch (error) {
      throw new Error(`invalid draft ${expectedId}: ${error.message}`, { cause: error });
    }
  }

  _writeAtomic(record) {
    this._ensureDirectory();
    const targetPath = this._draftPath(record.id);
    const temporaryPath = path.join(
      this.directory,
      `.${record.id}.${process.pid}.${crypto.randomUUID()}.tmp`
    );
    const serialized = `${JSON.stringify(record, null, 2)}\n`;
    let descriptor = null;

    try {
      descriptor = fs.openSync(temporaryPath, 'wx', 0o600);
      fs.writeFileSync(descriptor, serialized, 'utf8');
      fs.fsyncSync(descriptor);
      fs.closeSync(descriptor);
      descriptor = null;
      fs.renameSync(temporaryPath, targetPath);
    } catch (error) {
      if (descriptor !== null) {
        try {
          fs.closeSync(descriptor);
        } catch {
          // Preserve the original write error.
        }
      }
      try {
        fs.unlinkSync(temporaryPath);
      } catch (cleanupError) {
        if (!cleanupError || cleanupError.code !== 'ENOENT') {
          error.cleanupError = cleanupError;
        }
      }
      throw error;
    }
  }
}

function createDraftStore(directory, options) {
  return new DraftStore(directory, options);
}

module.exports = {
  DRAFT_SCHEMA_VERSION,
  DraftStore,
  createDraftStore,
};
