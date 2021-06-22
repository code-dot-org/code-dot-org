import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import i18n from '@cdo/locale';
import {
  ViewType,
  scriptDataPropType
} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {
  studentLessonProgressType,
  studentLevelProgressType
} from '@cdo/apps/templates/progress/progressTypes';
import {
  getCurrentUnitData,
  jumpToLessonDetails
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import styleConstants from '@cdo/apps/styleConstants';
import ProgressTableStudentList from './ProgressTableStudentList';
import ProgressTableContentView from './ProgressTableContentView';
import SummaryViewLegend from '@cdo/apps/templates/sectionProgress/progressTables/SummaryViewLegend';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import {
  getSummaryCellFormatters,
  getDetailCellFormatters,
  getLevelIconHeaderFormatter
} from './progressTableHelpers';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import classnames from 'classnames';

/**
 * Since our progress tables are built out of standard HTML table elements,
 * we can leverage CSS classes for laying out and styling those elements.
 */
import progressTableStyles from './progressTableStyles.scss';

function idForExpansionIndex(studentId, index) {
  return `${studentId}.${index}`;
}

/**
 * This component displays progress data for a section of students, and
 * abstracts all the functionality common to both our summary (lesson) table
 * and our detail (level) table. The table consists of one fixed column listing
 * student names, alongside a virtualized (potentially horizontally-scrolling
 * to preserve a fixed width) set of columns, each containing the data for a
 * single lesson. Consequently, the primary inputs for this component are
 * formatting functions to render the table cells for each lesson.
 *
 * Since our detail table includes one more header row than our summary table,
 * header labels and formatters are likewise provided through props.The whole
 * table is virtualized vertically to account for any number of students while
 * preserving a fixed height.
 *
 * We provide the ability to expand a row for a student to display additional
 * rows with more detailed data. To support this, we manage the list of rows to
 * render through this component's state. To expand a row, we insert additional
 * "expansion" rows into the list following the row to be expanded. To collapse
 * the row, we remove those "expansion" rows from the list.
 *
 * The number of expansion rows is determined by the number of lesson cell
 * formatters provided. Each row is rendered by the formatter corresponding to
 * `row.expansionIndex`, with `lessonCellFormatters[0]` being the primary
 * formatter for collapsed student rows.
 */
class ProgressTableView extends React.Component {
  static propTypes = {
    currentView: PropTypes.oneOf([ViewType.SUMMARY, ViewType.DETAIL]),

    // redux
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLessonProgressType)
    ).isRequired,
    levelProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLevelProgressType)
    ).isRequired,
    onClickLesson: PropTypes.func.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    studentTimestamps: PropTypes.object.isRequired,
    localeCode: PropTypes.string,
    showSectionProgressDetails: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.onScroll = this.onScroll.bind(this);
    this.onToggleRow = this.onToggleRow.bind(this);
    this.recordToggleRow = this.recordToggleRow.bind(this);

    this.summaryCellFormatters = getSummaryCellFormatters(
      props.lessonProgressByStudent,
      props.onClickLesson
    );

    this.detailCellFormatters = getDetailCellFormatters(
      props.levelProgressByStudent,
      props.section
    );

    // the primary table rows are represented by the students in the section,
    // but to support expanding those rows, we wrap each student in a
    // `studentTableRowType` object to track their expanded state. these
    // objects also include an `expansionIndex` to determine which lesson
    // formatter to use to render the row.
    this.state = {
      rows: props.section.students.map((student, index) => {
        return {
          id: idForExpansionIndex(student.id, 0),
          student: student,
          expansionIndex: 0,
          isExpanded: false,
          useDarkBackground: index % 2 === 1
        };
      })
    };

    // set the locale for timestamp formatting in table cells
    if (props.localeCode) {
      moment.locale(props.localeCode);
    }
  }

  studentList = null;
  contentView = null;
  scrollTop = 0;

  componentDidMount() {
    this.setRowsToRender();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentView !== this.props.currentView) {
      this.setRowsToRender();
    }
  }

  /**
   * Override the default initial number of rows to render
   */
  setRowsToRender() {
    const initialRows = parseInt(progressTableStyles.MAX_ROWS);

    // amountOfRowsToRender is a reactabular internal
    this.studentList?.bodyComponent.setState({
      amountOfRowsToRender: initialRows
    });
    this.contentView?.bodyComponent.setState({
      amountOfRowsToRender: initialRows
    });
    this.syncScrollTop();
  }

  onScroll(e) {
    this.studentList.body.scrollTop = e.target.scrollTop;
    this.contentView.header.scrollLeft = e.target.scrollLeft;
    this.scrollTop = e.target.scrollTop;
    this.syncScrollTop();
  }

  /**
   * This function serves three purposes:
   * 1) When switching between views, it will restore the vertical scroll
   *    position of the previous view.
   * 2) When expanding/collapsing detail rows, the scroll positions of the
   *    student list and content view sometimes get out of sync, so this is
   *    used to correct that when it happens.
   * 3) Making sure the internal states of the content view and student list
   *    remain in sync after scrolling (see comment on `setScrollState` below)
   *
   * A 200ms timeout is used because reactabular has an internal 100ms timeout
   * it uses to wait before calculating all its measurements, and we need to
   * make sure to wait until after that completes.
   */
  syncScrollTop() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.setScrollState(this.contentView.bodyComponent);
      this.setScrollState(this.studentList.bodyComponent);
    }, 200);
  }

  /**
   * Simply setting the `scrollTop` value on each of our table components
   * sometimes leads to the internal state of the components (and resulting
   * vertical scroll positions) getting out of sync.
   *
   * To work around this, we copy the implementation of reactabular's internal
   * `VirtualizedBody.getRef().scrollTo()` to make sure the state gets updated
   * appropriately. However, `scrollTo` accepts a row index, whereas we need to
   * set the `scrollTop` value directly, hence this custom implementation.
   */
  setScrollState(table) {
    table.scrollTop = this.scrollTop;
    table.ref.scrollTop = this.scrollTop;
    table.setState(table.calculateRows(table.props));
  }

  /**
   * When the student list is long enough to enable vertical scrolling in the
   * table body, we need to add a "gutter" to the content view header to
   * account for the horizontal space used by the vertical scrollbar.
   */
  needsContentHeaderGutter() {
    return (
      this.props.section.students.length >
      parseInt(progressTableStyles.MAX_ROWS)
    );
  }

  onToggleRow(studentId) {
    const rowIndex = this.state.rows.findIndex(
      row => row.student.id === studentId
    );
    const rowData = this.state.rows[rowIndex];
    if (!rowData.isExpanded) {
      this.expandDetailRows(rowData, rowIndex);
    } else {
      this.collapseDetailRows(rowData, rowIndex);
    }
    this.recordToggleRow(!rowData.isExpanded, rowData.student.id);
    this.syncScrollTop();
  }

  recordToggleRow(expanding, studentId) {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'time_spent',
        event: 'toggle_details',
        data_json: JSON.stringify({
          student_id: studentId,
          section_id: this.props.section.id,
          visible: expanding
        })
      },
      {includeUserId: true}
    );
  }

  expandDetailRows(rowData, rowIndex) {
    const detailRows = [];
    for (let i = 1; i <= this.numDetailRowsPerStudent(); i++) {
      detailRows.push({
        id: idForExpansionIndex(rowData.student.id, i),
        student: rowData.student,
        expansionIndex: i,
        useDarkBackground: rowData.useDarkBackground
      });
    }
    const rows = [...this.state.rows];
    rows[rowIndex].isExpanded = true;
    rows.splice(rowIndex + 1, 0, ...detailRows);
    this.setState({rows});
  }

  numDetailRowsPerStudent() {
    const rowsPerStudent =
      this.props.currentView === ViewType.DETAIL
        ? this.detailCellFormatters.length
        : this.summaryCellFormatters.length;
    // subtract one for the main row
    return rowsPerStudent - 1;
  }

  collapseDetailRows(rowData, rowIndex) {
    const rows = this.state.rows.filter(row => {
      return row.student.id !== rowData.student.id || row.expansionIndex === 0;
    });
    rows[rowIndex].isExpanded = false;
    this.setState({rows});
  }

  onRow(row) {
    const rowClassName = classnames({
      'dark-row': row.useDarkBackground,
      'primary-row': row.expansionIndex === 0,
      'expanded-row': row.expansionIndex > 0,
      'first-expanded-row': row.expansionIndex === 1
    });

    return {
      className: rowClassName
    };
  }

  detailContentViewProps() {
    return {
      lessonCellFormatters: this.detailCellFormatters,
      extraHeaderFormatters: [
        getLevelIconHeaderFormatter(this.props.scriptData)
      ],
      includeHeaderArrows: true
    };
  }

  summaryContentViewProps() {
    return {
      columnWidths: new Array(this.props.scriptData.lessons.length).fill(
        parseInt(progressTableStyles.MIN_COLUMN_WIDTH)
      ),
      lessonCellFormatters: this.summaryCellFormatters,
      includeHeaderArrows: false
    };
  }

  render() {
    const isDetailView = this.props.currentView === ViewType.DETAIL;

    const studentListHeaders = [i18n.lesson()];
    isDetailView && studentListHeaders.push(i18n.levelType());

    const contentViewProps = isDetailView
      ? this.detailContentViewProps()
      : this.summaryContentViewProps();

    // we use the view type as a key to force a full re-instantiation of the
    // table components when the view changes
    const key = this.props.currentView;

    return (
      // outer div contains both table and legend
      <div>
        <div style={styles.container} className="progress-table">
          <div style={styles.studentList} className="student-list">
            <ProgressTableStudentList
              key={key}
              ref={r => (this.studentList = r)}
              headers={studentListHeaders}
              rows={this.state.rows}
              onRow={this.onRow}
              sectionId={this.props.section.id}
              scriptData={this.props.scriptData}
              studentTimestamps={this.props.studentTimestamps}
              localeCode={this.props.localeCode}
              onToggleRow={this.onToggleRow}
              showSectionProgressDetails={this.props.showSectionProgressDetails}
            />
          </div>
          <div style={styles.contentView} className="content-view">
            <ProgressTableContentView
              key={key}
              ref={r => (this.contentView = r)}
              rows={this.state.rows}
              onRow={this.onRow}
              needsGutter={this.needsContentHeaderGutter()}
              onScroll={this.onScroll}
              scriptData={this.props.scriptData}
              lessonOfInterest={this.props.lessonOfInterest}
              onClickLesson={this.props.onClickLesson}
              {...contentViewProps}
            />
          </div>
        </div>
        {this.props.currentView === ViewType.DETAIL ? (
          <ProgressLegend
            excludeCsfColumn={!this.props.scriptData.csf}
            includeProgressNotApplicable
          />
        ) : (
          <SummaryViewLegend showCSFProgressBox={this.props.scriptData.csf} />
        )}
      </div>
    );
  }
}

const styles = {
  container: {
    width: styleConstants['content-width']
  },
  studentList: {
    display: 'inline-block',
    verticalAlign: 'top'
  },
  contentView: {
    display: 'inline-block',
    width: parseInt(progressTableStyles.CONTENT_VIEW_WIDTH)
  }
};

export const UnconnectedProgressTableView = ProgressTableView;

export default connect(
  state => ({
    section: state.sectionData.section,
    scriptData: getCurrentUnitData(state),
    lessonProgressByStudent:
      state.sectionProgress.studentLessonProgressByUnit[
        state.unitSelection.scriptId
      ],
    levelProgressByStudent:
      state.sectionProgress.studentLevelProgressByUnit[
        state.unitSelection.scriptId
      ],
    lessonOfInterest: state.sectionProgress.lessonOfInterest,
    studentTimestamps:
      state.sectionProgress.studentLastUpdateByUnit[
        state.unitSelection.scriptId
      ],
    localeCode: state.locales.localeCode,
    showSectionProgressDetails: state.sectionProgress.showSectionProgressDetails
  }),
  dispatch => ({
    onClickLesson(lessonPosition) {
      dispatch(jumpToLessonDetails(lessonPosition));
    }
  })
)(ProgressTableView);
