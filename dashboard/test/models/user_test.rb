require 'test_helper'
require 'testing/includes_metrics'
require 'testing/storage_apps_test_utils'
require 'timecop'

class UserTest < ActiveSupport::TestCase
  include StorageAppsTestUtils
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
    @good_data_google_classroom_import = {
      name: 'tester',
      user_type: User::TYPE_STUDENT,
      age: 8,
      provider: AuthenticationOption::GOOGLE,
      uid: '110879982140384463192',
    }
    @good_parent_email_params = {
      parent_email_preference_email: 'parent@email.com',
      parent_email_preference_opt_in_required: '1',
      parent_email_preference_opt_in: 'yes',
      parent_email_preference_request_ip: '127.0.0.1',
      parent_email_preference_source: EmailPreference::ACCOUNT_SIGN_UP
    }
    @admin = create :admin
    @user = create :user
    @teacher = create :teacher
    @student = create :student
  end

  test 'from_identifier finds user by id' do
    student = create :student
    assert_equal student, User.from_identifier(student.id.to_s)
  end

  test 'from_identifier finds user by username' do
    student = create :student
    assert_equal student, User.from_identifier(student.username)
  end

  test 'from_identifier finds user by email' do
    teacher = create :teacher
    assert_equal teacher, User.from_identifier(teacher.email)
  end

  test 'from_identifier finds user by hashed_email' do
    student = create :student, email: 'fakestudentemail@example.com'
    assert_equal student, User.from_identifier('fakestudentemail@example.com')
  end

  test 'from_identifier returns nil when id exceeds allowed integer size' do
    assert_nil User.from_identifier('3423423423')
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

    assert_equal teacher.user_school_infos.count, 1
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

  test 'update_school_info with specific school overwrites user school info' do
    user = create :teacher, :with_school_info
    new_school_info = create :school_info

    user.update_school_info(new_school_info)
    assert_equal new_school_info, user.school_info

    assert_equal user.user_school_infos.count, 2
    assert_equal user.user_school_infos.where(school_info_id: new_school_info.id).count, 1
    assert_equal user.user_school_infos.where(end_date: nil).count, 1
  end

  test 'update_school_info with custom school updates user that has a specific school' do
    original_school_info = create :school_info
    user = create :teacher, school_info: original_school_info
    new_school_info = create :school_info_us_other, validation_type:  SchoolInfo::VALIDATION_COMPLETE

    user.update_school_info(new_school_info)
    assert_equal new_school_info, user.school_info
    assert_equal user.user_school_infos.count, 2
  end

  test 'update_school_info with custom school updates user info when user does not have a specific school' do
    original_school_info = create :school_info_us_other
    user = create :teacher, school_info: original_school_info
    new_school_info = create :school_info_us_other

    user.update_school_info(new_school_info)
    refute_equal original_school_info, user.school_info
    assert_equal new_school_info, user.school_info
    assert_not_nil user.school_info_id

    assert_equal user.user_school_infos.count, 2
    assert_equal user.user_school_infos.where(end_date: nil).count, 1
  end

  test 'update_school_info with custom school updates user info when user school info does not include a school_id' do
    original_school_info = create :school_info
    user = create :teacher, school_info: original_school_info
    new_school_info = create :school_info_us_other

    user.update_school_info(new_school_info)
    assert_equal new_school_info, user.school_info
    assert_not_nil user.school_info_id

    assert_equal user.user_school_infos.count, 2
  end

  # Tests for replacing the old school info with the new school info if and only if the new school info is complete.
  test 'No NCES id for old and new school_infos, incomplete new school_info, no update' do
    original_school_info = create :school_info, school_id: nil, validation_type:  SchoolInfo::VALIDATION_NONE
    user = create :teacher, school_info: original_school_info
    new_school_info = create :school_info, school_id: nil, validation_type:  SchoolInfo::VALIDATION_NONE

    user.update_school_info(new_school_info)
    assert_equal original_school_info, user.school_info
    refute_equal new_school_info, user.school_info
    assert_not_nil user.school_info_id

    assert_equal user.user_school_infos.count, 1
  end

  test 'No NCES id for old and new school_infos, complete new school_info, update' do
    original_school_info = create :school_info, school_id: nil, validation_type:  SchoolInfo::VALIDATION_NONE
    user = create :teacher, school_info: original_school_info
    new_school_info = create :school_info_us_other

    user.update_school_info(new_school_info)
    refute_equal original_school_info, user.school_info
    assert_equal new_school_info, user.school_info
    assert_not_nil user.school_info_id

    assert_equal user.user_school_infos.count, 2
  end

  test 'No NCES id for old school_info, NCES id for new school_info, complete new school_info, update' do
    original_school_info = create :school_info, school_id: nil, validation_type:  SchoolInfo::VALIDATION_NONE
    user = create :teacher, school_info: original_school_info
    new_school_info = create :school_info

    user.update_school_info(new_school_info)
    refute_equal original_school_info, user.school_info
    assert_equal new_school_info, user.school_info
    assert_not_nil user.school_info_id

    assert_equal user.user_school_infos.count, 2
  end

  test 'NCES id for old school_info, no NCES id for new school_info, incomplete new school_info, no update' do
    user = create :teacher, :with_school_info
    new_school_info = create :school_info, school_id: nil, validation_type: SchoolInfo::VALIDATION_NONE

    user.update_school_info(new_school_info)
    refute_equal new_school_info, user.school_info

    assert_equal user.user_school_infos.count, 1
    assert_equal user.user_school_infos.where(school_info_id: new_school_info.id).count, 0
    assert_equal user.user_school_infos.where(end_date: nil).count, 1
  end

  test 'NCES id for old school_info, no NCES id for new school_info, complete school_info, update' do
    original_school_info = create :school_info
    user = create :teacher, school_info: original_school_info
    new_school_info = create :school_info_us_other
    refute user.school_info.school.nil?
    assert new_school_info.school.nil?
    assert new_school_info.complete?

    user.update_school_info(new_school_info)
    user.reload
    assert_equal new_school_info, user.school_info

    assert_equal user.user_school_infos.count, 2
    assert_equal user.user_school_infos.where(school_info_id: new_school_info.id).count, 1
    assert_equal user.user_school_infos.where(end_date: nil).count, 1
  end

  test 'old has NCES id, new has NCES id, new is complete, update' do
    user = create :teacher, :with_school_info
    new_school_info = create :school_info

    user.update_school_info(new_school_info)
    assert_equal new_school_info, user.school_info

    assert_equal user.user_school_infos.count, 2
    assert_equal user.user_school_infos.where(school_info_id: new_school_info.id).count, 1
    assert_equal user.user_school_infos.where(end_date: nil).count, 1
  end

  # Test updating the school_info of an older user without an email address.
  test 'update_school_info with specific school overwrites user school info for user without email' do
    user = create :teacher, :without_email, :with_school_info
    new_school_info = create :school_info

    user.update_school_info(new_school_info)
    assert_equal new_school_info, user.school_info

    assert_equal user.user_school_infos.count, 2
    assert_equal user.user_school_infos.where(school_info_id: new_school_info.id).count, 1
    assert_equal user.user_school_infos.where(end_date: nil).count, 1
  end

  test 'single user experiment is enabled' do
    experiment = create(:single_user_experiment, min_user_id: @user.id)
    assert_equal [experiment[:name]], @user.get_active_experiment_names
    experiment.destroy
  end

  test 'normalize_email for migrated user' do
    teacher = create :teacher, email: 'OLD@EXAMPLE.COM'
    teacher.update!(primary_contact_info: create(:authentication_option, user: teacher, email: 'NEW@EXAMPLE.COM'))
    assert_equal 'new@example.com', teacher.primary_contact_info.email
    assert_equal 'new@example.com', teacher.read_attribute(:email)
  end

  test 'hash_email for migrated user' do
    teacher = create :teacher, email: 'OLD@EXAMPLE.COM'
    teacher.update!(primary_contact_info: create(:authentication_option, user: teacher, email: 'NEW@EXAMPLE.COM'))
    hashed_email = User.hash_email('new@example.com')
    assert_equal hashed_email, teacher.primary_contact_info.hashed_email
    assert_equal hashed_email, teacher.read_attribute(:hashed_email)
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

  test 'cannot create user when a user with the same credentials exists' do
    User.create(@good_data_google_classroom_import)
    duplicate_user = User.create(@good_data_google_classroom_import)
    assert_not_empty(duplicate_user.errors)
    assert(duplicate_user.errors[:uid])
  end

  test 'cannot create user when an non-migrated user with the same credentials exists' do
    User.create(@good_data_google_classroom_import).demigrate_from_multi_auth
    duplicate_user = User.create(@good_data_google_classroom_import)
    assert_not_empty(duplicate_user.errors)
    assert(duplicate_user.errors[:uid])
  end

  #
  # Email uniqueness validation tests
  #
  COLLISION_EMAIL = 'collision@example.org'

  def create_multi_auth_user_with_email(email)
    create :student, email: email
  end

  def create_multi_auth_user_with_second_email(email)
    user = create :student
    user.authentication_options << create(:google_authentication_option, user: user, email: email)
    user.save
    user
  end

  test "cannot create multi-auth user with duplicate of multi-auth user's email" do
    create_multi_auth_user_with_email COLLISION_EMAIL
    cannot_create_multi_auth_users_with_email COLLISION_EMAIL
  end

  test "cannot create multi-auth user with duplicate of multi-auth user's second email" do
    create_multi_auth_user_with_second_email COLLISION_EMAIL
    cannot_create_multi_auth_users_with_email COLLISION_EMAIL
  end

  def cannot_create_multi_auth_users_with_email(email)
    cannot_create_user_with_email :teacher, email: email
    cannot_create_user_with_email :student, email: email
  end

  def cannot_create_user_with_email(*args)
    assert_fails_email_uniqueness_validation FactoryGirl.build(*args)
  end

  test "cannot update multi-auth user with duplicate of multi-auth user's email" do
    create_multi_auth_user_with_email COLLISION_EMAIL
    cannot_update_multi_auth_users_with_email COLLISION_EMAIL
  end

  test "cannot update multi-auth user with duplicate of multi-auth user's second email" do
    create_multi_auth_user_with_second_email COLLISION_EMAIL
    cannot_update_multi_auth_users_with_email COLLISION_EMAIL
  end

  def cannot_update_multi_auth_users_with_email(email)
    cannot_update_user_with_email email, :teacher
    cannot_update_user_with_email email, :student
  end

  def cannot_update_user_with_email(email, *user_args)
    user = create(*user_args)
    refute user.primary_contact_info.update(email: email)
    assert_fails_email_uniqueness_validation user
  end

  test "cannot give user an additional email that is a duplicate of multi-auth user's email" do
    create_multi_auth_user_with_email COLLISION_EMAIL
    cannot_give_users_additional_email COLLISION_EMAIL
  end

  test "cannot give user an additional email that is a duplicate of multi-auth user's second email" do
    create_multi_auth_user_with_second_email COLLISION_EMAIL
    cannot_give_users_additional_email COLLISION_EMAIL
  end

  def cannot_give_users_additional_email(email)
    cannot_give_user_additional_email :teacher, email
    cannot_give_user_additional_email :student, email
  end

  def cannot_give_user_additional_email(type, email)
    user = create type
    user.authentication_options << FactoryGirl.build(:google_authentication_option, user: user, email: email)
    refute user.save
    assert_fails_email_uniqueness_validation user
  end

  def assert_fails_email_uniqueness_validation(user)
    refute user.valid?
    assert_equal ['has already been taken'], user.errors[:email]
    assert_includes user.errors.full_messages, 'Email has already been taken'
  end

  test "Creating Teacher with email causes email collision check" do
    User.expects(:find_by_email_or_hashed_email).times(3)
    create :teacher
  end

  test "Creating Student with email causes email collision check" do
    User.expects(:find_by_hashed_email).times(3)
    create :student
  end

  test "Creating User without email does not cause email collision check" do
    User.expects(:find_by_email_or_hashed_email).never
    User.expects(:find_by_hashed_email).never
    create :parent_managed_student
  end

  test "Saving Teacher with email change causes email collision check" do
    user = create :teacher
    User.expects(:find_by_email_or_hashed_email)
    user.email = 'new-email@example.org'
    user.valid?
  end

  test "Saving Student with hashed_email change causes email collision check" do
    user = create :student
    User.expects(:find_by_hashed_email)
    user.hashed_email = User.hash_email 'new-email@example.org'
    user.valid?
  end

  test "Saving User without changing email does not cause email collision check" do
    user = create :student
    User.expects(:find_by_email_or_hashed_email).never
    User.expects(:find_by_hashed_email).never
    user.name = 'New username'
    user.valid?
  end

  test "Saving Teacher's AuthenticationOption with an email change causes email collision check" do
    user = create :teacher
    User.expects(:find_by_email_or_hashed_email)
    user.primary_contact_info.email = 'new-email@example.org'
    user.valid?
  end

  test "Saving Student's AuthenticationOption with a hashed_email change causes email collision check" do
    user = create :student
    User.expects(:find_by_hashed_email)
    user.primary_contact_info.hashed_email = User.hash_email 'new-email@example.org'
    user.valid?
  end

  test "Saving AuthenticationOption without changing email does not cause email collision check" do
    user = create :student
    User.expects(:find_by_email_or_hashed_email).never
    User.expects(:find_by_hashed_email).never
    user.primary_contact_info.data = 'unrelated change'
    user.valid?
  end

  test "saving migrated teacher does not remove cleartext email addresses" do
    User.any_instance.expects(:remove_cleartext_emails).never
    teacher = create :teacher, email: 'teacher@email.com'
    teacher.reload
    assert_equal 1, teacher.authentication_options.count
    assert_equal 'teacher@email.com', teacher.primary_contact_info.email
  end

  test "saving migrated student that was previously a teacher removes cleartext email addresses" do
    user = create :teacher, email: 'example@email.com'
    user.authentication_options << create(:authentication_option, email: 'another@email.com')
    user.authentication_options.last.destroy

    # Change user to student to make sure any previous cleartext emails are empty
    # (including deleted ones and those created when user was a teacher)
    user.update!(user_type: User::TYPE_STUDENT)
    user.authentication_options << create(:authentication_option, email: 'third@email.com')
    user.reload
    all_auth_options = user.authentication_options.with_deleted
    assert_equal 3, all_auth_options.count
    all_auth_options.each do |ao|
      assert_empty ao.email
    end
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

  test "cannot create manual teacher without email" do
    user = assert_does_not_create(User) do
      User.create(user_type: User::TYPE_TEACHER, name: 'Bad Teacher',
                  password: 'xxxxxxxx', provider: 'manual'
      )
    end
    assert_not_nil user.errors[:email]
  end

  # FND-1130: This test will no longer be required
  test "teacher with no email created after 2016-06-14 should be invalid" do
    user = create :teacher, :without_email
    assert user.invalid?
    assert_not_empty user.errors[:email]
  end

  # FND-1130: This test will no longer be required
  test "teacher with no email created before 2016-06-14 should be valid" do
    user = create :teacher, :without_email, :before_email_validation
    assert user.valid?
    assert_empty user.errors[:email]
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

  test "find_for_authentication with very long query" do
    # Our username and email columns are 255 characters wide.  We should
    # fail-fast if the query is longer than that.
    long_query = 'x' * 256

    User.expects(:from).never
    User.expects(:where).never
    User.expects(:find_by_hashed_email).never

    result = User.find_for_authentication login: long_query
    assert_nil result

    result = User.find_for_authentication hashed_email: long_query
    assert_nil result
  end

  test "find_for_authentication finds migrated multi-auth email user first" do
    email = 'test@foo.bar'
    migrated_student = create(:student, email: email)

    legacy_student = build(:student, email: email)
    # ignore "Email has already been taken" error
    assert_raises(ActiveRecord::RecordInvalid) do
      legacy_student.save(validate: false)
    end
    legacy_student.demigrate_from_multi_auth
    assert_equal legacy_student.hashed_email, migrated_student.hashed_email

    looked_up_user = User.find_for_authentication(hashed_email: User.hash_email(email))
    assert_equal migrated_student, looked_up_user
  end

  test "find_for_authentication finds migrated Google email user" do
    email = 'test@foo.bar'
    migrated_student = create(:student, :with_google_authentication_option, email: email)

    looked_up_user = User.find_for_authentication(hashed_email: User.hash_email(email))

    assert_equal migrated_student, looked_up_user
  end

  test "creating manual provider user without username generates username" do
    user = User.create(@good_data.merge({provider: User::PROVIDER_MANUAL}))
    assert_equal 'tester', user.username
  end

  test 'can get next_unpassed_visible_progression_level, no progress, none hidden' do
    user = create :user
    twenty_hour = Script.twenty_hour_unit
    assert twenty_hour.script_levels.first.level.unplugged?
    assert_equal(2, user.next_unpassed_visible_progression_level(twenty_hour).chapter)
  end

  test 'can get next_unpassed_visible_progression_level, progress, none hidden' do
    user = create :user
    twenty_hour = Script.twenty_hour_unit
    second_script_level = twenty_hour.get_script_level_by_chapter(2)
    UserLevel.create(
      user: user,
      level: second_script_level.level,
      script: twenty_hour,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )
    assert_equal(3, user.next_unpassed_visible_progression_level(twenty_hour).chapter)
  end

  test 'can get next_unpassed_visible_progression_level, user skips level, none hidden' do
    user = create :user
    twenty_hour = Script.twenty_hour_unit
    first_script_level = twenty_hour.get_script_level_by_chapter(1)
    UserLevel.create(
      user: user,
      level: first_script_level.level,
      script: twenty_hour,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    third_script_level = twenty_hour.get_script_level_by_chapter(3)
    UserLevel.create(
      user: user,
      level: third_script_level.level,
      script: twenty_hour,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    assert_equal(4, user.next_unpassed_visible_progression_level(twenty_hour).chapter)
  end

  test 'can get next_unpassed_visible_progression_level, out of order progress, none hidden' do
    user = create :user
    twenty_hour = Script.twenty_hour_unit
    first_script_level = twenty_hour.get_script_level_by_chapter(1)
    UserLevel.create(
      user: user,
      level: first_script_level.level,
      script: twenty_hour,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    third_script_level = twenty_hour.get_script_level_by_chapter(3)
    UserLevel.create(
      user: user,
      level: third_script_level.level,
      script: twenty_hour,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    second_script_level = twenty_hour.get_script_level_by_chapter(2)
    UserLevel.create(
      user: user,
      level: second_script_level.level,
      script: twenty_hour,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    assert_equal(4, user.next_unpassed_visible_progression_level(twenty_hour).chapter)
  end

  test 'can get next_unpassed_visible_progression_level, completed script, none hidden' do
    user = create :user
    twenty_hour = Script.twenty_hour_unit

    twenty_hour.script_levels.each do |sl|
      UserLevel.create(
        user: user,
        level: sl.level,
        script: twenty_hour,
        attempts: 1,
        best_result: Activity::MINIMUM_PASS_RESULT
      )
    end
    assert twenty_hour.script_levels.first.level.unplugged?
    assert_equal(2, user.next_unpassed_visible_progression_level(twenty_hour).chapter)
  end

  test 'can get next_unpassed_visible_progression_level, last level complete, but script not complete, none hidden' do
    user = create :user
    twenty_hour = Script.twenty_hour_unit

    twenty_hour.script_levels.take(3).each do |sl|
      UserLevel.create(
        user: user,
        level: sl.level,
        script: twenty_hour,
        attempts: 1,
        best_result: Activity::MINIMUM_PASS_RESULT
      )
    end

    UserLevel.create(
      user: user,
      level: twenty_hour.script_levels.last.level,
      script: twenty_hour,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    assert_equal(4, user.next_unpassed_visible_progression_level(twenty_hour).chapter)
  end

  test 'can get next_unpassed_progression_level if not completed any unplugged levels' do
    user = create :user
    twenty_hour = Script.twenty_hour_unit
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
    twenty_hour = Script.twenty_hour_unit
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
    twenty_hour = Script.twenty_hour_unit

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
    twenty_hour = Script.twenty_hour_unit

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
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    script_levels = [
      create(:script_level, script: script, lesson: lesson, levels: [create(:maze)]),
      create(:script_level, script: script, lesson: lesson, levels: [create(:maze)]),
      create(:script_level, script: script, lesson: lesson, levels: [create(:unplugged)]),
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
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    script_levels = [
      create(:script_level, script: script, lesson: lesson, levels: [create(:maze)]),
      create(:script_level, script: script, lesson: lesson, levels: [create(:unplugged)]),
      create(:script_level, script: script, lesson: lesson, levels: [create(:unplugged)]),
      create(:script_level, script: script, lesson: lesson, levels: [create(:maze)]),
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
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    create(:script_level, script: script, lesson: lesson, levels: [create(:maze)])
    create(:script_level, script: script, lesson: lesson, levels: [create(:maze)])
    create :user_script, user: user, script: script

    # User's most recent progress is on unplugged level, that is followed by another
    # unplugged level. We should end up at the first non unplugged level
    assert_equal(1, user.next_unpassed_progression_level(script).chapter)
  end

  def create_level_group(sub_level_name)
    level_group_dsl = <<~DSL
      name 'LevelGroupLevel1'

      page
      level '#{sub_level_name}'
    DSL
    LevelGroup.create_from_level_builder({}, {name: 'LevelGroupLevel1', dsl_text: level_group_dsl})
  end

  test 'can get next_unpassed_progression_level when last updated user_level is inside a level group' do
    user = create :user
    script = create :script
    sub_level_name = 'sublevel1'
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    sub_level1 = create :text_match, name: sub_level_name
    level_group = create_level_group(sub_level_name)

    create(:script_level, script: script, levels: [level_group], lesson: lesson)
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

  test 'track_level_progress does not record quiz or survey responses for partner when pairing' do
    user = create :user
    partner = create :user
    script = create :script
    sub_level_name = 'sublevel1'

    sub_level1 = create :text_match, name: sub_level_name
    level_group = create_level_group(sub_level_name)

    script_level = create(:script_level, script: script, levels: [level_group])
    create :user_script, user: user, script: script

    # Create a UserLevel for our level_group and sublevel, the sublevel is more recent
    UserLevel.create(
      user: user,
      level: level_group,
      script: script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT,
      updated_at: Time.now - 1
    )

    UserLevel.create(
      user: user,
      level: sub_level1,
      script: script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT,
      updated_at: Time.now
    )

    track_progress(user.id, script_level, 100, pairings: [partner.id])

    user_level = UserLevel.find_by(user: user, script: script_level.script, level: script_level.level)
    assert_equal 100, user_level.best_result
    partner_level = UserLevel.find_by(user: partner, script: script_level.script, level: script_level.level)
    assert_nil partner_level
  end

  test 'track_level_progress records progress for partner when pairing' do
    user = create :user
    partner = create :user
    script_level = Script.get_from_cache('20-hour').script_levels.third

    track_progress(user.id, script_level, 100, pairings: [partner.id])

    user_level = UserLevel.find_by(user: user, script: script_level.script, level: script_level.level)
    assert_equal 100, user_level.best_result
    partner_level = UserLevel.find_by(user: partner, script: script_level.script, level: script_level.level)
    assert_equal 100, partner_level.best_result
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

    user.set_user_type(User::TYPE_STUDENT)
    user.save!
    user.reload

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

    user.set_user_type(User::TYPE_STUDENT)
    user.save!
    user.reload

    refute user.school_info.present?
  end

  test 'changing user from teacher to student removes full_address' do
    user = create :teacher
    user.update!(full_address: 'fake address')

    user.set_user_type(User::TYPE_STUDENT)
    user.save!
    user.reload

    assert user.full_address.nil?
  end

  test 'changing user from student to teacher saves email' do
    user = create :student, email: 'email@old.xx'

    assert user.email.blank?
    assert user.hashed_email

    assert user.set_user_type(User::TYPE_TEACHER, 'email@old.xx')

    assert_equal 'email@old.xx', user.email
    assert_equal '21+', user.age
  end

  test 'changing oauth user from student to teacher with same email is allowed' do
    user = create :student, :google_sso_provider, email: 'email@new.xx'
    assert user.primary_contact_info.credential_type == 'google_oauth2'

    assert user.set_user_type(User::TYPE_TEACHER, 'email@new.xx')

    assert_equal 'email@new.xx', user.email
    assert_equal User::TYPE_TEACHER, user.user_type
  end

  test 'changing oauth user from student to teacher with different email is allowed' do
    user = create :student, :google_sso_provider
    assert user.primary_contact_info.credential_type == 'google_oauth2'

    assert user.set_user_type(User::TYPE_TEACHER, 'email@new.xx')

    assert_equal 'email@new.xx', user.email
    assert_equal User::TYPE_TEACHER, user.user_type
  end

  test 'changing from student to teacher clears terms_of_service_version' do
    user = create :student, terms_of_service_version: 1
    user.set_user_type(User::TYPE_TEACHER, 'tos@example.com')
    user.save!
    user.reload

    assert_nil user.terms_of_service_version
  end

  test 'changing from student to teacher creates StudioPerson' do
    user = assert_does_not_create(StudioPerson) do
      create :student
    end

    assert_creates(StudioPerson) do
      user.set_user_type(User::TYPE_TEACHER, 'fakeemail@example.com')
      user.save!
    end
    user.reload
    assert user.studio_person
    assert_equal 'fakeemail@example.com', user.studio_person.emails
  end

  test 'changing from teacher to student destroys StudioPerson' do
    user = create :teacher

    assert_destroys(StudioPerson) do
      user.set_user_type(User::TYPE_STUDENT)
    end
    assert_nil user.reload.studio_person
  end

  test 'changing from teacher to student does not clear terms_of_service_version' do
    user = create :teacher, terms_of_service_version: 1
    user.set_user_type(User::TYPE_STUDENT)
    assert_equal 1, user.terms_of_service_version
  end

  test 'creating user with terms_of_service_version stores terms_of_service_version' do
    user = create :teacher, terms_of_service_version: 1
    assert_equal 1, user.terms_of_service_version
  end

  test 'sanitize_race_data will set URM to true when appropriate' do
    @student.update!(races: 'black,hispanic')
    @student.reload
    assert @student.urm

    # URM is true when any races are URM
    @student.update!(races: 'white,black')
    @student.reload
    assert @student.urm
  end

  test 'sanitize_race_data will set URM to false when appropriate' do
    @student.update!(races: 'white')
    @student.reload
    refute @student.urm

    @student.update!(races: 'asian')
    @student.reload
    refute @student.urm
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

  test "reset_secrets calls generate_secret_picture and generate_secret_words" do
    user = create :user

    user.expects(:generate_secret_picture).once
    user.expects(:generate_secret_words).once
    user.reset_secrets
  end

  test "generate_secret_picture sets a new secret picture on user" do
    user = create :user
    old_secret_picture = user.secret_picture

    user.generate_secret_picture

    refute_equal old_secret_picture, user.secret_picture
  end

  test "generate_secret_words sets new secret words on user" do
    user = create :user
    old_secret_words = user.secret_words

    user.generate_secret_words

    refute_equal old_secret_words, user.secret_words
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

  test 'send reset password for student with parent email' do
    email = 'email@email.xx'
    student = create :student, password: 'oldone', email: email, parent_email: email

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

  test 'validates format of parent email on create' do
    refute_creates User do
      assert_raises Exception do
        create :young_student, parent_email: 'bad_email_format@nowhere'
      end
    end
  end

  test 'validates format of parent email on update' do
    student = create :young_student
    assert student.valid?

    student.parent_email = 'bad_email_format@nowhere'
    refute student.valid?

    refute student.save
    assert_equal({parent_email: ['is invalid']}, student.errors.messages)
    assert_equal({parent_email: [{error: :invalid}]}, student.errors.details)
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

  test 'sponsored? is true for migrated user with no authentication options' do
    student = create :student_in_picture_section
    student.migrate_to_multi_auth
    student.reload

    assert_empty student.authentication_options
    assert student.sponsored?
  end

  test 'should_disable_user_type? true if user_type present and oauth_provided_user_type' do
    user = build :user, user_type: User::TYPE_TEACHER
    user.expects(:oauth_provided_user_type).returns(true)
    assert user.should_disable_user_type?
  end

  test 'should_disable_user_type? false if user_type present and not oauth_provided_user_type' do
    user = build :user, user_type: User::TYPE_TEACHER
    user.expects(:oauth_provided_user_type).returns(false)
    refute user.should_disable_user_type?
  end

  test 'can_edit_password? is true for user with or without a password' do
    student1 = create :student
    refute_nil student1.encrypted_password
    assert student1.can_edit_password?

    student1 = create :student, :without_encrypted_password
    assert_nil student1.encrypted_password
    assert student1.can_edit_password?
  end

  test 'can_edit_password? is false for a sponsored student' do
    student1 = create :student_in_picture_section
    assert student1.sponsored?
    refute student1.can_edit_password?

    student2 = create :student_in_word_section
    assert student2.sponsored?
    refute student2.can_edit_password?
  end

  test 'can_edit_password? is true for student without a password' do
    student = create :student, :without_encrypted_password
    assert student.can_edit_password?
  end

  test 'can_edit_password? is true for teacher without a password' do
    teacher = create :teacher, :without_encrypted_password
    assert teacher.can_edit_password?
  end

  test 'can_edit_password? is false for user with no authentication options' do
    student = create :student_in_picture_section
    assert_empty student.authentication_options
    refute student.can_edit_password?
  end

  test 'can_edit_email? is true for user with password' do
    assert @student.can_edit_email?
  end

  test 'can_edit_email? is false for user with no authentication options' do
    student = create :student_in_picture_section
    assert_empty student.authentication_options
    refute student.can_edit_email?
  end

  test 'can_edit_email? is true for user with at least one authentication option' do
    teacher = create :teacher
    assert teacher.can_edit_email?
  end

  test 'can change own user type as a student with a password' do
    student = create :student
    refute_empty student.encrypted_password
    assert student.can_change_own_user_type?
  end

  test 'can change own user type as an oauth student' do
    student = create :student, :google_sso_provider
    assert student.can_change_own_user_type?
  end

  test 'can change own user type as a teacher with a password' do
    teacher = create :teacher
    refute_empty teacher.encrypted_password
    assert teacher.can_change_own_user_type?
  end

  test 'can change own user type as an oauth teacher' do
    teacher = create :teacher,
      encrypted_password: nil,
      provider: 'facebook',
      uid: '1111111'
    assert teacher.can_change_own_user_type?
  end

  test 'cannot change own user type as a student with a picture or secret words' do
    student = create :student_in_picture_section
    refute student.can_change_own_user_type?
  end

  test 'cannot change own user type as a student in a section' do
    student = create(:follower).student_user
    refute student.can_change_own_user_type?
  end

  test 'cannot change own user type as a teacher with sections' do
    section = create :section
    teacher = section.teacher
    refute_empty teacher.sections
    refute teacher.can_change_own_user_type?
  end

  test 'can delete own account if teacher' do
    user = create :teacher
    assert user.can_delete_own_account?
  end

  test 'can delete own account if independent student' do
    user = create :student
    refute user.teacher_managed_account?
    assert user.can_delete_own_account?
  end

  test 'cannot delete own account if teacher-managed student' do
    user = create :student_in_picture_section
    assert user.teacher_managed_account?
    refute user.can_delete_own_account?
  end

  test 'cannot delete own account if student in section' do
    section = create :section
    student = create(:follower, section: section).student_user
    refute student.can_delete_own_account?
  end

  test 'can_create_personal_login? is false for teacher' do
    refute @teacher.can_create_personal_login?
  end

  test 'can_create_personal_login? is true for student with teacher-managed account' do
    student = create :student
    student.stubs(:teacher_managed_account?).returns(true)
    assert student.can_create_personal_login?
  end

  test 'can_create_personal_login? is true for migrated student with oauth-only account' do
    student = create :student
    student.stubs(:migrated?).returns(true)
    student.stubs(:oauth_only?).returns(true)
    assert student.can_create_personal_login?
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
      student_without_password = create(:student, :without_encrypted_password)
      create(:follower, student_user: student_without_password, section: section)
      student_without_password.reload
      assert student_without_password.teacher_managed_account?
    end
  end

  test 'roster_managed_account? is false for teacher' do
    teacher = create :teacher
    refute teacher.roster_managed_account?
  end

  test 'roster_managed_account? is false for migrated student with more than one authentication option' do
    student = create :student
    student.authentication_options << create(:authentication_option)
    student.reload

    refute student.roster_managed_account?
  end

  test 'roster_managed_account? is false for migrated student not in an externally rostered section' do
    student = create :student
    section = create :section, login_type: Section::LOGIN_TYPE_EMAIL
    section.students << student
    student.reload

    refute student.roster_managed_account?
  end

  test 'roster_managed_account? is true for migrated student in an externally rostered section without a password' do
    student = create :student, :migrated_imported_from_google_classroom
    assert student.roster_managed_account?
  end

  test 'roster_managed_account? is false for migrated student in an externally rostered section with a password' do
    student = create :student, password: 'mypassword'
    section = create :section, login_type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM
    section.students << student
    student.reload

    refute student.roster_managed_account?
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

  test 'update_email_for does not update migrated user AuthenticationOption if provider and uid are not present' do
    user = create :user
    user.update_email_for(provider: nil, uid: nil, email: 'new@email.com')
    user.reload
    refute_equal User.hash_email('new@email.com'), user.hashed_email
  end

  test 'update_email_for does not update migrated user AuthenticationOption if no matching AuthenticationOption' do
    user = create :user
    google_auth_option = create :google_authentication_option, user: user, authentication_id: '123456'
    user.update_email_for(provider: AuthenticationOption::GOOGLE, uid: 'not-my-uid', email: 'new@email.com')
    google_auth_option.reload
    refute_equal User.hash_email('new@email.com'), google_auth_option.hashed_email
  end

  test 'update_email_for updates migrated user AuthenticationOption if matching AuthenticationOption' do
    uid = '123456'
    user = create :user
    google_auth_option = create :google_authentication_option, user: user, authentication_id: uid
    user.reload
    user.update_email_for(provider: AuthenticationOption::GOOGLE, uid: uid, email: 'new@email.com')
    google_auth_option.reload
    assert_equal User.hash_email('new@email.com'), google_auth_option.hashed_email
  end

  test 'update_primary_contact_info is false if email and hashed_email are nil' do
    user = create :user
    successful_save = user.update_primary_contact_info(new_email: nil, new_hashed_email: nil)
    refute successful_save
  end

  test 'update_primary_contact_info is false if email is nil for teacher' do
    teacher = create :teacher
    successful_save = teacher.update_primary_contact_info(new_email: nil)
    refute successful_save
  end

  test 'update_primary_contact_info adds new email option for teacher if no matches exist' do
    teacher = create :teacher, :with_google_authentication_option

    assert_equal 2, teacher.authentication_options.count
    refute_nil teacher.primary_contact_info

    successful_save = teacher.update_primary_contact_info(new_email: 'example@email.com')
    teacher.reload
    assert successful_save
    assert_equal 2, teacher.authentication_options.count
    assert_equal 'example@email.com', teacher.primary_contact_info.email
  end

  test 'update_primary_contact_info replaces email option for teacher if one already exists' do
    teacher = create :teacher

    assert_equal 1, teacher.authentication_options.count
    refute_nil teacher.primary_contact_info

    successful_save = teacher.update_primary_contact_info(new_email: 'second@email.com')
    teacher.reload
    assert successful_save
    assert_equal 1, teacher.authentication_options.count
    assert_equal 'second@email.com', teacher.primary_contact_info.email
  end

  test 'update_primary_contact_info oauth option replaces any existing email options for teacher' do
    teacher = create :teacher, :with_google_authentication_option
    existing_email = teacher.primary_contact_info.email

    assert_equal 2, teacher.authentication_options.count
    refute_nil teacher.primary_contact_info

    # Update primary to a different email
    teacher.update_primary_contact_info(new_email: 'example@email.com')
    teacher.reload
    assert_equal 2, teacher.authentication_options.count
    assert_equal 'example@email.com', teacher.primary_contact_info.email

    # Change back to original oauth email
    successful_save = teacher.update_primary_contact_info(new_email: existing_email)
    teacher.reload
    assert successful_save
    assert_equal 1, teacher.authentication_options.count
    assert_equal existing_email, teacher.primary_contact_info.email
  end

  test 'update_primary_contact_info recalculates hashed_email if both email and hashed_email are supplied for teacher' do
    teacher = create :teacher

    assert_equal 1, teacher.authentication_options.count
    refute_nil teacher.primary_contact_info

    successful_save = teacher.update_primary_contact_info(new_email: 'first@email.com', new_hashed_email: User.hash_email('second@email.com'))
    assert successful_save
    assert_equal 1, teacher.authentication_options.count
    assert_equal User.hash_email('first@email.com'), teacher.primary_contact_info.hashed_email
  end

  test 'update_primary_contact_info adds new email option for student if no matches exist' do
    student = create :student, :with_google_authentication_option

    assert_equal 2, student.authentication_options.count
    refute_nil student.primary_contact_info

    hashed_new_email = User.hash_email('example@email.com')
    successful_save = student.update_primary_contact_info(new_hashed_email: hashed_new_email)
    student.reload
    assert successful_save
    assert_equal 2, student.authentication_options.count
    assert_equal hashed_new_email, student.primary_contact_info.hashed_email
  end

  test 'update_primary_contact_info replaces email option for student if one already exists' do
    student = create :student

    assert_equal 1, student.authentication_options.count
    refute_nil student.primary_contact_info

    hashed_new_email = User.hash_email('second@email.com')
    successful_save = student.update_primary_contact_info(new_hashed_email: hashed_new_email)
    student.reload
    assert successful_save
    assert_equal 1, student.authentication_options.count
    assert_equal hashed_new_email, student.primary_contact_info.hashed_email
  end

  test 'update_primary_contact_info oauth option replaces any existing email options for student' do
    student = create :student, :with_google_authentication_option, email: 'student@email.com'
    existing_hashed_email = student.primary_contact_info.hashed_email

    assert_equal 2, student.authentication_options.count
    refute_nil student.primary_contact_info

    # Update primary to a different email
    hashed_new_email = User.hash_email('example@email.com')
    student.update_primary_contact_info(new_hashed_email: hashed_new_email)
    student.reload
    assert_equal 2, student.authentication_options.count
    assert_equal hashed_new_email, student.primary_contact_info.hashed_email

    # Change back to original oauth email
    successful_save = student.update_primary_contact_info(new_hashed_email: existing_hashed_email)
    student.reload
    assert successful_save
    assert_equal 1, student.authentication_options.count
    assert_equal existing_hashed_email, student.primary_contact_info.hashed_email
  end

  test 'update_primary_contact_info recalculates hashed_email if both email and hashed_email are supplied for student' do
    student = create :student

    assert_equal 1, student.authentication_options.count
    refute_nil student.primary_contact_info

    successful_save = student.update_primary_contact_info(new_email: 'first@email.com', new_hashed_email: User.hash_email('second@email.com'))
    assert successful_save
    assert_equal 1, student.authentication_options.count
    assert_equal User.hash_email('first@email.com'), student.primary_contact_info.hashed_email
  end

  test 'update_primary_contact_info fails safely if the new email is already taken for sponsored user' do
    taken_email = 'taken@example.org'
    create :student, email: taken_email
    update_primary_contact_info_fails_safely_for \
      create(:student_in_picture_section),
      new_email: taken_email
  end

  test 'update_primary_contact_info fails safely if the new email is already taken for email user' do
    taken_email = 'taken@example.org'
    create :student, email: taken_email
    update_primary_contact_info_fails_safely_for \
      create(:student),
      new_email: taken_email
  end

  test 'update_primary_contact_info fails safely if the new email is already taken for oauth user' do
    taken_email = 'taken@example.org'
    create :student, email: taken_email
    update_primary_contact_info_fails_safely_for \
      create(:student, :with_google_authentication_option),
      new_email: taken_email
  end

  def update_primary_contact_info_fails_safely_for(user, *params)
    original_primary_contact_info = user.primary_contact_info

    refute_creates_or_destroys AuthenticationOption do
      refute user.update_primary_contact_info(*params)
    end

    user.reload
    assert_equal original_primary_contact_info, user.primary_contact_info
  end

  def upgrade_to_personal_login_params(**args)
    {
      username: 'my_new_username',
      parent_email: 'parent@email.com',
      email: 'my@email.com',
      password: 'mypassword',
      password_confirmation: 'mypassword',
      secret_words: 'secret words',
    }.merge(args)
  end

  test 'upgrade_to_personal_login is false for teacher' do
    refute @teacher.upgrade_to_personal_login(upgrade_to_personal_login_params)
  end

  test 'upgrade_to_personal_login is false for word account with empty secret words' do
    word_student = create :student_in_word_section
    word_student.update!(secret_words: 'secret words')
    params = upgrade_to_personal_login_params(secret_words: '')

    refute word_student.upgrade_to_personal_login(params)
    assert_equal ['Secret words are required'], word_student.errors.full_messages
  end

  test 'upgrade_to_personal_login is false for word account with incorrect secret words' do
    word_student = create :student_in_word_section
    word_student.update!(secret_words: 'secret words')
    params = upgrade_to_personal_login_params(secret_words: 'incorrect words')

    refute word_student.upgrade_to_personal_login(params)
    assert_equal ['Secret words are invalid'], word_student.errors.full_messages
  end

  test 'upgrade_to_personal_login is false for migrated student if update_primary_contact_info fails' do
    student = create :student, :with_google_authentication_option
    student.stubs(:update_primary_contact_info!).raises(RuntimeError)
    params = upgrade_to_personal_login_params
    new_email = params[:email]

    refute student.upgrade_to_personal_login(params)
    student.reload
    refute_nil student.provider
    refute_equal User.hash_email(new_email), student.hashed_email
    refute_equal params[:username], student.username
    refute_equal params[:parent_email], student.parent_email
    refute student.valid_password?(params[:password])
  end

  test 'upgrade_to_personal_login is false for migrated student if update fails' do
    student = create :student, :with_google_authentication_option
    student.stubs(:update!).raises(ActiveRecord::RecordInvalid)
    params = upgrade_to_personal_login_params
    new_email = params[:email]

    refute student.upgrade_to_personal_login(params)
    student.reload
    refute_nil student.provider
    refute_equal User.hash_email(new_email), student.hashed_email
    refute_equal params[:username], student.username
    refute_equal params[:parent_email], student.parent_email
    refute student.valid_password?(params[:password])
  end

  test 'upgrade_to_personal_login is true for successfully updated migrated student' do
    student = create :student, :with_google_authentication_option
    params = upgrade_to_personal_login_params
    new_email = params[:email]

    assert student.upgrade_to_personal_login(params)
    student.reload
    refute_nil student.provider
    assert_equal 2, student.authentication_options.count
    assert_equal User.hash_email(new_email), student.hashed_email
    assert_equal params[:username], student.username
    assert_equal params[:parent_email], student.parent_email
    assert student.valid_password?(params[:password])
  end

  test 'downgrade_to_student sets user_type to student and clears cleartext emails' do
    user = create :teacher
    assert user.downgrade_to_student
    user.reload
    assert_equal User::TYPE_STUDENT, user.user_type
    assert_empty user.email
  end

  def email_preference_params(**args)
    {
      email_preference_opt_in: 'no',
      email_preference_request_ip: '127.0.0.1',
      email_preference_source: EmailPreference::ACCOUNT_TYPE_CHANGE,
      email_preference_form_kind: '0',
    }.merge(args)
  end

  test 'upgrade_to_teacher is false if updating primary contact info fails' do
    user = create :student
    original_primary_contact_info = user.primary_contact_info
    user.stubs(:update_primary_contact_info!).raises(RuntimeError)

    assert_equal 1, user.authentication_options.count
    refute_nil original_primary_contact_info

    refute user.upgrade_to_teacher('example@email.com', email_preference_params)
    user.reload
    assert_equal 1, user.authentication_options.count
    assert_equal original_primary_contact_info, user.primary_contact_info
    assert_nil EmailPreference.find_by_email('example@email.com')
  end

  test 'upgrade_to_teacher is false if user update fails' do
    user = create :student
    original_primary_contact_info = user.primary_contact_info
    user.stubs(:update!).raises(ActiveRecord::RecordInvalid)

    assert_equal 1, user.authentication_options.count
    refute_nil original_primary_contact_info

    refute user.upgrade_to_teacher('example@email.com', email_preference_params)
    user.reload
    assert_equal 1, user.authentication_options.count
    assert_equal original_primary_contact_info, user.primary_contact_info
    assert_nil EmailPreference.find_by_email('example@email.com')
  end

  test 'upgrade_to_teacher is true if new authentication option is created' do
    user = create :student, :with_google_authentication_option

    assert_equal 2, user.authentication_options.count

    assert user.upgrade_to_teacher('example@email.com', email_preference_params)
    user.reload
    assert_equal User::TYPE_TEACHER, user.user_type
    assert_equal 2, user.authentication_options.count
    assert_equal 'example@email.com', user.email
    email_preference = EmailPreference.find_by_email('example@email.com')
    refute email_preference.opt_in
    assert_equal '127.0.0.1', email_preference.ip_address
    assert_equal EmailPreference::ACCOUNT_TYPE_CHANGE, email_preference.source
    assert_equal '0', email_preference.form_kind
  end

  test 'upgrade_to_teacher is true if matching authentication option is found' do
    user = create :student, :with_google_authentication_option
    auth_option = create :authentication_option, user: user, email: 'example@email.com'

    assert_empty auth_option.email
    assert_equal 3, user.authentication_options.count

    email_preference_params = email_preference_params(email_preference_opt_in: 'yes')
    assert user.upgrade_to_teacher('example@email.com', email_preference_params)
    user.reload
    auth_option.reload
    assert_equal User::TYPE_TEACHER, user.user_type
    assert_equal 2, user.authentication_options.count
    assert_equal auth_option, user.primary_contact_info
    assert_equal 'example@email.com', auth_option.email
    email_preference = EmailPreference.find_by_email('example@email.com')
    assert email_preference.opt_in
    assert_equal '127.0.0.1', email_preference.ip_address
    assert_equal EmailPreference::ACCOUNT_TYPE_CHANGE, email_preference.source
    assert_equal '0', email_preference.form_kind
  end

  test 'upgrade_to_teacher given valid params should delete parent_email field' do
    parent_email = 'parent@email.com'
    user = User.create(@good_data.merge(parent_email: parent_email))
    assert_equal parent_email, user.parent_email
    assert user.upgrade_to_teacher('example@email.com', email_preference_params)
    user.reload
    assert_nil user.parent_email
  end

  def assert_parent_email_params_equals_email_preference(parent_email_params, email_preference)
    assert_equal parent_email_params[:parent_email_preference_email], email_preference.email
    assert_equal parent_email_params[:parent_email_preference_opt_in].casecmp?('yes'), email_preference.opt_in
    assert_equal parent_email_params[:parent_email_preference_request_ip], email_preference.ip_address
    assert_equal parent_email_params[:parent_email_preference_source], email_preference.source
  end

  test 'creating a student with parent email should create an email preference for the parent' do
    parent_email_params = @good_parent_email_params
    User.create(@good_data.merge(parent_email_params))
    email_preference = EmailPreference.find_by_email(parent_email_params[:parent_email_preference_email])
    assert_not_nil email_preference
    assert_parent_email_params_equals_email_preference parent_email_params, email_preference
  end

  test 'creating a student with parent email and opt-out should create an email preference for the parent' do
    parent_email_params = @good_parent_email_params.merge({parent_email_preference_opt_in: 'no'})
    User.create(@good_data.merge(parent_email_params))
    email_preference = EmailPreference.find_by_email(parent_email_params[:parent_email_preference_email])
    assert_not_nil email_preference
    assert_parent_email_params_equals_email_preference parent_email_params, email_preference
  end

  test 'updating a student with parent email should create an email preference for the parent' do
    parent_email_params = @good_parent_email_params
    user = User.create(@good_data)
    email_preference = EmailPreference.find_by_email(parent_email_params[:parent_email_preference_email])
    # There should be no email preference because no parent_email was defined.
    assert_nil email_preference
    user.update!(parent_email_params)
    email_preference = EmailPreference.find_by_email(parent_email_params[:parent_email_preference_email])
    # There should now be an email preference because the user was updated with a parent_email.
    assert_not_nil email_preference
    assert_parent_email_params_equals_email_preference parent_email_params, email_preference
  end

  test 'creating a student with parent email opt in and a nil email address should not create an email preference for the parent' do
    parent_email_params = @good_parent_email_params.merge({parent_email_preference_email: nil})
    User.create(@good_data.merge(parent_email_params))
    email_preference = EmailPreference.find_by_email(parent_email_params[:parent_email_preference_email])
    assert_nil email_preference
  end

  test 'creating a student with parent email opt in and an empty string email address should not create an email preference for the parent' do
    parent_email_params = @good_parent_email_params.merge({parent_email_preference_email: ''})
    User.create(@good_data.merge(parent_email_params))
    email_preference = EmailPreference.find_by_email(parent_email_params[:parent_email_preference_email])
    assert_nil email_preference
  end

  test 'creating a student with parent email opt in and a blank string email address should not create an email preference for the parent' do
    parent_email_params = @good_parent_email_params.merge({parent_email_preference_email: '    '})
    User.create(@good_data.merge(parent_email_params))
    email_preference = EmailPreference.find_by_email(parent_email_params[:parent_email_preference_email])
    assert_nil email_preference
  end

  test 'creating a student with parent email opt in and a nil source should not create an email preference for the parent' do
    parent_email_params = @good_parent_email_params.merge({parent_email_preference_source: nil})
    User.create(@good_data.merge(parent_email_params))
    email_preference = EmailPreference.find_by_email(parent_email_params[:parent_email_preference_email])
    assert_nil email_preference
  end

  test 'creating a student with parent email opt in and a nil request_ip should not create an email preference for the parent' do
    parent_email_params = @good_parent_email_params.merge({parent_email_preference_request_ip: nil})
    User.create(@good_data.merge(parent_email_params))
    email_preference = EmailPreference.find_by_email(parent_email_params[:parent_email_preference_email])
    assert_nil email_preference
  end

  test 'creating a student with no parent email preference should not create an email preference for the parent' do
    parent_email_params = @good_parent_email_params.merge({parent_email_preference_opt_in_required: '0'})
    User.create(@good_data.merge(parent_email_params))
    email_preference = EmailPreference.find_by_email(parent_email_params[:parent_email_preference_email])
    assert_nil email_preference
  end

  test 'creating a student with parent email preference and no parent_email should return an error' do
    parent_email_params = @good_parent_email_params.merge({parent_email_preference_email: nil})
    user = User.create(@good_data.merge(parent_email_params))
    assert user.errors[:parent_email_preference_email].length == 1
  end

  test 'creating a student with parent email preference and no opt-in should return an error' do
    parent_email_params = @good_parent_email_params.merge({parent_email_preference_opt_in: nil})
    user = User.create(@good_data.merge(parent_email_params))
    assert user.errors[:parent_email_preference_opt_in].length == 1
  end

  test 'creating a teacher with parent email preference should not create a parent email preference' do
    # This tests when someone starts filling out the parent email preference form on the student UI but then switches
    # to a Teacher form and submits that.
    parent_email_params = @good_parent_email_params.merge({user_type: 'teacher'})
    user = User.create(@good_data.merge(parent_email_params))
    assert user.errors[:parent_email_preference_opt_in].empty?
    # parent_email shouldn't be set for a teacher.
    assert_nil user.parent_email
    # no parent email_preference should be created for teachers.
    email_preference = EmailPreference.find_by_email(parent_email_params[:parent_email_preference_email])
    assert_nil email_preference
  end

  test 'google_classroom_student? is true if user belongs to a google classroom section as a student' do
    section = create(:section, login_type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM)
    user = create(:follower, section: section).student_user
    assert user.google_classroom_student?
  end

  test 'google_classroom_student? is false if user does not belong to any google classroom sections as a student' do
    user = create(:user)
    refute user.google_classroom_student?
  end

  test 'clever_student? is true if user belongs to a clever section as a student' do
    section = create(:section, login_type: Section::LOGIN_TYPE_CLEVER)
    user = create(:follower, section: section).student_user
    assert user.clever_student?
  end

  test 'clever_student? is false if user does not belong to any clever sections as a student' do
    user = create(:user)
    refute user.clever_student?
  end

  test 'oauth_student? is true if the user belongs to any oauth section as a student' do
    clever_section = create(:section, login_type: Section::LOGIN_TYPE_CLEVER)
    clever_user = create(:follower, section: clever_section).student_user
    assert clever_user.oauth_student?

    google_section = create(:section, login_type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM)
    google_user = create(:follower, section: google_section).student_user
    assert google_user.oauth_student?
  end

  test 'oauth_student? is false if the user does not belong to any oauth section as a student' do
    user = create(:user)
    refute user.oauth_student?
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
    User.track_level_progress(
      user_id: user_id,
      level_id: script_level.level_id,
      script_id: script_level.script_id,
      new_result: result,
      submitted: false,
      level_source_id: nil,
      pairing_user_ids: pairings
    )
  end

  test 'track_level_progress calls track_proficiency if new perfect csf score' do
    user = create :user
    csf_script = create :csf_script
    csf_lesson_group = create(:lesson_group, script: csf_script)
    create(:lesson, script: csf_script, lesson_group: csf_lesson_group)
    csf_script_level = create(:script_level, script: csf_script)

    User.expects(:track_proficiency).once
    track_progress(user.id, csf_script_level, 100)
  end

  test 'track_level_progress does not call track_proficiency if new perfect non-csf score' do
    user = create :user
    non_csf_script_level = create :script_level

    User.expects(:track_proficiency).never
    track_progress(user.id, non_csf_script_level, 100)
  end

  test 'track_level_progress does not call track_proficiency if old perfect score' do
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

  test 'track_level_progress does not call track_proficiency if new passing csf score' do
    user = create :user
    csf_script_level = Script.get_from_cache('20-hour').script_levels.third

    User.expects(:track_proficiency).never
    track_progress(user.id, csf_script_level, 25)
  end

  test 'track_level_progress does not call track_proficiency if hint used' do
    user = create :user
    csf_script_level = Script.get_from_cache('20-hour').script_levels.third
    create :hint_view_request,
      user_id: user.id,
      level_id: csf_script_level.level_id,
      script_id: csf_script_level.script_id

    User.expects(:track_proficiency).never
    track_progress(user.id, csf_script_level, 100)
  end

  test 'track_level_progress does not call track_proficiency if authored hint used' do
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

  test 'track_level_progress does not call track_proficiency when pairing' do
    user = create :user
    csf_script_level = Script.get_from_cache('20-hour').script_levels.third

    User.expects(:track_proficiency).never
    track_progress(user.id, csf_script_level, 100, pairings: [create(:user).id])
  end

  test 'track_level_progress does call track_profiency when manual_pass to perfect' do
    user = create :user
    csf_script = create :csf_script
    csf_lesson_group = create(:lesson_group, script: csf_script)
    create(:lesson, script: csf_script, lesson_group: csf_lesson_group)
    csf_script_level = create(:script_level, script: csf_script)

    UserLevel.create!(
      user: user,
      level: csf_script_level.level,
      script: csf_script_level.script,
      best_result: ActivityConstants::MANUAL_PASS_RESULT
    )

    User.expects(:track_proficiency).once
    track_progress(user.id, csf_script_level, 100)
  end

  test 'track_level_progress stops incrementing attempts for perfect results' do
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

  test 'track_level_progress does not overwrite the level_source_id of the navigator' do
    script_level = create :script_level
    student = create :student
    level_source = create :level_source, data: 'sample answer'

    User.track_level_progress(
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

    User.track_level_progress(
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

  test 'track_level_progress does not overwrite level_source_id with nil' do
    script_level = create :script_level
    user = create :user
    level_source = create :level_source, data: 'sample answer'
    create :user_level,
      user_id: user.id,
      script_id: script_level.script_id,
      level_id: script_level.level_id,
      level_source_id: level_source.id

    User.track_level_progress(
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
    real_teacher = create(:teacher)
    real_teacher.permission = UserPermission::AUTHORIZED_TEACHER
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

  test 'account_age_days should return days since account creation' do
    student = create :student, created_at: DateTime.now - 10
    assert student.account_age_days == 10
  end

  test 'first_sign_in returns time of first sign in' do
    now = DateTime.now.utc.iso8601

    student = create :student
    SignIn.create(
      user_id: student.id,
      sign_in_at: now,
      sign_in_count: 1
    )

    assert_equal now, student.first_sign_in_date.utc.iso8601
  end

  test 'days_since_first_sign_in returns days for student who has signed in' do
    student = create :student

    SignIn.create(
      user_id: student.id,
      sign_in_at: DateTime.now - 10,
      sign_in_count: 1
    )

    assert_equal 10, student.days_since_first_sign_in
  end

  test 'days_since_first_sign_in returns nil for student who has not signed in' do
    student = create :student

    assert_nil student.days_since_first_sign_in
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
    four_year_old = build :user, birthday: (Date.today - 4.years), provider: 'google_oauth2'
    assert_equal 4, four_year_old.age

    twenty_year_old = build :user, birthday: (Date.today - 20.years), provider: 'google_oauth2'
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
    four_year_old = build :user, birthday: (Date.today - 4.years), provider: 'clever'
    assert_equal 4, four_year_old.age

    twenty_year_old = build :user, birthday: (Date.today - 20.years), provider: 'clever'
    assert_equal 20, twenty_year_old.age
  end

  test "age is 21+ for Clever users over the age of 20" do
    twenty_something = create :user, birthday: (Date.today - 22.years), provider: 'clever'
    assert_equal '21+', twenty_something.age
  end

  test 'updating email is a no-op for students' do
    user = create :student

    assert_empty user.email

    user.update_primary_contact_info(new_email: 'student@example.com')
    user.reload

    assert_empty user.email
  end

  test 'users updating the email field must provide a valid email address' do
    user = create :teacher

    user.update_primary_contact_info(new_email: 'invalid@incomplete')
    refute user.valid?
    refute user.save
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

  test 'soft-deleting a user records a metric' do
    student = create :student

    Cdo::Metrics.expects(:push).with('User', includes_metrics(SoftDelete: 1))
    result = student.destroy

    assert_equal student, result
  end

  test 'soft-deleting a group of users records metrics' do
    student_a = create :student
    student_b = create :student

    Cdo::Metrics.expects(:push).with('User', includes_metrics(SoftDelete: 1)).twice
    result = User.destroy [student_a.id, student_b.id]

    assert_equal [student_a, student_b], result
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

  test 'undestroy restores recently soft-deleted projects' do
    Timecop.freeze do
      student = create :student
      with_channel_for student do |channel_id_a|
        with_channel_for student do |channel_id_b|
          # Student deleted channel_id_a a day before they were deleted
          # so we don't expect it to be restored when we undelete them.
          storage_apps.where(id: channel_id_a).update state: 'deleted', updated_at: Time.now
          assert_equal 'deleted', storage_apps.where(id: channel_id_a).first[:state]
          assert_equal 'active', storage_apps.where(id: channel_id_b).first[:state]

          Timecop.travel 1.day

          # Soft-deleting the student also soft-deletes their projects
          student.destroy
          assert_equal 'deleted', storage_apps.where(id: channel_id_a).first[:state]
          assert_equal 'deleted', storage_apps.where(id: channel_id_b).first[:state]

          Timecop.travel 1.day

          # Restoring the student only restores projects that were deleted along
          # with the student
          student.undestroy
          assert_equal 'deleted', storage_apps.where(id: channel_id_a).first[:state]
          assert_equal 'active', storage_apps.where(id: channel_id_b).first[:state]
        end
      end
    end
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

  test 'assign_script does overwrite assigned_at if pre-existing' do
    Timecop.travel(2017, 1, 2, 12, 0, 0) do
      UserScript.create!(user: @student, script: Script.first, assigned_at: DateTime.now)
    end

    Timecop.travel(2018, 3, 4, 12, 0, 0) do
      assert_does_not_create(UserScript) do
        user_script = @student.assign_script(Script.first)
        assert_equal Script.first.id, user_script.script_id
        assert_equal '2018-03-04 12:00:00 UTC', user_script.assigned_at.to_s
      end
    end
  end

  class AssignedCoursesAndScripts < ActiveSupport::TestCase
    setup do
      @student = create :student
      @unit_group = create :unit_group, name: 'course'
    end

    test "it returns assigned courses" do
      teacher = create :teacher
      section = create :section, user_id: teacher.id, unit_group: @unit_group
      Follower.create!(section_id: section.id, student_user_id: @student.id, user: teacher)

      assigned_courses = @student.assigned_courses
      assert_equal 1, assigned_courses.length

      assert_equal 'course', assigned_courses[0][:name]
    end

    test "it checks for assigned scripts, no assigned scripts" do
      refute @student.any_visible_assigned_scripts?
    end

    test "it checks for assigned scripts, assigned hidden script" do
      hidden_script = create :script, name: 'hidden-script', published_state: SharedConstants::PUBLISHED_STATE.beta
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
      hidden_script = create :script, name: 'hidden-script', published_state: SharedConstants::PUBLISHED_STATE.beta
      @student.assign_script(hidden_script)
      refute @student.assigned_course_or_script?
    end

    test "it checks for assigned courses and scripts, assigned visible script" do
      visible_script = create :script, name: 'visible-script', published_state: SharedConstants::PUBLISHED_STATE.preview
      @student.assign_script(visible_script)
      assert @student.assigned_course_or_script?
    end

    test "it checks for assigned courses and scripts, assigned course" do
      teacher = create :teacher
      section = create :section, user_id: teacher.id, unit_group: @unit_group
      Follower.create!(section_id: section.id, student_user_id: @student.id, user: teacher)
      assert @student.assigned_course_or_script?
    end

    test "it checks for assigned courses and scripts, assigned course and assigned visible script" do
      teacher = create :teacher
      section = create :section, user_id: teacher.id, unit_group: @unit_group
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

      unit_group = create :unit_group, name: 'csd'
      create :unit_group_unit, unit_group: unit_group, script: (create :script, name: 'csd1'), position: 1
      create :unit_group_unit, unit_group: unit_group, script: (create :script, name: 'csd2'), position: 2

      other_script = create :script, name: 'other'
      @student.assign_script(other_script)

      section = create :section, user_id: teacher.id, unit_group: unit_group
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

      unit_group = create :unit_group, name: 'testcourse'
      unit_group_unit1 = create :unit_group_unit, unit_group: unit_group, script: (create :script, name: 'testscript1'), position: 1
      create :unit_group_unit, unit_group: unit_group, script: (create :script, name: 'testscript2'), position: 2
      create :user_script, user: student, script: unit_group_unit1.script, started_at: (Time.now - 1.day)

      other_script = create :script, name: 'otherscript'
      create :user_script, user: student, script: other_script, started_at: (Time.now - 1.hour)

      section = create :section, user_id: teacher.id, unit_group: unit_group
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
      @unit_group = create :unit_group, name: 'csd'
    end
    test "it returns courses in which a teacher exists as a student" do
      grand_section = create :section, user_id: @grand_teacher.id, unit_group: @unit_group
      Follower.create!(section_id: grand_section.id, student_user_id: @teacher.id, user: @grand_teacher)

      courses = @teacher.section_courses
      assert_equal 1, courses.length
      assert_equal 'csd', courses[0].name
    end

    test "it returns courses in which a teacher exists as a teacher" do
      section = create :section, user_id: @teacher.id, unit_group: @unit_group
      Follower.create!(section_id: section.id, student_user_id: @student.id, user: @teacher)

      courses = @teacher.section_courses
      assert_equal 1, courses.length
      assert_equal 'csd', courses[0].name
    end

    test "it returns courses in which a student exists as a student" do
      section = create :section, user_id: @teacher.id, unit_group: @unit_group
      Follower.create!(section_id: section.id, student_user_id: @student.id, user: @teacher)

      courses = @student.section_courses
      assert_equal 1, courses.length
      assert_equal 'csd', courses[0].name
    end
  end

  test "section_scripts returns an empty array if user has no sections" do
    user = create :user
    assert_empty user.section_scripts
  end

  test "section_scripts returns assigned scripts and default scripts in assigned courses" do
    student = create :student
    single_script = create :script
    (create :section, script: single_script).students << student
    unit_group_unit = create :script
    course_with_script = create :unit_group
    create :unit_group_unit, unit_group: course_with_script, script: unit_group_unit, position: 1
    (create :section, unit_group: course_with_script).students << student

    assert_equal [single_script, unit_group_unit], student.section_scripts
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

  test 'from_omniauth: creates new user if user with matching credentials does not exist' do
    auth = OmniAuth::AuthHash.new(
      provider: 'google_oauth2',
      uid: '123456',
      credentials: {
        token: 'fake oauth token',
        expires_at: Time.now.to_i + 3600,
        refresh_token: 'fake refresh token',
      },
      info: {
        name: {first: 'Some', last: 'User'},
        user_type: 'student'
      },
    )
    params = {}

    assert_creates(User) do
      user = User.from_omniauth(auth, params)
      assert_equal 'migrated', user.provider
      assert_equal 'Some User', user.name
      assert_equal 'google_oauth2', user.primary_contact_info.credential_type
      assert_equal 'fake oauth token', user.primary_contact_info.data_hash[:oauth_token]
      assert_equal 'fake refresh token', user.primary_contact_info.data_hash[:oauth_refresh_token]
      assert_equal User::TYPE_STUDENT, user.user_type
    end
  end

  test 'from_omniauth: updates user oauth tokens if user with matching credentials exists' do
    uid = '123456'
    provider = 'google_oauth2'
    create :user, uid: uid, provider: provider
    auth = OmniAuth::AuthHash.new(
      provider: provider,
      uid: uid,
      credentials: {
        token: 'fake oauth token',
        expires_at: Time.now.to_i + 3600,
        refresh_token: 'fake refresh token',
      },
      info: {},
    )
    params = {}

    assert_does_not_create(User) do
      user = User.from_omniauth(auth, params)
      assert_equal 'fake oauth token', user.primary_contact_info.data_hash[:oauth_token]
      assert_equal 'fake refresh token', user.primary_contact_info.data_hash[:oauth_refresh_token]
      assert_equal 'google_oauth2', user.primary_contact_info.credential_type
    end
  end

  test 'from_omniauth: updates migrated user oauth tokens if authentication option with matching credentials exists' do
    uid = '654321'
    user = create :user
    google_auth_option = create :authentication_option, credential_type: AuthenticationOption::GOOGLE, authentication_id: uid, user: user
    auth = OmniAuth::AuthHash.new(
      provider: AuthenticationOption::GOOGLE,
      uid: uid,
      credentials: {
        token: 'fake oauth token',
        expires_at: Time.now.to_i + 3600,
        refresh_token: 'fake refresh token',
      },
      info: {},
    )
    params = {}

    assert_does_not_create(User) do
      User.from_omniauth(auth, params)
    end
    google_auth_option.reload
    assert_equal 'fake oauth token', google_auth_option.data_hash[:oauth_token]
    assert_equal 'fake refresh token', google_auth_option.data_hash[:oauth_refresh_token]
  end

  test 'managing_own_credentials? is true for users with email logins' do
    user = create :user
    assert user.managing_own_credentials?
  end

  test 'managing_own_credentials? is true for students with email logins' do
    user = create :student
    assert user.managing_own_credentials?
  end

  test 'managing_own_credentials? is false for users with oauth logins' do
    user = create :user, :sso_provider
    refute user.managing_own_credentials?
  end

  test 'managing_own_credentials? is false for students with sponsored logins' do
    user = create :student_in_picture_section
    refute user.managing_own_credentials?
  end

  test 'password_required? is false if user is not creating their own account' do
    user = create :student, :without_encrypted_password
    user.expects(:managing_own_credentials?).returns(false)
    refute user.password_required?
  end

  test 'new users require a password if no authentication provided' do
    assert_raises(ActiveRecord::RecordInvalid) do
      user = create :user, password: nil
      assert !user.errors[:password].empty?
    end
  end

  test 'password_required? is true for user changing their password' do
    user = create :user
    user.password = "mypassword"
    user.password_confirmation = "mypassword"
    assert user.password_required?
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
        sharing_disabled: false,
        has_ever_signed_in: @student.has_ever_signed_in?
      },
      @student.summarize
    )
  end

  test 'has_ever_signed_in? is false with no current_sign_in_at' do
    student = create :student
    assert_nil student.current_sign_in_at
    refute student.has_ever_signed_in?
  end

  test 'has_ever_signed_in? is true with current_sign_in_at' do
    student = create :student, current_sign_in_at: DateTime.now.utc
    refute_nil student.current_sign_in_at
    assert student.has_ever_signed_in?
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

  test 'lesson_extras_enabled?' do
    script = create :script, lesson_extras_available: true
    other_script = create :script, lesson_extras_available: true
    teacher = create :teacher
    student = create :student

    section1 = create :section, lesson_extras: true, script_id: script.id, user: teacher
    section1.add_student(student)
    section2 = create :section, lesson_extras: true, script_id: script.id, user: teacher
    section2.add_student(student)
    section3 = create :section, lesson_extras: true, script_id: other_script.id
    section3.add_student(teacher)

    assert student.lesson_extras_enabled?(script)
    refute student.lesson_extras_enabled?(other_script)

    assert teacher.lesson_extras_enabled?(script)
    assert teacher.lesson_extras_enabled?(other_script)

    refute (create :student).lesson_extras_enabled?(script)
    assert (create :teacher).lesson_extras_enabled?(script)
  end

  class HiddenIds < ActiveSupport::TestCase
    setup_all do
      @teacher = create :teacher

      @script = create(:script, hideable_lessons: true)
      @lesson1 = create(:lesson, script: @script, absolute_position: 1, relative_position: '1')
      @lesson2 = create(:lesson, script: @script, absolute_position: 2, relative_position: '2')
      @lesson3 = create(:lesson, script: @script, absolute_position: 3, relative_position: '3')
      @custom_s1_l1 = create(
        :script_level,
        script: @script,
        lesson: @lesson1,
        position: 1
      )
      @custom_s2_l1 = create(
        :script_level,
        script: @script,
        lesson: @lesson2,
        position: 1
      )
      @custom_s2_l2 = create(
        :script_level,
        script: @script,
        lesson: @lesson2,
        position: 2
      )
      create(:script_level, script: @script, lesson: @lesson3, position: 1)

      # explicitly disable LB mode so that we don't create a .course file
      Rails.application.config.stubs(:levelbuilder_mode).returns false
      @unit_group = create :unit_group

      @script2 = create :script
      @script3 = create :script
      create :unit_group_unit, position: 1, unit_group: @unit_group, script: @script
      create :unit_group_unit, position: 2, unit_group: @unit_group, script: @script2
      create :unit_group_unit, position: 2, unit_group: @unit_group, script: @script3
    end

    def put_student_in_section(student, teacher, script, unit_group=nil)
      section = create :section, user_id: teacher.id, script_id: script.try(:id), course_id: unit_group.try(:id)
      Follower.create!(section_id: section.id, student_user_id: student.id, user: teacher)
      section
    end

    # Helper method that sets up some hidden lessons for our two sections
    def hide_lessons_in_sections(section1, section2)
      # lesson 1 hidden in both sections
      SectionHiddenLesson.create(section_id: section1.id, stage_id: @lesson1.id)
      SectionHiddenLesson.create(section_id: section2.id, stage_id: @lesson1.id)

      # lesson 2 hidden in section 1
      SectionHiddenLesson.create(section_id: section1.id, stage_id: @lesson2.id)

      # lesson 3 hidden in section 2
      SectionHiddenLesson.create(section_id: section2.id, stage_id: @lesson3.id)
    end

    # Same thing as hide_lessons_in_sections, but hides scripts instead of lessons
    def hide_scripts_in_sections(section1, section2)
      # script hidden in both sections
      SectionHiddenScript.create(section_id: section1.id, script_id: @script.id)
      SectionHiddenScript.create(section_id: section2.id, script_id: @script.id)

      # script 2 hidden in section 1
      SectionHiddenScript.create(section_id: section1.id, script_id: @script2.id)

      # script 3 hidden in section 2
      SectionHiddenScript.create(section_id: section2.id, script_id: @script3.id)
    end

    test 'can get next_unpassed_visible_progression_level, progress, hidden' do
      student = create :student
      teacher = create :teacher
      twenty_hour = Script.twenty_hour_unit

      # User completed the second lesson
      twenty_hour.lessons[1].script_levels.each do |sl|
        UserLevel.create(
          user: student,
          level: sl.level,
          script: twenty_hour,
          attempts: 1,
          best_result: Activity::MINIMUM_PASS_RESULT
        )
      end

      # Hide the fifth lesson/lesson
      SectionHiddenLesson.create(
        section_id: put_student_in_section(student, teacher, twenty_hour).id,
        stage_id: 5
      )

      # Find the seventh lesson, since the 5th is hidden and 6th is unplugged
      next_visible_lesson = twenty_hour.lessons.find {|lesson| lesson.relative_position == 7}

      assert_equal(next_visible_lesson.script_levels.first, student.next_unpassed_visible_progression_level(twenty_hour))
    end

    test 'can get next_unpassed_visible_progression_level, last level complete, but script not complete, first hidden' do
      student = create :student
      teacher = create :teacher
      twenty_hour = Script.twenty_hour_unit

      UserLevel.create(
        user: student,
        level: twenty_hour.script_levels.last.level,
        script: twenty_hour,
        attempts: 1,
        best_result: Activity::MINIMUM_PASS_RESULT
      )

      # Hide the first lesson/lesson
      SectionHiddenLesson.create(
        section_id: put_student_in_section(student, teacher, twenty_hour).id,
        stage_id: 1
      )

      # Find the second lesson, since the 1st is hidden
      next_visible_lesson = twenty_hour.lessons.find {|lesson| lesson.relative_position == 2}

      assert_equal(next_visible_lesson.script_levels.first, student.next_unpassed_visible_progression_level(twenty_hour))
    end

    test "user in two sections, both attached to script" do
      student = create :student

      section1 = put_student_in_section(student, @teacher, @script)
      section2 = put_student_in_section(student, @teacher, @script)

      hide_lessons_in_sections(section1, section2)

      # when attached to script, we should hide only if hidden in every section
      assert_equal [@lesson1.id], student.get_hidden_lesson_ids(@script.name)

      # validate script_level_hidden? gives same result
      assert_equal true, student.script_level_hidden?(@lesson1.script_levels.first)
      assert_equal false, student.script_level_hidden?(@lesson2.script_levels.first)
      assert_equal false, student.script_level_hidden?(@lesson3.script_levels.first)
    end

    test "user in two sections, both attached to course" do
      student = create :student

      section1 = put_student_in_section(student, @teacher, @script, @unit_group)
      section2 = put_student_in_section(student, @teacher, @script, @unit_group)

      hide_scripts_in_sections(section1, section2)

      # when attached to course, we should hide only if hidden in every section
      assert_equal [@script.id], student.get_hidden_script_ids(@unit_group)

      # ignore any archived sections
      section2.hidden = true
      section2.save!
      student.reload
      assert_equal [@script.id, @script2.id], student.get_hidden_script_ids(@unit_group)
      section1.hidden = true
      section1.save!
      student.reload
      assert_equal [], student.get_hidden_script_ids(@unit_group)
    end

    test "user in two sections, both attached to course but no script" do
      student = create :student

      section1 = put_student_in_section(student, @teacher, nil, @unit_group)
      section2 = put_student_in_section(student, @teacher, nil, @unit_group)

      hide_scripts_in_sections(section1, section2)

      # when attached to course, we should hide only if hidden in every section
      assert_equal [@script.id], student.get_hidden_script_ids(@unit_group)

      # ignore any archived sections
      section2.hidden = true
      section2.save!
      student.reload
      assert_equal [@script.id, @script2.id], student.get_hidden_script_ids(@unit_group)
      section1.hidden = true
      section1.save!
      student.reload
      assert_equal [], student.get_hidden_script_ids(@unit_group)
    end

    test "user in two sections, neither attached to script" do
      student = create :student

      unattached_script = create(:script)
      section1 = put_student_in_section(student, @teacher, unattached_script)
      section2 = put_student_in_section(student, @teacher, unattached_script)

      hide_lessons_in_sections(section1, section2)

      # when not attached to script, we should hide when hidden in any section
      assert_equal [@lesson1.id, @lesson2.id, @lesson3.id], student.get_hidden_lesson_ids(@script.name)

      # validate script_level_hidden? gives same result
      assert_equal true, student.script_level_hidden?(@lesson1.script_levels.first)
      assert_equal true, student.script_level_hidden?(@lesson2.script_levels.first)
      assert_equal true, student.script_level_hidden?(@lesson3.script_levels.first)
    end

    test "user in two sections, neither attached to course" do
      student = create :student

      unattached_script = create(:script)
      section1 = put_student_in_section(student, @teacher, unattached_script)
      section2 = put_student_in_section(student, @teacher, unattached_script)

      hide_scripts_in_sections(section1, section2)

      # when not attached to course, we should hide when hidden in any section
      assert_equal [@script.id, @script2.id, @script3.id], student.get_hidden_script_ids(@unit_group)
    end

    test "user in two sections, one attached to script one not" do
      student = create :student

      attached_section = put_student_in_section(student, @teacher, @script)
      unattached_section = put_student_in_section(student, @teacher, create(:script))

      hide_lessons_in_sections(attached_section, unattached_section)

      # only the lessons hidden in the attached section are considered hidden
      assert_equal [@lesson1.id, @lesson2.id], student.get_hidden_lesson_ids(@script.name)

      # validate script_level_hidden? gives same result
      assert_equal true, student.script_level_hidden?(@lesson1.script_levels.first)
      assert_equal true, student.script_level_hidden?(@lesson2.script_levels.first)
      assert_equal false, student.script_level_hidden?(@lesson3.script_levels.first)
    end

    test "user in two sections, one attached to course one not" do
      student = create :student

      attached_section = put_student_in_section(student, @teacher, @script, @unit_group)
      unattached_section = put_student_in_section(student, @teacher, create(:script))

      hide_scripts_in_sections(attached_section, unattached_section)

      # only the scripts hidden in the attached section are considered hidden
      assert_equal [@script.id, @script2.id], student.get_hidden_script_ids(@unit_group)
    end

    test "user in no sections" do
      student = create :student

      assert_equal [], student.get_hidden_lesson_ids(@script.name)
    end

    test "teacher gets hidden lessons for sections they own" do
      teacher = create :teacher
      teacher_teacher = create :teacher
      student = create :student

      teacher_owner_section = put_student_in_section(student, teacher, @script)
      teacher_owner_section2 = put_student_in_section(student, teacher, @script)
      teacher_member_section = put_student_in_section(teacher, teacher_teacher, @script)

      # lesson 1 is hidden in the first section owned by the teacher
      SectionHiddenLesson.create(section_id: teacher_owner_section.id, stage_id: @lesson1.id)

      # lesson 1 and 2 are hidden in the second section owned by the teacher
      SectionHiddenLesson.create(section_id: teacher_owner_section2.id, stage_id: @lesson1.id)
      SectionHiddenLesson.create(section_id: teacher_owner_section2.id, stage_id: @lesson2.id)

      # lesson 3 is hidden in the section in which the teacher is a member
      SectionHiddenLesson.create(section_id: teacher_member_section.id, stage_id: @lesson3.id)

      # only the lessons hidden in the owned section are considered hidden
      expected = {
        teacher_owner_section.id => [@lesson1.id],
        teacher_owner_section2.id => [@lesson1.id, @lesson2.id]
      }
      assert_equal expected, teacher.get_hidden_lesson_ids(@script.id)
    end

    test "teacher gets hidden scripts for sections they own" do
      teacher = create :teacher
      teacher_teacher = create :teacher
      student = create :student

      teacher_owner_section = put_student_in_section(student, teacher, @script, @unit_group)
      teacher_owner_section2 = put_student_in_section(student, teacher, @script, @unit_group)
      teacher_member_section = put_student_in_section(teacher, teacher_teacher, @script, @unit_group)

      # lesson 1 is hidden in the first section owned by the teacher
      SectionHiddenScript.create(section_id: teacher_owner_section.id, script_id: @script.id)

      # lesson 1 and 2 are hidden in the second section owned by the teacher
      SectionHiddenScript.create(section_id: teacher_owner_section2.id, script_id: @script.id)
      SectionHiddenScript.create(section_id: teacher_owner_section2.id, script_id: @script2.id)

      # lesson 3 is hidden in the section in which the teacher is a member
      SectionHiddenScript.create(section_id: teacher_member_section.id, script_id: @script3.id)

      # only the scripts hidden in the owned section are considered hidden
      expected = {
        teacher_owner_section.id => [@script.id],
        teacher_owner_section2.id => [@script.id, @script2.id]
      }
      assert_equal expected, teacher.get_hidden_script_ids(@unit_group)
    end

    test "script_hidden?" do
      teacher = create :teacher
      student = create :student
      section = put_student_in_section(student, teacher, @script, @unit_group)
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
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    regular_level = create :level
    create :script_level, script: script, lesson: lesson, levels: [regular_level]

    # two different levels, backed by the same template level
    template_level = create :level
    template_backed_level1 = create :level, project_template_level_name: template_level.name
    create :script_level, script: script, lesson: lesson, levels: [template_backed_level1]
    template_backed_level2 = create :level, project_template_level_name: template_level.name
    create :script_level, script: script, lesson: lesson, levels: [template_backed_level2]

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
    channel_token = create :channel_token, level: Script.twenty_hour_unit.levels.first, storage_user: user
    user.generate_progress_from_storage_id(channel_token.storage_id, script.name)

    user_scripts = UserScript.where(user: user)
    assert_equal 0, user_scripts.length
  end

  test 'primary email for migrated user is readable from user model' do
    user = create(:teacher)
    user.provider = 'migrated'
    user.primary_contact_info.update(email: 'eric@code.org')
    assert_equal user.email, user.primary_contact_info.email
    assert_equal user.email, user.primary_contact_info.email
  end

  test 'within_united_states? is false without UserGeo record' do
    user = create :student
    assert_empty user.user_geos
    refute user.within_united_states?
  end

  test 'within_united_states? is false if latest UserGeo has incomplete data' do
    # Based on behavior in trackable.rb where we push a UserGeo with just
    # user_id and ip_address, no other geo information
    user = create :student
    Timecop.freeze do
      create :user_geo, :seattle, user: user
      Timecop.travel 1
      create :user_geo, user: user
    end
    assert_equal 2, user.user_geos.count
    refute user.within_united_states?
  end

  test 'within_united_states? is false if latest UserGeo from another country' do
    user = create :student
    Timecop.freeze do
      create :user_geo, :seattle, user: user
      Timecop.travel 1
      create :user_geo, :sydney, user: user
    end
    assert_equal 2, user.user_geos.count
    refute user.within_united_states?
  end

  test 'within_united_states? is true if latest UserGeo from the United States' do
    user = create :student
    Timecop.freeze do
      create :user_geo, :sydney, user: user
      Timecop.travel 1
      create :user_geo, :seattle, user: user
    end
    assert_equal 2, user.user_geos.count
    assert user.within_united_states?
  end

  test 'user_levels_by_user_by_level' do
    users = (1..3).map {create :user}
    script = Script.twenty_hour_unit
    script_levels = script.script_levels.first(2)
    script_levels.each do |script_level|
      users.first(2).each do |user|
        create :user_level, user: user, level: script_level.level, script: script
      end
    end

    result = nil
    assert_queries(1) do
      result = User.user_levels_by_user_by_level(users, script)
    end

    assert_equal(
      {
        users[0].id => {
          script_levels[0].level_id => UserLevel.find_by(user: users[0], level: script_levels[0].level),
          script_levels[1].level_id => UserLevel.find_by(user: users[0], level: script_levels[1].level)
        },
        users[1].id => {
          script_levels[0].level_id => UserLevel.find_by(user: users[1], level: script_levels[0].level),
          script_levels[1].level_id => UserLevel.find_by(user: users[1], level: script_levels[1].level)
        },
        users[2].id => {}
      },
      result
    )
  end

  test 'find_by_email_or_hashed_email returns nil when no user is found' do
    assert_nil User.find_by_email_or_hashed_email 'nonexistent@example.org'
  end

  test 'find_by_email_or_hashed_email returns nil when input is blank' do
    create :student_in_picture_section
    assert_nil User.find_by_email_or_hashed_email nil
    assert_nil User.find_by_email_or_hashed_email ''
  end

  test 'find_by_email_or_hashed_email locates a single-auth user by email' do
    user = create :teacher
    assert_equal user, User.find_by_email_or_hashed_email(user.email)
  end

  test 'find_by_email_or_hashed_email locates a single-auth user by hashed email' do
    email = 'student@example.org'
    user = create :student, email: email
    assert_equal user, User.find_by_email_or_hashed_email(email)
  end

  test 'find_by_email_or_hashed_email locates a multi-auth user by email' do
    user = create :teacher
    assert_equal user, User.find_by_email_or_hashed_email(user.email)
  end

  test 'find_by_email_or_hashed_email locates a multi-auth user by hashed email' do
    email = 'student@example.org'
    user = create :student, email: email
    assert_equal user, User.find_by_email_or_hashed_email(email)
  end

  test 'find_by_email returns nil when no user is found' do
    assert_nil User.find_by_email 'fake_email'
  end

  test 'find_by_email returns nil when input is blank' do
    create :student_in_picture_section
    assert_nil User.find_by_email nil
    assert_nil User.find_by_email ''
  end

  test 'find_by_email locates a single-auth teacher by email' do
    teacher = create :teacher
    assert_equal teacher, User.find_by_email(teacher.email)
  end

  test 'find_by_email does not locate a single-auth student by email' do
    email = 'student@example.org'
    create :student, email: email
    assert_nil User.find_by_email email
  end

  test 'find_by_email locates a multi-auth teacher by email' do
    teacher = create :teacher
    assert_equal teacher, User.find_by_email(teacher.email)
  end

  test 'find_by_email locates a multi-auth teacher by non-primary email' do
    teacher = create :teacher
    second_option = create :authentication_option, user: teacher
    assert_equal teacher, User.find_by_email(second_option.email)
  end

  test 'find_by_email does not locate a multi-auth student by email' do
    email = 'student@example.org'
    create :student, email: email
    assert_nil User.find_by_email email
  end

  test 'find_by_hashed_email returns nil when no user is found' do
    assert_nil User.find_by_hashed_email 'fake_hash'
  end

  test 'find_by_hashed_email returns nil when input is blank' do
    create :student_in_picture_section
    assert_nil User.find_by_hashed_email nil
    assert_nil User.find_by_hashed_email ''
  end

  test 'find_by_hashed_email locates a single-auth user by email' do
    user = create :teacher
    assert_equal user, User.find_by_hashed_email(user.hashed_email)
  end

  test 'find_by_hashed_email locates a single-auth user by hashed email' do
    email = 'student@example.org'
    user = create :student, email: email
    assert_equal user, User.find_by_hashed_email(User.hash_email(email))
  end

  test 'find_by_hashed_email locates a multi-auth user by email' do
    user = create :teacher
    assert_equal user, User.find_by_hashed_email(user.hashed_email)
  end

  test 'find_by_hashed_email locates a multi-auth user by hashed email' do
    email = 'student@example.org'
    user = create :student, email: email
    assert_equal user, User.find_by_hashed_email(User.hash_email(email))
  end

  test 'find_by_credential returns nil when no matching user is found' do
    user = create :student, :clever_sso_provider

    assert_nil User.find_by_credential(
      type: AuthenticationOption::CLEVER,
      id: 'mismatched_id_' + user.primary_contact_info.authentication_id
    )
  end

  test 'find_by_credential locates migrated SSO user' do
    original_uid = 'test-uid'
    user = create :student, :clever_sso_provider, uid: original_uid

    User.expects(:find_by).never
    assert_equal user,
      User.find_by_credential(
        type: AuthenticationOption::CLEVER,
        id: original_uid
      )
  end

  test 'find_credential returns matching AuthenticationOption if one exists for migrated user' do
    user = create :user, :google_sso_provider
    assert_equal user.authentication_options.first, user.find_credential(AuthenticationOption::GOOGLE)
  end

  test 'find_credential returns nil if no matching AuthenticationOption for migrated user' do
    user = create :user, :clever_sso_provider
    assert_nil user.find_credential(AuthenticationOption::GOOGLE)
  end

  test 'find_credential returns matching hash for non-migrated user if provider matches' do
    user = create :user, :google_sso_provider, :demigrated
    expected_cred = {credential_type: AuthenticationOption::GOOGLE, authentication_id: user.uid}
    assert_equal expected_cred, user.find_credential(AuthenticationOption::GOOGLE)
  end

  test 'find_credential returns nil for non-migrated user if provider does not match' do
    user = create :user, :demigrated
    assert_nil user.find_credential(AuthenticationOption::GOOGLE)
  end

  test 'not depended_upon_for_login? for student' do
    student = create :student
    refute student.depended_upon_for_login?
  end

  test 'not depended_upon_for_login? for teacher with student with personal login' do
    student = create :student, :in_email_section
    teacher = student.sections_as_student.first.teacher
    refute teacher.depended_upon_for_login?
  end

  test 'not depended_upon_for_login? for teacher with student that has other teachers' do
    student = create :student, :in_picture_section
    teacher = student.sections_as_student.first.teacher
    student.sections_as_student << create(:section)

    student.reload
    assert_equal 2, student.sections_as_student.size
    refute teacher.depended_upon_for_login?
  end

  test 'depended_upon_for_login? if teacher has a teacher-managed student with no other teachers' do
    student = create :student_in_picture_section
    teacher = student.sections_as_student.first.teacher
    section = create :section, user: teacher
    section.students << student

    assert teacher.depended_upon_for_login?
  end

  test 'depended_upon_for_login? if teacher has a roster-managed student with no other teachers' do
    student = create :student, :google_sso_provider
    section = create :section, login_type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM
    section.students << student
    another_section = create :section, user: section.teacher, login_type: Section::LOGIN_TYPE_EMAIL
    another_section.students << student

    assert section.teacher.depended_upon_for_login?
  end

  test 'dependent_students for student: returns empty array' do
    student = create :student
    assert_empty student.dependent_students
  end

  test 'dependent_students for teacher: does not return other teachers' do
    section = create :section
    another_teacher = create :teacher
    section.students << another_teacher

    assert_empty section.teacher.dependent_students
  end

  test 'dependent_students for teacher: does not return students with personal logins' do
    section = create :section
    create(:follower, section: section)

    assert_empty section.teacher.dependent_students
  end

  test 'dependent_students for teacher: does not return students without personal logins that have other teachers' do
    student = create :student_in_word_section
    teacher = student.teachers.first
    another_section = create :section
    another_section.students << student

    assert_empty teacher.dependent_students
  end

  test 'dependent_students for teacher: returns students without personal logins that have no other teachers' do
    student = create :student_in_word_section
    teacher = student.teachers.first
    another_word_section = create :section, user: teacher, login_type: Section::LOGIN_TYPE_WORD
    another_word_section.students << student

    assert_equal [student.summarize], teacher.dependent_students
  end

  test 'dependent_students for teacher: returns students in rostered sections without passwords that have no other teachers' do
    student = create :student, :google_sso_provider, encrypted_password: nil
    section = create :section, login_type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM
    section.students << student

    assert_equal [student.summarize], section.teacher.dependent_students
  end

  test 'last section id' do
    teacher = create :teacher
    section1 = create :section, teacher: teacher
    assert_equal section1.id, teacher.last_section_id

    create :follower, section: section1
    assert_nil section1.students.first.last_section_id

    # selects the most recently created section
    section2 = create :section, teacher: teacher
    assert_equal section2.id, teacher.last_section_id

    # ignores hidden sections
    section2.hidden = true
    section2.save!
    assert_equal section1.id, teacher.last_section_id

    # ignores deleted sections
    section3 = create :section, teacher: teacher
    assert_equal section3.id, teacher.last_section_id
    section3.delete
    assert_equal section1.id, teacher.last_section_id
  end

  test 'find_channel_owner finds channel owner' do
    student = create :student
    with_channel_for student do |storage_app_id, storage_id|
      encrypted_channel_id = storage_encrypt_channel_id storage_id, storage_app_id
      result = User.find_channel_owner encrypted_channel_id
      assert_equal student, result
    end
  end

  test 'find_channel_owner returns nil for channel with no owner' do
    with_anonymous_channel do |storage_app_id, storage_id|
      encrypted_channel_id = storage_encrypt_channel_id storage_id, storage_app_id
      result = User.find_channel_owner encrypted_channel_id
      assert_nil result
    end
  end

  test 'find_channel_owner returns nil for a malformed channel id' do
    assert_nil User.find_channel_owner 'not-a-channel-id'
  end

  test 'user_school_info count is > 0 and school info is incomplete' do
    user_school_info = create :user_school_info
    teacher = user_school_info.user
    school_info = create :school_info, country: nil, school_id: nil, validation_type: SchoolInfo::VALIDATION_NONE
    refute teacher.update(school_info: school_info)
    assert_includes teacher.errors.full_messages, "School info cannot add new school id"
  end

  test 'user_school_info_count == 0 and school info is not complete' do
    teacher = create :teacher
    school_info = create :school_info, country: nil, school_id: nil, validation_type: SchoolInfo::VALIDATION_NONE
    assert teacher.update(school_info: school_info)
    assert_equal teacher.user_school_infos.count, 1
  end

  test 'user_school_info_count == 0 and school info is complete' do
    teacher = create :teacher
    school_info = create :school_info
    assert teacher.update(school_info: school_info)
    assert_equal teacher.user_school_infos.count, 1
  end

  test 'count is > 0 and school info is complete' do
    user_school_info = create :user_school_info
    teacher = user_school_info.user
    school_info = create :school_info
    assert teacher.update(school_info: school_info)
    assert_equal teacher.user_school_infos.count, 2
  end

  test 'can grant admin role with only google oauth, codeorg account' do
    email = 'fernhunt@code.org'
    migrated_teacher = create(:teacher, :google_sso_provider, email: email, password: nil)

    assert_equal 1, migrated_teacher.authentication_options.count
    migrated_teacher.update!(admin: true)

    assert migrated_teacher.valid?
    assert migrated_teacher.errors[:admin].empty?
  end

  test 'cannot grant admin role when unmigrated teacher account' do
    unmigrated_teacher_without_password = create :teacher, :demigrated
    unmigrated_teacher_without_password.update_attribute(:encrypted_password, '')

    assert_raises(ActiveRecord::RecordInvalid) do
      unmigrated_teacher_without_password.update!(admin: true)
    end

    refute unmigrated_teacher_without_password.reload.admin?
    assert_equal 3, unmigrated_teacher_without_password.errors[:admin].count
    assert_equal ["Admin must be a migrated user", "Admin must be a code.org account with only google oauth", "Admin cannot have a password"], unmigrated_teacher_without_password.errors.full_messages
  end

  test 'cannot grant admin role with multiple authentication options' do
    email = 'fernhunt@code.org'
    migrated_teacher = create(:teacher, :google_sso_provider, email: email)
    create(:facebook_authentication_option, user: migrated_teacher)

    assert_equal 2, migrated_teacher.authentication_options.count

    assert_raises(ActiveRecord::RecordInvalid) do
      migrated_teacher.update!(admin: true)
    end

    refute migrated_teacher.reload.admin?
    assert_equal ["Admin must be a code.org account with only google oauth", "Admin cannot have a password"], migrated_teacher.errors.full_messages
  end

  test 'cannot grant admin role when google authentication option is not present' do
    email = 'annieeasley@code.org'
    migrated_teacher = create(:teacher, email: email)

    assert_raises(ActiveRecord::RecordInvalid) do
      migrated_teacher.update!(admin: true)
    end

    refute migrated_teacher.reload.admin?
    assert_equal ["Admin must be a code.org account with only google oauth", "Admin cannot have a password"], migrated_teacher.errors.full_messages
  end

  test 'cannot grant admin role when not a codeorg account' do
    email = 'milesmorales@gmail.com'
    migrated_teacher = create(:teacher, :google_sso_provider, email: email)

    assert_equal migrated_teacher.authentication_options.count, 1

    assert_raises(ActiveRecord::RecordInvalid) do
      migrated_teacher.update!(admin: true)
    end

    refute migrated_teacher.reload.admin?
    assert migrated_teacher.errors[:admin].length == 2
    assert_equal ["Admin must be a code.org account with only google oauth", "Admin cannot have a password"], migrated_teacher.errors.full_messages
  end

  test 'can grant admin role when in development environment' do
    with_rack_env(:development) do
      email = 'katherinejohnson@code.org'
      migrated_teacher = create(:teacher, email: email)

      assert migrated_teacher.update(admin: true)

      assert migrated_teacher.reload.admin?
    end
  end

  test 'can grant admin role when in adhoc environment' do
    with_rack_env(:adhoc) do
      email = 'dorothyvaughan@code.org'
      migrated_teacher = create(:teacher, email: email)
      assert migrated_teacher.update(admin: true)

      assert migrated_teacher.reload.admin?
    end
  end

  test 'display_captcha returns false for new user with uninitialized section attempts hash' do
    user = create :user
    assert_equal false, user.display_captcha?
  end

  test 'section attempts last reset value resets if more than 24 hours has passed' do
    user = create :user
    user.properties = {'section_attempts': 5, 'section_attempts_last_reset': DateTime.now - 1}
    # invoking display_captcha? will return false without causing section_attempts values to be reset
    assert_equal false, user.display_captcha?
    # now we mimic joining a section, which should reset attempts and then increment
    user.increment_section_attempts
    user.reload
    assert_equal 1, user.num_section_attempts
  end

  test 'section attempts value increments if less than 24 hours has passed' do
    user = create :user
    user.increment_section_attempts
    assert_equal 1, user.properties['section_attempts']
  end
end
