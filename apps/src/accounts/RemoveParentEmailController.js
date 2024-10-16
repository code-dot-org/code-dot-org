/*
 * Removes the parent email from the student's account.
 */
export default class RemoveParentEmailController {
  /**
   * @param {jQuery} form The form which sets the parent email to nil.
   * @param {jQuery} link The link the student clicks in order to remove the parent email address from their account.
   */
  constructor({form, link}) {
    this.form = form;
    link.click(event => {
      event.preventDefault();
      form.submit();
    });
  }
}
