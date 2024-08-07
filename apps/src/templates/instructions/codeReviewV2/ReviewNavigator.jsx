import PropTypes from 'prop-types';
import React, {useState} from 'react';

import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import Button from '@cdo/apps/legacySharedComponents/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import {VIEWING_CODE_REVIEW_URL_PARAM} from '@cdo/apps/templates/instructions/CommitsAndReviewTab';
import {currentLocation, navigateToHref} from '@cdo/apps/utils';
import javalabMsg from '@cdo/javalab/locale';

const ReviewNavigator = ({
  viewPeerList,
  loadPeers,
  teacherAccountViewingAsParticipant,
}) => {
  const [peers, setPeers] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [loadInProgress, setLoadInProgress] = useState(false);

  const generateLevelUrlWithCodeReviewParam = () => {
    let url =
      currentLocation().origin +
      currentLocation().pathname +
      `?${VIEWING_CODE_REVIEW_URL_PARAM}=true`;

    // If teacher account is viewing as participant, set up URLs
    // to persist this setting when they click to view another project.
    if (teacherAccountViewingAsParticipant) {
      url += `&viewAs=Participant`;
    }
    return url;
  };

  const onSelectPeer = id => {
    if (id) {
      navigateToHref(generateLevelUrlWithCodeReviewParam() + `&user_id=${id}`);
    }
  };

  const onClickBackToProject = () => {
    navigateToHref(generateLevelUrlWithCodeReviewParam());
  };

  const onDropdownClick = () => {
    setLoadInProgress(true);
    loadPeers(onPeerLoadSuccess, onPeerLoadFailure);
  };

  const onPeerLoadSuccess = peerList => {
    setPeers(peerList);
    setLoadInProgress(false);
  };

  const onPeerLoadFailure = () => {
    setLoadError(true);
    setLoadInProgress(false);
  };

  const getDropdownElements = () => {
    if (loadInProgress) {
      return [
        <a key="loading" onClick={() => {}}>
          <Spinner size="medium" />
        </a>,
      ];
    }
    if (loadError || !Array.isArray(peers)) {
      return [
        <a key="error" onClick={() => {}}>
          {javalabMsg.errorLoadingClassmates()}
        </a>,
      ];
    } else if (peers.length === 0) {
      return [
        <a key="no-reviews" onClick={() => {}} className="code-review-no-peers">
          {javalabMsg.noOtherReviews()}
        </a>,
      ];
    } else {
      return peers.map(peer => (
        <a
          key={peer.ownerId}
          onClick={() => onSelectPeer(peer.ownerId)}
          className="code-review-peer-link"
        >
          {peer.ownerName}
        </a>
      ));
    }
  };

  return viewPeerList ? (
    <div style={styles.container}>
      <DropdownButton
        text={javalabMsg.youHaveProjectsToReview()}
        color={Button.ButtonColor.gray}
        onClick={onDropdownClick}
        className="peer-dropdown-button"
      >
        {getDropdownElements()}
      </DropdownButton>
    </div>
  ) : (
    <Button
      text={javalabMsg.returnToMyProject()}
      color={Button.ButtonColor.gray}
      icon={'caret-left'}
      size={Button.ButtonSize.default}
      useDefaultLineHeight
      iconStyle={styles.backToProjectIcon}
      onClick={onClickBackToProject}
      style={styles.backToProjectButton}
    />
  );
};

ReviewNavigator.propTypes = {
  viewPeerList: PropTypes.bool,
  loadPeers: PropTypes.func,
  teacherAccountViewingAsParticipant: PropTypes.bool,
};

const styles = {
  container: {
    display: 'flex',
  },
  backToProjectIcon: {
    // The back to project icon is styled to be the same size and placement
    // as the dropdown icon (see Dropdown.js)
    fontSize: 24,
    position: 'relative',
    top: 3,
  },
  backToProjectButton: {
    margin: 0,
    paddingTop: 0,
  },
};

export default ReviewNavigator;
