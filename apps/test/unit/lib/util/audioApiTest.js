import {expect} from '../../../util/configuredChai';
import {commands, executors, dropletConfig} from '@cdo/apps/lib/util/audioApi';

describe('Audio API', function() {

  // Check that every command, has an executor, has a droplet config entry.
  // May eventually need to allow droplet config entries to not have a matching
  // executor because they get aliased.
  it('is internally complete', function () {
    for (let commandName in commands) {
      if (!commands.hasOwnProperty(commandName)) continue;
      expect(executors).to.have.ownProperty(commandName);
      expect(dropletConfig).to.have.ownProperty(commandName);
    }

    for (let commandName in executors) {
      if (!executors.hasOwnProperty(commandName)) continue;
      expect(commands).to.have.ownProperty(commandName);
      expect(dropletConfig).to.have.ownProperty(commandName);
    }

    for (let commandName in dropletConfig) {
      if (!dropletConfig.hasOwnProperty(commandName)) continue;
      expect(dropletConfig[commandName].func).to.equal(commandName);
      expect(dropletConfig[commandName].parent).to.equal(executors);
      expect(commands).to.have.ownProperty(commandName);
      expect(executors).to.have.ownProperty(commandName);
    }
  });
});
