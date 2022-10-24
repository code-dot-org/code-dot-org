import React, {Component} from 'react';
import HeaderBanner from '../HeaderBanner';
import {TwoColumnActionBlock} from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import color from '@cdo/apps/util/color';

class Incubator extends Component {
  render() {
    return (
      <div>
        <HeaderBanner
          headingText="Incubator"
          subHeadingText="Try an experiment!"
          backgroundUrl="/shared/images/banners/banner_default.jpg"
          short={true}
        />
        <div className="main" style={{maxWidth: 970, margin: '0 auto'}}>
          <div style={{margin: '40px 0'}}>
            <p>
              At Code.org, we’re always trying new ways to make cool things with
              computer science.
            </p>
            <p>
              Code.org Incubator is where we try out new ideas. These are
              experiments so{' '}
              <strong>
                they could go away at any time, your work could get lost, and
                there may be bugs
              </strong>
              !
            </p>
            <p>Still want to explore? Try out a project!</p>
          </div>

          <TwoColumnActionBlock
            imageUrl={
              '/shared/images/teacher-announcement/incubator-musiclab-color.png'
            }
            subHeading={'Music Lab'}
            description={
              'Make music with code! Try mixing and matching beats, bass, and other sounds to make your own songs.'
            }
            buttons={[
              {
                url: '/musiclab',
                text: 'Try it out!'
              }
            ]}
            backgroundColor={color.purple}
          />
        </div>
      </div>
    );
  }
}

export default Incubator;
