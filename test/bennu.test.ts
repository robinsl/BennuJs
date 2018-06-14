import {Bennu} from "../src";
import {SinonSandbox, SinonStub} from "sinon";
import Sinon = require("sinon");
import {CacheEngineInterface} from "../src/interfaces/cache-engine.interface";
import {expect} from "chai";
import {InvalidatorInterface} from "../src/interfaces/invalidator.interface";
import {CacheObjectVar} from "../src/types/cache-objet.var";

describe('Bennu', () => {
    let sinon: SinonSandbox;
    let bennu: Bennu;
    let cacheEngine: CacheEngineInterface;
    let invalidators: InvalidatorInterface[];
    let cacheEngineGet: SinonStub, cacheEngineUpdate: SinonStub, cacheEngineSet: SinonStub, cacheEngineClear: SinonStub;
    let invalidatorFirst: SinonStub, invalidatorSecond: SinonStub, invalidatorThird: SinonStub;

    beforeEach(() => {
        sinon = Sinon.createSandbox();
        cacheEngineGet = sinon.stub();
        cacheEngineUpdate = sinon.stub();
        cacheEngineSet = sinon.stub();
        cacheEngineClear = sinon.stub();

        invalidatorFirst = sinon.stub();
        invalidatorSecond = sinon.stub();
        invalidatorThird = sinon.stub();

        invalidators = [
            {invalidate: invalidatorFirst},
            {invalidate: invalidatorSecond},
            {invalidate: invalidatorThird},
        ];

        cacheEngine = {
            get: cacheEngineGet,
            set: cacheEngineSet,
            clear: cacheEngineClear
        };

        bennu = new Bennu(cacheEngine);
    });

    afterEach(() => {
        sinon.reset();
    });

    describe('constructor', () => {
        it('expect to be able to set a cache engine at initialisation', () => {
            const bennu = new Bennu(cacheEngine);
            expect(bennu.cacheEngine).to.deep.equal(cacheEngine);
        });

        it('expect to be able to set an invalidator array at initialisation', () => {
            const bennu = new Bennu(undefined, invalidators);
            expect(bennu.invalidateFunctions).to.deep.equal(invalidators);
        });

        it('expect to be able to set the cache engine and the invalidator array at initialisation', () => {
            const bennu = new Bennu(cacheEngine, invalidators);
            expect(bennu.cacheEngine).to.deep.equal(cacheEngine);
            expect(bennu.invalidateFunctions).to.deep.equal(invalidators);
        });
    });

    describe('clear', () => {
        it('expect to clear the key in the cache engine and return true', async () => {
            const value: boolean = await bennu.clear('123');

            expect(cacheEngineClear.calledOnce).to.be.true;
            expect(value).to.be.true;
        });
    });

    describe('get', () => {
        it('expect to get the key in the cache engine and return the formatted object', async () => {
            cacheEngineGet.callsFake(() => '{"key":"123","ttl":3600,"grace":86400,"refreshing":false,"dateTtl":111111111111,"value":{"name":"bob","age":25}}');
            const value: CacheObjectVar = await bennu.get('123');

            expect(cacheEngineGet.calledOnce).to.be.true;
            expect(value).to.deep.equal({
                key: "123",
                ttl: 3600,
                grace: 86400,
                refreshing: false,
                dateTtl: 111111111111,
                value: {"name": "bob", "age": 25}
            });
        });
    });

    describe('set', () => {
        it('expect to get the key in the cache engine and return the formatted object', async () => {
            cacheEngineSet.callsFake(() => '{"key":"123","ttl":3600,"grace":86400,"refreshing":false,"dateTtl":111111111111,"value":{"name":"bob","age":25}}');
            const value: CacheObjectVar = await bennu.set('123', {name: "bob", age: 25}, 3600, 86400);

            expect(cacheEngineSet.calledOnce).to.be.true;
            expect(value).to.deep.equal({
                key: "123",
                ttl: 3600,
                grace: 86400,
                refreshing: false,
                dateTtl: 111111111111,
                value: {"name": "bob", "age": 25}
            });
        });
    });

    describe('fetch', () => {
        it('expect to populate the cache if there is no cache for the key', async () => {
            const stringObject: any = '{"key":"123","ttl":3600,"grace":86400,"refreshing":false,"dateTtl":111111111111,"value":{"name":"bob","age":25}}';
            const formatedObject = {
                key: "123",
                ttl: 3600,
                grace: 86400,
                refreshing: false,
                dateTtl: 111111111111,
                value: {"name": "bob", "age": 25}
            };

            cacheEngineGet.callsFake(() => undefined);
            cacheEngineSet.callsFake(() => stringObject);
            const populating = sinon.stub().callsFake(() => formatedObject);


            const value: CacheObjectVar = await bennu.fetch('123', 3600, 86400, populating);

            expect(cacheEngineGet.calledOnce).to.be.true;
            expect(cacheEngineSet.calledOnce).to.be.true;
            expect(populating.calledOnce).to.be.true;
            expect(value).to.deep.equal(formatedObject);
        });

        it('expect to populate the cache if the grace is over', async () => {
            const date = Date.now();
            const date_saved = date - (90100 * 1000);
            const oldStringObject: any = `{"key":"123","ttl":3600,"grace":86400,"refreshing":false,"dateTtl":${date_saved},"value":{"name":"bob","age":25}}`;
            const newStringObject: any = `{"key":"123","ttl":3600,"grace":86400,"refreshing":false,"dateTtl":${date},"value":{"name":"bob","age":25}}`;
            const formatedObject = {
                key: "123",
                ttl: 3600,
                grace: 86400,
                refreshing: false,
                dateTtl: date,
                value: {"name": "bob", "age": 25}
            };

            cacheEngineGet.callsFake(() => oldStringObject);
            cacheEngineSet.callsFake(() => newStringObject);
            const populating = sinon.stub().callsFake(() => formatedObject);

            const value: CacheObjectVar = await bennu.fetch('123', 3600, 86400, populating);

            expect(cacheEngineGet.calledOnce).to.be.true;
            expect(cacheEngineSet.calledOnce).to.be.true;
            expect(populating.calledOnce).to.be.true;
            expect(value).to.deep.equal(formatedObject);
        });

        it('expect to populate the cache if the grace is not over and not refresing', async () => {
            const date = Date.now();
            const date_saved = date - (3700 * 1000);
            const oldStringObject: any = `{"key":"123","ttl":3600,"grace":86400,"refreshing":false,"dateTtl":${date_saved},"value":{"name":"bob","age":25}}`;
            const refreshingStringObject: any = `{"key":"123","ttl":3600,"grace":86400,"refreshing":true,"dateTtl":${date},"value":{"name":"bob","age":25}}`;
            const newStringObject: any = `{"key":"123","ttl":3600,"grace":86400,"refreshing":false,"dateTtl":${date},"value":{"name":"bob","age":25}}`;
            const formatedObject = {
                key: "123",
                ttl: 3600,
                grace: 86400,
                refreshing: false,
                dateTtl: date,
                value: {"name": "bob", "age": 25}
            };

            cacheEngineGet.callsFake(() => oldStringObject);
            cacheEngineSet.onFirstCall().callsFake(() => refreshingStringObject);
            cacheEngineSet.onSecondCall().callsFake(() => newStringObject);
            const populating = sinon.stub().callsFake(() => formatedObject);

            const value: CacheObjectVar = await bennu.fetch('123', 3600, 86400, populating);

            expect(cacheEngineGet.calledOnce).to.be.true;
            expect(cacheEngineSet.calledTwice).to.be.true;
            expect(populating.calledOnce).to.be.true;
            expect(value).to.deep.equal(formatedObject);
        });

        it('expect to populate the cache if an invalidate function return true', async () => {
            const date = Date.now();
            const date_saved = date - (1000);
            const oldStringObject: any = `{"key":"123","ttl":3600,"grace":86400,"refreshing":false,"dateTtl":${date_saved},"value":{"name":"bob","age":25}}`;
            const refreshingStringObject: any = `{"key":"123","ttl":3600,"grace":86400,"refreshing":true,"dateTtl":${date},"value":{"name":"bob","age":25}}`;
            const newStringObject: any = `{"key":"123","ttl":3600,"grace":86400,"refreshing":false,"dateTtl":${date},"value":{"name":"bob","age":25}}`;
            const formatedObject = {
                key: "123",
                ttl: 3600,
                grace: 86400,
                refreshing: false,
                dateTtl: date,
                value: {"name": "bob", "age": 25}
            };

            cacheEngineGet.callsFake(() => oldStringObject);
            cacheEngineSet.onFirstCall().callsFake(() => refreshingStringObject);
            cacheEngineSet.onSecondCall().callsFake(() => newStringObject);
            const populating = sinon.stub().callsFake(() => formatedObject);

            const value: CacheObjectVar = await bennu.fetch('123', 3600, 86400, populating, [{
                invalidate: () => true
            }]);

            expect(cacheEngineGet.calledOnce).to.be.true;
            expect(cacheEngineSet.calledTwice).to.be.true;
            expect(populating.calledOnce).to.be.true;
            expect(value).to.deep.equal(formatedObject);
        });

        it('expect to not populate the cache if athere is no invalidation or the ttl is not expired', async () => {
            const date = Date.now();
            const date_saved = date - (1000);
            const oldStringObject: any = `{"key":"123","ttl":3600,"grace":86400,"refreshing":false,"dateTtl":${date_saved},"value":{"name":"bob","age":25}}`;
            const formatedObject = {
                key: "123",
                ttl: 3600,
                grace: 86400,
                refreshing: false,
                dateTtl: date_saved,
                value: {"name": "bob", "age": 25}
            };

            cacheEngineGet.callsFake(() => oldStringObject);
            const populating = sinon.stub().callsFake(() => formatedObject);

            const value: CacheObjectVar = await bennu.fetch('123', 3600, 86400, populating);

            expect(cacheEngineGet.calledOnce).to.be.true;
            expect(value).to.deep.equal(formatedObject);
        });
    });
});