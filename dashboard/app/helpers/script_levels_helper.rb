module ScriptLevelsHelper
  # The TA scores alert will be shown at most once for each lesson. This
  # is the maximum number of times it will be shown across all lessons.
  MAX_SHOW_TA_SCORES_ALERT = 3

  def script_level_solved_response(response, script_level, unit_group_unit: nil)
    next_user_redirect = script_level.next_level_or_redirect_path_for_user(current_user, @lesson, unit_group_unit: unit_group_unit)

    if script_level.has_another_level_to_go_to?
      if script_level == script_level.lesson.last_progression_script_level
        response[:lesson_changing] = {previous: {name: script_level.name, position: script_level.lesson.absolute_position}}

        # End-of-Lesson Experience is only enabled for:
        # scripts with the lesson_extras_available property
        # lessons except for the last lesson of a script
        # users in or teaching sections with an enabled "lesson extras" flag
        enabled_for_lesson = script_level.script.lesson_extras_available &&
          !script_level.end_of_script?
        enabled_for_user = current_user&.section_for_script(script_level.script) &&
          current_user.section_for_script(script_level.script).lesson_extras
        enabled_for_teacher = current_user.try(:teacher?) &&
          current_user.sections_instructed.where(
            script_id: script_level.script_id,
            lesson_extras: true
          ).any?
        if enabled_for_lesson && (enabled_for_user || enabled_for_teacher)
          lesson_position = (@lesson || script_level.lesson).absolute_position
          redirect_path = script_lesson_extras_path(
            script_id: script_level.script.name,
            lesson_position: lesson_position,
          )
          if Policies::Courses.modularity_enabled? && unit_group_unit
            redirect_path = course_unit_lesson_extras_path(unit_group_unit.unit_group, unit_group_unit.position, lesson_position: lesson_position)
          end
          response[:redirect] = redirect_path
        end
      end
    else
      if script_level.script.wrapup_video
        response[:video_info] = wrapup_video_then_redirect_response(
          script_level.script.wrapup_video,
          next_user_redirect
        )
        return
      end
    end
    response[:redirect] ||= next_user_redirect
  end

  def wrapup_video_then_redirect_response(wrapup_video, redirect)
    video_info_response = wrapup_video.summarize
    video_info_response[:redirect] = redirect
    video_info_response
  end

  def script_completion_redirect(user, script, unit_group_unit: nil)
    if Policies::ScriptActivity.can_view_congrats_page?(user, script)
      script.finish_url(unit_group_unit: unit_group_unit)
    else
      if Policies::Courses.modularity_enabled? && unit_group_unit
        course_unit_path(unit_group_unit.unit_group, unit_group_unit.position)
      else
        script_path(script)
      end
    end
  end

  def tracking_pixel_url(script)
    if script.name == Unit::HOC_2013_NAME
      CDO.code_org_url '/api/hour/begin_codeorg.png'
    else
      CDO.code_org_url "/api/hour/begin_#{script.name}.png"
    end
  end

  def can_show_ta_scores_alert?(lesson)
    puts "checking can show ta scores alert for lesson #{lesson.id}"
    puts "learning goal: #{LearningGoalTeacherEvaluation.where(teacher_id: current_user.id)}"
    puts "goal exists: #{LearningGoalTeacherEvaluation.where(teacher_id: current_user.id).where.not(understanding: nil).exists?}"
    return false if LearningGoalTeacherEvaluation.where(teacher_id: current_user.id).where.not(understanding: nil).exists?
    seen_ta_scores_map = current_user&.seen_ta_scores_map || {}
    return false if seen_ta_scores_map.keys.length >= MAX_SHOW_TA_SCORES_ALERT
    !seen_ta_scores_map[lesson.id.to_s]
  end
end
