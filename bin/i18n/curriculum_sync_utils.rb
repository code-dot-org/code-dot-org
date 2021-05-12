require_relative 'curriculum_sync_utils/serializers'

module CurriculumSyncUtils
  DEBUG = true

  def self.serialize_all(serializer, objects)
    return objects.reduce({}) do |results, object|
      result = serializer.new(object).as_json.compact
      raise KeyEror.new("Serializer must define :crowdin_key for curriculum content I18N serialization; got #{result.keys.inspect}") unless result.key?(:crowdin_key)
      crowdin_key = result.delete(:crowdin_key)
      results[crowdin_key] = result unless result.empty?
      results
    end
  end

  def self.sync_in
    puts "Preparing curriculum content"
    Script.all.each do |script|
      # Step 1/3: Setup
      #next unless ScriptConstants.i18n? script.name
      # TODO: include the "other directory already exists" logic from localize_level_content
      script_category = script.get_course_version&.course_offering&.key || 'other'
      script_content_dir = File.join(I18N_SOURCE_DIR, 'curriculum_content', script_category, script.name)
      FileUtils.mkdir_p(script_content_dir)

      # Step 2/3: Serialize all script data
      serialized_data = Hash.new {|h, k| h[k] = {}}
      serialized_data[:lesson_groups] = serialize_all(LessonGroupSerializer, script.lesson_groups)
      serialized_data[:lessons] = serialize_all(LessonSerializer, script.lessons)
      serialized_data[:resources].merge!(serialize_all(ResourceSerializer, script.resources))
      serialized_data[:resources].merge!(serialize_all(ResourceSerializer, script.student_resources))

      script.lessons.each do |lesson|
        serialized_data[:lesson_activities].merge!(serialize_all(LessonActivitySerializer, lesson.lesson_activities))
        serialized_data[:objectives].merge!(serialize_all(ObjectiveSerializer, lesson.objectives))
        serialized_data[:resources].merge!(serialize_all(ResourceSerializer, lesson.resources))
        serialized_data[:vocabularies].merge!(serialize_all(VocabularySerializer, lesson.vocabularies))

        lesson.lesson_activities.each do |lesson_activity|
          serialized_data[:activity_sections].merge!(serialize_all(ActivitySectionSerializer, lesson_activity.activity_sections))
        end
      end

      # Step 3/3: Write all serialized data
      serialized_data.each do |data_type, data|
        next if data.empty?
        path = File.join(script_content_dir, "#{data_type}.json")
        data = JSON.pretty_generate(data)
        File.write(path, data)
      end
    end
  end
end
