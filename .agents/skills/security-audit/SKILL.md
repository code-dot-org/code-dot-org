---
name: security-audit
description: Security audit for React components and Rails code in the code.org monorepo. Checks for XSS, injection, FERPA/COPPA violations, data leaks to external APIs, hardcoded secrets, and missing authorization. Use when creating new components, reviewing existing ones, or doing a targeted security pass on a file or directory.
---

# Security Audit Skill

## Scope

Run this audit on:
- A single new or modified component (`/path/to/Component.tsx`)
- A directory (`apps/src/templates/studioHomepages/`)
- A Rails controller, model, or service

Always audit the full call chain of any flagged pattern, not just the file where it appears.

---

## Step 1 — Read the target

Read the file(s) in full before running grep sweeps. Understand what the component does, what data it accepts, and what APIs it calls. Note:
- Props accepted (especially `string` props rendered as markup)
- API endpoints called and HTTP methods used
- Redux state slices read
- User roles / auth state checked

---

## Step 2 — Frontend / React checks

### XSS

```bash
# dangerouslySetInnerHTML usage
grep -rn "dangerouslySetInnerHTML" <path>

# innerHTML / outerHTML direct assignment
grep -rn "innerHTML\s*=" <path>
grep -rn "outerHTML\s*=" <path>

# eval / new Function
grep -rn "\beval\b\|new Function(" <path>

# document.write
grep -rn "document\.write(" <path>
```

For each hit: determine whether the value originates from user-controlled input or a server response. If so, flag unless sanitized with a vetted library (e.g. `DOMPurify`). Interpolating i18n strings is generally safe; interpolating API response fields is not.

### Unsafe URL / open redirect

```bash
grep -rn "window\.location\s*=" <path>
grep -rn "window\.location\.href\s*=" <path>
grep -rn "window\.location\.assign(" <path>
grep -rn "window\.open(" <path>
grep -rn "href\s*=\s*{" <path>
```

For each hit: check whether the URL value is validated before use. `javascript:` injection via an `href` prop is exploitable. Validate with an allowlist or ensure the value comes from a trusted constant (e.g. `pegasus()`, `studio()`). Flag any URL built by concatenating user input.

### postMessage without origin validation

```bash
grep -rn "addEventListener.*message" <path>
grep -rn "postMessage(" <path>
```

If `addEventListener('message', ...)` is present, verify the handler checks `event.origin` against an allowlist before acting on `event.data`.

### Hardcoded secrets / credentials

```bash
grep -rn -i "api.key\|apikey\|secret\|password\|token\|private.key" <path> | grep -v "\.test\.\|\.spec\.\|_test\.\|#\|//"
```

Flag any hardcoded credential. Legitimate tokens should come from environment variables or Rails config (`CDO.some_key`).

### Sensitive data in analytics / logging

```bash
grep -rn "analyticsReporter\|trackEvent\|console\.log" <path>
```

For each analytics call, inspect the payload object. Student PII (name, email, user ID, school, age/grade) must never appear in analytics events. Teacher IDs are acceptable only in teacher-scoped events. This is a COPPA / FERPA concern.

### localStorage / sessionStorage with PII

```bash
grep -rn "localStorage\.\|sessionStorage\." <path>
```

Flag storage of user IDs, emails, school names, or any field that could identify a minor.

### CSRF — missing credentials on state-mutating requests

```bash
grep -rn "HttpClient\.\|fetch(\|axios\." <path>
```

POST/PUT/PATCH/DELETE calls through `HttpClient` include CSRF tokens by default. Calls via raw `fetch` or `axios` must set `credentials: 'same-origin'` and include the CSRF header. Flag any mutating call that bypasses `HttpClient` without explicit CSRF handling.

---

## Step 3 — Rails / backend checks

### SQL injection

```bash
grep -rn "\.where(\"" dashboard/
grep -rn "\.find_by_sql(" dashboard/
grep -rn "\.execute(" dashboard/
grep -rn "Arel\.sql(" dashboard/
```

Any `where("...")` with string interpolation (`#{...}`) is injectable. Use parameterized queries (`where("col = ?", val)` or hash syntax `where(col: val)`).

### Mass assignment / missing strong params

