# A class for reading and writing application state for signed-out users.
# Level progress comes from AnonymousLevel::Progress records; the rest lives in the session.
class ClientState
  attr_reader :request

  delegate :anon_user_id, :session, to: :request

  def initialize(request:)
    @request = request
  end

  # Resets all client state (videos seen, etc.)
  def reset
    session[:videos_seen] = nil
    session[:callouts_seen] = nil
  end

  # Returns the best result for the given script level, or 0 if there has been no progress.
  # @param [ScriptLevel] script_level
  # return [Integer]
  def level_progress(script_id:, level_id:)
    AnonymousLevel::Progress.find_by(anon_user_id:, script_id:, level_id:)&.best_result || 0
  end

  # Returns an array of ids of the scripts with progress.
  # @return [Array<Integer>]
  def scripts
    return [] unless anon_user_id
    AnonymousLevel::Progress.where(anon_user_id:).distinct.pluck(:script_id)
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
    s&.include?(video_key)
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
    c&.include?(callout_key)
  end

  # Adds callout_key to the set of callouts seen in the current user session.
  def add_callout_seen(callout_key)
    session[:callouts_seen] ||= []
    # Ensure all old states that are using a Set are converted to an Array
    session[:callouts_seen] = session[:callouts_seen].to_a
    # Deletes a key if it exists (does nothing if not)
    session[:callouts_seen].delete(callout_key)
    # Append to the end of the list
    session[:callouts_seen] << callout_key
    # Rotate the list to only a certain number of the newest items
    session[:callouts_seen].shift(session[:callouts_seen].length - 20) if session[:callouts_seen].length > 20
  end
end
