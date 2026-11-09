/**
 * A feature toggle
 */

export function createFeatureRow(feature, onToggle) {
  const template = document.getElementById("feature-row-template");
  const node = template.content.firstElementChild.cloneNode(true);

  const nameEl = node.querySelector(".feature-name");
  const input = node.querySelector("input");

  // The wrapping <label class="feature"> makes the whole row the activation
  // target and supplies the checkbox's accessible name from this text, so no
  // aria-label is needed (avoids a duplicated, drift-prone name).
  nameEl.textContent = feature.name;
  input.addEventListener("change", () => onToggle(input.checked));

  return { element: node };
}
