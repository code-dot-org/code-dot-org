import {expect} from '../../../../util/reconfiguredChai';
import CodeReviewDataApi, {
  timelineElementType
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewDataApi';
import sinon from 'sinon';

const fakeCommitData = [
  {
    id: 1,
    createdAt: '2022-03-04T04:58:42.000Z',
    comment: 'First commit',
    projectVersion: 'asdfjkl',
    isVersionExpired: false
  },
  {
    id: 2,
    createdAt: '2022-03-13T04:58:42.000Z',
    comment: 'Second commit',
    projectVersion: 'lkjfds',
    isVersionExpired: false
  },
  {
    id: 3,
    createdAt: '2022-03-20T04:58:42.000Z',
    comment: 'Third commit',
    projectVersion: 'wlkjdujx',
    isVersionExpired: false
  }
];

const fakeReviewData = [
  {
    id: 11,
    createdAt: '2022-03-15T04:58:42.000Z',
    isClosed: true,
    projectVersion: 'asdfjkl',
    isVersionExpired: false,
    comments: [
      {
        id: 123,
        commentText: 'Great work on this!',
        name: 'Steve',
        timestampString: '2022-03-31T04:58:42.000Z',
        isResolved: false
      },
      {
        id: 124,
        commentText: 'Could you add more comments?',
        name: 'Karen',
        timestampString: '2022-03-31T04:58:42.000Z',
        isResolved: false
      }
    ]
  },
  {
    id: 22,
    createdAt: '2022-03-31T04:58:42.000Z',
    isClosed: false,
    projectVersion: 'qweruiop',
    isVersionExpired: false,
    comments: [
      {
        id: 123,
        commentText: 'Great work on this!',
        name: 'Steve',
        timestampString: '2022-03-31T04:58:42.000Z',
        isResolved: false
      },
      {
        id: 124,
        commentText: 'Could you add more comments?',
        name: 'Karen',
        timestampString: '2022-03-31T04:58:42.000Z',
        isResolved: false
      }
    ]
  }
];

const fakeChannelId = 1;
const fakeLevelId = 2;
const fakeScriptId = 3;

describe('CodeReviewDataApi', () => {
  describe('getInitialTimelineData', () => {
    sinon.stub(CodeReviewDataApi.prototype, 'getCommits').callsFake(() => {
      return Promise.resolve(fakeCommitData);
    });
    sinon.stub(CodeReviewDataApi.prototype, 'getCodeReviews').callsFake(() => {
      return Promise.resolve(fakeReviewData);
    });

    let dataApi;
    before(() => {
      dataApi = new CodeReviewDataApi(fakeChannelId, fakeLevelId, fakeScriptId);
    });

    it('returns timelineData commits and closed code reviews sorted by createdAt', async () => {
      const {timelineData} = await dataApi.getInitialTimelineData();
      expect(timelineData.length).to.equal(4); // 1 closed review + 3 commits
      expect(timelineData[0].comment).to.equal('First commit');
      expect(timelineData[1].comment).to.equal('Second commit');
      expect(timelineData[2].projectVersion).to.equal('asdfjkl');
      expect(timelineData[3].comment).to.equal('Third commit');
    });

    it('returns the open code review as openReview', async () => {
      const {openReview} = await dataApi.getInitialTimelineData();
      expect(openReview.projectVersion).to.equal('qweruiop');
    });

    it('adds the timelineElementType to each element', async () => {
      const {timelineData, openReview} = await dataApi.getInitialTimelineData();
      expect(timelineData[0].timelineElementType).to.equal(
        timelineElementType.commit
      );
      expect(timelineData[2].timelineElementType).to.equal(
        timelineElementType.review
      );
      expect(openReview.timelineElementType).to.equal(
        timelineElementType.review
      );
    });
  });
});
