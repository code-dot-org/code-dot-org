import PropTypes from 'prop-types';
import React from 'react';
import GeneratedCode from '@cdo/apps/templates/feedback/GeneratedCode';
import Dialog, {Body, Title} from '@cdo/apps/templates/Dialog';

const DEFAULT_MARGIN = 7;

const styles = {
  generatedCode: {
    textAlign: 'left',
    margin: DEFAULT_MARGIN
  }
};

export default class LibraryViewCode extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    library: PropTypes.object.isRequired
  };

  render() {
    let {isOpen, onClose, library} = this.props;
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
        </Body>
      </Dialog>
    );
  }
}
