import React from 'react';

import PersonalizationResultsColumn from './PersonalizationResultsColumn';

interface HeaderBoxProps {
  persona: string;
}

const HeaderBox: React.FC<HeaderBoxProps> = ({persona}) => {
  return (
    <div className="header-box">
      <div className="teaching-style-text">Your teaching style is</div>
      <div className="persona-text">{persona}</div>
      <div className="potential-text">
        <span className="icon">✨</span>
        you see potential in every student and nurture it
      </div>
    </div>
  );
};

interface PersonalizationResultsProps {
  persona: string;
}

const PersonalizationResults: React.FC<PersonalizationResultsProps> = ({
  persona,
}) => {
  return (
    <div className="personalization-results">
      <HeaderBox persona={persona} />
      <PersonalizationResultsColumn isTeachingSuperPowers={true} />
      <PersonalizationResultsColumn isTeachingSuperPowers={false} />
      {/* Placeholder for the other 2 components */}
      <div className="component-placeholder">Component 3 - Coming Soon</div>
      <div className="component-placeholder">Component 4 - Coming Soon</div>
    </div>
  );
};

export default PersonalizationResults;
