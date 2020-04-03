import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import BaseDialog from '../BaseDialog';
import EditSectionForm, {ReloadAfterEditSectionForm} from './EditSectionForm';
import PadAndCenter from './PadAndCenter';
import {isEditingSection} from './teacherSectionsRedux';

/**
 * UI for a teacher to edit details of an existing class section.
 * For adding a new section, see AddSectionDialog.
 */
function editSectionDialog(Form) {
  class EditSectionDialog extends Component {
    static propTypes = {
      isOpen: PropTypes.bool.isRequired // From Redux
    };

    render() {
      return (
        <BaseDialog
          useUpdatedStyles
          fixedWidth={1010}
          fullHeight
          isOpen={this.props.isOpen}
          uncloseable
        >
          <PadAndCenter>
            <Form title={i18n.editSectionDetails()} isNewSection={false} />
          </PadAndCenter>
        </BaseDialog>
      );
    }
  }
  return EditSectionDialog;
}

export default connect(state => ({
  isOpen: isEditingSection(state.teacherSections)
}))(editSectionDialog(EditSectionForm));

export const ReloadAfterEditSectionDialog = connect(state => ({
  isOpen: isEditingSection(state.teacherSections)
}))(editSectionDialog(ReloadAfterEditSectionForm));
