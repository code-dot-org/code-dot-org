module UsersHelper
  include ApplicationHelper

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
      session[:lines] = cookies[:lines] = nil
      session[:progress] = cookies[:progress] = nil
      session[:callouts_seen] = nil
      session[:videos_seen] = nil
    end

    # Returns the number of lines written in the current user session.
    # return [Integer]
    def lines
      undo_cookie_migration_on_rollback
      session[:lines] || 0
    end

    # Add additional lines completed in the given session
    # @param [Integer] added_lines
    def add_lines(added_lines)
      undo_cookie_migration_on_rollback
      session[:lines] = lines + added_lines
    end

    # Returns the progress value for the given level_id, or 0 if there
    # has been no progress.
    # @param [Integer] level_id
    # return [Integer]
    def level_progress(level_id)
      undo_cookie_migration_on_rollback
      (session[:progress] || {}).fetch(level_id.to_i, 0)
    end

    # Sets the progress for the given level_id for the current session.
    # @param [Integer] level_id
    # @param [Integer] progress
    def set_level_progress(level_id, progress)
      undo_cookie_migration_on_rollback
      session[:progress] ||= {}
      session[:progress][level_id.to_i] = progress
    end

    # Returns true if there has been no progress in completing levels for
    # the current session.
    def levels_progress_is_empty_for_test
      !session[:progress] || session[:progress].empty?
    end

    # Adds 'script' to the set of scripts completed for the current session.
    # @param [Integer] script_id
    def add_script(script_id)
      scripts << script_id.to_i unless scripts.include?(script_id)
      session[:scripts] = scripts
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

    # Migrates cookies[:progress] back to session[:progress] in case we end up rolling
    # back the release that does the forward migration. Except in that case, this code
    # does nothing becaue we don't otherwise use cookies[:progress] and cookies[:lines].
    def undo_cookie_migration_on_rollback
      puts cookies[:progress]
      puts session[:progress]
      if cookies[:progress] && !session[:progress]
        begin
          puts "Migrating progress cookie"
          progress = JSON.parse(cookies[:progress])
          # Note that we need to turn string keys back into integers.
          session[:progress] = progress.to_a.inject({}) { |r,s| r.merge({s[0].to_i => s[1]}) }
          cookies.permanent[:progress] = nil
        rescue JSON::ParserError
          # The cookie was malformed, so migration is not possible.
        end
      end

      if cookies[:lines] && !session[:lines]
        session[:lines] = cookies[:lines].to_i
        cookies[:lines] = nil
      end
    end
  end  # class ClientState

  # Returns a client state object for the current session and cookies.
  def client_state
    @client_state ||= ClientState.new(session, cookies)
  end

  # Summarize the current user's progress within a certain script.
  def summarize_user_progress(script, user = current_user)
    user_data = {}
    uls = {}
    script_levels = script.script_levels
    if user
      lines = user.total_lines

      uls = user.user_levels_by_level(script)
      user_data[:disableSocialShare] = true if user.under_13?

      if script.trophies
        progress = user.progress(script)
        user_data[:trophies] = {
            current: progress['current_trophies'],
            of: I18n.t(:of),
            max: progress['max_trophies'],
        }

        user.concept_progress(script).each_pair do |concept, counts|
          user_data[:trophies][concept.name] = counts[:current].to_f / counts[:max]
        end
      end
    else
      lines = client_state.lines
      script_levels = script.script_levels
    end

    user_data.merge!(
        linesOfCode: lines,
        linesOfCodeText: I18n.t('nav.popup.lines', lines: lines),
    )

    user_data[:levels] = {}
    script_levels.each do |sl|
      completion_status = level_info(user, sl, uls)
      if completion_status != 'not_tried'
        user_data[:levels][sl.level_id] = {
          status: completion_status
          # More info could go in here...
        }
      end
    end

    user_data
  end

  def percent_complete(script, user = current_user)
    summary = summarize_user_progress(script, user)
    script.stages.map do |stage|
      levels = stage.script_levels.map(&:level)
      completed = levels.select{|l|sum = summary[:levels][l.id]; sum && %w(perfect passed).include?(sum[:status])}.count
      completed.to_f / levels.count
    end
  end

  def percent_complete_total(script, user = current_user)
    summary = summarize_user_progress(script, user)
    levels = script.script_levels.map(&:level)
    completed = levels.select { |l| sum = summary[:levels][l.id]; sum && %w(perfect passed).include?(sum[:status])}.count
    completed.to_f / levels.count
  end

end
