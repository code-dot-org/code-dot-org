import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import Tutorial from '@cdo/apps/tutorialExplorer/tutorial';
import Image from '@cdo/apps/tutorialExplorer/image';
import LazyLoad from 'react-lazy-load';

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
  string_detail_platforms: 'iOS',
};

describe('Tutorial', () => {
  it('renders with tutorial details', () => {
    const wrapper = shallow(
      <Tutorial
        item={FAKE_TUTORIAL}
        tutorialClicked={CALLBACK}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div onClick={CALLBACK}>
        <div>
          <div/>
          <LazyLoad offset={1000}>
            <Image
              src="/images/fill-480x360/httyd.jpg"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%"
              }}
            />
          </LazyLoad>
        </div>
        <div>How to train your dragon</div>
        <div>Ages 8 and up. | FORTRAN | iOS</div>
      </div>
    );
  });
});
