import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import BaseDialog from '../BaseDialog';
import LoginTypePicker from './LoginTypePicker';
import EditSectionForm from "./EditSectionForm";
import PadAndCenter from './PadAndCenter';
import i18n from '@cdo/locale';
import {sectionShape} from './shapes';
import {isAddingSection} from './teacherSectionsRedux';

export class AddSectionDialog extends Component {
  static propTypes = {
    // Provided by Redux
    isOpen: PropTypes.bool.isRequired,
    section: sectionShape,
  };

  render() {
    const {isOpen, section} = this.props;
    const {loginType} = section || {};
    const title = i18n.newSection();
    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={1010}
        isOpen={isOpen}
        uncloseable
        assetUrl={() => ''}
      >
        <PadAndCenter>
          {!loginType && /* First page */
            <LoginTypePicker title={title}/>
          }
          {loginType && /* Second page */
            <EditSectionForm title={title}/>
          }
        </PadAndCenter>
      </BaseDialog>
    );
  }
}

export default connect(state => ({
  isOpen: isAddingSection(state.teacherSections),
  section: state.teacherSections.sectionBeingEdited,
}))(AddSectionDialog);
