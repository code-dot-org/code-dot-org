import CodeReviewDataApi, {
  timelineElementType,
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewDataApi';
import * as utils from '@cdo/apps/utils';

const fakeCommitData = [
  {
    id: 1,
    createdAt: '2022-03-04T04:58:42.000Z',
    comment: 'First commit',
    projectVersion: 'asdfjkl',
  },
  {
    id: 2,
    createdAt: '2022-03-13T04:58:42.000Z',
    comment: 'Second commit',
    projectVersion: 'lkjfds',
  },
  {
    id: 3,
    createdAt: '2022-03-20T04:58:42.000Z',
    comment: 'Third commit',
    projectVersion: 'wlkjdujx',
  },
];

const fakeReviewData = [
  {
    id: 11,
    createdAt: '2022-03-15T04:58:42.000Z',
    isOpen: false,
    projectVersion: 'asdfjkl',
    comments: [
      {
        id: 123,
        commentText: 'Great work on this!',
        name: 'Steve',
        timestampString: '2022-03-31T04:58:42.000Z',
        isResolved: false,
      },
      {
        id: 124,
        commentText: 'Could you add more comments?',
        name: 'Karen',
        timestampString: '2022-03-31T04:58:42.000Z',
        isResolved: false,
      },
    ],
  },
  {
    id: 22,
    createdAt: '2022-03-31T04:58:42.000Z',
    isOpen: true,
    projectVersion: 'qweruiop',
    comments: [
      {
        id: 123,
        commentText: 'Great work on this!',
        name: 'Steve',
        timestampString: '2022-03-31T04:58:42.000Z',
        isResolved: false,
      },
      {
        id: 124,
        commentText: 'Could you add more comments?',
        name: 'Karen',
        timestampString: '2022-03-31T04:58:42.000Z',
        isResolved: false,
      },
    ],
  },
];

const fakeChannelId = 1;
const fakeLevelId = 2;
const fakeProjectLevelId = 3;
const fakeScriptId = 4;

describe('CodeReviewDataApi', () => {
  describe('getInitialTimelineData', () => {
    let dataApi;
    beforeAll(() => {
      dataApi = new CodeReviewDataApi(
        fakeChannelId,
        fakeLevelId,
        fakeProjectLevelId,
        fakeScriptId
      );
      jest
        .spyOn(CodeReviewDataApi.prototype, 'getCommits')
        .mockClear()
        .mockImplementation(() => {
          return Promise.resolve(fakeCommitData);
        });
      jest
        .spyOn(CodeReviewDataApi.prototype, 'getCodeReviews')
        .mockClear()
        .mockImplementation(() => {
          return Promise.resolve(fakeReviewData);
        });
    });

    it('returns timelineData commits and closed code reviews sorted by createdAt', async () => {
      const {timelineData} = await dataApi.getInitialTimelineData();
      expect(timelineData.length).toBe(4); // 1 closed review + 3 commits
      expect(timelineData[0].comment).toBe('First commit');
      expect(timelineData[1].comment).toBe('Second commit');
      expect(timelineData[2].projectVersion).toBe('asdfjkl');
      expect(timelineData[3].comment).toBe('Third commit');
    });

    it('returns the open code review as openReview', async () => {
      const {openReview} = await dataApi.getInitialTimelineData();
      expect(openReview.projectVersion).toBe('qweruiop');
    });

    it('adds the timelineElementType to each element', async () => {
      const {timelineData, openReview} = await dataApi.getInitialTimelineData();
      expect(timelineData[0].timelineElementType).toBe(
        timelineElementType.commit
      );
      expect(timelineData[2].timelineElementType).toBe(
        timelineElementType.review
      );
      expect(openReview.timelineElementType).toBe(timelineElementType.review);
    });
  });

  describe('closeReview', () => {
    let dataApi, ajaxStub;
    beforeAll(() => {
      dataApi = new CodeReviewDataApi(
        fakeChannelId,
        fakeLevelId,
        fakeProjectLevelId,
        fakeScriptId
      );
    });

    beforeEach(() => {
      ajaxStub = jest
        .spyOn($, 'ajax')
        .mockClear()
        .mockReturnValue({
          done: successCallback => {
            successCallback(fakeReviewData[0]);
            return {fail: () => {}};
          },
        });
    });

    afterEach(() => {
      ajaxStub.mockRestore();
    });

    it('calls patch code review endpoint with isClosed true', async () => {
      await dataApi.closeReview(11);
      expect(ajaxStub).toHaveBeenCalledWith({
        url: `/code_reviews/11`,
        type: 'PATCH',
        headers: {'X-CSRF-Token': undefined},
        data: {
          isClosed: true,
        },
      });
    });

    it('appends timelineElementType of review onto response', async () => {
      const result = await dataApi.closeReview(11);
      expect(result.timelineElementType).toBe(timelineElementType.review);
    });
  });

  describe('openNewCodeReview', () => {
    let dataApi, ajaxStub;
    const fakeVersion = 'asdfjkl';
    beforeAll(() => {
      dataApi = new CodeReviewDataApi(
        fakeChannelId,
        fakeLevelId,
        fakeProjectLevelId,
        fakeScriptId
      );
    });

    beforeEach(() => {
      ajaxStub = jest
        .spyOn($, 'ajax')
        .mockClear()
        .mockReturnValue({
          done: successCallback => {
            successCallback(fakeReviewData[0]);
            return {fail: () => {}};
          },
        });
    });

    afterEach(() => {
      ajaxStub.mockRestore();
    });

    it('calls code reveiw POST endpoint with the expected data', async () => {
      await dataApi.openNewCodeReview(fakeVersion);
      expect(ajaxStub).toHaveBeenCalledWith({
        url: `/code_reviews`,
        type: 'POST',
        headers: {'X-CSRF-Token': undefined},
        data: {
          channelId: fakeChannelId,
          scriptId: fakeScriptId,
          projectLevelId: fakeProjectLevelId,
          levelId: fakeLevelId,
          version: fakeVersion,
        },
      });
    });

    it('appends timelineElementType of review onto response', async () => {
      const result = await dataApi.openNewCodeReview(fakeVersion);
      expect(result.timelineElementType).toBe(timelineElementType.review);
    });
  });

  describe('submitNewCodeReviewComment', () => {
    let dataApi, ajaxStub;
    const fakeReviewId = 11;
    const fakeComment = 'A comment';
    beforeAll(() => {
      dataApi = new CodeReviewDataApi(
        fakeChannelId,
        fakeLevelId,
        fakeProjectLevelId,
        fakeScriptId
      );
    });

    beforeEach(() => {
      ajaxStub = jest
        .spyOn($, 'ajax')
        .mockClear()
        .mockReturnValue({
          done: successCallback => {
            successCallback(fakeReviewData[0]);
            return {fail: () => {}};
          },
        });
    });

    afterEach(() => {
      ajaxStub.mockRestore();
    });

    it('rejects with profanity error if profanity is found', async () => {
      const profaneWordsRes = ['word1', 'word2'];
      jest
        .spyOn(utils, 'findProfanity')
        .mockClear()
        .mockReturnValue({
          done: successCallback => successCallback(profaneWordsRes),
        });

      try {
        await dataApi.submitNewCodeReviewComment(fakeComment, fakeReviewId);
        new Error('Expected promise to reject');
      } catch (err) {
        expect(err.profanityFoundError).toBe(
          'Your comment contains inappropriate language, so it will not be saved. Please update your comment to remove the words "word1, word2".'
        );
      }

      utils.findProfanity.mockRestore();
    });

    it('calls code_review_comments endpoint if profanity is not found', async () => {
      jest
        .spyOn(utils, 'findProfanity')
        .mockClear()
        .mockReturnValue({
          done: successCallback => successCallback(null),
        });

      await dataApi.submitNewCodeReviewComment(fakeComment, fakeReviewId);

      expect(ajaxStub).toHaveBeenCalledWith({
        url: `/code_review_comments`,
        type: 'POST',
        headers: {'X-CSRF-Token': undefined},
        data: {
          codeReviewId: fakeReviewId,
          comment: fakeComment,
        },
      });
      utils.findProfanity.mockRestore();
    });
  });

  describe('toggleResolveComment', () => {
    let dataApi, ajaxStub;
    beforeAll(() => {
      dataApi = new CodeReviewDataApi(
        fakeChannelId,
        fakeLevelId,
        fakeProjectLevelId,
        fakeScriptId
      );
    });

    beforeEach(() => {
      ajaxStub = jest
        .spyOn($, 'ajax')
        .mockClear()
        .mockReturnValue({
          done: successCallback => {
            successCallback(fakeReviewData[0]);
            return {fail: () => {}};
          },
        });
    });

    afterEach(() => {
      ajaxStub.mockRestore();
    });

    it('calls code_review_comments PATCH endpoint with the isResolved value to set', async () => {
      await dataApi.toggleResolveComment(11, true);
      expect(ajaxStub).toHaveBeenCalledWith({
        url: `/code_review_comments/11`,
        type: 'PATCH',
        headers: {'X-CSRF-Token': undefined},
        data: {
          isResolved: true,
        },
      });
    });
  });
});
