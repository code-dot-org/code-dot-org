import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import i18n from '@cdo/locale';
import BaseDialog from '../BaseDialog';
import EditSectionForm from "./EditSectionForm";
import PadAndCenter from './PadAndCenter';
import {isEditingSection} from './teacherSectionsRedux';

class EditSectionDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired, // From Redux
  };

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={1010}
        assetUrl={() => ''}
        isOpen={this.props.isOpen}
        uncloseable
      >
        <PadAndCenter>
          <EditSectionForm title={i18n.editSectionDetails()}/>
        </PadAndCenter>
      </BaseDialog>
    );
  }
}

export default connect(state => ({
  isOpen: isEditingSection(state.teacherSections),
}))(EditSectionDialog);
