require 'cdo/developers_topic'
require 'cdo/github'
require 'cdo/infra_test_topic'
require 'cdo/eyes_utils'
require 'cdo/chat_client'

BUILD_STARTED_PATH = deploy_dir('build-started')
CHECK_DTS_ACTIONS = [
  'opened',
  'reopened',
  'edited',
  'synchronize',
]
MERGE_EYES = '[merge eyes]'.freeze

# Used to restart builds on staging/test via Slack slash commands.
post '/api/dev/start-build' do
  # Forbidden in production because it's a dev route
  # Forbidden in development because it won't work anyway
  forbidden! if [:development, :production].include? rack_env

  dont_cache

  forbidden! unless params[:token] == CDO.slack_start_build_token

  # Don't create build-started if it already exists; let the requester know.
  if File.file?(BUILD_STARTED_PATH)
    return "I can't do that #{params[:user_name]} - a build is already queued"
  end

  # Create the build-started file so a new build will start within one minute
  system "touch #{BUILD_STARTED_PATH}"

  # Notify the room
  content_type :json
  JSON.pretty_generate(
    {
      text: "#{rack_env.to_s.capitalize} build restarted by #{params[:user_name]}",
      response_type: 'in_channel'
    }
  )
end

post '/api/dev/set-last-dtt-green' do
  forbidden! unless rack_env == :test
  dont_cache
  forbidden! unless params[:token] == CDO.slack_set_last_dtt_green_token

  sha = GitHub.sha('test')
  InfraTestTopic.set_green_commit(sha)
  if params[:text] == 'yes'
    DevelopersTopic.set_dtt('yes')
  end
end

post '/api/dev/check-dts' do
  forbidden! unless rack_env == :staging || rack_env == :development
  forbidden! unless verify_signature(CDO.github_webhook_secret)
  data = JSON.parse(params[:payload])
  unless CHECK_DTS_ACTIONS.include?(data['action']) &&
      request.env['HTTP_X_GITHUB_EVENT'] == 'pull_request' &&
      data['pull_request']['base']['ref'] == 'staging'
    status 202
    next 'I only check the DTS status for PRs against staging'
  end
  GitHub.configure_octokit
  if DevelopersTopic.dts?
    GitHub.set_dts_check_pass(data['pull_request'])
  else
    GitHub.set_dts_check_fail(data['pull_request'])
  end
  'success'
end

post '/api/dev/check-dtsn' do
  forbidden! unless rack_env == :test || rack_env == :development
  forbidden! unless verify_signature(CDO.github_webhook_secret)
  data = JSON.parse(params[:payload])
  unless CHECK_DTS_ACTIONS.include?(data['action']) &&
      request.env['HTTP_X_GITHUB_EVENT'] == 'pull_request' &&
      data['pull_request']['base']['ref'] == 'staging-next'
    status 202
    next 'I only check the DTSN status for PRs against staging-next'
  end
  GitHub.configure_octokit
  if DevelopersTopic.dtsn?
    GitHub.set_dtsn_check_pass(data['pull_request'])
  else
    GitHub.set_dtsn_check_fail(data['pull_request'])
  end
  'success'
end

post '/api/dev/merge-eyes-baselines' do
  forbidden! unless [:staging, :development].include?(rack_env)
  forbidden! unless verify_signature(CDO.github_webhook_secret)

  payload = JSON.parse(params['payload'])
  pr = payload['pull_request']

  # for now, PR authors must opt in to eyes baseline merging
  next unless pr['title'].include?(MERGE_EYES)

  branch = pr['head']['ref']
  if request.env['HTTP_X_GITHUB_EVENT'] == 'pull_request' &&
      payload['action'] == 'closed' && pr['merged']
    ChatClient.wrap "merging eyes baselines for PR \##{pr['number']} branch #{branch}" do
      EyesRestUtils.copy_eyes_baselines(branch, 'staging')
    end
  end
  'success'
end
