import Section from '@/components/contentful/section';
import {StoryContext, StoryFn} from '@storybook/nextjs-vite';

const SectionDecorator = (Story: StoryFn, context: StoryContext) => {
  if (context.parameters.disableSectionDecorator) {
    return <Story />;
  }

  return (
    <Section background={context.globals.sectionBackground}>
      <Story />
    </Section>
  );
};

export default SectionDecorator;
