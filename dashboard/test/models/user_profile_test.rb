require 'test_helper'

class UserProfileTest < ActiveSupport::TestCase
  setup do
    @user_profile = create :user_profile
    @alternate_user = create :user
    @another_user = create :user
  end

  def test_get_other_user_ids_when_none
    assert_equal [], @user_profile.get_other_user_ids
  end

  def test_get_other_user_ids_when_one
    @user_profile.other_user_ids = @alternate_user.id.to_s
    assert_equal [@alternate_user.id], @user_profile.get_other_user_ids
  end

  def test_get_other_user_ids_when_many
    @user_profile.other_user_ids = "#{@alternate_user.id},#{@another_user.id}"
    assert_equal [@alternate_user.id, @another_user.id],
      @user_profile.get_other_user_ids
  end

  def test_add_other_user_id_when_none
    @user_profile.add_other_user_id @alternate_user.id
    assert_equal [@alternate_user.id], @user_profile.get_other_user_ids
  end

  def test_add_other_user_id_when_new
    @user_profile.other_user_ids = @alternate_user.id.to_s
    @user_profile.add_other_user_id @another_user.id
    assert_equal [@alternate_user.id, @another_user.id],
      @user_profile.get_other_user_ids
  end

  def test_add_other_user_id_when_existing
    @user_profile.other_user_ids = @alternate_user.id.to_s
    @user_profile.add_other_user_id @alternate_user.id
    assert_equal [@alternate_user.id], @user_profile.get_other_user_ids
  end

  def test_add_other_user_id_when_invalid_id
    @user_profile.add_other_user_id(User.last.id + 1)
    assert_equal [], @user_profile.get_other_user_ids
  end

  def test_add_other_user_id_when_the_user_id
    @user_profile.add_other_user_id @user_profile.user_id
    assert_equal [], @user_profile.get_other_user_ids
  end

  def test_get_other_emails_when_none
    assert_equal [], @user_profile.get_other_emails
  end

  def test_get_other_emails_when_one
    @user_profile.other_emails = 'test@example.com'
    assert_equal ['test@example.com'], @user_profile.get_other_emails
  end

  def test_get_other_emails_when_many
    @user_profile.other_emails = 'test1@example.com,test2@example.com,test3@example.com'
    assert_equal ['test1@example.com', 'test2@example.com', 'test3@example.com'],
      @user_profile.get_other_emails
  end

  def test_add_other_email_when_none
    @user_profile.add_other_email('test@example.com')
    assert_equal ['test@example.com'], @user_profile.get_other_emails
  end

  def test_add_other_email_when_new
    @user_profile.other_emails = 'test@example.com'
    @user_profile.add_other_email 'new@example.com'
    assert_equal ['test@example.com', 'new@example.com'],
      @user_profile.get_other_emails
  end

  def test_add_other_email_when_existing
    @user_profile.other_emails = 'test@example.com'
    @user_profile.add_other_email 'test@example.com'
    assert_equal ['test@example.com'], @user_profile.get_other_emails
  end

  def test_add_other_email_when_account_email
    @user_profile.user.email = 'test@example.com'
    @user_profile.user.save!
    @user_profile.add_other_email 'test@example.com'
    assert_equal [], @user_profile.get_other_emails
  end

  def test_get_pd_when_nil_with_no_manual_override
    assert_equal nil, @user_profile.get_pd
  end

  def test_get_pd_when_pded_with_no_manual_override
    @user_profile.pd = UserProfile::YEAR_2015_2016
    assert_equal UserProfile::YEAR_2015_2016, @user_profile.get_pd
  end

  def test_get_pd_when_nil_with_manual_override_pded
    @user_profile.pd_manual = UserProfile::YEAR_2015_2016
    assert_equal UserProfile::YEAR_2015_2016, @user_profile.get_pd
  end

  def test_get_pd_when_pded_with_manual_override_pded
    @user_profile.pd = UserProfile::YEAR_2015_2016
    @user_profile.pd_manual = UserProfile::YEAR_2016_2017
    assert_equal UserProfile::YEAR_2016_2017, @user_profile.get_pd
  end

  def test_get_pd_when_pded_with_manual_override_not_pded
    @user_profile.pd = UserProfile::YEAR_2015_2016
    @user_profile.pd_manual = UserProfile::NO_PD
    assert_equal nil, @user_profile.get_pd
  end
end
