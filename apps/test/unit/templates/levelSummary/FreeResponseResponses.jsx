import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import FreeResponseResponses from '@cdo/apps/templates/levelSummary/FreeResponseResponses';
import styles from '@cdo/apps/templates/levelSummary/summary.module.scss';

describe('FreeResponseResponses', () => {
  it('renders responses', () => {
    const responses = [
      {user_id: 0, text: 'student response 1'},
      {user_id: 1, text: 'student response 2'},
      {user_id: 3, text: 'student response 3'},
      {user_id: 2, text: 'student response 4'},
      {user_id: 9, text: 'student response 5'},
    ];
    const wrapper = shallow(<FreeResponseResponses responses={responses} />);

    expect(wrapper.find(`.${styles.studentAnswer}`).length).to.eq(
      responses.length
    );
    expect(wrapper.find(`.${styles.studentAnswer}`).at(0).text()).to.eq(
      'student response 1'
    );
  });
});
