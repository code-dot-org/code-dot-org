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

Given(/^I sign in as "([^"]*)"( and go home)?( and wait)?$/) do |name, home, wait|
  wait_seconds = 3
  sleep wait_seconds.to_f if wait
  navigate_to replace_hostname('http://studio.code.org/reset_session')
  sign_in name
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
    email: email,
    uid: generate_oauth_uid,
  }
  return email, password
end

def generate_oauth_uid
  "#{Time.now.to_i}_#{rand(1_000_000)}"
end

def oauth_uid_for_user_by_name(name)
  @users[name][:uid]
end

def find_test_user_by_name(name)
  User.find_by(email: @users[name][:email])
end

def sign_in(name)
  user = @users[name]
  email = user[:email]
  password = user[:password]
  url = "/users/sign_in"
  browser_request(url: url, method: 'POST', body: {user: {login: email, password: password}})
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

# Creates the user and signs them in.
def create_user(name, url: '/api/test/create_user', **user_opts)
  navigate_to replace_hostname('http://studio.code.org/reset_session')
  Retryable.retryable(on: RSpec::Expectations::ExpectationNotMetError, tries: 3) do
    # Generate the user
    email, password = generate_user(name)

    if user_opts[:sso]
      user_opts[:uid] = oauth_uid_for_user_by_name(name)
      user_opts[:sso] = 'google_oauth2' if user_opts[:sso] == 'google'
    end

    # Set the parent email to the user email, if we see it
    # in the user options (we generate the email, here)
    if user_opts.key? :parent_email_preference_email
      user_opts[:parent_email_preference_opt_in_required] = '1'
      user_opts[:parent_email_preference_opt_in] = 'no'
      user_opts[:parent_email_preference_email] = email
      user_opts[:parent_email_preference_request_ip] = '127.0.0.1'
      user_opts[:parent_email_preference_source] = 'ACCOUNT_SIGN_UP'
    end

    if user_opts[:email_preference_opt_in] == 'yes'
      user_opts[:email_preference_form_kind] = email
      user_opts[:email_preference_request_ip] = '127.0.0.1'
      user_opts[:email_preference_source] = 'ACCOUNT_SIGN_UP'
    end

    user_params = {
      user_type: 'student',
      email: email,
      password: password,
      password_confirmation: password,
      name: name,
      age: '16',
      terms_of_service_version: '1',
      sign_in_count: 2
    }.merge(user_opts)
    user_params.delete(:email) if user_params[:email].blank?
    user_params.delete(:password) if user_params[:password].blank?
    user_params.delete(:password_confirmation) if user_params[:password_confirmation].blank?

    # Issue the update request for the user
    browser_request(
      url: url,
      method: 'POST',
      body: {
        user: user_params
      },
      code: 200
    )
  end
end

And(/^I create( as a parent)? a (young )?student(?: using (clever|google))?( in Colorado)?( who has never signed in)? named "([^"]*)"( after CAP start)?( before CAP start)?( and go home)?$/) do |parent_created, young, using_sso, locked, new_account, name, after_cap_start, before_cap_start, home|
  age = young ? '10' : '16'
  sign_in_count = new_account ? 0 : 2

  user_opts = {
    user_type: 'student',
    age: age,
    sign_in_count: sign_in_count,
  }

  if using_sso
    user_opts[:sso] = using_sso
  end

  if locked
    user_opts[:country_code] = "US"
    user_opts[:us_state] = "CO"
    user_opts[:user_provided_us_state] = true
  end

  cap_start_date = DateTime.parse('2023-07-01T00:00:00MDT').freeze

  if after_cap_start
    user_opts[:created_at] = cap_start_date
  end

  if before_cap_start
    user_opts[:created_at] = cap_start_date - 1.second
  end

  if parent_created
    user_opts[:parent_email_preference_email] = "[user-email]"
  end

  create_user(name, **user_opts)
  navigate_to replace_hostname('http://studio.code.org') if home
end

Then /^My parent permits my parental request$/ do
  browser_request(url: '/api/test/accept_parental_request', method: 'POST')
end

And(/^I type the email for "([^"]*)" into element "([^"]*)"$/) do |name, element|
  steps <<~GHERKIN
    And I type "#{@users[name][:email]}" into "#{element}"
  GHERKIN
end

And(/^I press keys for the email for "([^"]*)" into element "([^"]*)"$/) do |name, element|
  steps <<~GHERKIN
    And I press keys "#{@users[name][:email]}" for element "#{element}"
  GHERKIN
end

And(/^I create a student in the eu named "([^"]*)"$/) do |name|
  create_user(name,
              data_transfer_agreement_accepted: true,
              data_transfer_agreement_request_ip: '127.0.0.1',
              data_transfer_agreement_kind: '0',
              data_transfer_agreement_source: 'ACCOUNT_SIGN_UP',
              data_transfer_agreement_at: DateTime.now,
  )
end

And(/^I create a teacher( who has never signed in)? named "([^"]*)"( after CAP start)?( before CAP start)?( and go home)?$/) do |new_account, name, after_cap_start, before_cap_start, home|
  sign_in_count = new_account ? 0 : 2

  user_opts = {
    user_type: 'teacher',
    age: '21+',
    email_preference_opt_in: 'yes',
    sign_in_count: sign_in_count,
  }

  # See Cpa::CREATED_AT_EXCEPTION_DATE
  cap_start_date = DateTime.parse('2024-05-26T00:00:00MDT')

  if after_cap_start
    user_opts[:created_at] = cap_start_date
  end

  if before_cap_start
    user_opts[:created_at] = cap_start_date - 1.second
  end

  create_user(name, **user_opts)
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

And(/^I fill in the sign up email field with a random email$/) do
  email = "user#{Time.now.to_i}_#{rand(1_000_000)}@test.xx"
  steps <<~GHERKIN
    And I type "#{email}" into "#user_email"
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

And(/^I give user "([^"]*)" authorized teacher permission$/) do |_|
  browser_request(url: '/api/test/authorized_teacher_access', method: 'POST')
end

And(/^I get universal instructor access$/) do
  browser_request(url: '/api/test/universal_instructor_access', method: 'POST')
end

And(/^I get plc reviewer access$/) do
  browser_request(url: '/api/test/plc_reviewer_access', method: 'POST')
end

And(/^I get debug info for the current user$/) do
  puts browser_request(url: '/api/v1/users/current', method: 'GET')
end
