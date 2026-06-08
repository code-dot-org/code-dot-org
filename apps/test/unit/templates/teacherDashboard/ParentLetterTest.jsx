import {CdoTheme} from '@code-dot-org/component-library/themes';
import {ThemeProvider} from '@mui/material/styles';
import {render, screen} from '@testing-library/react';
import React from 'react';

import {UnconnectedParentLetter as ParentLetter} from '@cdo/apps/templates/teacherDashboard/ParentLetter';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

const renderWithTheme = ui =>
  render(<ThemeProvider theme={CdoTheme}>{ui}</ThemeProvider>);

describe('ParentLetter', () => {
  const sampleSection = {
    id: 7,
    code: 'ABCDEF',
  };

  it('Secret words section login type should have secret words instructions', () => {
    renderWithTheme(
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

  it('Demo section uses the placeholder code in the sign-in link', () => {
    render(
      <ParentLetter
        section={{
          id: 7,
          code: null,
          demoType: 'demo',
          loginType: SectionLoginType.word,
        }}
        teacherName="Minerva McGonagall"
      />
    );

    const sectionLink = screen
      .getAllByRole('link')
      .find(link => link.getAttribute('href')?.includes('/sections/'));
    expect(sectionLink).toHaveAttribute(
      'href',
      expect.stringContaining('/sections/DEMO-123')
    );
  });

  it('Canvas section login type should have Canvas instructions', () => {
    renderWithTheme(
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

  it('refers to the product as CodeAI rather than Code.org', () => {
    const {container} = renderWithTheme(
      <ParentLetter
        section={{
          ...sampleSection,
          loginType: SectionLoginType.email,
        }}
        teacherName="Minerva McGonagall"
      />
    );

    expect(container.textContent).toContain('CodeAI');
    // The "code.org/athome" URL display is the one allowed exception:
    // it mirrors the actual link target, so we don't rewrite it.
    expect(container.textContent.replace(/code\.org\/athome/g, '')).not.toMatch(
      /Code\.org/
    );
  });
});
