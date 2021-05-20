class LessonsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode_or_test_env, except: [:show, :student_lesson_plan]
  before_action :disallow_legacy_script_levels, only: [:edit, :update]

  include LevelsHelper

  # Script levels which are not in activity sections will not show up on the
  # lesson edit page, in which case saving the edit page would cause those
  # script levels to be lost. Prevent this by disallowing editing in this case.
  # This helps avoid losing data from existing scripts by accidentally editing
  # them with the new lessons editor.
  def disallow_legacy_script_levels
    return unless @lesson.script_levels.reject(&:activity_section).any?
    return render :forbidden
  end

  # GET /s/script-name/lessons/1
  def show
    script = Script.get_from_cache(params[:script_id])
    return render :forbidden unless script.is_migrated

    @lesson = script.lessons.find do |l|
      l.has_lesson_plan && l.relative_position == params[:position].to_i
    end
    raise ActiveRecord::RecordNotFound unless @lesson
    return render :forbidden unless can?(:read, @lesson)

    @lesson_data = @lesson.summarize_for_lesson_show(@current_user, can_view_teacher_markdown?)
  end

  # GET /s/script-name/lessons/1/student
  def student_lesson_plan
    script = Script.get_from_cache(params[:script_id])
    return render :forbidden unless script.is_migrated && script.include_student_lesson_plans

    @lesson = script.lessons.find do |l|
      l.has_lesson_plan && l.relative_position == params[:lesson_position].to_i
    end
    raise ActiveRecord::RecordNotFound unless @lesson
    return render :forbidden unless can?(:read, @lesson)

    @lesson_data = @lesson.summarize_for_student_lesson_plan
  end

  # GET /lessons/1/edit
  def edit
    @lesson_data = @lesson.summarize_for_lesson_edit
    # Return an empty list, because computing the list of related lessons here
    # sometimes hits a bug and causes the lesson edit page to fail to load.
    @related_lessons = []
    @search_options = Level.search_options
    view_options(full_width: true)
  end

  # PATCH/PUT /lessons/1
  def update
    if params[:originalLessonData]
      current_lesson_data = @lesson.summarize_for_lesson_edit
      old_lesson_data = JSON.parse(params[:originalLessonData])
      current_lesson_data[:vocabularies]&.map! {|v| v[:id]}
      old_lesson_data['vocabularies']&.map! {|v| v['id']}
      current_lesson_data[:resources]&.map! {|v| v[:id]}
      old_lesson_data['resources']&.map! {|v| v['id']}
      if old_lesson_data.to_json != current_lesson_data.to_json
        # Log error details to firehose instead of honeybadger to minimize the
        # chances of the data being truncated.
        FirehoseClient.instance.put_record(
          :analysis,
          {
            study: 'lesson-update',
            event: "server-data-mismatch",
            data_string: request.path,
            data_json: {
              old_lesson_data: old_lesson_data,
              current_lesson_data: current_lesson_data
            }.to_json
          }
        )
        msg = "Could not update the lesson because the contents of the lesson has changed outside of this editor. Reload the page and try saving again."
        raise msg
      end
    end

    resources = []
    vocabularies = []
    course_version = @lesson.script.get_course_version
    if course_version
      resources = (lesson_params['resources'] || []).map {|key| Resource.find_by(course_version_id: course_version.id, key: key)}
      vocabularies = (lesson_params['vocabularies'] || []).map {|key| Vocabulary.find_by(course_version_id: course_version.id, key: key)}
    end

    standards = fetch_standards(lesson_params['standards'] || [])
    opportunity_standards = fetch_standards(lesson_params['opportunity_standards'] || [])
    programming_expressions = fetch_programming_expressions(lesson_params['programming_expressions'] || [])
    ActiveRecord::Base.transaction do
      @lesson.resources = resources.compact
      @lesson.vocabularies = vocabularies.compact
      @lesson.standards = standards.compact
      @lesson.opportunity_standards = opportunity_standards.compact
      @lesson.programming_expressions = programming_expressions.compact
      @lesson.update!(lesson_params.except(:resources, :vocabularies, :objectives, :standards, :opportunity_standards, :programming_expressions, :original_lesson_data))
      @lesson.update_activities(JSON.parse(params[:activities])) if params[:activities]
      @lesson.update_objectives(JSON.parse(params[:objectives])) if params[:objectives]

      if @lesson.lockable
        msg = "The last level in a lockable lesson must be a LevelGroup and an assessment."
        raise msg unless @lesson.script_levels.last.assessment && @lesson.script_levels.last.level.type == 'LevelGroup'
      end

      @lesson.script.prevent_duplicate_levels
      @lesson.script.fix_lesson_positions
    end

    if Rails.application.config.levelbuilder_mode
      @lesson.script.reload

      # This endpoint will only be hit from the lesson edit page, which is only
      # available to lessons in migrated scripts, which only need to be
      # serialized using the new json format.
      @lesson.script.write_script_json

      Script.merge_and_write_i18n(@lesson.i18n_hash, @lesson.script.name)
    end

    render json: @lesson.summarize_for_lesson_edit
  rescue ActiveRecord::RecordNotFound, ActiveRecord::RecordInvalid => e
    render(status: :not_acceptable, plain: e.message)
  end

  def clone
    destination_script = Script.find_by_name(params[:destinationUnitName])
    raise "Cannot find script #{params[:destinationUnitName]}" unless destination_script
    raise 'Destination script must have the same version year as the lesson' unless destination_script.get_course_version.version_year == @lesson.script.get_course_version.version_year
    copied_lesson = Lesson.copy_to_script(@lesson, destination_script)
    render(status: 200, json: {editLessonUrl: edit_lesson_path(id: copied_lesson.id), editScriptUrl: edit_script_path(copied_lesson.script)})
  rescue => err
    render(json: {error: err.message}.to_json, status: :not_acceptable)
  end

  private

  def lesson_params
    # Convert camelCase params to snake_case. Right now this only works on
    # top-level key names. This lets us do the transformation before calling
    # .permit, so that we can use snake_case key names in our parameter list,
    # because transform_keys returns a params object while deep_transform_keys
    # returns a plain Hash.
    lp = params.transform_keys(&:underscore)

    # for now, only allow editing of fields that cannot be edited on the
    # script edit page.
    lp = lp.permit(
      :name,
      :overview,
      :student_overview,
      :assessment_opportunities,
      :assessment,
      :unplugged,
      :creative_commons_license,
      :lockable,
      :has_lesson_plan,
      :purpose,
      :preparation,
      :announcements,
      :resources,
      :vocabularies,
      :programming_expressions,
      :objectives,
      :standards,
      :opportunity_standards
    )
    lp[:announcements] = JSON.parse(lp[:announcements]) if lp[:announcements]
    lp[:resources] = JSON.parse(lp[:resources]) if lp[:resources]
    lp[:vocabularies] = JSON.parse(lp[:vocabularies]) if lp[:vocabularies]
    lp[:programming_expressions] = JSON.parse(lp[:programming_expressions]) if lp[:programming_expressions]
    lp[:standards] = JSON.parse(lp[:standards]) if lp[:standards]
    lp[:opportunity_standards] = JSON.parse(lp[:opportunity_standards]) if lp[:opportunity_standards]
    lp
  end

  def fetch_standards(standards_data)
    standards_data.map do |s|
      framework = Framework.find_by!(shortcode: s['frameworkShortcode'])
      Standard.find_by!(framework: framework, shortcode: s['shortcode'])
    end
  end

  def fetch_programming_expressions(expressions_data)
    expressions_data.map do |e|
      environment = ProgrammingEnvironment.find_by!(name: e['programmingEnvironmentName'])
      ProgrammingExpression.find_by!(programming_environment: environment, key: e['key'])
    end
  end
end
