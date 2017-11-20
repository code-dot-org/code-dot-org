import React, { Component, PropTypes } from 'react';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

const styles = {
  rightButton: {
    marginLeft: 5
  },
  nowrap: {
    whiteSpace: 'nowrap'
  },
};

/**
 * Delete + confirmation experience used in SectionTable. Provides a delete button
 * that when clicked turns into a confirmation with Yes/No buttons.
 */
export default class DeleteAndConfirm extends Component {
  static propTypes = {
    onConfirm: PropTypes.func.isRequired
  };

  state = {
    deleting: false
  };

  onClickStart = () => this.setState({deleting: true});
  onClickCancel = () => this.setState({deleting: false});

  render() {
    const { onConfirm } = this.props;
    const { deleting } = this.state;
    return (
      <div>
        {!deleting && (
          <Button
            text={i18n.delete()}
            onClick={this.onClickStart}
            color={Button.ButtonColor.red}
          />
        )}
        {deleting && (
          <div style={styles.nowrap}>
            <div>{i18n.deleteConfirm()}</div>
            <Button
              text={i18n.yes()}
              onClick={onConfirm}
              color={Button.ButtonColor.red}
            />
            <Button
              text={i18n.no()}
              style={styles.rightButton}
              onClick={this.onClickCancel}
              color={Button.ButtonColor.gray}
            />
          </div>
        )}
      </div>
    );
  }
}
