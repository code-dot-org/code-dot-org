import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {scriptDataPropType} from '../sectionProgressConstants';
import {studentLevelProgressType} from '@cdo/apps/templates/progress/progressTypes';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {getCurrentScriptData} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import styleConstants from '@cdo/apps/styleConstants';
import ProgressTableStudentList from './ProgressTableStudentList';
import ProgressTableContentView from './ProgressTableContentView';

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

class ProgressTableContainer extends React.Component {
  static propTypes = {
    onClickLesson: PropTypes.func.isRequired,
    getTableWidth: PropTypes.func.isRequired,
    columnWidths: PropTypes.arrayOf(PropTypes.number).isRequired,
    lessonCellFormatter: PropTypes.func.isRequired,
    extraHeaderFormatters: PropTypes.arrayOf(PropTypes.func),
    extraHeaderLabels: PropTypes.arrayOf(PropTypes.string),
    children: PropTypes.node.isRequired,

    // redux
    section: sectionDataPropType.isRequired,
    scriptData: scriptDataPropType.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    levelProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLevelProgressType)
    ).isRequired,
    studentTimestamps: PropTypes.object.isRequired,
    localeCode: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.onScroll = this.onScroll.bind(this);
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

  needsStudentGutter() {
    return (
      this.props.getTableWidth(this.props.scriptData.stages) >
      parseInt(progressTableStyles.CONTENT_VIEW_WIDTH)
    );
  }

  needsContentGutter() {
    return (
      this.props.section.students.length *
        parseInt(progressTableStyles.ROW_HEIGHT) >
      parseInt(progressTableStyles.MAX_BODY_HEIGHT)
    );
  }

  render() {
    return (
      <div style={styles.container} className="progress-table">
        <div style={styles.studentList} className="student-list">
          <ProgressTableStudentList
            ref={r => (this.studentList = r)}
            headers={[i18n.lesson(), ...(this.props.extraHeaderLabels || [])]}
            needsGutter={this.needsStudentGutter()}
            {...this.props}
          />
        </div>
        <div style={styles.contentView} className="content-view">
          <ProgressTableContentView
            ref={r => (this.contentView = r)}
            needsGutter={this.needsContentGutter()}
            onScroll={this.onScroll}
            {...this.props}
          />
        </div>
        {this.props.children}
      </div>
    );
  }
}

export const UnconnectedProgressTableContainer = ProgressTableContainer;

export default connect(state => ({
  section: state.sectionData.section,
  scriptData: getCurrentScriptData(state),
  lessonOfInterest: state.sectionProgress.lessonOfInterest,
  levelProgressByStudent:
    state.sectionProgress.studentLevelProgressByScript[
      state.scriptSelection.scriptId
    ],
  studentTimestamps:
    state.sectionProgress.studentLastUpdateByScript[
      state.scriptSelection.scriptId
    ],
  localeCode: state.locales.localeCode
}))(ProgressTableContainer);
