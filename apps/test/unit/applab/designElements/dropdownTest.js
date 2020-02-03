import {expect} from '../../../util/deprecatedChai';
import dropdown from '@cdo/apps/applab/designElements/dropdown';
import library from '@cdo/apps/applab/designElements/library';

function setIndex(e, newIndex) {
  dropdown.onPropertyChange(e, 'index', newIndex);
}

function getIndex(e) {
  return dropdown.readProperty(e, 'index');
}

function getValue(e) {
  return dropdown.readProperty(e, 'value');
}

describe('Applab designElements/dropdown component', function() {
  let e;

  beforeEach(() => {
    e = library.createElement(
      library.ElementType.DROPDOWN,
      50 /* left */,
      40 /* top */,
      true /* withoutId */
    );
  });

  it('setting index changes value', () => {
    expect(getValue(e)).is.equal('Option 1');
    setIndex(e, 1);
    expect(getValue(e)).is.equal('Option 2');
  });

  it('setting index out of range sets index to -1', () => {
    setIndex(e, 2);
    expect(getIndex(e)).is.equal(-1);
    expect(getValue(e)).is.empty;
  });
});
