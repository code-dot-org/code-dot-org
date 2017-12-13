import React, { PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import i18n from "@cdo/locale";
import ProgressDetailToggle from "@cdo/apps/templates/progress/ProgressDetailToggle";
import Button from '@cdo/apps/templates/Button';

const styles = {
  main: {
    fontSize: 16,
    backgroundColor: color.teal,
    color: color.white,
    padding: 15,
    marginBottom: 0,
    // matches the lineHeight of Button,
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
    right: 105
  },
  toggle: {
    position: 'absolute',
    top: 10,
    right: 10
  }
};

export default class MiniViewTopRow extends React.Component {
  static propTypes = {
    scriptName: PropTypes.string.isRequired,
    // May not have this (i.e if not logged in)
    linesOfCodeText: PropTypes.string,
  };

  render() {
    const { scriptName, linesOfCodeText } = this.props;
    return (
      <div style={styles.main}>
        <Button
          text={i18n.viewUnitOverview()}
          href={`/s/${scriptName}`}
          color={Button.ButtonColor.gray}
        />
        <span style={styles.linesOfCodeText}>
          {linesOfCodeText}
        </span>
        <div style={styles.toggle}>
          <ProgressDetailToggle
            activeColor={color.teal}
            whiteBorder={true}
          />
        </div>
      </div>
    );
  }
}
