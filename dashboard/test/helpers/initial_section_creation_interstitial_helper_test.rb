require 'test_helper'

# Tests following spec:
# We should pop up this interstitial only for teachers on their first sign-in.
class InitialSectionCreationInterstitialHelperTest < ActiveSupport::TestCase
  test 'does not show a dialog if user is not a teacher' do
    @user = create :user

    refute @user.teacher?
    refute InitialSectionCreationInterstitialHelper.show?(@user)
  end

  test 'does not show a dialog if the user has signed in before' do
    @teacher = create :teacher
    @teacher.update(sign_in_count: 2)

    refute InitialSectionCreationInterstitialHelper.show?(@teacher)
  end

  test 'shows the dialog if the teacher signed in for the first time' do
    @teacher = create :teacher
    @teacher.update(sign_in_count: 1)

    assert InitialSectionCreationInterstitialHelper.show?(@teacher)
  end
end
