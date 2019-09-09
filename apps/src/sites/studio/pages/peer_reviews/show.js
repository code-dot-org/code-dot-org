import PlcHeader from '@cdo/apps/code-studio/plc/header';

window.dashboard.plcHeader = PlcHeader;

// For PLC reviewers, the submit button is disabled by default.
// Enable it once a radio button is selected.
function enableSubmitOnRadioChange() {
  const form = document.querySelector('form.edit_peer_review');
  const radios = form.querySelectorAll('input[type=radio]');
  const submitButton = form.querySelector('input[type=submit]');
  if (submitButton.disabled) {
    const onRadioChange = () => {
      submitButton.disabled = false;
      radios.forEach(el => el.removeEventListener('change', onRadioChange));
    };
    radios.forEach(el => el.addEventListener('change', onRadioChange));
  }
}

window.addEventListener('DOMContentLoaded', function onDomContentLoaded() {
  window.removeEventListener('DOMContentLoaded', onDomContentLoaded);
  enableSubmitOnRadioChange();
});
