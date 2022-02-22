export default function copyToClipboard(str, onSuccess, onFailure) {
  navigator.clipboard.writeText(str).then(onSuccess, onFailure);
}
