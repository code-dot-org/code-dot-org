import getScriptData from '@cdo/apps/util/getScriptData';
import {expect} from '../../util/deprecatedChai';

describe('the getScriptData function', () => {
  beforeEach(() => {
    const someDiv = document.createElement('div');
    document.body.appendChild(someDiv);
    someDiv.innerHTML = `
<script data-foo="1"></script>
<script data-bar='{"userId": "neato"}'></script>
<script data-malformed='{malformed}'></script>
    `;
  });
  it('extracts data from a script tag', () => {
    expect(getScriptData('foo')).to.equal(1);
    expect(getScriptData('bar')).to.deep.equal({userId: 'neato'});
  });

  it('is case-insensitive', () => {
    expect(getScriptData('FOO')).to.equal(1);
  });

  it('throws an error if the script tag does not exist', () => {
    expect(() => getScriptData('does-not-exist')).to.throw;
  });

  it('throws an error if the json is malformed', () => {
    expect(() => getScriptData('malformed')).to.throw;
  });
});
