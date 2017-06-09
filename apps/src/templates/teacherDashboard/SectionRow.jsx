import React, { Component, PropTypes } from 'react';
import i18n from '@cdo/locale';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';

const styles = {
  sectionName: {
    fontSize: 18,
    paddingTop: 12
  },
};

export default class SectionRow extends Component {
  static propTypes = {
    // TODO: provide more detail
    section: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.onClickDelete = this.onClickDelete.bind(this);
    this.onClickDeleteNo = this.onClickDeleteNo.bind(this);
    this.onClickDeleteYes = this.onClickDeleteYes.bind(this);

    this.state = {
      editing: false,
      deleting: false
    };
  }

  onClickDelete() {
    this.setState({deleting: true});
  }

  onClickDeleteNo() {
    this.setState({deleting: false});
  }

  onClickDeleteYes() {
    console.log('this is where our delete will happen');
  }

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
            <div>
              <div>Delete?</div>
              <ProgressButton
                text={i18n.yes()}
                onClick={this.onClickDeleteYes}
                color={ProgressButton.ButtonColor.red}
              />
              <ProgressButton
                text={i18n.no()}
                style={{marginLeft: 5}}
                onClick={this.onClickDeleteNo}
                color={ProgressButton.ButtonColor.gray}
              />
            </div>
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
