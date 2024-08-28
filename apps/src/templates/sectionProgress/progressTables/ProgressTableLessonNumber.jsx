import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';
import ReactTooltip from 'react-tooltip';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import color from '@cdo/apps/util/color';
import './progressTableStyles.scss';

const LessonArrow = () => {
  return (
    <span className="lesson-arrow">
      <span className="line" />
      <span className="arrow" />
    </span>
  );
};

class ProgressTableLessonNumber extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    number: PropTypes.number.isRequired,
    lockable: PropTypes.bool.isRequired,
    highlighted: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    includeArrow: PropTypes.bool,
    isAssessment: PropTypes.bool,
  };

  tooltipId() {
    return `tooltipForLesson${this.props.id}`;
  }

  renderTooltip() {
    const id = this.tooltipId();
    return (
      <ReactTooltip
        id={id}
        key={id}
        role="tooltip"
        wrapper="span"
        effect="solid"
      >
        {this.props.isAssessment && (
          <FontAwesome icon="check-circle" style={styles.icon} />
        )}
        {this.props.name}
      </ReactTooltip>
    );
  }

  render() {
    const {number, lockable, highlighted, includeArrow, onClick} = this.props;

    const highlightStyle = highlighted ? styles.highlight : {};
    return (
      <div
        style={{...styles.container, ...highlightStyle}}
        onClick={onClick}
        data-tip
        data-for={this.tooltipId()}
      >
        {this.renderTooltip()}
        {lockable ? <FontAwesome icon="lock" /> : number}
        {includeArrow && <LessonArrow />}
      </div>
    );
  }
}

const styles = {
  container: {
    ...progressStyles.flex,
    ...progressStyles.font,
    color: color.charcoal,
    ':hover': {
      cursor: 'pointer',
    },
    textAlign: 'center',
    height: '100%',
    padding: '0px 10px',
  },
  highlight: {
    backgroundColor: color.teal,
    color: color.white,
    fontSize: 18,
  },
  icon: {
    paddingRight: 5,
  },
};

export const unitTestExports = {
  LessonArrow,
};

export default Radium(ProgressTableLessonNumber);
