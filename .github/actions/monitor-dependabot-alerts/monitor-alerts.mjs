import {setFailed, info, warning, error} from '@actions/core';
import github from "@actions/github";
import {reviewersMap} from '../assign-dependabot-reviewer/config/reviewers.mjs';

const GH_TOKEN = process.env.GH_TOKEN;
const REPO = github.context.repo.repo;
const REPO_OWNER = github.context.repo.owner;
const octokit = github.getOctokit(GH_TOKEN);

// Label to identify our auto-generated issues
const ISSUE_LABEL = 'dependabot-alerts-monitor';
// Prefix for issue titles
const ISSUE_TITLE_PREFIX = 'Dependabot Alert Without PR';

/**
 * Get all open Dependabot alerts
 */
async function getDependabotAlerts() {
    const alerts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        try {
            const response = await octokit.rest.dependabot.listAlertsForRepo({
                owner: REPO_OWNER,
                repo: REPO,
                state: 'open',
                per_page: 100,
                page: page
            });

            alerts.push(...response.data);
            hasMore = response.data.length === 100;
            page++;
        } catch (err) {
            error(`Failed to fetch alerts: ${err.message}`);
            throw err;
        }
    }

    return alerts;
}

/**
 * Check if there's an open Dependabot PR for a given dependency
 */
