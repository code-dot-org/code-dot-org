import storyTable from './SectionsStoryTable';

export default storybook => {
  return storybook
    .storiesOf('Sections', module)
    .addStoryTable(storyTable);
};
