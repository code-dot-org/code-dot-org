import {simpleGit} from 'simple-git';

export async function getAllTheThingsPagePath() {
  if (process.env.BRANCHED_TESTING_ENABLED) {
    const branchName = (await simpleGit().branch()).current.replaceAll(
      '/',
      '-',
    );

    return `/engineering/all-the-things-${branchName}`;
  }

  return `/engineering/all-the-things`;
}
