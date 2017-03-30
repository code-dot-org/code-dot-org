module ProjectsList
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
            project_row_data = get_project_row_data(student, project, channel_id)
            projects_list_data << project_row_data if project_row_data
          end
        end
      end
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
  end
end
