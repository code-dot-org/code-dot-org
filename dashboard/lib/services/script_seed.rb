# Script serialization and seeding. Serializes to JSON using ActiveModelSerializers,
# and bulk imports to the DB using ActiveRecord-Import.
#
# We use serialization and seeding to synchronize curriculum data from Levelbuilder to
# other environments, most importantly production. One key requirement is that when an
# object is updated on Levelbuilder and serialized, the seeding process in the downstream environment must
# find the logically corresponding object in that environment and update it without changing its primary key id.
# This is because other tables, for example user_levels which tracks user progress, contains references to those
# primary key IDs.
#
# The most relevant public-facing methods in this module are serialize_seeding_json and seed_from_json_file.

module Services
  module ScriptSeed
    # Holds data that we've already retrieved from the database. Used to look up
    # associations of objects without making additional queries.
    # Storing this data together in a "data object" makes it easier to pass around.
    SeedContext = Struct.new(
      :script, :lesson_groups, :lessons, :lesson_activities, :activity_sections,
      :script_levels, :levels_script_levels, :levels, :resources,
      :lessons_resources, keyword_init: true
    )

    # Produces a JSON representation of the given Script and all objects under it in its "tree", in a format specifically
    # designed to be used for seeding.
    #
    # Even though conceptually a Script and the objects under it (LessonGroups, Lessons, ScriptLevels, etc.) form a tree,
    # the serialized JSON is "flat" - all objects for a model are stored together in an array, without nested children.
    # Instead, each object contains the necessary identifying information for their associated objects. This flatter format
    # is better suited for the bulk import logic used in seeding, where we import all objects for a model in a single insert.
    #
    # @param [Script] script - the Script object to serialize
    # @return [String] the JSON representation
    def self.serialize_seeding_json(script)
      script = Script.with_seed_models.find(script.id)

      # We need to retrieve the Levels anyway, and doing it this way makes it fast to get the Level keys for each ScriptLevel.
      my_script_levels = ScriptLevel.includes(:levels).where(script_id: script.id)
      my_levels = my_script_levels.map(&:levels).flatten

      activities = script.lessons.map(&:lesson_activities).flatten
      sections = activities.map(&:activity_sections).flatten
      resources = script.lessons.map(&:resources).flatten
      lessons_resources = script.lessons.map(&:lessons_resources).flatten

      seed_context = SeedContext.new(
        script: script,
        lesson_groups: script.lesson_groups,
        lessons: script.lessons,
        lesson_activities: activities,
        activity_sections: sections,
        script_levels: my_script_levels,
        levels_script_levels: script.levels_script_levels,
        levels: my_levels,
        resources: resources,
        lessons_resources: lessons_resources
      )
      scope = {seed_context: seed_context}

      data = {
        script: ScriptSerializer.new(script, scope: scope).as_json,
        lesson_groups: script.lesson_groups.map {|lg| ScriptSeed::LessonGroupSerializer.new(lg, scope: scope).as_json},
        lessons: script.lessons.map {|l| ScriptSeed::LessonSerializer.new(l, scope: scope).as_json},
        lesson_activities: activities.map {|a| ScriptSeed::LessonActivitySerializer.new(a, scope: scope).as_json},
        activity_sections: sections.map {|s| ScriptSeed::ActivitySectionSerializer.new(s, scope: scope).as_json},
        script_levels: script.script_levels.map {|sl| ScriptSeed::ScriptLevelSerializer.new(sl, scope: scope).as_json},
        levels_script_levels: script.levels_script_levels.map {|lsl| ScriptSeed::LevelsScriptLevelSerializer.new(lsl, scope: scope).as_json},
        resources: resources.map {|r| ScriptSeed::ResourceSerializer.new(r, scope: scope).as_json},
        lessons_resources: lessons_resources.map {|lr| ScriptSeed::LessonsResourceSerializer.new(lr, scope: scope).as_json}
      }
      JSON.pretty_generate(data)
    end

    # Convenience wrapper around seed_from_json. Reads the content from the given file and then seeds using it.
    #
    # @param [String | File] file_or_path - Can be String representing a path, relative or absolute, to the file
    #   to read from, or it can be a File object to read from.
    # @return [Script] the Script created/updated from seeding
    def self.seed_from_json_file(file_or_path)
      seed_from_json(File.read(file_or_path))
    end

    # Creates / updates the objects in the database described by the input JSON.
    #
    # This method is responsible for Script objects and everything "under" them logically in the curriculum data
    # hierarchy. Currently (9/23/2020), this looks like:
    #
    # Script (has_many)-> LessonGroup (has_many)-> Lesson (has_many)-> ScriptLevel.
    #
    # This method is not responsible for creating/updating Levels, so it depends on level seeding running before it.
    # However, it is responsible for creating/updating the associations between ScriptLevels and Levels, which control
    # which Levels belong to which Lessons. Since ScriptLevel/Levels is a many-to-many relationship, controlled by a
    # separate join table, we also treat the join table objects as belonging to the hierarchy, and represent it with
    # the LevelsScriptLevels model.
    #
    # An outline of the approach:
    #
    # Go through the hierarchy top-to-bottom order, starting with Script, and do the following for each model:
    # 1. For each object for the current model, look up and fill in the ids for their associated objects, based on their
    # seeding keys. The rest of the attributes are used as-is from the input data.
    # 2. Bulk import all of those objects using ActiveRecord-Import
    # 3. After import, query for all objects of that model now associated with the Script. Find all of these objects which
    # were not present in the input data, based on their seeding keys. Bulk-destroy those objects.
    #
    # Some important implementation details:
    #
    # - One challenge is that different models have different ways of uniquely identifying themselves. To abstract these
    # differences, each model implements a seeding_key method which takes in a SeedContext, and returns a hash of all
    # the information which composes its "logical unique identifier".
    #
    # - We try to avoid doing database queries within loops, within reason. Ideally, the total number of queries made
    # would only scale with the # of models, not the number of objects. Exceptions can be made if avoiding them is
    # too complex or not performant, and making the repeated queries achieves decent performance empirically.
    #
    # - One way to avoid repeated queries when looking up associations is to load all objects of the associated model
    # for the Script into the SeedContext, and do lookups against that already-loaded data.
    #
    # - If a seeding_key has a corresponding unique index, we can skip looking up objects to update, and just
    # rely on the "on duplicate key update" feature instead.
    #
    # - We try to achieve both simplicity and performance.
    #
    # @param [String] json_string - The input JSON to seed from.
    # @return [Script] the Script created/updated from seeding
    def self.seed_from_json(json_string)
      Script.transaction do
        data = JSON.parse(json_string)

        script_data = data['script']
        lesson_groups_data = data['lesson_groups']
        lessons_data = data['lessons']
        lesson_activities_data = data['lesson_activities']
        activity_sections_data = data['activity_sections']
        script_levels_data = data['script_levels']
        levels_script_levels_data = data['levels_script_levels']
        resources_data = data['resources']
        lessons_resources_data = data['lessons_resources']
        seed_context = SeedContext.new

        # The order of the following import steps is important. If B belongs_to
        # A, then B holds an id field referring to A, and therefore A must be
        # imported before B. For example, LessonsResource belongs to both
        # Lesson and Resource, so both Lesson and Resource must be imported
        # before LessonsResource.

        seed_context.script = import_script(script_data)

        # Course version must be set before resources are imported. If the
        # script is in a unit group, we must wait and let the next seed step set
        # the course version on the unit group before resources can be imported.
        if seed_context.script.is_course
          CourseOffering.add_course_offering(seed_context.script)
        end

        seed_context.lesson_groups = import_lesson_groups(lesson_groups_data, seed_context)
        seed_context.lessons = import_lessons(lessons_data, seed_context)
        seed_context.lesson_activities = import_lesson_activities(lesson_activities_data, seed_context)
        seed_context.activity_sections = import_activity_sections(activity_sections_data, seed_context)

        # Because ScriptLevel's seeding_key depends on the keys of its associated Levels, we can
        # improve performance by loading all of it here into the SeedContext.
        # TODO: this can be simplified / avoided if we add a new unique identifier field to ScriptLevel.
        seed_context.script_levels = ScriptLevel.where(script: seed_context.script).includes(:levels)
        seed_context.levels_script_levels = seed_context.script.levels_script_levels
        seed_context.script_levels = import_script_levels(script_levels_data, seed_context)

        # levels_script_levels is a join table, which isn't usually explicitly modeled in Rails, but treating it
        # as just another set of objects to import allows us to handle it with the same pattern as the other models.
        seed_context.levels = seed_context.script_levels.map(&:levels).flatten
        import_levels_script_levels(levels_script_levels_data, seed_context)

        seed_context.resources = import_resources(resources_data, seed_context)
        seed_context.lessons_resources = import_lessons_resources(lessons_resources_data, seed_context)

        seed_context.script
      end
    end

    # Internal methods and classes below

    def self.import_script(script_data)
      script_to_import = Script.new(script_data.except('seeding_key'))
      # Needed because we already have some Scripts with invalid names
      script_to_import.skip_name_format_validation = true
      Script.import! [script_to_import], on_duplicate_key_update: get_columns(Script)
      Script.find_by!(name: script_to_import.name)
    end

    def self.import_lesson_groups(lesson_groups_data, seed_context)
      lesson_groups_to_import = lesson_groups_data.map do |lg_data|
        lesson_attrs = lg_data.except('seeding_key')
        lesson_attrs['script_id'] = seed_context.script.id
        LessonGroup.new(lesson_attrs)
      end
      LessonGroup.import! lesson_groups_to_import, on_duplicate_key_update: get_columns(LessonGroup)

      # Destroy any existing lesson groups that weren't in the imported list, return remaining
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

      # Destroy any existing lessons that weren't in the imported list
      # Destroy before import, otherwise absolute_position gets messed up.
      destroy_outdated_objects(Lesson, Lesson.where(script: seed_context.script), lessons_to_import, seed_context)
      Lesson.import! lessons_to_import, on_duplicate_key_update: get_columns(Lesson)
      Lesson.where(script: seed_context.script)
    end

    def self.import_lesson_activities(activities_data, seed_context)
      activities_to_import = activities_data.map do |activity_data|
        lesson_id = seed_context.lessons.select {|l| l.key == activity_data['seeding_key']['lesson.key']}.first&.id
        raise 'No lesson found' if lesson_id.nil?

        activity_attrs = activity_data.except('seeding_key')
        activity_attrs['lesson_id'] = lesson_id
        LessonActivity.new(activity_attrs)
      end

      # Destroy any existing activities that weren't in the imported list
      # Destroy before import, otherwise position gets messed up.
      existing_activities = LessonActivity.joins(:lesson).where('stages.script_id' => seed_context.script.id)
      destroy_outdated_objects(LessonActivity, existing_activities, activities_to_import, seed_context)
      LessonActivity.import! activities_to_import, on_duplicate_key_update: get_columns(LessonActivity)
      LessonActivity.joins(:lesson).where('stages.script_id' => seed_context.script.id)
    end

    def self.import_activity_sections(sections_data, seed_context)
      sections_to_import = sections_data.map do |section_data|
        lesson_activity_id = seed_context.lesson_activities.select {|la| la.key == section_data['seeding_key']['lesson_activity.key']}.first&.id
        raise "No lesson activity found with key #{section_data['seeding_key']['lesson_activity.key']}" if lesson_activity_id.nil?

        section_attrs = section_data.except('seeding_key')
        section_attrs['lesson_activity_id'] = lesson_activity_id
        ActivitySection.new(section_attrs)
      end

      # Destroy any existing activities that weren't in the imported list
      # Destroy before import, otherwise position gets messed up.
      existing_sections = ActivitySection.joins(lesson_activity: :lesson).where('stages.script_id' => seed_context.script.id)
      destroy_outdated_objects(ActivitySection, existing_sections, sections_to_import, seed_context)
      ActivitySection.import! sections_to_import, on_duplicate_key_update: get_columns(ActivitySection)
      ActivitySection.joins(lesson_activity: :lesson).where('stages.script_id' => seed_context.script.id)
    end

    def self.import_script_levels(script_levels_data, seed_context)
      lessons_by_seeding_key = seed_context.lessons.index_by {|l| l.seeding_key(seed_context)}
      script_levels_by_seeding_key = seed_context.script_levels.index_by {|sl| sl.seeding_key(seed_context)}

      script_levels_to_import = script_levels_data.map do |sl_data|
        # Extract the parts of the ScriptLevel's seeding_key which are used to
        # identify the Lesson by its seeding_key.
        lesson_seed_keys = %w(lesson.key lesson_group.key script.name)
        stage = lessons_by_seeding_key[sl_data['seeding_key'].select {|k, _| lesson_seed_keys.include?(k)}]
        raise 'No stage found' if stage.nil?

        section_key = sl_data['seeding_key']['activity_section.key']
        section_id = section_key && seed_context.activity_sections.find {|section| section.key == section_key}.id

        # Unlike the other models, we must explicitly check for an existing ScriptLevel to update, since its
        # logical unique key is not a unique index on the table, so we can't just rely on on_duplicate_key_update: :all.
        # TODO: this can be simplified / avoided if we add a new unique identifier field to ScriptLevel.
        script_level_to_import = script_levels_by_seeding_key[sl_data['seeding_key']] || ScriptLevel.new
        script_level_attrs = sl_data.except('seeding_key')
        script_level_attrs['script_id'] = seed_context.script.id
        script_level_attrs['activity_section_id'] = section_id if section_id
        script_level_attrs['stage_id'] = stage.id
        script_level_to_import.assign_attributes(script_level_attrs)
        script_level_to_import
      end

      # Delete any existing ScriptLevels that weren't in the imported list
      # Destroy before import, otherwise chapter gets messed up.
      destroy_outdated_objects(ScriptLevel, seed_context.script_levels, script_levels_to_import, seed_context)
      ScriptLevel.import! script_levels_to_import, on_duplicate_key_update: get_columns(ScriptLevel)
      ScriptLevel.where(script: seed_context.script).includes(:levels)
    end

    def self.import_levels_script_levels(levels_script_levels_data, seed_context)
      levels_by_seeding_key = seed_context.levels.index_by(&:key)
      script_levels_by_seeding_key = seed_context.script_levels.index_by {|sl| sl.seeding_key(seed_context)}

      levels_script_levels_to_import = levels_script_levels_data.map do |lsl_data|
        seeding_key = lsl_data['seeding_key']['level.key']
        level = levels_by_seeding_key[seeding_key]
        unless level
          # TODO: we may want to get rid of this query since we make it for each new LevelsScriptLevel.
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
      LevelsScriptLevel.import! levels_script_levels_to_import, on_duplicate_key_update: get_columns(LevelsScriptLevel)

      # Delete any existing LevelsScriptLevels that weren't in the imported list, return remaining
      levels_script_levels = Script.find(seed_context.script.id).levels_script_levels
      destroy_outdated_objects(LevelsScriptLevel, levels_script_levels, levels_script_levels_to_import, seed_context)
    end

    def self.import_resources(resources_data, seed_context)
      course_version_id = seed_context.script.get_course_version&.id

      unless course_version_id
        # We can't import any resources without a course version, because
        # course_version_id is required for resources. Don't raise, because we
        # may be in the scenario where this script does belong to a unit group,
        # but that association is not present in the database yet because the
        # seed process has not yet run on this machine since that relationship
        # was added. In this scenario, the relationship to the unit group and
        # its course version will be established in a later seed step. Then,
        # this method will be able to import the resources the next time the
        # seed process runs.
        if resources_data.count > 0
          puts "WARNING: unable to import resources into script #{seed_context.script.name} "\
            "because course version is missing. This is only to be expected if "\
            "the script is being seeded for the first time."
        end
        return []
      end

      resources_to_import = resources_data.map do |resource_data|
        resource_attrs = resource_data.except('seeding_key')
        resource_attrs['course_version_id'] = course_version_id
        Resource.new(resource_attrs)
      end

      # Resources are owned by the course version. Therefore, do not delete
      # resources which no longer appear in the serialized data.
      Resource.import! resources_to_import, on_duplicate_key_update: get_columns(Resource)
      resource_keys = resources_to_import.map(&:key)
      Resource.where(course_version_id: course_version_id, key: resource_keys)
    end

    def self.import_lessons_resources(lessons_resources_data, seed_context)
      return [] unless seed_context.script.get_course_version

      lessons_resources_to_import = lessons_resources_data.map do |lr_data|
        lesson_id = seed_context.lessons.select {|l| l.key == lr_data['seeding_key']['lesson.key']}.first&.id
        raise 'No lesson found' if lesson_id.nil?

        resource_id = seed_context.resources.select {|r| r.key == lr_data['seeding_key']['resource.key']}.first&.id
        raise 'No resource found' if resource_id.nil?

        LessonsResource.new(
          lesson_id: lesson_id,
          resource_id: resource_id
        )
      end

      # destroy_outdated_objects won't work on LessonsResource objects because
      # they do not have an id field. Work around this by inefficiently deleting
      # all LessonsResources using 1 query per lesson, and then re-importing all
      # LessonsResources in a single query. It may be possible to eliminate
      # these extra queries by adding an id column to the LessonsResource model.
      seed_context.lessons.each {|l| l.resources = []}

      LessonsResource.import! lessons_resources_to_import, on_duplicate_key_update: get_columns(LessonsResource)
      LessonsResource.joins(:lesson).where('stages.script_id' => seed_context.script.id)
    end

    def self.destroy_outdated_objects(model_class, all_objects, imported_objects, seed_context)
      objects_to_keep_by_seeding_key = imported_objects.index_by {|o| o.seeding_key(seed_context)}
      should_keep = all_objects.group_by {|o| objects_to_keep_by_seeding_key.include?(o.seeding_key(seed_context))}
      model_class.destroy(should_keep[false].pluck(:id)) if should_keep.include?(false)
      should_keep[true]
    end

    def self.get_columns(model_class)
      model_class.columns.map(&:name).map(&:to_sym) - %i(id)
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

    class LessonActivitySerializer < ActiveModel::Serializer
      attributes(
        :key,
        :position,
        :properties,
        :seeding_key
      )

      def seeding_key
        object.seeding_key(@scope[:seed_context])
      end
    end

    class ActivitySectionSerializer < ActiveModel::Serializer
      attributes(
        :key,
        :position,
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
        :activity_section_position,
        :assessment,
        :properties,
        :named_level,
        :bonus,
        :seeding_key,
        :level_keys
      )

      def seeding_key
        # Just in case the data stored in the level_keys property is out of sync somehow,
        # don't use that data during serialization.
        object.seeding_key(@scope[:seed_context], use_existing_level_keys: false)
      end

      def level_keys
        # We store this as a property in the database to allow for efficient ScriptLevel lookups
        # when seeding LevelsScriptLevels.
        # Just in case the data stored in the level_keys property is out of sync somehow,
        # don't use that data during serialization.
        object.get_level_keys(@scope[:seed_context], use_existing_level_keys: false)
      end
    end

    class LevelsScriptLevelSerializer < ActiveModel::Serializer
      attributes :seeding_key

      def seeding_key
        object.seeding_key(@scope[:seed_context])
      end
    end

    class ResourceSerializer < ActiveModel::Serializer
      attributes :name, :url, :key, :properties, :seeding_key

      def seeding_key
        object.seeding_key(@scope[:seed_context])
      end
    end

    class LessonsResourceSerializer < ActiveModel::Serializer
      attributes :seeding_key

      def seeding_key
        object.seeding_key(@scope[:seed_context])
      end
    end
  end
end
