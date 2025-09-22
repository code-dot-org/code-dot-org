import React from 'react';

interface PersonalizationInformationBoxProps {
  information: string;
}

const PersonalizationInformationBox: React.FC<
  PersonalizationInformationBoxProps
> = ({information}) => {
  return (
    <div
      style={{
        backgroundColor: 'white',
        alignSelf: 'stretch',
        padding: '12px',
        margin: '4px 0',
      }}
    >
      {information}
    </div>
  );
};

export default PersonalizationInformationBox;
