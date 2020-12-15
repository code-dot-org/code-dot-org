import React from 'react';
import * as Table from 'reactabular-table';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import PropTypes from 'prop-types';
import {scriptDataPropType, gutterHeader} from '../sectionProgressConstants';
import {studentLevelProgressType} from '@cdo/apps/templates/progress/progressTypes';
import {
  statusPercentsForLevels,
  stageIsAllAssessment
} from '@cdo/apps/templates/progress/progressHelpers';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import ProgressTableSummaryCell from './ProgressTableSummaryCell';
import ProgressTableLessonNumber from './ProgressTableLessonNumber';
import progressTableStyles from './progressTableStyles.scss';

const MIN_COLUMN_WIDTH = 40;

const styles = {
  headerContainer: {
    height: '100%'
  }
};
export default class ProgressTableSummaryView extends React.Component {
  static widthForScript(scriptData) {
    return scriptData.stages.length * MIN_COLUMN_WIDTH;
  }

  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    levelProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLevelProgressType)
    ).isRequired,
    onScroll: PropTypes.func.isRequired,
    onClickLesson: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.lessonNumberFormatter = this.lessonNumberFormatter.bind(this);
    this.progressCellFormatter = this.progressCellFormatter.bind(this);
  }

  header = null;
  body = null;
  bodyComponent = null;
  lessonRefs = {};

  componentDidMount() {
    this.scrollToSelectedLesson();
  }

  scrollToSelectedLesson() {
    const lesson = this.lessonRefs[this.props.lessonOfInterest];
    const scrollPosition = lesson.parentNode.offsetLeft;
    this.header.scrollLeft = scrollPosition;
    this.body.scrollLeft = scrollPosition;
  }

  needsGutter() {
    return (
      this.props.section.students.length *
        parseInt(progressTableStyles.ROW_HEIGHT) >
      parseInt(progressTableStyles.MAX_BODY_HEIGHT)
    );
  }

  lessonNumberFormatter(_, {columnIndex}) {
    const stageData = this.props.scriptData.stages[columnIndex];
    return (
      <div
        style={styles.headerContainer}
        ref={r => (this.lessonRefs[stageData.position] = r)}
      >
        <ProgressTableLessonNumber
          name={stageData.name}
          number={stageData.relative_position}
          lockable={stageData.lockable}
          highlighted={stageData.position === this.props.lessonOfInterest}
          onClick={() => this.props.onClickLesson(stageData.position)}
          isAssessment={stageIsAllAssessment(stageData.levels)}
        />
      </div>
    );
  }

  progressCellFormatter(_, {rowData, columnIndex}) {
    const stageData = this.props.scriptData.stages[columnIndex];
    const statusPercents = statusPercentsForLevels(
      this.props.levelProgressByStudent[rowData.id],
      stageData.levels
    );
    const assessmentStage = stageIsAllAssessment(stageData.levels);
    return (
      <ProgressTableSummaryCell
        studentId={rowData.id}
        statusPercents={statusPercents}
        assessmentStage={assessmentStage}
        onSelectDetailView={() => this.props.onClickLesson(stageData.position)}
      />
    );
  }

  render() {
    const width = Math.max(
      MIN_COLUMN_WIDTH,
      progressTableStyles.CONTENT_VIEW_WIDTH /
        this.props.scriptData.stages.length
    );
    const widthProps = {style: {minWidth: width, maxWidth: width}};

    const columns = [];
    const headers = [];
    this.props.scriptData.stages.forEach(_ => {
      columns.push({
        props: widthProps,
        cell: {formatters: [this.progressCellFormatter]}
      });
      headers.push({
        header: {
          props: widthProps,
          formatters: [this.lessonNumberFormatter]
        }
      });
    });

    // Account for scrollbar in table body
    if (this.needsGutter()) {
      headers.push(gutterHeader);
    }

    return (
      <Table.Provider
        renderers={{
          body: {
            wrapper: Virtualized.BodyWrapper,
            row: Virtualized.BodyRow
          }
        }}
        columns={columns}
      >
        <Sticky.Header
          style={{overflow: 'hidden'}}
          ref={r => (this.header = r && r.getRef())}
          tableBody={this.body}
          headerRows={[headers]}
        />
        <Virtualized.Body
          rows={this.props.section.students}
          rowKey={'id'}
          onScroll={this.props.onScroll}
          style={{
            overflow: 'auto',
            maxHeight: parseInt(progressTableStyles.MAX_BODY_HEIGHT)
          }}
          ref={r => {
            this.body = r && r.getRef();
            this.bodyComponent = r;
          }}
          tableHeader={this.header}
        />
      </Table.Provider>
    );
  }
}
