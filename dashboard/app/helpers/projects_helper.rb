module ProjectsHelper
  # Projects can be created via Sequel/Sinatra (projects.rb) or Rails (project.rb),
  # depending on where they've been created. For example, real user projects are often created
  # in Sinatra, but test projects are often created via Rails. The following two methods are
  # helper methods to simplify finding projects elsewhere in the code.
  def self.find_by_id(id)
    Projects.table.where(id: id).first || Project.find_by(id: id)
  end

  def self.find_by_uuid(uuid)
    Projects.table.where(uuid: uuid).first || Project.find_by(uuid: uuid)
  end
end
