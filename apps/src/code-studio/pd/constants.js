/**
 * @fileoverview Constants used in pd components.
 */

import * as utils from '../../utils';

/** Default max height for the React-Select menu popup, as defined in the imported react-select.css,
 * is 200px for the container, and 198 for the actual menu (to accommodate 2px for the border).
 * React-Select has props for overriding these default css styles. Increase the max height here:
 */
exports.SelectStyleProps = {
  menuContainerStyle: {
    maxHeight: 400,
  },
  menuStyle: {
    maxHeight: 398,
  },
};

export const PrivacyDialogMode = utils.makeEnum(
  'TEACHER_APPLICATION',
  'PRINCIPAL_APPROVAL'
);

export const DATE_ORDER_ASC = 'date asc';
export const DATE_ORDER_DESC = 'date desc';

export const DATA_SHARING_NOTICE = `Code.org works closely with local Regional Partners and Code.org facilitators to deliver the Professional Learning Program. By enrolling in this workshop, you are agreeing to allow Code.org to share your personal information on how you use Code.org and the Professional Learning resources with your Regional Partner, school district, and facilitators. We will share your contact information, which courses or units you are teaching and any aggregate data about your classes with these partners. This includes the number of students in your classes, the demographic breakdown of your classroom, and the name of your school and district. We will not share any personal information about individual students with our partners - all information will be de-identified and aggregated. Our Regional Partners and facilitators are contractually obligated to treat your information with the same level of privacy and confidentiality as Code.org.`;
