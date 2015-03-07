module UsersHelper

  # Summarize the current user's progress within a certain script.
  def summarize_user_progress(script, callouts_seen = nil, videos_seen = nil)
    return nil if !current_user

    user_data = {
      linesOfCode: current_user.total_lines,
      linesOfCodeText: t('nav.popup.lines', lines: current_user.total_lines),
      levels: {},
      videos_seen: videos_seen,
      callouts_seen: callouts_seen
    }

    # Get all user_levels
    user_levels = current_user.levels_from_script(script)

    user_levels.map do |sl|
      completion_status, link = level_info(current_user, sl)
      if completion_status != 'not_tried'
        user_data[:levels][sl.level.id] = {
          status: completion_status
          # More info could go in here...
        }
      end
    end

    user_data[:disableSocialShare] = true if current_user.under_13?

    if script.trophies
      progress = current_user.progress(script)
      concepts = current_user.concept_progress(script)

      user_data[:trophies] = {
        current: progress['current_trophies'],
        of: t(:of),
        max: progress['max_trophies']
      }

      concepts.each_pair do |concept, counts|
        user_data[:trophies][concept.name] = counts[:current].to_f / counts[:max]
      end

    end

    user_data
  end

end
