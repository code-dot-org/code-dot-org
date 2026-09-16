import {Button, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

export default function BadgeManagementLink({
  sectionId,
  showContinuity = false,
}) {
  const [information, setInformation] = useState(null);
  useEffect(() => {
    let cancelled = false;
    HttpClient.fetchJson(`/sections/${sectionId}/badges/availability`)
      .then(({value}) => {
        if (!cancelled) {
          setInformation(value.available ? value : null);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sectionId]);
  return information ? (
    <>
      {showContinuity && <Typography>{information.continuity}</Typography>}
      <Button href={`/sections/${sectionId}/badges`}>
        {information.label}
      </Button>
    </>
  ) : null;
}

BadgeManagementLink.propTypes = {
  sectionId: PropTypes.number.isRequired,
  showContinuity: PropTypes.bool,
};
