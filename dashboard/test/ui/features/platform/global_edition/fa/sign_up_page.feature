@chrome
@pegasus_content
Feature: Global Edition - Farsi MVP - Sign Up page

  Background:
    Given I am on "http://studio.code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  @eyes
  Scenario: I see the Farsi MVP Sign In page
    Given I am on "http://studio.code.org/global/fa/users/sign_up/account_type"
    And I open my eyes to test "[Farsi MVP] Sign Up page"

    # Create your free account
    Given I wait until element "h1" contains text "حساب کاربری رایگان خود را ایجاد کنید"
    And element "[data-testid='student-card'] h1" contains text matching "من یک دانش‌آموز هستم"
    And element "[data-testid='student-card'] button" contains text matching "به عنوان یک دانش‌آموز ثبت نام کنید"
    And element "[data-testid='teacher-card'] h1" contains text matching "من یک معلم هستم"
    And element "[data-testid='teacher-card'] button" contains text matching "به عنوان یک معلم ثبت نام کنید"

    # Free curriculum. Forever.
    Given I wait until element ".fa-book-open-cover + h2" contains text "برنامه درسی رایگان. همیشه."
    And element ".fa-book-open-cover + h2 + button" contains text matching "تعهد ما را به رایگان نگه داشتن برنامه های درسی برای همه بخوانید."

    When I see no difference for "Main content" within "#main_content"
    Then I close my eyes
