require 'test_helper'
require 'open3'

class AWSCredsMustBeOptionalTest < ActiveSupport::TestCase
  # This test enforces this rule: if you add a new `mynewsecret: !Secret` override to development.yml
  # the dashboard rails app must still be able to start in RAILS_ENV=development. That means if
  # you access CDO.mynewsecret, you must either catch exceptions or reference it inside a function
  # that is not invoked when all the ruby code is loaded.
  test 'dashboard boots in RAILS_ENV=development without requiring !Secret AWS credentials' do
    ENV_VARS = {
      'RAILS_ENV' => 'development',
      'DISABLE_SPRING' => '1',

      # This is a hack, but it effectively disables access to existing AWS creds:
      'AWS_PROFILE' => 'nope',
      'AWS_EC2_METADATA_DISABLED' => 'true', # defend against IMDS
      'AWS_ACCESS_KEY_ID' => '',
      'AWS_SECRET_ACCESS_KEY' => '',
      'AWS_SESSION_TOKEN' => '',
    }

    # Please do not add to this list. Instead, seek to remove from the list.
    # Then you will see that it is not the list that grows, it is your mind.
    LEGACY_SECRETS_THAT_ALREADY_BREAK_THINGS = %w(
      slack_bot_token
      openai_lesson_summaries_api_key
      openai_student_learning_api_key
      langfuse_secret_key
      langfuse_public_key
      openai_measures_of_learning_api_key
    ).map {|secret| "CDO_#{secret}"}.index_with('')

    # Start a new `rails runner` process and make sure it boots w/o AWS access
    stdout, stderr, status = Open3.capture3(
      {**ENV_VARS, **LEGACY_SECRETS_THAT_ALREADY_BREAK_THINGS},
      'bin/rails',
      'runner',
      <<~RUBY,
        # Getting here means nothing if we hadn't correctly disabled AWS access for this process
        we_have_aws_access = Aws::STS::Client.new.get_caller_identity rescue false
        raise "Test invalidated: we have AWS access here and should not" if we_have_aws_access

        puts :rails_booted_without_aws
      RUBY
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

    assert_includes stdout, 'rails_booted_without_aws'
  end
end
