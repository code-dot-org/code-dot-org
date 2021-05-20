import React from 'react';
import ReactDOM from 'react-dom';
import AddParentEmailModal from './AddParentEmailModal';

/**
 * This controller submits a hidden Rails-generated form that adds a parent
 * email to an account.  It expects a jQuery wrapper for that form to be
 * provided on construction. When the user submits a parent email,
 * this controller loads the relevant information into the hidden Rails form
 * and calls submit(). Rails injects all the JavaScript needed for the form to
 * submit via AJAX with all the appropriate validation tokens, etc.
 * The controller subscribes to events emitted by the Rails helper JavaScript
 * to detect success or errors.
 *
 * Read more:
 * http://guides.rubyonrails.org/working_with_javascript_in_rails.html#rails-ujs-event-handlers
 * https://github.com/rails/jquery-ujs
 */
export default class AddParentEmailController {
  /**
   * @param {jQuery} form
   * @param {jQuery} link
   * @param {jQuery} onSuccess
   */
  constructor({
    form,
    formParentEmailField,
    formParentOptInField,
    link,
    onSuccessCallback
  }) {
    this.form = form;
    this.formParentEmailField = formParentEmailField;
    this.formParentOptInField = formParentOptInField;
    this.onSuccessCallback = onSuccessCallback;
    link.click(event => {
      event.preventDefault();
      this.showAddParentEmailModal();
    });
  }

  showAddParentEmailModal = () => {
    if (this.mountPoint) {
      return; // Idempotent show
    }

    const handleSubmit = values =>
      this.submitParentEmailChange(values).then(this.onParentEmailChanged);
    this.mountPoint = document.createElement('div');
    document.body.appendChild(this.mountPoint);
    ReactDOM.render(
      <AddParentEmailModal
        handleSubmit={handleSubmit}
        handleCancel={this.hideAddParentEmailModal}
        currentParentEmail={this.formParentEmailField.val()}
      />,
      this.mountPoint
    );
  };

  hideAddParentEmailModal = () => {
    if (this.mountPoint) {
      ReactDOM.unmountComponentAtNode(this.mountPoint);
      document.body.removeChild(this.mountPoint);
      delete this.mountPoint;
    }
  };

  onParentEmailChanged = parentEmail => {
    if (this.onSuccessCallback) {
      this.onSuccessCallback(parentEmail);
    }
    this.hideAddParentEmailModal();
  };

  submitParentEmailChange({parentEmail, parentEmailOptIn}) {
    return new Promise((resolve, reject) => {
      const onSuccess = () => {
        detachHandlers();
        resolve(parentEmail);
      };

      const onFailure = (_, xhr) => {
        const validationErrors = xhr.responseJSON;
        let error;
        if (validationErrors) {
          error = {
            serverErrors: {
              parentEmail: validationErrors.email && validationErrors.email[0]
            }
          };
        } else {
          error = new Error('Unexpected failure: ' + xhr.status);
        }
        detachHandlers();
        reject(error);
      };

      // Subscribe to jquery-ujs events before we submit, and unsubscribe after
      // the request is complete.
      const detachHandlers = () => {
        this.form.on('ajax:success', onSuccess);
        this.form.on('ajax:error', onFailure);
      };
      this.form.on('ajax:success', onSuccess);
      this.form.on('ajax:error', onFailure);
      this.formParentEmailField.val(parentEmail);
      this.formParentOptInField.val(parentEmailOptIn);
      this.form.submit();
    });
  }
}
