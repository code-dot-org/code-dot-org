import React from 'react';
import * as Table from 'reactabular-table';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import PropTypes from 'prop-types';
import {scriptDataPropType, gutterHeader} from '../sectionProgressConstants';
import {studentLevelProgressType} from '@cdo/apps/templates/progress/progressTypes';
import {stageIsAllAssessment} from '@cdo/apps/templates/progress/progressHelpers';
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
  }

  header = null;
  body = null;
  bodyComponent = null;
  lessonRefs = {};

  componentDidMount() {
    this.scrollToSelectedLesson();
  }

  componentDidUpdate() {
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
    const levels = stageData.levels;
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

  detailCellFormatter(_, {rowData, columnIndex}) {
    const {levelProgressByStudent, scriptData} = this.props;
    const stageLevels = scriptData.stages[columnIndex].levels;
    return (
      <ProgressTableDetailCell
        studentId={rowData.id}
        sectionId={this.props.section.id}
        stageExtrasEnabled={this.props.section.stageExtras}
        levels={stageLevels}
        studentProgress={levelProgressByStudent[rowData.id]}
      />
    );
  }

  render() {
    const lessonHeaders = [];
    const levelHeaders = [];
    const columns = [];
    this.props.scriptData.stages.forEach((stage, index) => {
      const width = ProgressTableDetailCell.widthForLevels(stage.levels);
      const widthProps = {style: {minWidth: width, maxWidth: width}};
      columns.push({
        props: widthProps,
        cell: {formatters: [this.detailCellFormatter]}
      });
      lessonHeaders.push({
        header: {props: widthProps, formatters: [this.lessonNumberFormatter]}
      });
      levelHeaders.push({
        header: {props: widthProps, formatters: [this.levelIconFormatter]}
      });
    });

    // Account for scrollbar in table body
    if (this.needsGutter()) {
      lessonHeaders.push(gutterHeader);
      levelHeaders.push(gutterHeader);
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
