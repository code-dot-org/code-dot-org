export default function copyToClipboard(str, onSuccess, onFailure) {
  if (navigator.clipboard && window.isSecureContext) {
    // Modern technique.
    navigator.clipboard.writeText(str).then(onSuccess, onFailure);
  } else {
    // Legacy technique.
    window.getSelection().removeAllRanges();

    const tempDiv = document.createElement('pre');
    tempDiv.innerText = str;
    document.body.appendChild(tempDiv);

    let errorOccurred = false;

    try {
      window.getSelection().selectAllChildren(tempDiv);
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
    } catch {
      if (onFailure) {
        onFailure();
      }
      errorOccurred = true;
    } finally {
      document.body.removeChild(tempDiv);
      if (!errorOccurred && onSuccess) {
        onSuccess();
      }
    }
  }
}
