import GraduateToNextLevel from '@cdo/apps/templates/certificates/GraduateToNextLevel';
import React from 'react';
import {isolateComponent} from 'isolate-react';
import {expect} from '../../../util/reconfiguredChai';

const isolateGraduateToNextLevel = props =>
  isolateComponent(<GraduateToNextLevel {...props} />);

describe('GraduateToNextLevel', () => {
  it('passes App Lab course info to ResourceCard by default', () => {
    const propsPassed = isolateGraduateToNextLevel().findOne(
      'VerticalImageResourceCard'
    ).props;
    const {id, title, description, link, image} = propsPassed;
    [id, title, description, link, image].forEach(prop => {
      expect(prop.toLowerCase()).to.contain('app');
    });
  });
});
