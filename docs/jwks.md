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

1. Run `bin/generate-jwks` locally on your dev machine (not on a server)
1. This will push the new JWK to the JWKS array in
   `dashboard/public/oauth/jwks.json`
1. Open and merge a PR with the change
1. Use the private key data printed in your terminal to update the secret using
   the [secrets process](../config/secrets.md)
1. After the next deployment, code will start using the new private key when
   signing JWTs, and the `kid` in those JWTs will point to the new JWK

After you are sure that any JWTs issued with the old key have expired, you can:

1. Remove the old JWK from the `keys` array in the JWKS object at
   `dashboard/public/oauth/jwks.json`
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
