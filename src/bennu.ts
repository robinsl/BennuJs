import {InvalidatorInterface} from "./interfaces/invalidator.interface";
import {CacheEngineInterface} from "./interfaces/cache-engine.interface";
import {CacheObjectVar} from "./types/cache-objet.var";
import {CacheObjetConfigVar} from "./types/cache-objet-config.var";

export class Bennu {
    private _invalidators: InvalidatorInterface[];
    private _cacheEngines: CacheEngineInterface;

    constructor(invalidators: InvalidatorInterface[], cacheEngines: CacheEngineInterface) {
        this._invalidators = invalidators;
        this._cacheEngines = cacheEngines;
    }

    set invalidators(value: InvalidatorInterface[]) {
        this._invalidators = value;
    }

    set cacheEngines(value: CacheEngineInterface) {
        this._cacheEngines = value;
    }

    private formatToString(config: CacheObjetConfigVar, value: StringMap<any>): string {
        return JSON.stringify({
            dateTtl: Date.now(),
            refreshing: false,
            value,
            ...config,
        })
    }

    private formatToObjet(cacheValue: string): CacheObjectVar {
        return JSON.parse(cacheValue) as CacheObjectVar;
    }

    private isDead(cacheObject: CacheObjectVar): boolean {
        return Date.now() < (cacheObject.dateTtl + cacheObject.ttl * 1000);
    }

    private isGraceOver(cacheObject: CacheObjectVar): boolean {
        return Date.now() < (cacheObject.dateTtl + (cacheObject.ttl + cacheObject.grace) * 1000);
    }

    private isRefreshing(cacheObject: CacheObjectVar): boolean {
        return cacheObject.refreshing;
    }

    private applyInvalidators(cacheObject: CacheObjectVar, invalidators: InvalidatorInterface[]): boolean {
        for (const invalidator of invalidators) {
            const isInvalid = invalidator.invalidate(cacheObject);
            if (isInvalid) return true;
        }

        return false;
    }

    private async setToIsFetching(cacheObject: CacheObjectVar) {
        return await this._cacheEngines.set(cacheObject.key, this.formatToString({
            key: cacheObject.key,
            ttl: cacheObject.ttl,
            grace: cacheObject.grace,
            extraKey: cacheObject.extraKey,
            refreshing: true
        }, cacheObject), cacheObject.ttl, cacheObject.grace)
    }

    async fetch(key: string, extraKey: StringMap<string>, ttl: number, grace: number, populatingFunction: (config: CacheObjetConfigVar) => Promise<StringMap<any>>, invalidators: InvalidatorInterface[]): Promise<CacheObjectVar> {
        let data = await this.get(key);

        if (!data) {
            let result = await populatingFunction({key, ttl, grace, extraKey});
            let dataStr = this.formatToString({key, ttl, grace, extraKey}, result);
            return await this.set(key, dataStr, ttl, grace);
        }

        const isAllDead = this.isDead(data) && this.isGraceOver(data);
        const isOnGraceNotRefresing = this.isDead(data) && !this.isGraceOver(data) && !this.isRefreshing(data);
        const isInvalid = this.applyInvalidators(data, invalidators) && !this.isRefreshing(data) ;

        if (isAllDead) {
            let result = await populatingFunction({key, ttl, grace, extraKey});
            let dataStr = this.formatToString({key, ttl, grace, extraKey}, result);
            return await this.set(key, dataStr, ttl, grace);
        } else if (isOnGraceNotRefresing || isInvalid) {
            await this.setToIsFetching(data);
            let result = await populatingFunction({key, ttl, grace, extraKey});
            let dataStr = this.formatToString({key, ttl, grace, extraKey}, result);
            return await this.set(key, dataStr, ttl, grace);
        }

        return data;
    }

    async clear(key: string): Promise<boolean> {
        await this._cacheEngines.clear(key);
        return true;
    }

    async get(key: string): Promise<CacheObjectVar> {
        const data = await this._cacheEngines.get(key);
        return this.formatToObjet(data);
    }

    async set(key: string, value: string, ttl: number, grace: number): Promise<CacheObjectVar> {
        const data = await this._cacheEngines.set(key, value, ttl, grace);
        return this.formatToObjet(data);
    }

    async update(key: string, value: StringMap<any>): Promise<CacheObjectVar> {
        const data = await this.get(key);
        data.value = value;
        const dataString = await this._cacheEngines.update(key, this.formatToString({
            key: key,
            ttl: data.ttl,
            grace: data.grace,
            extraKey: data.extraKey
        }, value));
        return this.formatToObjet(dataString);
    }
}