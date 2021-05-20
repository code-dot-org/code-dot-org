import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import ToggleAllTutorialsButton from '@cdo/apps/tutorialExplorer/toggleAllTutorialsButton';
import i18n from '@cdo/tutorialExplorer/locale';

const FAKE_SHOW_ALL = () => {};
const FAKE_HIDE_ALL = () => {};
const DEFAULT_PROPS = {
  showAllTutorials: FAKE_SHOW_ALL,
  hideAllTutorials: FAKE_HIDE_ALL
};

describe('ToggleAllTutorialsButton', () => {
  it('renders while showing all tutorials', () => {
    const wrapper = shallow(
      <ToggleAllTutorialsButton {...DEFAULT_PROPS} showingAllTutorials={true} />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <button type="button" onClick={FAKE_HIDE_ALL}>
          {i18n.hideAllTutorialsButton()}
          &nbsp;
          <i className="fa fa-caret-up" />
        </button>
      </div>
    );
  });

  it('renders while not showing all tutorials', () => {
    const wrapper = shallow(
      <ToggleAllTutorialsButton
        {...DEFAULT_PROPS}
        showingAllTutorials={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <button type="button" onClick={FAKE_SHOW_ALL}>
          {i18n.showAllTutorialsButton()}
          &nbsp;
          <i className="fa fa-caret-down" />
        </button>
      </div>
    );
  });
});
