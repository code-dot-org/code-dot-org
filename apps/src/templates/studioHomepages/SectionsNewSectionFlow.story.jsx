import storyTable from "./SectionsStoryTable";

export default storybook => storybook
  .storiesOf('SectionsNewSectionFlow', module)
  .withExperiments('section-flow-2017')
  .addStoryTable(storyTable);
