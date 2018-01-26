# Census Data

There are several sources of census data.

## Census forms that we host

There are multiple forms which have gone through many revisions. This data is all stored in the `census_submissions` table using single table inheritance so that different types and versions of the form get different values for type. All of the form submissions are handled by the same [controller](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/app/controllers/api/v1/census/census_controller.rb).

The different forms are:
* [Census form on code.org/yourschool](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/templates/census2017/CensusForm.jsx)
* [Census form on the Hour of Code signup page](https://github.com/code-dot-org/code-dot-org/blob/73792287ac0a60759c83f2c0f1ae5a5bf5fcc1ce/pegasus/sites.v3/hourofcode.com/views/signup_form.haml#L125)
* [Census banner that shows on the studio.code.org teacher homepage](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/templates/census2017/CensusTeacherBanner.jsx)

## College Board data about which schools offer AP Computer Science

This data is stored in `ap_cs_offerings` and is imported from S3 as part of database seeding.

## International Baccalaureate data about which schools teach IB Computer Science

This data is stored in the `ib_cs_offerings` table.

## State-level course data

We get data from some states that list which schools teach which Computer Science classes. This data is stored in the `state_cs_offerings` table.

# Historic Notes

Originally, the Hour of Code and /yourschool census form submissions were written to the Pegasus `forms` table. That data was migrated into `census_submissions` and the mapping between the original `forms` row and the `census_submissions` row is stored in `census_submission_form_maps`. The old Pegasus form handlers are [here](https://github.com/code-dot-org/code-dot-org/blob/staging/pegasus/forms/census.rb) and [here](https://github.com/code-dot-org/code-dot-org/blob/staging/pegasus/forms/hoc_census.rb) and the script used to migrate the data is [here](https://github.com/code-dot-org/code-dot-org/blob/staging/bin/oneoff/move_census_data.rb). 

