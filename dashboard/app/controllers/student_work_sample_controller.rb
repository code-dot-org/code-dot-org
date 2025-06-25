class StudentWorkSampleController < ApplicationController
  include LevelsHelper
  authorize_resource class: false

  # POST /student_work_sample/fetch_free_response_answers
  def fetch_free_response_answers
    level_id = student_work_params[:level_id]
    unit_id = student_work_params[:unit_id]
    num_samples = student_work_params[:num_samples].to_i

    return render json: [] if num_samples == 0

    begin
      level = Level.find(level_id)
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: "Level with id #{level_id}"
    end

    return render status: :not_found, json: "Level #{level_id} is not a free response level" unless level.is_a?(FreeResponse)

    begin
      Unit.find(unit_id)
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: "Unit with id #{unit_id}"
    end

    # We want to pull samples from students who have been assigned to work on the level.
    sections = Section.where(script_id: unit_id)
    student_answers = []
    have_enough_samples = false
    sections.shuffle.each do |section|
      student_ids = Follower.where(section: section).pluck(:student_user_id)
      student_ids.each do |student_id|
        unless have_enough_samples
          student_name = User.find(student_id).username
          student_answer = get_free_response_answer(student_id, level_id, unit_id)
          if student_answer
            student_answers << {
              level_id: level_id,
              unit_id: unit_id,
              student_id: student_id,
              student_display_name: student_name,
              student_work: student_answer,
              section_id: section.id
            }.transform_keys {|key| key.to_s.camelize(:lower)}
          end
        end
        have_enough_samples = student_answers.length >= num_samples
      end
    end
    render json: student_answers
  end

  def get_free_response_answer(user_id, level_id, unit_id)
    begin
      user_level = UserLevel.where(user_id: user_id, level_id: level_id, script_id: unit_id).last
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: "No UserLevel found for user #{user_id}, level #{level_id}, unit #{unit_id}"
    end
    user_level&.level_source.try(:data)
  end

  # POST /student_work_sample/fetch_student_code_samples
  def fetch_student_code_samples
    level_id = student_work_params[:level_id]
    unit_id = student_work_params[:unit_id]
    student_ids = student_work_params[:student_ids] || []

    begin
      level = Level.find(level_id)
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: "Level with id #{level_id}"
    end

    return render status: :not_found, json: "Level #{level_id} is not a programming level" unless level.upper_grades_programming_level?

    begin
      Unit.find(unit_id)
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: "Unit with id #{unit_id}"
    end

    code_samples = []
    student_ids.each do |student_id|
      student_code = get_student_code(student_id.to_i, level, unit_id)
      if student_code[:student_code]
        code_samples << {
          level_id: level.id,
          unit_id: unit_id,
          student_id: student_id.to_i,
          project_id: student_code[:project_id],
          student_work: student_code[:student_code]
        }.transform_keys {|key| key.to_s.camelize(:lower)}
      end
    end
    render json: code_samples
  end

  def student_work_params
    params.transform_keys(&:underscore).permit(
      :level_id,
      :unit_id,
      {student_ids: []},
      :num_samples,
    )
  end
end
