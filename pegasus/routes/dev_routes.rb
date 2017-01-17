BUILD_STARTED_PATH = deploy_dir('build-started')

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
  JSON.pretty_generate({
    text: "#{rack_env.to_s.capitalize} build restarted by #{params[:user_name]}",
    response_type: 'in_channel'
  })
end
