# Census Data

There are several sources of census data.

## Census forms that we host

There are multiple forms which have gone through many revisions. This data is all stored in the `census_submissions` table using single table inheritance so that different types and versions of the form get different values for type. All of the form submissions are handled by the same [controller](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/app/controllers/api/v1/census/census_controller.rb).

The different forms are:
* [Census form on code.org/yourschool](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/templates/census2017/CensusForm.jsx)
* [Census form on the Hour of Code signup page](https://github.com/code-dot-org/code-dot-org/blob/73792287ac0a60759c83f2c0f1ae5a5bf5fcc1ce/pegasus/sites.v3/hourofcode.com/views/signup_form.haml#L125)
* [Census banner that shows on the studio.code.org teacher homepage](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/templates/census2017/CensusTeacherBanner.jsx)
  * Showing the banner is controlled by [a check in the user model](https://github.com/code-dot-org/code-dot-org/blob/e68ae4ef08567b67d5a8ce876a14b7588b9ac692/dashboard/app/models/user.rb#L1632-L1636)
  * The time at which we next show the banner is set based on whether the teacher submitted or deferred the banner previously. That is handled in [users_controller.rb](https://github.com/code-dot-org/code-dot-org/blob/79c10e3e735f5c3d9dc72f9f1e701216b7613a54/dashboard/app/controllers/api/v1/users_controller.rb#L37-L69)

Each census submission can be associated with one or more school infos. That mapping lives in `census_submission_school_infos`. As of March 2018 we only ever have a single school info associated with a submission. We chose to allow for multiple school infos per submission in anticipation of a feature that would allow administrators or partners the ability to submit data for multiple schools simultaneously. That feature was deprioritized and has not yet been built.

## College Board data about which schools offer AP Computer Science

This data is stored in `ap_cs_offerings` and is imported from S3 as part of database seeding.

The `ap_school_codes` table is used to map between NCES school ids and college board school codes.

[bin/oneoff/census/ap_data](https://github.com/code-dot-org/code-dot-org/tree/staging/bin/oneoff/census/ap-data) has several scripts that were used to work with the AP data.

## International Baccalaureate data about which schools teach IB Computer Science

This data is stored in the `ib_cs_offerings` table.

The `ib_school_codes` table is used to map between NCES school ids and International Baccalaureate school codes.

[bin/oneoff/census/ib_data](https://github.com/code-dot-org/code-dot-org/tree/staging/bin/oneoff/census/ib-data) has scripts that were used to work with the IB data.

## State-level course data

We get data from some states that list which schools teach which Computer Science classes. This data is stored in the `state_cs_offerings` table.

[bin/oneoff/census/state_data](https://github.com/code-dot-org/code-dot-org/tree/staging/bin/oneoff/census/state-data) has scripts that were used to work with state data.

## Inaccuracy Investigations and Overrides

If somebody submits a survey indicating that they think the data we have is wrong then that reported inaccuracy will appear for review at https://studio.code.org/census/review (you need to have `census_reviewer` permissions to view that page.) After reviewing the report, a row will be created in `census_inaccuracy_investigations`. The reviewer can choose to override the summary for the school as part of the review process. In that case we will also create a row in the `census_overrides` table. That row will be referenced by the `census_inaccuracy_investigations` row.

See also:
* [The controller for the review page](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/app/controllers/census_reviewers_controller.rb)
* [The react component for the  review page](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/templates/census2017/CensusInaccuracyReview.jsx)

# Summarization

Each school may have multiple data points for the same school year. All of that data is aggregated into a simple summary that says if we believe the school teaches/taught Computer Science in a given year. The possible values are:

* **Yes** - We are fairly confident that the school teaches CS
* **No** - We are fairly confident that the school **does not** teach CS
* **Maybe** - The data did not give us a strong indication one way or the other
* **Historical Yes** - We have no data for this year and in one of the past two years we were fairly confident that the school taught CS
* **Historical No** - We have no data for this year and in one of the past two years we were fairly confident that the school **did not** teach CS
* **Historical Maybe** - We have no data for this year and in one of the past two years the data did not give us a strong indication one way or the other
* **Null** - We did not have any data to process for this school

Historical values are only used when we don't have data for the current year. The summaries are stored in the `census_summaries` table. There should be a row for each school in the `schools` table for each school year that we've computed summaries.
Summaries are recomputed every night via a [cron job](https://github.com/code-dot-org/code-dot-org/blob/staging/bin/cron/update_census_mapbox) which uploads the current year's summaries to a public MapBox layer and powers the map shown on /yourschool.

# Mapping from `census_submissions` column names to census questions
Topic questions only show up for those who indicated that their school has a 10 or 20 hr class.
INACCURACY_REPORTED and INACCURACY_COMMENT only show when the user clicks the "I believe that the categorization for this school is inaccurate" link from the map info window.

| Column Name | Question |
| ----------- | -------- |
| HOW_MANY_DO_HOC | How many students will do an Hour of Code?" |
| HOW_MANY_AFTER_SCHOOL | "How many students do computer programming in an after-school program?" |
| HOW_MANY_10_HOURS | "How many students take at least 10 hours of computer programming integrated into a non-Computer Science course (such as TechEd, Math, Science, Art, Library or general classroom/homeroom)?" |
| HOW_MANY_20_HOURS | "How many students take a semester or year-long computer science course that includes at least 20 hours of coding/computer programming?" |
| OTHER_CLASSES_UNDER_20_HOURS | "This school teaches other computing classes that do not include at least 20 hours of coding/computer programming. (For example, learning to use applications, computer literacy, web design, HTML/CSS, or other)" |
| TOPIC_BLOCKS | "Block-based programming" |
| TOPIC_TEXT | "Text-based programming in a language such as Java, JavaScript, Python, C++, etc. (Excluding HTML or CSS)" |
| TOPIC_ROBOTS | "Robotics / Physical Computing" |
| TOPIC_INTERNET | "Internet and networking” |
| TOPIC_SECURITY | "Cybersecurity" |
| TOPIC_DATA | "Data analysis" |
| TOPIC_WEB_DESIGN | "Web design using HTML and CSS" |
| TOPIC_GAME_DESIGN | "Game design using game layout tools without coding or computer programming" |
| TOPIC_ETHICAL_SOCIAL | "Ethical and social issues in computing" |
| TOPIC_OTHER | "Other (please describe):" or "Other (please describe below)” |
| TOPIC_OTHER_DESCRIPTION | This is the description provided when we have the explicit box next to the Other topic option. |
| TOPIC_DO_NOT_KNOW | "I don't know" |
| CLASS_FREQUENCY | "How often per week does this class meet?" |
| TELL_US_MORE | "Please tell us more about this course." |
| PLEDGED | "I pledge to expand computer science offerings at my school, and to engage a diverse group of students, to bring opportunity to all." |
| SHARE_WITH_REGIONAL_PARTNERS | "Share my contact information with the Code.org regional partner in my state so I can be contacted about local professional learning, resources and events." |
| INACCURACY_REPORTED | "I believe that the computer science categorization for this school is inaccurate" |
| INACCURACY_COMMENT | "Explain why you think that the categorization for this school is inaccurate" |

# Historic Notes

Originally, the Hour of Code and /yourschool census form submissions were written to the Pegasus `forms` table. That data was migrated into `census_submissions` and the mapping between the original `forms` row and the `census_submissions` row is stored in `census_submission_form_maps`. The old Pegasus form handlers are [here](https://github.com/code-dot-org/code-dot-org/blob/staging/pegasus/forms/census.rb) and [here](https://github.com/code-dot-org/code-dot-org/blob/staging/pegasus/forms/hoc_census.rb) and the script used to migrate the data is [here](https://github.com/code-dot-org/code-dot-org/blob/staging/bin/oneoff/move_census_data.rb). 

The original (now out of date) census data design doc can be found [here](https://docs.google.com/document/d/1tHtfm4qTpFSG9Pkj_VmMFYqdjqkfuymK3lQf4B35_6Y/edit?pli=1#)
