
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  RIDBStore: () => RIDBStore
});
module.exports = __toCommonJS(src_exports);
var import_ridb = require("@trust0/ridb");
var import_identus_edge_agent_sdk = __toESM(require("@hyperledger/identus-edge-agent-sdk"));
var RIDBStore = class {
  constructor(options) {
    this.options = options;
    __publicField(this, "_db");
    const { dbName } = this.options;
    const { schemas, migrations } = this.extractCollections();
    this._db = new import_ridb.RIDB({
      dbName,
      schemas,
      migrations
    });
  }
  extractCollections() {
    const collections = import_identus_edge_agent_sdk.default.makeCollections();
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
  query(table, query) {
    return __async(this, null, function* () {
      const collectionName = this.parseName(table);
      const collection = this.collections[collectionName];
      const ridbQuery = (query == null ? void 0 : query.selector) || query || {};
      return collection.find(ridbQuery);
    });
  }
  insert(table, model) {
    return __async(this, null, function* () {
      const collectionName = this.parseName(table);
      const collection = this.collections[collectionName];
      yield collection.create(model);
    });
  }
  update(table, model) {
    return __async(this, null, function* () {
      const collectionName = this.parseName(table);
      const collection = this.collections[collectionName];
      yield collection.update(model);
    });
  }
  delete(table, uuid) {
    return __async(this, null, function* () {
      const collectionName = this.parseName(table);
      const collection = this.collections[collectionName];
      yield collection.delete(uuid);
    });
  }
  get collections() {
    if (!this._db) {
      throw new Error("Start the ridb first");
    }
    return this._db.collections;
  }
  start() {
    return __async(this, null, function* () {
      yield this._db.start(this.options);
    });
  }
  cleanup() {
    return __async(this, null, function* () {
      throw new Error("Not implemented");
    });
  }
  clear() {
    return __async(this, null, function* () {
      throw new Error("Not implemented");
    });
  }
};
