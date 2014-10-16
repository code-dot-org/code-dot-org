# -*- coding: utf-8 -*-

require 'test_helper'

class UserTest < ActiveSupport::TestCase
  setup do
    @good_data = { email: 'foo@bar.com', password: 'foosbars', name: 'tester', user_type: User::TYPE_STUDENT, age: 28}
    @good_data_young = { email: 'foo@bar.com', password: 'foosbars', name: 'tester', user_type: User::TYPE_STUDENT, age: 8}
    
    ActionMailer::Base.deliveries.clear
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

  test "cannot create user with invalid email" do
    user = User.create(@good_data.merge({email: 'foo@bar'}))
    assert user.errors.messages.length == 1
  end

  test "cannot create young user with invalid email" do
    user = User.create(@good_data_young.merge({email: 'foo@bar'}))
    assert user.errors.messages.length == 1
  end

  test "cannot create user with short username" do
    user = User.create(@good_data.merge({username: 'tiny'}))
    assert user.errors.messages.length == 1
  end

  test "cannot create user with long username" do
    user = User.create(@good_data.merge({username: 'superreallydoublelongusername'}))
    assert user.errors.messages.length == 1
  end

  test "cannot create user with no type" do
    user = User.create(@good_data.merge(user_type: nil))
    assert user.errors.messages.length == 1
  end

  test "cannot create user with no name" do
    user = User.create(@good_data.merge(name: nil))
    assert user.errors.messages.length == 1
  end

  test "cannot create user with invalid type" do
    user = User.create(@good_data.merge(user_type: 'xxxxx'))
    assert user.errors.messages.length == 1
  end

  test "cannot create user with username with whitespace" do
    user = User.create(@good_data.merge({username: 'bo gus'}))
    assert user.errors.messages.length == 1
  end

  test "cannot create user with username with duplicate email" do
    # actually create a user
    user = User.create!(@good_data)

    # Now create second user 
    user = User.create(@good_data.merge({username: 'user.12-35'}))
    assert_equal ['Email has already been taken'], user.errors.full_messages

    # Now create second user with duplicate username with different case
    user = User.create(@good_data.merge({username: 'user.12-3', email: @good_data[:email].upcase}))
    assert_equal ['Email has already been taken'], user.errors.full_messages
  end


  test "cannot create young user with username with duplicate email" do
    # actually create a user
    user = User.create!(@good_data_young)

    # Now create second user 
    user = User.create(@good_data_young.merge({username: 'user.12-35',
                                               hashed_email: User.hash_email(@good_data_young[:email])}))
    assert_equal ['Email has already been taken'], user.errors.full_messages

    # Now create second user with duplicate username with different case
    user = User.create(@good_data_young.merge({username: 'user.12-35',
                                               hashed_email: User.hash_email(@good_data_young[:email].upcase)}))
    assert_equal ['Email has already been taken'], user.errors.full_messages
  end

  test "cannot create user with username with duplicate username" do
    # actually create a user
    user = User.create(@good_data.merge(username: 'duplicate'))
    #puts user.errors.messages.inspect
    assert user.valid?

    # now create second user
    user = User.create(@good_data.merge(email: 'OTHER@bar.com', username: 'duplicate'))
    assert_equal ['Username has already been taken'], user.errors.full_messages
  end

  test "can create a user with age" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      assert_difference('User.count') do
        user = User.create(@good_data.merge({age: '7', username: 'anewone', email: 'new@email.com'}))

        assert_equal Date.new(Date.today.year - 7, Date.today.month, Date.today.day), user.birthday
        assert_equal 7, user.age
      end
    end
  end


  test "cannot create a user with age that's not a number" do
    assert_no_difference('User.count') do
      user = User.create(@good_data.merge({age: 'old', username: 'anewone', email: 'new@email.com'}))
      assert_equal ["Age is not a number"], user.errors.full_messages
      # we don't care about this error message that much because users
      # should not be able to select -1 (they have a dropdown from
      # 4..100)
    end
  end

  test "cannot create a user with negative age" do
    assert_no_difference('User.count') do
      user = User.create(@good_data.merge({age: -15, username: 'anewone', email: 'new@email.com'}))
      assert_equal ["Age must be greater than -1"], user.errors.full_messages
      # we don't care about this error message that much because users
      # should not be able to select -1 (they have a dropdown from
      # 4..100)
    end
  end

  test "cannot create a user with too large age" do
    assert_no_difference('User.count') do
      user = User.create(@good_data.merge({age: 15000000, username: 'anewone', email: 'new@email.com'}))
      assert_equal ["Age must be less than 110"], user.errors.full_messages
      # we don't care about this error message that much because users
      # should not be able to select -1 (they have a dropdown from
      # 4..100)
    end
  end

  test "can update a user with age" do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0) do
      user = User.create(@good_data.merge({age: '7', username: 'anewone', email: 'new@email.com'}))
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
    assert_equal 24, user.age
    assert user.age

    user.save!

    user = User.find(user.id)
    
    assert_equal 24, user.age
  end

  test "does not update birthday if age is the same" do
    user = User.create(@good_data.merge({age: '7', username: 'anewone', email: 'new@email.com'}))
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
      User.create!(username: 'student', user_type: 'student', name: 'Student without email', password: 'xxxxxxxx', provider: 'manual', age: 12)
    end
  end


  test "cannot create self-managed user without email or hashed email" do
    assert_no_difference('User.count') do
      User.create(username: 'student', user_type: 'student', name: 'Student without email', password: 'xxxxxxxx', hashed_email: '', email: '', age: 12)
    end
  end

  test "cannot create teacher without email" do
    assert_no_difference('User.count') do
      User.create(username: 'badteacher', user_type: 'teacher', name: 'Bad Teacher', password: 'xxxxxxxx', provider: 'manual')
    end
  end

  test "cannot make an account without email a teacher" do
    user = User.create(username: 'student', user_type: 'student', name: 'Student without email', password: 'xxxxxxxx', provider: 'manual')

    user.user_type = 'teacher'
    assert !user.save
  end


  test "cannot make an account without email an admin" do
    user = User.create(username: 'student', user_type: 'student', name: 'Student without email', password: 'xxxxxxxx', provider: 'manual')

    user.admin = true
    assert !user.save
  end

  test "cannot create admin without email" do
    assert_no_difference('User.count') do
      User.create(username: 'badteacher', user_type: 'student', admin: true, name: 'Wannabe admin', password: 'xxxxxxxx', provider: 'manual')
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
    assert_equal 'Laurel', create(:user, :name => 'Laurel Fan', :username => 'laurelfan').short_name # first name last name
    assert_equal 'Winnie', create(:user, :name => 'Winnie the Pooh').short_name # middle name
    assert_equal "D'Andre", create(:user, :name => "D'Andre Means").short_name # punctuation ok
    assert_equal '樊瑞', create(:user, :name => '樊瑞').short_name # ok, this isn't actually right but ok for now
    assert_equal 'Laurel', create(:user, :name => 'Laurel').short_name # just one name
    assert_equal 'some', create(:user, :name => '  some whitespace in front  ').short_name # whitespace in front
  end


  test "initial" do
    assert_equal 'L', create(:user, :name => 'Laurel Fan', :username => 'laurelfan').initial # first name last name
    assert_equal 'W', create(:user, :name => 'Winnie the Pooh').initial # middle name
    assert_equal "D", create(:user, :name => "D'Andre Means").initial # punctuation ok
    assert_equal '樊', create(:user, :name => '樊瑞').initial # ok, this isn't actually right but ok for now
    assert_equal 'L', create(:user, :name => 'Laurel').initial # just one name
    assert_equal 'S', create(:user, :name => '  some whitespace in front  ').initial # whitespace in front
  end

  test "find_for_authentication with nonsense" do
    # login by username still works
    user = create :user, username: 'blahblah'
    assert_equal user, User.find_for_authentication(login: 'blahblah')

    # login by email still works
    email_user = create :user, username: 'blahblah2', email: 'not@an.email'
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
    user = User.create(@good_data.merge({username: nil, provider: User::PROVIDER_MANUAL}))
    assert_equal 'tester', user.username
  end

  test 'can get next unfinished level if not completed any unplugged levels' do
    user = create :user, username: 'blahblah'
    twenty_hour = Script.find(Script::TWENTY_HOUR_ID)
    twenty_hour.script_levels.each do |script_level|
      next if script_level.level.game.unplugged? # skip all unplugged
      next if script_level.chapter > 33
      UserLevel.create(user: user, level: script_level.level, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
    end
    assert_equal(35, user.next_unpassed_progression_level(twenty_hour).chapter)
  end

  test 'can get next unfinished level, not tainted by other user progress' do
    user = create :user, username: 'blahblah'
    twenty_hour = Script.find(Script::TWENTY_HOUR_ID)
    twenty_hour.script_levels.each do |script_level|
      next if script_level.chapter > 33
      UserLevel.create(user: create(:user), level: script_level.level, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
    end
    assert_equal(2, user.next_unpassed_progression_level(twenty_hour).chapter)
  end

  test 'user is created with secret picture and word' do
    user = create :user
    assert user.secret_picture
    assert user.secret_words
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

    pictures = 1.upto(5).map do |i|
      user.reset_secret_picture
      user.secret_picture
    end

    assert pictures.uniq.length > 1
  end

  test 'reset_secret_words' do
    user = create :user
    user.secret_word_1_id = nil
    user.secret_word_2_id = nil
    user.save!

    # don't have one
    assert !user.secret_words

    user.reset_secret_words
    # now you do
    assert user.secret_words

    old = user.secret_words
    user.reset_secret_words
    assert_not_equal old, user.secret_words
  end

  test 'users under 13 have hashed email not plaintext email' do
    user = create :user, birthday: Date.new(2010, 10, 4), email: 'will_be_hashed@email.xx'

    assert user.age < 13
    assert !user.email.present?
    assert user.hashed_email.present?
  end


  test 'ok fine you can be 0' do
    # I think we have a couple users who said they were 0 years old
    # (because they chose their birthday in the current year from the
    # old calendar based date picker)
    user = create :user, birthday: Date.today - 1.month, email: 'will_be_hashed@email.xx'

    assert_equal 0, user.age
    assert !user.email.present?
    assert user.hashed_email.present?
  end


  test 'users over 13 have plaintext email and hashed email' do
    user = create :user, birthday: Date.new(1990, 10, 4), email: 'will_be_hashed@email.xx'

    assert user.age > 13
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
    # HACK fix my syntax highlighting "
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

    user.reset_password!('goodpassword', 'goodpassword')

    # changed password
    assert user.reload.encrypted_password != old_password
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

  test 'user should prefer working on 20hour instead of hoc' do
    user = create :user

    start_date = Time.now - 3.months
    
    # do a level that is both in script 1 and hoc
    UserLevel.create!(user_id: user.id, level_id: Script.twenty_hour_script.script_levels[1].level.id,
                      created_at: start_date, updated_at: start_date)

    user.backfill_user_scripts
    
    assert_equal [Script.twenty_hour_script, Script.hoc_script], user.working_on_scripts
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
      UserLevel.create!(user_id: user.id, level_id: sl1.level.id,
                        created_at: start_date, updated_at: start_date)
      
      UserLevel.create!(user_id: user.id, level_id: sl2.level.id,
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
      follower = create :follower, student_user: student, section: section, created_at: assigned_date

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
      UserLevel.create!(user_id: user.id, level_id: sl.level_id, best_result: 100,
                        created_at: completed_date - 1.day, updated_at: completed_date - 1.day)
    end

    # completed last level
    sl = script.script_levels.last
    UserLevel.create!(user_id: user.id, level_id: sl.level_id, best_result: 100,
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

    create :user_level, user: user, level: Script.find(1).script_levels.first.level
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

  test 'generate username' do
    # username regex: /\A[a-z0-9\-\_\.]+\z/

    # new name
    assert_equal 'captain_picard',  User.generate_username("Captain Picard")

    create(:user, username: 'captain_picard')
    # first prefix
    assert_equal 'captain_picard1',  User.generate_username("Captain Picard")

    # collisions are not numeric
    assert_equal 'captain',  User.generate_username("Captain")
    assert_equal 'captain_p',  User.generate_username("Captain    P")

    create(:user, username: 'captain')
    create(:user, username: 'captain1')
    create(:user, username: 'captain2')
    create(:user, username: 'captain55')

    assert_equal 'captain56',  User.generate_username("Captain")

    assert_equal "d_andre_means", User.generate_username("D'Andre Means")
    assert_equal "coder", User.generate_username('樊瑞')

    create(:user, username: 'coder')
    create(:user, username: 'coder1')
    create(:user, username: 'coder99')
    create(:user, username: 'coder556')
    assert_equal "coder557", User.generate_username('樊瑞')

    # short names
    assert_equal "coder_a", User.generate_username('a')

    # long names
    assert_equal "this_is_a_really", User.generate_username('This is a really long name' + ' blah' * 10)

    # parens
    assert_equal "kermit_the_frog", User.generate_username("Kermit (the frog)")
  end

  test 'generates usernames' do
    names = ['a', 'b', 'Captain Picard', 'Captain Picard', 'Captain Picard', '樊瑞', 'فاطمة بنت أسد', 'this is a really long name blah blah blah blah blah blah']
    expected_usernames = ['coder_a', 'coder_b', 'captain_picard', 'captain_picard1', 'captain_picard2', 'coder', 'coder1', 'this_is_a_really']

    i = 0
    users = names.map do |name|
      User.create!(@good_data.merge(name: name, email: "test_email#{i+=1}@test.xx")) # use real create method not the factory
    end
    
    assert_equal expected_usernames, users.collect(&:username)
  end
end
