# TODO (brent): disabling this feature to start with, as it takes a while to run,
#   and doesn't deliver us a ton of value, in particular given how few places
#   we now use pushState. If we start splitting our tests into a quick run and
#   and longer run, this might be a good candidate for a longer run.

# Feature: Projects
#
# # TODO - this isnt going to work in other environments (where this channel_id
# #        doesn't exist
# # TODO - IE9 doesnt have push state, and will behave differently
#
# @stop_after_failure
# Scenario Outline: Proper redirects when signed out
#   Given I am on "<url>"
#   Then I get redirected to "<redirected>" via "<redirect_source>"
# Examples:
#   | url                                                                 | redirected                                    | redirect_source |
#   | http://studio.code.org/p/applab                                     | /users/sign_in                                | dashboard |
#   | http://studio.code.org/p/applab#M17JvqZ68AlDVpRfsdUSSw/edit         | /users/sign_in                                | dashboard |
#   | http://studio.code.org/p/applab#M17JvqZ68AlDVpRfsdUSSw              | /projects/applab/M17JvqZ68AlDVpRfsdUSSw       | dashboard |
#   | http://studio.code.org/p/playlab                                    | /projects/playlab                             | dashboard |
#   | http://studio.code.org/p/playlab#M17JvqZ68AlDVpRfsdUSSw             | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw      | dashboard |
#   | http://studio.code.org/p/playlab#M17JvqZ68AlDVpRfsdUSSw/edit        | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw/view | pushState |
#   | http://studio.code.org/p/artist                                     | /projects/artist                              | dashboard |
#   | http://studio.code.org/p/artist#M17JvqZ68AlDVpRfsdUSSw              | /projects/artist/M17JvqZ68AlDVpRfsdUSSw       | dashboard |
#   | http://studio.code.org/p/artist#M17JvqZ68AlDVpRfsdUSSw/edit         | /projects/artist/M17JvqZ68AlDVpRfsdUSSw/view  | pushState |
#   | http://studio.code.org/projects/applab                              | /users/sign_in                                | dashboard |
#   | http://studio.code.org/projects/applab/M17JvqZ68AlDVpRfsdUSSw/edit  | /users/sign_in                                | dashboard |
#   | http://studio.code.org/projects/applab/M17JvqZ68AlDVpRfsdUSSw       | /projects/applab/M17JvqZ68AlDVpRfsdUSSw       | none |
#   | http://studio.code.org/projects/playlab                             | /projects/playlab                             | none |
#   | http://studio.code.org/projects/playlab/M17JvqZ68AlDVpRfsdUSSw      | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw      | none |
#   | http://studio.code.org/projects/playlab/M17JvqZ68AlDVpRfsdUSSw/edit | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw/view | pushState |
#
# @dashboard_db_access @stop_after_failure
# Scenario Outline: Proper redirects urls when signed in
#   Given I am on "http://studio.code.org/"
#   And I am a student
#   And I am on "http://studio.code.org/users/sign_in"
#   Then I am on "<url>"
#   And I get redirected to "<redirected>" via "<redirect_source>"
# Examples:
#   | url                                                                 | redirected                                    | redirect_source |
#   | http://studio.code.org/p/applab                                     | /projects/applab                              | dashboard |
#   # Ideally we would test that for the owner, /edit pages end up on /edit instead of /view
#   # For this example in particular, we do a dashboard based redirect to /edit, and then a pushState to /view
#   | http://studio.code.org/p/applab#M17JvqZ68AlDVpRfsdUSSw/edit         | /projects/applab/M17JvqZ68AlDVpRfsdUSSw/view  | pushState |
#   | http://studio.code.org/p/applab#M17JvqZ68AlDVpRfsdUSSw              | /projects/applab/M17JvqZ68AlDVpRfsdUSSw       | dashboard |
#   | http://studio.code.org/p/playlab                                    | /projects/playlab                             | dashboard |
#   | http://studio.code.org/p/playlab#M17JvqZ68AlDVpRfsdUSSw             | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw      | dashboard |
#   | http://studio.code.org/p/playlab#M17JvqZ68AlDVpRfsdUSSw/edit        | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw/view | pushState |
#   | http://studio.code.org/p/artist                                     | /projects/artist                              | dashboard |
#   | http://studio.code.org/p/artist#M17JvqZ68AlDVpRfsdUSSw              | /projects/artist/M17JvqZ68AlDVpRfsdUSSw       | dashboard |
#   | http://studio.code.org/p/artist#M17JvqZ68AlDVpRfsdUSSw/edit         | /projects/artist/M17JvqZ68AlDVpRfsdUSSw/view  | pushState |
#   | http://studio.code.org/projects/applab                              | /projects/applab                              | dashboard |
#   | http://studio.code.org/projects/applab/M17JvqZ68AlDVpRfsdUSSw/edit  | /projects/applab/M17JvqZ68AlDVpRfsdUSSw/view  | pushState |
#   | http://studio.code.org/projects/applab/M17JvqZ68AlDVpRfsdUSSw       | /projects/applab/M17JvqZ68AlDVpRfsdUSSw       | none |
#   | http://studio.code.org/projects/playlab                             | /projects/playlab                             | none |
#   | http://studio.code.org/projects/playlab/M17JvqZ68AlDVpRfsdUSSw      | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw      | none |
#   | http://studio.code.org/projects/playlab/M17JvqZ68AlDVpRfsdUSSw/edit | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw/view | pushState |
