import {render, screen} from '@testing-library/react';
import React from 'react';

import {UnconnectedParentLetter as ParentLetter} from '@cdo/apps/templates/teacherDashboard/ParentLetter';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

describe('ParentLetter', () => {
  const sampleSection = {
    id: 7,
    code: 'ABCDEF',
  };

  it('Secret words section login type should have secret words instructions', () => {
    render(
      <ParentLetter
        section={{
          ...sampleSection,
          loginType: SectionLoginType.word,
        }}
        teacherName="Minerva McGonagall"
      />
    );

    const loginStep = screen.getByText(
      i18n.parentLetterSecretWords({secretWords: ''}),
      {collapseWhitespace: false}
    );
    expect(loginStep).toBeInTheDocument();
  });

  it('Canvas section login type should have Canvas instructions', () => {
    render(
      <ParentLetter
        section={{
          ...sampleSection,
          loginType: SectionLoginType.lti_v1,
        }}
        loginTypeName="Canvas"
        teacherName="Minerva McGonagall"
      />
    );

    const loginStep = screen.getByText(
      i18n.parentLetter_LMS_Step1({loginTypeName: 'Canvas'})
    );
    expect(loginStep).toBeInTheDocument();
  });
});
