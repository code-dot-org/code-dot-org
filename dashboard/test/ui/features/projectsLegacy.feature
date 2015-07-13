Feature: Projects

# TODO - do we need to make sure we have a valid channel
# TODO - IE9

@stop_after_failure
Scenario Outline: Proper redirects when signed out
  Given I am on "<url>"
  Then I get redirected to "<redirected>" via "<redirect_source>"
Examples:
  | url                                                                 | redirected                                    | redirect_source |
  | http://studio.code.org/p/applab                                     | /users/sign_in                                | dashboard |
  | http://studio.code.org/p/applab#M17JvqZ68AlDVpRfsdUSSw/edit         | /users/sign_in                                | dashboard |
  | http://studio.code.org/p/applab#M17JvqZ68AlDVpRfsdUSSw              | /projects/applab/M17JvqZ68AlDVpRfsdUSSw       | pushState |
  | http://studio.code.org/p/playlab                                    | /projects/playlab                             | pushState |
  | http://studio.code.org/p/playlab#M17JvqZ68AlDVpRfsdUSSw             | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw      | pushState |
  | http://studio.code.org/p/playlab#M17JvqZ68AlDVpRfsdUSSw/edit        | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw/edit | pushState |
  | http://studio.code.org/p/artist                                     | /projects/artist                              | pushState |
  | http://studio.code.org/p/artist#M17JvqZ68AlDVpRfsdUSSw              | /projects/artist/M17JvqZ68AlDVpRfsdUSSw       | pushState |
  | http://studio.code.org/p/artist#M17JvqZ68AlDVpRfsdUSSw/edit         | /projects/artist/M17JvqZ68AlDVpRfsdUSSw/edit  | pushState |
  | http://studio.code.org/projects/applab                              | /users/sign_in                                | dashboard |
  | http://studio.code.org/projects/applab/M17JvqZ68AlDVpRfsdUSSw/edit  | /users/sign_in                                | dashboard |
  | http://studio.code.org/projects/applab/M17JvqZ68AlDVpRfsdUSSw       | /projects/applab/M17JvqZ68AlDVpRfsdUSSw       | none |
  | http://studio.code.org/projects/playlab                             | /projects/playlab                             | none |
  | http://studio.code.org/projects/playlab/M17JvqZ68AlDVpRfsdUSSw      | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw      | none |
  | http://studio.code.org/projects/playlab/M17JvqZ68AlDVpRfsdUSSw/edit | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw/edit | none |

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
#   | http://studio.code.org/p/applab#M17JvqZ68AlDVpRfsdUSSw/edit         | /projects/applab/M17JvqZ68AlDVpRfsdUSSw/edit  | dashboard |
#   | http://studio.code.org/p/applab#M17JvqZ68AlDVpRfsdUSSw              | /projects/applab/M17JvqZ68AlDVpRfsdUSSw       | pushState |
#   | http://studio.code.org/p/playlab                                    | /projects/playlab                             | pushState |
#   | http://studio.code.org/p/playlab#M17JvqZ68AlDVpRfsdUSSw             | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw      | pushState |
#   | http://studio.code.org/p/playlab#M17JvqZ68AlDVpRfsdUSSw/edit        | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw/edit | pushState |
#   | http://studio.code.org/p/artist                                     | /projects/artist                              | pushState |
#   | http://studio.code.org/p/artist#M17JvqZ68AlDVpRfsdUSSw              | /projects/artist/M17JvqZ68AlDVpRfsdUSSw       | pushState |
#   | http://studio.code.org/p/artist#M17JvqZ68AlDVpRfsdUSSw/edit         | /projects/artist/M17JvqZ68AlDVpRfsdUSSw/edit  | pushState |
#   | http://studio.code.org/projects/applab                              | /projects/applab                              | dashboard |
#   | http://studio.code.org/projects/applab/M17JvqZ68AlDVpRfsdUSSw/edit  | /projects/applab/M17JvqZ68AlDVpRfsdUSSw/edit  | dashboard |
#   | http://studio.code.org/projects/applab/M17JvqZ68AlDVpRfsdUSSw       | /projects/applab/M17JvqZ68AlDVpRfsdUSSw       | none |
#   | http://studio.code.org/projects/playlab                             | /projects/playlab                             | none |
#   | http://studio.code.org/projects/playlab/M17JvqZ68AlDVpRfsdUSSw      | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw      | none |
#   | http://studio.code.org/projects/playlab/M17JvqZ68AlDVpRfsdUSSw/edit | /projects/playlab/M17JvqZ68AlDVpRfsdUSSw/edit | none |
