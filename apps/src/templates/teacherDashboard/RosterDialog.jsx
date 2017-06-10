import React from 'react';
import BaseDialog from '../BaseDialog';
import color from '../../util/color';
import locale from '@cdo/locale';

const styles = {
  footer: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    left: 20,
  },
  buttonPrimary: {
    float: 'right',
    background: color.orange,
    color: color.white,
    border: '1px solid #b07202',
    borderRadius: 3,
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.63)',
    fontSize: 14,
    padding: '8px 20px',
  },
  buttonSecondary: {
    background: '#eee',
    color: '#5b6770',
    border: '1px solid #c5c5c5',
  },
};

export default class RosterDialog extends React.Component {
  static propTypes = {
    handleClose: React.PropTypes.func,
    isOpen: React.PropTypes.bool,
  }
  constructor(props) {
    super(props);
    this.handleClose = this.props.handleClose.bind(this);
  }

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isOpen}
        handleClose={this.handleClose}
        assetUrl={() => ''}
        {...this.props}
      >
        <div style={styles.footer}>
          <button
            onClick={this.handleClose}
            style={styles.buttonPrimary}
          >
            {locale.continue()}
          </button>
        </div>
      </BaseDialog>
    );
  }
}
