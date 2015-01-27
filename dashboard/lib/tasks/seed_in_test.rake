namespace :db do
  namespace :test do
    task :setup_pegasus_db do
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
        p DB
        p 'start pegasus db:migrate'
        system "rake -t db:migrate RACK_ENV=test"
        p 'end pegasus db:migrate'
      end
    end

    task :prepare do
      Rake::Task["db:test:setup_pegasus_db"].invoke
      Rake::Task["seed:all"].invoke
    end
  end
end
