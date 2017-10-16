import React, {Component, PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import PrintCertificates from "./PrintCertificates";
import {connect} from 'react-redux';
import {sectionCode,
        sectionName,
        removeSection,
        toggleSectionHidden,
        importOrUpdateRoster} from './teacherSectionsRedux';
import {sortableSectionShape, OAuthSectionTypes} from "./shapes.jsx";
import {pegasus} from "../../lib/util/urlHelpers";
import {Popover, OverlayTrigger} from 'react-bootstrap';
import * as utils from '../../utils';


const styles = {
  arrowIcon: {
    paddingRight: 8
  },
  actionBox: {
    width: 140,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingTop: 10,
  },
  actionText: {
    fontSize: 14,
    fontFamily: '"Gotham", sans-serif',
    color: color.charcoal,
    padding: '10px 0px 4px 0px',
  },
  actionTextBreak: {
    fontSize: 14,
    fontFamily: '"Gotham", sans-serif',
    borderTop: '1px solid ' + color.lighter_gray,
    color: color.charcoal,
    padding: '13px 0px 2px 0px',
    marginTop: '7px',
  },
  archiveDelete: {
    color: color.red,
    padding: '10px 0px 10px 0px',
    fontSize: 14,
  },
  xIcon: {
    paddingRight: 5,
  },
  bold: {
    fontFamily: '"Gotham 5r", sans-serif'
  },
  actionButton:{
    border: '1px solid ' + color.white,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 5,
    color: color.lighter_gray,
    margin: 3
  },
  hoverFocus: {
    backgroundColor: color.lighter_gray,
    border: '1px solid ' + color.light_gray,
    borderRadius: 5,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 5,
    paddingRight: 5,
    color: color.white,
  },
};

class SectionActionBox extends Component {
  static propTypes = {
    style: PropTypes.object,
    handleEdit: PropTypes.func,
    sectionData: sortableSectionShape.isRequired,

    //Provided by redux
    removeSection: PropTypes.func.isRequired,
    toggleSectionHidden: PropTypes.func.isRequired,
    sectionCode: PropTypes.string,
    sectionName: PropTypes.string,
    updateRoster: PropTypes.func.isRequired,
  };

  state = {
    selected : false,
  };

  onConfirmDelete = () => {
      const {removeSection } = this.props;
      const section = this.props.sectionData;
      $.ajax({
          url: `/v2/sections/${section.id}`,
          method: 'DELETE',
      }).done(() => {
          removeSection(section.id);
      }).fail((jqXhr, status) => {
          // We may want to handle this more cleanly in the future, but for now this
          // matches the experience we got in angular
          alert(i18n.unexpectedError());
          console.error(status);
      });
  };

  onClickEdit = () => {
      this.props.handleEdit(this.props.sectionData.id);
  };

  onClickHideShow = () => {
      this.props.toggleSectionHidden(this.props.sectionData.id);
  };

  onClickSync = () => {
    // Section code is the course ID, without the G- or C- prefix.
    const courseId = this.props.sectionCode.replace(/^[GC]-/, '');
    this.props.updateRoster(courseId, this.props.sectionName)
      .then(() => {
        // While we are embedded in an angular page, reloading is the easiest
        // way to pick up roster changes.  Once everything is React maybe we
        // won't need to do this.
        utils.reload();
      });
  };

  render() {
    return (
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="bottom"
        onEnter={() => this.setState({selected : true})}
        onExiting={() => this.setState({selected : false})}
        overlay=
          {(
            <Popover id="action-options">
              <div style={styles.actionBox}>
                <a href={pegasus('/teacher-dashboard#/sections/' + this.props.sectionData.id)}>
                  <div style={styles.actionText}>
                    {i18n.sectionViewProgress()}
                  </div>
                </a>
                <a href={pegasus('/teacher-dashboard#/sections/' + this.props.sectionData.id + "/manage")}>
                  <div style={styles.actionText}>
                    {i18n.manageStudents()}
                  </div>
                </a>
                <a href={pegasus('/teacher-dashboard#/sections/' + this.props.sectionData.id + '/print_signin_cards')}>
                  <div style={styles.actionText}>
                    {i18n.printLoginCards()}
                  </div>
                </a>
                <a>
                  <div style={styles.actionTextBreak} onClick={this.onClickEdit}>
                    {i18n.editSectionDetails()}
                  </div>
                </a>
                <a>
                  <div style={styles.actionText}>
                    <PrintCertificates
                      sectionId={this.props.sectionData.id}
                      assignmentName={this.props.sectionData.assignmentNames[0]}
                    />
                  </div>
                </a>
                {this.props.sectionData.loginType === OAuthSectionTypes.clever &&
                  <a>
                    <div style={styles.actionText} onClick={this.onClickSync}>
                      {i18n.syncClever()}
                    </div>
                  </a>
                }
                {this.props.sectionData.loginType === OAuthSectionTypes.google_classroom &&
                  <a>
                    <div style={styles.actionText} onClick={this.onClickSync}>
                      {i18n.syncGoogleClassroom()}
                    </div>
                  </a>
                }
                <a>
                  <div style={styles.actionText} onClick={this.onClickHideShow}>
                    {this.props.sectionData.hidden ? i18n.showSection() : i18n.hideSection()}
                  </div>
                </a>
                {this.props.sectionData.studentCount === 0 && (
                  <a>
                    <div style={styles.archiveDelete} onClick={this.onConfirmDelete}>
                      <FontAwesome icon=" fa-times-circle" style={styles.xIcon}/>
                      {i18n.deleteSection()}
                    </div>
                  </a>
                )}
              </div>
            </Popover>
          )}
      >
        <a style={this.state.selected ? {...styles.actionButton, ...styles.hoverFocus} : styles.actionButton}>
          <i className="fa fa-chevron-down"></i>
        </a>
      </OverlayTrigger>
    );
  }
}

export const UnconnectedSectionActionBox = SectionActionBox;

export default connect((state, props) => ({
  sectionCode: sectionCode(state, props.sectionData.id),
  sectionName: sectionName(state, props.sectionData.id),
}), {
  removeSection,
  toggleSectionHidden,
  updateRoster: importOrUpdateRoster,
})(SectionActionBox);
