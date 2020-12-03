# A class for reading and writing application state persisted in client cookies.
# Currently this state is in the session cookie but some it will migrate to
# unencrypted cookies in a subsequent PR. (To allow rollback of the release
# without loss of progress, this implementation also includes code to migrate
# state from unencrypted cookies back into the session cookie.)
class ClientState
  attr_reader :session, :cookies

  def initialize(session, cookies)
    @session = session
    @cookies = cookies
  end

  # Resets all client state (level progress, videos seen, etc.)
  def reset
    cookies[:progress] = nil
    session[:videos_seen] = nil
    session[:callouts_seen] = nil
  end

  # Returns the progress value for the given level_id, or 0 if there
  # has been no progress.
  # @param [ScriptLevel] script_level
  # return [Integer]
  def level_progress(script_level)
    migrate_cookies
    progress_hash.fetch(script_level.script.name, {}).fetch(script_level.level_id.to_s, 0)
  end

  # Sets the progress for the given level_id for the current session.
  # @param [ScriptLevel] script_level
  # @param [Integer] progress_value
  def set_level_progress(script_level, progress_value)
    migrate_cookies
    updated_progress = progress_hash.deep_merge(script_level.script.name => {script_level.level_id.to_s => progress_value})
    cookies.permanent[:progress] = JSON.generate(updated_progress)
  end

  # Returns true if there has been no progress in completing levels for
  # the current session.
  def level_progress_is_empty_for_test
    progress_hash.empty?
  end

  # Adds 'script' to the set of scripts completed for the current session.
  # @param [Integer] script_id
  def add_script(script_id)
    s = scripts
    s << script_id.to_i unless s.include?(script_id)
    session[:scripts] = s
  end

  # Returns an array of ids of the scripts completed in the current session.
  # Callers should not mutate the array.
  # @return [Array<Integer>]
  def scripts
    session[:scripts] || []
  end

  # Returns a read-only set of the videos seen in the current user session,
  # for tests only.
  # @return Set<String>
  def videos_seen_for_test
    session[:videos_seen] || Set.new
  end

  # Adds video_key to the set of videos seen in the current user session.
  # @param [String] video_key
  def add_video_seen(video_key)
    (session[:videos_seen] ||= Set.new).add(video_key)
  end

  # Adds video_key to the set of videos seen in the current user session.
  # @param [String] video_key
  # @return Boolean
  def video_seen?(video_key)
    s = session[:videos_seen]
    s && s.include?(video_key)
  end

  # Returns if at least one video has been seen in the current user session.
  # For testing only
  # @return Boolean
  def videos_seen_for_test?
    !session[:videos_seen].nil?
  end

  # Returns true if the video with the given key has been seen by the
  # current user session.
  # @param [String] callout_key
  # @return Boolean
  def callout_seen?(callout_key)
    c = session[:callouts_seen]
    c && c.include?(callout_key)
  end

  # Adds callout_key to the set of callouts seen in the current user session.
  def add_callout_seen(callout_key)
    session[:callouts_seen] ||= Set.new
    session[:callouts_seen].add(callout_key)
  end

  private

  def progress_hash
    migrate_cookies
    progress = cookies[:progress]
    progress ? JSON.parse(progress) : {}
  rescue JSON::ParserError
    return {}
  end

  # Migrates session state to unencrypted cookies.
  def migrate_cookies
    if session[:progress]
      cookies.permanent[:progress] = JSON.generate(session[:progress])
      session[:progress] = nil
    end
  end
end
