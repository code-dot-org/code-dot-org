import PropTypes from 'prop-types';
import React from 'react';

import RailsAuthenticityToken from '../../lib/util/RailsAuthenticityToken';
import color from '../../util/color';

const ctaButtonStyle = {
  background: color.orange,
  color: color.white,
  border: '1px solid #b07202',
  borderRadius: 3,
  boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.63)',
  fontSize: 14,
  padding: '8px 20px',
};

function ReauthorizeProviderButton({url, label}) {
  return (
    <form method="POST" action={url}>
      <RailsAuthenticityToken />
      <button type="submit" style={ctaButtonStyle}>
        {label}
      </button>
    </form>
  );
}

ReauthorizeProviderButton.propTypes = {
  url: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default ReauthorizeProviderButton;
