require 'cdo/hip_chat'

BUILD_STARTED_PATH = deploy_dir('build-started')

# Used to restart builds on staging/test via Slack /start-build slash command.
post '/api/dev/start-build' do
  # Forbidden in production because it's a dev route
  # Forbidden in development because it won't work anyway
  forbidden! if [:development, :production].include? rack_env

  dont_cache

  # Don't create build-started if it already exists, but do notify of extra requests.
  if File.file?(BUILD_STARTED_PATH)
    HipChat.log 'Build restart requested via /api/dev/start-build was ignored - a build is already queued'
    return
  end

  # Create the build-started file so a new build will start within one minute
  system "touch #{BUILD_STARTED_PATH}"
  HipChat.log 'Build restarted via /api/dev/start-build'
end
