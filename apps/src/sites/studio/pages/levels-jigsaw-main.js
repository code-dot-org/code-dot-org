import loadJigsaw from "./init/loadJigsaw";
import loadAppOptions from "@cdo/apps/code-studio/initApp/loadApp";

loadAppOptions().then(loadJigsaw);
