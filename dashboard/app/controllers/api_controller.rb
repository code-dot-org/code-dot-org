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

  def section_text_responses
    load_section
    load_script

    data =  [
      {
        student: {
          id: 1,
          name: 'Student 1'
        },
        stage: 1,
        puzzle: 5,
        question: 'This is the question',
        response: 'This is the response',
      },
      {
        student: {
          id: 2,
          name: 'Student 2'
        },
        stage: 2,
        puzzle: 5,
        question: 'This is the question',
        response: 'This is the response'
      },
      {
        student: {
          id: 2,
          name: 'Student 2'
        },
        stage: 1,
        puzzle: 6,
        question: 'Another uestion',
        response: 'This is the response'
      }
    ]

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
