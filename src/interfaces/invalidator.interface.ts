import {CacheObjetConfigVar} from "../types/cache-objet-config.var";

export interface InvalidatorInterface {
    invalidate(data: CacheObjetConfigVar): boolean;
}