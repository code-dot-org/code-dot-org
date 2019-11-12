import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';
import GeneratedCode from '@cdo/apps/templates/feedback/GeneratedCode';
import Dialog, {Body, Title} from '@cdo/apps/templates/Dialog';

const DEFAULT_MARGIN = 7;

const styles = {
  generatedCode: {
    textAlign: 'left',
    margin: DEFAULT_MARGIN
  },
  cancelButton: {
    float: 'right'
  },
  addButton: {
    float: 'left',
    backgroundColor: color.orange,
    color: color.white
  }
};

export default class LibraryManagerDialog extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    library: PropTypes.object.isRequired,
    onAdd: PropTypes.func
  };

  render() {
    let {onAdd, isOpen, onClose, library} = this.props;
    return (
      <Dialog isOpen={isOpen} handleClose={onClose} useUpdatedStyles>
        <Title>
          <div>{library.name}</div>
        </Title>
        <Body>
          <GeneratedCode
            message={library.description || ''}
            code={library.source || ''}
            style={styles.generatedCode}
          />
          {onAdd && (
            <button
              style={styles.addButton}
              type="button"
              onClick={() => onAdd(library.id)}
            >
              Import
            </button>
          )}
          <button
            style={styles.cancelButton}
            type="button"
            onClick={() => onClose()}
          >
            Cancel
          </button>
        </Body>
      </Dialog>
    );
  }
}
