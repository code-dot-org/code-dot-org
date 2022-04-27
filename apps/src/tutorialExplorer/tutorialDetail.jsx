/* A pop-up modal displaying information about a single tutorial in TutorialExplorer.
 */

import PropTypes from 'prop-types';
import React from 'react';
import shapes from './shapes';
import AssignmentVersionSelector from '../templates/teacherDashboard/AssignmentVersionSelector';

export default class TutorialDetail extends React.Component {
  static propTypes = {
    showing: PropTypes.bool.isRequired,
    item: shapes.tutorial,
    closeClicked: PropTypes.func.isRequired,
    changeTutorial: PropTypes.func.isRequired,
    localeEnglish: PropTypes.bool.isRequired,
    disabledTutorial: PropTypes.bool.isRequired,
    grade: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedCourseVersion:
        props.item && props.item.course_versions
          ? Object.values(props.item?.course_versions)[0]
          : null
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = ({keyCode}) => {
    if (!this.props.showing) {
      return;
    }

    if (keyCode === 27) {
      this.props.closeClicked();
    } else if (keyCode === 37) {
      this.props.changeTutorial(-1);
    } else if (keyCode === 39) {
      this.props.changeTutorial(1);
    }
  };

  setSelectedCourseVersion = versionId => {
    const version = this.props.item.course_versions[versionId];
    this.setState({selectedCourseVersion: version});
  };

  render() {
    if (!this.props.showing) {
      // Enable body scrolling.
      $('body').css('overflow', 'auto');
      return null;
    }

    // Disable body scrolling.
    $('body').css('overflow', 'hidden');

    return (
      <div id="tutorialPopupFullWidth" style={styles.popupFullWidth}>
        <div
          className="modal"
          id="tutorialPopup"
          style={{display: 'block'}}
          onClick={this.props.closeClicked}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-content">
              <div
                className="modal-header"
                style={styles.tutorialDetailModalHeader}
              >
                <button
                  className="close"
                  data-dismiss="modal"
                  style={{height: 48}}
                  type="button"
                  onClick={this.props.closeClicked}
                >
                  <span aria-hidden="true" style={{fontSize: 48}}>
                    ×
                  </span>
                  <span className="sr-only">Close</span>
                </button>
                <div style={{clear: 'both'}} />
              </div>
              <div
                className="modal-body"
                style={styles.tutorialDetailModalBody}
              >
                <h1>{this.state.selectedCourseVersion.name}</h1>
                <AssignmentVersionSelector
                  onChangeVersion={this.setSelectedCourseVersion}
                  courseVersions={this.props.item.courseVersions}
                  selectedCourseVersionId={this.state.selectedCourseVersion.id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  tutorialDetailModalHeader: {
    borderBottomWidth: 0,
    paddingTop: 0,
    paddingBottom: 4,
    height: 48
  },
  tutorialDetailModalBody: {
    paddingTop: 0,
    overflow: 'hidden',
    textAlign: 'left',
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto'
  },
  popupFullWidth: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%'
  },
  tutorialDetailImageOuterContainer: {
    float: 'left',
    paddingBottom: 10
  },
  tutorialDetailImageContainer: {
    position: 'relative',
    width: '100%',
    height: 0,
    paddingTop: '75%'
  },
  tutorialDetailImageBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#f1f1f1',
    border: 'solid 1px #cecece'
  },
  tutorialDetailImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%'
  },
  tutorialDetailInfoContainer: {
    float: 'left',
    paddingLeft: 20
  },
  tutorialDetailName: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 22,
    paddingBottom: 4
  },
  tutorialDetailPublisher: {
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 16
  },
  tutorialDetailSub: {
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 12,
    paddingBottom: 20
  },
  tutorialDetailDescription: {
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 14
  },
  tutorialDetailDisabled: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 16,
    paddingTop: 40
  },
  tutorialDetailDisabledIcon: {
    color: '#d9534f'
  },
  tutorialDetailsTable: {
    marginTop: 20,
    width: '100%'
  },
  tutorialDetailsTableTitle: {
    padding: 5,
    width: '40%',
    fontFamily: '"Gotham 5r", sans-serif',
    border: '1px solid lightgrey'
  },
  tutorialDetailsTableBody: {
    padding: 5,
    border: '1px solid lightgrey'
  },
  tutorialDetailsTableBodyNoWrap: {
    padding: 5,
    border: '1px solid lightgrey',
    whiteSpace: 'pre-wrap'
  }
};
