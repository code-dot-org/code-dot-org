import React from 'react';

import PersonalizationInformationBox from './PersonalizationInformationBox';

interface PersonalizationResultsColumnProps {
  isTeachingSuperPowers: boolean;
}

const PersonalizationResultsColumn: React.FC<
  PersonalizationResultsColumnProps
> = ({isTeachingSuperPowers}) => {
  const backgroundColor = isTeachingSuperPowers ? 'yellow' : 'black';

  return (
    <div
      style={{
        width: '350px',
        height: '432px',
        backgroundColor,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h2
        style={{
          margin: '0 0 16px 0',
          color: isTeachingSuperPowers ? 'black' : 'white',
        }}
      >
        Results Information
      </h2>
      <PersonalizationInformationBox information="Information Box 1" />
      <PersonalizationInformationBox information="Information Box 2" />
      <PersonalizationInformationBox information="Information Box 3" />
    </div>
  );
};

export default PersonalizationResultsColumn;
