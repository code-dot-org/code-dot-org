# LTI 1.3 Integration

Code.org is working on an LTI 1.3 compliant integration for Canvas. Currently,
we are beta testing with a small group of Canvas users, and plan to release our
integration in 2024.

The following documentation details the steps required to install Code.org as an
LTI tool in Canvas. Completing the following steps will generate a `Client ID`
and a `Deployment ID`. Please supply these two IDs to Code.org via
[this form][lti-integration-form] to complete your installation.

[lti-integration-form]: https://forms.gle/hLqdbgQ1VhZdKR7N8

## References

Canvas provides installation and configuration instructions for LTI Tools. Use
these instructions, and refer to the steps below for Code.org specific details.

- [Create a new LTI Key][install-canvas] which configures Code.org as an LTI Tool
- [Configure the LTI app][configure-canvas] to generate the Deployment ID

[install-canvas]: https://community.canvaslms.com/t5/Admin-Guide/How-do-I-configure-an-LTI-key-for-an-account/ta-p/140
[configure-canvas]: https://community.canvaslms.com/t5/Admin-Guide/How-do-I-configure-an-external-app-for-an-account-using-a-client/ta-p/202

## Installing Code.org in Canvas

You will follow [these instructions][install-canvas] for configuring an LTI Key,
i.e. installing an LTI Tool in Canavs. The outcome of this installation will be
a Client ID to provide Code.org (in [Step 4](#step-4))

### Step 1

1. From the Admin menu, select `Developer Keys`
1. Click `Add Developer Key` button, and select the `LTI Key` option
1. Enter LTI Key Settings:
    - Key Name: `<your-key-name>`
    - Owner Email: `<admin-owner-email>`
    - Redirect URIs: `https://studio.code.org/home` NOTE: If you choose the JSON
    configuration below, this will autogenerate for you.
    - Notes: `Optional: Any notes about the LTI key, such as the reason it was created.`

### Step 2

There are two options for entering configuration settings. The easiest is using
JSON. Optionally, you can chose to manually enter these settings.

#### Enter JSON Details

The easiest way to configure the LTI Tool in Canvas is via the `Paste JSON`
configuration. Below is the JSON you can paste directly into the
`LTI 1.3 Configuration` field:

1. Select the `Paste JSON` option from the Configuration dropdown menu
1. Past the below JSON into the field
1. Click `Save`

```json
{
  "title": "Code.org",
  "description": "Code.org LTI Tool",
  "oidc_initiation_url": "https://studio.code.org/lti/v1/login",
  "target_link_uri": "https://studio.code.org/home",
  "scopes": [
    "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem",
    "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly",
    "https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly",
    "https://purl.imsglobal.org/spec/lti-ags/scope/score",
    "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly",
    "https://canvas.instructure.com/lti/public_jwk/scope/update",
    "https://canvas.instructure.com/lti/account_lookup/scope/show",
    "https://canvas.instructure.com/lti-ags/progress/scope/show"
  ],
  "extensions": [
    {
      "tool_id": "code-dot-org",
      "platform": "canvas.instructure.com",
      "privacy_level": "public",
      "settings": {
        "text": "Launch Code.org",
        "placements": [
          {
            "placement": "link_selection",
            "message_type": "LtiResourceLinkRequest"       
          },
          {
            "placement": "submission_type_selection",
            "message_type": "LtiResourceLinkRequest"
          }
        ]
      }
    }
  ],
  "public_jwk_url": "https://studio.code.org/oauth/jwks",
  "custom_fields": {
    "email": "$Person.email.primary",
    "full_name": "$Person.name.full",
    "given_name": "$Person.name.given",
    "family_name": "$Person.name.family",
    "display_name": "$Person.name.display"
  }
}
```

#### Manual Entry Details

Optionally, you can manually enter the configuration details.

Here are the values to enter in the associated text input fields:

1. Select `Manual Entry` from Configuration dropdown menu
1. Title: `Code.org`
1. Description: `Code.org LTI Tool`
1. Target Link URI: `https://studio.code.org/home`
1. OpenID Connect Initiation URL: `https://studio.code.org/lti/v1/login`
1. JWK Method - Public JWK URL: `https://studio.code.org/oauth/jwks`
1. LTI Advantage Services: Enable all
1. Placements: Select `Link Selection` and `Submission Type` from the Placements
selector. NOTE: Code.org currently only supports `LtiResourceLinkRequest`. Do not
select any placements that utilize an `LtiDeepLinkRequest`.
1. Additional Settings - Custom Fields:
   ```
   email=$Person.email.primary
   full_name=$Person.name.full
   given_name=$Person.name.given
   family_name=$Person.name.family
   display_name=$Person.name.display
   ```
1. Click `Save`

### Step 3

#### Deployment ID

Now that you have the LTI Key, you need to configure the Code.org LTI App to
generate a Deployment ID. Before you navigate away from the Developer Keys page,
make sure to copy your Client ID to your clipboard. You'll need that in the next
step.

Once you have the Client ID copied, please reference
[these instructions][configure-canvas] for generating a Deployment ID.

### Step 4

Once you have both the Client ID and the Deployment ID, submit them to Code.org
via [this form][lti-integration-form]. We will complete the final configuration
in our system, and will let you know when you can begin using the Code.org LTI 
1.3 Canvas integration.

## Using Code.org as an LTI Tool

Code.org must be configured to open in a new tab, and will not work in an iframe.
As mentioned above, the Code.org LTI integration does not support Deep Linking.
Some of the placments for LTI Tools in Canvas will trigger a Deep Link request
that is not curently supported by Code.org.
