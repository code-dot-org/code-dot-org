module UsersHelper
  include ApplicationHelper

  # Summarize a user and his or progress progress within a certain script.
  # Example return value:
  # { "linesOfCode": 34, "linesOfCodeText": "Total lines of code: 34", "disableSocialShare": true,
  #   "levels": { "135": { "status": "perfect", "result": 100 } } }
  def summarize_user_progress(script, user = current_user, exclude_level_progress = false)
    result = {}
    merge_user_summary(result, user)
    merge_script_progress(result, user, script)
    result
  end

  # Summarize a user and his or her progress across all scripts.
  # Example return value:
  # {
  #     "lines": 34, "linesOfCodeText": "Total lines of code: 34", "disableSocialShare": true,
  #     "scripts": {
  #         "49": {
  #             "name": "course2",
  #             "levels": { "135": {"status": "perfect", "result": 100 } } },
  #         "46": {
  #             "name": "artist",
  #             "levels": {
  #                "1138": { "status": "attempted", "result": 5},
  #                "1147": { "status": "perfect", "result": 30 } } } } }
  def summarize_user_progress_for_all_scripts(user)
    result = {}
    merge_user_summary(result, user)
    result[:scripts] = {}
    merge_scripts_progress(result[:scripts], user)
    result
  end

  # Merge the user summary into the specified result hash.
  private def merge_user_summary(result, user)
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

  # Merge the progress for all scripts into the specified result hash.
  private def merge_scripts_progress(result, user)
    UserLevel.where(user_id: user.id).each do |ul|
      script_id = ul.script_id
      script = Script.get_from_cache(script_id)
      result[script_id] ||= {name: script.name}
      merge_script_progress(result[script_id], user, script)
    end
    result
  end

  # Merge the progress for the specified script by user into the user_data result hash.
  private def merge_script_progress(user_data, user, script, exclude_level_progress = false)
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
