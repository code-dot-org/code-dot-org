# LTI 1.3 Integration

We are working to fully support LTI 1.3 as an LTI Tool. Currently, we are beta
testing with a small group of Canvas users, and plan to release phases of LTI 1.3
features in 2024.

Below are instructions on how to register Code.org as an LTI Tool in Canvas.
NOTE: this pilot is currently supported for a closed group, and is not get
generally available.

### References

- [Create a new LTI Developer Key][install-canvas]
- [Configure the LTI app][configure-canvas]

[install-canvas]: https://community.canvaslms.com/t5/Admin-Guide/How-do-I-configure-an-LTI-key-for-an-account/ta-p/140
[configure-canvas]: https://community.canvaslms.com/t5/Admin-Guide/How-do-I-configure-an-external-app-for-an-account-using-a-client/ta-p/202

## Installing Code.org in Canvas

See [link here][install-canvas] for detailed step by step instructions for
configuring a developer key for an LTI Tool, i.e. installing an LTI Tool in
Canavs.

In the `Select Configuration Method` step, there are two options, detailed below.
For both options, you must first configure your `Key Settings`:

1. Key Name: `<your-key-name>`
1. Owner Email: `<admin-owner-email>`
1. Redirect URIs: `https://studio.code.org` (NOTE: This will prefill automatically if you chose the JSON method)
1. Notes: `Optional: Any notes about the LTI key, such as the reason it was created.`

### Enter Manual Entry Details

This is the first option in the configuration steps. The easier method is the
JSON method detailed below, however here are instructions for manually entering
these details.

Here are the values to enter in the associated text input fields:

1. Select `Manual Entry` from Configuration dropdown menu
1. Title: `Code.org`
1. Description: `Code.org LTI Tool`
1. Target Link URI: `https://studio.code.org/home`
1. OpenID Connect Initiation URL: `https://studio.code.org/lti/v1/login`
1. JWK Method - Public JWK URL: `https://studio.code.org/oauth/jwks`
1. LTI Advantage Services: Enable all
1. Placements: Select the placements where you want Code.org LTI Tool to be available
1. Additional Settings - Custom Fields:
   ```
   email=$Person.email.primary
   full_name=$Person.name.full
   given_name=$Person.name.given
   family_name=$Person.name.family
   display_name=$Person.name.display
   ```
1. Click `Save`

### Enter JSON Details

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
      "domain": "https://studio.code.org",
      "tool_id": "code-dot-org",
      "platform": "canvas.instructure.com",
      "privacy_level": "public",
      "settings": {
        "text": "Launch Code.org",
        "icon_url": "https://studio.code.org/assets/logo-2acd4ebc69c447786b866b98034bb3c0777b5f67cd8bd7955e97bba0b16f2bd1.svg",
        "placements": [
          {
            "text": "User Navigation Placement",
            "icon_url": "https://studio.code.org/assets/logo-2acd4ebc69c447786b866b98034bb3c0777b5f67cd8bd7955e97bba0b16f2bd1.svg",
            "placement": "user_navigation",
            "message_type": "LtiResourceLinkRequest",
            "target_link_uri": "https://studio.code.org/home",
            "canvas_icon_class": "icon-lti",
            "custom_fields": {
              "user_id": "$Canvas.user.id"
            }
          },
          {
            "text": "Course Navigation Placement",
            "icon_url": "https://static.thenounproject.com/png/131630-200.png",
            "placement": "course_navigation",
            "message_type": "LtiResourceLinkRequest",
            "target_link_uri": "https://studio.code.org/home",
            "canvas_icon_class": "icon-lti",
            "custom_fields": {
              "user_id": "$Canvas.user.id"
            }
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

## Client ID and Deployment ID

In order to complete the LTI Integration, you'll need to provide Code.org with
a Client ID and a Deployment ID. After the steps above have been completed,
please reference the instructions [here][configure-canvas] for generating a
Deployment ID

Once you have both the Client ID and the Deployment ID

TODO: Finish, how will they share them with us?
