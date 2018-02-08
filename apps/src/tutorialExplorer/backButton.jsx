/* BackButton: A button shown above the filters that goes back to /learn.
 */

import React from 'react';
import i18n from '@cdo/tutorialExplorer/locale';

const styles = {
  backButton: {
    marginTop: 7,
    marginBottom: 13
  }
};

const BackButton = (props) => (
  <a href="/learn">
    <button style={styles.backButton}>
      <i className="fa fa-arrow-left" aria-hidden={true}/>
      &nbsp;
      {i18n.backButtonBack()}
    </button>
  </a>
);

export default BackButton;
