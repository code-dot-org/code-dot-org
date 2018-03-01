import LabeledFormComponent from '../form_components/LabeledFormComponent';

const TEACHER = "Teacher";
const FACILITATOR = "Facilitator";
const PARTNER = "Partner";

export default class Teachercon1819FormComponent extends LabeledFormComponent {
  isTeacherApplication() {
    return this.props.applicationType === TEACHER;
  }

  isFacilitatorApplication() {
    return this.props.applicationType === FACILITATOR;
  }

  isPartnerApplication() {
    return this.props.applicationType === PARTNER;
  }
}
