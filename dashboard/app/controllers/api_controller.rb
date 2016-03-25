require 'json'

class ApiController < ApplicationController
  layout false
  include LevelsHelper

  def user_menu
    render partial: 'shared/user_header'
  end

  def user_hero
    head :not_found if !current_user
  end

  def section_progress
    load_section
    load_script

    # stage data
    stages = @script.script_levels.group_by(&:stage).map do |stage, levels|
      {length: levels.length,
       title: ActionController::Base.helpers.strip_tags(stage.localized_title)}
    end

    # student level completion data
    students = @section.students.map do |student|
      level_map = student.user_levels_by_level(@script)
      student_levels = @script.script_levels.map do |script_level|
        user_level = level_map[script_level.level_id]
        if user_level.try(:submitted)
          levelClass = "submitted"
        else
          levelClass = activity_css_class(user_level.try(:best_result))
        end
        {class: levelClass, title: script_level.position, url: build_script_level_url(script_level, section_id: @section.id, user_id: student.id)}
      end
      {id: student.id, levels: student_levels}
    end

    data = {
            students: students,
            script: {
                     id: @script.id,
                     name: data_t_suffix('script.name', @script.name, 'title'),
                     levels_count: @script.script_levels.length,
                     stages: stages
                    }
           }

    render json: data
  end

  def student_progress
    load_student
    load_section
    load_script

    data = {
      student: {
        id: @student.id,
        name: @student.name,
      },
      script: {
        id: @script.id,
        name: @script.localized_title
      },
      progressHtml: render_to_string(partial: 'shared/user_stats', locals: { user: @student})
    }

    render json: data
  end

  # Return a JSON summary of the user's progress across all scripts.
  def user_progress_for_all_scripts
    user = current_user
    if user
      render json: summarize_user_progress_for_all_scripts(user)
    else
      render json: {}
    end
  end

  # Return a JSON summary of the user's progress for params[:script_name].
  def user_progress
    if current_user
      script = Script.get_from_cache(params[:script_name])
      render json: summarize_user_progress(script)
    else
      render json: {}
    end
  end

  # Return the JSON details of the users progress on a particular script
  # level and marks the user as having started that level. (Because of the
  # latter side effect, this should only be called when the user sees the level,
  # to avoid spurious activity monitor warnings about the level being started
  # but not completed.)
  def user_progress_for_stage
    response = {}

    script = Script.get_from_cache(params[:script_name])
    stage = script.stages[params[:stage_position].to_i - 1]
    script_level = stage.script_levels[params[:level_position].to_i - 1]
    level = script_level.level

    if current_user
      last_activity = current_user.last_attempt(level)
      level_source = last_activity.try(:level_source).try(:data)

      response[:progress] = current_user.user_progress_by_stage(stage)
      if last_activity
        response[:lastAttempt] = {
          timestamp: last_activity.updated_at.to_datetime.to_milliseconds,
          source: level_source
        }
      end
      response[:disableSocialShare] = current_user.under_13?
      response[:disablePostMilestone] =
        !Gatekeeper.allows('postMilestone', where: {script_name: script.name}, default: true)
    end

    slog(tag: 'activity_start',
         script_level_id: script_level.id,
         level_id: level.id,
         user_agent: request.user_agent,
         locale: locale) if level.finishable?

    render json: response
  end

  def section_text_responses
    load_section
    load_script

    text_response_script_levels = @script.script_levels.includes(:level).where('levels.type' => TextMatch)

    data = @section.students.map do |student|
      student_hash = {id: student.id, name: student.name}

      text_response_script_levels.map do |script_level|
        last_attempt = student.last_attempt(script_level.level)
        response = last_attempt.try(:level_source).try(:data)
        next unless response
        {
          student: student_hash,
          stage: script_level.stage.localized_title,
          puzzle: script_level.position,
          question: script_level.level.properties['title'],
          response: response,
          url: build_script_level_url(script_level, section_id: @section.id, user_id: student.id)
        }
      end.compact
    end.flatten

    render json: data
  end

  def section_assessments
    load_section
    load_script

    level_group_script_levels = @script.script_levels.includes(:level).where('levels.type' => LevelGroup)

    data = @section.students.map do |student|
      student_hash = {id: student.id, name: student.name}

      level_group_script_levels.map do |script_level|
        next unless script_level.long_assessment?

        last_attempt = student.last_attempt(script_level.level)
        response = last_attempt.try(:level_source).try(:data)

        next unless response

        user_level = UserLevel.where(user_id: student.id, level: script_level.level, script: @script).first
        puts user_level.to_json

        # Summarize some key data.
        multi_count = 0
        multi_count_correct = 0

        # And construct a listing of all the individual levels and their results.
        level_results = []

        next unless properties = script_level.level[:properties]

        # Go through each page of the long assessment's LevelGroup.
        properties["pages"].each do |page|
          # Go through each level of the page.
          page["levels"].each do |page_level_name|
            level = Level.find_by_name(page_level_name)

            # And work with the response to the individual level inside the LevelGroup.
            response_parsed = JSON.parse(response)
            level_response = response_parsed.select{|r| r["level_id"] == level.id}

            if level_response
              # For each level inside the LevelGroup, we determine the resut,
              # both content in :student_result and result value in :correct.
              # This array is returned for each LevelGroup, and its order matches
              # that of the LevelGroup as it's declared.
              level_result = {}

              level_class = level.class.to_s.underscore

              if level_class == "text_match"
                student_result = level_response.first["result"]
                level_result[:student_result] = student_result
                level_result[:correct] = 'Free response'
              elsif level_class == "multi"
                # Generate a string like "1" or "0,1" which contains indexes of all
                # the correct answers.  We use variable name _index so that the linter
                # ignores the fact that it's not explicitly used.
                answer_indexes = level["properties"]["answers"].each_with_index.select {|a, _index| a["correct"] == true}.map(&:last).join(",")
                student_result = level_response.first["result"].split(",").sort.join(",")
                multi_count += 1
                level_result[:student_result] = student_result
                if student_result == "-1"
                  level_result[:student_result] = ""
                  level_result[:correct] = 'Unsubmitted'
                elsif student_result == answer_indexes
                  multi_count_correct += 1
                  level_result[:correct] = "Correct"
                else
                  level_result[:correct] = 'Incorrect'

                end
              end

              level_results << level_result
            end
          end
        end

        submitted = user_level.try(:submitted)

        timestamp = user_level[:updated_at].to_formatted_s

        {
          student: student_hash,
          stage: script_level.stage.localized_title,
          puzzle: script_level.position,
          question: script_level.level.properties['title'],
          url: build_script_level_url(script_level, section_id: @section.id, user_id: student.id),
          multi_correct: multi_count_correct,
          multi_count: multi_count,
          submitted: submitted,
          timestamp: timestamp,
          level_results: level_results
        }
      end.compact
    end.flatten

    render json: data
  end

  private

  def load_student
    @student = User.find(params[:student_id])
    authorize! :read, @student
  end

  def load_section
    @section = Section.find(params[:section_id])
    authorize! :read, @section
  end

  def load_script
    @script = Script.find(params[:script_id]) if params[:script_id].present?
    @script ||= @section.script || Script.twenty_hour_script
  end
end
