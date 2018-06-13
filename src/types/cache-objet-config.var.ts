export class CacheObjetConfigVar {
    key: string;
    ttl: number;
    grace: number;
    extraKey: StringMap<string>;
    refreshing?: boolean;
}