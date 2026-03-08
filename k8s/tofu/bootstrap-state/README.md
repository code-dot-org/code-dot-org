# Bootstrap OpenTofu State Bucket

This root creates the S3 bucket used for OpenTofu remote state and native S3 lockfiles.

Bucket created:
- `seth-tmp-opentofu-state`

## Usage

From this directory:

```bash
tofu init
tofu apply
```

After the bucket exists, initialize the cluster root in `../codeai-k8s`.
