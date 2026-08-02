// The default project's rules, registered — what a name means here.
//
// A `.rule` refers to another by NAME ("Physics"), and the module that name
// lives in is looked up when code is generated. The editor and the headless
// generator both do that lookup against the project they have open; a test
// generating a module from one of the default project's rules has to do the
// same, or `use rule Physics` names a rule nothing has heard of.

import {DEFAULT_PROJECT} from '../../constants';
import {projectFiles} from '../../runtime/projectFiles';
import {projectRuleMetas} from '../projectModules';
import {registerProjectRules} from '../ruleRegistry';

/** Register every `.rule` the default project ships, as the editor would. */
export function registerDefaultProjectRules(): void {
  registerProjectRules(projectRuleMetas(projectFiles(DEFAULT_PROJECT.source)));
}
