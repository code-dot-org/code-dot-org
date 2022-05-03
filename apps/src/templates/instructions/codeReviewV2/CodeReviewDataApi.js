export default class CodeReviewDataApi {
  constructor(channelId, levelId, scriptId) {
    this.channelId = channelId;
    this.levelId = levelId;
    this.scriptId = scriptId;
  }

  getReviewablePeers() {
    // Enable when the API is ready
    // return $.ajax({
    //   url: `/code_review/peers_ready_for_review`,
    //   type: 'GET',
    //   data: {
    //     channel_id: this.channelId,
    //     level_id: this.levelId,
    //     script_id: this.scriptId
    //   }
    // });

    // For now returning stub data
    return [
      {
        id: 1,
        name: 'Jerry'
      },
      {
        id: 1,
        name: 'Karen'
      }
    ];
  }

  getCodeReviews() {
    // Enable when the API is ready
    // return $.ajax({
    //   url: `/code_reviews`,
    //   type: 'GET',
    //   data: {
    //     channel_id: this.channelId,
    //     level_id: this.levelId,
    //     script_id: this.scriptId
    //   }
    // });

    // For now returning stub data
    return [
      {
        id: 1,
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
        id: 2,
        createdAt: '2022-03-31T04:58:42.000Z',
        isClosed: false,
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
      }
    ];
  }

  getCommits() {
    // Enable when the API is ready
    // return $.ajax({
    //   url: `/project_versions`,
    //   type: 'GET',
    //   data: {
    //     project_id: this.channelId,
    //   }
    // });
    //
    // For now returning stub data
    return [
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
        createdAt: '2022-03-16T04:58:42.000Z',
        comment: 'Third commit',
        projectVersion: '234kjjdfk',
        isVersionExpired: false
      },
      {
        id: 4,
        createdAt: '2022-03-20T04:58:42.000Z',
        comment: 'Fourth commit',
        projectVersion: 'wlkjdujx',
        isVersionExpired: false
      }
    ];
  }
}