```bash
grep -rn "\.update(\|\.update_attributes(\|\.new(" dashboard/app/controllers/
```

Verify the value passed is the result of `.permit(...)`, not raw `params` or `request.body`.

### Missing authorization (CanCanCan)

```bash
grep -rn "def (show|create|update|destroy|index)" dashboard/app/controllers/ -A3 | grep -v "authorize\|can?\|load_and_authorize"
```

Every public action that operates on a resource should call `authorize!` or use `load_and_authorize_resource`. Flag actions that act on records without checking the current user's permissions.

### Sensitive data in logs

```bash
grep -rn "Rails\.logger\|logger\.\|puts " dashboard/app/ | grep -i "password\|token\|secret\|email\|student"
```

Rails filters params via `config/application.rb` (`filter_parameters`). Direct `logger` calls bypass this. Flag any log line that could print PII.

### Path traversal

```bash
grep -rn "File\.read\|File\.open\|File\.join\|send_file\|send_data" dashboard/app/controllers/
```

Any file path built from user input must be validated against an allowlist or confined to a safe directory with `File.expand_path` + prefix check.

---

## Step 4 — FERPA: data flows to external services

This platform holds student education records — grades, progress, assignments, school enrollment — protected under FERPA. A disclosure violation occurs when student-identifiable data reaches an external party without consent, regardless of whether that data is "just" a user ID or script ID.

The following external services currently receive data from this codebase. Each has specific rules:

### Statsig (analytics, A/B testing, session replay)

`apps/src/metrics/StatsigReporter.js`, `apps/src/metrics/StatsigSessionReplay.js`

```bash
grep -rn "statsigReporter\.\|StatsigReporter\." <path>
grep -rn "sendEvent\|logEvent\|updateUser" <path>
```

- **User identity**: Statsig is initialized with a hashed user ID and user type. Verify no raw email, name, or school name is passed to `StatsigClient.updateUser()`.
- **Event payloads**: Inspect every `sendEvent` / `logEvent` call for payload fields. Flag: `email`, `name`, `school_name`, raw `user_id` (un-hashed), `student_id`, section/student progress data.
- **Session replay**: Statsig session replay is enabled in production. Any UI element displaying student PII (name, email, grade, progress) **must** carry the CSS class `rr-mask` or `rr-block` to prevent capture. Flag components that render student-identifying text without these classes.

```bash
# Check session replay masking on student-facing text
grep -rn "student\|email\|name\|grade\|progress" <path> | grep -v "rr-mask\|rr-block\|rr-ignore"
```

### Google Analytics 4

`apps/src/metrics/GoogleAnalyticsReporter.js`

```bash
grep -rn "GoogleAnalyticsReporter\|ga4\|gtag" <path>
```

GA4 must not receive any student-identifiable field as an event parameter or user property. Student user IDs must not be sent as `userId`. Flag any `gtag('event', ...)` or `gtag('set', ...)` call that includes student data.

### Sentry (error reporting)

`frontend/packages/core/src/plugins/observability/adapters/SentryAdapter.ts`

```bash
grep -rn "Sentry\.\|captureException\|captureMessage\|addBreadcrumb\|setUser\|setContext\|setExtra" <path>
```

Sentry is configured with `sendDefaultPii: false`, which is correct. Verify:
- `setUser()` is only called with opaque, non-PII identifiers (hashed IDs, role). Never with email or name.
- `captureException` call sites do not attach student records to the `extra` or `context` fields.
- `addBreadcrumb` messages do not embed student names, emails, or progress data.

### AWS Firehose (deprecated pipeline — still live)

`apps/src/metrics/firehose.js`

```bash
grep -rn "firehose\.\|putRecord" <path>
```

Firehose records include `user_id`, `script_id`, `level_id`. These are education records. Any new `putRecord` call should be reviewed — this pipeline is deprecated and new data sinks should go through the Statsig path. Flag any Firehose call that adds new student-identifying fields beyond the existing schema.

### OpenAI / Gemini (AI evaluation)

`dashboard/app/helpers/openai_evaluate_helper.rb`, `dashboard/app/helpers/aichat_openai_responses_client.rb`, `dashboard/app/helpers/aichat_gemini_client.rb`

Student work (code, written responses) is sent to OpenAI and Gemini for evaluation. The **required** guard is:

