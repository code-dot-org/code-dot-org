---
name: sample-workshops
description: Seed the local dev database with sample professional learning workshops (regional, national, full, hidden, past) for a chosen ZIP code, then check them against the workshop catalog page and its JSON endpoints. Use when working on /professional-learning/workshops, regional_workshop_data or workshop_catalog_data and the local catalog is empty, or when asked to seed, reset or remove sample workshops.
---

# Sample workshops

The seeder is `dashboard/lib/devtools/sample_workshops.rb`, run by
`rake seed:sample_workshops`. It refuses to run outside development and
adhoc. Do not edit the seeded rows by hand; change the seeder.

## 1. Choose a ZIP

The catalog shows regional workshops only for ZIPs mapped to a regional
partner. The seeder maps its own partner, "Sample Regional Partner", to
exactly one ZIP, replacing any ZIP from an earlier run.

In order of preference:

1. A ZIP the developer names.
2. The ZIP the catalog page pre-fills for their local account. Ask for the
   account's email, then from `dashboard/`:

       bin/rails runner 'u = User.find_by(email: ARGV[0]); si = u&.school_info
         puts si&.school&.zip || si&.zip || "no school ZIP"' <email>

   If the account has no school ZIP, say so and fall back.
3. The default, 98101 (downtown Seattle).

## 2. Seed

From `dashboard/`:

    ZIP=<zip> bin/rake seed:sample_workshops

The task prints the partner, its ZIP and every workshop with its id and
start date. Rerunning hard-deletes the previous run's workshops, so ids
change. The partner, its two users (`sample_workshops_pm@example.com`,
`sample_workshops_organizer@example.com`) and one non-assignable course
offering are reused across runs.

Failures:

- `Not a 5-digit US ZIP code`: pass five digits.
- `ZIP ... already belongs to regional partner ...`: a real partner in this
  database owns that ZIP. Pick another ZIP; do not remap the other partner.
- `Should not be run outside of adhoc or development`: wrong RAILS_ENV.

## 3. Check

All names start with `[sample]`. Dates are relative to the day of seeding.

| Workshops                                  | `?zip=<seeded zip>` | no zip, or any other ZIP |
|--------------------------------------------|---------------------|--------------------------|
| 3 regional (one full, one virtual)         | listed              | absent                   |
| 2 national                                 | listed              | listed                   |
| 1 national, organized by the local partner | listed once         | listed                   |
| 1 hidden, 1 already past                   | absent              | absent                   |

If dashboard is running on :3000, check the endpoint:

    curl -s 'http://localhost-studio.code.org:3000/professional-learning/workshop_catalog_data?zip=<zip>'

and the page itself, which renders the same data through
`regional_workshop_data` and the embedded national list:

    http://localhost-studio.code.org:3000/professional-learning/workshops?zip=<zip>

If dashboard is not running, ask before starting it.

## Removing

From `dashboard/`:

    bin/rails runner 'require Rails.root.join("lib/devtools/sample_workshops").to_s; SampleWorkshops.clean'

This removes the workshops, their sessions and enrollments. The partner,
users and course offering stay; they are inert without workshops.
