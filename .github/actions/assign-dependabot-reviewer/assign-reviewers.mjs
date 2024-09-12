import {setFailed} from '@actions/core';
import {reviewersMap} from "./config/reviewers.mjs";
import github from "@actions/github";
import dedent from "dedent";

const GH_TOKEN = process.env.GH_TOKEN;

const REPO = github.context.repo.repo;
const REPO_OWNER = github.context.repo.owner;
const octokit = github.getOctokit(GH_TOKEN)

/**
 * Gets the pull request number, if the event was from a comment, pull it from the issue number
 * If the event was from a PR, pull it from the pull request number
 * @returns {number} The PR number
 */
function getPRNumber() {
    if (github.context.eventName === 'issue_comment') {
        return github.context.payload.issue.number;
    }

    return github.context.payload.pull_request.number;
}

/**
 * Gets the pull request title, if the event was from a comment, pull it from the issue
 * If the event was from a PR, pull it from the pull request
 * @returns {number} The PR number
 */
function getPRTitle() {
    if (github.context.eventName === 'issue_comment') {
        return github.context.payload.issue.title;
    }

    return github.context.payload.pull_request.title;
}

/**
 * Assigns the PR to a team
 * @param dependencyName The name of the dependency the PR is about
 * @param teamReviewers The teams to assign to
 */
async function assignReviewers(dependencyName, teamReviewers) {

    console.log(`request`,
        {owner: REPO_OWNER,
        repo: REPO,
        pull_number: getPRNumber(),
        team_reviewers: teamReviewers
})

    // Assign reviewer to PR
    await octokit.rest.pulls.requestReviewers({
        owner: REPO_OWNER,
        repo: REPO,
        pull_number: getPRNumber(),
        team_reviewers: teamReviewers
    });

    // Leave comment on PR
    await octokit.rest.issues.createComment({
        owner: REPO_OWNER,
        repo: REPO,
        issue_number: getPRNumber(),
        body: dedent`
        The maintainers for the dependency \`${dependencyName}\` is **${teamReviewers.join(',')}**.
        
        This pull request is open to anyone (including the public) to work on. If you have any questions, please feel free to contact **${teamReviewers.join(',')}**`
    });
}

/**
 * Gets the dependency from the PR title using a regex to extract from the group or single dependency
 * @param prTitle The PR title
 * @returns {RegExp}
 */
function getDependencyNameRegex(prTitle) {
    if (prTitle.includes('group')) {
        return /the (\S+) group/;
    }

    return /Bump (\S+) from/
}

/**
 * Extracts the dependency name from a PR title
 * @param str
 * @returns {null|string}
 */
function extractDependencyName(str) {
  const match = str.match(getDependencyNameRegex(str));

  // Return the first group or null if not found
  return match ? (match[1]).trim() : null;
}

async function main() {
    try {
        const prTitle = getPRTitle();
        // Determine the dependency using the title of the PR

        const reviewers = [];
        const dependencyName = extractDependencyName(prTitle);
        const configReviewer = reviewersMap[dependencyName];
        const reviewer = configReviewer != null ? configReviewer : 'platform';
        console.log(`Found ${reviewer} for ${dependencyName}`)

        if (reviewer != null) {
            reviewers.push(reviewer);
        }

        if (reviewers.length > 0) {
            await assignReviewers(dependencyName, reviewers);
            console.log(`Successfully assigned reviewers: ${reviewers.join(', ')}`);
        } else {
            console.log('No reviewers to assign based on updated dependencies.');
        }
    } catch (error) {
        console.error('Error:', error);
        setFailed(error);
    }
}

main();
