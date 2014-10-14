## Metrics

- <%= Contact.count %> unique contacts
- <%= DB[:forms].where(kind:'Petition').count %> petition forms
- <%= DB[:forms].where(kind:'HocCertificate2013').count %> hour-of-code certificates
- <%= DB[:forms].where(kind:'ContactForm').count %> contact forms
- <%= DB[:forms].where(kind:'CSEdWeekEvent2013').count %> csedweek-2013 forms

## Leaderboards

- <%= (HourOfActivity.all(:updated_on.gte=>Date.today-7, started: true) | HourOfActivity.all(:updated_on.gte=>Date.today-7, pixel_started: true)).count %> participants since <%= Date.today-7 %>
- [Countries](/private/countries_leaderboard)
- [States](/private/states_leaderboard)

## Affiliate Workshops

- [Report](/private/professional-development-workshop-report)
