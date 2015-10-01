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

  # Resets all client state (level progress, lines of code, videos seen, etc.)
  def reset
    cookies[:lines] = nil
    cookies[:progress] = nil
    session[:videos_seen] = nil
    session[:callouts_seen] = nil
  end

  # Returns the number of lines written in the current user session.
  # return [Integer]
  def lines
    migrate_cookies
    (cookies[:lines] || 0).to_i
  end

  # Add additional lines completed in the given session
  # @param [Integer] added_lines
  def add_lines(added_lines)
    migrate_cookies
    cookies.permanent[:lines] = (lines + added_lines).to_s
  end

  # Returns the progress value for the given level_id, or 0 if there
  # has been no progress.
  # @param [Integer] level_id
  # return [Integer]
  def level_progress(level_id)
    migrate_cookies
    progress_hash.fetch(level_id.to_s, 0)
  end

  # Sets the progress for the given level_id for the current session.
  # @param [Integer] level_id
  # @param [Integer] progress
  def set_level_progress(level_id, progress_value)
    migrate_cookies
    updated_progress = progress_hash.merge({level_id.to_s => progress_value})
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
    cookies[:scripts] = JSON.generate(s)
  end

  # Returns an array of ids of the scripts completed in the current session.
  # Callers should not mutate the array.
  # @return [Array<Integer>]
  def scripts
    parse_json(cookies[:scripts], default = [])
  end

  # Adds video_key to the set of videos seen in the current user session.
  # @param [String] video_key
  def add_video_seen(video_key)
    v = videos_seen
    v << video_key unless v.include?(video_key)
    cookies[:videos_seen] = JSON.generate(v)
  end

  # Returns true if the given video has been seen.
  # @param [String] video_key
  # @return Boolean
  def video_seen?(video_key)
    videos_seen.include?(video_key)
  end

  # Returns if at least one video has been seen in the current user session.
  # For testing only
  # @return Boolean
  def videos_seen_for_test?
    videos_seen.length > 0
  end

  # Returns true if the video with the given key has been seen by the
  # current user session.
  # @param [String] callout_key
  # @return Boolean
  def callout_seen?(callout_key)
    callouts_seen.include?(callout_key)
  end

  # Adds callout_key to the set of callouts seen in the current user session.
  def add_callout_seen(callout_key)
    c = callouts_seen
    c << callout_key unless c.include?(callout_key)
    cookies[:callouts_seen] = JSON.generate(c)
  end

  private

  # Parse str as a json string, returning default if str is nil or malformed.
  def parse_json(str, default = [])
    return default if !str
    str ? JSON.parse(str) : default
  rescue JSON::JSONError
    default
  end

  # Returns an array of all of the video keys that have been seen.
  # return [Array<String>]
  def videos_seen
    migrate_cookies
    parse_json(cookies[:videos_seen], default = [])
  end

  # Returns an array of all of the callout key that have been seen.
  # return [Array<String>]
  def callouts_seen
    migrate_cookies
    parse_json(cookies[:callouts_seen], default = [])
  end

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
    if session[:lines]
      cookies[:lines] = session[:lines].to_s
      session[:lines] = nil
    end
    if session[:videos_seen]
      cookies.permanent[:videos_seen] = JSON.generate(session[:videos_seen].to_a)
      session[:videos_seen] = nil
    end
    if session[:callouts_seen]
      cookies.permanent[:callouts_seen] = JSON.generate(session[:callouts_seen].to_a)
      session[:callouts_seen] = nil
    end
  end

end  # class ClientState
