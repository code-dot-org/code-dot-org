/**
 * The classification widget
 */

import { getFeatureDefinitions, createClassifier } from "./model.js";
import { createFeatureRow } from "./components/feature-row.js";
import { createVerdictDisplay } from "./components/verdict-display.js";

// Update layout on resize
const query = window.matchMedia("(max-width: 700px)");
const arrow = document.querySelector(".arrow");
function handleResize(e) {
  if (e.matches) {
    arrow.innerText = "↓";
  } else {
    arrow.innerText = "→";
  }
}
query.addEventListener("change", handleResize);
handleResize(query);

// Create classification model
const classifier = createClassifier();

// Create verdict display
const verdictDisplay = createVerdictDisplay();

// Create feature toggles
const featureValues = new Map();
const featureList = document.getElementById("feature-list");
for (const feature of getFeatureDefinitions()) {
  featureValues.set(feature.id, false);
  const row = createFeatureRow(feature, (on) => {
    featureValues.set(feature.id, on);
    predictAndRender();
  });
  featureList.appendChild(row.element);
}

// Render
function predictAndRender() {
  verdictDisplay.update(classifier.predict(featureValues));
}
predictAndRender();
