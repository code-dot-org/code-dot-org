import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import RoboticsButton from '@cdo/apps/tutorialExplorer/roboticsButton';
import i18n from '@cdo/tutorialExplorer/locale';

describe('RoboticsButton', () => {
  it('renders with given url', () => {
    const wrapper = shallow(<RoboticsButton url="/i/robot" />);
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>
            <a href="/i/robot">
              <div>
                <img src="/images/learn/robotics-link.png" />
                <div>
                  {i18n.roboticsButtonText()}
                  &nbsp;
                  <i className="fa fa-arrow-right" />
                </div>
              </div>
            </a>
          </div>
        </div>
        <div>
          <a href="/i/robot">{i18n.roboticsText()}</a>
        </div>
      </div>
    );
  });
});
