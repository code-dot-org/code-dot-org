import {detailTableStories} from '@cdo/apps/templates/sectionProgress/progressTables/sectionProgressTableStoryBuilder';

/**
 * Stories for the SummaryView and DetailView are identical other than the
 * actual component to render, so we build them using common code in
 * `sectionProgressTableStoryBuilder`.
 *
 * Note: there is a flag in that file to enable additional stories that is
 * disabled by default to prevent slowing down our test pipeline.
 */
export default storybook => {
  storybook
    .storiesOf('SectionProgress/DetailView', module)
    .addStoryTable(detailTableStories);
};
