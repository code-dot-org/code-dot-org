import React, {Component} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
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
            imageUrl="/shared/images/teacher-announcement/incubator-codebridge-python.png"
            subHeading={i18n.incubator_codebridge_python_title()}
            description={<span>{i18n.incubator_codebridge_python_desc()}</span>}
            marginBottom="20px"
            buttons={[
              {
                url: '/s/codebridge-ascii/reset',
                text: i18n.incubator_codebridge_python_ascii_button(),
              },
              {
                url: '/projects/pythonlab/new',
                text: i18n.incubator_codebridge_python_project_button(),
                color: Button.ButtonColor.neutralDark,
              },
            ]}
          />
          <TwoColumnActionBlock
            imageUrl="shared/images/teacher-announcement/incubator-genai-graphic.png"
            subHeading={i18n.incubator_genai_title()}
            description={<span>{i18n.incubator_genai_desc()}</span>}
            marginBottom="20px"
            buttons={[
              {
                url: '/courses/exploring-gen-ai-2024',
                text: i18n.incubator_genai_course_button(),
              },
              {
                url: pegasus('/curriculum/generative-ai'),
                text: i18n.incubator_genai_marketing_button(),
              },
            ]}
          />
        </div>
      </div>
    );
  }
}

export default Incubator;
