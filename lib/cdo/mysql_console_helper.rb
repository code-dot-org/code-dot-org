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

    warning =
      "****************************************************************\n"\
      "*** You are connecting to the master production database.    ***\n"\
      "*** For simple queries, please use the reporting db instead. ***\n"\
      "*** e.g. bin/dashboard-replica-sql, bin/pegasus-replica-sql  ***\n"\
      "****************************************************************"
    puts warning if db.host.start_with?('production')

    system(command.join(' '))
  end
end
