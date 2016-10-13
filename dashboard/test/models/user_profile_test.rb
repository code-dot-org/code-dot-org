require 'test_helper'

class UserProfileTest < ActiveSupport::TestCase
  setup do
    @user_profile = create :user_profile
  end

  def test_get_other_user_ids_when_none
    assert_equal [], @user_profile.get_other_user_ids
  end

  def test_get_other_user_ids_when_one
    @user_profile.other_user_ids = '123'
    assert_equal [123], @user_profile.get_other_user_ids
  end

  def test_get_other_user_ids_when_many
    @user_profile.other_user_ids = '123,456,789'
    assert_equal [123, 456, 789], @user_profile.get_other_user_ids
  end

  def test_add_other_user_id_when_none
    @user_profile.add_other_user_id(123)
    assert_equal [123], @user_profile.get_other_user_ids
  end

  def test_add_other_user_id_when_new
    @user_profile.other_user_ids = '123'
    @user_profile.add_other_user_id 456
    assert_equal [123, 456], @user_profile.get_other_user_ids
  end

  def test_add_other_user_id_when_existing
    @user_profile.other_user_ids = 123
    @user_profile.add_other_user_id 123
    assert_equal [123], @user_profile.get_other_user_ids
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
    @user_profile.pd_manual = UserProfile::YEAR_NONE
    assert_equal nil, @user_profile.get_pd
  end
end
