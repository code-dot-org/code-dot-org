import React from 'react';
import {mount} from 'enzyme';
import CsPrinciplesAndDiscoveriesSection from '@cdo/apps/code-studio/pd/professional_learning_landing/csPrinciplesAndDiscoveriesSection';
import {expect} from 'chai';

describe("CS Principles and Discoveries Section", () => {
  const generateSection = (sectionProps = []) => {
    return mount(
      <CsPrinciplesAndDiscoveriesSection
        {...sectionProps}
      />
    );
  };

  it("should show a survey for a user that needs to take a survey", () => {
    const section = generateSection({coursesTaught: ['CS Principles'], lastWorkshopSurveyUrl: 'url'});
    expect(section.find('TwoPartBanner').prop('imagePosition')).to.equal('imageLeft');
    expect(section.find('#cspStartSurvey')).to.have.length(1);
    expect(section.find('#cspThanks')).to.have.length(0);
  });

  it("should show a thanks div for a user that has completed the course and has no pending survey", () => {
    const section = generateSection({coursesCompleted: ['CS Principles']});
    expect(section.find('TwoPartBanner').prop('imagePosition')).to.equal('imageLeft');
    expect(section.find('#cspStartSurvey')).to.have.length(0);
    expect(section.find('#cspThanks')).to.have.length(1);
  });
});
