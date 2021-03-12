import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import i18n from '@cdo/locale';
import {scriptDataPropType} from '../sectionProgressConstants';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {getCurrentScriptData} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import styleConstants from '@cdo/apps/styleConstants';
import ProgressTableStudentList from './ProgressTableStudentList';
import ProgressTableContentView from './ProgressTableContentView';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import classnames from 'classnames';

/**
 * Since our progress tables are built out of standard HTML table elements,
 * we can leverage CSS classes for laying out and styling those elements.
 */
import progressTableStyles from './progressTableStyles.scss';

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

function idForExpansionIndex(studentId, index) {
  return `${studentId}.${index}`;
}

class ProgressTableContainer extends React.Component {
  static propTypes = {
    onClickLesson: PropTypes.func.isRequired,
    columnWidths: PropTypes.arrayOf(PropTypes.number),
    lessonCellFormatters: PropTypes.arrayOf(PropTypes.func.isRequired),
    extraHeaderFormatters: PropTypes.arrayOf(PropTypes.func),
    extraHeaderLabels: PropTypes.arrayOf(PropTypes.string),
    includeHeaderArrows: PropTypes.bool,

    // redux
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    studentTimestamps: PropTypes.object.isRequired,
    localeCode: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.onScroll = this.onScroll.bind(this);
    this.onToggleRow = this.onToggleRow.bind(this);
    this.recordToggleRow = this.recordToggleRow.bind(this);
    this.numDetailRows = props.lessonCellFormatters.length - 1;
    this.state = {
      rows: props.section.students.map((student, index) => {
        return {
          id: idForExpansionIndex(student.id, 0),
          student: student,
          expansionIndex: 0,
          isExpanded: false,
          hasDarkBackground: index % 2 === 1
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

  componentDidMount() {
    // override the default initial number of rows to render
    const maxRows = Math.ceil(
      parseInt(progressTableStyles.MAX_BODY_HEIGHT) /
        parseInt(progressTableStyles.ROW_HEIGHT)
    );
    const initialRows = Math.min(this.props.section.students.length, maxRows);
    this.studentList.bodyComponent.setState({
      amountOfRowsToRender: initialRows
    });
    this.contentView.bodyComponent.setState({
      amountOfRowsToRender: initialRows
    });
  }

  onScroll(e) {
    this.studentList.body.scrollTop = e.target.scrollTop;
    this.contentView.header.scrollLeft = e.target.scrollLeft;
  }

  // When the student list is long enough to enable vertical scrolling in the
  // table body, we need to add a "gutter" to the content view header to
  // account for the horizontal space used by the vertical scrollbar.
  needsContentHeaderGutter() {
    return (
      this.props.section.students.length *
        parseInt(progressTableStyles.ROW_HEIGHT) >
      parseInt(progressTableStyles.MAX_BODY_HEIGHT)
    );
  }

  onToggleRow(rowData) {
    const rowIndex = this.state.rows.findIndex(
      row => row.student === rowData.student
    );
    if (!rowData.isExpanded) {
      this.expandDetailRows(rowData, rowIndex);
    } else {
      this.collapseDetailRows(rowData, rowIndex);
    }
    this.recordToggleRow(!rowData.isExpanded, rowData.student.id);
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
    for (let i = 1; i <= this.numDetailRows; i++) {
      detailRows.push({
        id: idForExpansionIndex(rowData.student.id, i),
        student: rowData.student,
        expansionIndex: i,
        hasDarkBackground: rowData.hasDarkBackground
      });
    }
    const rows = [...this.state.rows];
    rows[rowIndex].isExpanded = true;
    rows.splice(rowIndex + 1, 0, ...detailRows);
    this.setState({
      rows: rows
    });
  }

  collapseDetailRows(rowData, rowIndex) {
    const rows = this.state.rows.filter(row => {
      return row.student.id !== rowData.student.id || row.expansionIndex === 0;
    });
    rows[rowIndex].isExpanded = false;
    this.setState({
      rows: rows
    });
  }

  onRow = row => {
    const rowClassName = classnames({
      'dark-row': row.hasDarkBackground,
      'primary-row': row.expansionIndex === 0,
      'expanded-row': row.expansionIndex > 0,
      'first-expanded-row': row.expansionIndex === 1
    });

    return {
      className: rowClassName
    };
  };

  render() {
    return (
      <div style={styles.container} className="progress-table">
        <div style={styles.studentList} className="student-list">
          <ProgressTableStudentList
            ref={r => (this.studentList = r)}
            headers={[i18n.lesson(), ...(this.props.extraHeaderLabels || [])]}
            rows={this.state.rows}
            onRow={this.onRow}
            sectionId={this.props.section.id}
            scriptData={this.props.scriptData}
            studentTimestamps={this.props.studentTimestamps}
            localeCode={this.props.localeCode}
            onToggleRow={this.onToggleRow}
          />
        </div>
        <div style={styles.contentView} className="content-view">
          <ProgressTableContentView
            ref={r => (this.contentView = r)}
            rows={this.state.rows}
            onRow={this.onRow}
            needsGutter={this.needsContentHeaderGutter()}
            onScroll={this.onScroll}
            scriptData={this.props.scriptData}
            onClickLesson={this.props.onClickLesson}
            columnWidths={this.props.columnWidths}
            lessonCellFormatters={this.props.lessonCellFormatters}
            extraHeaderFormatters={this.props.extraHeaderFormatters}
            includeHeaderArrows={this.props.includeHeaderArrows}
            {...this.props}
          />
        </div>
      </div>
    );
  }
}

export const UnconnectedProgressTableContainer = ProgressTableContainer;

export default connect(state => ({
  section: state.sectionData.section,
  scriptData: getCurrentScriptData(state),
  lessonOfInterest: state.sectionProgress.lessonOfInterest,
  studentTimestamps:
    state.sectionProgress.studentLastUpdateByScript[
      state.scriptSelection.scriptId
    ],
  localeCode: state.locales.localeCode
}))(ProgressTableContainer);
