import loadMaze from "./init/loadMaze";
import loadAppOptions from "@cdo/apps/code-studio/initApp/loadApp";

loadAppOptions().then(loadMaze);
