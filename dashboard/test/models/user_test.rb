# -*- coding: utf-8 -*-

require 'test_helper'

class UserTest < ActiveSupport::TestCase
  setup do
    @good_data = { email: 'foo@bar.com', password: 'foosbars', name: 'tester', user_type: User::TYPE_STUDENT, age: 28}
    @good_data_young = { email: 'foo@bar.com', password: 'foosbars', name: 'tester', user_type: User::TYPE_STUDENT, age: 8}
  end

  test "log in with password with pepper" do
    assert Devise.pepper

    user = User.create! @good_data

    # if password is already peppered we don't need to change the hashed pw
    assert_no_change('user.reload.encrypted_password') do
      assert user.valid_password?("foosbars")
      assert !user.valid_password?("foosbarsasdasds")
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
      assert !user.valid_password?("foosbarsasdasds")
    end

    # doesn't change second time
    assert_no_change('user.reload.encrypted_password') do
      assert user.valid_password?("foosbars")
      assert !user.valid_password?("foosbarsasdasds")
    end
  end

  test "cannot create user with panda in name" do
    user = User.create(@good_data.merge({name: panda_panda}))
    assert !user.valid?
    assert user.errors[:name].length == 1
  end

  test "cannot create user with panda in email" do
    user = User.create(@good_data.merge({email: "#{panda_panda}@panda.com"}))
    assert !user.valid?
    assert user.errors[:email].length == 1
  end

  test "cannot create user with invalid email" do
    user = User.create(@good_data.merge({email: 'foo@bar'}))
    assert !user.valid?
    assert user.errors[:email].length == 1
  end

  test "cannot create young user with invalid email" do
    user = User.create(@good_data_young.merge({email: 'foo@bar'}))
    assert !user.valid?
    assert user.errors[:email].length == 1
  end

  test "cannot create user with no type" do
    user = User.create(@good_data.merge(user_type: nil))
    assert !user.valid?
    assert user.errors[:user_type].length == 1
  end

  test "cannot create user with no name" do
    user = User.create(@good_data.merge(name: nil))
    assert !user.valid?
    assert user.errors[:name].length == 1
  end

  test "cannot create user with invalid type" do
    user = User.create(@good_data.merge(user_type: 'xxxxx'))
    assert !user.valid?
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
      assert_difference('User.count') do
        user = User.create(@good_data.merge({age: '7', email: 'new@email.com'}))

        assert_equal Date.new(Date.today.year - 7, Date.today.month, Date.today.day), user.birthday
        assert_equal 7, user.age
      end
    end
  end

  test "can create a user with age 21+" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      assert_difference('User.count') do
        user = User.create(@good_data.merge({age: '21+', email: 'new@email.com'}))

        assert_equal Date.new(Date.today.year - 21, Date.today.month, Date.today.day), user.birthday
        assert_equal "21+", user.age
      end
    end
  end

  test "cannot create a user with age that's not a number" do
    assert_no_difference('User.count') do
      user = User.create(@good_data.merge({age: 'old', email: 'new@email.com'}))
      assert_equal ["Age is not included in the list"], user.errors.full_messages
      # we don't care about this error message that much because users
      # should not be able to select -1 (they have a dropdown from
      # 4..100)
    end
  end

  test "cannot create a user with negative age" do
    assert_no_difference('User.count') do
      user = User.create(@good_data.merge({age: -15, email: 'new@email.com'}))
      assert_equal ["Age is not included in the list"], user.errors.full_messages
      # we don't care about this error message that much because users
      # should not be able to select -1 (they have a dropdown from
      # 4..100)
    end
  end

  test "cannot create a user with too large age" do
    assert_no_difference('User.count') do
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
    assert user.age

    user.save!

    user = User.find(user.id)

    assert_equal "21+", user.age
  end

  test "corrects age when saving a user with invalid age" do
    user = create :user, age: 10

    user.update_attribute(:birthday, Time.now - 1.month) # hacky

    user = User.find(user.id)

    user.age = 24
    assert_equal "21+", user.age
    assert user.age

    user.save!

    user = User.find(user.id)

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
    assert_difference('User.count') do
      User.create!(user_type: 'student', name: 'Student without email', password: 'xxxxxxxx', provider: 'manual', age: 12)
    end
  end

  test "cannot create self-managed user without email or hashed email" do
    assert_no_difference('User.count') do
      User.create(user_type: 'student', name: 'Student without email', password: 'xxxxxxxx', hashed_email: '', email: '', age: 12)
    end
  end

  test "cannot create teacher without email" do
    assert_no_difference('User.count') do
      User.create(user_type: 'teacher', name: 'Bad Teacher', password: 'xxxxxxxx', provider: 'manual')
    end
  end

  test "cannot make an account without email a teacher" do
    user = User.create(user_type: 'student', name: 'Student without email', password: 'xxxxxxxx', provider: 'manual')

    user.user_type = 'teacher'
    assert !user.save
  end

  test "cannot make an account without email an admin" do
    user = User.create(user_type: 'student', name: 'Student without email', password: 'xxxxxxxx', provider: 'manual')

    user.admin = true
    assert !user.save
  end

  test "cannot create admin without email" do
    assert_no_difference('User.count') do
      User.create(user_type: 'student', admin: true, name: 'Wannabe admin', password: 'xxxxxxxx', provider: 'manual')
    end
  end

  test "gallery" do
    user = create(:user)
    assert_equal [], user.gallery_activities

    create(:activity, user: user) # not saved to gallery
    assert_equal [], user.gallery_activities

    activity2 = create(:activity, user: user)
    ga2 = GalleryActivity.create!(activity: activity2, user: user)
    assert_equal [ga2], user.reload.gallery_activities

    create(:activity, user: user) # not saved to gallery
    assert_equal [ga2], user.reload.gallery_activities

    activity4 = create(:activity, user: user)
    ga4 = GalleryActivity.create!(activity: activity4, user: user)
    assert_equal [ga4, ga2], user.reload.gallery_activities
  end

  test "short name" do
    assert_equal 'Laurel', create(:user, :name => 'Laurel Fan').short_name # first name last name
    assert_equal 'Winnie', create(:user, :name => 'Winnie the Pooh').short_name # middle name
    assert_equal "D'Andre", create(:user, :name => "D'Andre Means").short_name # punctuation ok
    assert_equal '樊瑞', create(:user, :name => '樊瑞').short_name # ok, this isn't actually right but ok for now
    assert_equal 'Laurel', create(:user, :name => 'Laurel').short_name # just one name
    assert_equal 'some', create(:user, :name => '  some whitespace in front  ').short_name # whitespace in front
  end

  test "initial" do
    assert_equal 'L', create(:user, :name => 'Laurel Fan').initial # first name last name
    assert_equal 'W', create(:user, :name => 'Winnie the Pooh').initial # middle name
    assert_equal "D", create(:user, :name => "D'Andre Means").initial # punctuation ok
    assert_equal '樊', create(:user, :name => '樊瑞').initial # ok, this isn't actually right but ok for now
    assert_equal 'L', create(:user, :name => 'Laurel').initial # just one name
    assert_equal 'S', create(:user, :name => '  some whitespace in front  ').initial # whitespace in front
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
    assert_equal nil, User.find_for_authentication(email: {'$acunetix' => 1})
    # this used to raise a mysql error, now we sanitize it into a nonsense string
  end

  test "creating manual provider user without username generates username" do
    user = User.create(@good_data.merge({provider: User::PROVIDER_MANUAL}))
    assert_equal 'tester', user.username
  end

  test 'can get next unfinished level if not completed any unplugged levels' do
    user = create :user
    twenty_hour = Script.twenty_hour_script
    twenty_hour.script_levels.each do |script_level|
      next if script_level.level.game.unplugged? # skip all unplugged
      next if script_level.chapter > 33
      UserLevel.create(user: user, level: script_level.level, script: twenty_hour,
                       attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
    end
    assert_equal(35, user.next_unpassed_progression_level(twenty_hour).chapter)
  end

  test 'can get next unfinished level, not tainted by other user progress' do
    user = create :user
    twenty_hour = Script.twenty_hour_script
    twenty_hour.script_levels.each do |script_level|
      next if script_level.chapter > 33
      UserLevel.create(user: create(:user), level: script_level.level, script: twenty_hour,
                       attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
    end
    assert_equal(2, user.next_unpassed_progression_level(twenty_hour).chapter)
  end

  test 'user is created with secret picture and word' do
    user = create :user
    assert user.secret_picture
    assert user.secret_words
    assert user.secret_words !~ /SecretWord/ # using the actual word not the object to_s
  end

  test 'reset_secret_picture' do
    user = create :user
    user.secret_picture_id = nil
    user.save!

    # don't have one
    assert !user.secret_picture

    user.reset_secret_picture
    # now you do
    assert user.secret_picture

    # there's only 22 of them and this is random, so it is possible to
    # get the same password again

    pictures = 1.upto(5).map do
      user.reset_secret_picture
      user.secret_picture
    end

    assert pictures.uniq.length > 1
  end

  test 'reset_secret_words' do
    user = create :user
    user.secret_words = nil
    user.save!

    # don't have one
    assert !user.secret_words

    user.reset_secret_words
    # now you do
    assert user.secret_words

    words = 1.upto(5).map do
      user.reset_secret_words
      user.secret_words
    end

    assert words.uniq.length > 1
  end

  test 'users under 13 have hashed email not plaintext email' do
    user = create :user, birthday: Date.new(2010, 10, 4), email: 'will_be_hashed@email.xx'

    assert user.age < 13
    assert !user.email.present?
    assert user.hashed_email.present?
  end

  test 'users over 13 have plaintext email and hashed email' do
    user = create :user, birthday: Date.new(1990, 10, 4), email: 'will_be_hashed@email.xx'

    assert user.age.to_i > 13
    assert user.email.present?
    assert user.hashed_email.present?
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

  test 'changing user from over 13 to under 13 removes email and adds hashed_email' do
    older_user = create :user

    assert older_user.email

    older_user.age = 10
    older_user.save!

    assert older_user.email.blank?
    assert older_user.hashed_email
  end

  test 'changing user to teacher saves email' do
    student = create :user, age: 10, email: 'email@old.xx'

    assert student.email.blank?
    assert student.hashed_email

    student.update_attributes(user_type: 'teacher', email: 'email@old.xx')
    student.save!

    assert_equal 'email@old.xx', student.email
    assert_equal '21+', student.age
  end

  test 'under 13' do
    user = create :user
    assert !user.under_13?

    user.age = 13
    assert !user.under_13?
    user.save!
    assert !user.under_13?

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

  test "send reset password for older user" do
    user = create :user, age: 20, password: 'oldone'

    assert User.send_reset_password_instructions(email: user.email)

    mail = ActionMailer::Base.deliveries.first
    assert_equal [user.email], mail.to
    assert_equal 'Code.org reset password instructions', mail.subject
    user = User.find(user.id)
    old_password = user.encrypted_password

    assert mail.body.to_s =~ /reset_password_token=(.+)"/
    # HACK: Fix my syntax highlighting "
    token = $1

    User.reset_password_by_token(reset_password_token: token,
                                 password: 'newone',
                                 password_confirmation: 'newone')

    user = User.find(user.id)
    # password was changed
    assert old_password != user.encrypted_password
  end

  test 'send reset password for younger user' do
    email = 'email@email.xx'
    user = create :user, age: 10, email: email

    User.send_reset_password_instructions(email: email)

    mail = ActionMailer::Base.deliveries.first
    assert_equal [email], mail.to
    assert_equal 'Code.org reset password instructions', mail.subject
    user = user.reload
    assert user.reset_password_token
  end

  test 'send reset password for user without age' do
    email = 'email@email.xx'
    user = create :user, age: 10, email: email

    user.update_attribute(:birthday, nil) # hacky

    user = User.find(user.id)
    assert !user.age

    User.send_reset_password_instructions(email: email)

    mail = ActionMailer::Base.deliveries.first
    assert_equal [email], mail.to
    assert_equal 'Code.org reset password instructions', mail.subject
    user = user.reload
    assert !user.age
    assert user.reset_password_token
  end

  test 'actually reset password for user without age' do
    email = 'email@email.xx'
    user = create :user, age: 10, email: email

    user.update_attribute(:birthday, nil) # hacky

    user = User.find(user.id)
    assert !user.age

    old_password = user.encrypted_password

    user.reset_password('goodpassword', 'goodpassword')

    # changed password
    assert user.reload.encrypted_password != old_password
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

    start_date = Time.now - 3.months

    twenty_hour = Script.twenty_hour_script
    hoc = Script.find_by(name: 'hourofcode')

    # do a level that is both in script 1 and hoc
    [twenty_hour, hoc].each do |script|
      UserLevel.create!(user_id: user.id, level_id: Script.twenty_hour_script.script_levels[1].level.id, script: script,
                        created_at: start_date, updated_at: start_date)
    end

    user.backfill_user_scripts
    assert_equal [twenty_hour, hoc], user.working_on_scripts
  end

  test "user scripts backfills started_at and completed_at" do
    begin
      start_date = Time.now - 15.days
      progress_date = Time.now - 4.days

      user = create(:student)
      script = Script.find_by_name("course2")
      sl1 = script.script_levels[1]
      sl2 = script.script_levels[5]

      UserLevel.record_timestamps = false # ooh
      UserLevel.create!(user_id: user.id, level_id: sl1.level.id, script: script,
                        created_at: start_date, updated_at: start_date)

      UserLevel.create!(user_id: user.id, level_id: sl2.level.id, script: script,
                        created_at: progress_date, updated_at: progress_date)

      assert_creates(UserScript) do
        user.backfill_user_scripts
      end

      user_script = UserScript.last
      assert_equal start_date.to_i, user_script.started_at.to_i
      assert_equal progress_date.to_i, user_script.last_progress_at.to_i
      assert_equal nil, user_script.assigned_at
      assert_equal nil, user_script.completed_at
    ensure
      UserLevel.record_timestamps = true
    end
  end

  test "backfill user_scripts backfills assigned_at" do
    begin
      Follower.record_timestamps = false

      assigned_date = Time.now - 20.days

      student = create :student
      section = create :section, script: Script.find_by_name('course1')
      create :follower, student_user: student, section: section, created_at: assigned_date

      # pretend we created this script before we had the callback to create user_scripts
      UserScript.last.destroy

      assert_creates(UserScript) do
        student.backfill_user_scripts
      end

      user_script = UserScript.last
      assert_equal nil, user_script.started_at
      assert_equal nil, user_script.last_progress_at
      assert_equal assigned_date.to_i, user_script.assigned_at.to_i
      assert_equal nil, user_script.completed_at

    ensure
      UserLevel.record_timestamps = true
    end
  end

  def complete_script_for_user(user, script, completed_date = Time.now)
    # complete all except last level a day earlier
    script.script_levels[0..-2].each do |sl|
      UserLevel.create!(user_id: user.id, level_id: sl.level_id, script: script, best_result: 100,
                        created_at: completed_date - 1.day, updated_at: completed_date - 1.day)
    end

    # completed last level
    sl = script.script_levels.last
    UserLevel.create!(user_id: user.id, level_id: sl.level_id, script: script, best_result: 100,
                      created_at: completed_date, updated_at: completed_date)
  end

  test "backfill user_scripts backfills completed_at" do
    begin
      UserLevel.record_timestamps = false

      completed_date = Time.now - 20.days

      student = create :student
      script = Script.find_by_name('playlab')

      complete_script_for_user(student, script, completed_date)

      assert_creates(UserScript) do
        student.backfill_user_scripts
      end

      user_script = UserScript.last
      assert_equal completed_date.to_i - 1.day, user_script.started_at.to_i
      assert_equal completed_date.to_i, user_script.last_progress_at.to_i
      assert_equal nil, user_script.assigned_at
      assert_equal completed_date.to_i, user_script.completed_at.to_i

    ensure
      UserLevel.record_timestamps = true
    end
  end

  test "backfill user_scripts does not backfill completed_at if last level not passed" do
    begin
      UserLevel.record_timestamps = false

      completed_date = Time.now - 20.days

      student = create :student
      script = Script.find_by_name('playlab')

      # complete the script
      complete_script_for_user(student, script, completed_date)

      # and then modify so the last level is...
      sl = script.script_levels.last
      ul = UserLevel.where(user_id: student.id, level_id: sl.level_id).first
      ul.best_result = 10 # ... not passed
      ul.save!

      assert_creates(UserScript) do
        student.backfill_user_scripts
      end

      user_script = UserScript.last
      assert_equal completed_date.to_i - 1.day, user_script.started_at.to_i
      assert_equal completed_date.to_i, user_script.last_progress_at.to_i
      assert_equal nil, user_script.assigned_at
      assert_equal nil, user_script.completed_at

    ensure
      UserLevel.record_timestamps = true
    end
  end

  test "needs_to_backfill_user_scripts?" do
    user = create :student
    assert !user.needs_to_backfill_user_scripts?

    script = Script.find_by_name("course2")

    create :user_level, user: user, level: script.script_levels.first.level, script: script
    # now has progress
    assert user.needs_to_backfill_user_scripts?

    assert_creates(UserScript) do
      user.backfill_user_scripts
    end

    # now is backfilled (has a user script)
    user = user.reload
    assert !user.needs_to_backfill_user_scripts?
  end

  test 'update_with_password does not require current password for users without passwords' do
    student = create(:student)
    student.update_attribute(:encrypted_password, '')

    assert student.encrypted_password.blank?

    assert student.update_with_password(name: "JADENDUMPLING",
                                         email: "jaden.ke1@education.nsw.gov.au",
                                         password: "[FILTERED]",
                                         password_confirmation: "[FILTERED]",
                                         current_password: "",
                                         locale: "en-us",
                                         gender: "",
                                         age: "10")

    assert_equal "JADENDUMPLING", student.name
  end

  test 'track_proficiency adds proficiency if necessary and no hint used' do
    script = create :script
    level_concept_difficulty = create :level_concept_difficulty
    # Defaults with repeat_loops_{d1,d2,d3,d4,d5}_count = {0,2,0,3,0}.
    user_proficiency = create :user_proficiency

    User.track_proficiency(
      user_proficiency.user_id, script.id, level_concept_difficulty.level_id)

    user_proficiency = UserProficiency.
      where(user_id: user_proficiency.user_id).
      first
    assert !user_proficiency.nil?
    assert_equal 0, user_proficiency.repeat_loops_d1_count
    assert_equal 2 + 1, user_proficiency.repeat_loops_d2_count
    assert_equal 0, user_proficiency.repeat_loops_d3_count
    assert_equal 3, user_proficiency.repeat_loops_d4_count
    assert_equal 0, user_proficiency.repeat_loops_d5_count
  end

  test 'track_proficiency creates proficiency if necessary and no hint used' do
    script = create :script
    level_concept_difficulty = create :level_concept_difficulty
    student = create :student

    User.track_proficiency(
      student.id, script.id, level_concept_difficulty.level_id)

    user_proficiency = UserProficiency.where(user_id: student.id).first
    assert !user_proficiency.nil?
    assert_equal 0, user_proficiency.repeat_loops_d1_count
    assert_equal 1, user_proficiency.repeat_loops_d2_count
    assert_equal 0, user_proficiency.repeat_loops_d3_count
    assert_equal 0, user_proficiency.repeat_loops_d4_count
    assert_equal 0, user_proficiency.repeat_loops_d5_count
  end

  test 'track_proficiency does not update basic_proficiency_at if already proficient' do
    TIME = '2015-01-02 03:45:43'
    script = create :script
    level = create :level
    student = create :student
    level_concept_difficulty = LevelConceptDifficulty.
      create(level: level, events: 5)
    user_proficiency = UserProficiency.create(
      user_id: student.id, sequencing_d3_count: 6, repeat_loops_d4_count: 7,
      events_d5_count: 8, basic_proficiency_at: TIME)

    User.track_proficiency(
      user_proficiency.user_id, script.id, level_concept_difficulty.level_id)

    user_proficiency = UserProficiency.
      where(user_id: user_proficiency.user_id).
      first
    assert !user_proficiency.nil?
    assert_equal TIME, user_proficiency.basic_proficiency_at
  end

  test 'track_proficiency updates if newly proficient' do
    script = create :script
    level = create :level
    level_concept_difficulty = LevelConceptDifficulty.
      create(level_id: level.id, events: 5)
    student = create :student
    user_proficiency = UserProficiency.create(
      user_id: student.id, sequencing_d3_count: 3, repeat_loops_d3_count: 3,
      events_d3_count: 2)

    User.track_proficiency(
      user_proficiency.user_id, script.id, level_concept_difficulty.level_id)

    user_proficiency = UserProficiency.
      where(user_id: user_proficiency.user_id).
      first
    assert !user_proficiency.nil?
    assert !user_proficiency.basic_proficiency_at.nil?
  end

  test 'track_proficiency does not update basic_proficiency_at if not proficient' do
    script = create :script
    level_concept_difficulty = create :level_concept_difficulty
    user_proficiency = create :user_proficiency

    User.track_proficiency(
      user_proficiency.user_id, script.id, level_concept_difficulty.level_id)

    user_proficiency = UserProficiency.
      where(user_id: user_proficiency.user_id).
      first
    assert !user_proficiency.nil?
    assert user_proficiency.basic_proficiency_at.nil?
  end

  test 'track_level_progress_sync calls track_proficiency if new perfect score' do
    script_level = create :script_level
    student = create :student

    User.expects(:track_proficiency).once

    User.track_level_progress_sync(student.id, script_level.level_id, script_level.script_id, 100, false)
  end

  test 'track_level_progress_sync does not call track_proficiency if old perfect score' do
    script_level = create :script_level
    student = create :student
    create :user_level, user_id: student.id, script_id: script_level.script_id, level_id: script_level.level_id, best_result: 100

    User.expects(:track_proficiency).never

    User.track_level_progress_sync(student.id, script_level.level_id, script_level.script_id, 100, false)
  end

  test 'track_level_progress_sync does not call track_proficiency if new passing score' do
    script_level = create :script_level
    student = create :student

    User.expects(:track_proficiency).never

    User.track_level_progress_sync(student.id, script_level.level_id, script_level.script_id, 25, false)
  end

  test 'track_level_progress_sync does not call track_proficiency if hint used' do
    script_level = create :script_level
    student = create :student
    create :hint_view_request, user_id: student.id,
      level_id: script_level.level_id, script_id: script_level.script_id

    User.expects(:track_proficiency).never

    User.track_level_progress_sync(student.id, script_level.level_id, script_level.script_id, 100, false)
  end

  test 'track_level_progress_sync does not call track_proficiency if authored hint used' do
    script_level = create :script_level
    student = create :student
    AuthoredHintViewRequest.create(user_id: student.id,
      level_id: script_level.level_id, script_id: script_level.script_id)

    User.expects(:track_proficiency).never

    User.track_level_progress_sync(student.id, script_level.level_id, script_level.script_id, 100, false)
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

    assert_equal nil, User.normalize_gender('some nonsense')
    assert_equal nil, User.normalize_gender('')
    assert_equal nil, User.normalize_gender(nil)
  end

  test 'can create user with same name as deleted user' do
    deleted_user = create(:user, name: 'Same Name')
    deleted_user.destroy

    create(:user, name: 'Same Name')
  end

  test 'generate username' do
    def create_user_with_username(username)
      user = create(:user)
      user.update_attribute(:username, username)
    end
    # username regex: /\A[a-z0-9\-\_\.]+\z/

    # new name
    assert_equal 'captain_picard', UserHelpers.generate_username(User, "Captain Picard")

    # first prefix
    create_user_with_username 'captain_picard'
    assert_equal 'captain_picard1', UserHelpers.generate_username(User, "Captain Picard")

    # collisions are not numeric
    assert_equal 'captain', UserHelpers.generate_username(User, "Captain")
    assert_equal 'captain_p', UserHelpers.generate_username(User, "Captain    P")

    create_user_with_username 'captain'
    create_user_with_username 'captain1'
    create_user_with_username 'captain2'
    create_user_with_username 'captain55'

    assert_equal 'captain56', UserHelpers.generate_username(User, "Captain")

    assert_equal "d_andre_means", UserHelpers.generate_username(User, "D'Andre Means")

    create_user_with_username 'coder'
    create_user_with_username 'coder1'
    create_user_with_username 'coder99'
    create_user_with_username 'coder556'
    assert_equal "coder5561", UserHelpers.generate_username(User, 'coder556')

    # short names
    assert_equal "coder_a", UserHelpers.generate_username(User, 'a')

    # long names
    assert_equal "this_is_a_really", UserHelpers.generate_username(User, 'This is a really long name' + ' blah' * 10)

    # parens
    assert_equal "kermit_the_frog", UserHelpers.generate_username(User, "Kermit (the frog)")

    # non-ascii names
    assert /coder\d{1,10}/ =~ UserHelpers.generate_username(User, '樊瑞')
    assert /coder\d{1,10}/ =~ UserHelpers.generate_username(User, 'فاطمة بنت أسد')
  end

  test 'generates usernames' do
    names = ['a', 'b', 'Captain Picard', 'Captain Picard', 'Captain Picard', 'this is a really long name blah blah blah blah blah blah']
    expected_usernames = %w(coder_a coder_b captain_picard captain_picard1 captain_picard2 this_is_a_really)

    i = 0
    users = names.map do |name|
      User.create!(@good_data.merge(name: name, email: "test_email#{i+=1}@test.xx")) # use real create method not the factory
    end

    assert_equal expected_usernames, users.collect(&:username)
  end

  test 'email confirmation required for teachers' do
    user = create :teacher, email: 'my_email@test.xx', confirmed_at: nil
    assert user.confirmation_required?
    assert !user.confirmed_at
  end

  test 'email confirmation not required for students' do
    user = create :student, email: 'my_email@test.xx', confirmed_at: nil
    assert !user.confirmation_required?
    assert !user.confirmed_at
  end

  test 'student and teacher relationships' do
    student = create :student
    teacher = create :teacher
    section = create :section, user_id: teacher.id

    follow = Follower.create!(section_id: section.id, student_user_id: student.id, user_id: teacher.id)

    teacher.reload
    student.reload

    assert_equal [follow], teacher.followers
    assert_equal [follow], student.followeds

    other_user = create :student

    assert !student.student_of?(student)
    assert !student.student_of?(other_user)
    assert student.student_of?(teacher)

    assert !teacher.student_of?(student)
    assert !teacher.student_of?(other_user)
    assert !teacher.student_of?(teacher)

    assert !other_user.student_of?(student)
    assert !other_user.student_of?(other_user)
    assert !other_user.student_of?(teacher)

    assert_equal [], other_user.teachers
    assert_equal [], other_user.students

    assert_equal [], teacher.teachers
    assert_equal [student], teacher.students

    assert_equal [teacher], student.teachers
    assert_equal [], student.students
  end

  test "authorized teacher" do
    # you can't just create your own authorized teacher account
    fake_teacher = create :teacher
    assert fake_teacher.teacher?
    assert !fake_teacher.authorized_teacher?

    # you have to be in a cohort
    c = create :cohort
    c.teachers << (real_teacher = create(:teacher))
    c.save!
    assert real_teacher.teacher?
    assert real_teacher.authorized_teacher?

    # admins should be authorized teachers too
    admin = create :teacher
    admin.admin = true
    admin.save!
    assert admin.teacher?
    assert admin.authorized_teacher?
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
    assert !student_without_password.can_edit_account? # only in a picture section

    # join word section
    create(:follower, student_user: student_without_password, section: word_section)
    student_without_password.reload
    assert student_without_password.can_edit_account? # only in a picture section

    student_with_password = create(:student, encrypted_password: 'xxxxxx')

    # join picture section
    create(:follower, student_user: student_with_password, section: picture_section)
    student_with_password.reload
    assert student_with_password.can_edit_account? # only in a picture section

    # join word section
    create(:follower, student_user: student_with_password, section: word_section)
    student_with_password.reload
    assert student_with_password.can_edit_account? # only in a picture section

    student_with_oauth = create(:student, encrypted_password: nil, provider: 'facebook', uid: '1111111')

    # join picture section
    create(:follower, student_user: student_with_oauth, section: picture_section)
    student_with_oauth.reload
    assert student_with_oauth.can_edit_account? # only in a picture section

    # join word section
    create(:follower, student_user: student_with_oauth, section: word_section)
    student_with_oauth.reload
    assert student_with_oauth.can_edit_account? # only in a picture section
  end

end
