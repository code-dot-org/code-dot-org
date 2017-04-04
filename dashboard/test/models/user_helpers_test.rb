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

    # An existing username attempts the username, fails, and receives '6'.
    srand 0
    assert_equal 'captain_picard6',
      UserHelpers.generate_username(User, 'Captain Picard')
    create_user_with_username 'captain_picard6'

    # The next Captain Picard attempts '6', fails, and receives '1'
    srand 0
    assert_equal 'captain_picard1',
      UserHelpers.generate_username(User, 'Captain Picard')
    create_user_with_username 'captain_picard1'

    # The next Captain Picard attempts '6', fails, attempts '1', fails, and
    # receives '4'.
    srand 0
    assert_equal 'captain_picard4',
      UserHelpers.generate_username(User, 'Captain Picard')
    create_user_with_username 'captain_picard4'

    # The next Captain Picard attempts '6', fails, attempts '1', fails,
    # attempts '4', fails, and receives '77'.
    srand 0
    assert_equal 'captain_picard77',
      UserHelpers.generate_username(User, 'Captain Picard')
  end

  test 'generate_username for existing username via fallback' do
    ['', '6', '1', '4', '77', '19', '93', '377', '854', '904'].each do |suffix|
      create_user_with_username "captain_picard#{suffix}"
    end

    srand 0
    assert_equal 'captain_picard905',
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
    expected_usernames = %w(coder_a coder_b captain_picard captain_picard6 captain_picard1 this_is_a_really)

    i = 0
    users = names.map do |name|
      srand 0
      User.create!(
        default_params.merge(name: name, email: "test_email#{i += 1}@test.xx")
      )
    end

    assert_equal expected_usernames, users.collect(&:username)
  end
end
