import {InvalidatorInterface} from "./interfaces/invalidator.interface";
import {CacheEngineInterface} from "./interfaces/cache-engine.interface";
import {CacheObjectVar} from "./types/cache-objet.var";

export class Bennu implements CacheEngineInterface{
    private defaultInvalidators: InvalidatorInterface[] = [];
    private _invalidators: InvalidatorInterface[];
    private _cacheEngines: CacheEngineInterface;

    constructor(invalidators: InvalidatorInterface[], cacheEngines: CacheEngineInterface) {
        this._invalidators = invalidators;
        this._cacheEngines = cacheEngines;
    }

    set invalidators(value: InvalidatorInterface[]) {
        this._invalidators = value;
    }

    set cacheEngines(value: CacheEngineInterface) {
        this._cacheEngines = value;
    }

    async clear(key: string): Promise<CacheObjectVar> {
        return await undefined;
    }

    async fetch(key: string, extraKeyValue: StringMap<string>, ttl: number, grace: number, populatingFunction: Function, invalidators: InvalidatorInterface[]): Promise<CacheObjectVar> {
        return undefined;
    }

    async get(key: string): Promise<CacheObjectVar> {
        return undefined;
    }

    async set(key: string, value: string, extraKeyValue: StringMap<string>, ttl: number, grace: number, invalidators: InvalidatorInterface[]): Promise<CacheObjectVar> {
        return undefined;
    }

    async update(key: string, value: string, extraKeyValue: StringMap<string>): Promise<CacheObjectVar> {
        return undefined;
    }


}