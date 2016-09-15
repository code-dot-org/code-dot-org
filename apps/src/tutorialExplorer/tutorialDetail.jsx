/* A pop-up modal displaying information about a single tutorial in TutorialExplorer.
 */

import React from 'react';
import shapes from './shapes';
import getTagString from './util';

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
    textAlign: 'left'
  },
  popupFullWidth: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%'
  },
  tutorialDetailName: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 22
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
};

const TutorialDetail = React.createClass({
  propTypes: {
    showing: React.PropTypes.bool.isRequired,
    item: shapes.tutorial.isRequired,
    closeClicked: React.PropTypes.func.isRequired,
  },

  render() {
    if (!this.props.showing) {
      // Disable body scrolling.
      $('body').css('overflow', 'auto');
      return null;
    }

    // Enable body scrolling.
    $('body').css('overflow', 'hidden');

    const tableEntries = [
      {key: 0, title: "Length",                  body: getTagString("length", this.props.item.tags_length)},
      {key: 1, title: "Subjects",                body: getTagString("subject", this.props.item.tags_subject)},
      {key: 2, title: "Educator Experience",     body: getTagString("teacher_experience", this.props.item.tags_teacher_experience)},
      {key: 3, title: "Student Experience",      body: getTagString("student_experience", this.props.item.tags_student_experience)},
      {key: 4, title: "Type of Activity",        body: getTagString("activity_type", this.props.item.tags_activity_type)},
      {key: 5, title: "International Languages", body: getTagString("international_languages", this.props.item.tags_international_languages)},
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
                <div className="col-50">
                  <img
                    src={this.props.item.image}
                    style={{width: '100%'}}
                  />
                </div>
                <div
                  className="col-50"
                  style={{paddingLeft: 20}}
                >
                  <div style={styles.tutorialDetailName}>
                    {this.props.item.name}
                  </div>
                  <div style={styles.tutorialDetailSub}>
                    {getTagString("grade", this.props.item.tags_grade)} | {getTagString("programming_language", this.props.item.tags_programming_language)}
                  </div>
                  <div style={styles.tutorialDetailDescription}>
                    {this.props.item.longdescription}
                  </div>
                </div>
                <div style={{clear: 'both'}}/>
                <table style={styles.tutorialDetailsTable}>
                  <tbody>
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

