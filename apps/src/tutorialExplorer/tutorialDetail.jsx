/* A pop-up modal displaying information about a single tutorial in TutorialExplorer.
 */

import PropTypes from 'prop-types';
import React, {createRef} from 'react';
import shapes from './shapes';
import {getTagString, getTutorialDetailString, DoNotShow} from './util';
import Image from './image';
import i18n from '@cdo/tutorialExplorer/locale';
/* global ga */

const QUERYABLE_ELEMENTS =
  'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

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
    this.containerRef = createRef();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('focusin', this.focusIn);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('focusin', this.focusIn);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we weren't previously showing and are now, then keep track of our scroll position.
    // This is because if we tab off the first element or past the last tutorial on the screen, it can adjust the
    // scroll position, and we'll use this later to reset to where we started from.
    if (this.props.showing && !prevProps.showing) {
      this.startingScroll = [window.scrollX, window.scrollY];
    }
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

  focusIn = event => {
    if (!this.props.showing) {
      return;
    }

    // First of all, if we've drifted from it (by tabbing before the first tutorial or past one at the end of the
    // window), then reset our scroll position.
    if (this.startingScroll && window.scrollY !== this.startingScroll[1]) {
      window.scrollTo(...this.startingScroll);
    }

    /*
      We've kept a ref to our dialog container, so when the user is adjusting focus we look to see if we're
      focusing onto an element that's still in the modal. If so, then awesome! We're done. If not, then we look
      in our modal and find the first button (which is the X to close) or the last link (which could vary based upon
      what's in there).

      If we're shifting focus away from the first button (and have left the modal), then we wrap around to the last link.
      Otherwise, if we're leaving, we return to the start at the first button.

      But it's to ensure that the user can only tab within the modal while it is open and cannot shift focus outside.

     */
    if (this.containerRef.current) {
      const inModal = this.containerRef.current.contains(event.target);
      if (!inModal) {
        const queryables =
          this.containerRef.current.querySelectorAll(QUERYABLE_ELEMENTS);
        const first = queryables[0];
        const last = queryables[queryables.length - 1];
        if (event.relatedTarget === first) {
          last.focus();
        } else {
          first.focus();
        }
      }
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
        title: i18n.filterAccessibility(),
        body: getTagString('accessibility', this.props.item.tags_accessibility)
      },
      {
        key: 8,
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
      <div
        id="tutorialPopupFullWidth"
        style={styles.popupFullWidth}
        ref={this.containerRef}
      >
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
                      <button
                        type="button"
                        style={{marginTop: 20}}
                        tabIndex={-1}
                      >
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
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 16
  },
  tutorialDetailSub: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 12,
    paddingBottom: 20
  },
  tutorialDetailDescription: {
    fontFamily: '"Gotham 4r", sans-serif',
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
  },
  tutorialDetailsAsReported: {
    padding: 6
  }
};
