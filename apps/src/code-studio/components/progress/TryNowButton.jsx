import React from 'react';
import color from '@cdo/apps/util/color';

const styles = {
  form: {
    marginBottom: 5,
    display: 'inline-block'
  },
  input: {
    fontSize: 20,
    height: 40,
    fontSize: 20,
    paddingBottom: 4,
    paddingTop: 4,
    paddingLeft: 12,
    paddingRight: 12,
    whitespace: 'pre',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 4,
    textShadow: '0 -1px 0 rgba(0,0,0,0.25)',
  },
  orangeButton: {
    backgroundColor: color.orange,
    color: color.white,
  }
};

// TODO - i18n
const TryNowButton = ({scriptName}) => (
  <form
    style={styles.form}
    method="get"
    action={`/s/${scriptName}/next.next`}
  >
    <input
      style={{...styles.input, ...styles.orangeButton}}
      type="submit"
      value="Try now"
    />
  </form>
);
TryNowButton.propTypes = {
  scriptName: React.PropTypes.string.isRequired
};


export default TryNowButton;
