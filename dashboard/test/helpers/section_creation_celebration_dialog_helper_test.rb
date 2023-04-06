require 'test_helper'

class SectionCreationCelebrationDialogHelperTest < ActionView::TestCase
  test 'does not show dialog if user is not logged in' do
    refute SectionCreationCelebrationDialogHelper.show?(nil)
  end

  test 'does not show dialog if user is a student' do
    user = create :student
    refute SectionCreationCelebrationDialogHelper.show?(user)
  end

  test 'shows dialog if user is a teacher and their oldest section is less than a minute old' do
    user = create :teacher
    create :section, user: user, created_at: 30.seconds.ago
    assert SectionCreationCelebrationDialogHelper.show?(user)
  end

  test 'does not show dialog if oldest section is more than a minute old' do
    user = create :teacher
    create :section, user: user, created_at: 90.seconds.ago
    refute SectionCreationCelebrationDialogHelper.show?(user)
  end

  test 'does not show dialog use has created a section in the last minute but it is not their oldest section' do
    user = create :teacher
    create :section, user: user, created_at: 90.seconds.ago
    create :section, user: user, created_at: 30.seconds.ago
    refute SectionCreationCelebrationDialogHelper.show?(user)
  end
end
