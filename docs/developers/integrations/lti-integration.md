---
title: LTI 1.3 integration
description: How the CodeAI LTI 1.3 integration works, including registration, launch, roster sync, and JWKS.
type: concept
---

CodeAI acts as an LTI 1.3 tool provider. Learning management systems (Canvas, Schoology) register with CodeAI, then launch into it as an external tool.

## Registration

Two registration paths create the same `LtiIntegration` record:

**Manual registration** (`GET /lti/v1/integrations/new`, `POST /lti/v1/integrations`): the admin fills in a form with name, client ID, email, and LMS selection. The controller looks up platform URLs from `Policies::Lti::LMS_PLATFORMS`, creates the integration via `Services::Lti.create_lti_integration`, and sends a confirmation email through `LtiMailer`. No authentication is required.

**Dynamic registration** (`GET /lti/v1/dynamic_registration`, `POST /lti/v1/dynamic_registration`): Canvas initiates this flow with `openid_configuration` and `registration_token` parameters. CodeAI fetches the platform's OpenID configuration, caches the registration data (1-hour TTL), prompts the admin for an email address, then calls `Clients::LtiDynamicRegistrationClient` to complete the handshake. The response sends CodeAI's tool configuration (from `Policies::Lti::DYNAMIC_REGISTRATION_CONFIG`) to the platform.

Both paths check for an existing integration with the same issuer and client ID before creating.

### Supported platforms

`Policies::Lti::LMS_PLATFORMS` defines the supported platforms and their endpoints:

- `canvas_cloud` (issuer: `https://canvas.instructure.com`)
- `canvas_beta_cloud`, `canvas_test_cloud`
- `schoology` (issuer: `https://schoology.schoology.com`)

Each entry carries `issuer`, `auth_redirect_url`, `jwks_url`, `access_token_url`, and `supported_message_types`.

## Launch flow

An LTI launch is a three-step OIDC flow handled by `LtiV1Controller`:

1. **Login** (`/lti/v1/login`): the platform sends `iss`, `client_id` (or a `platform_id` for platforms that omit the client ID). CodeAI looks up the `LtiIntegration`, creates a state/nonce pair cached for 15 minutes, and redirects to the platform's `auth_redirect_url`.

2. **Authenticate** (`/lti/v1/authenticate`): the platform POSTs back an `id_token` (a signed JWT). CodeAI validates the JWT signature against the platform's JWKS, checks state and nonce, extracts claims (roles, context, custom parameters, NRPS URL), and either signs in an existing user or creates a new one. LTI roles map to CodeAI account types via `Policies::Lti.get_account_type` -- instructor and administrator roles become teachers; learner roles become students.

3. **Sync course** (`/lti/v1/sync_course`): after authentication, the user is redirected here. For teachers with roster sync enabled (`Policies::Lti.roster_sync_enabled?`), this calls the NRPS endpoint to pull course membership and syncs the section roster via `Services::Lti.sync_section_roster`. Students are created or looked up, added to the section as followers, and teachers are added as instructors.

### Account linking

When a user launches from an LMS and already has a CodeAI account, `AccountLinkingController` handles the linking flow:

- `GET /lti/v1/account_linking/landing` -- the landing page, reachable only with valid session data from an LTI launch.
- `POST /lti/v1/account_linking/link_email` -- verifies email/password against the existing account and calls `Services::Lti::AccountLinker` to attach the LTI identity.
- `POST /lti/v1/account_linking/new_account` -- the user opts out of linking; the LTI-created account is kept.
- `POST /lti/v1/account_linking/unlink` -- removes an LTI identity from the current user.

## Deep linking

`Lti::V1::DeepLinkingController` handles LTI deep linking (content selection from within the LMS). Deep linking is gated behind `DCDO.get('schoology_deep_linking_enabled', false)` and is currently supported only on Schoology.

The `show` action presents a content picker; the `submit` action builds a `DeepLinkingResponse` JWT containing the selected content items and redirects back to the LMS.

## JWKS

CodeAI exposes a JWKS endpoint at `GET /oauth/jwks` (`OauthJwksController`). Platforms use it to validate JWTs CodeAI signs (deep linking responses, client assertions for access tokens).

Key rotation follows a two-phase deploy: add the new public key to the `jwks_data` config, deploy, then update the private key secret. See `docs/jwks.md` for the operational procedure and `bin/generate-jwks` for the generation script.

## Data model

- `LtiIntegration` -- one row per registered LMS instance (issuer + client ID).
- `LtiDeployment` -- links an integration to a specific deployment within the LMS. Has `restricted?` for special-case deployments.
- `LtiCourse` -- one per LMS course context, linked to an integration and deployment. Stores the NRPS URL and resource link ID.
- `LtiSection` -- the CodeAI section created from an LTI course.
- `LtiUserIdentity` -- links a CodeAI user to their LMS identity (issuer + subject). A user can have identities across multiple integrations.

`AuthenticationOption` records with credential type `lti_v1` store the `authentication_id` as `<issuer>|<subject>`.

## Related integrations

CodeAI also provides outbound SSO to two services (not LTI):

- **Discourse SSO** (`GET /discourse/sso`): signs the current CodeAI user into the teacher forum using Discourse's SSO protocol.
- **Zendesk SSO** (`GET /zendesk_session`): signs the current user into the support site.

## Related pages

- [Connect your LMS to CodeAI](/guide/integrations/connect-your-lms/) (admin-facing)
- [Roster sync architecture](/developers/integrations/roster-sync-architecture/)
- [School and district data model](/developers/integrations/school-and-district-data-model/)
