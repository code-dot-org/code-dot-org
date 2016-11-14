import loadWeblab from "./init/loadWeblab";
import loadAppOptions from "@cdo/apps/code-studio/initApp/loadApp";

loadAppOptions().then(loadWeblab);
