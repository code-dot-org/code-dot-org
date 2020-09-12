# Methods for serializing and seeding Lesson properties (aka SerializedProperties).
#
# Currently, Lessons are created / updated during Script seeding, but their properties are not.
# Adding new properties to the Script DSL format is expensive and error-prone, so this module augments
# Script seeding by separately serializing and seeding only the data not already covered by Script seeding.
#
# Any future models that are under Lessons in the hierarchy should also be serialized using this approach, rather
# than with the Script DSL. Eventually, it would be best if we can replace Script DSL entirely with this approach.
module LessonSeeding
  class LessonSerializer < ActiveModel::Serializer
    attributes :key, :properties
  end

  class LessonGroupSerializer < ActiveModel::Serializer
    attributes :key

    has_many :lessons, serializer: LessonSerializer
  end

  class ScriptSerializer < ActiveModel::Serializer
    attributes :name

    has_many :lesson_groups, serializer: LessonGroupSerializer
  end

  # @param script [Script] - a Script to serialize
  # @return [String] - JSON data structure of the Script, its Lesson Groups, and their Lessons. Only the name / key
  #   fields of Script and Lesson Groups are included, as context for uniquely identifying each Lesson.
  def self.serialize_lessons(script)
    # include: '**' allows serialization of associations recursively for any number of levels.
    # https://github.com/rails-api/active_model_serializers/issues/968#issuecomment-557513403s
    JSON.pretty_generate(ScriptSerializer.new(script).as_json(include: '**')) + "\n"
  end

  # Seeds Lesson properties from seeding files. Done in bulk for improved performance.
  #
  # @param filenames [Array[String]] - A list of seeding filenames.
  def self.seed_lessons(filenames)
    lessons_to_import = filenames.map do |filename|
      LessonSeeding.deserialize_as_lessons_to_import(File.read(filename))
    end.flatten

    Lesson.import! lessons_to_import, on_duplicate_key_update: :all
  end

  LessonFullKey = Struct.new(:key, :lesson_group_key)

  def self.deserialize_as_lessons_to_import(script_lessons_json)
    script_lessons_hash = JSON.parse(script_lessons_json)

    # We take some care here to minimize the number of SQL queries required.
    # This method should require 3 SELECTs and 1 INSERT INTO ... ON DUPLICATE KEY UPDATE:
    #
    # 1. select the script by name
    # 2. select that script's lesson groups
    # 3. select the lessons from those lesson groups
    # 4. insert with the updated values

    script = Script.find_by!(name: script_lessons_hash['name'])
    lesson_group_keys_by_id = script.lesson_groups.map {|lg| [lg.id, lg.key]}.to_h
    lessons_by_full_key = script.lessons.map do |l|
      [LessonFullKey.new(l.key, lesson_group_keys_by_id[l.lesson_group_id]), l]
    end.to_h

    lessons_to_import = []
    script_lessons_hash['lesson_groups'].each do |lesson_group_hash|
      lesson_group_key = lesson_group_hash['key']

      lesson_group_hash['lessons'].each do |lesson_hash|
        full_key = LessonFullKey.new(lesson_hash['key'], lesson_group_key)

        lesson_to_import = lessons_by_full_key[full_key].clone
        lesson_to_import.assign_attributes(lesson_hash)
        # We have to explicitly assign properties as a special case because our SerializedProperties code
        # has some logic to merge the property hashes when using assign_attributes
        lesson_to_import.properties = lesson_hash['properties']
        lessons_to_import << lesson_to_import
      end
    end

    lessons_to_import
  end
end
