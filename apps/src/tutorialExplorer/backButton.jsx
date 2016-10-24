/* BackButton: A button shown above the filters that goes back to /learn2016.
 */

import React from 'react';

const styles = {
  backButton: {
    marginTop: 7,
    marginBottom: 10
  }
};

const BackButton = (props) => (
  <a href="/learn2016">
    <button style={styles.backButton}>
      <i className="fa fa-arrow-left" aria-hidden={true}/>
      &nbsp;
      Back to all tutorials
    </button>
  </a>
);

export default BackButton;
