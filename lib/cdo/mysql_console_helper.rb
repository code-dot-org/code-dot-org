module MysqlConsoleHelper
  def self.options(db)
    opts = %W(
      --user=#{db.user}
      --host=#{db.host}
    )
    database = db.path[1..-1]
    opts << "--database=#{database}" if database
    opts << "--port=#{db.port}" if db.port
    opts << "--password=#{db.password}" if db.password
    opts.join(' ')
  end

  def self.run(connection_uri, args)
    db = URI.parse connection_uri
    warning =
      "*****************************************************************\n"\
      "*** You are connecting to the master production database.     ***\n"\
      "*** Please connect to the reporting database instead via      ***\n"\
      "*** bin/dashboard-reporting-sql or bin/pegasus-reporting-sql. ***\n"\
      "*****************************************************************"
    puts warning if db.host.start_with?('production')

    mysql_command = "mysql #{options(db)}"
    mysql_command += " --execute=\"#{args}\"" unless args.empty?
    system(mysql_command)
  end
end
