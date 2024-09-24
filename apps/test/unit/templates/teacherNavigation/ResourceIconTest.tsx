import {render, screen} from '@testing-library/react';
import React from 'react';

import ResourceIcon from '@cdo/apps/templates/teacherNavigation/ResourceIcon';
import {RESOURCE_TYPE} from '@cdo/apps/templates/teacherNavigation/ResourceIconType';

describe('ResourceIcon', () => {
  const googleSlidesUrl =
    'https://docs.google.com/presentation/d/randomCode/view';
  const googleDocsUrl = 'https://docs.google.com/document/d/randomCode/view';
  const nonGoogleResourceUrl = 'https://code.org';

  it('renders the icon for a slides resource correctly', () => {
    render(
      <ResourceIcon resourceType={'Slides'} resourceUrl={googleSlidesUrl} />
    );
    screen.getByTestId('font-awesome-v6-icon');
    screen.getByTestId('resource-icon-' + RESOURCE_TYPE.SLIDES.icon);
  });

  it('renders the icon for a google doc resource correctly', () => {
    render(
      <ResourceIcon resourceType={'Handout'} resourceUrl={googleDocsUrl} />
    );
    screen.getByTestId('font-awesome-v6-icon');
    screen.getByTestId('resource-icon-' + RESOURCE_TYPE.GOOGLE_DOC.icon);
  });

  it('renders the icon for a video resource correctly', () => {
    render(
      <ResourceIcon resourceType={'Video'} resourceUrl={nonGoogleResourceUrl} />
    );
    screen.getByTestId('font-awesome-v6-icon');
    screen.getByTestId('resource-icon-' + RESOURCE_TYPE.VIDEO.icon);
  });

  it('renders the icon for a lesson plan resource correctly', () => {
    render(
      <ResourceIcon
        resourceType={'Lesson Plan'}
        resourceUrl={nonGoogleResourceUrl}
      />
    );
    screen.getByTestId('font-awesome-v6-icon');
    screen.getByTestId('resource-icon-' + RESOURCE_TYPE.LESSON_PLAN.icon);
  });

  it('renders the icon for a non-google doc, non-lesson-plan, non-video resource correctly', () => {
    render(
      <ResourceIcon
        resourceType={'Exemplar'}
        resourceUrl={nonGoogleResourceUrl}
      />
    );
    screen.getByTestId('font-awesome-v6-icon');
    screen.getByTestId('resource-icon-' + RESOURCE_TYPE.LINK.icon);
  });
});
