require 'test_helper'
require 'open3'

class AWSCredsMustBeOptionalTest < ActiveSupport::TestCase
  # This test enforces this rule: if you add a new `mynewsecret: !Secret` override to development.yml
  # the dashboard rails app must still be able to start in RAILS_ENV=development. That means if
  # you access CDO.mynewsecret, you must either catch exceptions or reference it inside a function
  # that is not invoked when all the ruby code is loaded.
  test 'dashboard boots in RAILS_ENV=development without requiring !Secret AWS credentials' do
    ENV_VARS = {
      # This is a hack, but it effectively disables access to existing AWS creds:
      'AWS_PROFILE' => 'nope',
      'DISABLE_SPRING' => '1',
      'RAILS_ENV' => 'development',
    }

    # Please do not add to this list. Instead, seek to remove from the list.
    # Then you will see that it is not the list that grows, it is your mind.
    LOCALOVERRIDE_LEGACY_SECRETS = %w(
      slack_bot_token
      openai_lesson_summaries_api_key
      elevenlabs_api_key
      openai_student_learning_api_key
      langfuse_secret_key
      langfuse_public_key
      openai_measures_of_learning_api_key
    ).index_with {'localoverride'}.transform_keys {|key| "CDO_#{key}"}

    # Start a new `rails runner` process and make sure it boots
    stdout, stderr, status = Open3.capture3(
      {**ENV_VARS, **LOCALOVERRIDE_LEGACY_SECRETS},
      'bin/rails',
      'runner',
      'puts :rails_booted_ok',
      chdir: Rails.root.to_s
    )

    assert status.success?, <<~MSG
      Expected dashboard to boot in RAILS_ENV=development without requiring AWS credentials

      Tip: if you just added a `mynewsecret: !Secret` override to development.yml.erb, you shouldn't
      be accessing it from top-level code (outside functions), or if you do, you need an exception handler.

      stdout:
      #{stdout}

      stderr:
      #{stderr}
    MSG

    assert_includes stdout, 'rails_booted_ok'
  end
end
