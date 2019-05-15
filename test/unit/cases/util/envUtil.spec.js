/**
 * envUtil test
 */
import envUtil from 'src/util/envUtil';
import {expect} from 'chai';

describe('envUtil', () => {
    // beforeEach(() => {

    // })

    describe('isMobileAll()', () => { 
        it('return false in pc Chrome', () => {
            expect(envUtil.isMobileAll()).to.be.false;
        });
    });

    describe('isWeixin()', () => {
        it('return false in pc Chrome', () => {
            expect(envUtil.isWeixin()).to.be.false;
        });
    });

    describe('isAndroid()', () => {
        it('return false in pc Chrome', () => {
            expect(envUtil.isAndroid()).to.be.false;
        });
    });

});