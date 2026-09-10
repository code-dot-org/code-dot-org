---
title: Email pipeline
description: How Poste2 queues and delivers transactional email through SES, how Mailjet handles PD mail, and how to send mail locally.
type: concept
---

CodeAI sends email through two independent paths: Poste2 for all transactional mail and Mailjet for a subset of professional-development mail.

## Poste2

Poste2 is the homegrown mail-delivery layer. It is not a third-party service; the code lives in `lib/cdo/poste/`.

### How it works

1. **ActionMailer hands off to Poste2.** In production, staging, and development, the delivery method is `Poste2::DeliveryMethod` (set in each environment file).
2. **Poste2 writes a row to MySQL.** `Poste2.send_message` inserts a record into the `poste_deliveries` table. No network call happens at this point -- the mail is queued in the database.
3. **A cron process polls and delivers.** `bin/cron/deliver_poste_messages_process.rb` pops undelivered rows and opens an `Net::SMTP` connection to AWS SES's SMTP endpoint (`email-smtp.us-east-1.amazonaws.com:587`, STARTTLS). This is a raw SMTP relay, not the SES API or SDK.
4. **Metrics are recorded.** `EmailDeliveryInterceptor` pushes a CloudWatch `EmailToSend` metric before delivery. `EmailDeliveryObserver` pushes `EmailSent` after delivery. Both are registered in `dashboard/config/initializers/email_delivery_watchers.rb`.

### Mailers

Mailer classes live in `dashboard/app/mailers/`:

- `ApplicationMailer` -- base class.
- `FollowerMailer` -- student-joins-section and related notifications.
- `ParentMailer` -- parent permission and consent emails.
- `TeacherMailer` -- teacher notifications.
- `LtiMailer` -- LTI account-linking emails.
- `InactiveUserPurgeMailer` -- account inactivity warnings.
- `PeerReviewMailer` -- PLC peer review notifications.
- `PlaceholderMailer` -- Jotform placeholder fill-in emails.
- `Pd::*` -- professional-development workshop mailers (see Mailjet below).

## Mailjet

Mailjet is a separate delivery path used for professional-development workshop mail, teacher course-list syncing, and account-deletion contact removal. It uses the Mailjet HTTP API, not SMTP, and is entirely independent of Poste2 and ActionMailer.

Mailjet is gated by the DCDO flag `use_mailjet` (default `false`). When the flag is off, PD mailers fall back to the standard Poste2 path. The Mailjet API keys come from `CDO.mailjet_api_key` and `CDO.mailjet_secret_key`.

Key consumers:
- `Pd::WorkshopMailjetMailer` -- workshop enrollment confirmations and reminders.
- `Section#add_teacher_to_mailjet_course_list` -- adds a teacher to a Mailjet contact list when they join a section.
- `DeleteAccountsHelper` -- removes a Mailjet contact on account deletion.

## Sending mail locally

In development, ActionMailer uses `Poste2::DeliveryMethod` by default. Poste2 writes to the local MySQL `poste_deliveries` table but no cron process runs to relay the messages, so **mail is queued but never sent**. You can inspect queued mail by reading the table directly:

```
bin/mysql-client-dashboard-reader
SELECT * FROM poste_deliveries ORDER BY id DESC LIMIT 5;
```

If you need mail to actually deliver locally, configure SMTP in `locals.yml` (see the commented-out SMTP block in `dashboard/config/environments/development.rb`).

In the test environment, the delivery method is `:test`, so all mail is captured in `ActionMailer::Base.deliveries` for assertion.
