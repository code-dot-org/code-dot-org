import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';

export default function CoteacherSettings({
  sectionInstructors,
  addCoteacher,
  coteachersToAdd,
}) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = event => {
    setInputValue(event.target.value);
  };

  const handleButtonClick = () => {
    const newEmail = inputValue;
    if (newEmail === '') {
      return;
    }

    addCoteacher(newEmail);
    setInputValue('');
  };

  return (
    <div>
      {i18n.coteacherAddInfo()}
      <div>
        <input type="text" value={inputValue} onChange={handleInputChange} />
        <button type="button" onClick={handleButtonClick}>
          Submit
        </button>
        {coteachersToAdd}
      </div>
    </div>
  );
}

CoteacherSettings.propTypes = {
  sectionInstructors: PropTypes.arrayOf(PropTypes.object),
  addCoteacher: PropTypes.func,
  coteachersToAdd: PropTypes.arrayOf(PropTypes.string),
};
