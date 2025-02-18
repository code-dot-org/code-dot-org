import PropTypes from 'prop-types';
import React from 'react';

import {useSchoolInfo} from '../schoolInfo/hooks/useSchoolInfo';

import SchoolDataInputs from './SchoolDataInputs';

export function SchoolDataInputsContainer({usIp}) {
  const schoolInfoProps = useSchoolInfo({usIp});
  return <SchoolDataInputs {...schoolInfoProps} />;
}

SchoolDataInputsContainer.propTypes = {
  usIp: PropTypes.bool.isRequired,
};
