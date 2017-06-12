import React, { Component, PropTypes } from 'react';
import i18n from '@cdo/locale';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';

export const sectionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  loginType: PropTypes.oneOf(['word', 'email', 'picture']).isRequired,
  stageExtras: PropTypes.bool.isRequired,
  pairingAllowed: PropTypes.bool.isRequired,
  numStudents: PropTypes.number.isRequired,
  code: PropTypes.string.isRequired,
  assignmentName: PropTypes.string,
  assignmentPath: PropTypes.string
});

const styles = {
  sectionName: {
    fontSize: 18,
    paddingTop: 12
  },
};

const ConfirmDelete = ({onClickYes, onClickNo}) => (
  <div>
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
    deleting: false
  };

  onClickDelete = () => this.setState({deleting: true});

  onClickDeleteNo = () => this.setState({deleting: false});

  onClickDeleteYes = () => console.log('this is where our delete will happen');

  render() {
    const { section } = this.props;
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
          {!this.state.deleting && (
            <div style={{whiteSpace: 'nowrap'}}>
              <ProgressButton
                text={"Edit"}
                onClick={() => console.log('start editing')}
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
