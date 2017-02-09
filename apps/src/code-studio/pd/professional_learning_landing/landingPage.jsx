/**
 * Teacher Landing Page
 */

import React from 'react';
import CsFundamentalsSection from './csFundamentalsSection';
import CsPrinciplesAndDiscoveriesSection from './csPrinciplesAndDiscoveriesSection';


const LandingPage = React.createClass({
  propTypes: {
    coursesTaught: React.PropTypes.arrayOf(React.PropTypes.string)
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
        {
          this.props.coursesTaught.includes('CS Fundamentals') && (
            <CsFundamentalsSection/>
          )
        }
        {
          (this.props.coursesTaught.includes('CS Principles') || this.props.coursesTaught.includes('CS Discoveries')) && (
            <CsPrinciplesAndDiscoveriesSection/>
          )
        }
      </div>
    );
  }
});

export default LandingPage;
