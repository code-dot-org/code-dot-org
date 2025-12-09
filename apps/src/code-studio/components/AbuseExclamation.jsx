import PropTypes from 'prop-types';
import React from 'react';

import AbuseError from './AbuseError';
import AlertExclamation from './AlertExclamation';

export default function AbuseExclamation({
  i18n,
  isOwner,
  canViewFlaggedProject,
}) {
  let finalLink, finalLinkText;
  if (isOwner) {
    finalLink = `${window.location.href}/edit`;
    finalLinkText = i18n.edit_project;
  } else if (canViewFlaggedProject) {
    finalLink = `${window.location.href}/view`;
    finalLinkText = i18n.view_project;
  } else {
    finalLink = 'https://studio.code.org';
    finalLinkText = i18n.go_to_code_studio;
  }

  const textStyle = {
    fontSize: 18,
    lineHeight: '24px',
    padding: 5,
  };

  return (
    <AlertExclamation>
      <AbuseError i18n={i18n} className="exclamation-abuse" />
      <p className="exclamation-abuse" style={textStyle}>
        <a href={finalLink}>{finalLinkText}</a>
      </p>
    </AlertExclamation>
  );
}

AbuseExclamation.propTypes = {
  i18n: PropTypes.shape({
    tos: PropTypes.string.isRequired,
    contact_us: PropTypes.string.isRequired,
    edit_project: PropTypes.string.isRequired,
    view_project: PropTypes.string,
    go_to_code_studio: PropTypes.string.isRequired,
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  canViewFlaggedProject: PropTypes.bool, // Make required once we add different view for teacher of project owner in lab2.
};
