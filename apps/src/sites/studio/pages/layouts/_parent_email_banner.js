import $ from 'jquery';
import AddParentEmailController from '@cdo/apps/lib/ui/accounts/AddParentEmailController';

$(document).ready(() => {
  const dismissButton = document.getElementById('not_now');
  const banner = document.getElementById('at-home-banner');
  new AddParentEmailController({
    form: $('#add-parent-email-modal-form'),
    link: $('#link_your_email'),
    onSuccessCallback: () => {
      banner.style.display = 'none';
    }
  });

  dismissButton.onclick = () => {
    $.ajax({
      type: 'POST',
      url: '/api/v1/users/me/dismiss_parent_email_banner'
    }).done(() => {
      banner.style.display = 'none';
    });
  };
});
