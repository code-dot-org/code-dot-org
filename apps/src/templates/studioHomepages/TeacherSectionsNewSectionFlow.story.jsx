import {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import storyTable from "./TeacherSectionsStoryTable";

export default storybook => storybook
  .storiesOf('TeacherSectionsNewSectionFlow', module)
  .withExperiments(SECTION_FLOW_2017)
  .addStoryTable(storyTable);
