import {simpleGit} from 'simple-git';

export async function getAllTheThingsPagePath() {
  if (process.env.BRANCHED_TESTING_ENABLED === 'true') {
    const maybeBranchName: string =
      process.env.PR_HEAD_REF ?? (await simpleGit().branch()).current;

    const branchName = maybeBranchName.replaceAll('/', '-');

    return `/engineering/all-the-things-${branchName}`;
  }

  return `/engineering/all-the-things`;
}
