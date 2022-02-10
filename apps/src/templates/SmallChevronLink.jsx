import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {TextLink} from '@dsco_/link';
import FontAwesome from './FontAwesome';
import {makeEnum} from '@cdo/apps/utils';

const ChevronSide = makeEnum('left', 'right');

export class SmallChevronLink extends Component {
  static propTypes = {
    linkText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired,
    chevronSide: PropTypes.oneOf(Object.values(ChevronSide))
  };

  render() {
    const {link, linkText, chevronSide, isRtl} = this.props;

    return (
      <div style={{margin: '10px 0'}}>
        <TextLink
          href={link}
          text={linkText}
          icon={
            <FontAwesome
              icon={chevronSide === 'left' ? 'chevron-left' : 'chevron-right'}
              className={isRtl && 'fa-flip-horizontal'}
            />
          }
          iconBefore={chevronSide === 'left'}
        />
      </div>
    );
  }
}

export default connect(state => ({
  isRtl: state.isRtl
}))(SmallChevronLink);
