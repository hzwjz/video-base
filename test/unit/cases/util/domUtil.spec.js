/**
 * domUtil test
 */
import domUtil from 'src/util/domUtil';
import {expect} from 'chai';

describe('domUtil', () => {
    // beforeEach(() => {

    // })

    describe('addClassName()', () => { 
        it('add classname', () => {
            let ele = document.createElement('div');
            domUtil.addClassName(ele, 'classA');

            expect(ele.className).to.equals('classA');
        });

        it('add another classname', () => {
            let ele = document.createElement('div');
            ele.className = 'classA';
            domUtil.addClassName(ele, 'classB');

            expect(ele.className).to.equals('classA classB');
        });
    });

    describe('delClassName()', () => { 
        it('delete classname', () => {
            let ele = document.createElement('div');
            ele.className = 'classA';
            domUtil.delClassName(ele, 'classA');

            expect(ele.className).to.equals('');
        });

        it('delete another classname', () => {
            let ele = document.createElement('div');
            ele.className = 'classA';
            domUtil.delClassName(ele, 'classB');

            expect(ele.className).to.equals('classA');
        });

        it('delete one classname', () => {
            let ele = document.createElement('div');
            ele.className = 'classA classB';
            domUtil.delClassName(ele, 'classB');

            expect(ele.className).to.equals('classA');
        });
    });

    describe('loadScript()', () => { 
        it('test load flvjs', (done) => {
            domUtil.loadScript('//edu-cms.nosdn.127.net/topics/js/flv.min_ac66b3439c4eb065c80223543aba7a9d.js', (err) => {
                if(!err && flvjs !== undefined){
                    done();
                }else{
                    done(err);
                }
            });
        });

        it('test load fail', (done) => {
            domUtil.loadScript('//edu-cms.nosdn.127.net/topics/js/flv.min.js', (err) => {
                if(!!err){
                    done();
                }else{
                    done(new Error('no error emit'));
                }
            });
        });
    });

});