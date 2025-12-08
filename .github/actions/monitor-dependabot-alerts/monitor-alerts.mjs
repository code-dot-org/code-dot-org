import {setFailed, info, warning, error} from '@actions/core';
import github from "@actions/github";
import {reviewersMap} from '../assign-dependabot-reviewer/config/reviewers.mjs';

const GH_TOKEN = process.env.GH_TOKEN;
const REPO = github.context.repo.repo;
const REPO_OWNER = github.context.repo.owner;
const octokit = github.getOctokit(GH_TOKEN);

// Label to identify our auto-generated issues
const ISSUE_LABEL = 'dependabot-alerts-monitor';

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
 * Create or update GitHub issue for alerts without PRs
 */
async function createOrUpdateIssue(alertsWithoutPRs) {
    if (alertsWithoutPRs.length === 0) {
        info('✅ All critical/high alerts have associated PRs or are low severity');
        // Close existing issue if all alerts are resolved
        await closeExistingIssueIfOpen();
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
        await closeExistingIssueIfOpen();
        return;
    }

    // Get unique team reviewers for assignment
    const teamReviewers = getUniqueTeamReviewers(criticalAlerts);
    info(`Assigning to teams: ${teamReviewers.join(', ')}`);

    const issueTitle = `🚨 Dependabot Alerts Without PRs (${criticalAlerts.length} critical/high)`;
    
    let issueBody = `## ⚠️ Dependabot Alerts Without Pull Requests\n\n`;
    issueBody += `This issue tracks Dependabot alerts that **could not automatically create PRs**.\n\n`;
    issueBody += `**Total alerts without PRs:** ${criticalAlerts.length} (critical/high severity)\n\n`;
    issueBody += `These alerts need **manual intervention** to create PRs, likely due to path-based dependencies in \`Gemfile\`.\n\n`;
    issueBody += `**Assigned teams:** ${teamReviewers.join(', ')}\n\n`;
    issueBody += `---\n\n`;

    // Group alerts by team for better organization
    const alertsByTeam = {};
    criticalAlerts.forEach(alert => {
        const team = getTeamReviewer(alert.dependency);
        if (!alertsByTeam[team]) {
            alertsByTeam[team] = [];
        }
        alertsByTeam[team].push(alert);
    });

    // List alerts grouped by team
    Object.keys(alertsByTeam).sort().forEach(team => {
        issueBody += `### ${team.toUpperCase()} Team\n\n`;
        alertsByTeam[team].forEach((alert, index) => {
            const daysOpen = Math.floor((new Date() - new Date(alert.created_at)) / (1000 * 60 * 60 * 24));
            issueBody += `${index + 1}. **${alert.dependency}** (${alert.ecosystem})\n`;
            issueBody += `   - Severity: ${alert.severity.toUpperCase()} (CVSS: ${alert.cvss})\n`;
            issueBody += `   - CVE: ${alert.cve}\n`;
            issueBody += `   - Days Open: ${daysOpen}\n`;
            issueBody += `   - Alert: [#${alert.number}](${alert.url})\n`;
            issueBody += `   - Summary: ${alert.summary}\n\n`;
        });
    });

    issueBody += `---\n\n`;
    issueBody += `**Action Required:**\n`;
    issueBody += `1. Review each alert above\n`;
    issueBody += `2. Manually create PRs to fix critical/high severity vulnerabilities\n`;
    issueBody += `3. Consider reducing path-based dependencies in \`Gemfile\` to enable auto-PRs\n\n`;
    issueBody += `*This issue is auto-generated and will be updated daily.*\n`;

    // Search for existing issue using label (more reliable than title search)
    try {
        const existingIssue = await findExistingIssue();
        
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
            
            // Note: GitHub Issues don't support team assignment directly
            // Teams are mentioned in the issue body for visibility
            // Individual users can be manually assigned if needed
            info(`✅ Updated existing issue #${existingIssue.number}`);
        } else {
            // Create new issue
            const newIssue = await octokit.rest.issues.create({
                owner: REPO_OWNER,
                repo: REPO,
                title: issueTitle,
                body: issueBody,
                labels: ['dependabot', 'security', 'automated', ISSUE_LABEL]
            });
            info(`✅ Created new issue #${newIssue.data.number}`);
        }
    } catch (err) {
        error(`Failed to create/update issue: ${err.message}`);
        throw err;
    }
}

/**
 * Find existing issue by label
 */
async function findExistingIssue() {
    try {
        const issues = await octokit.rest.issues.listForRepo({
            owner: REPO_OWNER,
            repo: REPO,
            labels: ISSUE_LABEL,
            state: 'all', // Check both open and closed
            per_page: 1
        });
        
        return issues.data.length > 0 ? issues.data[0] : null;
    } catch (err) {
        warning(`Failed to search for existing issue: ${err.message}`);
        return null;
    }
}

/**
 * Close existing issue if all alerts are resolved
 */
async function closeExistingIssueIfOpen() {
    try {
        const existingIssue = await findExistingIssue();
        if (existingIssue && existingIssue.state === 'open') {
            await octokit.rest.issues.update({
                owner: REPO_OWNER,
                repo: REPO,
                issue_number: existingIssue.number,
                state: 'closed'
            });
            info(`✅ Closed issue #${existingIssue.number} (all alerts resolved)`);
        }
    } catch (err) {
        warning(`Failed to close existing issue: ${err.message}`);
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
            info('📝 Creating/updating GitHub issue...');
            await createOrUpdateIssue(alertsWithoutPRs);
        } else {
            info('✅ All alerts have associated PRs');
        }

    } catch (err) {
        error(`Error: ${err.message}`);
        setFailed(err);
    }
}

main();

