/* A pop-up modal displaying information about a single tutorial in TutorialExplorer.
 */

import PropTypes from 'prop-types';
import React from 'react';
import shapes from './shapes';
import {getTagString, getTutorialDetailString, DoNotShow} from './util';
import Image from './image';
import i18n from '@cdo/tutorialExplorer/locale';
/* global ga */

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

  startTutorialClicked = () => {
    const shortCode = this.props.item.short_code;
    ga('send', 'event', 'learn', 'start', shortCode);
    ga('send', 'event', 'learn', `start-${this.props.grade}`, shortCode);
  };

  render() {
    if (!this.props.showing) {
      // Enable body scrolling.
      $('body').css('overflow', 'auto');
      return null;
    }

    // Disable body scrolling.
    $('body').css('overflow', 'hidden');

    const tableEntries = [
      // Reserve key 0 for the optional teachers notes.
      // Reserve key 1 for the optional short link.
      {
        key: 2,
        title: i18n.filterStudentExperience(),
        body: getTagString(
          'student_experience',
          this.props.item.tags_student_experience
        )
      },
      {
        key: 3,
        title: i18n.filterPlatform(),
        body: this.props.item.string_platforms
      },
      {
        key: 4,
        title: i18n.filterTopics(),
        body: getTagString('subject', this.props.item.tags_subject)
      },
      {
        key: 5,
        title: i18n.filterActivityType(),
        body: getTagString('activity_type', this.props.item.tags_activity_type)
      },
      {
        key: 6,
        title: i18n.filterLength(),
        body: getTagString('length', this.props.item.tags_length)
      },
      {
        key: 7,
        title: i18n.tutorialDetailInternationalLanguages(),
        body: this.props.item.language
      }
      // Reserve key 8 for the optional standards.
    ];

    const imageSrc = this.props.item.image
      .replace('/images/', '/images/fill-480x360/')
      .replace('.png', '.jpg');

    const imageComponent = (
      <div
        style={styles.tutorialDetailImageOuterContainer}
        className="col-xs-12 col-sm-6"
      >
        <div style={styles.tutorialDetailImageContainer}>
          <div style={styles.tutorialDetailImageBackground} />
          <Image style={styles.tutorialDetailImage} src={imageSrc} />
        </div>
      </div>
    );

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
                {!this.props.disabledTutorial && (
                  <a
                    href={this.props.item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={this.startTutorialClicked}
                  >
                    {imageComponent}
                  </a>
                )}
                {this.props.disabledTutorial && imageComponent}

                <div
                  style={styles.tutorialDetailInfoContainer}
                  className="col-xs-12 col-sm-6"
                >
                  <div style={styles.tutorialDetailName}>
                    {this.props.item.name}
                  </div>
                  {this.props.item.orgname !== DoNotShow && (
                    <div style={styles.tutorialDetailPublisher}>
                      {this.props.item.orgname}
                    </div>
                  )}
                  <div style={styles.tutorialDetailSub}>
                    {getTutorialDetailString(this.props.item)}
                  </div>
                  <div style={styles.tutorialDetailDescription}>
                    {this.props.item.longdescription}
                  </div>
                  {this.props.disabledTutorial && (
                    <div style={styles.tutorialDetailDisabled}>
                      <i
                        className="fa fa-warning warning-sign"
                        style={styles.tutorialDetailDisabledIcon}
                      />
                      &nbsp;
                      {i18n.tutorialDetailDisabled()}
                    </div>
                  )}
                  {!this.props.disabledTutorial && (
                    <a
                      href={this.props.item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={this.startTutorialClicked}
                    >
                      <button type="button" style={{marginTop: 20}}>
                        {i18n.startButton()}
                      </button>
                    </a>
                  )}
                </div>
                <div style={{clear: 'both'}} />
                <table style={styles.tutorialDetailsTable}>
                  <tbody>
                    {this.props.item.teachers_notes && (
                      <tr key={0}>
                        <td style={styles.tutorialDetailsTableTitle}>
                          {i18n.tutorialDetailsMoreResources()}
                        </td>
                        <td style={styles.tutorialDetailsTableBody}>
                          <a
                            href={this.props.item.teachers_notes}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i
                              className="fa fa-external-link"
                              aria-hidden={true}
                            />
                            &nbsp;
                            {i18n.tutorialDetailsTeacherNotes()}
                          </a>
                        </td>
                      </tr>
                    )}
                    {!this.props.disabledTutorial &&
                      this.props.item.tags_activity_type
                        .split(',')
                        .indexOf('online-tutorial') !== -1 && (
                        <tr key={1}>
                          <td style={styles.tutorialDetailsTableTitle}>
                            {i18n.tutorialDetailsShortLink()}
                          </td>
                          <td style={styles.tutorialDetailsTableBody}>
                            <a
                              href={`https://hourofcode.com/${
                                this.props.item.short_code
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {`https://hourofcode.com/${
                                this.props.item.short_code
                              }`}
                            </a>
                          </td>
                        </tr>
                      )}
                    {tableEntries.map(item => (
                      <tr key={item.key}>
                        <td style={styles.tutorialDetailsTableTitle}>
                          {item.title}
                        </td>
                        <td style={styles.tutorialDetailsTableBody}>
                          {item.body}
                        </td>
                      </tr>
                    ))}
                    {this.props.localeEnglish &&
                      this.props.item.string_standards && (
                        <tr key={8}>
                          <td style={styles.tutorialDetailsTableTitle}>
                            {i18n.tutorialDetailStandards()}
                          </td>
                          <td style={styles.tutorialDetailsTableBodyNoWrap}>
                            {this.props.item.string_standards}
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
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
