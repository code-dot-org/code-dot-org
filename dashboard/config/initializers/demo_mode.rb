# frozen_string_literal: true

# See README at https://github.com/Betterment/demo_mode

DemoMode.configure do
  display_credentials
  sign_in_path { new_user_session_path }
  password { SecureRandom.uuid }
end
