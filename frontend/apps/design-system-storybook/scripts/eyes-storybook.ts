import {exec} from 'child_process';
import dedent from 'dedent';
import process from 'node:process';

/**
 * Runs the Applitools eyes storybook SDK and generates a markdown report
 */
exec('yarn dotenv-run -- eyes-storybook', (error, stdout) => {
  const eyesFailureLink = stdout
    .split('\n')
    .find(line => line.includes('See details at'))
    ?.match(/(?<=See details at )\S+/)?.[0];

  const testsSuccessful =
    error == null && stdout.includes('No differences were found!');

  if (!eyesFailureLink || process.env.CI !== 'true') {
    console.log(stdout);
    console.log(error);
  }

  const report = dedent(`
        # 🖼️ Storybook Visual Comparison Report
            
        ${
          testsSuccessful
            ? `✅ No Storybook eyes differences detected!`
            : `⚠️⚠️⚠️ Detected Storybook eyes differences, see [report](${eyesFailureLink})!`
        }
        
        ${
          !testsSuccessful
            ? `
            A difference was found in our Storybook front-end visual comparison testing against the \`staging\` baseline.
            This difference was detected in Applitools Eyes and is viewable in the link above.
            
            ## Remediation steps:
            
            1. Open the [report](${eyesFailureLink})
            2. Determine whether the differences are expected based on this PR's changes
              a. <ins>**If expected**</ins>: Before merging this PR, accept the new baselines and re-run this action, it should pass.
              b. <ins>**If not expected**</ins>: Push updates to this PR to correct the differences.
        `
            : ``
        }
    `);

  console.log(dedent(report));
});
