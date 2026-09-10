---
title: Connect your LMS to CodeAI
description: Register your Canvas or Schoology instance so teachers and students launch CodeAI from the LMS.
type: task
---

Register a Canvas or Schoology instance so teachers and students launch CodeAI directly from the LMS. The connection uses the LTI 1.3 standard. No CodeAI account is required to register.

## About the LTI connection

After registration, teachers and students interact with CodeAI through the LMS without visiting the CodeAI sign-in page.

**Accounts.** When someone launches CodeAI from the LMS for the first time, CodeAI creates an account for them. The account type -- teacher or student -- is determined by the role the LMS sends: instructors and administrators become teachers; learners become students. On future launches, CodeAI signs them in automatically. If the person already has a standalone CodeAI account, the first launch offers an account-linking page where they can connect the two accounts or keep the new one.

**Roster sync.** When a teacher launches from the LMS, CodeAI creates a section and syncs the roster from the LMS course using the LTI Names and Role Provisioning Service (NRPS). Students enrolled in the LMS course appear in the CodeAI section. Teachers re-sync from the section's **Login Info** page by selecting **Sync students & sections**. You cannot manually add or remove students in an LMS-synced section; manage the roster in the LMS.

**Content selection (Schoology only).** On Schoology, when deep linking is enabled, teachers can pick from the CodeAI content offered in the LMS assignment picker -- today that is Music Lab and the AI Foundations 2025 course. The selected content becomes a launchable link in the LMS. Deep linking is not available on Canvas; Canvas launches reach CodeAI's default landing page, and teachers navigate to the course they want from there.

## What is not available

- **No district-wide view.** The integration operates per teacher, per course. There is no district dashboard showing all connected courses or aggregated student data.
- **No grade passback.** CodeAI does not send scores or completion data back to the LMS gradebook.
- **No deep linking on Canvas.** Teachers cannot pick a specific course or lesson from the Canvas assignment picker. This is a platform limitation, not a configuration problem.

## Prerequisites

- The **Client ID** that your LMS assigned to the CodeAI tool. You obtain this from your LMS admin console after adding CodeAI as an external tool. See the [CodeAI LMS installation guide](https://support.code.org/hc/en-us/articles/23621907533965-Install-Code-org-Integrations-for-your-Learning-Management-System) for step-by-step instructions per platform.
- An email address where CodeAI can send a confirmation.

The registration form supports four LMS options: Canvas, Canvas - Beta, Canvas - Test, and Schoology. If your LMS is not listed, [contact CodeAI support](https://support.code.org).

## Register your LMS

Two registration methods are available: manual and dynamic. Canvas supports both; Schoology supports only manual.

### Manual registration

1. Go to [studio.code.org/lti/v1/integrations/new](https://studio.code.org/lti/v1/integrations/new).
2. Fill in the form:
   - **School or district name**: a label for this integration (for example, "Springfield USD").
   - **LMS Client ID**: the client ID from your LMS.
   - **Your email**: the address where CodeAI sends a confirmation.
   - **What LMS are you using?**: select your platform from the dropdown.

   ![The LMS registration form showing School or district name, LMS Client ID, Your email, and What LMS are you using fields with the Register LMS button](images/connect-your-lms-registration-form.png)

3. Select **Register LMS**.

CodeAI sends a confirmation email to the address you entered. If an integration with the same issuer and client ID already exists, the form tells you -- no duplicate is created.

### Dynamic registration (Canvas)

Canvas supports LTI dynamic registration, which exchanges configuration automatically.

1. In your Canvas admin console, start the dynamic registration flow and point it at `https://studio.code.org/lti/v1/dynamic_registration`.
2. Canvas sends its OpenID configuration to CodeAI.
3. CodeAI prompts you for your email address.
4. The integration is created and Canvas receives CodeAI's tool configuration without manual entry.

After registration, teachers can launch CodeAI from within the LMS. The first launch creates an account or offers to link an existing one. Roster sync begins on the teacher's first launch and can be re-synced at any time.

## Troubleshooting

### Teachers land on CodeAI's home page instead of a specific course

On Canvas, this is expected. Canvas does not support deep linking with CodeAI, so every launch reaches the default landing page. Teachers navigate to the course they want from there.

### "An integration with this issuer and client ID already exists"

Someone has already registered this LMS instance with CodeAI. The form prevents duplicates. If you need to change the registration, [contact CodeAI support](https://support.code.org).

## Further reading

- [Clever and Google Classroom](/guide/integrations/clever-and-google-classroom/)
- [Import a roster](/guide/sections/import-a-roster/) (teacher-facing)
- [District reporting](/guide/integrations/reporting/)
