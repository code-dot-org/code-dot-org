import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import HeaderFinish from '@cdo/apps/code-studio/components/header/HeaderFinish';

const LESSON = {finishLink: '/finish', finishText: 'Finish'};

describe('HeaderFinish', () => {
  it('ellipsizes in flow when the header gives it no width', () => {
    const wrapper = shallow(<HeaderFinish lessonData={LESSON} />);
    expect(wrapper.find('a').prop('style')).toMatchObject({
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    });
    expect(wrapper.find('.header_finished').prop('style')).toBeUndefined();
  });

  it('is laid out from outside when the header gives it a width', () => {
    const wrapper = shallow(<HeaderFinish lessonData={LESSON} width={100} />);
    expect(wrapper.find('.header_finished').prop('style')).toMatchObject({
      position: 'absolute',
    });
  });
});
