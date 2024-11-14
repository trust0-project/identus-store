import { BaseStorage, QueryType, SchemaType, StorageType } from '@trust0/ridb';
import SDK from '@hyperledger/identus-edge-agent-sdk';
export declare class RIDBStore implements SDK.Pluto.Store {
    private options;
    private _db;
    private extractCollections;
    constructor(options: {
        dbName: string;
        storageType?: typeof BaseStorage | StorageType;
        password?: string;
    });
    private parseName;
    query(table: string, query?: QueryType<any>): Promise<any[]>;
    insert<T extends SDK.Domain.Pluto.Storable>(table: string, model: T): Promise<void>;
    update<T extends SDK.Domain.Pluto.Storable>(table: string, model: T): Promise<void>;
    delete(table: string, uuid: string): Promise<void>;
    get collections(): {
        [x: string]: import("@trust0/ridb").Collection<import("@trust0/ridb").Schema<SchemaType>>;
    };
    start(): Promise<void>;
    cleanup(): Promise<void>;
    clear(): Promise<void>;
}
