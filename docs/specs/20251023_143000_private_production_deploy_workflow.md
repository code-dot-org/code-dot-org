# Private Production Deploy Workflow Specification

## Problem Statement

We face a critical security challenge: our public repository exposes every security fix as soon as it's committed, creating a window of vulnerability between when a fix is developed and when it's deployed to production. This is particularly problematic given:

1. **AI-powered vulnerability scanners** are continuously monitoring public repositories
2. **Recent P1 vulnerabilities** (like BC-88 Local File Read) demonstrate the risk
3. **Public transparency** is valued but creates security exposure
4. **Current workflow** requires public commits before production deployment


## Current Architecture Analysis

### Current Deployment Process
**Current Flow**: `staging` → `production` (public) → AMI Builder → Production Deployment

1. **Code Push**: Changes pushed to `production` branch on public repo
2. **AMI Builder**: [`aws/ci_build`](../../aws/ci_build) polls for changes every minute
3. **Build Process**: Runs `infra:ci` rake task to build AMI
4. **Deployment**: AMI deployed to production servers (`production-console`, `production-daemon`)

### Review of Key Components
- **AMI Builder**: [`aws/ci_build`](../../aws/ci_build) - Polls public `production` branch every minute
- **AMI Manager**: [`aws/cloudformation/ami-manager.js`](../../aws/cloudformation/ami-manager.js) - Lambda for AMI creation
- **Build Process**: `lib/rake/ci.rake` and `lib/rake/build.rake` - CI testing and build
- **Production Servers**: `production-console`, `production-daemon` - Target deployment servers

## Proposed Solution: Private Production Deploy

### Architecture Design

```
┌─────────────────┐    ┌─--─────────────────┐    ┌─────────────────┐
│   Public Repo   │    │ Private Production │    │   Production    │
│  (code-dot-org) │    │       Deploy       │    │   Deployment    │
│                 │    │   (code-dot-org-   │    │                 │
│ staging branch  │───▶│    production)     │───▶│   AWS/Cloud     │
│ production      │    │                    │    │                 │
│                 │    │   security fixes   │    │                 │
└─────────────────┘    └───--───────────────┘    └─────────────────┘
```

## Implementation Plan

### Phase 1: Set Up and Monitor (Verification Phase)
**Goal**: Set up private repo sync but don't use it yet - just monitor and verify

1. **Create Private Fork**: `code-dot-org-production` repository
2. **Set Up Auto-Sync**: Lambda function that syncs public `production` → private `production` on every push
3. **Add Verification**: AMI Builder sleeps 5 minutes, then verifies private change matches public change
4. **Monitor for Weeks**: Verify sync is working correctly before switching
5. **Security Verification**: Ensure private repo access is properly restricted

**Current Flow**: `staging` → `production` (public) → AMI Builder → Production
**Phase 1 Flow**: `staging` → `production` (public) → **Sync Lambda** → `production` (private) → **AMI Builder (monitor only)** → Production

### Phase 2: Switch to Private Deploy
**Goal**: Actually switch AMI Builder to watch private repo instead of public

1. **Switch AMI Builder**: Point [`aws/ci_build`](../../aws/ci_build) to watch private repo
2. **Add Reverse Check**: Verify private and public repos are in sync, alert if different
3. **Test Normal Flow**: Verify normal deployments work identically
4. **Add Daily Warning**: Slack notification about uncommitted private changes

**New Flow**: `staging` → `production` (public) → **Sync Lambda** → `production` (private) → AMI Builder → Production

### Phase 3: Test Security Workflow
**Goal**: Test complete security fix workflow

1. **Test Security Fix**: Push security fix directly to private `production` branch
2. **Verify Deployment**: Ensure AMI Builder picks up and deploys the change
3. **Test Back-Sync**: Manual back-sync after verification period
4. **Create Security Scripts**: Tools for easier security fix management
5. **Team Training**: Train security team on new procedures

## Code Changes Required

### 1. Private Production Deploy CloudFormation Stack
**File**: `INFRASTRUCTURE-REPO/aws/private-production-deploy/cloudformation.yml`

