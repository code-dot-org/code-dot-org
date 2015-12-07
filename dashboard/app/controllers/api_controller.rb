class ApiController < ApplicationController
  layout false
  include LevelsHelper

  def user_menu
    render partial: 'shared/user_header'
  end

  def user_hero
    head :not_found if not current_user
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
        {class: activity_css_class(user_level.try(:best_result)), title: script_level.position, url: build_script_level_url(script_level, section_id: @section.id, user_id: student.id)}
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

  def user_progress
    if current_user
      script = Script.get_from_cache(params[:script_name])
      render json: summarize_user_progress(script)
    else
      render json: {}
    end
  end

  def user_progress_for_stage
    response = {}

    if current_user
      script = Script.get_from_cache(params[:script_name])
      stage = script.stages[params[:stage_position].to_i - 1]
      level = stage.script_levels[params[:level_position].to_i - 1].level

      last_activity = current_user.last_attempt(level)
      level_source = last_activity.try(:level_source).try(:data)

      response[:progress] = current_user.user_progress_by_stage(stage)
      if last_activity
        response[:lastAttempt] = {
          timestamp: last_activity.updated_at.to_datetime.to_milliseconds,
          source: level_source
        }
        response[:disableSocialShare] = current_user && current_user.under_13?
      end
    end
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
