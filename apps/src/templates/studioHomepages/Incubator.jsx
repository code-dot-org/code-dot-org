import React, {Component} from 'react';

import DCDO from '@cdo/apps/dcdo';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import Button from '@cdo/apps/templates/Button';
import TwoColumnActionBlock from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import {LmsLinks} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';

import HeaderBanner from '../HeaderBanner';

class Incubator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      canvasBlockEnabled: DCDO.get('incubator-canvas-block-enabled', true),
      currentUser: getStore().getState().currentUser,
    };
  }

  reportEvent(eventName, platform = PLATFORMS.STATSIG) {
    analyticsReporter.sendEvent(
      eventName,
      {
        userRoleInCourse: this.state.currentUser.userRoleInCourse,
      },
      platform
    );
  }

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

          {this.state.canvasBlockEnabled && (
            <TwoColumnActionBlock
              imageUrl="/shared/images/teacher-announcement/incubator-canvas-integration.png"
              subHeading={i18n.incubator_canvasIntegration_earlyAccess_title()}
              description={i18n.incubator_canvasIntegration_earlyAccess_desc()}
              marginBottom="20px"
              buttons={[
                {
                  url: 'https://forms.gle/x7EBBiC18yJysb5D7',
                  text: i18n.incubator_canvasIntegration_earlyAccess_signUp_button(),
                  target: '_blank',
                  onClick: () => {
                    this.reportEvent(EVENTS.LTI_INCUBATOR_SIGNUP_CLICK);
                  },
                },
                {
                  url: LmsLinks.INSTALL_GUIDE_FOR_CANVAS_URL,
                  text: i18n.incubator_canvasIntegration_earlyAccess_guides_button(),
                  color: Button.ButtonColor.neutralDark,
                  target: '_blank',
                  onClick: () => {
                    this.reportEvent(EVENTS.LTI_INCUBATOR_GUIDES_CLICK);
                  },
                },
              ]}
            />
          )}

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
