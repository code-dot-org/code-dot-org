module UsersHelper
  include ApplicationHelper

  # Summarize a user and his or progress progress within a certain script.
  def summarize_user_progress(script, user = current_user, exclude_level_progress = false)
    user_summary(user).merge(script_progress(user, script, exclude_level_progress))
  end

  # Summarize a user and his or her progress across all scripts.
  def summarize_user_progress_for_all_scripts(user)
    user_summary(user).merge(scripts: scripts_progress(user))
  end

  private def scripts_progress(user)
    progress_entries = UserLevel.where(user_id: user.id).map do |ul|
      script_id = ul.script_id
      script = Script.get_from_cache(script_id)
      progress = script_progress(user, script)
      [script_id, { name: script.name, progress: progress }]
    end
    Hash[progress_entries]
  end

  private def user_summary(user)
    result = {}
    if user
      result[:disableSocialShare] = true if user.under_13?
      result[:isTeacher] = true if user.teacher?
      result[:linesOfCode] = user.total_lines
    else
      result[:linesOfCode] = client_state.lines
    end
    result[:linesOfCodeText] = I18n.t('nav.popup.lines', lines: result[:linesOfCode])
    result
  end

  private def script_progress(user, script, exclude_level_progress = false)
    user_data = {}
    if user
      # Populate trophies data if the script has trophies.
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
    end

    unless exclude_level_progress
      uls = user.user_levels_by_level(script)
      script_levels = script.script_levels
      user_data[:levels] = {}
      script_levels.each do |sl|
        result = level_info(user, sl, uls)
        completion_status = activity_css_class result
        if completion_status != 'not_tried'
          user_data[:levels][sl.level_id] = {
              status: completion_status,
              result: result
          }
        end
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

  private

  def level_info(user, script_level, user_levels)
    if user
      user_levels[script_level.level_id].try(:best_result) || 0
    else
      0
    end
  end
end
