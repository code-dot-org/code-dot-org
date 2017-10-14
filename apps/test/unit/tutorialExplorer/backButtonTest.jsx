import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import BackButton from '@cdo/apps/tutorialExplorer/backButton';
import i18n from '@cdo/tutorialExplorer/locale';

describe('BackButton', () => {
  it('renders like this', () => {
    const wrapper = shallow(<BackButton/>);
    expect(wrapper).to.containMatchingElement(
      <a href="/learn">
        <button>
          <i className="fa fa-arrow-left"/>
          &nbsp;
          {i18n.backButtonBack()}
        </button>
      </a>
    );
  });
});
