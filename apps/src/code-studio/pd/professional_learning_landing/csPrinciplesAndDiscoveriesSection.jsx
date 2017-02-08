/** Section for CS Principles and CS Discoveries */

import React from 'react';
import {TwoPartBanner, imageStyle, textStyle, leftStyle, rightStyle} from './twoPartBanner'

const CsPrinciplesAndDiscoveriesSection = React.createClass({
  propTypes: {
    lastWorkshopSurveyUrl: React.PropTypes.string
  },

  render() {
    // const leftHalfStyle = Object.assign({}, imageStyle)
    // console.log(leftHalfStyle);

    return (
      <div>
        <br/>
        <TwoPartBanner
          leftHalf={(
            <div style={Object.assign({}, imageStyle, leftStyle, {
              backgroundImage: `url('https://code.org/images/email/BJC4NYC.jpg')`,
            })}/>
          )}
          rightHalf={(
           <div style={Object.assign({}, textStyle, rightStyle, {})}>
             <div style={{marginTop: '20px'}}>
               Hey more text
             </div>
           </div>
          )}
        />
      </div>
    );
  }
});

export default CsPrinciplesAndDiscoveriesSection;
