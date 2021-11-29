/* globals droplet */
import PropTypes from 'prop-types';
import React from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {Body} from '@cdo/apps/templates/Dialog';
import color from '@cdo/apps/util/color';

const DEFAULT_MARGIN = 7;

export default class LibraryViewCode extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    sourceCode: PropTypes.string.isRequired,
    buttons: PropTypes.node
  };

  componentDidMount() {
    this.editor = new droplet.Editor(this.libraryCodeViewer, {
      mode: 'javascript',
      allowFloatingBlocks: false,
      enablePaletteAtStart: false,
      textModeAtStart: true,
      palette: []
    });

    this.editor.setValue(this.props.sourceCode);
    this.editor.setReadOnly(true);
  }

  render() {
    const {title, description, onClose, buttons} = this.props;

    return (
      <BaseDialog
        isOpen={true}
        handleClose={onClose}
        style={styles.dialog}
        useUpdatedStyles
      >
        <h1 style={styles.header}>{title}</h1>
        <Body>
          <div style={{textAlign: 'left'}}>
            <p style={styles.message}>{description}</p>
            <div className="libraryCodeViewerContainer" style={styles.code}>
              <div ref={node => (this.libraryCodeViewer = node)} />
            </div>
          </div>
        </Body>
        {buttons}
      </BaseDialog>
    );
  }
}

const styles = {
  dialog: {
    padding: 15
  },
  header: {
    textAlign: 'left',
    fontSize: 24,
    marginTop: 5,
    whiteSpace: 'pre-wrap',
    lineHeight: 1.25,
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  message: {
    color: color.dark_charcoal,
    margin: DEFAULT_MARGIN,
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    fontSize: 14,
    maxHeight: 95
  },
  code: {
    position: 'relative',
    // Our droplet editor requires a specific height to display correctly.
    // Therefore, we use `height` rather than `maxHeight` here.
    height: 390,
    margin: DEFAULT_MARGIN
  }
};
