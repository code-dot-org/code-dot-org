class StudentWorkSampleController < ApplicationController
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
    num_samples = student_work_params[:num_samples].to_i

    return render json: [] if num_samples == 0

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

    if student_work_params[:include_ai_evaluations]
      fetch_student_code_samples_with_evaluations(level, unit_id, num_samples)
    else
      fetch_student_code_samples_without_evaluations(level, unit_id, num_samples)
    end
  end

  def fetch_student_code_samples_without_evaluations(level, unit_id, num_samples)
    # We want to pull samples from students who have been assigned to work on the level.
    sections = Section.where(script_id: unit_id)
    student_ids = Follower.where(section: sections).pluck(:student_user_id)
    code_samples = []
    have_enough_samples = false
    student_ids.shuffle.each do |student_id|
      unless have_enough_samples
        student_code = get_student_code(student_id, level, unit_id)
        if student_code[:student_code]
          code_samples << {level_id: level.id, unit_id: unit_id, user_id: student_id, project_id: student_code[:project_id], student_code: student_code[:student_code]}
        end
        have_enough_samples = code_samples.length >= num_samples
      end
    end
    render json: code_samples
  end

  def fetch_student_code_samples_with_evaluations(level, unit_id, num_samples)
    evaluations = UserLevelEvaluation.where(level_id: level.id, script_id: unit_id)
    if evaluations.empty?
      return render status: :not_found, json: "There are no evaluations for the level with id #{level.id} in unit with id #{unit_id}"
    end
    code_samples = []
    have_enough_samples = false
    evaluations.shuffle.each do |evaluation|
      unless have_enough_samples
        student_code = get_student_code(evaluation.user_id, level.id, unit_id, evaluation.code_version)
        if student_code[:student_code]
          code_samples << {
            level_id: level.id,
            unit_id: unit_id,
            user_id: evaluation.user_id,
            project_id: student_code[:project_id],
            code_version: student_code[:code_version],
            student_code: student_code[:student_code],
            ai_evaluation: evaluation.ai_evaluation,
            ai_reasoning: evaluation.ai_reasoning,
            evaluation_criteria: evaluation.evaluation_criteria
          }
        end
        have_enough_samples = code_samples.length >= num_samples
      end
    end
    render json: code_samples
  end

  def get_student_code(user_id, level, unit_id, code_version = nil)
    s3 = Aws::S3::Client.new
    bucket = CDO.sources_s3_bucket
    base_dir = CDO.sources_s3_directory

    storage_id = storage_id_for_user_id(user_id)
    # For project-template-backed levels, we need to use the channel_token for the associated project template level.
    level_id_for_channel_token = level.project_template_level ? level.project_template_level.id : level.id
    channel_token = ChannelToken.where(storage_id: storage_id, level_id: level_id_for_channel_token, script_id: unit_id).last
    user_level = UserLevel.where(user_id: user_id, level_id: level.id, script_id: unit_id).last
    if user_level && channel_token
      storage_app_id = channel_token.storage_app_id
      channel_id = storage_encrypt_channel_id(storage_id, storage_app_id)
      s3_filename = "#{base_dir}/#{storage_id}/#{storage_app_id}/main.json"
      s3_args = {bucket: bucket, key: s3_filename}
      s3_args[:version_id] = code_version if code_version
      body = s3.get_object(s3_args)[:body].read
      student_code = JSON.parse(body)['source'] if body
    end
    {
      project_id: channel_id,
      code_version: code_version,
      student_code: student_code,
    }
  end

  def student_work_params
    params.transform_keys(&:underscore).permit(
      :level_id,
      :unit_id,
      :num_samples,
      :include_ai_evaluations,
    )
  end
end
