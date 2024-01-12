import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import ProgressTableHeader from '@cdo/apps/templates/sectionProgressV2/ProgressTableHeader';
import styles from '@cdo/apps/templates/sectionProgressV2/progress-table-v2.module.scss';

describe('ProgressTableHeader', () => {
  it('shows all lessons', () => {
    const wrapper = shallow(
      <ProgressTableHeader
        lessons={[
          {id: 1, relative_position: 5},
          {id: 2, relative_position: 6},
          {id: 3, relative_position: 7},
        ]}
      />
    );
    expect(wrapper.find(`.${styles.gridBox}`)).to.have.length(3);
    expect(wrapper.find(`.${styles.gridBox}`).at(0).text()).to.equal('5');
  });

  it('shows nothing if there are no lessons', () => {
    const wrapper = shallow(<ProgressTableHeader lessons={[]} />);
    expect(wrapper.find(`.${styles.gridBox}`)).to.have.length(0);
  });
});
