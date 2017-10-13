import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import RoboticsButton from '@cdo/apps/tutorialExplorer/roboticsButton';

describe('RoboticsButton', () => {
  it('renders with given url', () => {
    const wrapper = shallow(
      <RoboticsButton url="/i/robot"/>
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>
            <a href="/i/robot">
              <div>
                <img src="/images/learn/robotics-link.png"/>
                <div>
                  {'View robotics activities'}
                  &nbsp;
                  <i className="fa fa-arrow-right"/>
                </div>
              </div>
            </a>
          </div>
        </div>
        <div>
          <a href="/i/robot">
            Got robots? Use these activities and make a tangible Hour of Code for students of any age!
          </a>
        </div>
      </div>
    );
  });
});
