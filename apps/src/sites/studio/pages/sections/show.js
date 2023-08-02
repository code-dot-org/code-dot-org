import clientState from '@cdo/apps/code-studio/clientState.js';

const script = document.querySelector('script[data-section]');
const sectionData = JSON.parse(script.dataset['section']);
const {loginType, loginTypeWord, loginTypePicture, pairingAllowed} =
  sectionData;

$(function () {
  // Select name.
  $('ul.students li').click(function () {
    $('ul.students li').removeClass('selected');
    $(this).addClass('selected');
    $('input#user_id').val($(this).attr('id'));

    if (loginType === loginTypeWord) {
      // Clear the password.
      $('#secret_words').val('');
    } else if (loginType === loginTypePicture) {
      // Deselect picture.
      $('ul.pictures li').removeClass('selected');
    }

    // Disable the login button.
    $('#login_button').prop('disabled', true);

    // Hide the pairing checkbox
    $('#pairing_checkbox').hide();

    // Reveal the secret section...
    $('#secret').hide().slideDown();

    // ...and simultaneously fade in the login button.
    $('#login_button').fadeIn();
  });

  // Select secret picture.
  $('ul.pictures li').click(function () {
    $('ul.pictures li').removeClass('selected');
    $(this).addClass('selected');
    $('input#secret_picture_id').val($(this).attr('id'));

    // Show the pairing checkbox
    if (pairingAllowed) {
      $('#pairing_checkbox').show();
    }

    // Enable the login button.
    $('#login_button').prop('disabled', false);
  });

  // Type something in password box.
  $('#secret_words').keyup(function () {
    // Show the pairing checkbox
    if (pairingAllowed) {
      $('#pairing_checkbox').show();
    }

    // Enable the login button.
    $('#login_button').prop('disabled', false);
  });

  $('.section-user-sign-in').on('submit', clientState.reset);
});
