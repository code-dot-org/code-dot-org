# LTI 1.3 Integration

Code.org is developing an LTI 1.3 compliant integration for Canvas. This integration is undergoing beta testing with a small group of Canvas users and is expected to release broadly in 2024.

The following documentation details the steps required to install Code.org as an
LTI Tool in Canvas. Completing the following steps will generate a `Client ID`
and a `Deployment ID`. 

Please supply these two IDs to Code.org via
[this form][lti-integration-form] to register your LMS & complete your installation.

[lti-integration-form]: https://forms.gle/hLqdbgQ1VhZdKR7N8

## Installing Code.org in Canvas

Visual guides for Steps 1 - 3 can be [found here][install-canvas], and for Step 4 [here][configure-canvas]

### Step 1: Create your LTI Key

1. From the Admin menu, select `Developer Keys`
1. Click the `Add Developer Key` button, and select the `LTI Key` option
1. Enter the following LTI Key Settings:
    - Key Name: `<your-key-name>`
    - Owner Email: `<admin-owner-email>`
    - Redirect URIs: `https://studio.code.org/home` NOTE: If you use the JSON
    configuration option below, this will autogenerate for you
    - Notes: `(Optional) Add any notes about the LTI key, such as the reason it was created`

### Step 2: Configure your LTI Key

There are two options for configuring your LTI key. The easiest is to paste in a JSON configuration snippet (Option 1). Optionally, you can elect to manually enter these settings (Option 2).

#### Option 1 (Easiest): Enter JSON Details

The easiest way to configure the LTI Tool in Canvas is via the `Paste JSON`
option.  

1. Select `Paste JSON` under the `Method` drop-down menu

<img width="823" alt="image" src="https://github.com/code-dot-org/code-dot-org/assets/1631660/dc85358d-126a-4af3-acdc-2cea9afe73a9">

  
2. Paste the following code snippet directly into the `LTI 1.3 Configuration` field:
3. Click `Save`

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

#### Option 2: Manual Entry 

Optionally, you can manually enter the configuration details. Here are the values to enter in the associated text-input fields:

1. Select `Manual Entry` under the `Method` drop-down menu
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

### Step 3: Copy your Client ID

After configuring & saving your LTI Key, you will be redirected to your table of Developer Keys. 

1. Navigate to the Code.org Key you just created
2. Copy the 18-digit numerical code in the Details column, e.g.: `000000000123456789` - this is your Client ID
3. Paste this Client ID into the [Code.org Registration Form][lti-integration-form], and keep it handy for the next step

![image](https://github.com/code-dot-org/code-dot-org/assets/1631660/1c0c9ad3-0b97-42b0-b70c-6f0738db4636)

### Step 4: Generate your Deployment ID

Now that you have the LTI Key, you need to configure the Code.org LTI App to
generate a `Deployment ID`. You can follow the steps below or [refer to the visual instructions here][configure-canvas]

1. Visit the `Admin` panel and click `Settings`
2. Click the `Apps` tab
3. Click `View App Configurations`
4. Click the `Add App` button
5. Select `By Client ID` in the Configuration Type drop-down menu
6. Paste your `Client ID` copied from Step 3
7. Click `Submit`
8. Click the `Install` button to confirm your installation

<p align="center">
<img width="430" alt="image" src="https://github.com/code-dot-org/code-dot-org/assets/1631660/29eb6290-98e5-4891-be9a-ca241d7026dd">
</p>   


After installing the application, you can now generate a `Deployment ID`

1. View your app on the External Apps page
2. Click the `Settings` (gear) icon
3. Click `Deployment ID`
4. Copy the `Deployment ID` string and submit it into the [Code.org Registration Form][lti-integration-form]

![image](https://github.com/code-dot-org/code-dot-org/assets/1631660/bcf40fa9-be26-42cd-865d-7e34e600c4c5)


<p align="center">
<img width="430" alt="image" src="https://github.com/code-dot-org/code-dot-org/assets/1631660/8ce5ff5d-cbf0-4942-8329-bca57ac85360">
</p>   



### Step 5: Submit the Code.org Registration Form

Now that you've created and entered both your `Client ID` (Step 3) & `Deployment ID` (Step 4) into the [Code.org Registration Form][lti-integration-form], submit the form and wait for a confirmation email from our team! You can expect this confirmation mail within 1 - 2 business days.

## Using Code.org as an LTI Tool

To install Code.org in your Canvas course, first ensure the LTI Key is enabled from the admin panel. Next, select `Code.org` from the `External Tool` dialogue when adding an Item to your App Modules. **Code.org must be configured to open in a new tab, and will not work in an iFrame.**

The Code.org LTI integration does not yet support Deep Linking. Some of the placments for LTI Tools in Canvas will trigger a Deep Link request that is not curently supported by Code.org.


## References

Canvas provides installation and configuration instructions for LTI Tools. Use
these instructions, or refer to the steps above for Code.org specific details.

- [Create a new LTI Key][install-canvas] which configures Code.org as an LTI Tool
- [Configure the LTI app][configure-canvas] to generate the Deployment ID

[install-canvas]: https://community.canvaslms.com/t5/Admin-Guide/How-do-I-configure-an-LTI-key-for-an-account/ta-p/140
[configure-canvas]: https://community.canvaslms.com/t5/Admin-Guide/How-do-I-configure-an-external-app-for-an-account-using-a-client/ta-p/202
