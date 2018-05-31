import {CacheEngineInterface} from "../interfaces/cache-engine.interface";
import {CacheObjectVar} from "../types/cache-objet.var";
import {CacheObjetConfigVar} from "../types/cache-objet-config.var";
import {InvalidatorInterface} from "../interfaces/invalidator.interface";

export class MemoryCacheEngine implements CacheEngineInterface {
    clear(key: string): Promise<CacheObjectVar> {
        return undefined;
    }

    fetch(key: string, extraKeyValue: StringMap<string>, ttl: number, grace: number, populatingFunction: (config: CacheObjetConfigVar) => Promise<string>, invalidators: InvalidatorInterface[]): Promise<CacheObjectVar> {
        return undefined;
    }

    get(key: string): Promise<CacheObjectVar> {
        return undefined;
    }

    set(key: string, value: string, extraKeyValue: StringMap<string>, ttl: number, grace: number, invalidators: InvalidatorInterface[]): Promise<CacheObjectVar> {
        return undefined;
    }

    update(key: string, value: string, extraKeyValue: StringMap<string>): Promise<CacheObjectVar> {
        return undefined;
    }

}