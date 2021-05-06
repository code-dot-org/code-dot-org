export function getManifest(appType, locale) {
  return fetch(`/api/v1/animation-library/manifest/${appType}/${locale}`).then(
    response => response.json()
  );
}
