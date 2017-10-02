require 'test_helper'

# TODO(asher): This file probablys belongs in the lib/test/cdo/ subdirectory rather than the
# dashboard/test/models/ subdirectory. Move this there, making the requisite test framework
# changes.
class UserHelpersTest < ActiveSupport::TestCase
  test 'UserHelpers.sponsor_message' do
    teacher = create :teacher

    assert_equal "Someone made the generous gift to sponsor your classroom's learning. Pay it forward, <a href=\"https://code.org/donate\">donate $25 to Code.org</a> to pay for another classroom's education.",
      UserHelpers.sponsor_message(teacher)

    student = create :student
    assert_equal "Someone made the generous gift to sponsor your learning. A generous <a href=\"https://code.org/donate\">gift of $1 to Code.org</a> will help another student learn.",
      UserHelpers.sponsor_message(student)
  end

  def create_user_with_username(username)
    user = create(:user)
    user.update_attribute(:username, username)
  end

  test 'generate_username for new username' do
    # A new username should not receive a suffix.
    assert_equal 'captain_picard',
      UserHelpers.generate_username(User, 'Captain Picard')
  end

  test 'generate_username for different usernames' do
    # Different usernames do not generate spurious collisions.
    create_user_with_username 'captain_picard'
    assert_equal 'captain', UserHelpers.generate_username(User, 'Captain')
    assert_equal 'captain_p', UserHelpers.generate_username(User, 'Captain   P')
  end

  test 'generate_username for existing username via dart throwing' do
    create_user_with_username 'captain_picard'

    # An existing username attempts the username, fails, and receives '784'.
    srand 0
    assert_equal 'captain_picard784',
      UserHelpers.generate_username(User, 'Captain Picard')
    create_user_with_username 'captain_picard784'

    # The next Captain Picard attempts '784', fails, and receives '659'
    srand 0
    assert_equal 'captain_picard659',
      UserHelpers.generate_username(User, 'Captain Picard')
    create_user_with_username 'captain_picard659'

    # The next Captain Picard attempts '784' and '659', fails, and
    # receives '4264'.
    srand 0
    assert_equal 'captain_picard4264',
      UserHelpers.generate_username(User, 'Captain Picard')
    create_user_with_username 'captain_picard4264'

    # The next Captain Picard attempts the above, fails and receives '5859'.
    srand 0
    assert_equal 'captain_picard5859',
      UserHelpers.generate_username(User, 'Captain Picard')
  end

  test 'generate_username for existing username via fallback' do
    ['', 784, 659, 4264, 5859, 51993, 96293, 54824, 47456, 383298, 593063, 548242, 474564].each do |suffix|
      create_user_with_username "captain_picard#{suffix}"
    end

    srand 0
    assert_equal 'captain_picard383299',
      UserHelpers.generate_username(User, 'Captain Picard')
  end

  test 'generate_username for long names' do
    assert_equal 'this_is_a_really',
      UserHelpers.generate_username(
        User, 'This is a really long name' + ' blah' * 10
      )
  end

  test 'generate_username for short names' do
    assert_equal "coder_a", UserHelpers.generate_username(User, 'a')
  end

  test 'generate_username for parentheses and apostrophes' do
    assert_equal 'kermit_the_frog',
      UserHelpers.generate_username(User, 'Kermit (the frog)')
    assert_equal 'd_andre_means',
      UserHelpers.generate_username(User, "D'Andre Means")
  end

  test 'generate_username for non-ascii names' do
    assert /coder\d{1,10}/ =~ UserHelpers.generate_username(User, '樊瑞')
    assert /coder\d{1,10}/ =~ UserHelpers.generate_username(User, 'فاطمة بنت أسد')
  end

  test 'generate_username' do
    default_params = {email: 'foo@bar.com', password: 'foosbars', name: 'tester', user_type: User::TYPE_STUDENT, age: 28}
    names = ['a', 'b', 'Captain Picard', 'Captain Picard', 'Captain Picard', 'this is a really long name blah blah blah blah blah blah']
    expected_usernames = %w(coder_a coder_b captain_picard captain_picard784 captain_picard659 this_is_a_really)

    i = 0
    users = names.map do |name|
      srand 0
      User.create!(
        default_params.merge(name: name, email: "test_email#{i += 1}@test.xx")
      )
    end

    assert_equal expected_usernames, users.collect(&:username)
  end

  test 'age_range_from_birthday' do
    assert_equal '18+', UserHelpers.age_range_from_birthday(33.years.ago.to_datetime)
    assert_equal '18+', UserHelpers.age_range_from_birthday(18.years.ago.to_datetime)
    assert_equal '13+', UserHelpers.age_range_from_birthday(17.years.ago.to_datetime)
    assert_equal '13+', UserHelpers.age_range_from_birthday(14.years.ago.to_datetime)
    assert_equal '13+', UserHelpers.age_range_from_birthday(13.years.ago.to_datetime)
    assert_equal '8+', UserHelpers.age_range_from_birthday(12.years.ago.to_datetime)
    assert_equal '8+', UserHelpers.age_range_from_birthday(8.years.ago.to_datetime)
    assert_equal '4+', UserHelpers.age_range_from_birthday(7.years.ago.to_datetime)
    assert_equal '4+', UserHelpers.age_range_from_birthday(5.years.ago.to_datetime)

    # For some reason, 4.years.ago is interpreted as age 3 on localhost, while
    # the test machine and CircleCI interpret it as age 4. Work around this by
    # testing 4 years and 1 day ago, which is interpreted consistently in all
    # environments.
    assert_equal '4+', UserHelpers.age_range_from_birthday(4.years.ago.to_datetime - 1)

    assert_nil UserHelpers.age_range_from_birthday(3.years.ago.to_datetime)
    assert_nil UserHelpers.age_range_from_birthday(1.year.since.to_datetime)
  end
end
