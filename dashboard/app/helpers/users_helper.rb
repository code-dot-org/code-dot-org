module UsersHelper

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
            of: t(:of),
            max: progress['max_trophies'],
        }

        user.concept_progress(script).each_pair do |concept, counts|
          user_data[:trophies][concept.name] = counts[:current].to_f / counts[:max]
        end
      end
    else
      lines = session[:lines] || 0
      script_levels = script.script_levels
    end

    user_data.merge!(
        linesOfCode: lines,
        linesOfCodeText: t('nav.popup.lines', lines: lines),
    )

    user_data[:levels] = {}
    script_levels.each do |sl|
      completion_status, _ = level_info(user, sl)
      if completion_status != 'not_tried'
        user_data[:levels][sl.level.id] = {
          status: completion_status
          # More info could go in here...
        }
      end
    end

    user_data
  end

end
