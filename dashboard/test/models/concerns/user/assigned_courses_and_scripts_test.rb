require 'test_helper'

class AssignedCoursesAndScripts < ActiveSupport::TestCase
  let(:student) {create :student}
  let(:teacher) {create :teacher}
  let(:section) {create :section, user_id: teacher.id, unit_group: unit_group}
  let(:unit_group) {create :unit_group, name: 'course'}

  before do
    Follower.create!(section_id: section.id, student_user_id: student.id, user: teacher)
  end

  describe '#assigned_courses' do
    subject(:assigned_courses) {student.assigned_courses}
    context 'when the student is assigned to a course' do
      it 'returns the course data for the assigned course' do
        _(assigned_courses.length).must_equal 1
        _(assigned_courses.first[:name]).must_equal 'course'
      end
    end
  end

  describe '#assigned_course?' do
    context 'when the student is assigned to the course' do
      it 'returns true' do
        _(student.assigned_course?(unit_group)).must_equal true
      end
    end

    context 'when the student is not assigned to the course' do
      let(:another_course) {create :unit_group, name: 'another-course'}
      it 'returns false' do
        _(student.assigned_course?(another_course)).must_equal false
      end
    end
  end

  describe '#courses_as_participant' do
    subject(:courses_as_participant) {student.courses_as_participant}

    context 'when the student is assigned a course' do
      it 'returns the course as a participant' do
        _(courses_as_participant.length).must_equal 1
        _(courses_as_participant.first.name).must_equal 'course'
      end
    end
  end

  describe '#visible_scripts' do
    subject(:visible_scripts) {student.visible_scripts}
    let(:visible_script) {create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable}
    let(:hidden_script) {create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta}

    context 'when the student is assigned scripts' do
      before do
        student.assign_script(visible_script)
        student.assign_script(hidden_script)
      end

      it 'only returns the script visible script' do
        _(visible_scripts.length).must_equal 1
        _(visible_scripts.first).must_equal visible_script
      end
    end
  end

  describe 'assigned and section scripts' do
    let(:user) {create :student}
    let(:single_script) {create :script}
    let(:section_1) {create :section, script: single_script}
    let(:section_2) {create :section, unit_group: unit_group}
    let(:unit_group_unit) {create :script}
    before do
      create :unit_group_unit, unit_group: unit_group, script: unit_group_unit, position: 1
      section_1.students << user
      section_2.students << user
    end
    describe '#assigned_script?' do
      context 'when the user is assigned a script' do
        subject(:assigned_script?) {user.assigned_script?(single_script)}
        subject(:assigned_script_course?) {user.assigned_script?(section_2)}

        it 'returns true' do
          _(assigned_script?).must_equal true
          _(assigned_script_course?).must_equal true
        end
      end

      context 'when the user is not assigned a script' do
        let(:another_script) {create :script}
        subject(:assigned_script?) {user.assigned_script?(another_script)}

        it 'returns false' do
          _(assigned_script?).must_equal false
        end
      end
    end

    describe '#section_scripts' do
      context 'when the student is assigned multiple courses' do
        subject(:section_scripts) {user.section_scripts}

        it 'returns all assigned and default scripts' do
          _(section_scripts.length).must_equal 2
          _(section_scripts).must_include single_script
          _(section_scripts).must_include unit_group_unit
        end
      end
    end
  end
end
