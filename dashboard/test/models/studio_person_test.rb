require 'test_helper'

class StudioPersonTest < ActiveSupport::TestCase
  def test_emails_as_array_when_none
    studio_person = build :studio_person
    assert_equal [], studio_person.emails_as_array
  end

  def test_emails_as_array_when_one
    studio_person = build :studio_person, emails: 'a@example.com'
    assert_equal ['a@example.com'], studio_person.emails_as_array
  end

  def test_emails_as_array_when_many
    studio_person = build :studio_person, emails: 'a@example.com,b@example.com,c@example.com'
    assert_equal ['a@example.com', 'b@example.com', 'c@example.com'], studio_person.emails_as_array
  end

  def test_merge
    teacher_a, teacher_b = create_pair :teacher
    assert_destroys(StudioPerson) do
      StudioPerson.merge(teacher_a.studio_person, teacher_b.studio_person)
    end
    assert_equal teacher_a.reload.studio_person_id, teacher_b.reload.studio_person_id
    assert_equal [teacher_a.email, teacher_b.email], teacher_a.studio_person.emails_as_array
  end

  def test_merge_dedups_emails
    teacher_a, teacher_b = create_pair :teacher
    teacher_a.studio_person.update!(emails: [teacher_a.email, 'dup_email@example.com'].join(','))
    teacher_b.studio_person.update!(emails: [teacher_b.email, 'dup_email@example.com'].join(','))

    StudioPerson.merge(teacher_a.studio_person, teacher_b.studio_person)

    assert_equal teacher_a.reload.studio_person_id, teacher_b.reload.studio_person_id
    assert_equal(
      [teacher_a.email, 'dup_email@example.com', teacher_b.email],
      teacher_a.studio_person.emails_as_array
    )
  end

  def test_merge_raises_exception_if_already_merged
    teacher_a, teacher_b = create_pair :teacher
    StudioPerson.merge(teacher_a.studio_person, teacher_b.studio_person)

    assert_raises(ArgumentError) do
      StudioPerson.merge(teacher_a.reload.studio_person, teacher_b.reload.studio_person)
    end
  end

  def test_split
    teacher_a, teacher_b = create_pair :teacher
    StudioPerson.merge(teacher_a.studio_person, teacher_b.studio_person)

    assert_creates(StudioPerson) do
      StudioPerson.split(teacher_a.studio_person)
    end

    refute_equal teacher_a.studio_person_id, teacher_b.studio_person_id
    assert_equal teacher_a.email, teacher_a.studio_person.emails
    assert_equal teacher_b.email, teacher_b.studio_person.emails
  end

  def test_split_raises_exception_for_too_many_users
    teacher = create :teacher
    create_pair :teacher, studio_person: teacher.studio_person

    assert_raises(ArgumentError) do
      StudioPerson.split(teacher.studio_person)
    end
  end

  def test_split_raises_for_too_many_emails
    teacher_a, teacher_b = create_pair :teacher
    StudioPerson.merge(teacher_a.studio_person, teacher_b.studio_person)
    teacher_a.studio_person.add_email_to_emails('too_many@example.com')

    assert_raises(ArgumentError) do
      StudioPerson.split(teacher_a, teacher_b)
    end
  end

  def test_add_email_to_emails_no_existing_email
    studio_person = build :studio_person
    studio_person.add_email_to_emails 'new@example.com'
    assert_equal ['new@example.com'], studio_person.emails_as_array
  end

  def test_add_email_to_emails_with_existing_emails
    studio_person = build :studio_person, emails: 'old@example.com'
    studio_person.add_email_to_emails 'new@example.com'
    assert_equal ['old@example.com', 'new@example.com'], studio_person.emails_as_array
  end

  def test_add_email_to_emails_duplicate_email
    studio_person = build :studio_person, emails: 'dup@example.com'
    studio_person.add_email_to_emails 'dup@example.com'
    assert_equal ['dup@example.com'], studio_person.emails_as_array
  end
end
