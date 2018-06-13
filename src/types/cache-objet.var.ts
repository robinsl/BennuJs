import {CacheObjetConfigVar} from "./cache-objet-config.var";

export class CacheObjectVar extends CacheObjetConfigVar {
    dateTtl: number;
    refreshing: boolean;
    value: StringMap<any>;
}