import {
    RIDB,
    StorageType
} from '@trust0/ridb';

import SDK from '@hyperledger/identus-edge-agent-sdk';
import { SchemaType, MigrationPathsForSchemas, MigrationPathsForSchema, BaseStorage, QueryType, SchemaTypeRecord } from '@trust0/ridb-core';

type RT = ReturnType<typeof SDK.makeCollections>;

type ExtractSchemas = {
    [key in keyof RT]: SchemaType
};

type CollectionsInternal = { 
    schemas: ExtractSchemas, 
    migrations: MigrationPathsForSchemas<ExtractSchemas> 
}





type DatabaseState = 'disconnected' | 'loading' | 'loaded' | 'error';




export const createStore = <T extends SchemaTypeRecord>(
  options: {
    db: RIDB<T>,
    password?: string,
    storageType: typeof BaseStorage | StorageType
  }
): SDK.Pluto.Store => {
    const { db, password, storageType } = options;
    let state: DatabaseState = 'disconnected';

    const parseName = (collectionName: keyof T): keyof T => {
        const name = 
            String(collectionName)
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase() as keyof T;

        if (!db.collections[name]) {
            throw new Error(`Collection ${String(name)} does not exist`)
        }
        return name as keyof T;
    }
    
    return {
        async query(table: string, query?: QueryType<any>): Promise<any[]> {
            const collectionName = parseName(table);
            const collection = db.collections[collectionName]!;
            const ridbQuery = (query as any)?.selector || query || {}
            return collection.find(ridbQuery as any) as any
        },
        async insert(table: string, model: SDK.Domain.Pluto.Storable): Promise<void> {
            const collectionName = parseName(table);
            const collection = db.collections[collectionName]!
            await collection.create(model as any)
        },
        async update(table: string, model: SDK.Domain.Pluto.Storable): Promise<void> {
            const collectionName = parseName(table);
            const collection = db.collections[collectionName]!
            await collection.update(model as any)
        },
        async delete(table: string, uuid: string): Promise<void> {
            const collectionName = parseName(table);
            const collection = db.collections[collectionName]!
            await collection.delete(uuid)
        },
        async start() {
            state = 'loading';
            await db.start({ storageType, password  })
            state = 'loaded';
        },
        async stop() {
            await db.close()
            state = 'disconnected';
        }
    }
}



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
            migrations
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

}