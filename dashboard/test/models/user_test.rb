# -*- coding: utf-8 -*-
require 'test_helper'

class UserTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @good_data = {
      email: 'foo@bar.com',
      password: 'foosbars',
      name: 'tester',
      user_type: User::TYPE_STUDENT,
      age: 28
    }
    @good_data_young = {
      email: 'foo@bar.com',
      password: 'foosbars',
      name: 'tester',
      user_type: User::TYPE_STUDENT,
      age: 8
    }

    @admin = create :admin
    @teacher = create :teacher
    @student = create :student
  end

  test 'make_teachers_21' do
    teacher = create :teacher, birthday: Time.now - 18.years
    assert_equal '21+', teacher.age
  end

  # Disable this test if and when we do require teachers to complete school data
  test 'school info should not be validated' do
    school_attributes = {
      country: 'US',
      school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC,
      state: nil
    }
    assert_creates(User) do
      create :teacher, school_info_attributes: school_attributes
    end
  end

  test 'ensure school info values are saved correctly when state and zip are passed in different ways' do
    # state and zip fields are usually passed as school_state and school_zip, but should
    # be accepted both ways when preprocessed
    school_attributes = {
      country: 'US',
      school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC,
      school_state: 'CA',
      school_zip: '94107'
    }
    teacher = create :teacher, school_info_attributes: school_attributes
    assert teacher.school_info.state == 'CA', teacher.school_info.state
    assert teacher.school_info.zip == 94107, teacher.school_info.zip

    school_attributes = {
      country: 'US',
      school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC,
      state: 'CA',
      zip: '94107'
    }
    teacher = create :teacher, school_info_attributes: school_attributes
    assert teacher.school_info.state == 'CA', teacher.school_info.state
    assert teacher.school_info.zip == 94107, teacher.school_info.zip
  end

  test 'identical school info should not be duplicated in the database' do
    school_attributes = {
      country: 'US',
      school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC,
      state: 'CA'
    }
    teachers = create_list(:teacher, 2, school_info_attributes: school_attributes)
    attr = teachers[0].process_school_info_attributes(school_attributes)
    school_info = SchoolInfo.where(attr).first
    assert teachers[0].school_info == school_info, "Teacher info: #{teachers[0].school_info.inspect} not equal to #{school_info.inspect}"
    assert teachers[1].school_info == school_info, "Teacher info: #{teachers[1].school_info.inspect} not equal to #{school_info.inspect}"
    assert SchoolInfo.where(attr).count == 1
  end

  test 'normalize_email' do
    teacher = create :teacher, email: 'CAPS@EXAMPLE.COM'
    assert_equal 'caps@example.com', teacher.email
  end

  test 'hash_email' do
    @teacher.update!(email: 'hash_email@example.com')
    assert_equal User.hash_email('hash_email@example.com'),
      @teacher.hashed_email
  end

  test "log in with password with pepper" do
    assert Devise.pepper

    user = User.create! @good_data

    # if password is already peppered we don't need to change the hashed pw
    assert_no_change('user.reload.encrypted_password') do
      assert user.valid_password?("foosbars")
      refute user.valid_password?("foosbarsasdasds")
    end
  end

  test "logging in with password created without pepper saves new password" do
    a_pepper = "x" * 30

    Devise.stubs(:pepper).returns(nil)

    # create the user without the pepper
    user = User.create! @good_data

    Devise.stubs(:pepper).returns(a_pepper)

    # update pw with new hashed pw
    assert_change('user.reload.encrypted_password') do
      assert user.valid_password?("foosbars")
      refute user.valid_password?("foosbarsasdasds")
    end

    # doesn't change second time
    assert_no_change('user.reload.encrypted_password') do
      assert user.valid_password?("foosbars")
      refute user.valid_password?("foosbarsasdasds")
    end
  end

  test "cannot create user with panda in name" do
    user = User.create(@good_data.merge({name: panda_panda}))
    refute user.valid?
    assert user.errors[:name].length == 1
  end

  test "cannot create user with panda in email" do
    user = User.create(@good_data.merge({email: "#{panda_panda}@panda.com"}))
    refute user.valid?
    assert user.errors[:email].length == 1
  end

  test "cannot create user with invalid email" do
    user = User.create(@good_data.merge({email: 'foo@bar@com'}))
    refute user.valid?
    assert user.errors[:email].length == 1
  end

  test "cannot create user with no type" do
    user = User.create(@good_data.merge(user_type: nil))
    refute user.valid?
    assert user.errors[:user_type].length == 1
  end

  test "cannot create user with no name" do
    user = User.create(@good_data.merge(name: nil))
    refute user.valid?
    assert user.errors[:name].length == 1
  end

  test "cannot create user with invalid type" do
    user = User.create(@good_data.merge(user_type: 'xxxxx'))
    refute user.valid?
    assert user.errors[:user_type].length == 1
  end

  test "cannot create user with duplicate email" do
    # actually create a user
    User.create!(@good_data)

    # Now create second user
    user = User.create(@good_data)
    assert_equal ['Email has already been taken'], user.errors.full_messages

    # Now create second user with duplicate email with different case
    user = User.create(@good_data.merge(email: @good_data[:email].upcase))
    assert_equal ['Email has already been taken'], user.errors.full_messages
  end

  test "cannot create young user with duplicate email" do
    # actually create a user
    User.create!(@good_data_young)

    # Now create second user
    user = User.create(@good_data_young.merge(hashed_email: User.hash_email(@good_data_young[:email])))
    assert_equal ['Email has already been taken'], user.errors.full_messages

    # Now create second user with duplicate username with different case
    user = User.create(@good_data_young.merge(hashed_email: User.hash_email(@good_data_young[:email].upcase)))
    assert_equal ['Email has already been taken'], user.errors.full_messages
  end

  test "can create a user with age" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      assert_creates(User) do
        user = User.create(@good_data.merge({age: '7', email: 'new@email.com'}))

        assert_equal Date.new(Date.today.year - 7, Date.today.month, Date.today.day), user.birthday
        assert_equal 7, user.age
      end
    end
  end

  test "can create a user with age 21+" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      assert_creates(User) do
        user = User.create(@good_data.merge({age: '21+', email: 'new@email.com'}))

        assert_equal Date.new(Date.today.year - 21, Date.today.month, Date.today.day), user.birthday
        assert_equal "21+", user.age
      end
    end
  end

  test "cannot create a user with age that's not a number" do
    assert_does_not_create(User) do
      user = User.create(@good_data.merge({age: 'old', email: 'new@email.com'}))
      assert_equal ["Age is not included in the list"], user.errors.full_messages
      # we don't care about this error message that much because users
      # should not be able to select -1 (they have a dropdown from
      # 4..100)
    end
  end

  test "cannot create a user with negative age" do
    assert_does_not_create(User) do
      user = User.create(@good_data.merge({age: -15, email: 'new@email.com'}))
      assert_equal ["Age is not included in the list"], user.errors.full_messages
      # we don't care about this error message that much because users
      # should not be able to select -1 (they have a dropdown from
      # 4..100)
    end
  end

  test "cannot create a user with too large age" do
    assert_does_not_create(User) do
      user = User.create(@good_data.merge({age: 15_000_000, email: 'new@email.com'}))
      assert_equal ["Age is not included in the list"], user.errors.full_messages
      # we don't care about this error message that much because users
      # should not be able to select -1 (they have a dropdown from
      # 4..100)
    end
  end

  test "can update a user with age" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      user = User.create(@good_data.merge({age: '7', email: 'new@email.com'}))
      assert_equal 7, user.age

      user.update_attributes(age: '9')
      assert_equal Date.new(Date.today.year - 9, Date.today.month, Date.today.day), user.birthday
      assert_equal 9, user.age
    end
  end

  test "can save a user with age" do
    user = create :user, age: 10

    user.update_attribute(:birthday, nil) # hacky

    user = User.find(user.id)

    user.age = 24
    assert_equal "21+", user.age

    user.save!
    user.reload
    assert_equal "21+", user.age
  end

  test "corrects age when saving a user with invalid age" do
    user = create :user, age: 10

    user.update_attribute(:birthday, Time.now - 1.month) # hacky

    user = User.find(user.id)

    user.age = 24
    assert_equal "21+", user.age

    user.save!
    user.reload
    assert_equal "21+", user.age
  end

  test "does not update birthday if age is the same" do
    user = User.create(@good_data.merge({age: '7', email: 'new@email.com'}))
    assert_equal 7, user.age

    Timecop.freeze(Date.today + 40) do
      assert_no_difference('user.reload.birthday') do
        user.update_attributes(age: '7')
      end
      assert_equal 7, user.age
    end
  end

  test "can create user without email" do
    assert_creates(User) do
      User.create!(user_type: User::TYPE_STUDENT, name: 'Student without email', password: 'xxxxxxxx', provider: 'manual', age: 12)
    end
  end

  test "cannot create self-managed user without email or hashed email" do
    assert_does_not_create(User) do
      User.create(user_type: User::TYPE_STUDENT, name: 'Student without email', password: 'xxxxxxxx', hashed_email: '', email: '', age: 12)
    end
  end

  test "cannot create teacher without email" do
    assert_does_not_create(User) do
      User.create(user_type: User::TYPE_TEACHER, name: 'Bad Teacher', password: 'xxxxxxxx', provider: 'manual')
    end
  end

  test "cannot make an account without email a teacher" do
    user = User.create(user_type: User::TYPE_STUDENT, name: 'Student without email', password: 'xxxxxxxx', provider: 'manual')

    user.user_type = User::TYPE_TEACHER
    refute user.save
  end

  test "cannot make a student admin" do
    student = create :student
    student.admin = true
    refute student.valid?
    refute student.save

    assert_raises(ActiveRecord::RecordInvalid) do
      assert_does_not_create(User) do
        create :student, admin: true
      end
    end
  end

  test "gallery" do
    user = create(:user)
    assert_equal [], user.gallery_activities

    assert_does_not_create(GalleryActivity) do
      create(:user_level, user: user)
    end

    ga2 = nil
    assert_creates(GalleryActivity) do
      user_level2 = create(:user_level, user: user)
      ga2 = GalleryActivity.create!(
        user: user,
        user_level: user_level2
      )
    end

    assert_does_not_create(GalleryActivity) do
      create(:user_level, user: user)
    end

    ga4 = nil
    assert_creates(GalleryActivity) do
      user_level4 = create(:user_level, user: user)
      ga4 = GalleryActivity.create!(
        user: user,
        user_level: user_level4
      )
    end

    assert_equal [ga4, ga2], user.reload.gallery_activities
  end

  test "short name" do
    assert_equal 'Laurel', create(:user, name: 'Laurel Fan').short_name # first name last name
    assert_equal 'Winnie', create(:user, name: 'Winnie the Pooh').short_name # middle name
    assert_equal "D'Andre", create(:user, name: "D'Andre Means").short_name # punctuation ok
    assert_equal '樊瑞', create(:user, name: '樊瑞').short_name # ok, this isn't actually right but ok for now
    assert_equal 'Laurel', create(:user, name: 'Laurel').short_name # just one name
    assert_equal 'some', create(:user, name: '  some whitespace in front  ').short_name # whitespace in front
  end

  test "initial" do
    assert_equal 'L', create(:user, name: 'Laurel Fan').initial # first name last name
    assert_equal 'W', create(:user, name: 'Winnie the Pooh').initial # middle name
    assert_equal "D", create(:user, name: "D'Andre Means").initial # punctuation ok
    assert_equal '樊', create(:user, name: '樊瑞').initial # ok, this isn't actually right but ok for now
    assert_equal 'L', create(:user, name: 'Laurel').initial # just one name
    assert_equal 'S', create(:user, name: '  some whitespace in front  ').initial # whitespace in front
  end

  test "find_for_authentication with nonsense" do
    # login by username still works
    user = create :user
    assert_equal user, User.find_for_authentication(login: user.username)

    # login by email still works
    email_user = create :user, email: 'not@an.email'
    assert_equal email_user, User.find_for_authentication(login: 'not@an.email')

    # login by hashed email
    hashed_email_user = create :user, age: 4
    assert_equal hashed_email_user,
      User.find_for_authentication(login: '', hashed_email: hashed_email_user.hashed_email)

    # wat you can't do that hax0rs
    assert_nil User.find_for_authentication(email: {'$acunetix' => 1})
    # this used to raise a mysql error, now we sanitize it into a nonsense string
  end

  test "creating manual provider user without username generates username" do
    user = User.create(@good_data.merge({provider: User::PROVIDER_MANUAL}))
    assert_equal 'tester', user.username
  end

  test 'can get next_unpassed_progression_level if not completed any unplugged levels' do
    user = create :user
    twenty_hour = Script.twenty_hour_script
    twenty_hour.script_levels.each do |script_level|
      next if script_level.level.game.unplugged? # skip all unplugged
      next if script_level.chapter > 33
      UserLevel.create(
        user: user,
        level: script_level.level,
        script: twenty_hour,
        attempts: 1,
        best_result: Activity::MINIMUM_PASS_RESULT
      )
    end
    assert_equal(35, user.next_unpassed_progression_level(twenty_hour).chapter)
  end

  test 'can get next_unpassed_progression_level, not tainted by other user progress' do
    user = create :user
    other_user = create :user
    twenty_hour = Script.twenty_hour_script
    twenty_hour.script_levels.each do |script_level|
      next if script_level.chapter > 33
      UserLevel.create(
        user: other_user,
        level: script_level.level,
        script: twenty_hour,
        attempts: 1,
        best_result: Activity::MINIMUM_PASS_RESULT
      )
    end
    assert_equal(2, user.next_unpassed_progression_level(twenty_hour).chapter)
  end

  test 'can get next_unpassed_progression_level when most recent level is not passed' do
    user = create :user
    twenty_hour = Script.twenty_hour_script

    twenty_hour.script_levels.each do |script_level|
      next if script_level.chapter != 3
      UserLevel.create(
        user: user,
        level: script_level.level,
        script: twenty_hour,
        attempts: 1,
        best_result: Activity::MINIMUM_FINISHED_RESULT
      )
    end

    # The level we most recently had progress on we did not pass, so that's
    # where we should go
    assert_equal(3, user.next_unpassed_progression_level(twenty_hour).chapter)
  end

  test 'can get next_unpassed_progression_level when most recent level is last level' do
    user = create :user
    twenty_hour = Script.twenty_hour_script

    script_level = twenty_hour.script_levels.last
    UserLevel.create(
      user: user,
      level: script_level.level,
      script: twenty_hour,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    # User's most recent progress is on last level in script. There's nothing
    # following it, so just return to the last level
    assert_equal(script_level.chapter, user.next_unpassed_progression_level(twenty_hour).chapter)
  end

  test 'can get next_unpassed_progression_level when most recent level is only followed by unplugged levels' do
    user = create :user
    script = create :script

    script_levels = [
      create(:script_level, script: script, levels: [create(:maze)]),
      create(:script_level, script: script, levels: [create(:maze)]),
      create(:script_level, script: script, levels: [create(:unplugged)]),
    ]
    create :user_script, user: user, script: script

    UserLevel.create(
      user: user,
      level: script_levels[1].level,
      script: script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    # User's most recent progress is on second last level of script, but none of
    # the levels after it are "progression" levels. Just return to the last level
    # we made progress on.
    assert_equal(2, user.next_unpassed_progression_level(script).chapter)
  end

  test 'can get next_unpassed_progression_level when most recent level not a progression level' do
    user = create :user
    script = create :script

    script_levels = [
      create(:script_level, script: script, levels: [create(:maze)]),
      create(:script_level, script: script, levels: [create(:unplugged)]),
      create(:script_level, script: script, levels: [create(:unplugged)]),
      create(:script_level, script: script, levels: [create(:maze)]),
    ]
    create :user_script, user: user, script: script

    UserLevel.create(
      user: user,
      level: script_levels[1].level,
      script: script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    # User's most recent progress is on unplugged level, that is followed by another
    # unplugged level. We should end up at the first non unplugged level
    assert_equal(4, user.next_unpassed_progression_level(script).chapter)
  end

  test 'can get next_unpassed_progression_level when we have no progress' do
    user = create :user
    script = create :script

    create(:script_level, script: script, levels: [create(:maze)])
    create(:script_level, script: script, levels: [create(:maze)])
    create :user_script, user: user, script: script

    # User's most recent progress is on unplugged level, that is followed by another
    # unplugged level. We should end up at the first non unplugged level
    assert_equal(1, user.next_unpassed_progression_level(script).chapter)
  end

  test 'script with inactive level completed is completed' do
    user = create :user
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    script = create :script
    script_level = create(
      :script_level,
      script: script,
      levels: [level, level2],
      properties: '{"maze 2": {"active": false}}'
    )
    create :user_script, user: user, script: script
    UserLevel.create(
      user: user, level: script_level.levels[1],
      script: script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    assert user.completed?(script)
  end

  test 'script with active level completed is completed' do
    user = create :user
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    script = create :script
    script_level = create(
      :script_level,
      script: script,
      levels: [level, level2],
      properties: '{"maze 2": {"active": false}}'
    )
    create :user_script, user: user, script: script
    UserLevel.create(
      user: user,
      level: script_level.levels[0],
      script: script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    assert user.completed?(script)
  end

  test 'user is created with secret picture and word' do
    user = create :user
    assert user.secret_picture
    assert user.secret_words
    assert user.secret_words !~ /SecretWord/ # using the actual word not the object to_s
  end

  test 'students have hashed email not plaintext email' do
    assert @student.email.blank?
    assert @student.hashed_email.present?
  end

  test 'teachers have hashed email and plaintext email' do
    assert @teacher.email.present?
    assert @teacher.hashed_email.present?
  end

  test 'cannot create duplicate hashed and plaintext email' do
    birthday_4 = Date.new(2010, 10, 4)
    birthday_20 = Date.new(1994, 10, 4)

    # create the younger user first
    email1 = 'email1@email.xx'
    create :user, birthday: birthday_4, email: email1

    assert_does_not_create(User) do
      # cannot create an older user with duplicate email
      user = User.create @good_data.merge(birthday: birthday_20, email: email1)
      assert_equal ['Email has already been taken'], user.errors.full_messages
    end

    assert_does_not_create(User) do
      # cannot create a younger user with duplicate email
      user = User.create @good_data.merge(birthday: birthday_4, email: email1)
      assert_equal ['Email has already been taken'], user.errors.full_messages
    end

    # create the older user first
    email2 = 'email2@email.xx'
    create :user, birthday: birthday_20, email: email2

    assert_does_not_create(User) do
      # cannot create an older user with duplicate email
      user = User.create @good_data.merge(birthday: birthday_20, email: email2)
      assert_equal ['Email has already been taken'], user.errors.full_messages
    end

    assert_does_not_create(User) do
      # cannot create a younger user with duplicate email
      user = User.create @good_data.merge(birthday: birthday_4, email: email2)
      assert_equal ['Email has already been taken'], user.errors.full_messages
    end

    assert_does_not_create(User) do
      # cannot create a younger user with duplicate email
      user = User.create @good_data.merge(birthday: birthday_4, email: '', hashed_email: Digest::MD5.hexdigest(email2))
      assert_equal ['Email has already been taken'], user.errors.full_messages
    end
  end

  test 'changing user from teacher to student removes email' do
    user = create :teacher
    assert user.email.present?
    assert user.hashed_email.present?

    user.user_type = User::TYPE_STUDENT
    user.save!

    assert user.email.blank?
    assert user.hashed_email.present?
  end

  test 'changing user from teacher to student removes school_info' do
    school_attributes = {
      country: 'US',
      school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC,
      state: nil
    }
    user = create :teacher, school_info_attributes: school_attributes
    assert user.school_info.present?

    user.user_type = User::TYPE_STUDENT
    user.save!

    refute user.school_info.present?
  end

  test 'changing user from teacher to student removes full_address' do
    user = create :teacher
    user.update!(full_address: 'fake address')

    user.user_type = User::TYPE_STUDENT
    user.save!

    assert user.full_address.nil?
  end

  test 'changing user from student to teacher saves email' do
    user = create :student, email: 'email@old.xx'

    assert user.email.blank?
    assert user.hashed_email

    user.update_attributes(user_type: User::TYPE_TEACHER, email: 'email@old.xx')
    user.save!

    assert_equal 'email@old.xx', user.email
    assert_equal '21+', user.age
  end

  test 'sanitize_race_data sanitizes closed_dialog' do
    @student.update!(races: %w(white closed_dialog))
    assert_equal %w(closed_dialog), @student.reload.races
  end

  test 'sanitize_race_data sanitizes too many races' do
    @student.reload.update!(races: %w(white black hispanic asian american_indian hawaiian))
    assert_equal %w(nonsense), @student.reload.races
  end

  test 'sanitize_race_data sanitizes non-races' do
    @student.update!(races: %w(not_a_race white))
    assert_equal %w(nonsense), @student.reload.races
  end

  test 'sanitize_race_data noops valid responses' do
    @student.update!(races: %w(black hispanic))
    assert_equal %w(black hispanic), @student.reload.races
  end

  test 'under 13' do
    user = create :user
    refute user.under_13?

    user.age = 13
    refute user.under_13?
    user.save!
    refute user.under_13?

    user.age = 10
    assert user.under_13?
    user.save!
    assert user.under_13?

    user = create :user
    user.update_attribute(:birthday, nil) # cheating...
    user = user.reload
    assert user.age.nil?
    assert user.under_13?
  end

  test "no send reset password for blank email" do
    error_user = User.send_reset_password_instructions(email: '')
    assert error_user.errors[:email]

    assert ActionMailer::Base.deliveries.empty?
  end

  test "no send reset password for empty email" do
    error_user = User.send_reset_password_instructions(email: nil)
    assert error_user.errors[:email]

    assert ActionMailer::Base.deliveries.empty?
  end

  test 'send reset password for student' do
    email = 'email@email.xx'
    student = create :student, password: 'oldone', email: email

    assert User.send_reset_password_instructions(email: email)

    mail = ActionMailer::Base.deliveries.first
    assert_equal [email], mail.to
    assert_equal 'Code.org reset password instructions', mail.subject
    student = User.find(student.id)
    old_password = student.encrypted_password

    assert mail.body.to_s =~ /reset_password_token=(.+)"/
    # HACK: Fix my syntax highlighting "
    token = $1

    User.reset_password_by_token(
      reset_password_token: token,
      password: 'newone',
      password_confirmation: 'newone'
    )

    student = User.find(student.id)
    # password was changed
    assert old_password != student.encrypted_password
  end

  test 'send reset password for student without age' do
    email = 'email@email.xx'
    student = create :student, age: 10, email: email

    student.update_attribute(:birthday, nil) # hacky

    student = User.find(student.id)
    refute student.age

    User.send_reset_password_instructions(email: email)

    mail = ActionMailer::Base.deliveries.first
    assert_equal [email], mail.to
    assert_equal 'Code.org reset password instructions', mail.subject
    student = student.reload
    refute student.age
    assert student.reset_password_token
  end

  test 'actually reset password for student without age' do
    email = 'email@email.xx'
    student = create :student, age: 10, email: email

    student.update_attribute(:birthday, nil) # hacky

    student = User.find(student.id)
    refute student.age

    old_password = student.encrypted_password

    student.reset_password('goodpassword', 'goodpassword')

    # changed password
    assert student.reload.encrypted_password != old_password
  end

  test 'user in_progress_and_completed_scripts does not include deleted scripts' do
    user = create :user
    real_script = Script.starwars_script
    fake_script = create :script

    user_script_1 = create :user_script, user: user, script: real_script
    user_script_2 = create :user_script, user: user, script: fake_script

    fake_script.destroy!

    # Preconditions for test: The script is gone, but the associated UserScript still exists.
    # If we start failing this setup assertion (that is, we do automated cleanup
    # when deleting a script) then we can probably delete this test.
    refute Script.exists?(fake_script.id), "Precondition for test: Expected Script #{fake_script.id} to be deleted."
    assert UserScript.exists?(user_script_2.id), "Precondition for test: Expected UserScript #{user_script_2.id} to still exist."

    # Test: We only get back the userscript for the script that still exists
    scripts = user.in_progress_and_completed_scripts
    assert_equal scripts.size, 1
    assert scripts.include?(user_script_1)
  end

  test 'user is working on script' do
    user = create :user
    s1 = create :user_script, user: user, started_at: (Time.now - 10.days), last_progress_at: (Time.now - 4.days)
    assert user.working_on?(s1.script)
  end

  test 'user is working on scripts' do
    user = create :user
    s1 = create :user_script, user: user, started_at: (Time.now - 10.days), last_progress_at: (Time.now - 4.days)
    s2 = create :user_script, user: user, started_at: (Time.now - 50.days), last_progress_at: (Time.now - 3.days)
    c = create :user_script, user: user, started_at: (Time.now - 10.days), completed_at: (Time.now - 8.days)

    # all scripts
    assert_equal [s2, s1, c], user.user_scripts
    assert_equal [s2.script, s1.script, c.script], user.scripts

    # working on scripts
    assert_equal [s2.script, s1.script], user.working_on_scripts
    # primary script -- most recently progressed in
    assert_equal s2.script, user.primary_script

    # add an assigned script that's more recent
    a = create :user_script, user: user, started_at: (Time.now - 1.day)
    assert_equal [a.script, s2.script, s1.script], user.working_on_scripts
    assert_equal a.script, user.primary_script

    # make progress on an older script
    s1.update_attribute(:last_progress_at, Time.now - 3.hours)
    assert_equal [s1.script, a.script, s2.script], user.working_on_scripts
    assert_equal s1.script, user.primary_script
  end

  test 'user has completed script' do
    user = create :user
    s1 = create :user_script, user: user, started_at: (Time.now - 10.days), completed_at: (Time.now - 4.days)
    assert user.completed?(s1.script)
  end

  test 'user has completed script but no completed_at' do
    # We have some users in our system who have completed all levels but don't have completed_at set.
    # This test exercises this case by not setting completed_at, but because the script has no levels there
    # is no next level for the user to go to, and so completed? succeeds using a fallback code path.

    user = create :user
    s1 = create :user_script, user: user, started_at: (Time.now - 10.days), last_progress_at: (Time.now - 4.days)

    assert s1.completed_at.nil?
    assert user.completed?(s1.script)
  end

  test 'user should prefer working on 20hour instead of hoc' do
    user = create :user

    twenty_hour = Script.twenty_hour_script
    hoc = Script.find_by(name: 'hourofcode')

    # do a level that is both in script 1 and hoc
    [twenty_hour, hoc].each do |script|
      UserScript.create! user: user, script: script
    end

    assert_equal [twenty_hour, hoc], user.working_on_scripts
  end

  def complete_script_for_user(user, script, completed_date = Time.now)
    # complete all except last level a day earlier
    script.script_levels[0..-2].each do |sl|
      UserLevel.create!(
        user_id: user.id,
        level_id: sl.level_id,
        script: script,
        best_result: 100,
        created_at: completed_date - 1.day,
        updated_at: completed_date - 1.day
      )
    end

    # completed last level
    sl = script.script_levels.last
    UserLevel.create!(
      user_id: user.id,
      level_id: sl.level_id,
      script: script,
      best_result: 100,
      created_at: completed_date,
      updated_at: completed_date
    )
  end

  test 'can_edit_password? is true for user with password' do
    assert @student.can_edit_password?
  end

  test 'can_edit_password? is false for user without password' do
    user = create :student
    user.update_attribute(:encrypted_password, '')
    refute user.can_edit_password?
  end

  test 'can_edit_email? is true for user with password' do
    assert @student.can_edit_email?
  end

  test 'can_edit_email? is false for user without password' do
    user = create :student
    user.update_attribute(:encrypted_password, '')
    refute user.can_edit_email?
  end

  test 'update_with_password does not require current password for users without passwords' do
    student = create(:student)
    student.update_attribute(:encrypted_password, '')

    assert student.encrypted_password.blank?

    name = "Some Student"
    assert student.update_with_password(
      name: name,
      email: "student@example.com",
      password: "[FILTERED]",
      password_confirmation: "[FILTERED]",
      current_password: "",
      locale: "en-US",
      gender: "",
      age: "10"
    )

    assert_equal name, student.name
  end

  test 'track_proficiency adds proficiency if necessary and no hint used' do
    level_concept_difficulty = create :level_concept_difficulty
    # Defaults with repeat_loops_{d1,d2,d3,d4,d5}_count = {0,2,0,3,0}.
    user_proficiency = create :user_proficiency

    User.track_proficiency(
      user_proficiency.user_id,
      nil,
      level_concept_difficulty.level_id
    )

    user_proficiency = UserProficiency.
      where(user_id: user_proficiency.user_id).
      first
    refute user_proficiency.nil?
    assert_equal 0, user_proficiency.repeat_loops_d1_count
    assert_equal 2 + 1, user_proficiency.repeat_loops_d2_count
    assert_equal 0, user_proficiency.repeat_loops_d3_count
    assert_equal 3, user_proficiency.repeat_loops_d4_count
    assert_equal 0, user_proficiency.repeat_loops_d5_count
  end

  test 'track_proficiency creates proficiency if necessary and no hint used' do
    level_concept_difficulty = create :level_concept_difficulty
    student = create :student

    User.track_proficiency(student.id, nil, level_concept_difficulty.level_id)

    user_proficiency = UserProficiency.where(user_id: student.id).first
    refute user_proficiency.nil?
    assert_equal 0, user_proficiency.repeat_loops_d1_count
    assert_equal 1, user_proficiency.repeat_loops_d2_count
    assert_equal 0, user_proficiency.repeat_loops_d3_count
    assert_equal 0, user_proficiency.repeat_loops_d4_count
    assert_equal 0, user_proficiency.repeat_loops_d5_count
  end

  test 'track_proficiency does not update basic_proficiency_at if already proficient' do
    TIME = '2015-01-02 03:45:43 UTC'
    level = create :level
    student = create :student
    level_concept_difficulty = LevelConceptDifficulty.
      create(level: level, events: 5)
    UserProficiency.create(
      user_id: student.id, sequencing_d3_count: 6, repeat_loops_d4_count: 7,
      events_d5_count: 8, basic_proficiency_at: TIME
    )

    User.track_proficiency(student.id, nil, level_concept_difficulty.level_id)

    user_proficiency = UserProficiency.where(user_id: student.id).first
    refute user_proficiency.nil?
    assert_equal TIME, user_proficiency.basic_proficiency_at.to_s
  end

  test 'track_proficiency updates if newly proficient' do
    level = create :level
    level_concept_difficulty = LevelConceptDifficulty.
      create(level_id: level.id, events: 5)
    student = create :student
    UserProficiency.create(
      user_id: student.id, sequencing_d3_count: 3, repeat_loops_d3_count: 3,
      events_d3_count: 2
    )

    User.track_proficiency(student.id, nil, level_concept_difficulty.level_id)

    user_proficiency = UserProficiency.where(user_id: student.id).first
    refute user_proficiency.nil?
    refute user_proficiency.basic_proficiency_at.nil?
  end

  test 'track_proficiency does not update basic_proficiency_at if not proficient' do
    level_concept_difficulty = create :level_concept_difficulty
    user_proficiency = create :user_proficiency

    User.track_proficiency(
      user_proficiency.user_id,
      nil,
      level_concept_difficulty.level_id
    )

    user_proficiency = UserProficiency.
      where(user_id: user_proficiency.user_id).
      first
    refute user_proficiency.nil?
    assert user_proficiency.basic_proficiency_at.nil?
  end

  def track_progress(user_id, script_level, result, pairings: nil)
    User.track_level_progress_sync(
      user_id: user_id,
      level_id: script_level.level_id,
      script_id: script_level.script_id,
      new_result: result,
      submitted: false,
      level_source_id: nil,
      pairing_user_ids: pairings
    )
  end

  test 'track_level_progress_sync calls track_proficiency if new perfect csf score' do
    user = create :user
    csf_script_level = Script.get_from_cache('20-hour').script_levels.third

    User.expects(:track_proficiency).once
    track_progress(user.id, csf_script_level, 100)
  end

  test 'track_level_progress_sync does not call track_proficiency if new perfect non-csf score' do
    user = create :user
    non_csf_script_level = create :script_level

    User.expects(:track_proficiency).never
    track_progress(user.id, non_csf_script_level, 100)
  end

  test 'track_level_progress_sync does not call track_proficiency if old perfect score' do
    user = create :user
    csf_script_level = Script.get_from_cache('20-hour').script_levels.third
    create :user_level,
      user_id: user.id,
      script_id: csf_script_level.script_id,
      level_id: csf_script_level.level_id,
      best_result: 100

    User.expects(:track_proficiency).never
    track_progress(user.id, csf_script_level, 100)
  end

  test 'track_level_progress_sync does not call track_proficiency if new passing csf score' do
    user = create :user
    csf_script_level = Script.get_from_cache('20-hour').script_levels.third

    User.expects(:track_proficiency).never
    track_progress(user.id, csf_script_level, 25)
  end

  test 'track_level_progress_sync does not call track_proficiency if hint used' do
    user = create :user
    csf_script_level = Script.get_from_cache('20-hour').script_levels.third
    create :hint_view_request,
      user_id: user.id,
      level_id: csf_script_level.level_id,
      script_id: csf_script_level.script_id

    User.expects(:track_proficiency).never
    track_progress(user.id, csf_script_level, 100)
  end

  test 'track_level_progress_sync does not call track_proficiency if authored hint used' do
    user = create :user
    csf_script_level = Script.get_from_cache('20-hour').script_levels.third
    AuthoredHintViewRequest.create(
      user_id: user.id,
      level_id: csf_script_level.level_id,
      script_id: csf_script_level.script_id
    )

    User.expects(:track_proficiency).never
    track_progress(user.id, csf_script_level, 100)
  end

  test 'track_level_progress_sync does not call track_proficiency when pairing' do
    user = create :user
    csf_script_level = Script.get_from_cache('20-hour').script_levels.third

    User.expects(:track_proficiency).never
    track_progress(user.id, csf_script_level, 100, pairings: [create(:user).id])
  end

  test 'track_level_progress_sync does call track_profiency when manual_pass to perfect' do
    user = create :user
    csf_script_level = Script.get_from_cache('20-hour').script_levels.third
    UserLevel.create!(
      user: user,
      level: csf_script_level.level,
      script: Script.get_from_cache('20-hour'),
      best_result: ActivityConstants::MANUAL_PASS_RESULT
    )

    User.expects(:track_proficiency).once
    track_progress(user.id, csf_script_level, 100)
  end

  test 'track_level_progress_sync does not overwrite the level_source_id of the navigator' do
    script_level = create :script_level
    student = create :student
    level_source = create :level_source, data: 'sample answer'

    User.track_level_progress_sync(
      user_id: student.id,
      level_id: script_level.level_id,
      script_id: script_level.script_id,
      new_result: 30,
      submitted: false,
      level_source_id: level_source.id,
      pairing_user_ids: nil
    )

    ul = UserLevel.find_by(user: student, script: script_level.script, level: script_level.level)
    assert_equal 30, ul.best_result
    assert_equal 'sample answer', ul.level_source.data

    User.track_level_progress_sync(
      user_id: create(:user).id,
      level_id: script_level.level_id,
      script_id: script_level.script_id,
      new_result: 100,
      submitted: false,
      level_source_id: level_source.id,
      pairing_user_ids: [student.id]
    )

    ul = UserLevel.find_by(user: student, script: script_level.script, level: script_level.level)
    assert_equal 100, ul.best_result
    assert_equal 'sample answer', ul.level_source.data
  end

  test 'track_level_progress_sync does not overwrite level_source_id with nil' do
    script_level = create :script_level
    user = create :user
    level_source = create :level_source, data: 'sample answer'
    create :user_level,
      user_id: user.id,
      script_id: script_level.script_id,
      level_id: script_level.level_id,
      level_source_id: level_source.id

    User.track_level_progress_sync(
      user_id: user.id,
      script_id: script_level.script_id,
      level_id: script_level.level_id,
      level_source_id: nil,
      new_result: 100,
      submitted: false
    )

    assert_equal level_source.id, UserLevel.find_by(
      user_id: user.id,
      script_id: script_level.script_id,
      level_id: script_level.level_id
    ).level_source_id
  end

  test 'normalize_gender' do
    assert_equal 'f', User.normalize_gender('f')
    assert_equal 'm', User.normalize_gender('m')

    assert_equal 'f', User.normalize_gender('F')
    assert_equal 'm', User.normalize_gender('M')

    assert_equal 'f', User.normalize_gender('Female')
    assert_equal 'm', User.normalize_gender('Male')

    assert_equal 'f', User.normalize_gender('female')
    assert_equal 'm', User.normalize_gender('male')

    assert_nil User.normalize_gender('some nonsense')
    assert_nil User.normalize_gender('')
    assert_nil User.normalize_gender(nil)
  end

  test 'can create user with same name as deleted user' do
    deleted_user = create(:user, name: 'Same Name')
    deleted_user.destroy

    create(:user, name: 'Same Name')
  end

  test 'email confirmation not required for teachers' do
    user = create :teacher, email: 'my_email@test.xx', confirmed_at: nil
    refute user.confirmation_required?
    refute user.confirmed_at
  end

  test 'email confirmation not required for students' do
    refute @student.confirmation_required?
  end

  test 'student and teacher relationships' do
    teacher = create :teacher
    student = create :student
    section = create :section, user_id: teacher.id

    follow = Follower.create!(section_id: section.id, student_user_id: student.id, user: teacher)

    teacher.reload
    student.reload

    assert_equal [follow], teacher.followers
    assert_equal [follow], student.followeds

    other_user = create :student

    # student_of? method
    refute student.student_of?(student)
    refute student.student_of?(other_user)
    assert student.student_of?(teacher)

    refute teacher.student_of?(student)
    refute teacher.student_of?(other_user)
    refute teacher.student_of?(teacher)

    refute other_user.student_of?(student)
    refute other_user.student_of?(other_user)
    refute other_user.student_of?(teacher)

    # user associations
    assert_equal [], other_user.teachers
    assert_equal [], other_user.students

    assert_equal [], teacher.teachers
    assert_equal [student], teacher.students

    assert_equal [teacher], student.teachers
    assert_equal [], student.students

    # section associations
    assert_equal [section], student.sections_as_student
    assert_equal [], teacher.sections_as_student
    assert_equal [], other_user.sections_as_student

    assert_equal [], student.sections
    assert_equal [section], teacher.sections
    assert_equal [], other_user.sections

    # can_pair? method
    assert_equal true, student.can_pair?
    assert_equal false, teacher.can_pair?
    assert_equal false, other_user.can_pair?

    # can_pair_with? method
    classmate = create :student
    section.add_student classmate, move_for_same_teacher: false
    assert classmate.can_pair_with?(student)
    assert student.can_pair_with?(classmate)
    refute student.can_pair_with?(other_user)
    refute student.can_pair_with?(teacher)
    refute teacher.can_pair_with?(student)
    refute student.can_pair_with?(student)
  end

  test "authorized teacher" do
    # you can't just create your own authorized teacher account
    assert @teacher.teacher?
    refute @teacher.authorized_teacher?

    # you have to be in a cohort
    c = create :cohort
    c.teachers << (real_teacher = create(:teacher))
    c.save!
    assert real_teacher.teacher?
    assert real_teacher.authorized_teacher?

    # or you have to be in a plc course
    create(:plc_user_course_enrollment, user: (plc_teacher = create :teacher), plc_course: create(:plc_course))
    assert plc_teacher.teacher?
    assert plc_teacher.authorized_teacher?

    # admins should be authorized teachers too
    assert @admin.teacher?
    assert @admin.authorized_teacher?
  end

  test "can_edit_account?" do
    # a student who only logs in with picture accounts cannot edit their account

    assert create(:student).can_edit_account?
    assert create(:student, age: 4).can_edit_account?
    assert create(:teacher).can_edit_account?

    picture_section = create(:section, login_type: Section::LOGIN_TYPE_PICTURE)
    word_section = create(:section, login_type: Section::LOGIN_TYPE_WORD)
    assert picture_section.user.can_edit_account? # this is teacher -- make sure we didn't do it the wrong way
    assert word_section.user.can_edit_account? # this is teacher -- make sure we didn't do it the wrong way

    student_without_password = create(:student, encrypted_password: '')

    # join picture section
    create(:follower, student_user: student_without_password, section: picture_section)
    student_without_password.reload
    refute student_without_password.can_edit_account? # only in a picture section

    # join word section
    create(:follower, student_user: student_without_password, section: word_section)
    student_without_password.reload
    assert student_without_password.can_edit_account? # also in a word section

    student_with_password = create(:student, encrypted_password: 'xxxxxx')

    # join picture section
    create(:follower, student_user: student_with_password, section: picture_section)
    student_with_password.reload
    assert student_with_password.can_edit_account? # only in a picture section

    # join word section
    create(:follower, student_user: student_with_password, section: word_section)
    student_with_password.reload
    assert student_with_password.can_edit_account? # also in a word section

    student_with_oauth = create(:student, encrypted_password: nil, provider: 'facebook', uid: '1111111')

    # join picture section
    create(:follower, student_user: student_with_oauth, section: picture_section)
    student_with_oauth.reload
    assert student_with_oauth.can_edit_account? # only in a picture section

    # join word section
    create(:follower, student_user: student_with_oauth, section: word_section)
    student_with_oauth.reload
    assert student_with_oauth.can_edit_account? # also in a word section
  end

  test 'terms_of_service_version for teacher without version' do
    assert_nil @teacher.terms_version
  end

  test 'terms_of_service_version for teacher with version' do
    teacher = create :teacher, terms_of_service_version: 1
    assert_equal 1, teacher.terms_version
  end

  test 'terms_of_service_version for student without teachers' do
    assert_nil @student.terms_version
  end

  test 'terms_of_service_version for student with teachers without version' do
    follower = create :follower
    assert_nil follower.student_user.terms_version
  end

  test 'terms_of_service_version for student with teachers with version' do
    follower = create :follower
    follower.user.update(terms_of_service_version: 1)
    another_teacher = create :teacher
    create :follower, user: another_teacher, student_user: follower.student_user
    assert_equal 1, follower.student_user.terms_version
  end

  test 'terms_of_service_version for students with deleted teachers' do
    follower = create :follower
    follower.user.update(terms_of_service_version: 1)
    follower.user.destroy
    assert_nil follower.student_user.terms_version
  end

  test 'permission? returns true when permission exists' do
    user = create :user
    UserPermission.create(
      user_id: user.id, permission: UserPermission::FACILITATOR
    )

    assert user.permission?(UserPermission::FACILITATOR)
  end

  test 'permission? returns false when permission does not exist' do
    user = create :user
    UserPermission.create(
      user_id: user.id, permission: UserPermission::FACILITATOR
    )

    refute user.permission?(UserPermission::LEVELBUILDER)
  end

  test 'permission? caches all permissions' do
    user = create :user
    UserPermission.create(
      user_id: user.id, permission: UserPermission::FACILITATOR
    )

    user.permission?(UserPermission::LEVELBUILDER)

    no_database

    assert user.permission?(UserPermission::FACILITATOR)
    refute user.permission?(UserPermission::LEVELBUILDER)
  end

  test 'should_see_inline_answer? returns true in levelbuilder' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    assert @student.should_see_inline_answer?(nil)
    assert @student.should_see_inline_answer?(create(:script_level))
  end

  test 'should_see_inline_answer? returns false for non teachers' do
    assert_not @student.should_see_inline_answer?(create(:script_level))
  end

  test 'should_see_inline_answer? returns true for authorized teachers in csp' do
    user = create :teacher
    create(:plc_user_course_enrollment, plc_course: (create :plc_course), user: user)
    assert user.should_see_inline_answer?((create :script_level))
  end

  test 'account_age_days should return days since account creation' do
    student = create :student, created_at: DateTime.now - 10
    assert student.account_age_days == 10
  end

  def mock_geocoder_result(result)
    mock_us_object = OpenStruct.new(country_code: result)
    Geocoder.stubs(:search).returns([mock_us_object])
  end

  test 'do not show race interstitial to teacher' do
    mock_geocoder_result('US')
    teacher = create :teacher, created_at: DateTime.now - 8
    refute teacher.show_race_interstitial?('ignored_ip')
  end

  test 'do not show race interstitial to user accounts under 13' do
    mock_geocoder_result('US')
    student = User.create(@good_data_young)
    student.created_at = DateTime.now - 8
    refute student.show_race_interstitial?('ignored_ip')
  end

  test 'do not show race interstitial to user accounts less than one week old' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 3
    refute student.show_race_interstitial?('ignored_ip')
  end

  test 'do not show race interstitial to user accounts that have already entered race information' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 8
    student.races = %w(white black)
    refute student.show_race_interstitial?('ignored_ip')
  end

  test 'do not show race interstitial to user accounts that have closed the dialog already' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 8
    student.races = %w(closed_dialog)
    refute student.show_race_interstitial?('ignored_ip')
  end

  test 'do not show race interstitial if IP address is nil' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 8
    mock_ip = nil
    refute RaceInterstitialHelper.show_race_interstitial?(student, mock_ip)
  end

  test 'do not show race interstitial to non-US users' do
    mock_geocoder_result('CA')
    student = create :student, created_at: DateTime.now - 8
    unused_ip = 'ignored'
    refute RaceInterstitialHelper.show_race_interstitial?(student, unused_ip)
  end

  test 'show race interstitial to US users' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 8
    unused_ip = 'ignored'
    assert RaceInterstitialHelper.show_race_interstitial?(student, unused_ip)
  end

  test 'show race interstitial for student over 13 with account more than 1 week old' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 8
    assert student.show_race_interstitial?('ignored_ip')
  end

  test 'new users must have valid email addresses' do
    assert_creates User do
      create :user, email: 'valid@example.net'
    end

    e = assert_raises ActiveRecord::RecordInvalid do
      create :user, email: 'invalid@incomplete'
    end
    assert_equal 'Validation failed: Email does not appear to be a valid e-mail address', e.message
  end

  test 'existing users with invalid email addresses are still allowed' do
    user_with_invalid_email = build :user, email: 'invalid@incomplete'
    user_with_invalid_email.save!(validate: false)

    assert user_with_invalid_email.valid?

    # Update another field
    user_with_invalid_email.name = 'updated name'
    assert user_with_invalid_email.valid?
    assert user_with_invalid_email.save
  end

  test 'users updating the email field must provide a valid email address' do
    user = create :user

    user.email = 'invalid@incomplete'
    refute user.valid?
    refute user.save

    assert user.update(email: 'valid@example.net')
    refute user.update(email: 'invalid@incomplete')
  end

  test 'find_or_create_teacher creates new teacher' do
    params = {
      email: 'email@example.net',
      name: 'test user'
    }

    user = assert_creates(User) do
      User.find_or_create_teacher params, @admin
    end
    assert user.teacher?
    assert_equal @admin, user.invited_by
  end

  test 'find_or_create_teacher finds existing teacher' do
    teacher = create :teacher

    params = {
      email: teacher.email,
      name: teacher.name
    }

    found = assert_does_not_create(User) do
      User.find_or_create_teacher params, @admin
    end
    assert_equal teacher, found
  end

  test 'find_or_create_teacher with an invalid email raises ArgumentError' do
    params = {
      email: 'invalid',
      name: 'test user'
    }

    e = assert_raises ArgumentError do
      User.find_or_create_teacher params, @admin
    end
    assert_equal "'invalid' does not appear to be a valid e-mail address", e.message
  end

  test 'deleting teacher deletes dependent sections and followers' do
    follower = create :follower
    teacher = follower.user
    section = follower.section
    student = follower.student_user

    teacher.destroy

    assert teacher.reload.deleted?
    assert section.reload.deleted?
    assert follower.reload.deleted?
    refute student.reload.deleted?
  end

  test 'deleting student deletes dependent followers' do
    follower = create :follower
    teacher = follower.user
    section = follower.section
    student = follower.student_user

    student.destroy

    refute teacher.reload.deleted?
    refute section.reload.deleted?
    assert follower.reload.deleted?
    assert student.reload.deleted?
  end
end
