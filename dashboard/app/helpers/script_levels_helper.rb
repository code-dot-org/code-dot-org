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
    if script.name == Script::HOC_2013_NAME
      CDO.code_org_url '/api/hour/begin_codeorg.png'
    else
      CDO.code_org_url "/api/hour/begin_#{script.name}.png"
    end
  end

  def hoc_finish_url(script)
    if script.name == Script::HOC_2013_NAME
      CDO.code_org_url '/api/hour/finish'
    else
      CDO.code_org_url "/api/hour/finish/#{script.name}"
    end
  end

  def summarize_script_level(sl)
    if sl.level.unplugged?
      kind = 'unplugged'
    elsif sl.assessment
      kind = 'assessment'
    else
      kind = 'blockly'
    end

    summary = {
      id: sl.level.id,
      position: sl.position,
      kind: kind,
      title: sl.level_display_text
    }

    # Add a previous pointer if it's not the obvious (level-1)
    if sl.previous_level
      if sl.previous_level.stage.position != sl.stage.position
        summary[:previous] = [ sl.previous_level.stage.position, sl.previous_level.position ]
      end
    else
      summary[:previous] = false
    end

    # Add a next pointer if it's not the obvious (level+1)
    if sl.end_of_stage?
      if sl.next_level
        summary[:next] = [ sl.next_level.stage.position, sl.next_level.position ]
      else
        # This is the final level in the script
        summary[:next] = false
        if (sl.script.wrapup_video)
          summary[:wrapupVideo] = video_info(sl.script.wrapup_video)
        end
      end
    end

    summary
  end
end
