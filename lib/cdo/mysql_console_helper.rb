module MysqlConsoleHelper
  def self.options(db)
    opts = %W(
      --user=#{db.user}
      --host=#{db.host}
    )
    database = db.path[1..]
    opts << "--database=#{database}" if database
    opts << "--port=#{db.port}" if db.port
    opts << "--password=#{db.password}" if db.password
    opts.join(' ')
  end

  def self.run(db, args, warn: true)
    db = URI.parse(db) unless db.is_a?(URI)
    warning =
      "*****************************************************************\n"\
      "*** You are connecting to the production writer database.     ***\n"\
      "*** Please connect to the reporting database instead via      ***\n"\
      "*** bin/dashboard-reporting-sql or bin/pegasus-reporting-sql. ***\n"\
      "*****************************************************************"
    puts warning if warn && (db.host == CDO.db_writer_endpoint) && rack_env?(:production)

    mysql_command = "mysql #{options(db)}"
    mysql_command += " --execute=\"#{args}\"" unless args.empty?
    system(mysql_command)
  end
end
