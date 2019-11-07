include ProjectsList
module LibrariesList
  class << self
    def fetch_all_section_projects(user)
      sections = user.sections + user.sections_as_student
      projects = []
      sections.each do |section|
        projects += ProjectsList.fetch_section_projects(section).select {|project| !project[:libraryName].nil}
      end
      projects.map! do |project|
        project[:description] = project[:libraryDescription]
        project[:name] = project[:libraryName]
        project
      end
    end
  end
end
