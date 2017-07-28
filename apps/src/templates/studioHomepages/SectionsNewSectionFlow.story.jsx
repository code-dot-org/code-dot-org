import storyTable from "./SectionsStoryTable";

export default storybook => {
  return storybook
    .storiesOf('SectionsNewSectionFlow', module)
    .withExperiments('section-flow-2017')
    .addStoryTable(storyTable);
};