**Purpose**: Complete AWS infrastructure for private production deploy
**Includes**: 
- **API Gateway**: REST API endpoint for GitHub webhook
- **Lambda Function**: Syncs public → private on every production push
- **IAM Roles**: Least privilege access for Lambda functions
- **Secrets Manager**: Secure storage for GitHub tokens and webhook secrets
- **CloudWatch Events**: Daily warning about uncommitted private changes

**Security Features**:
- GitHub webhook signature verification (like marketing site deploy)
- API key authentication via GitHub secrets
- Repository verification (only accepts from `code-dot-org/code-dot-org`)
- Branch verification (only processes `production` branch pushes)

### 2. GitHub Actions Workflow
**File**: [`.github/workflows/private-production-sync.yml`](../../.github/workflows/private-production-sync.yml)

**Purpose**: Triggers Lambda function when production branch is pushed
**What it does**:
- Triggers on every push to `production` branch
- Calls Lambda API endpoint with GitHub webhook signature
- Passes API key for authentication
- No direct Git operations (all handled by Lambda)

### 3. Modified AMI Builder Configuration
**File**: [`aws/ci_build`](../../aws/ci_build)

**Phase 1 Changes**: Add verification logic
```ruby
# Phase 1: Monitor mode - verify private matches public
if ENV['PRIVATE_PRODUCTION_MONITOR'] == 'true'
  ChatClient.log "Private Production Deploy Monitor: Waiting for sync Lambda to complete...", color: 'blue'
  sleep(300) # Wait 5 minutes for sync Lambda to complete
  
  # Verify private repo matches public repo
  verify_private_matches_public
end

# Phase 2: Switch to private repo
REPO_URL = 'https://github.com/code-dot-org/code-dot-org-production.git'
```

**What AMI Builder does**:
- **Phase 1**: Monitors private repo, verifies it matches public repo
- **Phase 2**: Actually watches private repo for deployments
- **Verification**: Ensures sync Lambda completed before checking for changes

**Verification Function**:
```ruby
def verify_private_matches_public
  # Get current public production commit
  public_commit = RakeUtils.git_revision
  
  # Check if private repo matches public repo
  # (In real implementation, would fetch from private repo and compare)
  ChatClient.log "Verifying private repo matches public commit: #{public_commit}", color: 'blue'
  ChatClient.log "Private Production Deploy Monitor: Verification completed", color: 'green'
end
```

### 4. Manual Back-Sync Script
**File**: `INFRASTRUCTURE-REPO/scripts/private_production_sync.py`

**Purpose**: Interactive tool to cherry-pick private changes back to public repo

**How it works:**
1. **Detect Changes**: Scans private repo for commits not in public repo
2. **Interactive Selection**: Shows you available changes, lets you select which ones to sync
3. **Conflict Checking**: Tests cherry-pick on both production and staging branches
4. **Create PRs**: Uses `gh` CLI to create pull requests for selected changes
5. **Safety Checks**: Ensures your local public repo is clean and up-to-date

**Usage Examples:**
```bash
# Interactive mode - select commits with arrow keys
./private_production_sync.py

# Specify specific commit hashes
./private_production_sync.py --commits abc123,def456,ghi789

# Sync to production branch only
./private_production_sync.py --production

# Sync to staging branch only  
./private_production_sync.py --staging

# Test mode - check for conflicts without creating PRs
./private_production_sync.py --dry-run
```

**Example Interactive Output:**
```
$ ./private_production_sync.py

Found 3 new commits in private repository:
------------------------------------------------------------
 1. abc1234 | 2025-01-15 | security-team
    Fix critical vulnerability in form upload API

 2. def5678 | 2025-01-15 | security-team  
    Add input validation for file uploads

 3. ghi9012 | 2025-01-15 | security-team
    Update security documentation

Enter commit numbers to sync (e.g., 1,3,5 or 1 3 5): 1,2

Selected 2 commits:
  - abc1234: Fix critical vulnerability in form upload API
  - def5678: Add input validation for file uploads

Proceed with sync? (y/N): y

Testing cherry-picks...
✓ Cherry-pick test passed for production
✓ Cherry-pick test passed for staging

Creating pull requests for production branch...
✓ Created PR: https://github.com/code-dot-org/code-dot-org/pull/12345
✓ Created PR: https://github.com/code-dot-org/code-dot-org/pull/12346

Creating pull requests for staging branch...
✓ Created PR: https://github.com/code-dot-org/code-dot-org/pull/12347
✓ Created PR: https://github.com/code-dot-org/code-dot-org/pull/12348

Back-sync completed successfully!
```

