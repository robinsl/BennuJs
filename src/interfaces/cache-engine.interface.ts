export interface CacheEngineInterface {
    get(key: string): Promise<string>;

    set(key: string, value: string, ttl: number, grace: number): Promise<string>;

    clear(key: string): Promise<string>;
}