require 'active_support'
require 'active_record'
require 'sequel'

# Monkey-patch the SQLite connection adapter to ignore MySQL-specific schema creation statements.
module ActiveRecord
  module ConnectionAdapters
    module SQLite3
      class SchemaCreation < AbstractAdapter::SchemaCreation
        private

        def add_table_options!(create_sql, options)
          if (options_sql = options[:options])
            options_sql.gsub!(/ENGINE=\w+/, '')
            options_sql.gsub!(/DEFAULT CHARSET=\w+/, '')
            options_sql.gsub!(/COLLATE=\w+/, '')
            create_sql << " #{options_sql}"
          end
        end
      end
    end
  end
end

#
# Provides a fake Dashboard database with some fake data to test against.
#
module FakeDashboard
  # TODO(asher): Many of the CONSTANTS in this module are not constants, being mutated later. Fix
  # this.

  DATABASE_FILENAME = './fake_dashboard_for_tests.db'.freeze
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
  SECTION_EMPTY = {id: 150002, user_id: TEACHER[:id], name: 'Fake Section B'}
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
    SECTION_EMPTY,
    SECTION_DELETED,
    SECTION_DELETED_FOLLOWER,
    SECTION_DELETED_USER
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

  # Lazy-creates sqlite database using Dashboard's real ActiveRecord schema,
  # and populates it with some simple test data.
  # We might want to extract the test data to individual tests in the future,
  # or provide an explicit way to request certain test-data setups.
  def self.create_fake_dashboard_db
    @@fake_db = Sequel.sqlite(DATABASE_FILENAME)

    ActiveRecord::Migration.suppress_messages do
      ActiveRecord::Base.establish_connection(
        adapter: 'sqlite3',
        database: DATABASE_FILENAME
      )

      require_relative('../../../dashboard/db/schema')
    end

    USERS.each do |user|
      new_id = @@fake_db[:users].insert(user)
      user.merge! @@fake_db[:users][id: new_id]
    end

    USER_PERMISSIONS.each do |perm|
      new_id = @@fake_db[:user_permissions].insert(perm)
      perm.merge! @@fake_db[:user_permissions][id: new_id]
    end

    TEACHER_SECTIONS.each do |section|
      new_id = @@fake_db[:sections].insert(section)
      section.merge! @@fake_db[:sections][id: new_id]
    end

    FOLLOWERS.each do |follower|
      new_id = @@fake_db[:followers].insert(follower)
      follower.merge! @@fake_db[:followers][id: new_id]
    end
  end

  # Remove the sqlite3 database file from the filesystem.
  # Should be called after all tests have run; possibly from a post-test task
  def self.destroy_fake_dashboard_db
    File.delete(DATABASE_FILENAME) if File.exist?(DATABASE_FILENAME)
  end
end
