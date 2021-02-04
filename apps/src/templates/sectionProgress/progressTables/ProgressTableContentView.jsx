import React from 'react';
import * as Table from 'reactabular-table';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import PropTypes from 'prop-types';
import {studentLevelProgressType} from '@cdo/apps/templates/progress/progressTypes';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {scriptDataPropType, scrollbarWidth} from '../sectionProgressConstants';
import {stageIsAllAssessment} from '@cdo/apps/templates/progress/progressHelpers';
import progressTableStyles from './progressTableStyles.scss';
import ProgressTableLessonNumber from './ProgressTableLessonNumber';

// Extra header column to account for scrollbar in progress tables
const gutterHeader = {
  header: {props: {style: {width: scrollbarWidth, minWidth: scrollbarWidth}}}
};

const styles = {
  headerContainer: {
    height: '100%'
  }
};

export default class ProgressTableContentView extends React.Component {
  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    levelProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLevelProgressType)
    ).isRequired,
    onClickLesson: PropTypes.func.isRequired,
    columnWidths: PropTypes.arrayOf(PropTypes.number).isRequired,
    lessonCellFormatter: PropTypes.func.isRequired,
    extraHeaderFormatters: PropTypes.arrayOf(PropTypes.func),
    needsGutter: PropTypes.bool.isRequired,
    onScroll: PropTypes.func.isRequired,
    includeHeaderArrows: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.lessonNumberFormatter = this.lessonNumberFormatter.bind(this);
    this.contentCellFormatter = this.contentCellFormatter.bind(this);
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

  lessonNumberFormatter(_, {columnIndex}) {
    const lesson = this.props.scriptData.stages[columnIndex];
    const includeArrow =
      this.props.includeHeaderArrows &&
      (lesson.levels.length > 1 || lesson.levels[0].isUnplugged);
    return (
      <div
        style={styles.headerContainer}
        ref={r => (this.lessonRefs[lesson.position] = r)}
      >
        <ProgressTableLessonNumber
          name={lesson.name}
          number={lesson.relative_position}
          lockable={lesson.lockable}
          highlighted={lesson.position === this.props.lessonOfInterest}
          onClick={() => this.props.onClickLesson(lesson.position)}
          isAssessment={stageIsAllAssessment(lesson.levels)}
          includeArrow={includeArrow}
        />
      </div>
    );
  }

  contentCellFormatter(_, {rowData, columnIndex}) {
    const {scriptData, levelProgressByStudent} = this.props;
    return this.props.lessonCellFormatter(
      scriptData.stages[columnIndex],
      rowData,
      levelProgressByStudent[rowData.id]
    );
  }

  render() {
    const {columnWidths, extraHeaderFormatters} = this.props;
    let headerFormatters = [
      this.lessonNumberFormatter,
      ...(extraHeaderFormatters || [])
    ];
    let headerRows = headerFormatters.map(_ => []);
    const columns = [];

    this.props.scriptData.stages.forEach((_, index) => {
      const widthProps = {
        style: {minWidth: columnWidths[index], maxWidth: columnWidths[index]}
      };
      columns.push({
        props: widthProps,
        cell: {formatters: [this.contentCellFormatter]}
      });
      headerRows.forEach((headerRow, headerIndex) => {
        headerRow.push({
          header: {
            props: widthProps,
            formatters: [headerFormatters[headerIndex]]
          }
        });
      });
    });

    // Account for scrollbar in table body
    if (this.props.needsGutter) {
      headerRows.forEach(headerRow => headerRow.push(gutterHeader));
    }
    const rows = [...this.props.section.students];

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
          headerRows={headerRows}
        />
        <Virtualized.Body
          rows={rows}
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
