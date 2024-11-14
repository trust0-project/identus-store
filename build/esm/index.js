
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// src/index.ts
import { RIDB } from "@trust0/ridb";
import SDK from "@hyperledger/identus-edge-agent-sdk";
var RIDBStore = class {
  constructor(options) {
    this.options = options;
    const { dbName } = this.options;
    const { schemas, migrations } = this.extractCollections();
    this._db = new RIDB({
      dbName,
      schemas,
      migrations
    });
  }
  _db;
  extractCollections() {
    const collections = SDK.makeCollections();
    return Object.keys(collections).reduce((all, name) => {
      const collection = collections[name];
      const schemas = all.schemas;
      const migrations = all.migrations;
      schemas[name] = collection.schema;
      if (collection.migrationStrategies) {
        migrations[name] = collection.migrationStrategies;
      }
      return {
        schemas,
        migrations
      };
    }, { schemas: {}, migrations: {} });
  }
  parseName(collectionName) {
    const name = collectionName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    if (!this.collections[name]) {
      throw new Error(`Collection  does not exist`);
    }
    return name;
  }
  async query(table, query) {
    const collectionName = this.parseName(table);
    const collection = this.collections[collectionName];
    const ridbQuery = query?.selector || query || {};
    return collection.find(ridbQuery);
  }
  async insert(table, model) {
    const collectionName = this.parseName(table);
    const collection = this.collections[collectionName];
    await collection.create(model);
  }
  async update(table, model) {
    const collectionName = this.parseName(table);
    const collection = this.collections[collectionName];
    await collection.update(model);
  }
  async delete(table, uuid) {
    const collectionName = this.parseName(table);
    const collection = this.collections[collectionName];
    await collection.delete(uuid);
  }
  get collections() {
    if (!this._db) {
      throw new Error("Start the ridb first");
    }
    return this._db.collections;
  }
  async start() {
    await this._db.start(this.options);
  }
  async cleanup() {
    throw new Error("Not implemented");
  }
  async clear() {
    throw new Error("Not implemented");
  }
};
export {
  RIDBStore
};
