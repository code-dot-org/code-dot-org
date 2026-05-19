import initializeCodeMirror6 from '@cdo/apps/code-studio/initializeCodeMirror6';

const submitButton = document.querySelector('#library_submit');
initializeCodeMirror6('library_content', 'javascript', {
  onUpdateLinting: errors => {
    if (errors.length) {
      submitButton.setAttribute('disabled', 'disabled');
    } else {
      submitButton.removeAttribute('disabled');
    }
  },
  lintConfig: {
    es5: true,
    disableRecommendedJsConfig: true,
  },
});
