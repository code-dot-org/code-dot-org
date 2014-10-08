# Adding new secret keys

To add a new secret configuration variable, you must already have the shared secret key locally.

0. Make sure you have the most up to date version of the encrypted secrets locally *and* that you have decrypted/unpacked it (this is important because the secrets file is encrypted so git has no way to merge if two people change it):
  1. pull/merge/rebase staging
  2. `cd aws/`
  3. `rake`

1. Edit `aws/secrets/config.yml` to add your secret 
2. `rake secrets` to package up your configuration change.
3. Commit `aws/secrets.tgz.aes`
