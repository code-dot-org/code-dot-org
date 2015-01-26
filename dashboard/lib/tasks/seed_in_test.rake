namespace :db do
  namespace :test do
    task :prepare do
      require 'os'
      require 'cdo/rake_utils'

      def create_pegasus_db()
        db = URI.parse CDO.pegasus_db_writer
        command = [
                   'mysql',
                   "--user=#{db.user}",
                   "--host=#{db.host}",
                  ]
        command << "--execute=\"CREATE DATABASE IF NOT EXISTS pegasus_test\""
        command << "--password=#{db.password}" unless db.password.nil?
        system command.join(' ')
      end

      # tests depend on the pegasus database existing
      Dir.chdir(pegasus_dir) do
        create_pegasus_db
        system "rake db:migrate RACK_ENV=test"
      end

      Rake::Task["seed:all"].invoke
    end
  end
end
