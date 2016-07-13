class ApiController < ApplicationController
  layout false
  include LevelsHelper

  def user_menu
    @show_pairing_dialog = !!session.delete(:show_pairing_dialog)
    render partial: 'shared/user_header'
  end

  def user_hero
    head :not_found unless current_user
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
        user_levels = script_level.level_ids.map{|id| level_map[id]}.compact
        level_class = best_activity_css_class user_levels
        paired = user_levels.any?(&:paired?)
        level_class << ' paired' if paired
        title = paired ? '' : script_level.position
        {class: level_class, title: title, url: build_script_level_url(script_level, section_id: @section.id, user_id: student.id)}
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

    progress_html = render_to_string(partial: 'shared/user_stats', locals: {user: @student})

    data = {
      student: {
        id: @student.id,
        name: @student.name,
      },
      script: {
        id: @script.id,
        name: @script.localized_title
      },
      progressHtml: progress_html
    }

    render json: data
  end

  def script_structure
    script = Script.get_from_cache(params[:script_name])
    render json: script.summarize
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
      user = params[:user_id] ? User.find(params[:user_id]) : current_user
      render json: summarize_user_progress(script, user)
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
    level = params[:level] ? Script.cache_find_level(params[:level].to_i) : script_level.oldest_active_level

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

      recent_driver = UserLevel.most_recent_driver(script, level, current_user)
      if recent_driver
        response[:pairingDriver] = recent_driver
      end
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

    text_response_script_levels = @script.script_levels.includes(:levels).where('levels.type' => [TextMatch, FreeResponse])

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

    level_group_script_levels = @script.script_levels.includes(:levels).where('levels.type' => LevelGroup)

    data = @section.students.map do |student|
      student_hash = {id: student.id, name: student.name}

      level_group_script_levels.map do |script_level|
        next unless script_level.long_assessment?

        # Don't allow somebody to peek inside an anonymous survey using this API.
        next if script_level.anonymous?

        last_attempt = student.last_attempt(script_level.level)
        response = last_attempt.try(:level_source).try(:data)

        next unless response

        response_parsed = JSON.parse(response)

        user_level = student.user_level_for(script_level, script_level.level)

        # Summarize some key data.
        multi_count = 0
        multi_count_correct = 0

        # And construct a listing of all the individual levels and their results.
        level_results = []

        script_level.level.levels.each do |level|
          if level.is_a? Multi
            multi_count += 1
          end

          level_response = response_parsed[level.id.to_s]

          level_result = {}

          if level_response
            case level
            when TextMatch, FreeResponse
              student_result = level_response["result"]
              level_result[:student_result] = student_result
              level_result[:correct] = "free_response"
            when Multi
              answer_indexes = Multi.find_by_id(level.id).correct_answer_indexes
              student_result = level_response["result"].split(",").sort.join(",")

              # Convert "0,1,3" to "A, B, D" for teacher-friendly viewing
              level_result[:student_result] = student_result.split(',').map{ |k| Multi.value_to_letter(k.to_i) }.join(', ')

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
          else
            level_result[:correct] = "unsubmitted"
          end

          level_results << level_result
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

  # If at least five students have completed a given long-assessment LevelGroup that is marked anonymous,
  # then for each multi return a summary of the percentage of each answer, and also return all free
  # response texts but in a randomized order.
  # In theory this could be a unique codepath inside the section_assessments function, but given the
  # serious risk of exposing student information in a non-anonymous fashion, this function has been
  # built separately.
  def section_surveys
    load_section
    load_script

    level_group_script_levels = @script.script_levels.includes(:levels).where('levels.type' => LevelGroup)

    # Go through each anonymous long-assessment LevelGroup.
    data = level_group_script_levels.map do |script_level|
      next unless script_level.long_assessment?
      next unless script_level.anonymous?

      levelgroup_results = {}

      student_count = 0

      # Go through each student who has submitted a response to it.
      @section.students.each do |student|
        # Skip student if they haven't submitted for this LevelGroup.
        user_level = student.user_level_for(script_level, script_level.level)
        next unless user_level.try(:submitted)

        last_attempt = student.last_attempt(script_level.level)
        response = last_attempt.try(:level_source).try(:data)
        next unless response

        response_parsed = JSON.parse(response)

        student_count += 1

        # Go through each sublevel
        script_level.level.levels.each_with_index do |sublevel, sublevel_index|
          # If it's the first time we're saving a result for this sublevel, then
          # create the full entry.
          unless levelgroup_results[sublevel_index]
            question_text = sublevel.properties.try(:[], "questions").try(:[], 0).try(:[], "text") ||
                            sublevel.properties.try(:[], "markdown_instructions")
            levelgroup_results[sublevel_index] = {question: question_text, results: []}
          end

          sublevel_response = response_parsed[sublevel.id.to_s]

          sublevel_result = {}

          if sublevel_response
            case sublevel
            when TextMatch, FreeResponse
              student_result = sublevel_response["result"]
              sublevel_result[:result] = student_result
              sublevel_result[:type] = "free_response"
            when Multi
              student_result = sublevel_response["result"].split(",").sort.join(",")
              # unless unsubmitted
              unless student_result == "-1"
                answer_text = sublevel.properties.try(:[], "answers").try(:[], student_result.to_i).try(:[], "text")
                sublevel_result[:result_text] = answer_text
                # Convert "0,1,3" to "A, B, D" for teacher-friendly viewing
                sublevel_result[:result] = student_result.split(',').map{ |k| Multi.value_to_letter(k.to_i) }.join(', ')
                sublevel_result[:type] = "multi"
              end
            end
          end

          levelgroup_results[sublevel_index][:results] << sublevel_result
        end
      end

      # Shuffle all the results.
      levelgroup_results.each do |_, levelgroup_result|
        levelgroup_result[:results].shuffle!
      end

      if student_count < 5
        nil
      else
        # All the results for one LevelGroup for a group of students.
        {
          stage: script_level.stage.localized_title,
          puzzle: script_level.position,
          url: build_script_level_url(script_level, section_id: @section.id),
          levelgroup_results: levelgroup_results
        }
      end
    end.compact

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
