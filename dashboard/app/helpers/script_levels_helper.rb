module ScriptLevelsHelper
  def script_level_solved_response(response, script_level)
    next_user_redirect = script_level.next_level_or_redirect_path_for_user current_user

    if script_level.has_another_level_to_go_to?
      if script_level.end_of_stage?
        response[:stage_changing] = {previous: {name: script_level.name, position: script_level.stage.position}}

        # End-of-Stage Experience is only enabled for:
        # stages except for the last stage of a script
        # users in sections with an enabled "stage extras" flag
        enabled_for_stage = !script_level.end_of_script?
        enabled_for_user = current_user && current_user.section_for_script(script_level.script) &&
            current_user.section_for_script(script_level.script).stage_extras
        response[:end_of_stage_experience] = enabled_for_stage && enabled_for_user
      end
    else
      response[:message] = 'no more levels' # used by blockly to show a different feedback message on the last level

      if script_level.script.wrapup_video
        response[:video_info] = wrapup_video_then_redirect_response(
            script_level.script.wrapup_video, next_user_redirect)
        return
      end
    end

    response[:redirect] = next_user_redirect
  end

  def wrapup_video_then_redirect_response(wrapup_video, redirect)
    video_info_response = wrapup_video.summarize
    video_info_response[:redirect] = redirect
    video_info_response
  end

  def script_completion_redirect(script)
    if script.hoc?
      script.hoc_finish_url
    elsif script.csf?
      script.csf_finish_url
    else
      root_path
    end
  end

  def twenty_hour_next_url
    script_level_path(:show, twenty_hour_path_params)
  end

  def twenty_hour_path_params
    {script_id: Script.twenty_hour_script.id, chapter: 'next'}
  end

  def tracking_pixel_url(script)
    if script.name == Script::HOC_2013_NAME
      CDO.code_org_url '/api/hour/begin_codeorg.png'
    else
      CDO.code_org_url "/api/hour/begin_#{script.name}.png"
    end
  end

  def section_options
    current_user.sections.map do |section|
      content_tag 'option', section.name, value: url_for(params.merge(section_id: section.id, user_id: nil))
    end.join(" ").html_safe
  end
end
