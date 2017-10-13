import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import ToggleAllTutorialsButton from '@cdo/apps/tutorialExplorer/toggleAllTutorialsButton';

const FAKE_SHOW_ALL = () => {};
const FAKE_HIDE_ALL = () => {};
const DEFAULT_PROPS = {
  showAllTutorials: FAKE_SHOW_ALL,
  hideAllTutorials: FAKE_HIDE_ALL
};

describe('ToggleAllTutorialsButton', () => {
  it('renders while showing all tutorials', () => {
    const wrapper = shallow(
      <ToggleAllTutorialsButton
        {...DEFAULT_PROPS}
        showingAllTutorials={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <button onClick={FAKE_HIDE_ALL}>
          {'Hide activities for many languages'}
          &nbsp;
          <i className="fa fa-caret-up"/>
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
        <button onClick={FAKE_SHOW_ALL}>
          {'Show activities for many languages'}
          &nbsp;
          <i className="fa fa-caret-down"/>
        </button>
      </div>
    );
  });
});
