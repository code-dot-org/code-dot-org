# -*- coding: utf-8 -*-
require 'test_helper'
require 'timecop'

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
    @user = create :user
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
    assert_equal teachers[0].school_info, teachers[1].school_info
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

  test "cannot build user with panda in name" do
    user = build :user, name: panda_panda
    refute user.valid?
    assert user.errors[:name].length == 1
  end

  test "cannot build user with panda in email" do
    user = build :user, email: "#{panda_panda}@panda.org"
    refute user.valid?
    assert user.errors[:email].length == 1
  end

  test "cannot build user with invalid email" do
    user = build :user, email: 'foo@bar@com'
    refute user.valid?
    assert user.errors[:email].length == 1
  end

  test "cannot build user with no type" do
    user = build :user, user_type: nil
    refute user.valid?
    assert user.errors[:user_type].length == 1
  end

  test "cannot build user with no name" do
    user = build :user, name: nil
    refute user.valid?
    assert user.errors[:name].length == 1
  end

  test "cannot build user with invalid type" do
    user = build :user, user_type: 'invalid_type'
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
    student = build :student
    student.admin = true
    refute student.valid?

    assert_raises(ActiveRecord::RecordInvalid) do
      assert_does_not_create(User) do
        create :student, admin: true
      end
    end
  end

  test 'cannot make a teacher with followeds an admin' do
    follower = create :follower, student_user: (create :teacher)
    assert_raises(ActiveRecord::RecordInvalid) do
      follower.student_user.update!(admin: true)
    end
    refute follower.student_user.reload.admin?
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
    assert_equal 'Laurel', build(:user, name: 'Laurel Fan').short_name # first name last name
    assert_equal 'Winnie', build(:user, name: 'Winnie the Pooh').short_name # middle name
    assert_equal "D'Andre", build(:user, name: "D'Andre Means").short_name # punctuation ok
    assert_equal '樊瑞', build(:user, name: '樊瑞').short_name # ok, this isn't actually right but ok for now
    assert_equal 'Laurel', build(:user, name: 'Laurel').short_name # just one name
    assert_equal 'some', build(:user, name: '  some whitespace in front  ').short_name # whitespace in front
  end

  test "initial" do
    assert_equal 'L', build(:user, name: 'Laurel Fan').initial # first name last name
    assert_equal 'W', build(:user, name: 'Winnie the Pooh').initial # middle name
    assert_equal "D", build(:user, name: "D'Andre Means").initial # punctuation ok
    assert_equal '樊', build(:user, name: '樊瑞').initial # ok, this isn't actually right but ok for now
    assert_equal 'L', build(:user, name: 'Laurel').initial # just one name
    assert_equal 'S', build(:user, name: '  some whitespace in front  ').initial # whitespace in front
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

  test 'can get next_unpassed_progression_level when last updated user_level is inside a level group' do
    user = create :user
    script = create :script

    sub_level1 = create :text_match, name: 'sublevel1'
    create :text_match, name: 'sublevel2'

    level_group = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level_group.properties['pages'] = [{levels: ['level_multi1', 'level_multi2']}]

    create(:script_level, script: script, levels: [level_group])
    create :user_script, user: user, script: script

    # Create a UserLevel for our level_group and sublevel, the sublevel is more recent
    user_level1 = UserLevel.create(
      user: user,
      level: level_group,
      script: script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT,
      updated_at: Time.now - 1
    )

    user_level2 = UserLevel.create(
      user: user,
      level: sub_level1,
      script: script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT,
      updated_at: Time.now
    )

    assert(user_level1.updated_at < user_level2.updated_at)

    next_script_level = user.next_unpassed_progression_level(script)
    refute next_script_level.nil?
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
      properties: {'maze 2': {'active': false}}
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
      properties: {'maze 2': {'active': false}}
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
    assert @user.secret_picture
    assert @user.secret_words
    assert @user.secret_words !~ /SecretWord/ # using the actual word not the object to_s
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
      user = User.create @good_data.merge(birthday: birthday_4, email: '', hashed_email: User.hash_email(email2))
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

  test 'changing oauth user from student to teacher with same email is allowed' do
    user = create :google_oauth2_student, email: 'email@new.xx'

    assert user.provider == 'google_oauth2'

    user.update!(
      user_type: User::TYPE_TEACHER,
      email: 'email@new.xx',
      hashed_email: User.hash_email('email@new.xx')
    )
    assert_equal 'email@new.xx', user.email
    assert_equal User::TYPE_TEACHER, user.user_type
  end

  test 'changing oauth user from student to teacher with different email is not allowed' do
    user = create :google_oauth2_student

    assert user.provider == 'google_oauth2'

    user.update_attributes(
      user_type: User::TYPE_TEACHER,
      email: 'email@new.xx',
      hashed_email: User.hash_email('email@new.xx')
    )
    assert !user.save
    assert_equal user.errors[:base].first, "The email address you provided doesn't match the email address for this account"
    user.reload
    assert_not_equal 'email@new.xx', user.email
  end

  test 'changing from student to teacher clears terms_of_service_version' do
    user = create :student, terms_of_service_version: 1
    user.update!(user_type: User::TYPE_TEACHER, email: 'tos@example.com')
    assert_nil user.terms_of_service_version
  end

  test 'changing from student to teacher creates StudioPerson' do
    user = assert_does_not_create(StudioPerson) do
      create :student
    end

    assert_creates(StudioPerson) do
      user.update!(user_type: User::TYPE_TEACHER, email: 'fakeemail@example.com')
    end
    assert user.studio_person
    assert_equal 'fakeemail@example.com', user.studio_person.emails
  end

  test 'changing from teacher to student destroys StudioPerson' do
    user = create :teacher

    assert_destroys(StudioPerson) do
      user.update!(user_type: User::TYPE_STUDENT)
    end
    assert_nil user.reload.studio_person
  end

  test 'changing from teacher to student does not clear terms_of_service_version' do
    user = create :teacher, terms_of_service_version: 1
    user.update!(user_type: User::TYPE_STUDENT)
    assert_equal 1, user.terms_of_service_version
  end

  test 'creating user with terms_of_service_version stores terms_of_service_version' do
    user = create :teacher, terms_of_service_version: 1
    assert_equal 1, user.terms_of_service_version
  end

  test 'sanitize_race_data sanitizes closed_dialog' do
    @student.update!(races: 'white,closed_dialog')
    @student.reload
    assert_equal 'closed_dialog', @student.races
    assert_nil @student.urm
  end

  test 'sanitize_race_data sanitizes too many races' do
    # TODO(asher): Determine why this test fails when using @student, fixing appropriately.
    student = build :student
    student.update!(races: 'american_indian,asian,black,hawaiian,hispanic,white')
    student.reload
    assert_equal 'nonsense', student.races
    assert_nil student.urm
  end

  test 'sanitize_race_data sanitizes non-races' do
    @student.update!(races: 'not_a_race,white')
    @student.reload
    assert_equal 'nonsense', @student.races
    assert_nil @student.urm
  end

  test 'sanitize_race_data noops valid responses' do
    @student.update!(races: 'black,hispanic')
    @student.reload
    assert_equal 'black,hispanic', @student.races
    assert @student.urm
  end

  test 'urm_from_races with nil' do
    @student.update!(races: nil)
    assert_nil @student.urm_from_races
  end

  test 'urm_from_races with empty string' do
    @student.update!(races: '')
    assert_nil @student.urm_from_races
  end

  test 'urm_from_races with non-answer responses' do
    %w(opt_out nonsense closed_dialog).each do |response|
      @student.update!(races: response)
      assert_nil @student.urm_from_races
    end
  end

  test 'urm_from_races with urm responses' do
    ['white,black', 'hispanic,hawaiian', 'american_indian'].each do |response|
      @student.update!(races: response)
      assert @student.urm_from_races
    end
  end

  test 'urm_from_races with non-urm response' do
    ['white', 'white,asian', 'asian'].each do |response|
      @student.update!(races: response)
      refute @student.urm_from_races
    end
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

  test 'provides helpful error on bad email address' do
    # Though validation now exists to prevent grossly malformed emails, such was not always the
    # case. Consequently, we must bypass validation to create the state of such an account.
    user = create :user
    user.email = 'bounce@xyz'
    user.save(validate: false)

    error_user = User.send_reset_password_instructions(email: 'bounce@xyz')

    assert error_user.errors[:base]
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

    assert mail.body.to_s =~ /Change my password/

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

  test 'send reset password to parent for student without email address' do
    parent_email = 'parent_reset_email@email.xx'
    student = create :student, password: 'oldone', email: nil, parent_email: parent_email

    assert User.send_reset_password_instructions(email: parent_email)

    mail = ActionMailer::Base.deliveries.first
    assert_equal [parent_email], mail.to
    assert_equal 'Code.org reset password instructions', mail.subject
    student = User.find(student.id)
    old_password = student.encrypted_password

    assert mail.body.to_s =~ /Change password for/

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

  test 'teacher_managed_account? is false for teacher' do
    refute @teacher.teacher_managed_account?
  end

  test 'teacher_managed_account? is false for normal student account with hashed email and password' do
    refute @student.teacher_managed_account?
  end

  test 'teacher_managed_account? is false for student account in section with oauth connection' do
    student_with_oauth = create(:student, encrypted_password: nil, provider: 'facebook', uid: '1111111')

    # join picture section
    picture_section = create(:section, login_type: Section::LOGIN_TYPE_PICTURE)
    create(:follower, student_user: student_with_oauth, section: picture_section)
    student_with_oauth.reload
    refute student_with_oauth.teacher_managed_account?
  end

  test 'teacher_managed_account? is true for user account with password but no e-mail' do
    # These types of accounts happen when teachers created username/password accounts
    # without e-mails for students (this is no longer allowed)
    student_with_password_no_email = create(
      :student,
      encrypted_password: '123456',
      email: '',
      hashed_email: nil,
      provider: 'manual'
    )
    assert student_with_password_no_email.teacher_managed_account?
  end

  test 'teacher_managed_account? is true for users in picture or word sections without passwords' do
    picture_section = create(:section, login_type: Section::LOGIN_TYPE_PICTURE)
    word_section = create(:section, login_type: Section::LOGIN_TYPE_WORD)

    [picture_section, word_section].each do |section|
      student_without_password = create(:student, encrypted_password: '')
      create(:follower, student_user: student_without_password, section: section)
      student_without_password.reload
      assert student_without_password.teacher_managed_account?
    end
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

  test 'track_level_progress_sync stops incrementing attempts for perfect results' do
    user = create :user
    csf_script_level = Script.get_from_cache('20-hour').script_levels.third
    ul = UserLevel.create!(
      user: user,
      level: csf_script_level.level,
      script: Script.get_from_cache('20-hour'),
      best_result: ActivityConstants::MINIMUM_FINISHED_RESULT
    )

    track_progress(user.id, csf_script_level, 10)
    track_progress(user.id, csf_script_level, 20)
    track_progress(user.id, csf_script_level, 30)

    assert_equal 3, ul.reload.attempts

    track_progress(user.id, csf_script_level, 31)

    assert_equal 4, ul.reload.attempts

    track_progress(user.id, csf_script_level, 31)
    track_progress(user.id, csf_script_level, 31)
    track_progress(user.id, csf_script_level, 100)
    track_progress(user.id, csf_script_level, 101)

    assert_equal 4, ul.reload.attempts
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
    create(:user, :deleted, name: 'Same Name')
    assert_creates(User) do
      create(:user, name: 'Same Name')
    end
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
    section.add_student classmate
    assert classmate.can_pair_with?(student)
    assert student.can_pair_with?(classmate)
    refute student.can_pair_with?(other_user)
    refute student.can_pair_with?(teacher)
    refute teacher.can_pair_with?(student)
    refute student.can_pair_with?(student)

    # disable pair programming
    section.update!(pairing_allowed: false)
    student.reload
    refute student.can_pair?
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

  test 'terms_of_service_version for teacher without version' do
    assert_nil @teacher.terms_version
  end

  test 'terms_of_service_version for teacher with version' do
    teacher = build :teacher, terms_of_service_version: 1
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
    teacher = create :teacher, :deleted, terms_of_service_version: 1
    follower = create :follower, user: teacher
    assert_nil follower.student_user.terms_version
  end

  test 'permission? returns true when permission exists' do
    user = create :facilitator
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
    user = create :facilitator
    user.permission?(UserPermission::LEVELBUILDER)

    no_database

    assert user.permission?(UserPermission::FACILITATOR)
    refute user.permission?(UserPermission::LEVELBUILDER)
  end

  test 'revoke_all_permissions revokes admin status' do
    admin_user = create :admin
    admin_user.revoke_all_permissions
    assert_nil admin_user.reload.admin
  end

  test 'revoke_all_permissions revokes user permissions' do
    teacher = create :teacher
    teacher.permission = UserPermission::FACILITATOR
    teacher.permission = UserPermission::LEVELBUILDER
    teacher.revoke_all_permissions
    assert_equal [], teacher.reload.permissions
  end

  test 'grant admin permission logs to infrasecurity' do
    teacher = create :teacher

    User.stubs(:should_log?).returns(true)
    ChatClient.
      expects(:message).
      with('infra-security',
        "Granting UserPermission: environment: #{rack_env}, "\
        "user ID: #{teacher.id}, "\
        "email: #{teacher.email}, "\
        "permission: ADMIN",
        color: 'yellow'
      ).
      returns(true)

    teacher.update(admin: true)
  end

  test 'revoke admin permission logs to infrasecurity' do
    admin_user = create :admin

    User.stubs(:should_log?).returns(true)
    ChatClient.
      expects(:message).
      with('infra-security',
        "Revoking UserPermission: environment: #{rack_env}, "\
        "user ID: #{admin_user.id}, "\
        "email: #{admin_user.email}, "\
        "permission: ADMIN",
        color: 'yellow'
      ).
      returns(true)

    admin_user.update(admin: nil)
  end

  test 'new admin users log admin permission' do
    User.stubs(:should_log?).returns(true)
    ChatClient.expects(:message)
    create :admin
  end

  test 'new non-admin users do not log admin permission' do
    User.stubs(:should_log?).returns(true)
    ChatClient.expects(:message).never
    create :teacher
  end

  test 'admin_changed? equates nil and false' do
    # admins must be teacher
    teacher = create :teacher

    # Each row is a test consisting of 3 values in order:
    #   from - the initial state of the admin attribute
    #   to - the new local state to be assigned
    #   result - the expected admin_changed? after assigning to
    matrix = [
      [nil, nil, false],
      [nil, false, false],
      [nil, true, true],
      [false, nil, false],
      [false, false, false],
      [false, true, true],
      [true, nil, true],
      [true, false, true],
      [true, true, false]
    ]

    matrix.each do |from, to, result|
      teacher.update!(admin: from)
      teacher.admin = to
      assert_equal result, teacher.admin_changed?
    end
  end

  test 'grant admin permission does not log in test environment' do
    ChatClient.expects(:message).never
    create :admin
  end

  test 'assign_course_as_facilitator assigns course to facilitator' do
    facilitator = create :facilitator
    assert_creates Pd::CourseFacilitator do
      facilitator.course_as_facilitator = Pd::Workshop::COURSE_CS_IN_A
    end
    assert facilitator.courses_as_facilitator.exists?(course: Pd::Workshop::COURSE_CS_IN_A)
  end

  test 'assign_course_as_facilitator to facilitator that already has course does not create facilitator_course' do
    facilitator = create(:pd_course_facilitator, course: Pd::Workshop::COURSE_CSD).facilitator
    assert_does_not_create(Pd::CourseFacilitator) do
      facilitator.course_as_facilitator = Pd::Workshop::COURSE_CSD
    end
  end

  test 'delete_course_as_facilitator removes facilitator course' do
    facilitator = create(:pd_course_facilitator, course: Pd::Workshop::COURSE_CSF).facilitator
    assert_destroys(Pd::CourseFacilitator) do
      facilitator.delete_course_as_facilitator Pd::Workshop::COURSE_CSF
    end
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
    student.update_columns(races: 'white,black')
    refute student.show_race_interstitial?('ignored_ip')
  end

  test 'do not show race interstitial to user accounts that have closed the dialog already' do
    mock_geocoder_result('US')
    student = create :student, created_at: DateTime.now - 8
    student.update_columns(races: 'closed_dialog')
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

  test 'no personal email for under 13 users' do
    user = create :young_student
    assert user.no_personal_email?
  end

  test 'no personal email for users with parent-managed accounts' do
    parent_managed_student = create(:parent_managed_student)
    assert parent_managed_student.no_personal_email?
  end

  test 'no personal email is false for users with email' do
    refute @student.no_personal_email?

    refute @teacher.no_personal_email?
  end

  test 'parent_managed_account is true for users with parent email and no hashed email' do
    parent_managed_student = create(:parent_managed_student)
    assert parent_managed_student.parent_managed_account?
  end

  test 'parent_managed_account is false for teacher' do
    refute @teacher.parent_managed_account?
  end

  test 'age is required for new users' do
    e = assert_raises ActiveRecord::RecordInvalid do
      create :user, birthday: nil
    end
    assert_equal 'Validation failed: Age is required', e.message
  end

  test 'age validation is bypassed for Google OAuth users with no birthday' do
    # Users created this way will be asked for their age when they first sign in.
    user = create :user, birthday: nil, provider: 'google_oauth2'
    assert_nil user.age
  end

  test "age is nil for Google OAuth users under age 4" do
    # Users created this way will be asked for their age when they first sign in.
    three_year_old = create :user, birthday: (Date.today - 3.years), provider: 'google_oauth2'
    assert_nil three_year_old.age
  end

  test "age is set exactly for Google OAuth users between ages 4 and 20" do
    four_year_old = create :user, birthday: (Date.today - 4.years), provider: 'google_oauth2'
    assert_equal 4, four_year_old.age

    twenty_year_old = create :user, birthday: (Date.today - 20.years), provider: 'google_oauth2'
    assert_equal 20, twenty_year_old.age
  end

  test "age is 21+ for Google OAuth users over the age of 20" do
    twenty_something = create :user, birthday: (Date.today - 22.years), provider: 'google_oauth2'
    assert_equal '21+', twenty_something.age
  end

  test 'age validation is bypassed for Clever users with no birthday' do
    # Users created this way will be asked for their age when they first sign in.
    user = create :user, birthday: nil, provider: 'clever'
    assert_nil user.age
  end

  test "age is nil for Clever users under age 4" do
    # Users created this way will be asked for their age when they first sign in.
    three_year_old = create :user, birthday: (Date.today - 3.years), provider: 'clever'
    assert_nil three_year_old.age
  end

  test "age is set exactly for Clever users between ages 4 and 20" do
    four_year_old = create :user, birthday: (Date.today - 4.years), provider: 'clever'
    assert_equal 4, four_year_old.age

    twenty_year_old = create :user, birthday: (Date.today - 20.years), provider: 'clever'
    assert_equal 20, twenty_year_old.age
  end

  test "age is 21+ for Clever users over the age of 20" do
    twenty_something = create :user, birthday: (Date.today - 22.years), provider: 'clever'
    assert_equal '21+', twenty_something.age
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

  test 'deleting user deletes dependent pd applications' do
    teacher = create :teacher
    application = create :pd_teacher1819_application, user: teacher
    assert_equal application.id, teacher.pd_applications.first.id

    teacher.destroy

    assert teacher.reload.deleted?
    refute Pd::Application::Teacher1819Application.exists?(application.id)
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

  test 'undestroy restores recent dependents only' do
    teacher = create :teacher
    old_section = create :section, teacher: teacher
    Timecop.freeze 1.hour.ago do
      old_section.destroy!
    end
    new_section = create :section
    teacher.destroy!

    teacher.undestroy

    refute teacher.reload.deleted?
    refute new_section.reload.deleted?
    assert old_section.reload.deleted?
  end

  test 'undestroy raises for a purged user' do
    user = create :user
    user.clear_user_and_mark_purged

    assert_raises do
      user.undestroy
    end
  end

  test 'assign_script creates UserScript if necessary' do
    assert_creates(UserScript) do
      user_script = @student.assign_script(Script.first)
      assert_equal Script.first.id, user_script.script_id
      refute_nil user_script.assigned_at
    end
  end

  test 'assign_script reuses UserScript if available' do
    Timecop.travel(2017, 1, 2, 12, 0, 0) do
      UserScript.create!(user: @student, script: Script.first)
    end
    assert_does_not_create(UserScript) do
      user_script = @student.assign_script(Script.first)
      assert_equal Script.first.id, user_script.script_id
      refute_nil user_script.assigned_at
    end
  end

  test 'assign_script does not overwrite assigned_at if pre-existing' do
    Timecop.travel(2017, 1, 2, 12, 0, 0) do
      UserScript.create!(user: @student, script: Script.first, assigned_at: DateTime.now)
    end
    assert_does_not_create(UserScript) do
      user_script = @student.assign_script(Script.first)
      assert_equal Script.first.id, user_script.script_id
      assert_equal '2017-01-02 12:00:00 UTC', user_script.assigned_at.to_s
    end
  end

  class AssignedCoursesAndScripts < ActiveSupport::TestCase
    setup do
      @student = create :student
      @course = create :course, name: 'course'
    end

    test "it returns assigned courses" do
      teacher = create :teacher
      section = create :section, user_id: teacher.id, course: @course
      Follower.create!(section_id: section.id, student_user_id: @student.id, user: teacher)

      assigned_courses = @student.assigned_courses
      assert_equal 1, assigned_courses.length

      assert_equal 'course', assigned_courses[0][:name]
    end

    test "it checks for assigned scripts, no assigned scripts" do
      refute @student.any_visible_assigned_scripts?
    end

    test "it checks for assigned scripts, assigned hidden script" do
      hidden_script = create :script, name: 'hidden-script', hidden: true
      @student.assign_script(hidden_script)
      refute @student.any_visible_assigned_scripts?
    end

    test "it checks for assigned scripts, assigned visible script" do
      visible_script = create :script, name: 'visible-script'
      @student.assign_script(visible_script)
      assert @student.any_visible_assigned_scripts?
    end

    test "it checks for assigned courses and scripts, no course, no script" do
      refute @student.assigned_course_or_script?
    end

    test "it checks for assigned courses and scripts, assigned hidden script" do
      hidden_script = create :script, name: 'hidden-script', hidden: true
      @student.assign_script(hidden_script)
      refute @student.assigned_course_or_script?
    end

    test "it checks for assigned courses and scripts, assigned visible script" do
      visible_script = create :script, name: 'visible-script'
      @student.assign_script(visible_script)
      assert @student.assigned_course_or_script?
    end

    test "it checks for assigned courses and scripts, assigned course" do
      teacher = create :teacher
      section = create :section, user_id: teacher.id, course: @course
      Follower.create!(section_id: section.id, student_user_id: @student.id, user: teacher)
      assert @student.assigned_course_or_script?
    end

    test "it checks for assigned courses and scripts, assigned course and assigned visible script" do
      teacher = create :teacher
      section = create :section, user_id: teacher.id, course: @course
      Follower.create!(section_id: section.id, student_user_id: @student.id, user: teacher)
      visible_script = create :script, name: 'visible-script'
      @student.assign_script(visible_script)
      assert @student.assigned_course_or_script?
    end
  end

  class RecentCoursesAndScripts < ActiveSupport::TestCase
    setup do
      test_locale = :"te-ST"
      I18n.locale = test_locale
      custom_i18n = {
        'data' => {
          'course' => {
            'name' => {
              'csd' => {
                'title' => 'Computer Science Discoveries',
                'description_short' => 'CSD short description',
              }
            }
          },
          'script' => {
            'name' => {
              'other' => {
                'title': 'Script Other',
                'description_short' => 'other-description'
              }
            }
          }
        }
      }

      I18n.backend.store_translations test_locale, custom_i18n

      @student = create :student
      teacher = create :teacher

      course = create :course, name: 'csd'
      create :course_script, course: course, script: (create :script, name: 'csd1'), position: 1
      create :course_script, course: course, script: (create :script, name: 'csd2'), position: 2

      other_script = create :script, name: 'other'
      @student.assign_script(other_script)

      section = create :section, user_id: teacher.id, course: course
      Follower.create!(section_id: section.id, student_user_id: @student.id, user: teacher)
    end

    test "it returns both courses and scripts" do
      courses_and_scripts = @student.recent_courses_and_scripts(false)
      assert_equal 2, courses_and_scripts.length

      assert_equal 'csd', courses_and_scripts[0][:name]
      assert_equal 'Computer Science Discoveries', courses_and_scripts[0][:title]
      assert_equal 'CSD short description', courses_and_scripts[0][:description]
      assert_equal '/courses/csd', courses_and_scripts[0][:link]

      assert_equal 'other', courses_and_scripts[1][:name]
      assert_equal 'Script Other', courses_and_scripts[1][:title]
      assert_equal 'other-description', courses_and_scripts[1][:description]
      assert_equal '/s/other', courses_and_scripts[1][:link]
    end

    test "it does not return scripts that are in returned courses" do
      script = Script.find_by_name('csd1')
      @student.assign_script(script)

      courses_and_scripts = @student.recent_courses_and_scripts(false)
      assert_equal 2, courses_and_scripts.length

      assert_equal ['Computer Science Discoveries', 'Script Other'], courses_and_scripts.map {|cs| cs[:title]}
    end

    test "it optionally does not return primary course in returned courses" do
      student = create :student
      teacher = create :teacher

      course = create :course, name: 'testcourse'
      course_script1 = create :course_script, course: course, script: (create :script, name: 'testscript1'), position: 1
      create :course_script, course: course, script: (create :script, name: 'testscript2'), position: 2
      create :user_script, user: student, script: course_script1.script, started_at: (Time.now - 1.day)

      other_script = create :script, name: 'otherscript'
      create :user_script, user: student, script: other_script, started_at: (Time.now - 1.hour)

      section = create :section, user_id: teacher.id, course: course
      Follower.create!(section_id: section.id, student_user_id: student.id, user: teacher)

      courses_and_scripts = student.recent_courses_and_scripts(true)

      assert_equal 1, courses_and_scripts.length

      assert_equal ['testcourse'], courses_and_scripts.map {|cs| cs[:name]}
    end
  end

  class SectionCourses < ActiveSupport::TestCase
    setup do
      @student = create :student
      @teacher = create :teacher
      @grand_teacher = create :teacher
      @course = create :course, name: 'csd'
    end
    test "it returns courses in which a teacher exists as a student" do
      grand_section = create :section, user_id: @grand_teacher.id, course: @course
      Follower.create!(section_id: grand_section.id, student_user_id: @teacher.id, user: @grand_teacher)

      courses = @teacher.section_courses
      assert_equal 1, courses.length
      assert_equal 'csd', courses[0].name
    end

    test "it returns courses in which a teacher exists as a teacher" do
      section = create :section, user_id: @teacher.id, course: @course
      Follower.create!(section_id: section.id, student_user_id: @student.id, user: @teacher)

      courses = @teacher.section_courses
      assert_equal 1, courses.length
      assert_equal 'csd', courses[0].name
    end

    test "it returns courses in which a student exists as a student" do
      section = create :section, user_id: @teacher.id, course: @course
      Follower.create!(section_id: section.id, student_user_id: @student.id, user: @teacher)

      courses = @student.section_courses
      assert_equal 1, courses.length
      assert_equal 'csd', courses[0].name
    end
  end

  test "last_joined_section returns the most recently joined section" do
    student = create :student
    teacher = create :teacher

    section_1 = create :section, user_id: teacher.id
    section_2 = create :section, user_id: teacher.id
    section_3 = create :section, user_id: teacher.id

    Timecop.freeze do
      assert_nil student.last_joined_section
      Follower.create!(section_id: section_1.id, student_user_id: student.id, user: teacher)
      assert_equal section_1, student.last_joined_section
      Timecop.travel 1
      Follower.create!(section_id: section_3.id, student_user_id: student.id, user: teacher)
      assert_equal section_3, student.last_joined_section
      Timecop.travel 1
      Follower.create!(section_id: section_2.id, student_user_id: student.id, user: teacher)
      assert_equal section_2, student.last_joined_section
    end
  end

  test 'clear_user removes all PII and other information' do
    user = create :teacher

    user.clear_user_and_mark_purged
    user.reload

    assert user.valid?
    assert_nil user.name
    refute_nil user.username =~ /sys_deleted_\w{8}/
    assert_nil user.current_sign_in_ip
    assert_nil user.last_sign_in_ip
    assert_equal '', user.email
    assert_equal '', user.hashed_email
    assert_nil user.parent_email
    assert_nil user.encrypted_password
    assert_nil user.uid
    assert_nil user.reset_password_token
    assert_nil user.full_address
    assert_equal({"sharing_disabled" => false}, user.properties)
    refute_nil user.purged_at
  end

  test 'omniauth login stores auth token' do
    auth = OmniAuth::AuthHash.new(
      provider: 'google_oauth2',
      uid: '123456',
      credentials: {
        token: 'fake oauth token',
        expires_at: Time.now.to_i + 3600,
        refresh_token: 'fake refresh token',
      },
      info: {},
    )

    params = {}

    user = User.from_omniauth(auth, params)
    assert_equal('fake oauth token', user.oauth_token)
    assert_equal('fake refresh token', user.oauth_refresh_token)
  end

  test 'summarize' do
    assert_equal(
      {
        id: @student.id,
        name: @student.name,
        username: @student.username,
        email: @student.email,
        hashed_email: @student.hashed_email,
        user_type: @student.user_type,
        gender: @student.gender,
        birthday: @student.birthday,
        total_lines: @student.total_lines,
        secret_words: @student.secret_words,
        secret_picture_name: @student.secret_picture.name,
        secret_picture_path: @student.secret_picture.path,
        location: "/v2/users/#{@student.id}",
        age: @student.age,
        sharing_disabled: false
      },
      @student.summarize
    )
  end

  test 'under 13 students have sharing off by default' do
    student = create :user, age: 10
    assert student.reload.sharing_disabled
  end

  test 'over 13 students have sharing on by default' do
    student = create :user, age: 14
    refute student.reload.sharing_disabled
  end

  test 'students share setting updates after turning 13 if they are in no sections' do
    # create a birthday 12 years ago
    birthday = Date.today - (12 * 365)
    student = create :user, birthday: birthday
    assert student.reload.sharing_disabled

    # go forward in time to a day past the student's 13th birthday
    Timecop.travel (Date.today + 366) do
      # student signs in
      student.sign_in_count = 2
      student.save

      # check new share setting
      refute student.reload.sharing_disabled
    end
  end

  test 'students share setting does not update after turning 13 if they are in sections' do
    # create a birthday 12 years ago
    birthday = Date.today - (12 * 365)
    student = create :user, birthday: birthday

    teacher = create :teacher
    section1 = create :section, user: teacher
    section1.add_student(student)

    assert student.reload.sharing_disabled

    # go forward in time to a day past the student's 13th birthday
    Timecop.travel (Date.today + 366) do
      # student signs in
      student.sign_in_count = 2
      student.save

      # check updated share setting is unchanged
      assert student.reload.sharing_disabled
    end
  end

  test 'stage_extras_enabled?' do
    script = create :script
    other_script = create :script
    teacher = create :teacher
    student = create :student

    section1 = create :section, stage_extras: true, script_id: script.id, user: teacher
    section1.add_student(student)
    section2 = create :section, stage_extras: true, script_id: script.id, user: teacher
    section2.add_student(student)
    section3 = create :section, stage_extras: true, script_id: other_script.id
    section3.add_student(teacher)

    assert student.stage_extras_enabled?(script)
    refute student.stage_extras_enabled?(other_script)

    assert teacher.stage_extras_enabled?(script)
    refute teacher.stage_extras_enabled?(other_script)

    refute (create :student).stage_extras_enabled?(script)
    refute (create :teacher).stage_extras_enabled?(script)
  end

  class HiddenIds < ActiveSupport::TestCase
    setup_all do
      @teacher = create :teacher

      @script = create(:script, hideable_stages: true)
      @stage1 = create(:stage, script: @script, absolute_position: 1, relative_position: '1')
      @stage2 = create(:stage, script: @script, absolute_position: 2, relative_position: '2')
      @stage3 = create(:stage, script: @script, absolute_position: 3, relative_position: '3')
      @custom_s1_l1 = create(
        :script_level,
        script: @script,
        stage: @stage1,
        position: 1
      )
      @custom_s2_l1 = create(
        :script_level,
        script: @script,
        stage: @stage2,
        position: 1
      )
      @custom_s2_l2 = create(
        :script_level,
        script: @script,
        stage: @stage2,
        position: 2
      )
      create(:script_level, script: @script, stage: @stage3, position: 1)

      # explicitly disable LB mode so that we don't create a .course file
      Rails.application.config.stubs(:levelbuilder_mode).returns false
      @course = create :course

      @script2 = create :script
      @script3 = create :script
      create :course_script, position: 1, course: @course, script: @script
      create :course_script, position: 2, course: @course, script: @script2
      create :course_script, position: 2, course: @course, script: @script3
    end

    def put_student_in_section(student, teacher, script, course=nil)
      section = create :section, user_id: teacher.id, script_id: script.id, course_id: course.try(:id)
      Follower.create!(section_id: section.id, student_user_id: student.id, user: teacher)
      section
    end

    # Helper method that sets up some hidden stages for our two sections
    def hide_stages_in_sections(section1, section2)
      # stage 1 hidden in both sections
      SectionHiddenStage.create(section_id: section1.id, stage_id: @stage1.id)
      SectionHiddenStage.create(section_id: section2.id, stage_id: @stage1.id)

      # stage 2 hidden in section 1
      SectionHiddenStage.create(section_id: section1.id, stage_id: @stage2.id)

      # stage 3 hidden in section 2
      SectionHiddenStage.create(section_id: section2.id, stage_id: @stage3.id)
    end

    # Same thing as hide_stages_in_sections, but hides scripts instead of stages
    def hide_scripts_in_sections(section1, section2)
      # script hidden in both sections
      SectionHiddenScript.create(section_id: section1.id, script_id: @script.id)
      SectionHiddenScript.create(section_id: section2.id, script_id: @script.id)

      # script 2 hidden in section 1
      SectionHiddenScript.create(section_id: section1.id, script_id: @script2.id)

      # script 3 hidden in section 2
      SectionHiddenScript.create(section_id: section2.id, script_id: @script3.id)
    end

    test "user in two sections, both attached to script" do
      student = create :student

      section1 = put_student_in_section(student, @teacher, @script)
      section2 = put_student_in_section(student, @teacher, @script)

      hide_stages_in_sections(section1, section2)

      # when attached to script, we should hide only if hidden in every section
      assert_equal [@stage1.id], student.get_hidden_stage_ids(@script.name)

      # validate script_level_hidden? gives same result
      assert_equal true, student.script_level_hidden?(@stage1.script_levels.first)
      assert_equal false, student.script_level_hidden?(@stage2.script_levels.first)
      assert_equal false, student.script_level_hidden?(@stage3.script_levels.first)
    end

    test "user in two sections, both attached to course" do
      student = create :student

      section1 = put_student_in_section(student, @teacher, @script, @course)
      section2 = put_student_in_section(student, @teacher, @script, @course)

      hide_scripts_in_sections(section1, section2)

      # when attached to course, we should hide only if hidden in every section
      assert_equal [@script.id], student.get_hidden_script_ids(@course)
    end

    test "user in two sections, neither attached to script" do
      student = create :student

      unattached_script = create(:script)
      section1 = put_student_in_section(student, @teacher, unattached_script)
      section2 = put_student_in_section(student, @teacher, unattached_script)

      hide_stages_in_sections(section1, section2)

      # when not attached to script, we should hide when hidden in any section
      assert_equal [@stage1.id, @stage2.id, @stage3.id], student.get_hidden_stage_ids(@script.name)

      # validate script_level_hidden? gives same result
      assert_equal true, student.script_level_hidden?(@stage1.script_levels.first)
      assert_equal true, student.script_level_hidden?(@stage2.script_levels.first)
      assert_equal true, student.script_level_hidden?(@stage3.script_levels.first)
    end

    test "user in two sections, neither attached to course" do
      student = create :student

      unattached_script = create(:script)
      section1 = put_student_in_section(student, @teacher, unattached_script)
      section2 = put_student_in_section(student, @teacher, unattached_script)

      hide_scripts_in_sections(section1, section2)

      # when not attached to course, we should hide when hidden in any section
      assert_equal [@script.id, @script2.id, @script3.id], student.get_hidden_script_ids(@course)
    end

    test "user in two sections, one attached to script one not" do
      student = create :student

      attached_section = put_student_in_section(student, @teacher, @script)
      unattached_section = put_student_in_section(student, @teacher, create(:script))

      hide_stages_in_sections(attached_section, unattached_section)

      # only the stages hidden in the attached section are considered hidden
      assert_equal [@stage1.id, @stage2.id], student.get_hidden_stage_ids(@script.name)

      # validate script_level_hidden? gives same result
      assert_equal true, student.script_level_hidden?(@stage1.script_levels.first)
      assert_equal true, student.script_level_hidden?(@stage2.script_levels.first)
      assert_equal false, student.script_level_hidden?(@stage3.script_levels.first)
    end

    test "user in two sections, one attached to course one not" do
      student = create :student

      attached_section = put_student_in_section(student, @teacher, @script, @course)
      unattached_section = put_student_in_section(student, @teacher, create(:script))

      hide_scripts_in_sections(attached_section, unattached_section)

      # only the scripts hidden in the attached section are considered hidden
      assert_equal [@script.id, @script2.id], student.get_hidden_script_ids(@course)
    end

    test "user in no sections" do
      student = create :student

      assert_equal [], student.get_hidden_stage_ids(@script.name)
    end

    test "teacher gets hidden stages for sections they own" do
      teacher = create :teacher
      teacher_teacher = create :teacher
      student = create :student

      teacher_owner_section = put_student_in_section(student, teacher, @script)
      teacher_owner_section2 = put_student_in_section(student, teacher, @script)
      teacher_member_section = put_student_in_section(teacher, teacher_teacher, @script)

      # stage 1 is hidden in the first section owned by the teacher
      SectionHiddenStage.create(section_id: teacher_owner_section.id, stage_id: @stage1.id)

      # stage 1 and 2 are hidden in the second section owned by the teacher
      SectionHiddenStage.create(section_id: teacher_owner_section2.id, stage_id: @stage1.id)
      SectionHiddenStage.create(section_id: teacher_owner_section2.id, stage_id: @stage2.id)

      # stage 3 is hidden in the section in which the teacher is a member
      SectionHiddenStage.create(section_id: teacher_member_section.id, stage_id: @stage3.id)

      # only the stages hidden in the owned section are considered hidden
      expected = {
        teacher_owner_section.id => [@stage1.id],
        teacher_owner_section2.id => [@stage1.id, @stage2.id]
      }
      assert_equal expected, teacher.get_hidden_stage_ids(@script.id)
    end

    test "teacher gets hidden scripts for sections they own" do
      teacher = create :teacher
      teacher_teacher = create :teacher
      student = create :student

      teacher_owner_section = put_student_in_section(student, teacher, @script, @course)
      teacher_owner_section2 = put_student_in_section(student, teacher, @script, @course)
      teacher_member_section = put_student_in_section(teacher, teacher_teacher, @script, @course)

      # stage 1 is hidden in the first section owned by the teacher
      SectionHiddenScript.create(section_id: teacher_owner_section.id, script_id: @script.id)

      # stage 1 and 2 are hidden in the second section owned by the teacher
      SectionHiddenScript.create(section_id: teacher_owner_section2.id, script_id: @script.id)
      SectionHiddenScript.create(section_id: teacher_owner_section2.id, script_id: @script2.id)

      # stage 3 is hidden in the section in which the teacher is a member
      SectionHiddenScript.create(section_id: teacher_member_section.id, script_id: @script3.id)

      # only the scripts hidden in the owned section are considered hidden
      expected = {
        teacher_owner_section.id => [@script.id],
        teacher_owner_section2.id => [@script.id, @script2.id]
      }
      assert_equal expected, teacher.get_hidden_script_ids(@course)
    end

    test "script_hidden?" do
      teacher = create :teacher
      student = create :student
      section = put_student_in_section(student, teacher, @script, @course)
      SectionHiddenScript.create(section_id: section.id, script_id: @script.id)

      # returns true for student
      assert_equal true, student.script_hidden?(@script)

      # returns false for teacher
      assert_equal false, teacher.script_hidden?(@script)
    end
  end

  test 'generate_progress_from_storage_id' do
    # construct our fake applab-intro script
    script = create :script
    stage = create :stage, script: script
    regular_level = create :level
    create :script_level, script: script, stage: stage, levels: [regular_level]

    # two different levels, backed by the same template level
    template_level = create :level
    template_backed_level1 = create :level, project_template_level_name: template_level.name
    create :script_level, script: script, stage: stage, levels: [template_backed_level1]
    template_backed_level2 = create :level, project_template_level_name: template_level.name
    create :script_level, script: script, stage: stage, levels: [template_backed_level2]

    # Whether we have a channel for a regular level in the script, or a template
    # level, we generate a UserScript
    [regular_level, template_level].each do |level|
      user = create :student
      channel_token = create :channel_token, level: level, storage_user: user
      user.generate_progress_from_storage_id(channel_token.storage_id, script.name)

      user_scripts = UserScript.where(user: user)
      assert_equal 1, user_scripts.length
      assert_equal script, user_scripts.first.script

      if level == regular_level
        # we should have exactly one user_level created
        assert_equal 1, user.user_levels.length
        assert_equal regular_level.id, user.user_levels[0].level_id
      elsif level == template_level
        # Template backed levels share a channel, so when we find a channel for the
        # template, we create user_levels for every level that uses that template
        assert_equal 2, user.user_levels.length
        assert user.user_levels.map(&:level_id).include?(template_backed_level1.id)
        assert user.user_levels.map(&:level_id).include?(template_backed_level2.id)
      end
    end

    # No UserScript if we only have channel tokens elsewhere
    user = create :student
    channel_token = create :channel_token, level: Script.twenty_hour_script.levels.first, storage_user: user
    user.generate_progress_from_storage_id(channel_token.storage_id, script.name)

    user_scripts = UserScript.where(user: user)
    assert_equal 0, user_scripts.length
  end

  test 'primary email for migrated user is readable from user model' do
    user = create(:teacher, :with_email_authentication_option)
    user.primary_authentication_option = user.authentication_options.first
    user.provider = 'migrated'
    user.primary_authentication_option.update(email: 'eric@code.org')
    assert_equal user.email, user.authentication_options.first.email
    assert_equal user.email, user.primary_authentication_option.email
  end

  test 'primary email for non-migrated user is not readable from user model' do
    user = create(:teacher, :with_email_authentication_option)
    user.primary_authentication_option = user.authentication_options.first
    user.primary_authentication_option.update(email: 'eric@code.org')
    assert_not_equal user.email, user.authentication_options.first.email
    assert_not_equal user.email, user.primary_authentication_option.email
    assert_equal user.primary_authentication_option.email, user.authentication_options.first.email
  end
end
