import React, {Component, PropTypes} from 'react';
import locale from '@cdo/locale';
import BaseDialog from '../BaseDialog';
import color from '../../util/color';
import AddInitialStudentsView from './AddInitialStudentsView';

const styles = {

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
        fixedWidth={1010}
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
