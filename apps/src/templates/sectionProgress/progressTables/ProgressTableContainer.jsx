import React from 'react';
import ProgressTableSummaryView from './ProgressTableSummaryView';
import ProgressTableDetailView from './ProgressTableDetailView';
import ProgressTableStudentList from './ProgressTableStudentList';
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
    constructor(props) {
      super(props);
      this.needTweakLastColumns = false;
      this.onScroll = this.onScroll.bind(this);
      this.studentList = null;
      this.contentView = null;
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
  return Synchronized;
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
