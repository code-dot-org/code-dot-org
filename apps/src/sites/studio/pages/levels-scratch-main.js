import loadScratch from "./init/loadScratch";
import loadAppOptions from "@cdo/apps/code-studio/initApp/loadApp";

loadAppOptions().then(loadScratch);
