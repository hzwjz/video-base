/**
 * formatUtil test case
 */
import formatUtil from 'src/util/formatUtil';
import {expect} from 'chai';

describe('formatUtil', () => {
    // beforeEach(() => {

    // })

    describe('formatVideoTime()', () => {
        it('return 00:00 width 0', () => {
            expect(formatUtil.formatVideoTime(0)).to.be.equals('00:00');
        });

        it('return 01:40 width 100', () => {
            expect(formatUtil.formatVideoTime(100)).to.be.equals('01:40');
        });
    });

});