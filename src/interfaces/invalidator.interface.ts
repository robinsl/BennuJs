import {CacheObjectVar} from "../types/cache-objet.var";

export interface InvalidatorInterface {
    invalidate(data: CacheObjectVar): boolean; // true reset data
}