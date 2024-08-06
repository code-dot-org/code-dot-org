import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

interface SectionNavigationRouterProps {
  sectionId: string;
}

const SectionNavigationRouter: React.FC<SectionNavigationRouterProps> = ({
  sectionId,
}) => {
  const baseUrl = `/teacher_dashboard/sections/${sectionId}`;
  return (
    <BrowserRouter basename={baseUrl}>
      <Routes>
        <Route path="/*" element={<div>TESTING</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default SectionNavigationRouter;
