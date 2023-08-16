# Helper steps for signing in, signing out and permissions

Then /^I sign out using jquery$/ do
  code = <<-JAVASCRIPT
    window.signOutComplete = false;
    function onSuccess() {
      window.signOutComplete = true;
    }
    $.ajax({
      url:'/users/sign_out',
      method: 'GET',
      success: onSuccess
    });
  JAVASCRIPT
  @browser.execute_script(code)
  wait_short_until {@browser.execute_script('return window.signOutComplete;')}
end

Given(/^I sign in as "([^"]*)"( and go home)?$/) do |name, home|
  navigate_to replace_hostname('http://studio.code.org/reset_session')
  user = @users[name]
  email = user[:email]
  password = user[:password]
  url = "/users/sign_in"
  browser_request(url: url, method: 'POST', body: {user: {login: email, password: password}})

  redirect = 'http://studio.code.org/home'
  navigate_to replace_hostname(redirect) if home
end

Given(/^I sign out and sign in as "([^"]*)"$/) do |name|
  steps "And I sign in as \"#{name}\""
end

Given(/^I sign in as "([^"]*)" from the sign in page$/) do |name|
  steps <<~GHERKIN
    And check that the url contains "/users/sign_in"
    And I wait to see "#signin"
    And I fill in username and password for "#{name}"
    And I click "#signin-button"
    And I wait to see ".header_user"
  GHERKIN
end

Given(/^I am a (student|teacher)( and go home)?$/) do |user_type, home|
  random_name = "Test#{user_type.capitalize} " + SecureRandom.base64
  steps "And I create a #{user_type} named \"#{random_name}\"#{home}"
end

def generate_user(name)
  email = "user#{Time.now.to_i}_#{rand(1_000_000)}@test.xx"
  password = name + "password" # hack
  @users ||= {}
  @users[name] = {
    password: password,
    email: email
  }
  return email, password
end

def find_test_user_by_name(name)
  User.find_by(email: @users[name][:email])
end

def sign_up(name)
  wait_proc = proc do
    opacity = @browser.execute_script <<~JS
      field = document.querySelector('#email-block > .error_in_field');
      return field ? parseInt(window.getComputedStyle(field).opacity) : 0;
    JS
    expect(opacity).to eq(0)
  end
  page_load(wait_proc: wait_proc) do
    steps 'And I click selector "#signup-button"'
  end
rescue RSpec::Expectations::ExpectationNotMetError
  tries ||= 0
  raise if (tries += 1) >= 5
  sleep 1

  email, _ = generate_user(name)
  steps "And I type \"#{email}\" into \"#user_email\""
  retry
end

def create_user(name, url: '/users.json', code: 201, **user_opts)
  navigate_to replace_hostname('http://studio.code.org/reset_session')
  Retryable.retryable(on: RSpec::Expectations::ExpectationNotMetError, tries: 3) do
    email, password = generate_user(name)
    browser_request(
      url: url,
      method: 'POST',
      body: {
        user: {
          user_type: 'student',
          email: email,
          password: password,
          password_confirmation: password,
          name: name,
          age: '16',
          terms_of_service_version: '1',
          sign_in_count: 2
        }.merge(user_opts)
      },
      code: code
    )
  end
end

And(/^I create a (young )?student( in Colorado)?( who has never signed in)? named "([^"]*)"( and go home)?$/) do |young, locked, new_account, name, home|
  age = young ? '10' : '16'
  sign_in_count = new_account ? 0 : 2

  user_opts = {
    age: age,
    sign_in_count: sign_in_count
  }

  if locked
    user_opts[:country_code] = "US"
    user_opts[:us_state] = "CO"
  end

  create_user(name, **user_opts)
  navigate_to replace_hostname('http://studio.code.org') if home
end

And(/^I type the email for "([^"]*)" into element "([^"]*)"$/) do |name, element|
  steps <<~GHERKIN
    And I type "#{@users[name][:email]}" into "#{element}"
  GHERKIN
end

And(/^I create a student in the eu named "([^"]*)"$/) do |name|
  create_user(name,
    data_transfer_agreement_required: '1',
    data_transfer_agreement_accepted: '1'
  )
end

And(/^I create a teacher( who has never signed in)? named "([^"]*)"( and go home)?$/) do |new_account, name, home|
  sign_in_count = new_account ? 0 : 2

  create_user(name, age: '21+', user_type: 'teacher', email_preference_opt_in: 'yes', sign_in_count: sign_in_count)
  navigate_to replace_hostname('http://studio.code.org') if home
end

And(/^I fill in the sign up form with (in)?valid values for "([^"]*)"$/) do |invalid, name|
  password = invalid ? 'Short' : 'ExtraLong'
  email = "user#{Time.now.to_i}_#{rand(1_000_000)}@test.xx"
  age = "10"
  steps <<~GHERKIN
    And I type "#{name}" into "#user_name"
    And I type "#{email}" into "#user_email"
    And I type "#{password}" into "#user_password"
    And I type "#{password}" into "#user_password_confirmation"
    And I select the "#{age}" option in dropdown "user_age"
    And I click ".btn.btn-primary" to load a new page
  GHERKIN
end

And(/I fill in username and password for "([^"]*)"$/) do |name|
  steps <<~GHERKIN
    And I type "#{@users[name][:email]}" into "#user_login"
    And I type "#{@users[name][:password]}" into "#user_password"
  GHERKIN
end

And(/I fill in account email and current password for "([^"]*)"$/) do |name|
  steps <<~GHERKIN
    And I type "#{@users[name][:email]}" into "#user_email"
    And I type "#{@users[name][:password]}" into "#user_current_password"
  GHERKIN
end

When(/^I sign out$/) do
  if @browser.current_url.include?('studio')
    browser_request(url: replace_hostname('/users/sign_out.json'), code: 204)
    @browser.execute_script("sessionStorage.clear(); localStorage.clear();")
  else
    navigate_to replace_hostname('http://studio.code.org/reset_session')
  end
end

When(/^I am not signed in/) do
  steps 'element ".header_user:contains(Sign in)" is visible'
end

And(/^eight days pass for user "([^"]*)"$/) do |name|
  pass_time_for_user name, 8.days.ago
end

And(/^one year passes for user "([^"]*)"$/) do |name|
  pass_time_for_user name, 1.year.ago
end

def pass_time_for_user(name, amount_of_time)
  require_rails_env
  user = User.find_by_email_or_hashed_email(@users[name][:email])
  user.created_at = amount_of_time
  user.last_seen_school_info_interstitial = amount_of_time if user.last_seen_school_info_interstitial
  user.save!
  user.user_school_infos.each do |info|
    info.last_confirmation_date = amount_of_time
    info.save!
  end
end

And(/^I give user "([^"]*)" authorized teacher permission$/) do |name|
  require_rails_env
  user = User.find_by_email_or_hashed_email(@users[name][:email])
  user.permission = UserPermission::AUTHORIZED_TEACHER
  user.save!
end

And(/^I get universal instructor access$/) do
  browser_request(url: '/api/test/universal_instructor_access', method: 'POST')
end

And(/^I get plc reviewer access$/) do
  browser_request(url: '/api/test/plc_reviewer_access', method: 'POST')
end
