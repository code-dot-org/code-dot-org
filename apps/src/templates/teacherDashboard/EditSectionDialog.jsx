import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import BaseDialog from '../BaseDialog';
import EditSectionForm from "./EditSectionForm";
import PadAndCenter from './PadAndCenter';
import {
  isEditingSection,
} from './teacherSectionsRedux';
import i18n from '@cdo/locale';

export class EditSectionDialog extends Component {
  static propTypes = {
    //From Redux
    isOpen: PropTypes.bool.isRequired,
  };

  renderContent() {
    return (
      <EditSectionForm
        title={i18n.editSectionDetails()}
        handleSave={this.onClickEditSave}
      />
    );
  }

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={1010}
        isOpen={this.props.isOpen}
        uncloseable
        assetUrl={() => ''}
      >
        <PadAndCenter>
          {this.renderContent()}
        </PadAndCenter>
      </BaseDialog>
    );
  }
}

export default connect(state => ({
  isOpen: isEditingSection(state.teacherSections),
}))(EditSectionDialog);
