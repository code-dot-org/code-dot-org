require 'cdo/anon_user_id'

# A class for reading and writing application state for signed-out users.
# Level progress comes from AnonymousLevel::Progress records; the rest lives in the session.
class ClientState
  attr_reader :request

  delegate :session, :existing_anon_user_id, to: :request, private: true

  def initialize(request:)
    @request = request
  end

  # Resets all client state (anonymous user ID, videos seen, etc.)
  def reset
    Cdo::AnonUserId.clear(request)
    session[:videos_seen] = nil
    session[:callouts_seen] = nil
  end

  # Returns the best result for the given level in the given script, or 0 if there has been no progress.
  #
  # @param [Integer] script_id
  # @param [Integer] level_id
  # @return [Integer]
  def level_progress(script_id:, level_id:)
    anon_user_level_progresses.where(script_id:, level_id:).pick(:best_result) || 0
  end

  # Returns an array of ids of the scripts with progress.
  #
  # @return [Array<Integer>]
  def scripts
    anon_user_level_progresses.distinct.pluck(:script_id)
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

  private def anon_user_level_progresses
    anon_user_id = existing_anon_user_id
    anon_user_id ? AnonymousLevel::Progress.where(anon_user_id:) : AnonymousLevel::Progress.none
  end
end
