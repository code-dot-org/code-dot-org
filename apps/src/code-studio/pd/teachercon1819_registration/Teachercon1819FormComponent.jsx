import LabeledFormComponent from '../form_components/LabeledFormComponent';

const TEACHER = "Teacher";
const FACILITATOR = "Facilitator";
const PARTNER = "Partner";
const LEAD_FACILITATOR = "LeadFacilitator";

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

  isLeadFacilitatorApplication() {
    return this.props.applicationType === LEAD_FACILITATOR;
  }
}
