require 'test_helper'

class ProjectsListTest < ActionController::TestCase
  CHANNEL_ID = 'STUB_CHANNEL_ID'

  setup do
    @student = create :student

    student_project_value = {
      name: 'Bobs App',
      level: '/projects/applab',
      createdAt: '2017-01-24T16:41:08.000-08:00',
      updatedAt: '2017-01-25T17:48:12.358-08:00'
    }.to_json
    @student_project = {id: 22, value: student_project_value}

    hidden_project_value = {
      name: 'Hidden App',
      level: '/projects/playlab',
      createdAt: '2017-01-01T00:00:00.000-08:00',
      updatedAt: '2017-01-01T00:00:00.000-08:00',
      hidden: true
    }.to_json
    @hidden_project = {id: 33, value: hidden_project_value}
  end

  test 'get_project_row_data correctly parses student and project data' do
    project_row = ProjectsList.send(:get_project_row_data, @student, @student_project, CHANNEL_ID)
    assert_equal CHANNEL_ID, project_row['channel']
    assert_equal 'Bobs App', project_row['name']
    assert_equal @student.name, project_row['studentName']
    assert_equal 'applab', project_row['type']
    assert_equal '2017-01-25T17:48:12.358-08:00', project_row['updatedAt']
  end

  test 'get_project_row_data ignores hidden projects' do
    assert_nil ProjectsList.send(:get_project_row_data, @student, @hidden_project, CHANNEL_ID)
  end

  test 'student_age_range returns correct age ranges' do
    assert_equal '18+', ProjectsList.send(:student_age_range, birthday: 33.years.ago.to_datetime)
    assert_equal '18+', ProjectsList.send(:student_age_range, birthday: 18.years.ago.to_datetime)
    assert_equal '13+', ProjectsList.send(:student_age_range, birthday: 17.years.ago.to_datetime)
    assert_equal '13+', ProjectsList.send(:student_age_range, birthday: 14.years.ago.to_datetime)
    assert_equal '13+', ProjectsList.send(:student_age_range, birthday: 13.years.ago.to_datetime)
    assert_equal '8+', ProjectsList.send(:student_age_range, birthday: 12.years.ago.to_datetime)
    assert_equal '8+', ProjectsList.send(:student_age_range, birthday: 8.years.ago.to_datetime)
    assert_equal '4+', ProjectsList.send(:student_age_range, birthday: 7.years.ago.to_datetime)
    assert_equal '4+', ProjectsList.send(:student_age_range, birthday: 4.years.ago.to_datetime)
    assert_nil ProjectsList.send(:student_age_range, birthday: 3.years.ago.to_datetime)
    assert_nil ProjectsList.send(:student_age_range, birthday: 1.year.since.to_datetime)
  end
end
