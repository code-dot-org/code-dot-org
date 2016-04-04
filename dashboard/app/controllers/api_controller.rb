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
          level_class = "submitted"
        else
          level_class = activity_css_class(user_level.try(:best_result))
        end
        {class: level_class, title: script_level.position, url: build_script_level_url(script_level, section_id: @section.id, user_id: student.id)}
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

  # For each student, return an array of each long-assessment LevelGroup in progress or submitted.
  # Each such array contains an array of individual level results, matching the order of the LevelGroup's
  # levels.  For each level, the student's answer content is in :student_result, and its correctness
  # is in :correct.
  def section_assessments
    load_section
    load_script

    level_group_script_levels = @script.script_levels.includes(:level).where("levels.type" => LevelGroup)

    data = @section.students.map do |student|
      student_hash = {id: student.id, name: student.name}

      level_group_script_levels.map do |script_level|
        next unless script_level.long_assessment?

        last_attempt = student.last_attempt(script_level.level)
        response = last_attempt.try(:level_source).try(:data)

        next unless response

        response_parsed = JSON.parse(response)

        user_level = student.user_level_for(script_level)

        # Summarize some key data.
        multi_count = 0
        multi_count_correct = 0

        # And construct a listing of all the individual levels and their results.
        level_results = []

        script_level.level.levels.each do |level|
          level_response = response_parsed.find{|r| r["level_id"] == level.id}

          if level_response
            level_result = {}

            case level
            when TextMatch
              student_result = level_response["result"]
              level_result[:student_result] = student_result
              level_result[:correct] = "free_response"
            when Multi
              answer_indexes = Multi.find_by_id(level.id).correct_answer_indexes
              student_result = level_response["result"].split(",").sort.join(",")
              multi_count += 1
              level_result[:student_result] = student_result
              if student_result == "-1"
                level_result[:student_result] = ""
                level_result[:correct] = "unsubmitted"
              elsif student_result == answer_indexes
                multi_count_correct += 1
                level_result[:correct] = "correct"
              else
                level_result[:correct] = "incorrect"
              end
            end

            level_results << level_result
          end
        end

        submitted = user_level.try(:submitted)

        timestamp = user_level[:updated_at].to_formatted_s

        {
          student: student_hash,
          stage: script_level.stage.localized_title,
          puzzle: script_level.position,
          question: script_level.level.properties["title"],
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
