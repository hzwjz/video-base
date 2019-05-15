/**
 * fullscreenHelper test
 */
import fullscreenHelper from 'src/util/fullscreenHelper';
import {expect} from 'chai';

describe('fullscreenHelper', () => {
    // beforeEach(() => {

    // })

    describe('instance', () => {
        it('new instance ok', () => {
            expect(new fullscreenHelper(c => {})).to.be.ok;
        });
    });

    describe('getfullScreenState()', () => {
        it('return false default', () => {
            expect(new fullscreenHelper((c) => {}).getfullScreenState()).to.be.false;
        });
    });

    describe('addStyle()', () => {
        it('add style tag to the head tag success', () => {
            let h = new fullscreenHelper((c) => {});
            let styleTags = document.querySelectorAll('head style');

            expect(styleTags.length >= 1).to.be.true;

            let styleText = styleTags[styleTags.length - 1].textContent;
            expect(styleText).to.match(/^\.videoplayer-/);
        });
    });

});