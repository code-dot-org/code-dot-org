import './oceans/styles/oceansLab.css';

// Default export: the base-package-wrapped entrypoint (sources its config from
// level properties via <Lab>).
export {default} from './App';
export type {OceansLabProps} from './App';

// The raw, provider-free canvas activity, for hosts (or the dev harness) that
// drive appMode/guides directly without the base <Lab> shell.
export {default as OceansActivity} from './OceansActivity';
export type {OceansActivityProps} from './OceansActivity';

export {initAll} from './oceans/init';
export type {InitAllOptions} from './oceans/init';

export {LevelKindSchema, OceansLevelPropertiesSchema} from './schema';
export type {OceansLevelProperties} from './schema';
