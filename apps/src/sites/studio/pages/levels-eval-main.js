import loadEval from "./init/loadEval";
import loadAppOptions from "@cdo/apps/code-studio/initApp/loadApp";

loadAppOptions().then(loadEval);
