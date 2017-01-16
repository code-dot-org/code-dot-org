import loadBounce from "./init/loadBounce";
import loadAppOptions from "@cdo/apps/code-studio/initApp/loadApp";

loadAppOptions().then(loadBounce);
