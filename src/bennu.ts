import {InvalidatorInterface} from "./interfaces/invalidator.interface";
import {CacheEngineInterface} from "./interfaces/cache-engine.interface";
import {CacheObjectVar} from "./types/cache-objet.var";
import {CacheObjetConfigVar} from "./types/cache-objet-config.var";
import {MemoryCacheEngine} from "./cache-engines/memory.cache-engine";

export class Bennu {
    get cacheEngine(): CacheEngineInterface {
        return this._cacheEngine;
    }

    get invalidateFunctions(): InvalidatorInterface[] {
        return this._invalidateFunctions;
    }

    private _cacheEngine: CacheEngineInterface;
    private _invalidateFunctions: InvalidatorInterface[];

    set invalidateFunctions(value: InvalidatorInterface[]) {
        this._invalidateFunctions = value;
    }

    set cacheEngine(value: CacheEngineInterface) {
        this._cacheEngine = value;
    }

    constructor(cacheEngine?: CacheEngineInterface, invalidateFunctions?: InvalidatorInterface[]) {
        this.cacheEngine = cacheEngine || new MemoryCacheEngine();
        this.invalidateFunctions = invalidateFunctions || [];
    }

    private formatToNewCacheString(config: CacheObjetConfigVar, value: StringMap<any>): string {
        return JSON.stringify({
            dateTtl: Date.now(),
            refreshing: false,
            value,
            ...config,
        })
    }

    private formatToObjet(cacheValue: string): CacheObjectVar {
        return cacheValue ? JSON.parse(cacheValue) as CacheObjectVar : undefined;
    }

    private isDead(cacheObject: CacheObjectVar): boolean {
        return Date.now() > (cacheObject.dateTtl + cacheObject.ttl * 1000);
    }

    private isGraceOver(cacheObject: CacheObjectVar): boolean {
        return Date.now() > (cacheObject.dateTtl + (cacheObject.ttl + cacheObject.grace) * 1000);
    }

    private isRefreshing(cacheObject: CacheObjectVar): boolean {
        return cacheObject.refreshing;
    }

    private applyInvalidators(cacheObject: CacheObjectVar, invalidateFunctions: InvalidatorInterface[]): boolean {
        invalidateFunctions = [
            ...this.invalidateFunctions,
            ...invalidateFunctions
        ];

        for (const invalidateFunction of invalidateFunctions) {
            const isInvalid = invalidateFunction.invalidate(cacheObject);
            if (isInvalid) return true;
        }

        return false;
    }

    private async setToIsFetching(cacheObject: CacheObjectVar) {
        return await this.cacheEngine.set(cacheObject.key, this.formatToNewCacheString({
            key: cacheObject.key,
            ttl: cacheObject.ttl,
            grace: cacheObject.grace,
            refreshing: true
        }, cacheObject), cacheObject.ttl, cacheObject.grace)
    }

    async clear(key: string): Promise<boolean> {
        await this.cacheEngine.clear(key);
        return true;
    }

    async get(key: string): Promise<CacheObjectVar> {
        const data = await this.cacheEngine.get(key);
        return this.formatToObjet(data);
    }

    async set(key: string, value: StringMap<any>, ttl: number, grace: number): Promise<CacheObjectVar> {
        const data = await this.cacheEngine.set(key, this.formatToNewCacheString({
            key: key,
            ttl: ttl,
            grace: grace
        }, value), ttl, grace);
        return this.formatToObjet(data);
    }

    async fetch(key: string, ttl: number, grace: number, populatingFunction: (config: CacheObjetConfigVar) => Promise<StringMap<any>>, invalidators: InvalidatorInterface[] = []): Promise<CacheObjectVar> {
        let data = await this.get(key);

        if (!data) {
            let result = await populatingFunction({key, ttl, grace});
            return await this.set(key, result, ttl, grace);
        }

        const isAllDead = this.isDead(data) && this.isGraceOver(data) && !this.isRefreshing(data);
        const isOnGraceNotRefreshing = this.isDead(data) && !this.isGraceOver(data) && !this.isRefreshing(data);
        const isInvalid = this.applyInvalidators(data, invalidators) && !this.isRefreshing(data);

        if (isAllDead) {
            let result = await populatingFunction({key, ttl, grace});
            return await this.set(key, result, ttl, grace);
        } else if (isOnGraceNotRefreshing || isInvalid) {
            const promises: Promise<any>[] = [
                populatingFunction({key, ttl, grace}),
                this.setToIsFetching(data)
            ];
            const [result] = await Promise.all(promises);
            return await this.set(key, result, ttl, grace);
        }

        return data;
    }
}