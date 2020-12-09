import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ProgressTableSummaryView from './ProgressTableSummaryView';
import ProgressTableDetailView from './ProgressTableDetailView';
import ProgressTableStudentList from './ProgressTableStudentList';
import {scriptDataPropType} from '../sectionProgressConstants';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import styleConstants from '@cdo/apps/styleConstants';
import i18n from '@cdo/locale';

/**
 * Since our progress tables are built out of standard HTML table elements,
 * we can get a big performance improvement and simplify code by using CSS
 * classes for all our styling in these components.
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

export const SummaryViewContainer = synchronized(
  ProgressTableStudentList,
  ProgressTableSummaryView,
  [i18n.lesson()]
);

export const DetailViewContainer = synchronized(
  ProgressTableStudentList,
  ProgressTableDetailView,
  [i18n.lesson(), i18n.levelType()]
);

function synchronized(StudentList, ContentView, studentHeaders) {
  class Synchronized extends React.Component {
    static propTypes = {
      scriptData: scriptDataPropType.isRequired,
      section: sectionDataPropType.isRequired,

      // From redux
      studentTimestamps: PropTypes.object,
      localeCode: PropTypes.string
    };

    constructor(props) {
      super(props);
      this.onScroll = this.onScroll.bind(this);
      this.studentList = null;
      this.contentView = null;
    }

    componentDidMount() {
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

    render() {
      return (
        <div style={styles.container} className="progress-table">
          <div style={styles.studentList} className="student-list">
            <StudentList
              ref={r => (this.studentList = r)}
              headers={studentHeaders}
              studentTimestamps={this.props.studentTimestamps}
              localeCode={this.props.localeCode}
              needsGutter={
                ContentView.widthForScript(this.props.scriptData) >
                parseInt(progressTableStyles.CONTENT_VIEW_WIDTH)
              }
              {...this.props}
            />
          </div>
          <div style={styles.contentView} className="content-view">
            <ContentView
              ref={r => (this.contentView = r)}
              onScroll={this.onScroll}
              {...this.props}
            />
          </div>
        </div>
      );
    }
  }

  Synchronized.displayName = `Synchronized(${getDisplayName(
    StudentList
  )},${getDisplayName(ContentView)})`;

  return connect(state => ({
    studentTimestamps:
      state.sectionProgress.studentLastUpdateByScript[
        state.scriptSelection.scriptId
      ],
    localeCode: state.locales.localeCode
  }))(Synchronized);
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
