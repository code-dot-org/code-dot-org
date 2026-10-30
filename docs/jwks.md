# JWKS

We expose a JWKS (JSON Web Key Set) endpoint at `/oauth/jwks`. This allows
consumers of JWTs issued by us to validate the signature, per OIDC standards.
This was set up to suport LTI 1.3 features, however it can be used by other
features that need to issue JWTs for external clients. Below is an overview of
generating/rotating JWKs, both the public and private portion of the keys.

## Generating a new JWK

Occasionally it may be necessary to rotate a JWK, i.e. generate a new JWK and
private key. The JWKS endpoint returns an array of public keys (JWK's), which
allows us to start using a new key when signing JWTs, while still allowing users
to validate JWTs issued with the old key. To generate a new JWK, refer to the
following steps:

1. Run `bin/generate-jwks <env>` locally on your dev machine (not on a server),
where `<env>` is one of the following: `dev`, `prod`, `non-prod`
1. This will generate a new public and private key, and output them to your terminal`
1. Add the public key (JWK) to the `jwks_data` in the appropriate config file.
NOTE: there is probably already an existing key under the `keys` array. You need
to add the newly generated key to the `keys` array.
  - For 'Prod', add it to `config/production.yml.erb`
  - For 'Non-Prod, add it to `config.yml.erb`
1. Open a PR and merge the changes to the config file(s)
1. *IMPORTANT* DO NOT PROCEED TO THE NEXT STEP UNTIL THE ABOVE CHANGES HAVE BEEN
DEPLOYED
1. Use the private key data printed in your terminal to update the secret using
   the [secrets process](../config/secrets.md)
1. After a following DTP, code will start using the new private key when
   signing JWTs, and the `kid` in those JWTs will point to the new JWK

After you are sure that any JWTs issued with the old key have expired, you can:

1. Remove the old JWK from the `keys` array in the appropriate config file
1. Open and merge a PR with the change

There is a bit of coordination with the above steps, but it's important you
don't start using the new private key to sign JWTs until the new JWK has been
added to the JWKS endpoint. CDO secrets are loaded on startup, so it requires
a deploy to make them available.

## Generate a JWK For Local Development

This is a one-time step to generate a JWK and private key, and store them in
`locals.yml`.

1. Run `bin/generate-jwks dev` locally on your dev machine
1. This will update your `locals.yml` file with the following:

```yaml
jwks_data:
  {
    "keys":
      [
        {
          "kty": "RSA",
          "n": "<public-key-string>",
          "e": "AQAB",
          "use": "sig",
          "alg": "RS256",
          "kid": "<kid-string>",
        },
      ],
  }

jwk_private_key_data:
  { "kid": "<kid-string>", "private_key": "<private-key-string>" }
```
