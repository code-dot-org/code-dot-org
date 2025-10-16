@chrome
@pegasus_content
Feature: Global Edition - Farsi MVP - Sign In page

  Background:
    Given I am on "http://studio.code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  @eyes
  Scenario: I see the Farsi MVP Sign In page
    Given I am on "http://studio.code.org/global/fa/users/sign_in"
    And I open my eyes to test "[Farsi MVP] Sign In page"

    # Have an account already? Sign in
    Given I wait until element "h2" contains text "دارای حساب کاربری هستید؟ وارد سیستم شوید"
    And element "form[action='/global/fa/join'] button" contains text matching "Go"
    And element "form[action='/global/fa/users/auth/google_oauth2'] button" contains text matching "ورود از طریق حساب گوگل"
    And element "form[action='/global/fa/users/auth/microsoft_v2_auth'] button" contains text matching "ورود از طریق حساب مایکروسافت"
    And element "form[action='/global/fa/users/auth/facebook'] button" contains text matching "ورود از طریق حساب فیس‌بوک"
    And element "form[action='/global/fa/users/auth/clever'] button" contains text matching "ورود از طریق باهوش"
    And element "form[action='/global/fa/users/sign_in'] button" contains text matching "ورود"
    And the link reading "رمز عبور خود را فراموش کرده‌اید؟" within element "#signin" goes to "http://studio.code.org/global/fa/users/password/new"
    And the href of selector "#signin a:contains(یک حساب کاربری ایجاد کنید)" contains "/global/fa/users/sign_up/account_type"

    # Want to try coding without signing in?
    Given I wait until element "#code_without_signing_in" contains text "می‌خواهید برنامه‌نویسی را بدون ثبت نام امتحان کنید؟"
    And the href of selector "#code_without_signing_in + .row a:contains(مهمانی رقص)" contains "/dance"
    And the href of selector "#code_without_signing_in + .row a:contains(ماین‌کرفت)" contains "/api/hour/begin/mc"
    And the href of selector "#code_without_signing_in + .row a:contains(فروزن)" contains "/s/frozen/reset"
    And the href of selector "#code_without_signing_in + .row a:contains(ماز معروف و قدیمی)" contains "/s/hourofcode/reset"

    When I see no difference for "Main content" within "#main_content"
    Then I close my eyes
