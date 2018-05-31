import {CacheObjectVar} from "../types/cache-objet.var";
import {CacheObjetConfigVar} from "../types/cache-objet-config.var";
import {InvalidatorInterface} from "./invalidator.interface";

export interface CacheEngineInterface {
    get(key: string): Promise<CacheObjectVar>;

    update(key: string, value: string, extraKeyValue: StringMap<string>): Promise<CacheObjectVar>;

    set(key: string, value: string, extraKeyValue: StringMap<string>, ttl: number, grace: number, invalidators: InvalidatorInterface[]): Promise<CacheObjectVar>;

    fetch(key: string, extraKeyValue: StringMap<string>, ttl: number, grace: number, populatingFunction: (config: CacheObjetConfigVar) => Promise<string>, invalidators: InvalidatorInterface[]): Promise<CacheObjectVar>;

    clear(key: string): Promise<CacheObjectVar>;
}