```ruby
# Must appear before any external AI call
ShareFiltering.find_pii_failure(student_work)
ProfanityFilter.find_potential_profanity(student_work)
```

```bash
grep -rn "openai\|gemini\|responses_client\|evaluate_helper" dashboard/app/ -l
```

For each file that calls an AI client:
1. Verify `ShareFiltering.find_pii_failure` is called and its result checked before the external call.
2. Verify no student name, user ID, school, or teacher name is included in the prompt or system message sent to the API. Prompts should be purely instructional; student content should be the only variable.
3. Flag any new AI integration that skips the PII pre-filter.

### Azure Speech Service

`apps/src/AzureTextToSpeech.js`

Text is sent to Azure for TTS synthesis. Verify the text originates from developer-authored content (i18n strings, level instructions) and not from student-authored input. Student-authored text sent to Azure for TTS is a FERPA disclosure.

### Internal MetricsReporter (URL paths)

`apps/src/metrics/MetricsReporter.ts`

MetricsReporter logs the full `window.location.pathname`, which may encode script slug, level number, and section ID — enough to reconstruct a student's position in the curriculum (an education record).

```bash
grep -rn "MetricsReporter\." <path>
```

Flag any new field added to MetricsReporter payloads that identifies the student rather than the event context.

---

## Step 5 — code.org-specific concerns

### Student vs. teacher privilege escalation

Verify that endpoints or components that expose teacher-only features (section management, progress views, student data) gate on `current_user.teacher?` or the appropriate CanCanCan ability, not just on client-side conditional rendering.

### Age gate / COPPA

Components that collect personal data (email, name, school) must check whether the user is under 13. Look for `under_13?`, `age`, or `date_of_birth` checks before any data collection form is shown. Flag components that render PII-collecting forms without such a gate.

### i18n string injection

`i18n` strings in this repo are developer-controlled and pre-vetted, so interpolation of `i18n.t(...)` into JSX is safe. However, if i18n strings are interpolated with runtime user values via `dangerouslySetInnerHTML`, that is unsafe.

### Curriculum file paths

Any Rails code that reads from `dashboard/config/` using a path derived from request params must validate the path is within the expected directory.

---

## Step 6 — Report findings

Structure findings as:

```
SEVERITY: CRITICAL | HIGH | MEDIUM | LOW | INFO

File: path/to/file.tsx (line N)
Pattern: <what was found>
Risk: <what an attacker could do>
Fix: <recommended remediation>
```

- **CRITICAL** — exploitable with no authentication (XSS on a public page, SQL injection, exposed secret)
- **HIGH** — exploitable with a student account, or likely PII/COPPA violation
- **MEDIUM** — exploitable with a teacher account, or requires specific conditions
- **LOW** — defense-in-depth issue, missing header, minor information disclosure
- **INFO** — pattern worth monitoring, not currently exploitable

If no issues are found, state "No security issues found" explicitly so the result is unambiguous.

---

## Quick-start: audit a single new component

```bash
TARGET=apps/src/path/to/MyComponent.tsx

# XSS
grep -n "dangerouslySetInnerHTML\|innerHTML\s*=\|eval(\|document\.write" $TARGET

# Unsafe URL / redirect
grep -n "window\.location\|window\.open\|href\s*=\s*{" $TARGET

# Browser storage with PII
grep -n "localStorage\|sessionStorage" $TARGET

# Analytics — check payloads manually for student fields
grep -n "analyticsReporter\|statsigReporter\|sendEvent\|logEvent\|trackEvent" $TARGET

# Session replay — student text must carry rr-mask/rr-block
grep -n "student\|email\|name\|grade\|progress" $TARGET | grep -v "rr-mask\|rr-block\|rr-ignore"

# External API calls
grep -n "fetch(\|axios\.\|HttpClient\." $TARGET

# Sentry extras / context
grep -n "captureException\|addBreadcrumb\|setUser\|setContext\|setExtra" $TARGET

# Hardcoded secrets
grep -n -i "api.key\|secret\|token\|password" $TARGET
```

Then read each hit in context before assigning severity. For any analytics call, open the payload object and trace each field back to its source — if it can hold student name, email, school, or un-hashed user ID, that is a FERPA finding.
