/**
 * This file is used to register custom react components for usage in Contentful Studio Experiences.
 *
 * Note: This file must be imported both server-side and client-side to ensure Contentful is able to map on both rendering modes.
 */
import {defineComponents} from '@contentful/experiences-sdk-react';
import {Button} from '@mantine/core';

import {ButtonContentfulComponentDefinition} from '@/components/contentful/button';
import {HeroImageBackground} from '@/components/mantine/Hero';
import {HeroBannerContentfulComponentDefinition} from '@/components/contentful/heroBanner';

defineComponents(
  [
    {component: Button, definition: ButtonContentfulComponentDefinition},
    {
      component: HeroImageBackground,
      definition: HeroBannerContentfulComponentDefinition,
      options: {
        wrapContainerWidth: '100%',
      },
    },
  ],
  {
    enabledBuiltInComponents: [],
  },
);
