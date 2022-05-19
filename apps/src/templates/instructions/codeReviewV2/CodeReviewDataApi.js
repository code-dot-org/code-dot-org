import {findProfanity} from '@cdo/apps/utils';
import javalabMsg from '@cdo/javalab/locale';

export const timelineElementType = {
  review: 'review',
  commit: 'commit'
};

export default class CodeReviewDataApi {
  constructor(channelId, levelId, scriptId, locale) {
    this.channelId = channelId;
    this.levelId = levelId;
    this.scriptId = scriptId;
    this.locale = locale;
  }

  // Temp method only used to set this.token
  getCodeReviewCommentsForProject(onDone) {
    return $.ajax({
      url: `/code_review_comments/project_comments`,
      method: 'GET',
      data: {channel_id: this.channelId}
    }).done((data, _, request) => {
      this.token = request.getResponseHeader('csrf-token');
    });
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

  getInitialTimelineData = async () => {
    const [codeReviews, commits] = await Promise.all([
      this.getCodeReviews(),
      this.getCommits()
    ]);

    // Separates the closed reviews from the open review (if present)
    // and labels the data as timelineElementType.review
    let labeledClosedReviewData = [];
    let openReview = null;
    codeReviews.forEach(review => {
      review.timelineElementType = timelineElementType.review;
      if (review.isOpen) {
        openReview = review;
      } else {
        labeledClosedReviewData.push(review);
      }
    });

    // Labels the commit data as timelineElementType.commit
    const labeledCommitData = commits.map(commit => {
      commit.timelineElementType = timelineElementType.commit;
      return commit;
    });

    // Combines the closed reviews with the commits and orders the elements by
    // created at asc, the order that they will be rendered on the timeline.
    const timelineData = labeledClosedReviewData.concat(labeledCommitData);
    timelineData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return {
      timelineData, // Sorted closed reviews and commits
      openReview // Single open review if present
    };
  };

  getCodeReviews() {
    // TODO: csrf token get rid of this:
    this.getCodeReviewCommentsForProject();

    return $.ajax({
      url: `/code_reviews`,
      type: 'GET',
      data: {
        channelId: this.channelId,
        levelId: this.levelId,
        scriptId: this.scriptId
      }
    });
  }

  getCommits() {
    return $.ajax({
      url: `/project_commits/${this.channelId}`,
      type: 'GET'
    });
  }

  submitNewCodeReviewComment(comment, codeReviewId) {
    return new Promise((resolve, reject) => {
      findProfanity(comment, this.locale, this.token)
        .done(profaneWords => {
          if (profaneWords?.length > 0) {
            reject({
              profanityFoundError: javalabMsg.commentProfanityFound({
                wordCount: profaneWords.length,
                words: profaneWords.join(', ')
              })
            });
          } else {
            $.ajax({
              url: `/code_review_notes`,
              type: 'POST',
              headers: {'X-CSRF-Token': this.token},
              data: {
                codeReviewId,
                comment
              }
            })
              .done(newComment => resolve(newComment))
              .fail(result => reject(result));
          }
        })
        .fail(error => reject(error));
    });
  }

  closeReview(reviewId) {
    // TODO: call API for close review
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `/code_reviews/${reviewId}`,
        type: 'PATCH',
        headers: {'X-CSRF-Token': this.token},
        data: {
          isClosed: true
        }
      })
        .done(updatedCodeReview =>
          resolve({
            ...updatedCodeReview,
            timelineElementType: timelineElementType.review
          })
        )
        .fail(result => reject(result));
    });
  }

  openNewCodeReview(version) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `/code_reviews`,
        type: 'POST',
        headers: {'X-CSRF-Token': this.token},
        data: {
          channelId: this.channelId,
          scriptId: this.scriptId,
          levelId: this.levelId,
          version: version
        }
      })
        .done(newCodeReview =>
          resolve({
            ...newCodeReview,
            timelineElementType: timelineElementType.review
          })
        )
        .fail(result => reject(result));
    });
  }
}
