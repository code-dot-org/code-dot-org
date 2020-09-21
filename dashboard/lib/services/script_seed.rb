module ScriptSeed
  SeedContext = Struct.new(:script, :lesson_groups, :lessons, :script_levels, :levels_script_levels, :levels,  keyword_init: true)

  def self.serialize_seeding_json(script)
    script.reload

    # We need to retrieve the Levels anyway, and doing it this way makes it fast to get the Level keys for each ScriptLevel.
    my_script_levels = ScriptLevel.includes(:levels).where(script_id: script.id)
    my_levels = my_script_levels.map(&:levels).flatten

    seed_context = SeedContext.new(
      script: script,
      lesson_groups: script.lesson_groups,
      lessons: script.lessons,
      script_levels: my_script_levels,
      levels_script_levels: script.levels_script_levels,
      levels: my_levels
    )
    scope = {seed_context: seed_context}

    data = {
      script: ScriptSerializer.new(script, scope: scope).as_json,
      lesson_groups: script.lesson_groups.map {|lg| ScriptSeed::LessonGroupSerializer.new(lg, scope: scope).as_json},
      lessons: script.lessons.map {|l| ScriptSeed::LessonSerializer.new(l, scope: scope).as_json},
      script_levels: script.script_levels.map {|sl| ScriptSeed::ScriptLevelSerializer.new(sl, scope: scope).as_json},
      levels_script_levels: script.levels_script_levels.map {|lsl| ScriptSeed::LevelsScriptLevelSerializer.new(lsl, scope: scope).as_json}
    }
    JSON.pretty_generate(data)
  end

  def self.seed_from_json_file(file_or_path)
    seed_from_json(File.read(file_or_path))
  end

  def self.seed_from_json(json_string)
    Script.transaction do
      data = JSON.parse(json_string)

      script_data = data['script']
      lesson_groups_data = data['lesson_groups']
      lessons_data = data['lessons']
      script_levels_data = data['script_levels']
      levels_script_levels_data = data['levels_script_levels']
      seed_context = SeedContext.new

      seed_context.script = import_script(script_data)
      seed_context.lesson_groups = import_lesson_groups(lesson_groups_data, seed_context)
      seed_context.lessons = import_lessons(lessons_data, seed_context)

      seed_context.script_levels = ScriptLevel.where(script: seed_context.script).includes(:levels)
      seed_context.levels_script_levels = seed_context.script.levels_script_levels
      seed_context.script_levels = import_script_levels(script_levels_data, seed_context)

      seed_context.levels = seed_context.script_levels.map(&:levels).flatten
      import_levels_script_levels(levels_script_levels_data, seed_context)
      seed_context.script
    end
  end

  # Internal methods and classes below

  def self.import_script(script_data)
    script_to_import = Script.new(script_data.except('seeding_key'))
    # Needed because we already have some Scripts with invalid names
    script_to_import.skip_name_format_validation = true
    Script.import! [script_to_import], on_duplicate_key_update: :all
    Script.find_by!(name: script_to_import.name)
  end

  def self.import_lesson_groups(lesson_groups_data, seed_context)
    lesson_groups_to_import = lesson_groups_data.map do |lg_data|
      lesson_attrs = lg_data.except('seeding_key')
      lesson_attrs['script_id'] = seed_context.script.id
      LessonGroup.new(lesson_attrs)
    end
    LessonGroup.import! lesson_groups_to_import, on_duplicate_key_update: :all

    # Delete any existing lesson groups that weren't in the imported list, return remaining
    destroy_outdated_objects(LessonGroup, LessonGroup.where(script: seed_context.script), lesson_groups_to_import, seed_context)
  end

  def self.import_lessons(lessons_data, seed_context)
    lessons_to_import = lessons_data.map do |lesson_data|
      lesson_group_id = seed_context.lesson_groups.select {|lg| lg.key == lesson_data['seeding_key']['lesson_group.key']}.first&.id
      raise 'No lesson group found' if lesson_group_id.nil?

      lesson_attrs = lesson_data.except('seeding_key')
      lesson_attrs['script_id'] = seed_context.script.id
      lesson_attrs['lesson_group_id'] = lesson_group_id
      Lesson.new(lesson_attrs)
    end

    # Delete any existing lessons that weren't in the imported list
    # Destroy before import, otherwise absolute_position gets messed up.
    destroy_outdated_objects(Lesson, Lesson.where(script: seed_context.script), lessons_to_import, seed_context)
    Lesson.import! lessons_to_import, on_duplicate_key_update: :all
    Lesson.where(script: seed_context.script)
  end

  def self.import_script_levels(script_levels_data, seed_context)
    lessons_by_seeding_key = seed_context.lessons.index_by {|l| l.seeding_key(seed_context)}
    script_levels_by_seeding_key = seed_context.script_levels.index_by {|sl| sl.seeding_key(seed_context)}

    script_levels_to_import = script_levels_data.map do |sl_data|
      stage = lessons_by_seeding_key[sl_data['seeding_key'].select {|k, _| !k.start_with?('script_level.')}]
      raise 'No stage found' if stage.nil?

      # Unlike the other models, we must explicitly check for an existing ScriptLevel to update, since its
      # logical unique key is not a unique index on the table, so we can't just rely on on_duplicate_key_update: :all.
      script_level_to_import = script_levels_by_seeding_key[sl_data['seeding_key']] || ScriptLevel.new
      script_level_attrs = sl_data.except('seeding_key')
      script_level_attrs['script_id'] = seed_context.script.id
      script_level_attrs['stage_id'] = stage.id
      script_level_to_import.assign_attributes(script_level_attrs)
      script_level_to_import
    end

    # Delete any existing ScriptLevels that weren't in the imported list
    # Destroy before import, otherwise chapter gets messed up.
    destroy_outdated_objects(ScriptLevel, seed_context.script_levels, script_levels_to_import, seed_context)
    ScriptLevel.import! script_levels_to_import, on_duplicate_key_update: :all
    ScriptLevel.where(script: seed_context.script).includes(:levels)
  end

  def self.import_levels_script_levels(levels_script_levels_data, seed_context)
    levels_by_seeding_key = seed_context.levels.index_by(&:unique_key)
    script_levels_by_seeding_key = seed_context.script_levels.index_by {|sl| sl.seeding_key(seed_context)}

    levels_script_levels_to_import = levels_script_levels_data.map do |lsl_data|
      seeding_key = lsl_data['seeding_key']['level.key']
      level = levels_by_seeding_key[seeding_key]
      unless level
        # TODO: we may want to get rid of this query since we make it for each new LevelsScriptLevel
        level = Level.find_by_key(seeding_key)
        levels_by_seeding_key[seeding_key] = level
        seed_context.levels.append(level)
      end
      raise 'No level found' if level.nil?

      script_level = script_levels_by_seeding_key[lsl_data['seeding_key'].except('level.key')]
      raise "No ScriptLevel found while seeding script: #{seed_context.script.name}" if script_level.nil?

      levels_script_level_attrs = {level_id: level.id, script_level_id: script_level.id}
      LevelsScriptLevel.new(levels_script_level_attrs)
    end
    LevelsScriptLevel.import! levels_script_levels_to_import, on_duplicate_key_update: :all

    # Delete any existing LevelsScriptLevels that weren't in the imported list, return remaining
    levels_script_levels = Script.find(seed_context.script.id).levels_script_levels
    destroy_outdated_objects(LevelsScriptLevel, levels_script_levels, levels_script_levels_to_import, seed_context)
  end

  def self.destroy_outdated_objects(model_class, all_objects, imported_objects, seed_context)
    objects_to_keep_by_seeding_key = imported_objects.index_by {|o| o.seeding_key(seed_context)}
    should_keep = all_objects.group_by {|o| objects_to_keep_by_seeding_key.include?(o.seeding_key(seed_context))}
    model_class.destroy(should_keep[false]) if should_keep.include?(false)
    should_keep[true]
  end

  class ScriptSerializer < ActiveModel::Serializer
    attributes(
      :name,
      :wrapup_video_id,
      :hidden,
      :login_required,
      :properties,
      :new_name,
      :family_name,
      :seeding_key
    )

    def seeding_key
      object.seeding_key(@scope[:seed_context])
    end
  end

  class LessonGroupSerializer < ActiveModel::Serializer
    attributes(
      :key,
      :user_facing,
      :position,
      :properties,
      :seeding_key
    )

    def seeding_key
      object.seeding_key(@scope[:seed_context])
    end
  end

  class LessonSerializer < ActiveModel::Serializer
    attributes(
      :key,
      :name,
      :absolute_position,
      :lockable,
      :relative_position,
      :properties,
      :seeding_key
    )

    def seeding_key
      object.seeding_key(@scope[:seed_context])
    end
  end

  class ScriptLevelSerializer < ActiveModel::Serializer
    attributes(
      :chapter,
      :position,
      :assessment,
      :properties,
      :named_level,
      :bonus,
      :seeding_key,
      :level_keys
    )

    def seeding_key
      object.seeding_key(@scope[:seed_context], use_existing_level_keys: false)
    end

    def level_keys
      object.get_level_keys(@scope[:seed_context], use_existing_level_keys: false)
    end
  end

  class LevelsScriptLevelSerializer < ActiveModel::Serializer
    attributes :seeding_key

    def seeding_key
      object.seeding_key(@scope[:seed_context])
    end
  end
end
