# LTI 1.3 Integration

Code.org is developing an LTI 1.3 compliant integration for Canvas and Schoology.
This integration is undergoing beta testing with a small group of Canvas users
and is expected to release broadly in 2024.

The following documentation details the steps required to install Code.org as an
LTI Tool in Canvas and Schoology. Completing the following steps will generate a
`Client ID`.

Please supply the Client ID to Code.org via
[this portal][lti-integration-portal] to register your LMS & complete your 
installation.

[lti-integration-portal]: https://studio.code.org/lti/v1/integrations

## Table of Contents

* [Canvas Install Instructions](#installing-codeorg-in-canvas)
* [Schoology Install Instructions](#installing-codeorg-in-schoology)

## Installing Code.org in Canvas

Visual guides for Steps 1 - 3 can be [found here][install-canvas]

### Step 1: Create your LTI Key

1. From the Admin menu, select `Developer Keys`
1. Click the `Add Developer Key` button, and select the `LTI Key` option
1. Enter the following LTI Key Settings:
    - Key Name: `<your-key-name>`
    - Owner Email: `<admin-owner-email>`
    - Redirect URIs: `https://studio.code.org/lti/v1/authenticate`
    - Notes: `(Optional) Add any notes about the LTI key, such as the reason it was created`

### Step 2: Configure your LTI Key

There are two options for configuring your LTI key. The easiest is to paste in
a JSON configuration snippet (Option 1). Optionally, you can elect to manually
enter these settings (Option 2).

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
            "placement": "account_navigation",
            "message_type": "LtiResourceLinkRequest"
          },
          {
            "placement": "link_selection",
            "message_type": "LtiResourceLinkRequest"
          },
          {
            "placement": "assignment_menu",
            "message_type": "LtiResourceLinkRequest"
          },
          {
            "placement": "assignment_selection",
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
    "display_name": "$Person.name.display",
    "section_ids": "$Canvas.course.sectionIds",
    "section_names": "$com.instructure.User.sectionNames"
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
    section_ids=$Canvas.course.sectionIds
    section_names=$com.instructure.User.sectionNames
    ```
1. Click `Save`

### Step 3: Copy your Client ID

After configuring & saving your LTI Key, you will be redirected to your table of Developer Keys. 

1. Navigate to the Code.org Key you just created
1. Copy the 18-digit numerical code in the Details column, e.g.: `000000000123456789` - this is your Client ID
1. Paste this Client ID into the [Code.org Registration Portal][lti-integration-portal]

![image](https://github.com/code-dot-org/code-dot-org/assets/1631660/1c0c9ad3-0b97-42b0-b70c-6f0738db4636)

## Installing Code.org in Schoology

These instructions are based on the [Schoology docs](https://developers.schoology.com/app-platform/lti-apps/#how-to-add-your-app-to-schoology)
for adding a new App to Schoology.

Currently, Code.org's LTI Tool is not listed in Schoology's App Store, and must
be manually installed.

### Step 1: Create your LTI Key

1. Navigate to https://app.schoology.com/apps/publisher
2. Fill in required fields
    - App Name: `Code.org`
    - App Description: `Code.org LTI Tool`
    - Category: `Technology`
    - Recommended For: `Instructors` and `Students`
    - Available For: `Only people in my school`

![image](https://github.com/code-dot-org/code-dot-org/assets/8847422/02898ddb-1155-4aa0-a39a-7c518e4e2a38)

3. You can leave the App logo Feature graphic empty
4. Type of App: `LTI 1.3 App`
5. Uncheck the box for `Launch app in Schoology`
6. Select where the tool can be installed, `Can Be Installed For`:
    - Users
      - App Center Dropdown
      - User Profile Left Navigation Menu
    - Courses
      - Left Navigation
      - Rich Text Editor
      - External Tool
    - Groups
    - Resources
7. Configuration Type: `Manual`
8. Privacy: `Send Name and Email/Username of user who launches the tool`
9. Check `Names and Roles Services`, leave `Assignment and Grade Services` unchecked
![image](https://github.com/code-dot-org/code-dot-org/assets/8847422/73ab74e1-4c70-4ba6-8c41-5e5d46bc543f)

10. JWKS URL: `https://studio.code.org/oauth/jwks`
11. Domain/URL: `https://studio.code.org/lti/v1/sync_course`
12. Custom Parameters:
    - `display_name=$User.username`
13. OIDC Login Init Url: `https://studio.code.org/lti/v1/login`
14. Redirect URLs: `https://studio.code.org/lti/v1/authenticate`

![image](https://github.com/code-dot-org/code-dot-org/assets/8847422/2bcfef58-57b2-4306-9558-4e7acd189bfa)

16. Click toggle to accept Schoology Terms of Use
17. Click `Submit`

### Step 2: Install the App

After you create the App, you'll be directed to the page to install the App in
your district.

1. Click on the `Install LTI 1.3 App` button

![image](https://github.com/code-dot-org/code-dot-org/assets/8847422/2001fc33-0f5f-4f73-ab38-0ebdb6c2db0e)

2. This will open a modal, where you'll need to accept and continue. When prompted
for where you want to install it, click `Add to Organization`.


<p align="center">
<img width="368" alt="image" src="https://github.com/code-dot-org/code-dot-org/assets/8847422/03e2dd29-1f23-4408-867a-2c8fde1e74d2">
</p>

3. This will take you to the Organization Apps page, where you will click on the
`Install/Remove` button for the Code.org tool.

![image](https://github.com/code-dot-org/code-dot-org/assets/8847422/8ac87431-6a21-4b6c-af94-0cd9696260a4)


4. A modal will open, where you'll be prompted to select where and for whom this
app will be available.



<p align="center">
<img width="496" alt="image" src="https://github.com/code-dot-org/code-dot-org/assets/8847422/08b2fc57-6e39-42d1-aa2b-29f5e4ef5665">
</p>

5. Once you make your selection, click `Submit`.
6. From the Organization Apps page, click the `App Center` link at the top left
of the page, which will take you back to the My Developer Apps section, and we
will move on to Step 3.

![image](https://github.com/code-dot-org/code-dot-org/assets/8847422/4b774828-3b65-4151-ba3a-9eb2c512c1a0)


### Step 3: Copy your Client ID

Next we will retrive the Client ID

1. From the My Developer Apps section, click on the options dropdown for
the Code.org LTI app, and select `API Info`.
1. Copy the Client ID displayed in the pop up modal
1. Paste this Client ID into the [Code.org Registration Portal][lti-integration-portal]

![image](https://github.com/code-dot-org/code-dot-org/assets/8847422/a74180c2-84a1-46ad-bb22-f945a75c1642)


## Using Code.org as an LTI Tool

- To install Code.org in your Canvas course, first ensure the LTI Key is enabled from the admin panel. Next, select `Code.org` from the `External Tool` dialogue when adding an Item to your App Modules. **Code.org must be configured to open in a new tab, and will not work in an iFrame.**

- The Code.org LTI integration does not yet support Deep Linking. Some of the placments for LTI Tools- will trigger a Deep Link request that is not curently supported by Code.org.


## References

Canvas provides installation and configuration instructions for LTI Tools. Use
these instructions, or refer to the steps above for Code.org specific details.

- [Create a new LTI Key][install-canvas] which configures Code.org as an LTI Tool

[install-canvas]: https://community.canvaslms.com/t5/Admin-Guide/How-do-I-configure-an-LTI-key-for-an-account/ta-p/140

