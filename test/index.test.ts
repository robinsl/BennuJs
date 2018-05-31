import {expect} from 'chai'
import {BennuClass} from "../src/bennu";

describe('test', () => {
    it('should set the right message', () => {
        const bennu: BennuClass = new BennuClass('Hello World');
        expect(bennu.message).to.equal('Hello World');
    })
});