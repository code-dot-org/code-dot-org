import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import i18n from "@cdo/locale";
import ProgressDetailToggle from "@cdo/apps/templates/progress/ProgressDetailToggle";
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import experiments from '@cdo/apps/util/experiments';

const progressRedesignEnabled = experiments.isEnabled('progressRedesign');

const styles = {
  main: {
    fontSize: 16,
    backgroundColor: color.teal,
    color: color.white,
    padding: 15,
    marginBottom: 0,
    // matches the lineHeight of ProgressButton,
    height: 34,
    lineHeight: '34px'
  },
  // absolutely position children so that they're located correctly in RTL as well
  link: {
    color: color.white,
    position: 'absolute',
    left: 15,
    textDecoration: 'underline',
    lineHeight: '34px'
  },
  linesOfCodeText: {
    position: 'absolute',
    right: progressRedesignEnabled ? 105 : 15
  },
  toggle: {
    position: 'absolute',
    top: 10,
    right: 10
  }
};

const MiniViewTopRow = React.createClass({
  propTypes: {
    scriptName: PropTypes.string.isRequired,
    // May not have this (i.e if not logged in)
    linesOfCodeText: PropTypes.string,
  },

  render() {
    const { scriptName, linesOfCodeText } = this.props;
    return (
      <div style={styles.main}>
        <ProgressButton
          text={i18n.viewUnitOverview()}
          href={`/s/${scriptName}`}
          color={ProgressButton.ButtonColor.gray}
        />
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
