@chrome
Feature: Global Edition - Farsi MVP - About page

  Background:
    Given I am on "http://code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  @eyes
  Scenario: I see the Farsi MVP About page
    Given I am on "http://code.org/global/fa/about"
    And I open my eyes to test "[Farsi MVP] About page"

    # Section 1: Code.org in Farsi
    Given I wait until element "section:nth-of-type(1) h1" contains text "Code.org به زبان فارسی"

    # Section 2: Follow us on social media
    Given I wait until element "section:nth-of-type(2) h2" contains text "شبکه های اجتماعی ما را دنبال کنید"
    And the link reading "فیسبوک" within element "section:nth-of-type(2)" goes to "https://www.facebook.com/profile.php?id=61556998216913"
    And the link reading "توییتر" within element "section:nth-of-type(2)" goes to "https://x.com/codeinfarsi"
    And the link reading "اینستاگرام" within element "section:nth-of-type(2)" goes to "https://www.instagram.com/codeinfarsi/"

    # Section 3: Empowering Farsi Speakers
    Given I wait until element "section:nth-of-type(3) h2" contains text "توانمندسازی فارسی‌زبانان"

    # Section 4: The Global Impact of Persians in Education & Technology
    Given I wait until element "section:nth-of-type(4) h2" contains text "تأثیر جهانی پارسیان در آموزش و فناوری"

    # Section 5: Iranian Americans for CS Education
    Given I wait until element "section:nth-of-type(5) h2" contains text "ایرانیان آمریکایی برای آموزش علوم کامپیوتری"

    # Section 6: Our Founders' Story
    Given I wait until element "section:nth-of-type(6) h2" contains text "داستان بنیان‌گذاران ما"
    And I wait until element "section:nth-of-type(6) #farsi-carousel swiper-container" is visible

    # Section 7: Code.org in Farsi is about children, not politics
    Given I wait until element "section:nth-of-type(7) h2" contains text "code.org به فارسی درباره کودکان است، نه سیاست"
    # Collapsible 1: What countries is Code.org in?
    When element "section:nth-of-type(7) details:nth-of-type(1) summary" contains text matching "چه کشورهایی در برنامه code.org هستند؟"
    And element "section:nth-of-type(7) details:nth-of-type(1)" is not open
    Then I click selector "section:nth-of-type(7) details:nth-of-type(1) summary"
    And I wait until element "section:nth-of-type(7) details:nth-of-type(1)" is open
    # Collapsible 2: Is Code.org collaborating with the government of _____?
    When element "section:nth-of-type(7) details:nth-of-type(2) summary" contains text matching "آیا code.org با دولت …. همکاری می‌کند؟"
    And element "section:nth-of-type(7) details:nth-of-type(2)" is not open
    Then I click selector "section:nth-of-type(7) details:nth-of-type(2) summary"
    And I wait until element "section:nth-of-type(7) details:nth-of-type(2)" is open
    # Collapsible 3: What is Code.org’s stance on the government of Iran?
    When element "section:nth-of-type(7) details:nth-of-type(3) summary" contains text matching "موضع code.org درباره دولت ایران چیست؟"
    And element "section:nth-of-type(7) details:nth-of-type(3)" is not open
    Then I click selector "section:nth-of-type(7) details:nth-of-type(3) summary"
    And I wait until element "section:nth-of-type(7) details:nth-of-type(3)" is open
    # Collapsible 4: What is Code.org’s stance on the hijab laws in Iran? Do Code.org videos abide by hijab laws?
    When element "section:nth-of-type(7) details:nth-of-type(4) summary" contains text matching "موضع code.org درباره قوانین حجاب در ایران چیست؟ آیا ویدئوهای code.org از قوانین حجاب پیروی می‌کند؟"
    And element "section:nth-of-type(7) details:nth-of-type(4)" is not open
    Then I click selector "section:nth-of-type(7) details:nth-of-type(4) summary"
    And I wait until element "section:nth-of-type(7) details:nth-of-type(4)" is open
    # Collapsible 5: Is Code.org in Farsi compliant with US sanctions on Iran?
    When element "section:nth-of-type(7) details:nth-of-type(5) summary" contains text matching "آیا فعالیت‌های code.org به فارسی با تحریم‌های ایالات متحده علیه ایران مطابقت دارد؟"
    And element "section:nth-of-type(7) details:nth-of-type(5)" is not open
    Then I click selector "section:nth-of-type(7) details:nth-of-type(5) summary"
    And I wait until element "section:nth-of-type(7) details:nth-of-type(5)" is open
    # Collapsible 6: Who funds Code.org in Farsi, and what are their objectives?
    When element "section:nth-of-type(7) details:nth-of-type(6) summary" contains text matching "چه کسانی و با چه اهدافی بودجه code.org به فارسی را فراهم می‌کنند؟"
    And element "section:nth-of-type(7) details:nth-of-type(6)" is not open
    Then I click selector "section:nth-of-type(7) details:nth-of-type(6) summary"
    And I wait until element "section:nth-of-type(7) details:nth-of-type(6)" is open

    # Section 8: Compliance In Support Of Farsi Translations
    Given I wait until element "section:nth-of-type(8) h2" contains text "Compliance In Support Of Farsi Translations"

    When I see no difference for "Main content" within "main"
    Then I close my eyes

  @eyes
  Scenario: I see Our Founders' Story slides on the Farsi MVP About page
    Given I am on "http://code.org/global/fa/about"
    And I open my eyes to test "[Farsi MVP] About page - Our Founders' Story slides"

    When I wait until element "#farsi-carousel swiper-container" is visible
    Then I see no difference for "Slide 1" within "#farsi-carousel"
    When I click selector ".swiper-pagination-bullet:nth-of-type(2)" within shadow-host "#farsi-carousel swiper-container"
    Then I see no difference for "Slide 2" within "#farsi-carousel"
    When I click selector ".swiper-pagination-bullet:nth-of-type(3)" within shadow-host "#farsi-carousel swiper-container"
    Then I see no difference for "Slide 3" within "#farsi-carousel"
    When I click selector ".swiper-pagination-bullet:nth-of-type(4)" within shadow-host "#farsi-carousel swiper-container"
    Then I see no difference for "Slide 4" within "#farsi-carousel"
    When I click selector ".swiper-pagination-bullet:nth-of-type(5)" within shadow-host "#farsi-carousel swiper-container"
    Then I see no difference for "Slide 5" within "#farsi-carousel"
    When I click selector ".swiper-pagination-bullet:nth-of-type(6)" within shadow-host "#farsi-carousel swiper-container"
    Then I see no difference for "Slide 6" within "#farsi-carousel"

    And I close my eyes
