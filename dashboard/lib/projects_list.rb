require 'cdo/user_helpers'

module ProjectsList
  # Maximum number of projects of each type that can be requested.
  MAX_LIMIT = 100

  # A hash map from project group name to a list of publishable project types in
  # that group.
  PUBLISHED_PROJECT_TYPE_GROUPS = {
    applab: ['applab'],
    gamelab: ['gamelab'],
    playlab: ['playlab', 'gumball', 'infinity', 'iceage'],
    artist: ['artist', 'frozen'],
    minecraft: ['minecraft_adventurer', 'minecraft_designer', 'minecraft_hero'],
    events: %w(starwars starwarsblocks starwarsblocks_hour flappy bounce sports basketball),
    k1: ['artist_k1', 'playlab_k1'],
  }.freeze

  class << self
    # Look up every project of every student in the section which is not hidden or deleted.
    # Return a set of metadata which can be used to display a list of projects in the UI.
    # @param section [Section]
    # @return [Array<Hash>] An array with each entry representing a project.
    def fetch_section_projects(section)
      section_students = section.students
      [].tap do |projects_list_data|
        student_storage_ids = PEGASUS_DB[:user_storage_ids].
          where(user_id: section_students.pluck(:id)).
          select_hash(:user_id, :id)
        section_students.each do |student|
          next unless student_storage_id = student_storage_ids[student.id]
          PEGASUS_DB[:storage_apps].where(storage_id: student_storage_id, state: 'active').each do |project|
            # The channel id stored in the project's value field may not be reliable
            # when apps are remixed, so recompute the channel id.
            channel_id = storage_encrypt_channel_id(student_storage_id, project[:id])
            project_data = get_project_row_data(student, project, channel_id)
            projects_list_data << project_data if project_data
          end
        end
      end
    end

    # Retrieve a hash of lists of published projects from the database, e.g.
    #   {
    #     applab: [{...}, {...}, {...}]
    #   }
    # when a single project group is requested, or the following when all types
    # are requested:
    #   {
    #     applab: [{...}, {...}, {...}]
    #     gamelab: [{...}, {...}, {...}]
    #     playlab: [{...}, {...}, {...}]
    #     artist: [{...}, {...}, {...}]
    #   }
    # @param project_group [String] Project group to retrieve. Must be one of
    # PUBLISHED_PROJECT_TYPE_GROUPS.keys, or 'all' to retrieve all project groups.
    # @param limit [Integer] Maximum number of projects to retrieve from each group.
    #   Must be between 1 and MAX_LIMIT, inclusive.
    # @param published_before [string] String representing a DateTime before
    #   which to search for the requested projects. Must not be specified
    #   when requesting all project types. Optional.
    # @return [Hash<Array<Hash>>] A hash of lists of published projects.
    def fetch_published_projects(project_group, limit:, published_before:)
      unless limit && limit.to_i >= 1 && limit.to_i <= MAX_LIMIT
        raise ArgumentError, "limit must be between 1 and #{MAX_LIMIT}"
      end
      if project_group == 'all'
        raise ArgumentError, 'Cannot specify published_before when requesting all project types' if published_before
        return fetch_published_project_types(PUBLISHED_PROJECT_TYPE_GROUPS.keys, limit: limit)
      end
      raise ArgumentError, "invalid project type: #{project_group}" unless PUBLISHED_PROJECT_TYPE_GROUPS.keys.include?(project_group.to_sym)
      fetch_published_project_types([project_group.to_s], limit: limit, published_before: published_before)
    end

    private

    # e.g. '/p/applab' -> 'applab'
    def project_type(level)
      level && level.split('/')[2]
    end

    # pull various fields out of the student and project records to populate
    # a data structure that can be used to populate a UI component displaying a
    # single project.
    def get_project_row_data(student, project, channel_id)
      project_value = project[:value] ? JSON.parse(project[:value]) : {}
      return nil if project_value['hidden'] == true || project_value['hidden'] == 'true'
      {
        channel: channel_id,
        name: project_value['name'],
        studentName: student.name,
        thumbnailUrl: project_value['thumbnailUrl'],
        type: project_type(project_value['level']),
        updatedAt: project_value['updatedAt'],
      }.with_indifferent_access
    end

    def project_and_user_fields
      [
        :storage_apps__id___id,
        :storage_apps__storage_id___storage_id,
        :storage_apps__value___value,
        :storage_apps__project_type___project_type,
        :storage_apps__published_at___published_at,
        :users__name___name,
        :users__birthday___birthday,
        :users__properties___properties,
      ]
    end

    def fetch_published_project_types(project_groups, limit:, published_before: nil)
      users = "dashboard_#{CDO.rack_env}__users".to_sym
      {}.tap do |projects|
        project_groups.map do |project_group|
          project_types = PUBLISHED_PROJECT_TYPE_GROUPS[project_group]
          projects[project_group] = PEGASUS_DB[:storage_apps].
            select(*project_and_user_fields).
            join(:user_storage_ids, id: :storage_id).
            join(users, id: :user_id).
            where(state: 'active', project_type: project_types, abuse_score: 0).
            where {published_before.nil? || published_at < DateTime.parse(published_before)}.
            exclude(published_at: nil).
            order(Sequel.desc(:published_at)).
            limit(limit).
            map {|project_and_user| get_published_project_and_user_data project_and_user}.compact
        end
      end
    end

    # Extracts published project data from a row that is a join of the
    # storage_apps and user tables.
    #
    # @param [hash] the join of storage_apps and user tables for a published project.
    #  See project_and_user_fields for which fields it contains.
    # @returns [hash, nil] containing feilds relevant to the published project or
    #  nil when the user has sharing_disabled = true
    def get_published_project_and_user_data(project_and_user)
      return nil if get_sharing_disabled_from_properties(project_and_user[:properties])
      channel_id = storage_encrypt_channel_id(project_and_user[:storage_id], project_and_user[:id])
      StorageApps.get_published_project_data(project_and_user, channel_id).merge(
        {
          # For privacy reasons, include only the first initial of the student's name.
          studentName: UserHelpers.initial(project_and_user[:name]),
          studentAgeRange: UserHelpers.age_range_from_birthday(project_and_user[:birthday]),
        }
      ).with_indifferent_access
    end
  end
end
