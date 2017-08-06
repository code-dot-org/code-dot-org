import storyTable from "./TeacherSectionsStoryTable";

export default storybook => storybook
  .storiesOf('TeacherSections', module)
  .addStoryTable(storyTable);
