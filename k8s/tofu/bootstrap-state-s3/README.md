# NOTE: this a temporary hack 

Should be migrated to a group/shared terraform state bucket!!!

This root creates the S3 bucket used for OpenTofu remote state and native S3 lockfiles.

Bucket created:
- `seth-tmp-opentofu-state`

## Usage

First-time bootstrap from this directory:

```bash
tofu init
tofu apply
```

Then migrate this root's local state to the S3 backend:

```bash
tofu init -migrate-state
```

After that, initialize the cluster root in `../codeai-k8s`.
