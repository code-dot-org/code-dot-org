/**
 * Teacher Landing Page
 */

import React from 'react';

const LandingPage = React.createClass({
  propTypes: {

  },

  renderHeaderImage() {
    return (
      <div
        style={{
          width: '100%',
          height: '400px',
          background: `url(https://code.org/images/homepage/sheryl.jpg) no-repeat`,
          backgroundSize: 'cover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, .5)',
            alignSelf: 'flex-end',
            width: '100%',
            textAlign: 'center',
            padding: '30px',
            fontSize: '40px',
            color: 'white'
          }}
        >
          My Professional Learning
        </div>
      </div>
    );
  },

  render() {
    return (
      <div>
        {this.renderHeaderImage()}
      </div>
    );
  }
});

export default LandingPage;
