import {InvalidatorInterface} from "../interfaces/invalidator.interface";
import {CacheObjetConfigVar} from "../types/cache-objet-config.var";

export class ForceRefreshInvalidator implements InvalidatorInterface {
    invalidate(data: CacheObjetConfigVar): boolean {
        return !!data.extraKey.forceRefresh;
    }
}