async function hasOpenDependabotPR(dependencyName, ecosystem) {
    try {
        // Normalize dependency name (remove @scope/, handle Rails components)
        const normalizedName = dependencyName.toLowerCase()
            .replace(/^@[^/]+\//, '') // Remove npm scopes
            .replace(/^rails$/, 'rails') // Keep rails as-is
            .replace(/^activestorage$/, 'activestorage') // Rails component
            .replace(/^action/, 'action'); // actionmailer, actionpack, etc.
        
        // Search for PRs from dependabot[bot]
        const query = `repo:${REPO_OWNER}/${REPO} is:pr is:open author:app/dependabot`;
        const response = await octokit.rest.search.issuesAndPullRequests({
            q: query
        });

        // Check PRs with "Bump {dependencyName}" pattern
        const prs = response.data.items.filter(pr => {
            const title = pr.title.toLowerCase();
            const depName = normalizedName;
            
            // Match patterns like:
            // - "Bump activestorage from X to Y"
            // - "Bump the rails group"
            // - "Bump @scope/package from X to Y"
            return title.includes(`bump ${depName}`) || 
                   title.includes(`bump ${depName.split('/').pop()}`) ||
                   (depName.includes('action') && title.includes(`bump action`)) ||
                   (depName === 'activestorage' && title.includes('bump activestorage'));
        });

        return prs.length > 0;
    } catch (err) {
        warning(`Failed to check for PR for ${dependencyName}: ${err.message}`);
        return false; // Assume no PR if we can't check
    }
}

/**
 * Get severity level as numeric value for sorting
 */
function getSeverityValue(severity) {
    const severityMap = {
        'critical': 4,
        'high': 3,
        'medium': 2,
        'low': 1,
        'moderate': 2
    };
    return severityMap[severity?.toLowerCase()] || 0;
}

/**
 * Format alert for output
 */
function formatAlert(alert) {
    const dep = alert.dependency;
    const vuln = alert.security_vulnerability;
    const severity = vuln?.severity || 'unknown';
    const cvss = vuln?.cvss?.score || 'N/A';
    
    return {
        number: alert.number,
        dependency: dep?.package?.name || 'unknown',
        ecosystem: dep?.package?.ecosystem || 'unknown',
        severity: severity,
        cvss: cvss,
        summary: vuln?.summary || alert.advisory?.summary || 'No summary',
        cve: vuln?.cve_id || vuln?.identifier || 'N/A',
        url: alert.html_url,
        created_at: alert.created_at
    };
}

/**
 * Get team reviewer for a dependency using reviewersMap
 */
function getTeamReviewer(dependencyName) {
    // Normalize dependency name (remove npm scopes, handle Rails components)
    const normalized = dependencyName.toLowerCase()
        .replace(/^@[^/]+\//, '') // Remove npm scopes like @types/
        .replace(/^action/, 'action'); // Keep actionmailer, actionpack, etc.
    
    // Check exact match first
    if (reviewersMap[dependencyName]) {
        return reviewersMap[dependencyName];
    }
    
    // Check normalized name
    if (reviewersMap[normalized]) {
        return reviewersMap[normalized];
    }
    
    // Check without scope
    const withoutScope = dependencyName.split('/').pop();
    if (reviewersMap[withoutScope]) {
        return reviewersMap[withoutScope];
    }
    
    // Default to platform
    return 'platform';
}

/**
 * Get unique team reviewers for a list of alerts
 */
function getUniqueTeamReviewers(alerts) {
    const teams = new Set();
    alerts.forEach(alert => {
        const team = getTeamReviewer(alert.dependency);
        teams.add(team);
    });
    return Array.from(teams);
}

/**
 * Create or update GitHub issue for a single alert without PR
 */
async function createOrUpdateIssueForAlert(alert) {
    const dependencyName = alert.dependency;
    const team = getTeamReviewer(dependencyName);
    const daysOpen = Math.floor((new Date() - new Date(alert.created_at)) / (1000 * 60 * 60 * 24));
    
    const issueTitle = `${ISSUE_TITLE_PREFIX} - ${dependencyName}`;
    
    let issueBody = `## ⚠️ Dependabot Alert Without Pull Request\n\n`;
    issueBody += `Dependabot detected a security vulnerability but **could not automatically create a PR**.\n\n`;
    issueBody += `**Dependency:** \`${dependencyName}\` (${alert.ecosystem})\n`;
    issueBody += `**Severity:** ${alert.severity.toUpperCase()} (CVSS: ${alert.cvss})\n`;
    issueBody += `**CVE:** ${alert.cve}\n`;
    issueBody += `**Days Open:** ${daysOpen}\n`;
    issueBody += `**Dependabot Alert:** [#${alert.number}](${alert.url})\n`;
    issueBody += `**Assigned Team:** ${team}\n\n`;
    issueBody += `**Summary:**\n${alert.summary}\n\n`;
    issueBody += `---\n\n`;
    issueBody += `**Why no PR?**\n`;
    issueBody += `Dependabot cannot resolve path-based dependencies in \`Gemfile\` (local engines). This requires manual PR creation.\n\n`;
    issueBody += `**Action Required:**\n`;
    issueBody += `1. Manually create a PR to update \`${dependencyName}\` to a patched version\n`;
    issueBody += `2. Test that the update doesn't break local engines\n`;
    issueBody += `3. Merge and deploy\n\n`;
    issueBody += `*This issue is auto-generated and will be updated daily if the alert persists.*\n`;

    // Search for existing issue by title (dependency name)
    try {
        const existingIssue = await findExistingIssueForDependency(dependencyName);
        
        if (existingIssue) {
            // Update existing issue
            await octokit.rest.issues.update({
                owner: REPO_OWNER,
                repo: REPO,
                issue_number: existingIssue.number,
                title: issueTitle,
                body: issueBody,
                state: 'open' // Reopen if it was closed
            });
            info(`✅ Updated existing issue #${existingIssue.number} for ${dependencyName}`);
        } else {
            // Create new issue
            const newIssue = await octokit.rest.issues.create({
                owner: REPO_OWNER,
                repo: REPO,
                title: issueTitle,
                body: issueBody,
                labels: ['dependabot', 'security', 'automated', ISSUE_LABEL, team]
            });
            info(`✅ Created new issue #${newIssue.data.number} for ${dependencyName}`);
        }
    } catch (err) {
        error(`Failed to create/update issue for ${dependencyName}: ${err.message}`);
        throw err;
    }
}

/**
 * Process all alerts without PRs - create/update one issue per dependency
 */
async function processAlertsWithoutPRs(alertsWithoutPRs) {
    if (alertsWithoutPRs.length === 0) {
        info('✅ All critical/high alerts have associated PRs or are low severity');
        return;
    }

    // Sort by severity (critical first)
    alertsWithoutPRs.sort((a, b) => {
        const severityDiff = getSeverityValue(b.severity) - getSeverityValue(a.severity);
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.created_at) - new Date(a.created_at);
    });

    // Filter to only critical and high severity
    const criticalAlerts = alertsWithoutPRs.filter(a => 
        getSeverityValue(a.severity) >= 3
    );

    if (criticalAlerts.length === 0) {
        info('✅ No critical/high severity alerts without PRs');
        return;
    }

    info(`Processing ${criticalAlerts.length} critical/high alerts without PRs...`);

    // Create/update one issue per dependency
    for (const alert of criticalAlerts) {
        await createOrUpdateIssueForAlert(alert);
    }

    // Close issues for dependencies that now have PRs
    await closeResolvedIssues(criticalAlerts);
}

/**
 * Find existing issue for a specific dependency
 */
async function findExistingIssueForDependency(dependencyName) {
    try {
        const searchQuery = `repo:${REPO_OWNER}/${REPO} is:issue label:${ISSUE_LABEL} "${ISSUE_TITLE_PREFIX} - ${dependencyName}"`;
        const searchResults = await octokit.rest.search.issuesAndPullRequests({
            q: searchQuery
        });
        
        // Find exact match (title should be exactly "Dependabot Alert Without PR - {dependencyName}")
        const exactMatch = searchResults.data.items.find(issue => 
            issue.title === `${ISSUE_TITLE_PREFIX} - ${dependencyName}`
        );
        
        return exactMatch || null;
    } catch (err) {
        warning(`Failed to search for existing issue for ${dependencyName}: ${err.message}`);
        return null;
    }
}

/**
 * Close issues for dependencies that now have PRs or are resolved
 */
async function closeResolvedIssues(currentAlerts) {
    try {
        // Get all issues with our label
        const allIssues = await octokit.rest.issues.listForRepo({
            owner: REPO_OWNER,
            repo: REPO,
            labels: ISSUE_LABEL,
            state: 'open',
            per_page: 100
        });

        // Get list of dependencies that currently have alerts without PRs
        const currentDependencies = new Set(currentAlerts.map(a => a.dependency));

        // Close issues for dependencies that are no longer in the list
        for (const issue of allIssues.data) {
            // Extract dependency name from title: "Dependabot Alert Without PR - {name}"
            const match = issue.title.match(new RegExp(`${ISSUE_TITLE_PREFIX} - (.+)`));
            if (match) {
                const dependencyName = match[1];
                if (!currentDependencies.has(dependencyName)) {
                    // This dependency no longer has an alert without PR, close the issue
                    await octokit.rest.issues.update({
                        owner: REPO_OWNER,
                        repo: REPO,
                        issue_number: issue.number,
                        state: 'closed'
                    });
                    info(`✅ Closed issue #${issue.number} for ${dependencyName} (alert resolved or PR created)`);
                }
            }
        }
    } catch (err) {
        warning(`Failed to close resolved issues: ${err.message}`);
    }
}

/**
 * Main function
 */
async function main() {
    try {
        info('🔍 Fetching Dependabot alerts...');
        const alerts = await getDependabotAlerts();
        info(`Found ${alerts.length} open alerts`);

        if (alerts.length === 0) {
            info('✅ No open Dependabot alerts');
            return;
        }

        info('🔍 Checking which alerts have associated PRs...');
        const alertsWithoutPRs = [];
        
        for (const alert of alerts) {
            const formatted = formatAlert(alert);
            const hasPR = await hasOpenDependabotPR(formatted.dependency, formatted.ecosystem);
            
            if (!hasPR) {
                alertsWithoutPRs.push(formatted);
                warning(`⚠️ Alert #${formatted.number} (${formatted.dependency}) has no PR`);
            } else {
                info(`✅ Alert #${formatted.number} (${formatted.dependency}) has PR`);
            }
        }

        info(`Found ${alertsWithoutPRs.length} alerts without PRs`);
        
        if (alertsWithoutPRs.length > 0) {
            info('📝 Creating/updating GitHub issues (one per dependency)...');
            await processAlertsWithoutPRs(alertsWithoutPRs);
        } else {
            info('✅ All alerts have associated PRs');
            // Close any open issues since all alerts are resolved
            await closeResolvedIssues([]);
        }

    } catch (err) {
        error(`Error: ${err.message}`);
        setFailed(err);
    }
}

main();

