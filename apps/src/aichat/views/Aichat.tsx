import React from 'react';

/**
 * Renders a simple AI chat.
 */

interface AichatProps {
  children: React.ReactNode;
}

const Aichat: React.FunctionComponent<AichatProps> = ({children}) => (
  <div id="aichat-container">{children}</div>
);

export default Aichat;
