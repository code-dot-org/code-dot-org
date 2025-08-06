import Section from '@/components/contentful/section';

const SectionDecorator = (Story, context) => {
  console.log('SectionDecorator parameters:', context);
  return (
    <Section background={context.globals.sectionBackground}>
      <Story />
    </Section>
  );
};

export default SectionDecorator;
