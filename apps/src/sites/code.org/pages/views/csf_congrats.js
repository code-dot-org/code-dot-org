import experiments from '@cdo/apps/util/experiments';

const studioCertificate = experiments.isEnabled(experiments.STUDIO_CERTIFICATE);

if (studioCertificate) {
  const script = document.querySelector('script[data-studio-redirect-url]');
  const url = script.dataset['studioRedirectUrl'];
  window.location = url;
}
