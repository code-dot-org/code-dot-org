import React, {Component} from 'react';

import TwoColumnActionBlock from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import i18n from '@cdo/locale';

import HeaderBanner from '../HeaderBanner';

class Incubator extends Component {
  render() {
    return (
      <div>
        <HeaderBanner
          headingText="Incubator"
          subHeadingText="Try something new"
          backgroundUrl="/shared/images/banners/banner-incubator.png"
          imageUrl="/shared/images/banners/banner-incubator-image.png"
          imgStyling={{maxHeight: '160px'}}
        />
        <div className="main" style={{maxWidth: 970, margin: '0 auto'}}>
          <div style={{margin: '40px 0'}}>
            <p>
              The Incubator is where you get to try out some of the latest ideas
              from inside Code.org.
            </p>
            <p>
              <strong>
                These are "works in progress", so some things are a bit
                different. Things change regularly, you might find things that
                need fixing, progress isn't always saved, and they might go away
                again.
              </strong>
            </p>
            <p>
              By using the Incubator, you can help us shape the future of
              computer science education. We would love to hear what you think.
            </p>
          </div>

          <TwoColumnActionBlock
            imageUrl="/shared/images/teacher-announcement/incubator-musiclab-keyboard.png"
            subHeading={i18n.incubator_keyboard_nav_title()}
            description={i18n.incubator_keyboard_nav_desc()}
            marginBottom="20px"
            buttons={[
              {
                url: '/courses/music-keyboard-accessibility/units/1/lessons/1/levels/1',
                text: i18n.incubator_keyboard_nav_button(),
              },
            ]}
          />
        </div>
      </div>
    );
  }
}

export default Incubator;
