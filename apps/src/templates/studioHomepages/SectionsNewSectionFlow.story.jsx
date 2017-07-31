import {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import storyTable from "./SectionsStoryTable";

export default storybook => storybook
  .storiesOf('SectionsNewSectionFlow', module)
  .withExperiments(SECTION_FLOW_2017)
  .addStoryTable(storyTable);
