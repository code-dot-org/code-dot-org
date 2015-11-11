module MysqlConsoleHelper
  def self.run(connection_uri, args)
    db = URI.parse connection_uri

    command = [
               'mysql',
               "--user=#{db.user}",
               "--host=#{db.host}",
               "--database=#{db.path[1..-1]}",
              ]
    command << "--execute=\"#{args}\"" unless args.empty?
    command << "--password=#{db.password}" unless db.password.nil?

    system(command.join(' '))
  end
end
