@chrome
Feature: Global Edition - Farsi MVP - Landing page

  Background:
    Given I am on "http://code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  @eyes
  Scenario: I see the Farsi MVP landing page
    Given I am on "http://code.org/global/fa"
    And I open my eyes to test "[Farsi MVP] Landing page"

    # Section 1: Free foundational computer science curriculum
    Given I wait until element "section:nth-of-type(1) h1" contains text "منابع بنیادی رایگان برای علوم رایانه"
    And the link reading "ایجاد حساب کاربری رایگان" within element "section:nth-of-type(1)" goes to "http://studio.code.org/users/new_sign_up/account_type"

    # Section 2: Curriculum offerings students love
    Given I wait until element "section:nth-of-type(2) h2" contains text "پیشنهادات برنامه درسی موردعلاقه دانش‌آموزان"
    And the link reading "ساعت کد را کاوش کنید" within element "section:nth-of-type(2)" goes to "http://code.org/global/fa/hourofcode"
    And the link reading "درس‌های بدون کامپیوتر را کاوش کنید" within element "section:nth-of-type(2)" goes to "https://studio.code.org/s/k5-unplugged"
    And the link reading "بررسی مبانی علوم کامپیوتر" within element "section:nth-of-type(2)" goes to "http://code.org/global/fa/csf"
    And the link reading "مشاهده کل کاتالوگ برنامه درسی" within element "section:nth-of-type(2)" goes to "http://studio.code.org/catalog"

    # Section 3: Video library
    Given I wait until element "section:nth-of-type(3) h2" contains text "آرشیو ویدیوها"
    And the link reading "کاوش در آرشیو ویدیوها" within element "section:nth-of-type(3)" goes to "http://code.org/global/fa/videos"

    When I see no difference for "Main content" within "main"
    Then I close my eyes
