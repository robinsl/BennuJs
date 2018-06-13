import {CacheObjectVar} from "../types/cache-objet.var";
import {CacheObjetConfigVar} from "../types/cache-objet-config.var";
import {InvalidatorInterface} from "./invalidator.interface";

export interface CacheEngineInterface {
    get(key: string): Promise<string>;

    update(key: string, value: string): Promise<string>;

    set(key: string, value: string, ttl: number, grace: number): Promise<string>;

    clear(key: string): Promise<string>;
}