import React, {Component} from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import LessonTip, {
  tipTypes
} from '@cdo/apps/templates/lessonOverview/activities/LessonTip';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import {tipShape} from '@cdo/apps/lib/levelbuilder/shapes';
import color from '@cdo/apps/util/color';

const styles = {
  tip: {
    maxWidth: 400,
    color: color.default_text
  }
};

export default class LessonTipIconWithTooltip extends Component {
  static propTypes = {
    tip: tipShape.isRequired,
    onClick: PropTypes.func
  };

  handleClick = () => {
    this.props.onClick(this.props.tip);
  };

  render() {
    const {tip} = this.props;
    const tooltipId = _.uniqueId();
    return (
      <span>
        <span data-tip data-for={tooltipId} aria-describedby={tooltipId}>
          <FontAwesome
            icon={tipTypes[tip.type].icon}
            style={{color: tipTypes[tip.type].color, padding: '2px'}}
            onClick={this.handleClick}
          />
        </span>
        <ReactTooltip
          id={tooltipId}
          role="tooltip"
          wrapper="span"
          effect="solid"
          disable={false}
        >
          <div style={styles.tip}>
            <LessonTip tip={tip} />
          </div>
        </ReactTooltip>
      </span>
    );
  }
}
