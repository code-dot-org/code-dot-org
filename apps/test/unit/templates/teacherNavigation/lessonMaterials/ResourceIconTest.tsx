import {render, screen} from '@testing-library/react';
import React from 'react';

import ResourceIcon from '@cdo/apps/templates/teacherNavigation/lessonMaterials/ResourceIcon';
import {RESOURCE_ICONS} from '@cdo/apps/templates/teacherNavigation/lessonMaterials/ResourceIconType';

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
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.SLIDES.icon);
  });

  it('renders the icon for a google doc resource correctly', () => {
    render(
      <ResourceIcon resourceType={'Handout'} resourceUrl={googleDocsUrl} />
    );
    screen.getByTestId('font-awesome-v6-icon');
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.GOOGLE_DOC.icon);
  });

  it('renders the icon for a video resource correctly', () => {
    render(
      <ResourceIcon resourceType={'Video'} resourceUrl={nonGoogleResourceUrl} />
    );
    screen.getByTestId('font-awesome-v6-icon');
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.VIDEO.icon);
  });

  it('renders the icon for a lesson plan resource correctly', () => {
    render(
      <ResourceIcon
        resourceType={'Lesson Plan'}
        resourceUrl={nonGoogleResourceUrl}
      />
    );
    screen.getByTestId('font-awesome-v6-icon');
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.LESSON_PLAN.icon);
  });

  it('renders the icon for a non-google doc, non-lesson-plan, non-video resource correctly', () => {
    render(
      <ResourceIcon
        resourceType={'Exemplar'}
        resourceUrl={nonGoogleResourceUrl}
      />
    );
    screen.getByTestId('font-awesome-v6-icon');
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.LINK.icon);
  });
});
