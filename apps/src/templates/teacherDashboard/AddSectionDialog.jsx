import React, {Component, PropTypes} from 'react';
import locale from '@cdo/locale';
import BaseDialog from '../BaseDialog';
import color from '../../util/color';
import AddInitialStudentsView from './AddInitialStudentsView';

const styles = {
  title: {
    position: 'absolute',
    left: 20,
    color: color.dark_charcoal,
    margin: '15px 0',
  },
  content: {
    position: 'absolute',
    left: 20,
    top: 50,
    right: 20,
    bottom: 70,
    overflowY: 'scroll',
  },
  classroomRow: {
    padding: 10,
    cursor: 'pointer',
  },
  highlightRow: {
    backgroundColor: color.default_blue,
    color: color.white,
  },
  footer: {
    position: 'absolute',
    bottom: 15,
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
    float: 'left',
    background: '#eee',
    color: '#5b6770',
    border: '1px solid #c5c5c5',
  },
  error: {
    fontSize: 10,
    color: color.light_gray,
  },
};

export default class AddSectionDialog extends Component {
  static propTypes = {
    handleClose: PropTypes.func,
    isOpen: PropTypes.bool,
  };

  constructor(props) {
    super(props);
  }

  handleClose = () => this.props.handleClose();

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isOpen}
        handleClose={this.handleClose}
        assetUrl={() => ''}
        {...this.props}
      >
        <AddInitialStudentsView
          sectionName="Foobar"
        />
      </BaseDialog>
    );
  }
}
