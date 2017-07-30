import storyTable from './SectionsStoryTable';

export default storybook => storybook
  .storiesOf('Sections', module)
  .addStoryTable(storyTable);
