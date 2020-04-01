/* globals droplet */
import PropTypes from 'prop-types';
import React from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {Body, Title} from '@cdo/apps/templates/Dialog';
import color from '@cdo/apps/util/color';

const DEFAULT_MARGIN = 7;

const styles = {
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
      <BaseDialog isOpen={true} handleClose={onClose} useUpdatedStyles>
        <Title>{title}</Title>
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
