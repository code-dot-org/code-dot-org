class VocabulariesController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env, except: [:show]

  # GET /vocabularies/search
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
      definition: vocabulary_params[:definition],
      common_sense_media: vocabulary_params[:common_sense_media]
    )
    vocabulary.course_version = course_version
    begin
      vocabulary.save!
      vocabulary.serialize_scripts
      render json: vocabulary.summarize_for_lesson_edit
    rescue ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid => e
      render status: 400, json: {error: e.message.to_json}
    end
  end

  # PUT/PATCH /vocabularies
  def update
    vocabulary = Vocabulary.find_by_id(vocabulary_params[:id])
    unless vocabulary_params[:lesson_ids].nil?
      vocabulary.lessons = vocabulary_params[:lesson_ids].map {|id| Lesson.find(id)}
      vocabulary.lessons.each do |lesson|
        lesson.script.write_script_json
      end
    end
    if vocabulary && vocabulary.update!(vocabulary_params.except(:lesson_ids))
      vocabulary.serialize_scripts
      render json: vocabulary.summarize_for_lesson_edit
    else
      render json: {status: 404, error: "Vocabulary #{vocabulary_params[:id]} not found"}
    end
  end

  # GET /courses/:course_name/vocab/edit
  def edit
    @course_version = find_matching_course_version
    @vocabularies = @course_version.vocabularies.order(:word).map(&:summarize_for_edit)
  end

  private

  def vocabulary_params
    vp = params.transform_keys(&:underscore)
    vp = vp.permit(:id, :key, :word, :definition, :common_sense_media, :course_version_id, :lesson_ids)
    vp[:lesson_ids] = JSON.parse(vp[:lesson_ids]) if vp[:lesson_ids]
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
