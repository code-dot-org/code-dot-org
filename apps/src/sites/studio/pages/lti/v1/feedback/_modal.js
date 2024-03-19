/**
 * @file Inits the LtiFeedbackModalHandler on the LTI Feedback modal load.
 * @see dashboard/app/views/lti/v1/feedbacks/_modal.html.haml
 */
import getScriptData from '@cdo/apps/util/getScriptData';

class LtiFeedbackModalHandler {
  constructor(modalSelector, userKey) {
    this.modal = $(modalSelector);
    this.form = this.modal.find('form');
    this.modalKey = `lti-fm-${userKey}`;

    this.init();
  }

  init() {
    if (localStorage[this.modalKey]) {
      return this.modal.remove();
    } else {
      this.modal.modal('show');
    }

    this.modal.on('hidden', () => this.onClose());
    this.form.on('ajax:success', () => this.onSuccess());
    this.form.on('ajax:error', (event, xhr) => this.onError(xhr));
  }

  onClose() {
    localStorage[this.modalKey] = 'closed';
  }

  onSuccess() {
    this.form.hide();
    this.modal.find('#provided').show();
    localStorage[this.modalKey] = 'provided';
  }

  onError(xhr) {
    this.modal.find('.alert').remove();

    const errorMessage =
      xhr.status === 422 && xhr.responseText
        ? [$.parseJSON(xhr.responseText)].flat().join('<br/>')
        : xhr.statusText;

    this.form
      .find('.modal-body')
      .prepend(`<div class="alert alert-danger">${errorMessage}</div>`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const modalSelector = getScriptData('modalSelector');
  const userKey = getScriptData('userKey');

  new LtiFeedbackModalHandler(modalSelector, userKey);
});
