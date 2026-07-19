import {useAppSelector, useCodebridgeSettings} from '@code-dot-org/codebridge';
import {useMaybeLevelProperties} from '@code-dot-org/lab/contexts';
import {useThemeSetting} from '@code-dot-org/lab/hooks';
import ResourcePanel from '@code-dot-org/lab/resourcePanel';

/**
 * The left-hand instructions / resource panel, built on the base
 * `ResourcePanel` (the same component music lab uses). It renders the level's
 * `longInstructions`, version history, and lesson navigation, reading run state
 * from the base `labSystem` slice.
 *
 * PythonLayout only mounts inside `CodebridgeLab`, which renders its children
 * only once level properties resolve, so they are present here.
 */
const InstructionsPanel = () => {
  const levelProperties = useMaybeLevelProperties();
  const isRunning = useAppSelector(state => state.labSystem.isRunning);
  const hasRun = useAppSelector(state => state.labSystem.hasRun);
  // Codebridge contributes the editor/console font-size settings; Python Lab
  // supports both themes, so it also opts in to the theme toggle (its editor
  // carries a matching light and dark theme). Order matches legacy: font sizes,
  // then theme.
  const codebridgeSettings = useCodebridgeSettings();
  const themeSetting = useThemeSetting(['Light', 'Dark']);
  const settings = themeSetting
    ? [...codebridgeSettings, themeSetting]
    : codebridgeSettings;

  if (!levelProperties) {
    return null;
  }

  return (
    <ResourcePanel
      levelProperties={levelProperties}
      isRunning={isRunning}
      hasRun={hasRun}
      hasEdited={false}
      documentationUrl="/docs/ide/python"
      settings={settings}
    />
  );
};

export default InstructionsPanel;
