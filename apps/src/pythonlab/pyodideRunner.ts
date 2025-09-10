import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import ConsoleManager from '@codebridge/Console/ConsoleManager';
import {
  getSystemMessage,
  getTimestampMessage,
} from '@codebridge/Console/MessageHelpers';
import {MiniApps} from '@codebridge/constants';
import {AnyAction, Dispatch} from 'redux';

import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProgressManager from '@cdo/apps/lab2/progress/ProgressManager';
import {getFileByName} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {SVG_ID} from '@cdo/apps/maze/constants';
import pythonlabI18n from '@cdo/apps/pythonlab/locale';
import {getStore} from '@cdo/apps/redux';
import {captureThumbnailFromSvgPythonlabNeighborhood} from '@cdo/apps/util/thumbnail';

import {getValidationFromSource, RunType} from '../codebridge';

import PythonValidationTracker from './progress/PythonValidationTracker';
import {
  asyncRun,
  restartPyodideIfProgramIsRunning,
} from './pyodideWorkerManager';
import {runStudentTests, runValidationTests} from './pythonHelpers/scripts';

const appName = 'pythonlab';

export async function handleRunClick(
  runTests: boolean,
  dispatch: Dispatch<AnyAction>,
  source: MultiFileSource | undefined,
  progressManager: ProgressManager | null,
  validationFile?: ProjectFile
) {
  const consoleManager = CodebridgeRegistry.getInstance().getConsoleManager();
  if (!source) {
    const runType = runTests
      ? validationFile
        ? RunType.VALIDATION
        : RunType.TEST
      : RunType.RUN;

    consoleManager?.writeConsoleMessage(getTimestampMessage(runType));
    handleRunEndedUnexpectedly(consoleManager, pythonlabI18n.noCode());
    return;
  }
  if (runTests) {
    await runAllTests(source, dispatch, progressManager, validationFile);
  } else {
    // Run main.py
    consoleManager?.writeConsoleMessage(getTimestampMessage(RunType.RUN));
    const code = getFileByName(source.files, MAIN_PYTHON_FILE)?.contents;
    if (code === undefined) {
      handleRunEndedUnexpectedly(
        consoleManager,
        pythonlabI18n.noFileToRun({
          fileName: MAIN_PYTHON_FILE,
        })
      );
      return;
    }
    await runPythonCode(code, source);
    if (isNeighborhoodLevel()) {
      setProjectThumbnail();
    }
  }
}

export async function runPythonCode(
  mainFile: string,
  source: MultiFileSource,
  validationFile?: ProjectFile
) {
  try {
    const isNeighborhoodRun = isNeighborhoodLevel();
    if (isNeighborhoodRun) {
      CodebridgeRegistry.getInstance().getNeighborhood()?.reset();
      CodebridgeRegistry.getInstance().getNeighborhood()?.onRun();
    }
    // We only send all output to the neighborhood if this is a neighborhood level and
    // we are not running validation, as validation does not render to the neighborhood.
    const outputToNeighborhood = isNeighborhoodRun && !validationFile;
    return await asyncRun(
      mainFile,
      source,
      validationFile,
      outputToNeighborhood
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log(
      `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`
    );
  }
}

export function stopPythonCode() {
  if (isNeighborhoodLevel()) {
    CodebridgeRegistry.getInstance().getNeighborhood()?.onStop();
  }
  // This will terminate the worker and create a new one if there is a running program.
  restartPyodideIfProgramIsRunning();
}

export async function runAllTests(
  source: MultiFileSource,
  dispatch: Dispatch<AnyAction>,
  progressManager: ProgressManager | null,
  validationFile?: ProjectFile
) {
  // We default to using the validation file passed in. If it does not exist,
  // we check the source for the validation file (this is the case in start mode).
  const validationToRun = validationFile || getValidationFromSource(source);
  const consoleManager = CodebridgeRegistry.getInstance().getConsoleManager();
  if (validationToRun) {
    consoleManager?.writeConsoleMessage(
      getTimestampMessage(RunType.VALIDATION)
    );
    // We do a bit of a hack around the progress manager system here.
    // We reset validation to set all tests to pending, then updateProgress to propagate
    // the pending status into the progress state (only on updateProgress does the progress manager
    // check the validation state). After running we will update progress again to get the test results.
    // This makes it so we can show the test names with a pending status while the tests are running after the
    // first run for a level, which is a cleaner UI than wiping the tests completely.
    progressManager?.resetValidation();
    progressManager?.updateProgress();
    // We only send the separate validation file, because otherwise the
    // source already has the validation file.
    const result = await runPythonCode(
      runValidationTests(validationToRun.name),
      source,
      validationFile
    );
    if (result?.message) {
      // Get validation test results
      // After parsing, message is an array of objects {name: string, result: string}
      // where "name" is the name of the test and "result" is one of
      // "PASS/FAIL/ERROR/SKIP/EXPECTED_FAILURE/UNEXPECTED_SUCCESS"
      // See this PR for details: https://github.com/code-dot-org/pythonlab-packages/pull/5
      const testResults = JSON.parse(result.message);
      if (progressManager) {
        PythonValidationTracker.getInstance().setValidationResults(testResults);
        progressManager.updateProgress();
      }
    }
  } else {
    consoleManager?.writeConsoleMessage(
      getSystemMessage(getTimestampMessage(RunType.TEST))
    );
    // Otherwise, we look for files that follow the regex 'test*.py' and run those.
    await runPythonCode(runStudentTests(), source);
  }
}

function isNeighborhoodLevel() {
  return (
    getStore().getState().lab2Project.projectSources?.labConfig?.miniApp
      ?.name === MiniApps.Neighborhood
  );
}

function handleRunEndedUnexpectedly(
  consoleManager: ConsoleManager | null,
  message: string
) {
  consoleManager?.writeConsoleMessage(getSystemMessage(message, appName));
  if (isNeighborhoodLevel()) {
    // We reset, run, and close the neighborhood to ensure that the neighborhood
    // properly resets the run button back to run (from stop), and to reset the
    // neighborhood to its original state.
    CodebridgeRegistry.getInstance().getNeighborhood()?.reset();
    CodebridgeRegistry.getInstance().getNeighborhood()?.onRun();
    CodebridgeRegistry.getInstance().getNeighborhood()?.onClose();
  } else {
    consoleManager?.writeConsoleMessage('');
  }
}

async function setProjectThumbnail() {
  const neighborhood = CodebridgeRegistry.getInstance().getNeighborhood();
  neighborhood?.onClose();
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  const shouldCapture = projectManager?.getShouldCaptureThumbnail();
  if (!shouldCapture) return;
  await neighborhood?.waitUntilDone(); // Wait for neighborhood signal processing to be completed.
  const svg = document.getElementById(SVG_ID);
  const svgArg = svg instanceof SVGSVGElement ? svg : null;
  if (svgArg) {
    const pngBlob = await captureThumbnailFromSvgPythonlabNeighborhood(svgArg);
    projectManager?.setThumbnail(pngBlob);
  }
}
