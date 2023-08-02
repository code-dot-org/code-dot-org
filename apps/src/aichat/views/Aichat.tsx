import React from 'react';
import styles from './aichat.module.scss';

/**
 * Renders a simple AI chat.
 */

interface AichatProps {
  children: React.ReactNode;
}

const Aichat: React.FunctionComponent<AichatProps> = ({children}) => (
  <div id="aichat-container" className={styles.container}>
    {children}
  </div>
);

export default Aichat;
