module MysqlConsoleHelper
  def self.run(connection_uri, args)
    db = URI.parse connection_uri

    command = [
      'mysql',
      "--user=#{db.user}",
      "--host=#{db.host}",
      "--database=#{db.path[1..-1]}",
    ]
    command << "--port=#{db.port}" if db.port
    command << "--execute=\"#{args}\"" unless args.empty?
    command << "--password=#{db.password}" unless db.password.nil?

    warning =
      "*****************************************************************\n"\
      "*** You are connecting to the master production database.     ***\n"\
      "*** Please connect to the reporting database instead via      ***\n"\
      "*** bin/dashboard-reporting-sql or bin/pegasus-reporting-sql. ***\n"\
      "*****************************************************************"
    puts warning if db.host.start_with?('production')

    system(command.join(' '))
  end
end
