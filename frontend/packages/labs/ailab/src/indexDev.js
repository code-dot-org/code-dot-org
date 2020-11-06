import { initAll } from "./index";
import "./assetPath";
import queryString from "query-string";

// A list of sample modes.  Should match the dropdown in index.html.
const sampleModes = {
  load_foods: { id: "load_dataset", setId: 3 }
};

// Look for a ?mode= parameter on the URL
let parameters = queryString.parse(location.search);
const mode = parameters["mode"] ? sampleModes[parameters["mode"]] : null;

// Initialize the app.
initAll({ mode: mode });
