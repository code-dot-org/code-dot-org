import React, {PropTypes} from 'react';

/**
 * A simple component for centering content within a dialog.
 */
const PadAndCenter = ({children}) => (
  <div
    style={{
      display: 'flex',
      flexFlow: 'row',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 20,
    }}
  >
    {children}
  </div>
);
PadAndCenter.propTypes = {children: PropTypes.any};
export default PadAndCenter;
