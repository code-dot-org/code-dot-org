import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {scriptDataPropType} from '../sectionProgressConstants';
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
    columnWidths: PropTypes.arrayOf(PropTypes.number),
    lessonCellFormatter: PropTypes.func.isRequired,
    extraHeaderFormatters: PropTypes.arrayOf(PropTypes.func),
    extraHeaderLabels: PropTypes.arrayOf(PropTypes.string),

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

  render() {
    return (
      <div style={styles.container} className="progress-table">
        <div style={styles.studentList} className="student-list">
          <ProgressTableStudentList
            ref={r => (this.studentList = r)}
            headers={[i18n.lesson(), ...(this.props.extraHeaderLabels || [])]}
            {...this.props}
          />
        </div>
        <div style={styles.contentView} className="content-view">
          <ProgressTableContentView
            ref={r => (this.contentView = r)}
            needsGutter={this.needsContentHeaderGutter()}
            onScroll={this.onScroll}
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
