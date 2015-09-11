require 'active_support'
require 'sequel'

#
# Provides a fake Dashboard database with some fake data to test against.
#
module FakeDashboard

  #
  # Fake Data: Users
  #
  STUDENT = {id: 14, name: 'Sally Student', user_type: 'student', admin: false, hidden: '0'}
  TEACHER = {id: 15, name: 'Terry Teacher', user_type: 'teacher', admin: false, hidden: '0'}
  ADMIN = {id: 16, name: 'Alice Admin', user_type: 'teacher', admin: true, hidden: '0'}
  FACILITATOR = {id: 17, name: 'Fran Facilitator', user_type: 'teacher', admin: false, hidden: '0'}
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
      {
          id: 150001,
          location: '/v2/sections/150001',
          name: 'Fake Section A',
          teachers: [{id: TEACHER[:id], location: "/v2/users/#{TEACHER[:id]}"}]
      },
      {
          id: 150002,
          location: '/v2/sections/150002',
          name: 'Fake Section B',
          teachers: [{id: TEACHER[:id], location: "/v2/users/#{TEACHER[:id]}"}]
      }]

  #
  # Fake Data: Followers
  #
  FOLLOWERS = [
      {user_id: TEACHER[:id], student_user_id: STUDENT[:id]}
  ]

  # Keys included in each student object returned by the /v2/students endpoint
  V2_STUDENTS_KEY_LIST = [:id, :name, :username, :email, :hashed_email, :gender,
                          :birthday, :prize_earned, :total_lines, :secret_words]

  # Overrides the current database with a procedure that, given a query,
  # will return results appropriate to our test suite.
  def self.use_fake_database
    # see http://www.rubydoc.info/github/jeremyevans/sequel/Sequel/Mock/Database
    fake_db = Sequel.connect 'mock://mysql'
    fake_db.server_version = 50616
    fake_db.fetch = Proc.new do |query|
      case query
        when /SELECT \* FROM `users` WHERE \(`id` = (\d+)\)/
          USERS.detect {|x| x[:id] == $1.to_i }

        when /SELECT \* FROM `users` WHERE \(\(`id` = (\d+)\) AND \(`admin` IS TRUE\)\)/
          USERS.detect {|x| x[:id] == $1.to_i and x[:admin] }

        when /SELECT \* FROM `user_permissions` WHERE \(\(`user_id` = (\d+)\) AND \(`permission` = '([^']*)'\)\)/
          USER_PERMISSIONS.find_all {|x| x[:user_id] == $1.to_i and x[:permission] == $2 }

        when /SELECT `id` FROM `sections` WHERE \(`user_id` = #{TEACHER[:id]}\)/
          TEACHER_SECTIONS.map { |section| section.slice(:id) }

        when %r{
              SELECT .* FROM.`followers`.
              WHERE.\(\(`student_user_id`.=.'(\d+)'\).
              AND.\(`user_id`.=.(\d+)\)
          }x then
          FOLLOWERS.find_all {|x| x[:student_user_id] == $1.to_i and x[:user_id] == $2.to_i }

        when %r{
              SELECT .* FROM.`users`.
              INNER.JOIN.`followers`.
              ON.\(`followers`.`student_user_id`.=.`users`.`id`\).
              WHERE .* `user_id`.=.(\d+)
          }x
          USERS.find_all do |user|
            FOLLOWERS.any? do |f|
              f[:student_user_id] == user[:id] and f[:user_id] == $1.to_i
            end
          end.map { |x| x.slice(*V2_STUDENTS_KEY_LIST) }

        when %r{
              SELECT .* FROM.`users`.
              LEFT.OUTER.JOIN.`secret_pictures`.
              ON.\(`secret_pictures`.`id`.=.`users`.`secret_picture_id`\).
              WHERE.\(`users`.`id`.=.'(\d+)'\)
          }x
          USERS.find_all {|x| x[:id] == $1.to_i }.
              map {|x| x.slice(*V2_STUDENTS_KEY_LIST) }

        else nil
      end
    end

    Dashboard.stubs(:db).returns(fake_db)
  end
end