import React, {Fragment} from 'react';
import msg from '@cdo/locale';

const FeedbackSharingDiv = ({
  disableSocialShare,
  shareLink,
  twitter,
  assetUrl,
  downloadReplayVideo,
  feedbackImage,
  appStrings,
  onMainPage,
  enablePrinting,
  alreadySaved,
  saveToProjectGallery,
  disableSaveToGallery,
  downloadReplayVideo
}) => {
  let twitterUrl, facebookUrl;
  if (!disableSocialShare) {
    twitterUrl = getTwitterUrl(shareLink, twitter);
    facebookUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + shareLink;
  }

  return (
    <div id="sharing">
      {feedbackImage ? (
        <Fragment>
          <img className="feedback-image" src={feedbackImage} />
          <div className="sharing-content" />
        </Fragment>
      ) : (
        <div class="sharing-content no-image" />
      )}
      {shareLink && (
        <Fragment>
          {appStrings && appStrings.sharingText && <div>{sharingText}</div>}
          <div id="sharing-input-container">
            <input type="text" id="sharing-input" value={shareLink} readonly />
            <button id="sharing-input-copy-button">
              <i className="fa fa-clipboard fa-lg" />
            </button>
          </div>
          <div className="social-buttons">
            {facebookUrl && (
              <a
                id="sharing-facebook"
                href={facebookUrl}
                target="_blank"
                className="popup-window"
                style="display: none"
                onClick={window.dashboard.popupWindow}
              >
                <button>
                  <i class="fa fa-facebook fa-lg" />
                </button>
              </a>
            )}
            {twitterUrl && (
              <a
                id="sharing-twitter"
                href={twitterUrl}
                target="_blank"
                className="popup-window"
                style="display: none"
                onClick={window.dashboard.popupWindow}
              >
                <button>
                  <i className="fa fa-twitter fa-lg" />
                </button>
              </a>
            )}
            {onMainPage && enablePrinting && (
              <button id="print-button">
                <i className="fa fa-print fa-lg" />
              </button>
            )}
            {alreadySaved && (
              <button className="saved-to-gallery" disabled>
                {msg.savedToGallery()}
              </button>
            )}
            {!alreadySaved && saveToProjectGallery && disableSaveToGallery && (
              <Fragment>
                <button id="save-to-project-gallery-button">
                  {msg.addToProjects()}
                </button>
                <button id="publish-to-project-gallery-button">
                  {msg.publish()}
                </button>
              </Fragment>
            )}
            {downloadReplayVideo && <span id="download-replay-video-container"></span>}
            <button id="sharing-phone">
              <i className="fa fa-mobile fa-lg"></i>&nbsp;
              {msg.sendToPhone()}
            </button>
            <div id="download-replay-video-error" style="font-size: 12px; display: none;">
              {msg.downloadReplayVideoButtonError()}
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
};

function getTwitterUrl(shareLink, twitter) {
  // set up the twitter share url
  var twitterUrl = 'https://twitter.com/intent/tweet?url=' + shareLink;

  if (twitter && twitter.text !== undefined) {
    twitterUrl += '&text=' + encodeURI(twitter.text);
  } else {
    twitterUrl += '&text=' + encodeURI(msg.defaultTwitterText() + ' @codeorg');
  }

  if (twitter && twitter.hashtag !== undefined) {
    twitterUrl += '&hashtags=' + twitter.hashtag;
  } else {
    twitterUrl += '&hashtags=' + 'HourOfCode';
  }

  if (twitter && twitter.related !== undefined) {
    twitterUrl += '&related=' + twitter.related;
  } else {
    twitterUrl += '&related=codeorg';
  }

  return twitterUrl;
}

export default FeedbackSharingDiv;
