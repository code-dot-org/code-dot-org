import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';

export default function SingleSectionSetUp(getOfferings) {
  const [offerings, setOfferings] = useState([{}]);

  // Retrieve course offerings on mount
  useEffect(() => {
    setOfferings(getOfferings());
  }, []);

  return (
    <div>
      <h2>{i18n.assignCurriculum()}</h2>
      <h5>{i18n.useDropdownMessage()}</h5>
      {offerings}
    </div>
  );
}

SingleSectionSetUp.propTypes = {
  getOfferings: PropTypes.func.isRequired
};
