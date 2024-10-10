@single_session
Feature: Hamburger dropdown
  @no_mobile
  Scenario: Signed out user in English should not see hamburger on large desktop
    Given I am on "http://code.org/"
    And I dismiss the language selector
    And I change the browser window size to 1300 by 768
    Then I wait to see ".header_button"
    Then element "#hamburger-icon" is not visible

  @no_mobile
  @eyes
  Scenario: Signed out user in English should see hamburger on small desktop
    Given I am on "http://code.org/"
    And I dismiss the language selector
    And I change the browser window size to 1268 by 768
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I open my eyes to test "Signed out small desktop hamburger"
    And element "#learn" is not visible
    And element "#educate_entries" is not visible
    And element "#districts" is not visible
    And I see "#stats"
    And I see "#help-us"
    And I see "#incubator"
    And I see "#about_entries"
    And I see "#legal_entries"
    And I see "#support"
    And I see "#report-bug"
    And I see no difference for "Signed out small desktop hamburger"
    And I close my eyes

  @no_mobile
  Scenario: Signed out user in English should see hamburger on tablet
    Given I am on "http://code.org/"
    And I dismiss the language selector
    And I change the browser window size to 1023 by 768
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#learn"
    And I see "#educate_entries"
    And I see "#districts"
    And I see "#stats"
    And I see "#help-us"
    And I see "#incubator"
    And I see "#about_entries"
    And I see "#legal_entries"
    And I see "#support"
    And I see "#report-bug"

  @only_phone
  Scenario: Signed out user should see Sign in and Create account buttons on code.org mobile
    Given I am on "http://code.org/"
    And I rotate to portrait
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#signin_button"
    And I see "#create_account_button"

  @only_phone
  Scenario: Signed out user should see Sign in and Create account buttons on studio.code.org mobile
    Given I am on "http://studio.code.org/catalog"
    And I rotate to portrait
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#signin_button"
    And I see "#create_account_button"

  @no_mobile
  Scenario: Student viewing hamburger dropdown and help button dropdown in English on desktop
    Given I create a student named "Sally Student" and go home
    Then I wait to see "#hamburger-icon"
    Then I wait to see "#help-button"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#learn"
    And I see "#districts"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about_entries"
    And I see "#educate_entries"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"

  @no_mobile
  Scenario: Teacher viewing hamburger dropdown (with expanded options) and help button dropdown in English on desktop
    Given I create a teacher named "Tessa Teacher" and go home
    Then I wait to see "#hamburger-icon"
    Then I wait to see "#help-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#learn"
    And I see "#districts"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about_entries"
    And I click selector "#about_entries"
    And I wait to see "#about-us"
    And I see "#educate_entries"
    And I click selector "#educate_entries"
    And I wait to see "#educate-overview"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"

  @no_mobile
  Scenario: Applab-specific help links
    Given I create a teacher named "Tessa Teacher"
    And I am on "http://studio.code.org/projects/applab/new"
    Then I wait to see "#help-icon"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#applab-docs"
    And I see "#applab-tutorials"

  @no_mobile
  Scenario: Gamelab-specific help links
    Given I create a teacher named "Tessa Teacher"
    And I am on "http://studio.code.org/projects/gamelab/new"
    Then I wait to see "#help-icon"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#gamelab-docs"

  @no_mobile
  Scenario: Student viewing hamburger dropdown and help button in English on desktop on level
    Given I create a student named "Sally Student"
    And I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1"
    Then I wait until I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1"
    Then I wait to see "#hamburger-icon"
    Then I wait to see "#help-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see ".divider#after-student"
    And I see "#learn"
    And I see "#educate_entries"
    And I see "#districts"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about_entries"
    And I see "#legal_entries"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#support"
    And I see "#report-bug"

  @no_mobile
  Scenario: Teacher viewing hamburger dropdown and help button in English on desktop on level
    Given I create a teacher named "Tessa Teacher"
    And I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1"
    Then I wait until I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1"
    Then I wait to see "#hamburger-icon"
    Then I wait to see "#help-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see ".divider#after-teacher"
    And I see "#learn"
    And I see "#educate_entries"
    And I see "#districts"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about_entries"
    And I see "#legal_entries"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"

  @no_mobile
  Scenario: Signed out user viewing help dropdown in Spanish on desktop
    Given I am on "http://code.org/lang/es"
    Then I wait until I am on "http://code.org/"
    And I dismiss the language selector
    And I wait to see "#help-icon"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    Then element "#teacher-community" is not visible
    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds

  @no_mobile
  Scenario: Student viewing help dropdown in Spanish on desktop
    Given I create a student named "Eva Estudiante"
    Given I am on "http://studio.code.org/home/lang/es"
    Then I wait until I am on "http://studio.code.org/home?lang=es"
    And I wait to see "#help-contents"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    Then element "#teacher-community" is not visible

    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds

  @no_mobile
  Scenario: Teacher viewing help dropdown in Spanish on desktop
    Given I create a teacher named "Pabla Profesora"
    Given I am on "http://studio.code.org/home/lang/es"
    Then I wait until I am on "http://studio.code.org/home?lang=es"
    Then I wait to see "#help-icon"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"
    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds

  @no_mobile
  Scenario: Student viewing help dropdown in Spanish on desktop on level
    Given I create a student named "Eva Estudiante"
    Given I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1/lang/es"
    Then I wait until I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1?lang=es"
    Then I wait to see "#help-icon"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds

  @no_mobile
  Scenario: Teacher viewing help dropdown in Spanish on desktop on level
    Given I create a teacher named "Pabla Profesora"
    Given I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1/lang/es"
    Then I wait until I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1?lang=es"
    Then I wait to see "#help-icon"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"
    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds

  @chrome
  Scenario: Logged out user can click on the hamburger links
    Given I am on "http://code.org/"
    And I set the language cookie
    And I set the cookie named "_loc_notice" to "1"

    # For signed-out users, they only see the hamburger menu at a smaller size
    And I change the browser window size to 1023 by 768
    And I reload the page

    # We click on each hamburger link and see where we go
    Then I can navigate the following hamburger menu items:
      | text                   | url                                          |
      | Learn                  | http://code.org/students                     |
      | Districts              | http://code.org/administrators               |
      | Stats                  | http://code.org/promote                      |
      | Help Us                | http://code.org/help                         |
      | Incubator              | http://studio.code.org/incubator             |

    # The Teach submenu
    Then I can navigate the following hamburger menu items within the educate_entries submenu:
      | text                   | url                                          |
      | Educator Overview      | http://code.org/teach                        |
      | Course Catalog         | http://studio.code.org/catalog               |
      | Elementary School      | http://code.org/curriculum/elementary-school |
      | Middle School          | http://code.org/curriculum/middle-school     |
      | High School            | http://code.org/curriculum/high-school       |
      | Beyond Code.org        | http://code.org/curriculum/3rd-party         |
      | Technical Requirements | http://code.org/educate/it                   |
      | Tools and Videos       | http://code.org/educate/resources/videos     |

    # These URLs are not possible to visit in our UI tests because they either take too long
    # to load or are external links, so we just look at the link targets
    Then I could navigate the following hamburger menu items within the educate_entries submenu:
      | text                   | url                                          |
      | Online Community       | https://forum.code.org/                      |
      | Hour of Code           | https://hourofcode.com/                      |

    # The About submenu
    Then I can navigate the following hamburger menu items within the about_entries submenu:
      | text                   | url                                          |
      | About Us               | http://code.org/about                        |
      | Leadership             | http://code.org/about/leadership             |
      | Donors                 | http://code.org/about/supporters             |
      | Full Team              | http://code.org/about/team                   |
      | Newsroom               | http://code.org/about/news                   |

    # These URLs are not possible to visit in our UI tests because they either take too long
    # to load or are external links, so we just look at the link targets
    Then I could navigate the following hamburger menu items within the about_entries submenu:
      | text                   | url                                          |
      | FAQs                   | http://code.org/faq                          |
      | Careers                | http://code.org/about/jobs                   |
      | Contact Us             | http://code.org/contact                      |
      | Partners               | http://code.org/about/partners               |

    # The Privacy & Legal submenu
    Then I can navigate the following hamburger menu items within the legal_entries submenu:
      | text                   | url                                          |
      | Privacy Policy         | http://code.org/privacy                      |
      | Cookie Notice          | http://code.org/privacy/cookies              |
      | Terms of Service       | http://code.org/tos                          |

    Then I change the browser window size to 1280 by 1024
    And I delete the cookie named "_loc_notice"

  @chrome
  Scenario: Teacher can click on the hamburger links
    Given I create a teacher named "Sir Clicks-A-Lot Teacher" and go home
    And I set the language cookie
    And I set the cookie named "_loc_notice" to "1"

    # We click on each hamburger link and see where we go
    Then I can navigate the following hamburger menu items:
      | text                   | url                                          |
      | Learn                  | http://code.org/students                     |
      | Districts              | http://code.org/administrators               |
      | Stats                  | http://code.org/promote                      |
      | Help Us                | http://code.org/help                         |

    # The Teach submenu
    Then I can navigate the following hamburger menu items within the educate_entries submenu:
      | text                   | url                                          |
      | Educator Overview      | http://code.org/teach                        |
      | Elementary School      | http://code.org/curriculum/elementary-school |
      | Middle School          | http://code.org/curriculum/middle-school     |
      | High School            | http://code.org/curriculum/high-school       |
      | Beyond Code.org        | http://code.org/curriculum/3rd-party         |
      | Technical Requirements | http://code.org/educate/it                   |
      | Tools and Videos       | http://code.org/educate/resources/videos     |

    # These URLs are not possible to visit in our UI tests because they either take too long
    # to load or are external links, so we just look at the link targets
    Then I could navigate the following hamburger menu items within the educate_entries submenu:
      | text                   | url                                          |
      | Online Community       | https://forum.code.org/                      |
      | Hour of Code           | https://hourofcode.com/                      |

    # The About submenu
    Then I can navigate the following hamburger menu items within the about_entries submenu:
      | text                   | url                                          |
      | About Us               | http://code.org/about                        |
      | Leadership             | http://code.org/about/leadership             |
      | Donors                 | http://code.org/about/supporters             |
      | Full Team              | http://code.org/about/team                   |
      | Newsroom               | http://code.org/about/news                   |

    # These URLs are not possible to visit in our UI tests because they either take too long
    # to load or are external links, so we just look at the link targets
    Then I could navigate the following hamburger menu items within the about_entries submenu:
      | text                   | url                                          |
      | FAQs                   | http://code.org/faq                          |
      | Careers                | http://code.org/about/jobs                   |
      | Contact Us             | http://code.org/contact                      |
      | Partners               | http://code.org/about/partners               |

    # The Privacy & Legal submenu
    Then I can navigate the following hamburger menu items within the legal_entries submenu:
      | text                   | url                                          |
      | Privacy Policy         | http://code.org/privacy                      |
      | Cookie Notice          | http://code.org/privacy/cookies              |
      | Terms of Service       | http://code.org/tos                          |

    Then I delete the cookie named "_loc_notice"

  @chrome
  Scenario: Student can click on the hamburger links
    Given I create a student named "Squire Clicks-A-Lot Student" and go home
    And I set the language cookie
    And I set the cookie named "_loc_notice" to "1"

    # We click on each hamburger link and see where we go
    Then I can navigate the following hamburger menu items:
      | text                   | url                                          |
      | Learn                  | http://code.org/students                     |
      | Districts              | http://code.org/administrators               |
      | Stats                  | http://code.org/promote                      |
      | Help Us                | http://code.org/help                         |

    # The Teach submenu
    Then I can navigate the following hamburger menu items within the educate_entries submenu:
      | text                   | url                                          |
      | Educator Overview      | http://code.org/teach                        |
      | Elementary School      | http://code.org/curriculum/elementary-school |
      | Middle School          | http://code.org/curriculum/middle-school     |
      | High School            | http://code.org/curriculum/high-school       |
      | Beyond Code.org        | http://code.org/curriculum/3rd-party         |
      | Technical Requirements | http://code.org/educate/it                   |
      | Tools and Videos       | http://code.org/educate/resources/videos     |

    # These URLs are not possible to visit in our UI tests because they either take too long
    # to load or are external links, so we just look at the link targets
    Then I could navigate the following hamburger menu items within the educate_entries submenu:
      | text                   | url                                          |
      | Online Community       | https://forum.code.org/                      |
      | Hour of Code           | https://hourofcode.com/                      |

    # The About submenu
    Then I can navigate the following hamburger menu items within the about_entries submenu:
      | text                   | url                                          |
      | About Us               | http://code.org/about                        |
      | Leadership             | http://code.org/about/leadership             |
      | Donors                 | http://code.org/about/supporters             |
      | Full Team              | http://code.org/about/team                   |
      | Newsroom               | http://code.org/about/news                   |

    # These URLs are not possible to visit in our UI tests because they either take too long
    # to load or are external links, so we just look at the link targets
    Then I could navigate the following hamburger menu items within the about_entries submenu:
      | text                   | url                                          |
      | FAQs                   | http://code.org/faq                          |
      | Careers                | http://code.org/about/jobs                   |
      | Contact Us             | http://code.org/contact                      |
      | Partners               | http://code.org/about/partners               |

    # The Privacy & Legal submenu
    Then I can navigate the following hamburger menu items within the legal_entries submenu:
      | text                   | url                                          |
      | Privacy Policy         | http://code.org/privacy                      |
      | Cookie Notice          | http://code.org/privacy/cookies              |
      | Terms of Service       | http://code.org/tos                          |

    Then I delete the cookie named "_loc_notice"
