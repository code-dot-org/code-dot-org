import React, {Component} from 'react';

import Button from '@cdo/apps/templates/Button';
import TwoColumnActionBlock from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';

import HeaderBanner from '../HeaderBanner';
import i18n from '@cdo/locale';

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
            imageUrl="/shared/images/teacher-announcement/incubator-canvas-integration.png"
            subHeading={i18n.incubator_canvasIntegration_earlyAccess_title()}
            description={i18n.incubator_canvasIntegration_earlyAccess_desc()}
            marginBottom="20px"
            buttons={[
              {
                url: 'https://forms.gle/x7EBBiC18yJysb5D7',
                text: i18n.incubator_canvasIntegration_earlyAccess_signIn_button(),
                target: '_blank',
              },
              {
                url: '#',
                text: i18n.incubator_canvasIntegration_earlyAccess_viewDemo_button(),
                color: Button.ButtonColor.neutralDark,
              },
            ]}
          />

          <TwoColumnActionBlock
            imageUrl={
              '/shared/images/teacher-announcement/incubator-projectbeats.png'
            }
            subHeading={'Project Beats'}
            description={
              'Make music with code! Try mixing and matching beats, bass, and other sounds to make your own songs.'
            }
            buttons={[
              {
                url: '/s/music-intro-2024/reset',
                text: 'Get Started',
                extraText:
                  'Learn how to use Project Beats in a step by step intro.',
              },
              {
                url: '/projects/music/new',
                text: 'Make Music',
                extraText: 'Skip directly to creating a Project Beats project.',
                color: Button.ButtonColor.neutralDark,
              },
            ]}
          />
        </div>
      </div>
    );
  }
}

export default Incubator;
