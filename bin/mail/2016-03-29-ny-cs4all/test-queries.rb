require_relative '../mailing-common/mail_query_test_case'
require 'securerandom'
require './generate-list-functions'

# Execute via RAILS_ENV=test bundle exec ruby -Itest ./test-queries.rb

class CS4AllTestCase < MailQueryTestCase

  def setup
    # K5 workshop:
    @k5_organizer_email = 'k5_organizer@example.net'
    @k5_organizer_id = create_teacher(@k5_organizer_email)
    @k5_teacher_id = create_teacher 'k5_teacher@schools.nyc.gov'
    @k5_excluded_teacher_id = create_teacher 'k5_teacher@other.domain.net'
    @section_id = create_k5_workshop_with_section @k5_organizer_id, @k5_organizer_email
    join_section @section_id, @k5_organizer_id, @k5_teacher_id
    join_section @section_id, @k5_organizer_id, @k5_excluded_teacher_id

    # Section not included in K5 workshops:
    @unrelated_section_id = create_section @k5_organizer_id
    join_section @unrelated_section_id, @k5_organizer_id, create_teacher('no_pd_section_teacher@schools.nyc.gov')

    # Ops workshop:
    @ops_teacher_id = create_teacher 'ops_teacher@schools.nyc.gov'
    @workshop_id = create_workshop
    @segment_id = create_segment @workshop_id
    create_attendance @ops_teacher_id, @segment_id

    # No PD teachers
    create_teacher 'no_pd_teacher@schools.nyc.gov'
    create_teacher 'no_pd_teacher@another.domain.net'
  end

  def test_query_k5_pd_section_ids
    section_ids = query_k5_pd_section_ids
    assert_equal 1, section_ids.count
    assert_equal @section_id, section_ids[0]
  end

  def test_query_k5_pd_teachers
    k5_pd_teachers = query_k5_pd_teachers
    assert_equal 1, k5_pd_teachers.length
    assert_equal 'k5_teacher@schools.nyc.gov', k5_pd_teachers.keys[0]
  end

  def test_query_non_pd_teachers
    non_pd_teachers = query_non_pd_teachers query_k5_pd_teachers

    assert_equal 2, non_pd_teachers.length
    assert non_pd_teachers.keys.include? 'no_pd_teacher@schools.nyc.gov'
    assert non_pd_teachers.keys.include? 'no_pd_section_teacher@schools.nyc.gov'
  end

  def test_query_hoc_organizers_no_code_studio
    # mock solr query
    def query_subscribed_contacts(query)
      {
        'hoc_organizer@schools.nyc.gov' => {},
        'hoc_organizer@another.domain.net' => {},
        'non_code_studio_user@schools.nyc.gov' => {},
        'non_code_studio_user@another.domain.net' => {}
      }
    end

    create_teacher 'hoc_organizer@schools.nyc.gov'
    create_teacher 'hoc_organizer@another.domain.net'

    hoc_organizers_no_code_studio = query_hoc_organizers_no_code_studio
    assert_equal 1, hoc_organizers_no_code_studio.length
    assert_equal 'non_code_studio_user@schools.nyc.gov', hoc_organizers_no_code_studio.keys[0]
  end

  def create_teacher(email)
    DASHBOARD_DB[:users].insert(
      email: email,
      user_type: 'teacher'
    )
  end

  def create_section(organizer_id)
    DASHBOARD_DB[:sections].insert(user_id: organizer_id)
  end

  def create_k5_workshop_with_section(organizer_id, organizer_email)
    section_id = create_section(organizer_id)
    data = {'section_id_s': section_id}
    now = Time.now
    DB[:forms].insert(
      kind: 'ProfessionalDevelopmentWorkshop',
      data: data.to_json,
      secret: SecureRandom.hex,
      email: organizer_email,
      created_at: now,
      created_ip: '127.0.0.1',
      updated_at: now,
      updated_ip: '127.0.0.1'
    )
    section_id
  end

  def join_section(section_id, user_id, student_user_id)
    DASHBOARD_DB[:followers].insert(
      section_id: section_id,
      user_id: user_id,
      student_user_id: student_user_id
    )
  end

  def create_workshop
    DASHBOARD_DB[:workshops].insert(
      program_type: 'test workshop'
    )
  end

  def create_segment(workshop_id)
    DASHBOARD_DB[:segments].insert(
      workshop_id: workshop_id,
      start: Time.now
    )
  end

  def create_attendance(teacher_id, segment_id)
    DASHBOARD_DB[:workshop_attendance].insert(
      teacher_id: teacher_id,
      segment_id: segment_id
    )
  end
end
