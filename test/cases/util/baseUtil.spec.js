/**
 * baseUtil test case
 */
import baseUtil from 'src/util/baseUtil';
import {expect} from 'chai';

describe('baseUtil', () => {
    // beforeEach(() => {

    // })

    describe('isFunction()', () => {
        it('return true width func arg', () => {
            expect(baseUtil.isFunction(function(){})).to.be.true;
        });

        it('return false width other arg', () => {
            expect(baseUtil.isFunction(1)).to.be.false;
        });
    });

    describe('isNumber()', () => {
        it('return false width number arg', () => {
            expect(baseUtil.isNumber('xxx')).to.be.false;
        });

        it('return true width other arg', () => {
            expect(baseUtil.isNumber(1)).to.be.true;
        });
    });

    describe('makeArray()', () => {
        it('return array width array arg', () => {
            expect(baseUtil.makeArray([])).to.be.an('array');
        });

        it('return array width nodelist arg', () => {
            let div = document.createElement('div');
            div.innerHTML = '<span></span><span></span>';
            expect(baseUtil.makeArray(div.getElementsByTagName('span'))).to.be.an('array');
        });
    });
});