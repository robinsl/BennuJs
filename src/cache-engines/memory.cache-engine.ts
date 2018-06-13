import {CacheEngineInterface} from "../interfaces/cache-engine.interface";
import {CacheObjectVar} from "../types/cache-objet.var";
import {CacheObjetConfigVar} from "../types/cache-objet-config.var";
import {InvalidatorInterface} from "../interfaces/invalidator.interface";

export class MemoryCacheEngine implements CacheEngineInterface {
    async clear(key: string): Promise<string> {
        return undefined;
    }

    async get(key: string): Promise<string> {
        return undefined;
    }

    async set(key: string, value: string): Promise<string> {
        return undefined;
    }

    async update(key: string, value: string): Promise<string> {
        return undefined;
    }

}