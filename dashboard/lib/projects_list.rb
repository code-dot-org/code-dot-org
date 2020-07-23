require 'cdo/user_helpers'

module ProjectsList
  # Maximum number of projects of each type that can be requested.
  MAX_LIMIT = 100

  # A hash map from project group name to a list of publishable project types in
  # that group.
  PUBLISHED_PROJECT_TYPE_GROUPS = {
    applab: ['applab'],
    gamelab: ['gamelab'],
    spritelab: ['spritelab'],
    playlab: ['playlab', 'gumball', 'infinity', 'iceage'],
    artist: ['artist', 'frozen'],
    minecraft: ['minecraft_adventurer', 'minecraft_designer', 'minecraft_hero', 'minecraft_aquatic'],
    events: %w(starwars starwarsblocks starwarsblocks_hour flappy bounce sports basketball),
    k1: ['artist_k1', 'playlab_k1'],
    dance: ['dance'],
    library: ['applab', 'gamelab']
  }.freeze

  # Sharing of advanced project types to the public gallery is restricted for
  # young students unless sharing is explciitly enabled by the student's
  # teacher for privacy reasons.
  ADVANCED_PROJECT_TYPES = ['applab', 'gamelab', 'spritelab']

  class << self
    # Look up every project associated with the provided user_id, excluding those that are hidden.
    # Return a set of metadata which can be used to display a table of personal projects in the UI.
    # @param user_id
    # @return [Array<Hash>] An array with each entry representing a project.
    def fetch_personal_projects(user_id)
      personal_projects_list = []
      storage_id = storage_id_for_user_id(user_id)
      PEGASUS_DB[:storage_apps].where(storage_id: storage_id, state: 'active').each do |project|
        channel_id = storage_encrypt_channel_id(storage_id, project[:id])
        project_data = get_project_row_data(project, channel_id, nil, true)
        personal_projects_list << project_data if project_data
      end
      personal_projects_list
    end

    # Look up every project of every student in the section, excluding those that are hidden.
    # Return a set of metadata which can be used to display a list of projects, excluding hidden or deleted in the UI.
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
            project_data = get_project_row_data(project, channel_id, student)
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
    def fetch_published_projects(project_group, limit:, published_before: nil)
      unless limit && limit.to_i >= 1 && limit.to_i <= MAX_LIMIT
        raise ArgumentError, "limit must be between 1 and #{MAX_LIMIT}"
      end
      if project_group == 'all'
        raise ArgumentError, 'Cannot specify published_before when requesting all project types' if published_before
        return include_featured(limit: limit)
      end
      raise ArgumentError, "invalid project type: #{project_group}" unless PUBLISHED_PROJECT_TYPE_GROUPS.keys.include?(project_group.to_sym)
      fetch_published_project_types([project_group.to_sym], limit: limit, published_before: published_before)
    end

    def include_featured(limit:)
      published = fetch_published_project_types(PUBLISHED_PROJECT_TYPE_GROUPS.keys, limit: limit)
      featured = fetch_featured_published_projects
      PUBLISHED_PROJECT_TYPE_GROUPS.keys.each do |project_type|
        featured[project_type].push(published[project_type]).flatten!.uniq!
      end
      return featured
    end

    def fetch_featured_published_projects
      featured_published_projects = {}
      PUBLISHED_PROJECT_TYPE_GROUPS.each do |project_group, project_types|
        featured_published_projects[project_group] = []
        project_types.each do |project_type|
          featured_published_projects[project_group] <<
          fetch_featured_projects_by_type(project_type)
        end
        featured_published_projects[project_group].flatten!
      end
      return featured_published_projects
    end

    # Retrieve a class set of libraries for a specified class section
    # @param section The section that has all users whose libraries should
    #                be returned.
    # @return [Hash<Array<Hash>>] A hash of lists of published libraries.
    def fetch_section_libraries(section)
      project_types = PUBLISHED_PROJECT_TYPE_GROUPS[:library]
      section_users = section.students + [section.user]

      [].tap do |projects_list_data|
        user_storage_ids = PEGASUS_DB[:user_storage_ids].
          where(user_id: section_users.pluck(:id)).
          select_hash(:id, :user_id)
        user_storage_id_list = user_storage_ids.keys
        PEGASUS_DB[:storage_apps].
          where(storage_id: user_storage_id_list, state: 'active').
          where(project_type: project_types).
          where("value->'$.libraryName' IS NOT NULL").
          each do |project|
            # The channel id stored in the project's value field may not be reliable
            # when apps are remixed, so recompute the channel id.
            channel_id = storage_encrypt_channel_id(project[:storage_id], project[:id])
            project_owner = section_users.find {|user| user.id == user_storage_ids[project[:storage_id]]}
            project_data = get_library_row_data(project, channel_id, section.name, project_owner)
            if project_data && (project_owner.id != section.user_id || project_data[:sharedWith].include?(section.id))
              projects_list_data << project_data
            end
          end
      end
    end

    # Given an array of library objects (outlined below), returns the channel_ids for
    # libraries that have been updated since the given version.
    #
    # @param libraries [Array<Hash>] Should be formatted as follows:
    #   [{channel_id: 'abc123', version: 'xyz987'}]
    #   where `version` corresponds to an S3 version of the library.
    # @return [Array<String>] The channel_ids of libraries that have been updated since the given version.
    def fetch_updated_library_channels(libraries)
      project_ids = libraries.map do |library|
        _, id = storage_decrypt_channel_id(library['channel_id'])
        library['project_id'] = id
        id
      rescue
        nil
      end.compact.uniq

      return [] if project_ids.nil_or_empty?

      updated_library_channels = []
      PEGASUS_DB[:storage_apps].where(id: project_ids).each do |project|
        library = libraries.find {|lib| lib['project_id'] == project[:id]}
        project_value = JSON.parse(project[:value])
        next unless library && project_value['latestLibraryVersion']

        if library['version'] != project_value['latestLibraryVersion']
          updated_library_channels << library['channel_id']
        end
      end

      updated_library_channels
    end

    def project_and_featured_project_and_user_fields
      [
        :storage_apps__id___id,
        :storage_apps__storage_id___storage_id,
        :storage_apps__value___value,
        :storage_apps__project_type___project_type,
        :storage_apps__published_at___published_at,
        :featured_projects__featured_at___featured_at,
        :featured_projects__unfeatured_at___unfeatured_at,
        :users__name___name,
        :users__birthday___birthday,
        :users__properties___properties,
      ]
    end

    def fetch_featured_projects_by_type(project_type)
      storage_apps = "#{CDO.pegasus_db_name}__storage_apps".to_sym
      user_storage_ids = "#{CDO.pegasus_db_name}__user_storage_ids".to_sym
      project_featured_project_user_combo_data = DASHBOARD_DB[:featured_projects].
        select(*project_and_featured_project_and_user_fields).
        join(storage_apps, id: :storage_app_id).
        join(user_storage_ids, id: Sequel[:storage_apps][:storage_id]).
        join(:users, id: Sequel[:user_storage_ids][:user_id]).
        where(
          unfeatured_at: nil,
          project_type: project_type.to_s,
          state: 'active'
        ).
        exclude(published_at: nil).
        order(Sequel.desc(:published_at)).limit(8).all.shuffle!
      extract_data_for_featured_project_cards(project_featured_project_user_combo_data)
    end

    def extract_data_for_featured_project_cards(project_featured_project_user_combo_data)
      data_for_featured_project_cards = []
      project_featured_project_user_combo_data.each do |project_details|
        project_details_value = JSON.parse(project_details[:value])
        channel = storage_encrypt_channel_id(project_details[:storage_id], project_details[:id])
        data_for_featured_project_card = {
          "channel" => channel,
          "name" => project_details_value['name'],
          "thumbnailUrl" =>  StorageApps.make_thumbnail_url_cacheable(project_details_value['thumbnailUrl']),
          "type" => project_details[:project_type],
          "publishedAt" => project_details[:published_at],
          "studentName" => UserHelpers.initial(project_details[:name]),
          "studentAgeRange" => UserHelpers.age_range_from_birthday(project_details[:birthday])
        }
        data_for_featured_project_cards << data_for_featured_project_card
      end
      return data_for_featured_project_cards
    end

    private

    # e.g. '/projects/applab' -> 'applab', or
    # 'https://studio.code.org/projects/weblab' --> 'weblab'
    def project_type(level)
      level && level.split('/').last
    end

    # pull various fields out of the student and project records to populate
    # a data structure that can be used to populate a UI component displaying a
    # single project.
    def get_project_row_data(project, channel_id, student = nil, with_library = false)
      project_value = project[:value] ? JSON.parse(project[:value]) : {}
      return nil if project_value['hidden'] == true || project_value['hidden'] == 'true'

      row_data = {
        channel: channel_id,
        name: project_value['name'],
        studentName: student&.name,
        thumbnailUrl: project_value['thumbnailUrl'],
        type: project_type(project_value['level']),
        updatedAt: project_value['updatedAt'],
        publishedAt: project[:published_at]
      }

      if with_library
        row_data[:libraryName] = project_value['libraryName']
        row_data[:libraryDescription] = project_value['libraryDescription']
        row_data[:libraryPublishedAt] = project_value['libraryPublishedAt']
        row_data[:sharedWith] = project_value['sharedWith'] ? project_value['sharedWith'] : []
      end

      row_data.with_indifferent_access
    end

    # pull various fields out of the user and project records to populate
    # a data structure that can be used to populate a UI component displaying a
    # single library or a list of libraries.
    def get_library_row_data(project, channel_id, section_name, user = nil)
      project_value = project[:value] ? JSON.parse(project[:value]) : {}
      {
        sectionName: section_name,
        channel: channel_id,
        name: project_value['libraryName'],
        description: project_value['libraryDescription'],
        userName: user&.name,
        sharedWith: project_value['sharedWith'] ? project_value['sharedWith'] : []
      }.with_indifferent_access
    end

    def project_and_user_fields
      [
        :storage_apps__id___id,
        :storage_apps__storage_id___storage_id,
        :storage_apps__value___value,
        :storage_apps__project_type___project_type,
        :storage_apps__published_at___published_at,
        :storage_apps__abuse_score___abuse_score,
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
            where(state: 'active', project_type: project_types).
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
    # @returns [hash, nil] containing fields relevant to the published project or
    #  nil when the user has sharing_disabled = true for App Lab, Game Lab and Sprite Lab.
    def get_published_project_and_user_data(project_and_user)
      return nil if get_sharing_disabled_from_properties(project_and_user[:properties]) && ADVANCED_PROJECT_TYPES.include?(project_and_user[:project_type])
      return nil if project_and_user[:abuse_score] > 0
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
