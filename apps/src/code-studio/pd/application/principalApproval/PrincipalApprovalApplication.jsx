import PropTypes from 'prop-types';
import FormController from '../../form_components/FormController';
import PrincipalApprovalComponent from './PrincipalApprovalComponent';

export default class PrincipalApprovalApplication extends FormController {
  static propTypes = {
    ...FormController.propTypes,
    teacherApplication: PropTypes.shape({
      course: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      application_guid: PropTypes.string.isRequired,
      principal_first_name: PropTypes.string.isRequired,
      principal_last_name: PropTypes.string.isRequired,
      principal_title: PropTypes.string,
      principal_email: PropTypes.string.isRequired,
      school_id: PropTypes.string,
      school_zip: PropTypes.string
    }).isRequired,
    teacherApplicationSchoolStats: PropTypes.shape({
      students_total: PropTypes.string,
      frl_eligible_percent: PropTypes.string,
      white_percent: PropTypes.string,
      black_or_african_american_percent: PropTypes.string,
      hispanic_or_latino_percent: PropTypes.string,
      asian_percent: PropTypes.string,
      native_hawaiian_or_pacific_islander_percent: PropTypes.string,
      american_indian_alaskan_native_percent: PropTypes.string,
      two_or_more_races_percent: PropTypes.string
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
      course: props.teacherApplication.course,
      school: props.teacherApplication.school_id,
      schoolZipCode: props.teacherApplication.school_zip_code,
      totalStudentEnrollment:
        props.teacherApplicationSchoolStats.students_total,
      freeLunchPercent:
        props.teacherApplicationSchoolStats.frl_eligible_percent,
      white: props.teacherApplicationSchoolStats.white_percent,
      black:
        props.teacherApplicationSchoolStats.black_or_african_american_percent,
      hispanic: props.teacherApplicationSchoolStats.hispanic_or_latino_percent,
      asian: props.teacherApplicationSchoolStats.asian_percent,
      pacificIslander:
        props.teacherApplicationSchoolStats
          .native_hawaiian_or_pacific_islander_percent,
      americanIndian:
        props.teacherApplicationSchoolStats
          .american_indian_alaskan_native_percent,
      other: props.teacherApplicationSchoolStats.two_or_more_races_percent
    });
  }
  /**
   * @override
   */
  getPageComponents() {
    return [PrincipalApprovalComponent];
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
