import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import i18n from "@cdo/locale";
import ProgressDetailToggle from "@cdo/apps/templates/progress/ProgressDetailToggle";
import experiments from '@cdo/apps/util/experiments';

const progressRedesignEnabled = experiments.isEnabled('progressRedesign');

const styles = {
  main: {
    fontSize: 16,
    backgroundColor: color.teal,
    color: color.white,
    padding: 15,
    marginBottom: 0,
    height: 18
  },
  // absolutely position children so that they're located correctly in RTL as well
  link: {
    color: color.white,
    position: 'absolute',
    left: 15
  },
  linesOfCodeText: {
    position: 'absolute',
    right: progressRedesignEnabled ? 95 : 15
  },
  toggle: {
    position: 'absolute',
    top: 4,
    right: 4
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
        <a href={`/s/${scriptName}`} style={styles.link}>
          <span>{i18n.viewUnitOverview()}</span>
        </a>
        <span style={styles.linesOfCodeText}>
          {linesOfCodeText}
        </span>
        {progressRedesignEnabled &&
          <div style={styles.toggle}>
            <ProgressDetailToggle
              activeColor={color.teal}
              whiteBorder={true}
            />
          </div>
        }
      </div>
    );
  }
});

export default MiniViewTopRow;
