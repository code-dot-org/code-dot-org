import {PropTypes} from 'react';
import FormController from '../../form_components/FormController';
import PrincipalApprovalComponent from './PrincipalApprovalFormComponent';

export default class PrincipalApproval1819Application extends FormController {
  static propTypes = {
    ...FormController.propTypes,
    teacherApplication: PropTypes.shape({
      course: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      application_guid: PropTypes.string.isRequired,
      principal_first_name: PropTypes.string.isRequired,
      principal_last_name: PropTypes.string.isRequired,
      principal_title: PropTypes.string,
      principal_email: PropTypes.string.isRequired
    }).isRequired
  }
  /**
   * @override
   */
  getPageComponents() {
    return [
      PrincipalApprovalComponent
    ];
  }

  /**
   * @override
   */
  getPageProps() {
    return {
      ...super.getPageProps(),
      teacherApplication: this.props.teacherApplication
    };
  }

  /**
   * @override
   */
  serializeFormData() {
    return {
      ...super.serializeFormData(),
      application_guid: this.props.teacherApplication.application_guid
    };
  }

  onSuccessfulSubmit() {
    window.location.reload(true);
  }
}
