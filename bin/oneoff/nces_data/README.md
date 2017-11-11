# NCES Data Import Scripts

Every year the [National Center for Education Statistics (NCES)](https://nces.ed.gov/)
collects survery results for schools and districts.

## What tables need updating?

* [school_districts](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/app/models/school_district.rb), contains the directory of public/charter school districts
* [schools](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/app/models/school.rb), contains the directory of public/charter/private schools
* [school_stats_by_years](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/app/models/school_stats_by_year.rb), contains data regarding enrollment and grade levels

## Where to store the NCES data files?

Import files are organized by year and type in the S3 bucket `cdo-nces`
* `ccd`, represents the common core data for public and charter schools
* `pss`, represents the private school survey data

## NCES Data Directories

* [Public/Charter School Districts](https://nces.ed.gov/ccd/pubagency.asp)
* [Public/Charter Schools](https://nces.ed.gov/ccd/pubschuniv.asp)
* [Private Schools](https://nces.ed.gov/surveys/pss/pssdata.asp)
