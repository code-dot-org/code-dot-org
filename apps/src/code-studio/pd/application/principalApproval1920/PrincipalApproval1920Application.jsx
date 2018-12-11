import {PropTypes} from 'react';
import FormController from '../../form_components/FormController';
import PrincipalApproval1920Component from './PrincipalApproval1920Component';

export default class PrincipalApproval1920Application extends FormController {
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
  };
  /**
   * @override
   */
  constructor(props) {
    super(props);

    Object.assign(this.state.data, {
      firstName: props.teacherApplication.principal_first_name,
      lastName: props.teacherApplication.principal_last_name,
      title: props.teacherApplication.principal_title,
      email: props.teacherApplication.principal_email,
      course: props.teacherApplication.course
    });
  }
  /**
   * @override
   */
  getPageComponents() {
    return [
      PrincipalApproval1920Component
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