**Safety Features:**
- Requires clean working directory in public repo
- Auto-updates public repo before starting
- Tests cherry-pick on both production and staging
- Reverts everything if any conflicts found
- Creates separate PRs for production and staging
- Manual conflict resolution mode with `--production` or `--staging` flags


## Access Control & Security

### Repository Access Levels
- **Infrastructure Team**: Full admin access to private production repo
- **Engineering Managers**: Full admin access to private production repo
- **All Engineers**: Read access to private production repo (can review PRs, look at code)
- **AMI Builder**: Read-only access via GitHub app/token (TBD - separate from current `deploy-code-org` bot)
- **Sync Lambda**: Write access via GitHub app/token (TBD - separate from current `deploy-code-org` bot)

### GitHub Access Setup
**Current Bot**: `deploy-code-org` bot is used everywhere and has broad access, so we want separate access for this.

**Proposal**: Create new GitHub app or access tokens under a dedicated admin user:
- **Read Bot**: For AMI Builder to pull from private repo
- **Write Bot**: For Sync Lambda to push to private repo
- **Admin User**: GitHub admin user to create these tokens/apps

### AWS Security Architecture
**Webhook Signature Verification**: Uses same pattern as marketing site deploy
- **GitHub Webhook Secret**: Stored in AWS Secrets Manager
- **Signature Verification**: HMAC-SHA1 signature verification (like `verify_signature` in `pegasus/helpers.rb`)
- **Repository Verification**: Only accepts webhooks from `code-dot-org/code-dot-org`
- **Branch Verification**: Only processes `production` branch pushes

**API Gateway Security**:
- **API Key**: Stored in GitHub secrets, passed in Authorization header
- **Signature Verification**: GitHub webhook signature in `X-Hub-Signature` header
- **Event Verification**: GitHub event type in `X-GitHub-Event` header

### AWS Security Architecture
- **GitHub Tokens**: Stored in AWS Secrets Manager (not GitHub Actions)
- **IAM Roles**: Least privilege access for Lambda functions
- **Encryption**: All secrets encrypted at rest and in transit
- **No Automatic Back-Sync**: Prevents premature exposure of security fixes

### Security Procedures
- **P1 Issues**: Direct push to private `production`, immediate deployment
- **P2 Issues**: Security branch workflow, deployment within 24 hours  
- **P3 Issues**: Normal workflow, next scheduled deployment

## Design Trade-offs Considered

#### Option 1: Private Production Deploy (Selected)
**Pros:**
- Maintains public repo transparency
- Allows private security development
- Proven pattern used by other projects
- Minimal disruption to current workflow

**Cons:**
- Additional repository to maintain
- Sync complexity between repos
- Requires access control management

#### Option 2: Private Repository with Public Mirror
**Pros:**
- Single source of truth
- Simpler access control

**Cons:**
- Loses public development transparency
- Major workflow disruption
- Community engagement impact

#### Option 3: Delayed Public Disclosure
**Pros:**
- Simpler implementation
- No additional infrastructure

**Cons:**
- Still exposes fixes during development
- Doesn't solve the core problem
- Limited security benefit

**Decision**: Option 1 (Private Production Deploy) provides the best balance of security and transparency.

## Benefits

### Security Benefits
- **Reduced Exposure Window**: Security fixes deployed before public disclosure
- **Controlled Disclosure**: Coordinated public disclosure process
- **Private Testing**: Security fixes tested in private environment
- **Incident Response**: Faster response to security incidents

### Operational Benefits
- **Maintained Open Source**: Public repo remains open and transparent
- **Flexible Workflow**: Can handle both normal and security development
- **Audit Trail**: Complete audit trail of all changes
- **Team Collaboration**: Security team can work privately when needed