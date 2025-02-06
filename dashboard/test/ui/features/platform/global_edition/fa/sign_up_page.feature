@chrome
Feature: Global Edition - Farsi MVP - Sign Up page

  Background:
    Given I am on "http://code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  @eyes
  Scenario: I see the Farsi MVP Sign In page
    Given I am on "http://studio.code.org/global/fa/users/new_sign_up/account_type"
    And I open my eyes to test "[Farsi MVP] Sign Up page"

    # Create your free account
    Given I wait until element ".src-templates-account-account-components-module__bannerContainer h1" contains text "حساب کاربری رایگان خود را ایجاد کنید"
    And element ".src-signUpFlow-signUpFlowStyles-module__cardWrapper [data-testid='student-card'] h1" contains text matching "من یک دانش‌آموز هستم"
    And element ".src-signUpFlow-signUpFlowStyles-module__cardWrapper [data-testid='student-card'] button" contains text matching "به عنوان یک دانش‌آموز ثبت نام کنید"
    And element ".src-signUpFlow-signUpFlowStyles-module__cardWrapper [data-testid='teacher-card'] h1" contains text matching "من یک معلم هستم"
    And element ".src-signUpFlow-signUpFlowStyles-module__cardWrapper [data-testid='teacher-card'] button" contains text matching "به عنوان یک معلم ثبت نام کنید"

    # Free curriculum. Forever.
    Given I wait until element ".src-signUpFlow-signUpFlowStyles-module__freeCurriculumWrapper h2" contains text "برنامه درسی رایگان. همیشه."
    And element ".src-signUpFlow-signUpFlowStyles-module__freeCurriculumWrapper button" contains text matching "تعهد ما را به رایگان نگه داشتن برنامه های درسی برای همه بخوانید."

    When I see no difference for "Main content" within "#main_content"
    Then I close my eyes
