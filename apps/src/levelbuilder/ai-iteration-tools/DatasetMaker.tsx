import React from 'react';

import FreeResponseDatasetMaker from './FreeResponseDatasetMaker';
import StudentCodeDatasetMaker from './StudentCodeDatasetMaker';

interface DatasetMakerProps {
  studentWorkAccess: boolean;
}

const DatasetMaker: React.FC<DatasetMakerProps> = ({studentWorkAccess}) => {
  return (
    <div>
      <h1>Student Work Dataset Maker</h1>
      <p>
        This is an internal tool to help create datasets of student work. It can
        be used as a shortcut to gather student code or free response answers,
        which may be needed for research or evaluation. Access is limited to
        those with student work access permissions.
      </p>
      {!studentWorkAccess && (
        <h3>You don't have the permissions needed to use these tools.</h3>
      )}
      <div>
        {studentWorkAccess && (
          <div>
            <StudentCodeDatasetMaker />
            <br />
            <hr />
            <br />
            <FreeResponseDatasetMaker />
            <br />
            <hr />
            <br />
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetMaker;
