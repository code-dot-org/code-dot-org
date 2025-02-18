# Skipped due to flakiness caused by the CDO icon animation on YouTube videos
@skip
@chrome
Feature: Global Edition - Farsi MVP - Videos page

  Background:
    Given I am on "http://code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  @eyes
  Scenario: I see the Farsi MVP Videos page
    Given I am on "http://code.org/global/fa/videos"
    And I open my eyes to test "[Farsi MVP] Videos page"

    # Section 1: Educational short videos
    Given I wait until element "section:nth-of-type(1) h1" contains text "فیلم های کوتاه آموزشی"

    # Section 2: How AI Works
    Given I wait until element "section:nth-of-type(2) h2" contains text "هوش مصنوعی چگونه کار می کند"
    And I wait until element "section:nth-of-type(2) .how-ai-works" is visible

    # Section 3: How Computers Work
    Given I wait until element "section:nth-of-type(3) h2" contains text "چگونه کامپیوتر کار می کند"
    And I wait until element "section:nth-of-type(3) .how-computers-work" is visible

    # Section 4: How the Internet Works
    Given I wait until element "section:nth-of-type(4) h2" contains text "اینترنت چگونه کار میکند"
    And I wait until element "section:nth-of-type(4) .how-internet-works" is visible

    # Section 5: Explore all Code.org videos on YouTube
    Given I wait until element "section:nth-of-type(5) p" contains text "دنبال چيز ديگه اي ميگردي؟ ما فیلم های بسیار خوبی در کانال Youtube خود داریم."
    And the link reading "همه ویدیوهای Code.org را در یوتیوب کاوش کنید" within element "section:nth-of-type(5)" goes to "https://www.youtube.com/channel/UCJyEBMU1xVP2be1-AoGS1BA"

    When I see no difference for "Main content" within "main"
    Then I close my eyes

  @eyes
  Scenario: I see How AI Works videos on the Farsi MVP Videos page
    Given I am on "http://code.org/global/fa/videos"
    And I open my eyes to test "[Farsi MVP] Videos page - How AI Works videos"

    When I wait until element ".how-ai-works" is visible
    Then I see no difference for "Videos 1 and 2" within ".how-ai-works"
    When I click selector ".swiper-pagination-bullet:nth-of-type(2)" within shadow-host ".how-ai-works"
    Then I see no difference for "Videos 3 and 4" within ".how-ai-works"
    When I click selector ".swiper-pagination-bullet:nth-of-type(3)" within shadow-host ".how-ai-works"
    Then I see no difference for "Videos 5 and 6" within ".how-ai-works"
    When I click selector ".swiper-pagination-bullet:nth-of-type(4)" within shadow-host ".how-ai-works"
    Then I see no difference for "Videos 7 and 8" within ".how-ai-works"

    And I close my eyes

  @eyes
  Scenario: I see How Computers Work videos on the Farsi MVP Videos page
    Given I am on "http://code.org/global/fa/videos"
    And I open my eyes to test "[Farsi MVP] Videos page - How Computers Work videos"

    When I wait until element ".how-computers-work" is visible
    Then I see no difference for "Videos 1 and 2" within ".how-computers-work"
    When I click selector ".swiper-pagination-bullet:nth-of-type(2)" within shadow-host ".how-computers-work"
    Then I see no difference for "Videos 3 and 4" within ".how-computers-work"
    When I click selector ".swiper-pagination-bullet:nth-of-type(3)" within shadow-host ".how-computers-work"
    Then I see no difference for "Videos 5 and 6" within ".how-computers-work"

    And I close my eyes

  @eyes
  Scenario: I see How the Internet Works videos on the Farsi MVP Videos page
    Given I am on "http://code.org/global/fa/videos"
    And I open my eyes to test "[Farsi MVP] Videos page - How the Internet Works videos"

    When I wait until element ".how-internet-works" is visible
    Then I see no difference for "Videos 1 and 2" within ".how-internet-works"
    When I click selector ".swiper-pagination-bullet:nth-of-type(2)" within shadow-host ".how-internet-works"
    Then I see no difference for "Videos 3 and 4" within ".how-internet-works"
    When I click selector ".swiper-pagination-bullet:nth-of-type(3)" within shadow-host ".how-internet-works"
    Then I see no difference for "Videos 5 and 6" within ".how-internet-works"
    When I click selector ".swiper-pagination-bullet:nth-of-type(4)" within shadow-host ".how-internet-works"
    Then I see no difference for "Videos 7 and 8" within ".how-internet-works"

    And I close my eyes
