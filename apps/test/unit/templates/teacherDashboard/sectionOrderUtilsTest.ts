import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import {
  getFilteredSectionOrderIds,
  getOrderedSectionIds,
  saveSectionOrder,
} from '@cdo/apps/templates/teacherDashboard/sectionOrderUtils';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';

const SECTION: Section = {
  id: 11,
  name: 'Period 1',
  hidden: false,
  courseVersionName: 'csd-2024',
  unitName: null,
  unitPosition: null,
  aiTutorEnabled: false,
  atRiskAgeGatedDate: new Date(),
  atRiskAgeGatedUsState: 'xyz',
  anyStudentHasProgress: false,
  code: 'ABCDEF',
  codeReviewExpiresAt: null,
  course: null,
  courseDisplayName: "Computer Science Discoveries ('24-'25)",
  courseId: 52,
  courseOfferingId: 192,
  courseVersionId: 553,
  createdAt: '2024-10-04T18:19:41.000Z',
  grades: [],
  isAssignedCSA: false,
  lessonExtras: false,
  loginType: 'picture',
  loginTypeName: 'Picture Password',
  pairingAllowed: false,
  participantType: ParticipantAudience.student,
  postMilestoneDisabled: false,
  providerManaged: false,
  restrictSection: false,
  sectionInstructors: [],
  sharingDisabled: false,
  studentCount: 0,
  syncEnabled: false,
  ttsAutoplayEnabled: false,
  unitId: null,
};

const makeTestSection = (
  id: number,
  propOverrides?: Partial<Section>
): Section => {
  return {...SECTION, id, ...propOverrides};
};

describe('Section Order Utils', () => {
  let httpClientPutSpy: jest.SpyInstance;

  beforeEach(() => {
    httpClientPutSpy = jest
      .spyOn(HttpClient, 'put')
      .mockResolvedValue(new Response());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFilteredSectionOrderIds', () => {
    it('returns an empty array when both sections and orderedSectionIds are empty', () => {
      const result = getFilteredSectionOrderIds([], []);
      expect(result).toEqual([]);
    });

    it('returns all filtered sections when orderedSectionIds is empty', () => {
      const sections = [
        makeTestSection(1),
        makeTestSection(2),
        makeTestSection(3, {
          hidden: true,
        }),
        makeTestSection(4, {
          participantType: ParticipantAudience.teacher,
        }),
      ];
      const orderedSectionIds: number[] = [];
      const result = getFilteredSectionOrderIds(sections, orderedSectionIds);
      expect(result).toEqual([1, 2]);
    });

    it('returns empty array when sections is empty but orderedSectionIds is not', () => {
      const sections: Section[] = [];
      const orderedSectionIds = [1, 2, 3];
      const result = getFilteredSectionOrderIds(sections, orderedSectionIds);
      expect(result).toEqual([]);
    });

    it('returns only sections with participantType student and not hidden', () => {
      const sections = [
        makeTestSection(1),
        makeTestSection(2, {
          participantType: ParticipantAudience.teacher,
        }),
        makeTestSection(3, {
          hidden: true,
        }),
        makeTestSection(4),
      ];
      const orderedSectionIds: number[] = [];
      const result = getFilteredSectionOrderIds(sections, orderedSectionIds);
      expect(result).toEqual([1, 4]);
    });

    it('prepends sections not in orderedSectionIds', () => {
      const sections = [
        makeTestSection(1),
        makeTestSection(2),
        makeTestSection(3),
      ];
      const orderedSectionIds = [3, 1];
      const result = getFilteredSectionOrderIds(sections, orderedSectionIds);
      expect(result).toEqual([2, 3, 1]);
    });

    it('maintains the order of sections from orderedSectionIds in the result', () => {
      const sections = [
        makeTestSection(1),
        makeTestSection(2),
        makeTestSection(3),
      ];
      const orderedSectionIds = [3, 1, 2];
      const result = getFilteredSectionOrderIds(sections, orderedSectionIds);
      expect(result).toEqual([3, 1, 2]);
    });

    it('ignores sections in orderedSectionIds that are not in the filtered sections', () => {
      const sections = [makeTestSection(1)];
      const orderedSectionIds = [3];
      const result = getFilteredSectionOrderIds(sections, orderedSectionIds);
      expect(result).toEqual([1]);
    });

    it('handles a mix of hidden and non-hidden sections with different participant types', () => {
      const sections = [
        makeTestSection(1),
        makeTestSection(2, {
          participantType: ParticipantAudience.teacher,
        }),
        makeTestSection(3, {
          hidden: true,
        }),
        makeTestSection(4),
        makeTestSection(5, {
          participantType: ParticipantAudience.teacher,
          hidden: true,
        }),
      ];
      const orderedSectionIds = [4, 1, 3];
      const result = getFilteredSectionOrderIds(sections, orderedSectionIds);
      expect(result).toEqual([4, 1]);
    });
  });

  describe('getOrderedSectionIds', () => {
    it('returns empty array when both inputs are empty', () => {
      const result = getOrderedSectionIds([], []);
      expect(result).toEqual([]);
    });

    it('returns all filtered sections when orderedSectionIds is empty', () => {
      const filteredSectionIds = [1, 2, 3];
      const orderedSectionIds: number[] = [];
      const result = getOrderedSectionIds(
        filteredSectionIds,
        orderedSectionIds
      );
      expect(result).toEqual([1, 2, 3]);
    });

    it('returns empty array when filteredSectionIds is empty but orderedSectionIds is not', () => {
      const filteredSectionIds: number[] = [];
      const orderedSectionIds = [1, 2, 3];
      const result = getOrderedSectionIds(
        filteredSectionIds,
        orderedSectionIds
      );
      expect(result).toEqual([]);
    });

    it('prepends sections not in orderedSectionIds', () => {
      const filteredSectionIds = [1, 2, 3];
      const orderedSectionIds = [3, 1];
      const result = getOrderedSectionIds(
        filteredSectionIds,
        orderedSectionIds
      );
      expect(result).toEqual([2, 3, 1]);
    });

    it('maintains the order of sections from orderedSectionIds in the result', () => {
      const filteredSectionIds = [1, 2, 3];
      const orderedSectionIds = [3, 1, 2];
      const result = getOrderedSectionIds(
        filteredSectionIds,
        orderedSectionIds
      );
      expect(result).toEqual([3, 1, 2]);
    });

    it('ignores sections in orderedSectionIds that are not in the filtered sections', () => {
      const filteredSectionIds = [1];
      const orderedSectionIds = [3, 4];
      const result = getOrderedSectionIds(
        filteredSectionIds,
        orderedSectionIds
      );
      expect(result).toEqual([1]);
    });

    it('does not call HttpClient.put when order is the same', () => {
      const filteredSectionIds = [1, 2, 3];
      const orderedSectionIds = [1, 2, 3];
      getOrderedSectionIds(filteredSectionIds, orderedSectionIds);

      expect(httpClientPutSpy).not.toHaveBeenCalled();
    });

    it('calls HttpClient.put with empty array when both inputs are empty', () => {
      getOrderedSectionIds([], []);
      expect(httpClientPutSpy).not.toHaveBeenCalled();
    });
  });

  describe('saveSectionOrder', () => {
    it('calls HttpClient.put', () => {
      const sectionIds = [1, 2, 3];
      saveSectionOrder(sectionIds);

      expect(httpClientPutSpy).toHaveBeenCalledWith(
        '/user_preference',
        JSON.stringify({sectionOrder: sectionIds}),
        true,
        {
          'Content-Type': 'application/json; charset=UTF-8',
        }
      );
    });
  });
});
