module UsersHelper
  include ApplicationHelper

  # Summarize a user and his or progress progress within a certain script.
  # Example return value:
  # { "linesOfCode": 34, "linesOfCodeText": "Total lines of code: 34", "disableSocialShare": true,
  #   "levels": {"135": {"status": "perfect", "result": 100}}}
  def summarize_user_progress(script, user = current_user, exclude_level_progress = false)
    user_data = {}
    merge_user_summary(user_data, user)
    merge_script_progress(user_data, user, script, exclude_level_progress)
    user_data
  end

  # Summarize a user and his or her progress across all scripts.
  # Example return value:
  # {
  #     "lines": 34, "linesOfCodeText": "Total lines of code: 34", "disableSocialShare": true,
  #     "scripts": {
  #         "course2": {
  #             "levels": {"135": {"status": "perfect", "result": 100}}},
  #         "artist": {
  #             "levels": {
  #                "1138": {"status": "attempted", "result": 5},
  #                "1147": {"status": "perfect", "result": 30}}}}}
  def summarize_user_progress_for_all_scripts(user)
    user_data = {}
    merge_user_summary(user_data, user)
    user_data[:scripts] = {}
    merge_scripts_progress(user_data[:scripts], user)
    user_data
  end

  # Merge the user summary into the specified result hash.
  private def merge_user_summary(user_data, user)
    if user
      user_data[:disableSocialShare] = true if user.under_13?
      user_data[:isTeacher] = true if user.teacher?
      user_data[:linesOfCode] = user.total_lines
    else
      user_data[:linesOfCode] = client_state.lines
    end
    user_data[:linesOfCodeText] = I18n.t('nav.popup.lines', lines: user_data[:linesOfCode])
    user_data
  end

  # Merge the progress for all scripts into the specified result hash.
  private def merge_scripts_progress(user_data, user)
    UserLevel.where(user_id: user.id).each do |ul|
      script_id = ul.script_id
      script = Script.get_from_cache(script_id)
      script_progress = (user_data[script.name] ||= {})
      merge_script_progress(script_progress, user, script)
    end
    user_data
  end

  # Merge the progress for the specified script and user into the user_data result hash.
  private def merge_script_progress(user_data, user, script, exclude_level_progress = false)
    return user_data unless user

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

    unless exclude_level_progress
      uls = user.user_levels_by_level(script)
      script_levels = script.script_levels
      user_data[:levels] = {}
      script_levels.each do |sl|
        result = level_info(user, sl, uls)
        submitted = level_submitted(user, sl, uls)
        completion_status = submitted ? "submitted" : (activity_css_class result)
        if completion_status != 'not_tried'
          user_data[:levels][sl.level_id] = {
              status: completion_status,
              result: result,
              submitted: submitted
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
      completed = levels.count{|l| sum = summary[:levels][l.id]; sum && %w(perfect passed).include?(sum[:status])}
      completed.to_f / levels.count
    end
  end

  def percent_complete_total(script, user = current_user)
    summary = summarize_user_progress(script, user)
    levels = script.script_levels.map(&:level)
    completed = levels.count{|l| sum = summary[:levels][l.id]; sum && %w(perfect passed).include?(sum[:status])}
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

  def level_submitted(user, script_level, user_levels)
    if user
      user_levels[script_level.level_id].try(:submitted) || false
    else
      false
    end
  end

end
