import $ from 'jquery';
import AddParentEmailController from '@cdo/apps/lib/ui/accounts/AddParentEmailController';

$(document).ready(() => {
  new AddParentEmailController({
    form: $('#add-parent-email-modal-form'),
    link: $('#link_your_email')
  });

  const dismissButton = document.getElementById('not_now');
  const banner = document.getElementById('at-home-banner');

  dismissButton.onclick = () => {
    $.ajax({
      type: 'POST',
      url: '/api/v1/users/me/dismiss_parent_email_banner'
    }).done(() => {
      banner.style.display = 'none';
    });
  };
});
