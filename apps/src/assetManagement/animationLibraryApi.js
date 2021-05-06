export function getManifest() {
  return fetch(`/api/v1/animation-library/manifest/spritelab/en_us`).then(
    response => response.json()
  );
}
