import {TextLink} from '@dsco_/link';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import FontAwesome from '../legacySharedComponents/FontAwesome';

export function SmallChevronLink({
  href,
  text,
  iconBefore = false,
  isRtl = false,
  style = {margin: '10px 0'},
}) {
  return (
    <div style={style}>
      <TextLink
        href={href}
        text={text}
        icon={
          <FontAwesome
            icon={iconBefore ? 'chevron-left' : 'chevron-right'}
            className={isRtl ? 'fa-flip-horizontal' : undefined}
            aria-label={text}
          />
        }
        iconBefore={iconBefore}
      />
    </div>
  );
}

SmallChevronLink.propTypes = {
  text: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  iconBefore: PropTypes.bool,
  style: PropTypes.object,

  // Provided by redux
  isRtl: PropTypes.bool,
};

export default connect(state => ({
  isRtl: state.isRtl,
}))(SmallChevronLink);
