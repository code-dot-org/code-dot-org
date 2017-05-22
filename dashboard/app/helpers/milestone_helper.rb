module MilestoneHelper
  include ScriptLevelsHelper
  include LevelsHelper

  def milestone_response(options)
    response = {
      timestamp: DateTime.now.to_milliseconds
    }
    script_level = options[:script_level]
    level = options[:level]

    if script_level
      response[:script_id] = script_level.script.id
      response[:level_id] = level.id

      previous_level = script_level.previous_level
      if previous_level
        response[:previous_level] = build_script_level_path(previous_level)
      end

      # if they solved it, figure out next level
      if options[:solved?]
        response[:total_lines] = options[:total_lines]
        response[:new_level_completed] = options[:new_level_completed]
        response[:level_path] = build_script_level_path(script_level)
        script_level_solved_response(response, script_level)
      else # not solved
        response[:message] = 'try again'
      end
    else
      response[:message] = 'no script provided'
    end

    if options[:level_source].try(:id)
      response[:level_source] = level_source_url(id: options[:level_source].id)
      response[:phone_share_url] = send_to_phone_url
      response[:level_source_id] = options[:level_source].id
    end

    if options[:share_failure]
      response[:share_failure] = response_for_share_failure(options[:share_failure])
    end

    if HintViewRequest.enabled?
      if script_level && current_user
        response[:hint_view_requests] = HintViewRequest.milestone_response(script_level.script, level, current_user)
        response[:hint_view_request_url] = hint_view_requests_path
      end
    end

    if PuzzleRating.enabled?
      response[:puzzle_ratings_enabled] = script_level && PuzzleRating.can_rate?(script_level.script, level, current_user)
    end

    # logged in users can:
    if current_user
      # save solved levels to a gallery (subject to
      # additional logic in the blockly code because blockly owns
      # which levels are worth saving)
      if options[:level_source].try(:id) &&
        options[:solved?] &&
        options[:activity] &&
        options[:level_source_image]
        response[:save_to_gallery_url] = gallery_activities_path(
          gallery_activity: {
            level_source_id: options[:level_source].try(:id),
            user_level_id: options[:user_level] && options[:user_level].id
          }
        )
      end

      if options[:get_hint_usage]
        response[:hints_used] =
          HintViewRequest.hints_used(current_user.id, script_level.script.id, level.id).count +
            AuthoredHintViewRequest.hints_used(current_user.id, script_level.script.id, level.id).count
      end
    end

    response[:activity_id] = options[:activity] && options[:activity].id

    response
  end

end
