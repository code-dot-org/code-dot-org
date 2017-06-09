import React, { Component, PropTypes } from 'react';
import i18n from '@cdo/locale';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import EditSectionRow from './EditSectionRow';
import sectionShape from './sectionShape';

const styles = {
  sectionName: {
    fontSize: 18,
    paddingTop: 12
  },
  nowrap: {
    whiteSpace: 'nowrap'
  }
};

/**
 * Buttons for confirming whether or not we want to delete a section
 */
const ConfirmDelete = ({onClickYes, onClickNo}) => (
  <div style={styles.nowrap}>
    <div>Delete?</div>
    <ProgressButton
      text={i18n.yes()}
      onClick={onClickYes}
      color={ProgressButton.ButtonColor.red}
    />
    <ProgressButton
      text={i18n.no()}
      style={{marginLeft: 5}}
      onClick={onClickNo}
      color={ProgressButton.ButtonColor.gray}
    />
  </div>
);
ConfirmDelete.propTypes = {
  onClickYes: PropTypes.func.isRequired,
  onClickNo: PropTypes.func.isRequired,
};

export default class SectionRow extends Component {
  static propTypes = {
    section: sectionShape.isRequired
  };

  state = {
    editing: false,
    deleting: false
  };

  onClickDelete = () => this.setState({deleting: true});

  onClickDeleteNo = () => this.setState({deleting: false});

  onClickDeleteYes = () => console.log('this is where our delete will happen');

  onClickEdit = () => this.setState({editing: true});

  onClickEditSave = () => console.log('this is where our save will happen');

  onClickEditCancel = () => this.setState({editing: false});

  render() {
    const { section } = this.props;
    if (this.state.editing) {
      return (
        <EditSectionRow
          section={section}
          onClickSave={this.onClickEditSave}
          onCancel={this.onClickEditCancel}
        />
      );
    }

    return (
      <tr>
        <td>
          <span style={styles.sectionName}>
            <a href={`#/sections/${section.id}/`}>
              {section.name}
            </a>
          </span>
        </td>
        <td>
          {section.loginType}
        </td>
        <td>
          {section.grade}
        </td>
        <td>
          {section.assignmentName &&
            <a href={section.assignmentPath}>
              {section.assignmentName}
            </a>
          }
        </td>
        <td>
          {section.stageExtras ? i18n.yes() : i18n.no()}
        </td>
        <td>
          {section.pairingAllowed ? i18n.yes() : i18n.no()}
        </td>
        <td>
          <a href={`#/sections/${section.id}/manage`}>
            {section.numStudents}
          </a>
        </td>
        <td>
          {section.code}
        </td>
        <td>
          {/*TODO: i18n */}
          {!this.state.editing && !this.state.deleting && (
            <div style={styles.nowrap}>
              <ProgressButton
                text={"Edit"}
                onClick={this.onClickEdit}
                color={ProgressButton.ButtonColor.gray}
              />
              {section.numStudents > 0 && (
                <ProgressButton
                  style={{marginLeft: 5}}
                  text={"Delete"}
                  onClick={this.onClickDelete}
                  color={ProgressButton.ButtonColor.red}
                />
              )}
            </div>
          )}
          {this.state.deleting && (
            <ConfirmDelete
              onClickYes={this.onClickDeleteYes}
              onClickNo={this.onClickDeleteNo}
            />
          )}
           <ProgressButton
             text={"Print Certificates"}
             onClick={() => console.log('print certificates here')}
             color={ProgressButton.ButtonColor.gray}
           />
        </td>
      </tr>
    );
  }
}
