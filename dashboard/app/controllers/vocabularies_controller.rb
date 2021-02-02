class VocabulariesController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env, except: [:show]

  # GET /vocabularysearch
  def search
    render json: VocabularyAutocomplete.get_search_matches(params[:query], params[:limit], params[:courseVersionId])
  end

  # POST /vocabularies
  def create
    course_version = CourseVersion.find_by_id(vocabulary_params[:course_version_id])
    unless course_version
      render status: 400, json: {error: "course version not found"}
      return
    end
    vocabulary = Vocabulary.new(
      word: vocabulary_params[:word],
      definition: vocabulary_params[:definition]
    )
    vocabulary.course_version = course_version
    begin
      vocabulary.save!
      render json: vocabulary.summarize_for_lesson_edit
    rescue ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid => e
      render status: 400, json: {error: e.message.to_json}
    end
  end

  # PUT/PATCH /vocabularies
  def update
    vocabulary = Vocabulary.find_by_id(vocabulary_params[:id])
    if vocabulary && vocabulary.update!(vocabulary_params)
      render json: vocabulary.summarize_for_lesson_edit
    else
      render json: {status: 404, error: "Vocabulary #{vocabulary_params[:id]} not found"}
    end
  end

  # GET /courses/:course_name/vocab/edit
  def edit
    @course_version = find_matching_course_version
    @vocabularies = @course_version.vocabularies.order(:word)
  end

  private

  def vocabulary_params
    vp = params.transform_keys(&:underscore)
    vp = vp.permit(:id, :key, :word, :definition, :course_version_id)
    vp
  end

  def find_matching_course_version
    matching_unit_group = UnitGroup.find_by_name(params[:course_name])
    return matching_unit_group.course_version if matching_unit_group
    matching_standalone_course = Script.find_by_name(params[:course_name])
    return matching_standalone_course.course_version if matching_standalone_course&.is_course
    return nil
  end
end
