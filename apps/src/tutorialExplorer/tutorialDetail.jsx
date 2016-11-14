/* A pop-up modal displaying information about a single tutorial in TutorialExplorer.
 */

import React from 'react';
import shapes from './shapes';
import { getTagString, getTutorialDetailString } from './util';
import i18n from './locale';

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
  tutorialDetailImageContainer: {
    float: "left",
    paddingBottom: 10
  },
  tutorialDetailInfoContainer: {
    float: "left",
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
    whiteSpace: "pre"
  }
};

const TutorialDetail = React.createClass({
  propTypes: {
    showing: React.PropTypes.bool.isRequired,
    item: shapes.tutorial.isRequired,
    closeClicked: React.PropTypes.func.isRequired,
    localeEnglish: React.PropTypes.bool.isRequired
  },

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
      {key: 2, title: i18n.filterTeacherExperience(), body: getTagString("teacher_experience", this.props.item.tags_teacher_experience)},
      {key: 3, title: i18n.filterStudentExperience(), body: getTagString("student_experience", this.props.item.tags_student_experience)},
      {key: 4, title: i18n.filterPlatform(),          body: this.props.item.string_platforms},
      {key: 5, title: i18n.filterTopics(),            body: getTagString("subject", this.props.item.tags_subject)},
      {key: 6, title: i18n.filterActivityType(),      body: getTagString("activity_type", this.props.item.tags_activity_type)},
      {key: 7, title: i18n.filterLength(),            body: getTagString("length", this.props.item.tags_length)},
      {key: 8, title: i18n.tutorialDetailInternationalLanguages(), body: this.props.item.language},
      // Reserve key 9 for the optional standards.
    ];

    return (
      <div
        id="tutorialPopupFullWidth"
        style={styles.popupFullWidth}
      >
        <div
          className="modal"
          id="tutorialPopup"
          style={{display: 'block'}}
          onClick={this.props.closeClicked}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
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
                  <span
                    aria-hidden="true"
                    style={{fontSize: 48}}
                  >
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
                <div style={styles.tutorialDetailImageContainer} className="col-xs-12 col-sm-6">
                  <img
                    src={this.props.item.image.replace(".png", ".jpg")}
                    style={{width: '100%'}}
                  />
                </div>
                <div style={styles.tutorialDetailInfoContainer} className="col-xs-12 col-sm-6">
                  <div style={styles.tutorialDetailName}>
                    {this.props.item.name}
                  </div>
                  {this.props.item.orgname !== "do-not-show" &&
                    <div style={styles.tutorialDetailPublisher}>
                      {this.props.item.orgname}
                    </div>}
                  <div style={styles.tutorialDetailSub}>
                    {getTutorialDetailString(this.props.item)}
                  </div>
                  <div style={styles.tutorialDetailDescription}>
                    {this.props.item.longdescription}
                  </div>
                  <a href={this.props.item.launch_url} target="_blank">
                    <button style={{marginTop: 20}}>Start</button>
                  </a>
                </div>
                <div style={{clear: 'both'}}/>
                <table style={styles.tutorialDetailsTable}>
                  <tbody>
                    {this.props.item.teachers_notes &&
                      <tr key={0}>
                        <td style={styles.tutorialDetailsTableTitle}>
                          More resources
                        </td>
                        <td style={styles.tutorialDetailsTableBody}>
                          <a href={this.props.item.teachers_notes} target="_blank">
                            <i className="fa fa-external-link" aria-hidden={true}></i>
                            &nbsp;
                            {i18n.tutorialDetailsTeacherNotes()}
                          </a>
                        </td>
                      </tr>}
                    {this.props.item.tags_activity_type.split(',').indexOf("online-tutorial") !== -1 &&
                      <tr key={1}>
                        <td style={styles.tutorialDetailsTableTitle}>
                          {i18n.tutorialDetailsShortLink()}
                        </td>
                        <td style={styles.tutorialDetailsTableBody}>
                          <a href={`https://hourofcode.com/${this.props.item.short_code}`} target="_blank">
                            {`https://hourofcode.com/${this.props.item.short_code}`}
                          </a>
                        </td>
                      </tr>}
                    {tableEntries.map(item =>
                      <tr key={item.key}>
                        <td style={styles.tutorialDetailsTableTitle}>
                          {item.title}
                        </td>
                        <td style={styles.tutorialDetailsTableBody}>
                          {item.body}
                        </td>
                      </tr>
                    )}
                    {this.props.localeEnglish && this.props.item.string_standards && (
                      <tr key={9}>
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
});

export default TutorialDetail;

