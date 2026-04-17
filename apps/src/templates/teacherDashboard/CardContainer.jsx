import PropTypes from 'prop-types';
import React from 'react';

import styles from './sectionSetup.module.scss';

/** Uses flexbox to arrange content cards into nice rows with wrapping. */
const CardContainer = ({children}) => (
  <div className={styles.cards}>{children}</div>
);

CardContainer.propTypes = {
  children: PropTypes.any,
};

export default CardContainer;
