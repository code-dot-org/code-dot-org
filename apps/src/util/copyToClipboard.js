export default function copyToClipboard(str) {
  window.getSelection().removeAllRanges();

  const tempDiv = document.createElement('pre');
  tempDiv.innerText = str;
  document.body.appendChild(tempDiv);

  try {
    window.getSelection().selectAllChildren(tempDiv);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
  } finally {
    document.body.removeChild(tempDiv);
  }
}
