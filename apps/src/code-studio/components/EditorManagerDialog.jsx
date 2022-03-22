import PropTypes from 'prop-types';
import React from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';

export default class EditorManagerDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  state = {
    selectedTheme: undefined,
    themes: [],
  };

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      this.setState({selectedTheme: undefined, themes: []});
      this.getThemeList();
    }
  }

  closeEditorManager = () => {
    this.props.onClose();
  };

  getThemeList = () => {
    this.setState({
        // having the themes in this way is dumb
        themes: [
          {name: "chrome", fullName: "Chrome"},
          {name : "monokai", fullName: "Monokai"}
        ],
        selectedTheme: themes[0].name
    });
  };

  setCookie = async () => {
    const editorTheme = this.root.value;
    const expirationDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toUTCString; // 10 years
    document.cookie = `theme=${editorTheme}; expires=${expirationDate}`
    this.closeEditorManager();
    window.location.reload()
  };

  handleChange = e => {
    this.setState({selectedTheme: e.target.value});
  };

  render() {
    const {isOpen} = this.props;

    return (
      <div className="editor-modal">
        <BaseDialog
          isOpen={isOpen}
          handleClose={this.closeEditorManager}
          useUpdatedStyles
          style={styles.dialog}
        >
          <h1 style={styles.header}>Editor theme</h1>
          <div>
            <div>
              <select
                name="theme"
                ref={element => (this.root = element)}
                onChange={this.handleChange}
                style={{marginBottom: 0}}
              >
                {this.state.themes.map(theme => (
                  <option key={theme.name} value={theme.name}>
                    {theme.fullName}
                  </option>
                ))}
              </select>
              <br />
              <Button
                text={'Save'}
                color={Button.ButtonColor.orange}
                onClick={this.setCookie}
              />
            </div>
          </div>
        )
        </BaseDialog>
      </div>
    );
  }
}

const styles = {
  dialog: {
    padding: '0 15px',
    cursor: 'default'
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    marginTop: 20
  },
};