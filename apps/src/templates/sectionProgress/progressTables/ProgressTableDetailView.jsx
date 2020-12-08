import React from 'react';
import * as Table from 'reactabular-table';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import PropTypes from 'prop-types';
import {scriptDataPropType, gutterHeader} from '../sectionProgressConstants';
import {studentLevelProgressType} from '@cdo/apps/templates/progress/progressTypes';
import {
  levelProgressWithStatus,
  stageIsAllAssessment
} from '@cdo/apps/templates/progress/progressHelpers';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import ProgressTableDetailCell from './ProgressTableDetailCell';
import ProgressTableLessonNumber from './ProgressTableLessonNumber';
import ProgressTableLevelIcon from './ProgressTableLevelIcon';
import progressTableStyles from './progressTableStyles.scss';

const styles = {
  headerContainer: {
    height: '100%'
  }
};

export default class ProgressTableDetailView extends React.Component {
  static widthForScript(scriptData) {
    return scriptData.stages.reduce((stageSum, stage) => {
      return stageSum + ProgressTableDetailCell.widthForLevels(stage.levels);
    }, 0);
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
    this.levelIconFormatter = this.levelIconFormatter.bind(this);
    this.detailCellFormatter = this.detailCellFormatter.bind(this);
    this.renderDetailCell = this.renderDetailCell.bind(this);
    this.onLessonClick = this.onLessonClick.bind(this);
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

  onLessonClick(lessonPosition) {
    this.props.onClickLesson(lessonPosition);
  }

  lessonNumberFormatter(_, {columnIndex}) {
    const stageData = this.props.scriptData.stages[columnIndex];
    const levels = stageData.levels;
    return (
      <div style={styles.headerContainer}>
        <ProgressTableLessonNumber
          name={stageData.name}
          number={stageData.relative_position}
          lockable={stageData.lockable}
          highlighted={stageData.position === this.props.lessonOfInterest}
          onClick={() => this.onLessonClick(stageData.position)}
          includeArrow={levels.length > 1}
          isAssessment={stageIsAllAssessment(levels)}
        />
      </div>
    );
  }

  levelIconFormatter(_, {columnIndex}) {
    return (
      <ProgressTableLevelIcon
        levels={this.props.scriptData.stages[columnIndex].levels}
      />
    );
  }

  dummyProgressForLevels(levels) {
    const progress = {};
    levels.forEach(level => {
      progress[level.id] = levelProgressWithStatus();
    });
    return progress;
  }

  renderDetailCell(student, levels, progress) {
    return (
      <ProgressTableDetailCell
        studentId={student.id}
        sectionId={this.props.section.id}
        stageExtrasEnabled={this.props.section.stageExtras}
        levels={levels}
        studentProgress={progress}
      />
    );
  }

  detailCellFormatter(_, {rowData, columnIndex}) {
    const {levelProgressByStudent, scriptData} = this.props;
    const stageLevels = scriptData.stages[columnIndex].levels;
    return this.renderDetailCell(
      rowData,
      stageLevels,
      levelProgressByStudent[rowData.id]
    );
  }

  render() {
    const lessonHeaders = [];
    const levelHeaders = [];
    const columns = [];
    this.props.scriptData.stages.forEach((stage, index) => {
      columns.push({cell: {formatters: [this.detailCellFormatter]}});
      lessonHeaders.push({
        header: {
          props: {
            // Our top header needs explicit width
            style: {
              minWidth: ProgressTableDetailCell.widthForLevels(stage.levels)
            }
          },
          formatters: [this.lessonNumberFormatter]
        }
      });
      levelHeaders.push({
        header: {formatters: [this.levelIconFormatter]}
      });
    });

    // Account for scrollbar in table body
    if (this.needsGutter) {
      lessonHeaders.push(gutterHeader);
      levelHeaders.push(gutterHeader);
    }

    return (
      <Table.Provider
        className="detail-view"
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
          headerRows={[lessonHeaders, levelHeaders]}
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
