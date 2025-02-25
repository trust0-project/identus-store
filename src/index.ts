import {
    BaseStorage,
    MigrationPathsForSchema,
    MigrationPathsForSchemas,
    QueryType,
    RIDB,
    SchemaType,
    StorageType
} from '@trust0/ridb';

import SDK from '@hyperledger/identus-edge-agent-sdk';

type RT = ReturnType<typeof SDK.makeCollections>;

type ExtractSchemas = {
    [key in keyof RT]: SchemaType
};

type CollectionsInternal = { schemas: ExtractSchemas, migrations: MigrationPathsForSchemas<ExtractSchemas> }
export class RIDBStore implements SDK.Pluto.Store {
    private _db: RIDB<ExtractSchemas>;

    private extractCollections() {
        const collections = SDK.makeCollections();
        return Object.keys(collections).reduce((all, name: keyof typeof collections) => {
            const collection = collections[name];
            const schemas = all.schemas;
            const migrations = all.migrations;
            schemas[name] = collection.schema as SchemaType;
            if (collection.migrationStrategies) {
                migrations[name] = collection.migrationStrategies as MigrationPathsForSchema<SchemaType>
            }
            return {
                schemas,
                migrations
            }
        }, { schemas: {}, migrations: {} } as CollectionsInternal)
    }

    constructor(
        private options: {
            dbName: string,
            storageType?: typeof BaseStorage | StorageType;
            password?: string;
        }
    ) {
        const { dbName } = this.options;
        const { schemas, migrations } = this.extractCollections();
        this._db = new RIDB<typeof schemas>({
            dbName,
            schemas,
            migrations: migrations as any
        });
    }

    private parseName(collectionName: keyof ExtractSchemas): keyof ExtractSchemas {
        const name = collectionName
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase();
        if (!this.collections[name]) {
            throw new Error(`Collection  does not exist`)
        }
        return name;
    }

    async query(table: string, query?: QueryType<any>): Promise<any[]> {
        const collectionName = this.parseName(table);
        const collection = this.collections[collectionName]!
        const ridbQuery = (query as any)?.selector || query || {}
        return collection.find(ridbQuery as any) as any
    }

    async insert<T extends SDK.Domain.Pluto.Storable>(table: string, model: T): Promise<void> {
        const collectionName = this.parseName(table);
        const collection = this.collections[collectionName]!
        await collection.create(model as any)
    }

    async update<T extends SDK.Domain.Pluto.Storable>(table: string, model: T): Promise<void> {
        const collectionName = this.parseName(table);
        const collection = this.collections[collectionName]!
        await collection.update(model as any)
    }

    async delete(table: string, uuid: string): Promise<void> {
        const collectionName = this.parseName(table);
        const collection = this.collections[collectionName]!
        await collection.delete(uuid)
    }

    get collections() {
        if (!this._db) {
            throw new Error("Start the ridb first")
        }
        return this._db.collections
    }

    async start() {
        await this._db.start(this.options)
    }

    async cleanup() {
        throw new Error("Not implemented")
    }

    async clear() {
        throw new Error("Not implemented")
    }
}