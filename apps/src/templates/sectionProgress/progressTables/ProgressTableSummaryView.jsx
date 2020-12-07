import React from 'react';
import * as Table from 'reactabular-table';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import PropTypes from 'prop-types';
import {scriptDataPropType, gutterHeader} from '../sectionProgressConstants';
import {studentLevelProgressType} from '@cdo/apps/templates/progress/progressTypes';
import {
  summarizeProgressInStage,
  stageIsAllAssessment
} from '@cdo/apps/templates/progress/progressHelpers';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import ProgressTableSummaryCell from './ProgressTableSummaryCell';
import ProgressTableLessonNumber from './ProgressTableLessonNumber';
import progressTableStyles from './progressTableStyles.scss';

export default class ProgressTableSummaryView extends React.Component {
  static widthForScript(scriptData) {
    return (
      scriptData.stages.length * parseInt(progressTableStyles.MIN_COLUMN_WIDTH)
    );
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
    this.header = null;
    this.body = null;
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
      <ProgressTableLessonNumber
        name={stageData.name}
        number={stageData.relative_position}
        lockable={stageData.lockable}
        highlighted={stageData.position === this.props.lessonOfInterest}
        onClick={() => this.props.onClickLesson(stageData.position)}
        isAssessment={stageIsAllAssessment(stageData.levels)}
      />
    );
  }

  progressCellFormatter(_, {rowData, columnIndex}) {
    const stageData = this.props.scriptData.stages[columnIndex];
    const statusCounts = summarizeProgressInStage(
      this.props.levelProgressByStudent[rowData.id],
      stageData.levels
    );
    const assessmentStage = stageIsAllAssessment(stageData.levels);
    return (
      <ProgressTableSummaryCell
        studentId={rowData.id}
        statusCounts={statusCounts}
        assessmentStage={assessmentStage}
        onSelectDetailView={() => this.props.onClickLesson(stageData.position)}
      />
    );
  }

  render() {
    const columnWidth =
      progressTableStyles.CONTENT_VIEW_WIDTH /
      this.props.scriptData.stages.length;

    const columns = [];
    const headers = [];
    this.props.scriptData.stages.forEach(_ => {
      columns.push({
        props: {style: {width: columnWidth}},
        cell: {formatters: [this.progressCellFormatter]}
      });
      headers.push({
        header: {
          props: {style: {width: columnWidth}},
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
        className="summary-view"
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
          ref={r => (this.body = r && r.getRef())}
          tableHeader={this.header}
        />
      </Table.Provider>
    );
  }
}
