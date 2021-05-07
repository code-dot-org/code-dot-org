// import msg from '@cdo/javalab/locale'
export function handleException(exceptionDetails, callback) {
  const type = exceptionDetails.value;
  const detail = exceptionDetails.detail;
  let args = {};
  if (detail.connectionId) {
    args.connectionId = detail.connectionId;
  }
  if (detail.cause) {
    args.cause = detail.cause;
  }
  callback(window.locales.javalab_locale[type](args));
}
