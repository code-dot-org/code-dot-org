import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import i18n from "@cdo/locale";

const styles = {
  main: {
    fontSize: 16,
    backgroundColor: color.teal,
    color: color.white,
    padding: '12px 15px',
    marginBottom: 0,
  },
  linesOfCode: {
    fontSize: 16,
    float: 'right'
  }
};

const MiniViewTopRow = React.createClass({
  propTypes: {
    scriptName: PropTypes.string.isRequired,
    linesOfCodeText: PropTypes.string.isRequired,
  },

  render() {
    const { scriptName, linesOfCodeText } = this.props;
    return (
      <div style={styles.main}>
        <a href={`/s/${scriptName}`}>
          <span>{i18n.viewUnitOverview()}</span>
        </a>
        <span style={styles.linesOfCode}>
          {linesOfCodeText}
        </span>
      </div>
    );
  }
});

export default MiniViewTopRow;
