require 'digest/md5'
require 'test_helper'

class MegauserTest < ActiveSupport::TestCase
  NEW_EMAIL = 'new@example.com'.freeze
  EXISTING_EMAIL = 'existing@example.com'.freeze
  ANOTHER_EMAIL = 'another@example.com'.freeze

  setup do
    @megauser = create :megauser
  end

  def test_emails_as_array_when_none
    assert_equal [], @megauser.emails_as_array
  end

  def test_emails_as_array_when_one
    @megauser.emails = NEW_EMAIL
    assert_equal [NEW_EMAIL], @megauser.emails_as_array
  end

  def test_emails_as_array_when_many
    @megauser.emails = "#{NEW_EMAIL},#{EXISTING_EMAIL},#{ANOTHER_EMAIL}"
    assert_equal [NEW_EMAIL, EXISTING_EMAIL, ANOTHER_EMAIL],
      @megauser.emails_as_array
  end

  def test_add_email_when_new
    @megauser.add_email(NEW_EMAIL)
    assert_equal [NEW_EMAIL], @megauser.emails_as_array
  end

  def test_add_email_when_repeated
    @megauser.add_email(NEW_EMAIL)
    @megauser.add_email(NEW_EMAIL)
    assert_equal [NEW_EMAIL], @megauser.emails_as_array
  end

  def test_add_email_when_existing
    existing_megauser = create :megauser, emails: EXISTING_EMAIL
    existing_megauser_id = existing_megauser.id
    existing_user = create :teacher,
      email: EXISTING_EMAIL,
      megauser_id: existing_megauser.id

    @megauser.add_email(EXISTING_EMAIL)
    existing_user.reload

    assert_equal [EXISTING_EMAIL], @megauser.emails_as_array
    assert_equal @megauser.id, existing_user.megauser_id
    assert_nil Megauser.find_by_id(existing_megauser_id)
  end

  def test_add_email_when_existing_multiple
    existing_megauser = create :megauser, emails: EXISTING_EMAIL
    existing_megauser_id = existing_megauser.id
    existing_user = create :teacher,
      email: EXISTING_EMAIL,
      megauser_id: existing_megauser.id
    another_user = create :teacher,
      email: ANOTHER_EMAIL,
      megauser_id: existing_megauser.id

    @megauser.add_email(EXISTING_EMAIL)
    existing_user.reload
    another_user.reload

    assert_equal [EXISTING_EMAIL, ANOTHER_EMAIL], @megauser.emails_as_array
    assert_equal @megauser.id, existing_user.megauser_id
    assert_equal @megauser.id, another_user.megauser_id
    assert_nil Megauser.find_by_id(existing_megauser_id)
  end

  def test_add_email_with_preexisting_is_preserved
    create :megauser, emails: EXISTING_EMAIL

    @megauser.add_email(NEW_EMAIL)
    @megauser.add_email(EXISTING_EMAIL)

    assert_equal [NEW_EMAIL, EXISTING_EMAIL], @megauser.emails_as_array
  end
end
