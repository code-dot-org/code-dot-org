module ProjectsList
  # Maximum number of projects of each type that can be requested.
  MAX_LIMIT = 100

  # List of valid project types, excluding 'all' which is also valid.
  PUBLISHED_PROJECT_TYPES = %w(
    applab
    gamelab
    playlab
    artist
  ).freeze

  class << self
    # Look up every project of every student in the section which is not hidden or deleted.
    # Return a set of metadata which can be used to display a list of projects in the UI.
    # @param section [Section]
    # @return [Array<Hash>] An array with each entry representing a project.
    def fetch_section_projects(section)
      [].tap do |projects_list_data|
        section.students.each do |student|
          student_storage_id = PEGASUS_DB[:user_storage_ids].where(user_id: student.id).first
          next unless student_storage_id
          PEGASUS_DB[:storage_apps].where(storage_id: student_storage_id[:id], state: 'active').each do |project|
            # The channel id stored in the project's value field may not be reliable
            # when apps are remixed, so recompute the channel id.
            channel_id = storage_encrypt_channel_id(student_storage_id[:id], project[:id])
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
    # when a single project type is requested, or the following when all types
    # are requested:
    #   {
    #     applab: [{...}, {...}, {...}]
    #     gamelab: [{...}, {...}, {...}]
    #     playlab: [{...}, {...}, {...}]
    #     artist: [{...}, {...}, {...}]
    #   }
    # @param project_type [String] Type of project to retrieve listed in
    # PUBLISHED_PROJECT_TYPES, or 'all' to retrieve a list of each project type.
    # @param limit [Integer] Maximum number of projects to retrieve of each type.
    #   Must be between 1 and MAX_LIMIT, inclusive.
    # @param offset [Integer] Number of projects to skip. Default: 0.
    #   Must not be specified when requesting all project types.
    # @return [Hash<Array<Hash>>] A hash of lists of published projects.
    def fetch_published_projects(project_type, limit:, offset:)
      unless limit && limit.to_i >= 1 && limit.to_i <= MAX_LIMIT
        raise ArgumentError, "limit must be between 1 and #{MAX_LIMIT}"
      end
      if project_type == 'all'
        raise ArgumentError, 'Cannot specify offset when requesting all project types' if offset
        return fetch_published_project_types(PUBLISHED_PROJECT_TYPES, limit: limit)
      end
      raise ArgumentError, "invalid project type: #{project_type}" unless PUBLISHED_PROJECT_TYPES.include?(project_type)
      fetch_published_project_types([project_type], limit: limit, offset: offset)
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

    def fetch_published_project_types(project_types, limit:, offset: 0)
      users = "dashboard_#{CDO.rack_env}__users".to_sym
      {}.tap do |projects|
        project_types.map do |type|
          projects[type] = PEGASUS_DB[:storage_apps].
            join(:user_storage_ids, id: :storage_id).
            join(users, id: :user_id).
            where(state: 'active', project_type: type).
            exclude(published_at: nil).
            order(Sequel.desc(:published_at)).
            limit(limit).
            offset(offset).
            map {|project| get_published_project_data project}
        end
      end
    end

    def get_published_project_data(project)
      project_value = project[:value] ? JSON.parse(project[:value]) : {}
      channel_id = storage_encrypt_channel_id(project[:storage_id], project[:id])
      {
        channel: channel_id,
        name: project_value['name'],
        thumbnailUrl: project_value['thumbnailUrl'],
        # Note that we are using the new :project_type field rather than extracting
        # it from :value. :project_type might not be present in unpublished projects.
        type: project[:project_type],
        publishedAt: project[:published_at],
        studentName: student_name(project),
        studentAge: student_age(project),
      }.with_indifferent_access
    end

    def student_age(project)
      ((Date.today - project[:birthday]) / 365).to_i
    end

    def student_name(project)
      project[:name] ? project[:name][0] : ''
    end
  end
end
