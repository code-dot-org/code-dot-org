import {Experience} from '@contentful/experiences-sdk-react';

import {
  getExperienceEntryFieldsFromExperience,
  getSeoMetadataEntryFromExperience,
  getSeoMetadataFromExperience,
  getPageHeading,
} from '../getExperienceEntryFields';

const mockExperience: Experience = {
  entityStore: {
    experienceEntryFields: {},
  },
} as Experience;

describe('getExperienceEntryFieldsFromExperience', () => {
  it('should return experienceEntryFields when experience is defined', () => {
    const experience = {
      ...mockExperience,
      entityStore: {
        ...mockExperience.entityStore,
        experienceEntryFields: {pageHeading: 'Test Heading'},
      },
    } as Experience;

    const result = getExperienceEntryFieldsFromExperience(experience);
    expect(result).toEqual({pageHeading: 'Test Heading'});
  });

  it('should return undefined when experience is undefined', () => {
    const result = getExperienceEntryFieldsFromExperience(undefined);
    expect(result).toBeUndefined();
  });
});

describe('getSeoMetadataEntryFromExperience', () => {
  it('should return seoMetadata when experienceEntryFields contains it', () => {
    const experience = {
      ...mockExperience,
      entityStore: {
        ...mockExperience.entityStore,
        experienceEntryFields: {seoMetadata: {title: 'Test Title'}},
      },
    } as unknown as Experience;

    const result = getSeoMetadataEntryFromExperience(experience);
    expect(result).toEqual({title: 'Test Title'});
  });

  it('should return undefined when experienceEntryFields is undefined', () => {
    const experience = {
      ...mockExperience,
      entityStore: {
        ...mockExperience.entityStore,
        experienceEntryFields: {},
      },
    } as Experience;

    const result = getSeoMetadataEntryFromExperience(experience);
    expect(result).toBeUndefined();
  });
});

describe('getSeoMetadataFromExperience', () => {
  it('should return fields when seoMetadata contains fields', () => {
    const experience = {
      ...mockExperience,
      entityStore: {
        ...mockExperience.entityStore,
        experienceEntryFields: {
          seoMetadata: {fields: {description: 'Test Description'}},
        },
      },
    } as unknown as Experience;

    const result = getSeoMetadataFromExperience(experience);
    expect(result).toEqual({description: 'Test Description'});
  });

  it('should return undefined when seoMetadata is undefined', () => {
    const experience = {
      ...mockExperience,
      entityStore: {
        ...mockExperience.entityStore,
        experienceEntryFields: {},
      },
    } as Experience;

    const result = getSeoMetadataFromExperience(experience);
    expect(result).toBeUndefined();
  });
});

describe('getPageHeading', () => {
  it('should return pageHeading when experienceEntryFields contains it', () => {
    const experience = {
      ...mockExperience,
      entityStore: {
        ...mockExperience.entityStore,
        experienceEntryFields: {pageHeading: 'Test Heading'},
      },
    } as Experience;

    const result = getPageHeading(experience);
    expect(result).toBe('Test Heading');
  });

  it('should return undefined when experienceEntryFields is undefined', () => {
    const experience = {
      ...mockExperience,
      entityStore: {
        ...mockExperience.entityStore,
        experienceEntryFields: {},
      },
    } as Experience;

    const result = getPageHeading(experience);
    expect(result).toBeUndefined();
  });
});
