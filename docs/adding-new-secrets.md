# Adding new secret keys

To add a new secret configuration variable, you must already have the shared secret key locally.

1. Edit `aws/secrets/config.yml` to add your secret 
2. `rake secrets` to package up your configuration change.
3. Commit `aws/secrets.tgz.aes`
