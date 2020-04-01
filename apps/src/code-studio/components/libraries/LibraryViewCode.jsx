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
    onClose: PropTypes.func.isRequired,
    library: PropTypes.object.isRequired
  };

  componentDidMount() {
    const {library} = this.props;
    this.editor = new droplet.Editor(this.libraryCodeViewer, {
      mode: 'javascript',
      allowFloatingBlocks: false,
      enablePaletteAtStart: false,
      textModeAtStart: true,
      palette: []
    });

    this.editor.setValue(library.source);
    this.editor.setReadOnly(true);
  }

  render() {
    const {onClose, library} = this.props;
    return (
      <BaseDialog isOpen={true} handleClose={onClose} useUpdatedStyles>
        <Title>{library.name}</Title>
        <Body>
          <div style={{textAlign: 'left'}}>
            <p style={styles.message}>{library.description}</p>
            <div className="libraryCodeViewerContainer" style={styles.code}>
              <div ref={node => (this.libraryCodeViewer = node)} />
            </div>
          </div>
        </Body>
      </BaseDialog>
    );
  }
}
