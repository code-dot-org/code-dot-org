module UsersHelper
  include ApplicationHelper

  # TODO (phil): Once all of the frontends are running the new code,
  # Returns the number of lines written in the current user session.
  # return [Integer]
  def session_lines
    # Migrate old session line count if needed.
    if session[:lines]
      cookies[:lines] = session[:lines]
      session[:lines] = nil
    end

    cookies[:lines] || 0
  end

  # Add additional lines completed in the given session.
  # @param [Integer] added_lines
  def session_add_lines(added_lines)
    cookies.permanent[:lines] = session_lines + added_lines
  end

  # Resets all user session state (level progress, lines of code, videos seen,
  # etc.) for tests.
  def session_reset_for_test
    cookies[:lines] = session[:lines] = nil
    cookies[:progress] = session[:progress] = nil
    session[:callouts_seen] = nil
    session[:videos_seen] = nil
  end

  def session_progress_hash
    # Migrates session[:progress] to cookies if needed.
    if session[:progress]
      cookies.permanent[:progress] = JSON.generate(session[:progress])
      session[:progress] = nil
    end

    progress_json = cookies[:progress]
    if progress_json
      begin
        return JSON.parse(progress_json)
      rescue JSON::ParserError
        # fall through to return the empty hash.
      end
    end

    return {}
  end
  private :session_progress_hash

  # Returns the progress value for the given level_id, or 0 if there
  # has been no progress.
  # @param [Integer] level_id
  # return [Integer]
  def session_level_progress(level_id)
    session_progress_hash.fetch(level_id.to_s, 0)
  end

  # Sets the progress for the given level_id for the current session.
  # @param [Integer] level_id
  # @param [Integer] progress_value
  def session_set_level_progress(level_id, progress_value)
    progress_hash = session_progress_hash
    progress_hash[level_id.to_s] = progress_value
    cookies[:progress] = JSON.generate(progress_hash)
  end

  # Returns true if there has been no progress in completing levels for
  # the current session.
  def session_levels_progress_is_empty_for_test
    session_progress_hash.empty?
  end

  # Adds 'script' to the set of scripts completed for the current session.
  # @param [Integer] script_id
  def session_add_script(script_id)
    scripts = session_scripts
    scripts << script_id.to_i unless scripts.include?(script_id)
    session[:scripts] = scripts
  end

  # Returns an array of ids of the scripts completed in the current session.
  # Callers should not mutate the array.
  # @return [Array<Integer>]
  def session_scripts
    session[:scripts] || []
  end

  # Returns a read-only set of the videos seen in the current user session,
  # for tests only.
  # @return Set<String>
  def session_videos_seen_for_test
    session[:videos_seen] || Set.new
  end

  # Adds video_key to the set of videos seen in the current user session.
  # @param [String] video_key
  def session_add_video_seen(video_key)
    (session[:videos_seen] ||= Set.new).add(video_key)
  end

  # Adds video_key to the set of videos seen in the current user session.
  # @param [String] video_key
  # @return Boolean
  def session_video_seen?(video_key)
    s = session[:videos_seen]
    s && s.include?(video_key)
  end

  # Returns if at least one video has been seen in the current user session.
  # For testing only
  # @return Boolean
  def session_videos_seen_for_test?
    !session[:videos_seen].nil?
  end

  # Returns true if the video with the given key has been seen by the
  # current user session.
  # @param [String] callout_key
  # @return Boolean
  def session_callout_seen?(callout_key)
    c = session[:callouts_seen]
    c && c.include?(callout_key)
  end

  # Adds callout_key to the set of callouts seen in the current user session.
  def session_add_callout_seen(callout_key)
    session[:callouts_seen] ||= Set.new
    session[:callouts_seen].add(callout_key)
  end

  # Summarize the current user's progress within a certain script.
  def summarize_user_progress(script, user = current_user)
    user_data = {}
    if user
      lines = user.total_lines
      script_levels = user.levels_from_script(script)

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
      lines = session_lines
      script_levels = script.script_levels
    end

    user_data.merge!(
        linesOfCode: lines,
        linesOfCodeText: I18n.t('nav.popup.lines', lines: lines),
    )

    user_data[:levels] = {}
    script_levels.each do |sl|
      completion_status = level_info(user, sl)
      if completion_status != 'not_tried'
        user_data[:levels][sl.level.id] = {
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
