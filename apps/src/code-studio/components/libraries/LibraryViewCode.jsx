/* globals droplet */
import PropTypes from 'prop-types';
import React from 'react';
import Dialog, {Body, Title} from '@cdo/apps/templates/Dialog';
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
    isOpen: PropTypes.bool.isRequired,
    library: PropTypes.object.isRequired
  };

  componentDidUpdate(prevProps) {
    if (prevProps.isOpen === false && this.props.isOpen === true) {
      this.onOpen();
    }
  }

  onOpen = () => {
    const {library} = this.props;
    this.editor = new droplet.Editor(this.refs.libraryCodeViewer, {
      mode: 'javascript',
      allowFloatingBlocks: false,
      enablePaletteAtStart: false,
      textModeAtStart: true,
      palette: []
    });

    this.editor.setValue(library.source);
    this.editor.setReadOnly(true);
  };

  render() {
    const {isOpen, onClose, library} = this.props;
    return (
      <Dialog isOpen={isOpen} handleClose={onClose} useUpdatedStyles>
        <Title>
          <div>{library.name}</div>
        </Title>
        <Body>
          <div style={{textAlign: 'left'}}>
            <div style={styles.message}>{library.description}</div>
            <div className="libraryCodeViewerContainer" style={styles.code}>
              <div ref="libraryCodeViewer" />
            </div>
          </div>
        </Body>
      </Dialog>
    );
  }
}
