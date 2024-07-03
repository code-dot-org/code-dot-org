import {DCDO} from '@cdo/apps/dcdo';



describe('DCDO.constructor', () => {
  it('still works given no config', () => {
    let dcdo = new DCDO();
    expect(dcdo.get('unknownKey', 'defaultValue')).to.equal('defaultValue');
  });
});

describe('DCDO.get', () => {
  it('returns default value given unknown key', () => {
    let dcdo = new DCDO({});
    expect(dcdo.get('unknownKey', 'defaultValue')).to.equal('defaultValue');
  });

  it('returns value given known key', () => {
    let dcdo = new DCDO({testKey: 'testValue'});
    expect(dcdo.get('testKey', 'defaultValue')).to.equal('testValue');
  });
});
