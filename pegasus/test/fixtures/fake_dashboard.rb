require 'active_support'
require 'active_record'
require 'sequel'

#
# Provides a fake Dashboard database with some fake data to test against.
#
module FakeDashboard
  DATABASE_FILENAME = './fake_dashboard_for_tests.db'
  @@fake_db = nil

  #
  # Fake Data: Users
  #
  UNUSED_USER_ID = 12345
  STUDENT = {id: 1, name: 'Sally Student', user_type: 'student', admin: false}
  TEACHER = {id: 2, name: 'Terry Teacher', user_type: 'teacher', admin: false}
  ADMIN = {id: 3, name: 'Alice Admin', user_type: 'teacher', admin: true}
  FACILITATOR = {id: 4, name: 'Fran Facilitator', user_type: 'teacher', admin: false}
  SELF_STUDENT = {
    id: 5, name: 'Self Studying Student', user_type: 'student', admin: false
  }
  UPDATED_STUDENT = {
    id: 6, name: 'Supdating Student', user_type: 'student', admin: false,
  }
  DELETED_STUDENT = {
    id: 7, name: 'Stricken Student', user_type: 'student', admin: false,
    deleted_at: '2016-01-01 12:34:56'
  }
  TEACHER_WITH_DELETED = {
    id: 8, name: 'Temporary Teacher', user_type: 'teacher', admin: false
  }
  TEACHER_WITH_UPDATED = {
    id: 9, name: 'Temporary Teacher', user_type: 'teacher', admin: false
  }
  USERS = [
    STUDENT, TEACHER, ADMIN, FACILITATOR, SELF_STUDENT, UPDATED_STUDENT,
    DELETED_STUDENT, TEACHER_WITH_DELETED, TEACHER_WITH_UPDATED
  ]

  #
  # Fake Data; User Permissions
  #
  USER_PERMISSIONS = [
      {user_id: FACILITATOR[:id], permission: 'facilitator'}
  ]
  # Possible permissions include
  #   create_professional_development_workshop
  #   district_contact
  #   facilitator

  #
  # Fake Data: Sections
  #
  TEACHER_SECTIONS = [
      {id: 150001, user_id: TEACHER[:id], name: 'Fake Section A'},
      {id: 150002, user_id: TEACHER[:id], name: 'Fake Section B'},
      {id: 150003, user_id: TEACHER_WITH_DELETED[:id], name: 'Fake Section C'},
      {id: 150004, user_id: TEACHER_WITH_UPDATED[:id], name: 'Fake Section D'},
  ]

  #
  # Fake Data: Followers
  #
  FOLLOWERS = [
      {user_id: TEACHER[:id], student_user_id: STUDENT[:id]},
      {user_id: TEACHER_WITH_DELETED[:id], student_user_id: STUDENT[:id]},
      {user_id: TEACHER_WITH_DELETED[:id], student_user_id: DELETED_STUDENT[:id]},
      {user_id: TEACHER_WITH_UPDATED[:id], student_user_id: STUDENT[:id]},
      {user_id: TEACHER_WITH_UPDATED[:id], student_user_id: UPDATED_STUDENT[:id]},
  ]

  # Overrides the current database with a procedure that, given a query,
  # will return results appropriate to our test suite.
  #
  # If you will be modifying the database in your test, you should isolate your
  # test with a transaction so the changes do not affect other tests (unfortuantely
  # we cannot make this automatic yet):
  #
  #   db.transaction(:rollback => :always) do
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

    FOLLOWERS.each do |follower|
      new_id = @@fake_db[:followers].insert(follower)
      follower.merge! @@fake_db[:followers][id: new_id]
    end

    TEACHER_SECTIONS.each do |section|
      new_id = @@fake_db[:sections].insert(section)
      section.merge! @@fake_db[:sections][id: new_id]
    end
  end

  # Remove the sqlite3 database file from the filesystem.
  # Should be called after all tests have run; possibly from a post-test task
  def self.destroy_fake_dashboard_db
    File.delete(DATABASE_FILENAME) if File.exist?(DATABASE_FILENAME)
  end
end
