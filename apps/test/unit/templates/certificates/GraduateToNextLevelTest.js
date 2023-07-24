import GraduateToNextLevel from '@cdo/apps/templates/certificates/GraduateToNextLevel';
import React from 'react';
import {isolateComponent} from 'isolate-react';
import {expect} from '../../../util/reconfiguredChai';

const propsPassedToVerticalImageResourceCard = props =>
  isolateComponent(<GraduateToNextLevel {...props} />).findOne(
    'VerticalImageResourceCard'
  ).props;

describe('GraduateToNextLevel', () => {
  it('passes App Lab course info to ResourceCard by default', () => {
    const propsPassed = propsPassedToVerticalImageResourceCard();
    const {id, title, description, link, image} = propsPassed;
    [id, title, description, link, image].forEach(prop => {
      expect(prop.toLowerCase()).to.contain('app');
    });
  });
  it('passes App Lab course info to ResourceCard if bogus scriptName is given', () => {
    const propsPassed = propsPassedToVerticalImageResourceCard({
      scriptName: 'bogusScript',
    });
    const {id, title, description, link, image} = propsPassed;
    [id, title, description, link, image].forEach(prop => {
      expect(prop.toLowerCase()).to.contain('app');
    });
  });
  [
    'course2',
    'course3',
    'course4',
    'courseb-2017',
    'coursec-2050',
    'coursed-2011',
    'coursee-2022',
    'coursef-2001',
  ].forEach(scriptName => {
    it(`passes correct course info to ResourceCard for script ${scriptName}`, () => {
      const propsPassed = propsPassedToVerticalImageResourceCard({
        scriptName: scriptName,
        courseTitle: `Localized title of ${scriptName}`,
        courseDesc: `Localized description of ${scriptName}`,
      });
      const {id, title, description, link, image} = propsPassed;
      [id, title, description, link, image].forEach(prop => {
        expect(prop.toLowerCase()).to.contain(scriptName.slice(0, 7));
      });
    });
  });
});
