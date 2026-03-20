# codeai-k8s-dex

Creates the Google Cloud service account used by Dex's SSO to look up Google group
membership (e.g. engineering@code.org? infrastructure@code.org?) for `@code.org`
accounts and thereby determine in-cluster access levels.

This is shared infrastructure for all codeai-k8s clusters, so you only have
to run this once at first bootstrap, not per-cluster created.

## Usage

1. Review and edit `terraform.tfvars` as needed

2. Run:

```bash
# Install Google Cloud SDK
# or: `curl https://sdk.cloud.google.com | bash` on linux
brew install gcloud

# will popup a browser for google login with @code.org
gcloud auth login

tofu init

export GOOGLE_OAUTH_ACCESS_TOKEN="$(gcloud auth print-access-token)"
tofu apply
```

3. Now that you've created a new Google Cloud service account, you **need to get a Google Workspace superadmin to bless it**:
  - This will allow Dex's SSO system read-only access to employee's google groups (e.g. engineering@code.org), which Dex needs to know what permissions to grant them.
  - **Provide a Google Workspace super admin** (e.g. infra manager) with:
    1. **Service Account Client ID, from `tofu apply` output value `google_service_account_client_id`** (at the end of tofu apply output)
    1. **Requested OAuth Scope: `https://www.googleapis.com/auth/admin.directory.group.readonly`**
  - Request super admin manage your service account's domain wide delegation:
    1. Excerpted from: https://developers.google.com/workspace/guides/create-credentials#optional_set_up_domain-wide_delegation_for_a_service_account
    1. Open Google Workspace Admin console: Security > Access and data control > API controls
    1. Click `[Manage Domain Wide Delegation]` -> `[Add New]`
    1. Input the service account client_id you provide them
    1. Input the oauth_scope `https://www.googleapis.com/auth/admin.directory.group.readonly`
    1. Click `[Authorize]`

### Relevant docs on setting up Dex with Google Group SSO

1. https://dexidp.io/docs/connectors/google/#fetching-groups-from-google
