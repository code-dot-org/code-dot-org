require 'active_support'
require 'sequel'

#
# Provides a fake Dashboard database with some fake data to test against.
#
module FakeDashboard

  #
  # Fake Data: Users
  #
  STUDENT = {id: 1, name: 'Sally Student', user_type: 'student', admin: false}
  TEACHER = {id: 2, name: 'Terry Teacher', user_type: 'teacher', admin: false}
  ADMIN = {id: 3, name: 'Alice Admin', user_type: 'teacher', admin: true}
  FACILITATOR = {id: 4, name: 'Fran Facilitator', user_type: 'teacher', admin: false}
  USERS = [STUDENT, TEACHER, ADMIN, FACILITATOR]

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
      {id: 150002, user_id: TEACHER[:id], name: 'Fake Section B'}
  ]

  #
  # Fake Data: Followers
  #
  FOLLOWERS = [
      {user_id: TEACHER[:id], student_user_id: STUDENT[:id]}
  ]

  # Overrides the current database with a procedure that, given a query,
  # will return results appropriate to our test suite.
  def self.use_fake_database
    fake_db = Sequel.sqlite

    fake_db.create_table :users do
      primary_key :id
      String :email
      String :encrypted_password
      String :reset_password_token
      DateTime :reset_password_sent_at
      DateTime :remember_created_at
      Integer :sign_in_count
      DateTime :current_sign_in_at
      DateTime :last_sign_in_at
      String :username
      Boolean :admin
      String :gender
      String :name
      Date :birthday
      String :user_type
      Integer :total_lines
      Integer :prize_earned
      Integer :secret_picture_id
      String :hashed_email
      String :secret_words
    end
    USERS.each do |user|
      new_id = fake_db[:users].insert(user)
      user.merge! fake_db[:users][id: new_id]
    end

    fake_db.create_table :user_permissions do
      primary_key :id
      Integer :user_id
      String :permission
    end
    USER_PERMISSIONS.each do |perm|
      new_id = fake_db[:user_permissions].insert(perm)
      perm.merge! fake_db[:user_permissions][id: new_id]
    end

    fake_db.create_table :followers do
      primary_key :id
      Integer :user_id
      Integer :student_user_id
      Integer :section_id
    end
    FOLLOWERS.each do |follower|
      new_id = fake_db[:followers].insert(follower)
      follower.merge! fake_db[:followers][id: new_id]
    end

    fake_db.create_table :sections do
      primary_key :id
      Integer :user_id
      String :name
      String :code
      Integer :script_id
      String :grade
      String :admin_code
      String :login_type
    end
    TEACHER_SECTIONS.each do |section|
      new_id = fake_db[:sections].insert(section)
      section.merge! fake_db[:sections][id: new_id]
    end

    fake_db.create_table :secret_pictures do
      primary_key :id
      String :name
      String :path
    end

    Dashboard.stubs(:db).returns(fake_db)
  end
end
