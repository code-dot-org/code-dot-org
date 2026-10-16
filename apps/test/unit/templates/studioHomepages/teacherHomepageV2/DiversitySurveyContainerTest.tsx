import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import DiversitySurveyContainer, {
  DIVERSITY_ETHNICITIES,
  EMPTY_DIVERSITY_COUNTS,
} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/DiversitySurveyContainer';
import i18n from '@cdo/locale';

describe('DiversitySurveyContainer', () => {
  it('has one empty count per ethnicity by default', () => {
    expect(Object.keys(EMPTY_DIVERSITY_COUNTS).sort()).toEqual(
      DIVERSITY_ETHNICITIES.map(({key}) => key).sort()
    );
    Object.values(EMPTY_DIVERSITY_COUNTS).forEach(v => expect(v).toBe(''));
  });

  it('renders the question as the legend of a group', () => {
    render(
      <DiversitySurveyContainer
        counts={EMPTY_DIVERSITY_COUNTS}
        onChange={jest.fn()}
      />
    );
    screen.getByRole('group', {name: i18n.diversitySurveyQuestion()});
  });

  it('renders a labelled input per ethnicity, named for the survey POST', () => {
    render(
      <DiversitySurveyContainer
        counts={EMPTY_DIVERSITY_COUNTS}
        onChange={jest.fn()}
      />
    );
    DIVERSITY_ETHNICITIES.forEach(({key, label}) => {
      const input = screen.getByLabelText(label());
      expect(input.getAttribute('name')).toBe(`survey[diversity_${key}]`);
      expect(input.getAttribute('placeholder')).toBe('0');
    });
  });

  it('shows the values it is given', () => {
    render(
      <DiversitySurveyContainer
        counts={{...EMPTY_DIVERSITY_COUNTS, white: '30'}}
        onChange={jest.fn()}
      />
    );
    const white = screen.getByLabelText(i18n.diversitySurveyEthnicityWhite());
    expect((white as HTMLInputElement).value).toBe('30');
    const asian = screen.getByLabelText(i18n.diversitySurveyEthnicityAsian());
    expect((asian as HTMLInputElement).value).toBe('');
  });

  it('reports changes with the ethnicity key', () => {
    const onChange = jest.fn();
    render(
      <DiversitySurveyContainer
        counts={EMPTY_DIVERSITY_COUNTS}
        onChange={onChange}
      />
    );
    fireEvent.change(
      screen.getByLabelText(i18n.diversitySurveyEthnicityHawaiian()),
      {target: {value: '7'}}
    );
    expect(onChange).toHaveBeenCalledWith('hawaiian', '7');
  });

  it('strips non-digits before reporting a change', () => {
    const onChange = jest.fn();
    render(
      <DiversitySurveyContainer
        counts={EMPTY_DIVERSITY_COUNTS}
        onChange={onChange}
      />
    );
    fireEvent.change(
      screen.getByLabelText(i18n.diversitySurveyEthnicityBlack()),
      {target: {value: '1a-2.5'}}
    );
    expect(onChange).toHaveBeenCalledWith('black', '125');
  });

  it('limits each input to three characters', () => {
    render(
      <DiversitySurveyContainer
        counts={EMPTY_DIVERSITY_COUNTS}
        onChange={jest.fn()}
      />
    );
    DIVERSITY_ETHNICITIES.forEach(({label}) => {
      expect(screen.getByLabelText(label()).getAttribute('maxlength')).toBe(
        '3'
      );
    });
  });
});
