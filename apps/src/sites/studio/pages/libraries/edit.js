import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';

const submitButton = document.querySelector('#library_submit');
initializeCodeMirror('library_content', 'javascript', null, null, (_, errors) => {
  if (errors.length) {
    submitButton.setAttribute('disabled', 'disabled');
  } else {
    submitButton.removeAttribute('disabled');
  }
});
