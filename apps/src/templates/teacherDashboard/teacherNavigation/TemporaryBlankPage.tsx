import React from 'react';

import comingSoonGraphic from '@cdo/apps/templates/teacherDashboard/teacherNavigation/comingSoonGraphic.png';

const TemporaryBlankPage: React.FC = () => {
  return (
    <img
      src={comingSoonGraphic}
      alt="Cat loving CodeAI"
      style={{position: 'absolute', left: '45%'}}
    />
  );
};

export default TemporaryBlankPage;
