import {nanoid} from 'nanoid';

export function getBreakpoints() {
  return [
    {
      id: 'desktop',
      query: '*',
      displayIcon: 'desktop',
      displayName: 'All Sizes',
      previewSize: '100%',
    },
    {
      id: 'tablet',
      query: '<992px',
      displayIcon: 'tablet',
      displayName: 'Tablet',
      previewSize: '820px',
    },
    {
      id: 'mobile',
      query: '<576px',
      displayIcon: 'mobile',
      displayName: 'Mobile',
      previewSize: '390px',
    },
  ];
}

export function createContentfulSectionWrapper({
  name,
  children,
}: {
  name: string;
  children: any;
}) {
  return {
    displayName: name,
    definitionId: 'contentful-section',
    patternProperties: {},
    variables: {},
    children: [createDscoSectionWrapper({name, children})],
  };
}

export function createDscoSectionWrapper({
  name,
  children,
}: {
  name: string;
  children: any;
}) {
  return {
    displayName: name,
    definitionId: 'section',
    patternProperties: {},
    variables: {
      background: {
        type: 'DesignValue',
        valuesByBreakpoint: {
          desktop: 'primary',
        },
      },
      padding: {
        type: 'DesignValue',
        valuesByBreakpoint: {
          desktop: 'l',
        },
      },
      cfVisibility: {
        type: 'DesignValue',
        valuesByBreakpoint: {
          desktop: true,
        },
      },
    },
    children,
  };
}

export function createUnboundValue(value: string) {
  const id = nanoid();

  return {
    id,
    unboundValue: {
      [id]: {
        value,
      },
    },
  };
}

export function createUnboundChild(id: string) {
  return {
    key: id,
    type: 'UnboundValue',
  };
}

export function createSectionHeading(heading: string) {
  const headingUnboundValue = createUnboundValue(heading);

  return {
    children: {
      displayName: 'Heading',
      definitionId: 'heading',
      patternProperties: {},
      variables: {
        visualAppearance: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: 'heading-xxl',
          },
        },
        children: createUnboundChild(headingUnboundValue.id),
      },
      children: [],
    },
    unboundValues: [headingUnboundValue],
  };
}
