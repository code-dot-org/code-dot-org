import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';

const styles = {
  container: {
    ...progressStyles.flex,
    ...progressStyles.font,
    color: color.charcoal,
    ':hover': {
      cursor: 'pointer'
    },
    textAlign: 'center',
    height: '100%',
    padding: '0px 10px'
  },
  highlight: {
    backgroundColor: color.teal,
    color: color.white,
    fontSize: 18
  },
  line: {
    ...progressStyles.inlineBlock,
    width: '100%',
    height: 0,
    border: '1px solid ',
    margin: '0px -7px 0px 4px'
  },
  arrow: {
    ...progressStyles.inlineBlock,
    borderStyle: 'solid',
    borderWidth: '0px 2px 2px 0px',
    width: 6,
    height: 6,
    transform: 'rotate(-45deg)',
    WebkitTransform: 'rotate(-45deg)'
  }
};

class ProgressTableLessonNumber extends React.Component {
  static propTypes = {
    number: PropTypes.number.isRequired,
    lockable: PropTypes.bool.isRequired,
    highlighted: PropTypes.bool.isRequired,
    tooltipId: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    includeArrow: PropTypes.bool
  };

  render() {
    const {
      number,
      lockable,
      highlighted,
      includeArrow,
      tooltipId,
      onClick
    } = this.props;

    const highlightStyle = highlighted ? styles.highlight : {};
    return (
      <div
        style={{...styles.container, ...highlightStyle}}
        onClick={onClick}
        data-tip
        data-for={tooltipId}
      >
        {lockable ? <FontAwesome icon="lock" /> : number}
        {includeArrow && <span style={styles.line} />}
        {includeArrow && <span style={styles.arrow} />}
      </div>
    );
  }
}

export default Radium(ProgressTableLessonNumber);
