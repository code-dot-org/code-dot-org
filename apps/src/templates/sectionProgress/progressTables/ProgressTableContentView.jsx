import React from 'react';
import * as Table from 'reactabular-table';
import * as Sticky from 'reactabular-sticky';
import * as Virtualized from 'reactabular-virtualized';
import PropTypes from 'prop-types';
import {
  scriptDataPropType,
  studentTableRowType,
  scrollbarWidth
} from '../sectionProgressConstants';
import {
  lessonIsAllAssessment,
  lessonHasLevels
} from '@cdo/apps/templates/progress/progressHelpers';
import css from '@cdo/apps/templates/progress/styles.scss';
import ProgressTableLessonNumber from './ProgressTableLessonNumber';

// Extra header column to account for scrollbar in progress tables
const gutterHeader = {
  header: {props: {style: {width: scrollbarWidth, minWidth: scrollbarWidth}}}
};

// This class contains contains code that is common between the summary view
// and detail view of the progress table. Each view has different cell formatters
// which are passed in through props.
export default class ProgressTableContentView extends React.Component {
  static propTypes = {
    rows: PropTypes.arrayOf(studentTableRowType).isRequired,
    onRow: PropTypes.func.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    onClickLesson: PropTypes.func.isRequired,
    columnWidths: PropTypes.arrayOf(PropTypes.number),
    lessonCellFormatters: PropTypes.arrayOf(PropTypes.func).isRequired,
    extraHeaderFormatters: PropTypes.arrayOf(PropTypes.func),
    needsGutter: PropTypes.bool.isRequired,
    onScroll: PropTypes.func.isRequired,
    includeHeaderArrows: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.lessonNumberFormatter = this.lessonNumberFormatter.bind(this);
    this.contentCellFormatter = this.contentCellFormatter.bind(this);
    this.columnWidthStyle = this.columnWidthStyle.bind(this);
  }

  header = null;
  body = null;
  bodyComponent = null;
  lessonRefs = {};

  componentDidMount() {
    this.scrollToSelectedLesson();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.lessonOfInterest !== this.props.lessonOfInterest) {
      this.scrollToSelectedLesson();
    }
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
      (lessonHasLevels(lesson) &&
        (lesson.levels.length > 1 || lesson.levels[0].isUnplugged));
    return (
      <div
        style={styles.headerContainer}
        ref={r => (this.lessonRefs[lesson.position] = r)}
      >
        <ProgressTableLessonNumber
          id={lesson.id}
          name={lesson.name}
          number={lesson.relative_position}
          lockable={lesson.lockable}
          highlighted={lesson.position === this.props.lessonOfInterest}
          onClick={() => this.props.onClickLesson(lesson.position)}
          isAssessment={lessonIsAllAssessment(lesson.levels)}
          includeArrow={includeArrow}
        />
      </div>
    );
  }

  contentCellFormatter(_, {rowData, columnIndex}) {
    return this.props.lessonCellFormatters[rowData.expansionIndex](
      this.props.scriptData.stages[columnIndex],
      rowData.student
    );
  }

  /**
   * `columnWidths` is an optional prop. When it's provided, we explicitly
   * constrain column widths to the provided values. When it's absent, the
   * columns will size themselves based on their content.
   *
   * One exception is that we provide a fixed width for empty columns when a
   * lesson has no levels.
   *
   * Note: due to the nuances of reactabular's implementation, header cells
   * are unable to base their width on the content of body cells, nor
   * vice versa. Consequently, for headers to properly align with their body
   * columns when explicit column widths are not provided, the max content
   * width of header cells must match the max content width of body cells.
   */
  columnWidthStyle(index) {
    const {columnWidths, scriptData} = this.props;
    let width = null;
    if (columnWidths) {
      width = columnWidths[index];
    } else if (!lessonHasLevels(scriptData.stages[index])) {
      width = parseInt(css.MIN_COLUMN_WIDTH);
    }
    return width ? {style: {minWidth: width, maxWidth: width}} : {};
  }

  render() {
    // Both summary and detail view have a top header row with lesson number
    // rendered by lessonNumberFormatter. Detail view has a second
    // header whose renderer is passed in through extraHeaderFormatters
    // implemented by ProgressTableDetailView
    const headerFormatters = [
      this.lessonNumberFormatter,
      ...(this.props.extraHeaderFormatters || [])
    ];
    const headerRows = headerFormatters.map(_ => []);
    const columns = [];

    // Each iteration renders a lesson column in the table.
    // For summary view, it's a single header and summary cell.
    // For detail view, it's 2 headers and detail cell (bubbles for each level)
    this.props.scriptData.stages.forEach((_, index) => {
      const widthProps = this.columnWidthStyle(index);
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
          rows={this.props.rows}
          onRow={this.props.onRow}
          rowKey={'id'}
          onScroll={this.props.onScroll}
          style={{
            overflowX: 'scroll',
            overflowY: 'auto',
            maxHeight: parseInt(css.MAX_BODY_HEIGHT)
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

const styles = {
  headerContainer: {
    height: '100%'
  }
};
