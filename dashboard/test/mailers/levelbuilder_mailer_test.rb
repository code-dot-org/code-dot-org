require 'test_helper'

class LevelbuilderMailerTest < ActionMailer::TestCase
  setup do
    @user = create(:levelbuilder)
  end

  test 'unit_copy_completed includes link to new unit edit page' do
    mail = LevelbuilderMailer.unit_copy_completed(@user, 'new-unit-2026')
    assert_equal [@user.email], mail.to
    assert_match(/new-unit-2026/, mail.subject)
    assert_match(%r{s/new-unit-2026/edit}, mail.body.to_s)
  end

  test 'unit_copy_failed includes the error message' do
    mail = LevelbuilderMailer.unit_copy_failed(@user, 'source-unit', 'something broke')
    assert_equal [@user.email], mail.to
    assert_match(/source-unit/, mail.subject)
    assert_match(/something broke/, mail.body.to_s)
  end
end
