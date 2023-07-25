# JWKS

We expose a JWKS (JSON Web Key Set) endpoint at `/oauth/jwks`. This allows
consumers of JWTs issued by us to validate the signature, per OIDC standards.
This was set up to suport LTI 1.3 features, however it can be used by other
features that need to issue JWTs. Below is an overview of generating/rotating
JWKs, both the public and private portion of the keys.

## Generating a new JWK

Occasionally it may be necessary to rotate a JWK, i.e. generate a new JWK and
private key. The JWKS endpoint returns an array of public keys (JWK), which
allows us to starting using a new JWK, while still allowing users to validate
JWTs issued with the old JWK. To generate a new JWK, refer to the following
steps:

1. Run `bin/generate-jwks`
1. This will add the new JWK to the JWKS in `dashboard/public/oauth/jwks.json`
1. Use the private key data printed in your terminal to update the secret using
   the [secrets process](../config/secrets.md).

## Generate a JWK For Local Development

This is a one-time step to generate a JWK and private key, and store them in
`locals.yml`.

1. Run `bin/generate-jwks dev`
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
