/**
 * @jest-environment node
 */
import {search} from '@orama/orama';

import {Activity} from '@/modules/activityCatalog/types/Activity';
import {Entry} from '@/types/contentful/Entry';

import {createDatabase} from '../createDatabase';

jest.mock('@/selectors/contentful/getImage', () => ({
  getAbsoluteImageUrl: jest.fn(img =>
    img ? `https://cdn.example.com/${img}` : '',
  ),
}));

const mockActivities = [
  {
    fields: {
      title: 'Activity 1',
      image: 'img1.png',
      organization: 'Org1',
      ages: ['8-10'],
      languageProgramming: ['JavaScript'],
      shortDescription: 'Short desc 1',
      longDescription: 'Long desc 1',
      technologyClassroom: ['Tablet'],
      topic: ['Math'],
      activityType: ['Game'],
      length: ['30min'],
      accessibilitys: ['Screen Reader'],
      languagesText: 'English',
      standards: 'CCSS',
      tutorialID: 'tut1',
      primaryLinkRef: 'https://studio.code.org/1',
    },
  },
  {
    fields: {
      title: 'Activity 2',
      organization: 'Org2',
      ages: [],
      languageProgramming: [],
      shortDescription: '',
      longDescription: '',
      technologyClassroom: [],
      topic: [],
      activityType: [],
      length: [],
      accessibilitys: [],
      languagesText: '',
      standards: '',
      tutorialID: '',
      primaryLinkRef: '',
    },
  },
] as unknown as Entry<Activity>[];

describe('createDatabase', () => {
  it('should create a database and insert activities', async () => {
    const db = createDatabase(mockActivities);

    const result = await search(db, {term: 'Activity', properties: ['title']});
    expect(result.hits.length).toBe(2);
    expect(result.hits[0].document.title).toBe('Activity 1');
    expect(result.hits[1].document.title).toBe('Activity 2');
  });

  it('should handle missing fields and default values', async () => {
    const db = createDatabase([mockActivities[1]]);
    const result = await search(db, {
      term: 'Activity 2',
      properties: ['title'],
    });
    expect(result.hits.length).toBe(1);
    const doc = result.hits[0].document;
    expect(doc.image).toBe('');
    expect(doc.ages).toEqual([]);
    expect(doc.languageProgramming).toEqual([]);
    expect(doc.shortDescription).toBe('');
  });

  it('should stringify primaryLinkRef', async () => {
    const db = createDatabase([mockActivities[0]]);
    const result = await search(db, {
      term: 'Activity 1',
      properties: ['title'],
    });
    expect(result.hits.length).toBe(1);
    expect(result.hits[0].document.primaryLinkRef).toBe(
      JSON.stringify('https://studio.code.org/1'),
    );
  });

  it('should use getAbsoluteImageUrl for image field', async () => {
    const db = createDatabase([mockActivities[0]]);
    const result = await search(db, {
      term: 'Activity 1',
      properties: ['title'],
    });
    expect(result.hits[0].document.image).toBe(
      'https://cdn.example.com/img1.png',
    );
  });

  it('should return an Orama database instance', () => {
    const db = createDatabase([]);
    expect(db).toBeDefined();
    expect(typeof db).toBe('object');
  });
});
