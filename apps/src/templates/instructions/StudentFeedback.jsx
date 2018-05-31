import React, {PropTypes, Component} from 'react';
import { connect } from 'react-redux';
import i18n from '@cdo/locale';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';

const styles = {
  content: {
    padding: 10
  },
  header: {
    fontWeight: 'bold'
  }
};

class StudentFeedback extends Component {
  static propTypes = {
    viewAs: PropTypes.oneOf(Object.keys(ViewType)),
  };

  render() {
    if (!(this.props.viewAs === ViewType.Student)) {
      return null;
    }

    // Placeholder for upcoming feedback input
    return (
      <div style={styles.content}>
        <div style={styles.header}>{i18n.feedbackFrom({teacher: "Temp"})}</div>
        <div>{i18n.fromDaysAgo({number: 2})}<br/>Placeholder feedback</div>
      </div>
    );
  }
}

export default connect(state => ({
  viewAs: state.viewAs
}))(StudentFeedback);
