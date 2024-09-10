/* A pop-up modal displaying information about a single tutorial in TutorialExplorer.
 */

import FocusTrap from 'focus-trap-react';
import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import trackEvent from '@cdo/apps/util/trackEvent';
import i18n from '@cdo/tutorialExplorer/locale';

import analyticsReporter from '../metrics/AnalyticsReporter';

import Image from './image';
import shapes from './shapes';
import {getTagString, getTutorialDetailString, DoNotShow} from './util';

export default class TutorialDetail extends React.Component {
  static propTypes = {
    showing: PropTypes.bool.isRequired,
    item: shapes.tutorial,
    closeClicked: PropTypes.func.isRequired,
    changeTutorial: PropTypes.func.isRequired,
    localeEnglish: PropTypes.bool.isRequired,
    disabledTutorial: PropTypes.bool.isRequired,
    grade: PropTypes.string.isRequired,
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
    // Send event to Google Analytics.
    const shortCode = this.props.item.short_code;
    trackEvent('learn', 'learn_start', {value: shortCode});
    trackEvent('learn', `learn_start_${this.props.grade}`, {value: shortCode});

    // Send event to Statsig.
    const activityUrl = this.props.item.url;
    analyticsReporter.sendEvent(
      EVENTS.HOC_ACTIVITY_START_BUTTON_CLICKED,
      {
        activityUrl: activityUrl,
      },
      PLATFORMS.STATSIG
    );
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
        ),
      },
      {
        key: 3,
        title: i18n.filterPlatform(),
        body: this.props.item.string_platforms,
      },
      {
        key: 4,
        title: i18n.filterTopics(),
        body: getTagString('subject', this.props.item.tags_subject),
      },
      {
        key: 5,
        title: i18n.filterActivityType(),
        body: getTagString('activity_type', this.props.item.tags_activity_type),
      },
      {
        key: 6,
        title: i18n.filterLength(),
        body: getTagString('length', this.props.item.tags_length),
      },
      {
        key: 7,
        title: i18n.filterAccessibility(),
        body: getTagString('accessibility', this.props.item.tags_accessibility),
      },
      {
        key: 8,
        title: i18n.tutorialDetailInternationalLanguages(),
        body: this.props.item.language,
      },
      // Reserve key 8 for the optional standards.
    ];

    const imageSrc = this.props.item.image
      .replace('/images/', '/images/fill-480x360/')
      .replace('.png', '.jpg');

    const imageComponent = (
      <div style={styles.tutorialDetailImageBounds}>
        <div style={styles.tutorialDetailImageBackground} />
        <Image style={styles.tutorialDetailImage} src={imageSrc} />
      </div>
    );

    return (
      <FocusTrap>
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
              <div className="modal-content" aria-modal="true" role="dialog">
                <div
                  className="modal-header"
                  style={styles.tutorialDetailModalHeader}
                >
                  <button
                    className="close"
                    data-dismiss="modal"
                    style={styles.tutorialDetailCloseButton}
                    type="button"
                    onClick={this.props.closeClicked}
                  >
                    <i className="fa fa-close" aria-hidden={true} />
                    <span className="sr-only">Close</span>
                  </button>
                  <div style={{clear: 'both'}} />
                </div>
                <div
                  className="modal-body"
                  style={styles.tutorialDetailModalBody}
                  tabIndex={-1}
                >
                  <div
                    style={styles.tutorialDetailImageOuterContainer}
                    className="col-xs-12 col-sm-6"
                  >
                    {!this.props.disabledTutorial && (
                      <a
                        href={this.props.item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.tutorialDetailImageLink}
                        onClick={this.startTutorialClicked}
                      >
                        {imageComponent}
                      </a>
                    )}
                    {this.props.disabledTutorial && imageComponent}
                  </div>
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
                        <div style={styles.tutorialDetailStartButton}>
                          {i18n.startButton()}
                        </div>
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
                                href={`https://hourofcode.com/${this.props.item.short_code}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {`https://hourofcode.com/${this.props.item.short_code}`}
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
                  <div style={styles.tutorialDetailsAsReported}>
                    {i18n.tutorialDetailAsReported()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FocusTrap>
    );
  }
}

const styles = {
  tutorialDetailModalHeader: {
    borderBottomWidth: 0,
    paddingTop: 0,
    paddingBottom: 0,
    height: 44,
    paddingRight: 11,
  },
  tutorialDetailModalBody: {
    paddingTop: 0,
    overflow: 'hidden',
    textAlign: 'left',
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto',
  },
  popupFullWidth: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
  },
  tutorialDetailCloseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    height: 36,
    width: 36,
    fontSize: 36,
    marginTop: 6,
    marginRight: 6,
  },
  tutorialDetailImageOuterContainer: {
    float: 'left',
    paddingBottom: 10,
    paddingLeft: 0,
    paddingRight: 0,
    marginBottom: 6,
  },
  tutorialDetailImageLink: {
    display: 'inline-block',
    width: '100%',
    height: '100%',
    padding: 4,
    marginTop: 4,
  },
  tutorialDetailImageBounds: {
    position: 'relative',
    width: '100%',
    height: 0,
    paddingTop: '75%',
  },
  tutorialDetailImageBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#f1f1f1',
    border: 'solid 1px #cecece',
  },
  tutorialDetailImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
  },
  tutorialDetailInfoContainer: {
    float: 'left',
    paddingTop: 8,
    paddingLeft: 20,
  },
  tutorialDetailStartButton: {
    display: 'inline-block',
    padding: '6px 12px',
    color: 'white',
    backgroundColor: '#ffa400',
    borderColor: '#ffa400',
    borderRadius: 4,
    marginTop: 20,
  },
  tutorialDetailName: {
    ...fontConstants['main-font-semi-bold'],
    fontSize: 22,
    paddingBottom: 4,
  },
  tutorialDetailPublisher: {
    ...fontConstants['main-font-regular'],
    fontSize: 16,
  },
  tutorialDetailSub: {
    ...fontConstants['main-font-regular'],
    fontSize: 12,
    paddingBottom: 20,
  },
  tutorialDetailDescription: {
    ...fontConstants['main-font-regular'],
    fontSize: 14,
  },
  tutorialDetailDisabled: {
    ...fontConstants['main-font-semi-bold'],
    fontSize: 16,
    paddingTop: 40,
  },
  tutorialDetailDisabledIcon: {
    color: '#d9534f',
  },
  tutorialDetailsTable: {
    marginTop: 20,
    width: '100%',
  },
  tutorialDetailsTableTitle: {
    padding: 5,
    width: '40%',
    ...fontConstants['main-font-semi-bold'],
    border: '1px solid lightgrey',
  },
  tutorialDetailsTableBody: {
    padding: 5,
    border: '1px solid lightgrey',
  },
  tutorialDetailsTableBodyNoWrap: {
    padding: 5,
    border: '1px solid lightgrey',
    whiteSpace: 'pre-wrap',
  },
  tutorialDetailsAsReported: {
    padding: 6,
  },
};
