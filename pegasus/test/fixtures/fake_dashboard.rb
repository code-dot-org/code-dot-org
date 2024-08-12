require 'active_support'
require 'active_record'
require 'active_record/connection_adapters/mysql2_adapter'
require 'sequel'
require 'yaml'
require 'erb'

#
# Provides a fake Dashboard database with some fake data to test against.
#
module FakeDashboard
  # TODO(asher): Many of the CONSTANTS in this module are not constants, being mutated later. Fix
  # this.

  @@fake_db = nil

  #
  # Fake Data: Users
  #
  UNUSED_USER_ID = 12345
  STUDENT = {id: 1, name: 'Sally Student', user_type: 'student'}
  STUDENT_SELF = {id: 2, name: 'Self Studying Student', user_type: 'student'}
  STUDENT_DELETED = {
    id: 3, name: 'Stricken Student', user_type: 'student', deleted_at: '2016-01-01 12:34:56'
  }
  STUDENT_DELETED_FOLLOWER = {id: 4, name: 'S4 Student', user_type: 'student'}
  STUDENT_DELETED_SECTION = {id: 5, name: 'S5 Student', user_type: 'student'}
  TEACHER = {id: 6, name: 'Terry Teacher', user_type: 'teacher'}
  TEACHER_SELF = {id: 7, name: 'Troglodyte Teacher', user_type: 'teacher'}
  TEACHER_DELETED_SECTION = {id: 8, name: 'Temporary Teacher', user_type: 'teacher'}
  TEACHER_DELETED_FOLLOWER = {id: 9, name: 'Transient Teacher', user_type: 'teacher'}
  TEACHER_DELETED_USER = {id: 10, name: 'T Teacher', user_type: 'teacher'}
  ADMIN = {id: 11, name: 'Alice Admin', user_type: 'teacher', admin: true}
  FACILITATOR = {id: 12, name: 'Fran Facilitator', user_type: 'teacher'}
  USERS = [
    STUDENT,
    STUDENT_SELF,
    STUDENT_DELETED,
    STUDENT_DELETED_FOLLOWER,
    STUDENT_DELETED_SECTION,
    TEACHER,
    TEACHER_SELF,
    TEACHER_DELETED_SECTION,
    TEACHER_DELETED_FOLLOWER,
    TEACHER_DELETED_USER,
    ADMIN,
    FACILITATOR
  ]

  #
  # Fake Data; User Permissions
  #
  USER_PERMISSIONS = [
    {user_id: FACILITATOR[:id], permission: 'facilitator'}
  ]

  #
  # Fake Data: Sections
  #
  SECTION_NORMAL = {id: 150001, user_id: TEACHER[:id], name: 'Fake Section A'}
  SECTION_DELETED = {
    id: 150003, user_id: TEACHER_DELETED_SECTION[:id], name: 'Fake Section C',
    deleted_at: '2015-01-01 12:34:56'
  }
  SECTION_DELETED_FOLLOWER = {
    id: 150004, user_id: TEACHER_DELETED_FOLLOWER[:id], name: 'Fake Section D'
  }
  SECTION_DELETED_USER = {
    id: 150005, user_id: TEACHER_DELETED_USER[:id], name: 'Fake Section E'
  }
  TEACHER_SECTIONS = [
    SECTION_NORMAL,
    SECTION_DELETED,
    SECTION_DELETED_FOLLOWER,
    SECTION_DELETED_USER,
  ]

  #
  # Fake Data: Followers
  #
  FOLLOWERS = [
    {
      section_id: SECTION_NORMAL[:id],
      student_user_id: STUDENT[:id]
    },
    {
      section_id: SECTION_DELETED[:id],
      student_user_id: STUDENT_DELETED_SECTION[:id]
    },
    {
      section_id: SECTION_DELETED_FOLLOWER[:id],
      student_user_id: STUDENT_DELETED_FOLLOWER[:id],
      deleted_at: '2016-01-01 00:01:02'
    },
    {
      section_id: SECTION_DELETED_USER[:id],
      student_user_id: STUDENT_DELETED[:id]
    }
  ]

  #
  # Fake Data: Secret Words
  #
  SECRET_WORDS = [{word: 'abracadabra'}]

  # Fake-DB definition, map of table names to fixture-object arrays.
  FAKE_DB = {
    users: USERS,
    user_permissions: USER_PERMISSIONS,
    sections: TEACHER_SECTIONS,
    followers: FOLLOWERS,
    secret_words: SECRET_WORDS,
    user_scripts: []
  }

  # Patch Mysql2Adapter to only create the specified tables when loading the schema.
  module SchemaTableFilter
    def create_table(table_name, id: :primary_key, primary_key: nil, force: nil, **options)
      if (::FakeDashboard::FAKE_DB.keys.map(&:to_s) + [
        ActiveRecord::Base.schema_migrations_table_name,
        ActiveRecord::Base.internal_metadata_table_name,
      ]).include?(table_name)
        super
      end
    end
  end
  ActiveRecord::ConnectionAdapters::Mysql2Adapter.prepend SchemaTableFilter

  # Patch Mysql2Adapter to stub create_view when loading the schema.
  module SchemaViewFilter
    def create_view(name, **)
    end
  end
  ActiveRecord::ConnectionAdapters::Mysql2Adapter.prepend SchemaViewFilter

  # Patch Mysql2Adapter to create temporary tables instead of persistent ones.
  module TempTableFilter
    def create_table(table_name, id: :primary_key, primary_key: nil, force: nil, **options)
      super(table_name, id: id, primary_key: primary_key, force: force, temporary: true, **options)
    end

    # Required as of Rails 6.1, which changed `create_table` to no longer pass
    # along the `temporary` flag when dropping tables with `force`.
    # See: https://github.com/rails/rails/commit/c3ca9b00e3c5f839311c55549f25f7afe8120f9d
    def drop_table(table_name, **options)
      super(table_name, temporary: true, **options)
    end

    # Temporary tables may shadow persistent tables we don't want to drop.
    def data_source_exists?(_)
      false
    end

    # Temporary tables don't support foreign key indexes, so ignore them.
    def add_foreign_key(*_)
    end
  end
  ActiveRecord::ConnectionAdapters::Mysql2Adapter.prepend TempTableFilter

  # Overrides the current database with a procedure that, given a query,
  # will return results appropriate to our test suite.
  #
  # If you will be modifying the database in your test, you should isolate your
  # test with a transaction so the changes do not affect other tests (unfortuantely
  # we cannot make this automatic yet):
  #
  #   Dashboard.db.transaction(:rollback => :always) do
  #     ...test stuff here...
  #   end
  #
  # @returns [Sequel::Database] fake database handle
  def self.use_fake_database
    create_fake_dashboard_db if @@fake_db.nil?
    Dashboard.stubs(:db).returns(@@fake_db)
    @@fake_db
  end

  def self.stub_database
    Dashboard.stubs(:db)
  end

  # Lazy-creates temporary-tables using Dashboard's real ActiveRecord schema,
  # and populates them with some simple test data.
  # We might want to extract the test data to individual tests in the future,
  # or provide an explicit way to request certain test-data setups.
  def self.create_fake_dashboard_db
    # rubocop:disable Security/YAMLLoad
    database = YAML.load(ERB.new(File.new(dashboard_dir('config/database.yml')).read).result) || {}
    # rubocop:enable Security/YAMLLoad

    # Temporary tables aren't shared across multiple database connections.
    database['test']['primary']['pool'] = 1

    ActiveRecord::Base.configurations = database
    ActiveRecord::Base.establish_connection
    ActiveRecord::Schema.verbose = false
    # rubocop:disable CustomCops/DashboardRequires
    require_relative('../../../dashboard/db/schema')
    # rubocop:enable CustomCops/DashboardRequires

    # Reuse the same connection in Sequel to share access to the temporary tables.
    connection = ActiveRecord::Base.connection.instance_variable_get(:@connection)
    connection.query_options[:as] = :hash
    # Don't auto-close the connection, because the created temporary table is session-local.
    connection.automatic_close = false
    @@fake_db = Sequel.mysql2(test: false)
    @@fake_db.pool.available_connections.replace([connection])

    FAKE_DB.each do |key, value|
      value.each do |row|
        new_id = @@fake_db[key].insert(row)
        row.merge! @@fake_db[key][id: new_id]
      end
    end
  end
end
