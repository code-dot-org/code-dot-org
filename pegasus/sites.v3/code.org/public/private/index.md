## Metrics

- <%= DB[:contacts].count %> unique contacts
- <%= DB[:forms].where(kind:'Petition').count %> petition forms
- <%= DB[:forms].where(kind:'ContactForm').count %> contact forms
- <%= DB[:forms].where(kind:'CSEdWeekEvent2013').count %> csedweek-2013 forms
- [AWS status](/private/aws-status)

## Leaderboards

- [Countries](/private/countries_leaderboard)
- [States](/private/states_leaderboard)
- [Cities](/private/cities_leaderboard)
- [Tutorials](/private/tutorials_leaderboard)

## Affiliate Workshops
- [Workshop stats](/private/workshop-stats)
- [Payment Report](/private/professional-development-workshop-report)
- [Teachers Report](/private/professional-development-workshop-teachers-report)

## Mail

- [Poste Dashboard](/private/poste)

## Tools

- [Grant Permissions](/private/privileges)
- [SOLR](http://solr.code.org:8983/solr/#/collection1/query)


## See also
- [studio home page admin box](<%= CDO.studio_url %>)
- [studio admin/stats](<%= CDO.studio_url('admin/stats') %>)
