import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import Tutorial from '@cdo/apps/tutorialExplorer/tutorial';
import Image from '@cdo/apps/tutorialExplorer/image';
import LazyLoad from 'react-lazy-load';
import sinon from 'sinon';

const CALLBACK = () => {};
const FAKE_TUTORIAL = {
  name: 'How to train your dragon',
  image: '/images/httyd.png',
  tags_length: '001',
  tags_subject: '002',
  tags_student_experience: '004',
  tags_activity_type: '005',
  tags_international_languages: '006',
  tags_grade: '007',
  tags_programming_language: '008',
  string_detail_grades: 'Ages 8 and up.',
  string_detail_programming_languages: 'FORTRAN',
  string_detail_platforms: 'iOS'
};

describe('Tutorial', () => {
  it('renders with tutorial details', () => {
    const wrapper = shallow(
      <Tutorial item={FAKE_TUTORIAL} tutorialClicked={CALLBACK} />
    );
    const imageSrc = wrapper
      .find(Image)
      .first()
      .props().src;
    const titleText = wrapper.findWhere(
      element => element.text() === 'How to train your dragon'
    );
    const descriptionText = wrapper.findWhere(
      element => element.text() === 'Ages 8 and up. | FORTRAN | iOS'
    );
    expect(wrapper.find(LazyLoad)).to.have.lengthOf(1);
    expect(imageSrc).to.equal('/images/fill-480x360/httyd.jpg');
    expect(titleText).to.exist;
    expect(descriptionText).to.exist;
  });

  it('[accessibility] can be selected via keyboard', () => {
    var clickedSpy = sinon.spy();
    const wrapper = shallow(
      <Tutorial item={FAKE_TUTORIAL} tutorialClicked={clickedSpy} />
    );
    wrapper
      .instance()
      .keyboardSelectTutorial({keyCode: 32, preventDefault: () => {}});
    wrapper
      .instance()
      .keyboardSelectTutorial({keyCode: 13, preventDefault: () => {}});
    expect(clickedSpy).to.have.been.calledTwice;
  });
});
