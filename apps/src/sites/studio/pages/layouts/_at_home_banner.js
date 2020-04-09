import $ from 'jquery';
import AddParentEmailController from '@cdo/apps/lib/ui/accounts/AddParentEmailController';

$(document).ready(() => {
  new AddParentEmailController({
    form: $('#add-parent-email-modal-form'),
    link: $('#link_your_email')
  });
});
