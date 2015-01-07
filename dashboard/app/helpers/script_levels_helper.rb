module ScriptLevelsHelper
  def script_level_solved_response(response, script_level)
    next_user_redirect = next_progression_level_or_redirect_path(script_level)

    if has_another_level_to_go_to(script_level)
      if script_level.end_of_stage?
        response[:stage_changing] = {previous: {name: script_level.name}}
      end
    else
      response[:message] = 'no more levels'

      if script_level.script.wrapup_video
        response[:video_info] = wrapup_video_then_redirect_response(
            script_level.script.wrapup_video, next_user_redirect)
        return
      end
    end

    response[:redirect] = next_user_redirect
  end

  def has_another_level_to_go_to(script_level)
    script_level.next_progression_level
  end

  def next_progression_level_or_redirect_path(script_level)
    next_level =
      if script_level.level.unplugged? ||
          (script_level.stage && script_level.stage.unplugged?)
        # if we're coming from an unplugged level, it's ok to continue
        # to unplugged level (example: if you start a sequence of
        # assessments associated with an unplugged level you should
        # continue on that sequence instead of skipping to next stage)
        script_level.next_level
      else
        script_level.next_progression_level
      end

    next_level ?
        build_script_level_path(next_level) :
        script_completion_redirect(script_level.script)
  end

  def wrapup_video_then_redirect_response(wrapup_video, redirect)
    video_info_response = video_info(wrapup_video)
    video_info_response[:redirect] = redirect
    video_info_response
  end

  def script_completion_redirect(script)
    if script.hoc?
      hoc_finish_url(script)
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
    if script.id == Script::HOC_ID || script.name == Script::SPECIAL_NAME
      CDO.code_org_url "/api/hour/begin_codeorg.png"
    else
      CDO.code_org_url "/api/hour/begin_#{script.name}.png"
    end
  end

  def hoc_finish_url(script)
    if script.id == Script::HOC_ID || script.name == Script::SPECIAL_NAME
      CDO.code_org_url "/api/hour/finish"
    else
      CDO.code_org_url "/api/hour/finish/#{script.name}"
    end
  end
end
