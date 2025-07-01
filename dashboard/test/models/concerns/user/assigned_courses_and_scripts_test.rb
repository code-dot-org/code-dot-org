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

  describe '#any_visible_assigned_scripts?' do
    subject(:any_visible_assigned_scripts?) {student.any_visible_assigned_scripts?}
    let(:visible_script) {create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable}
    let(:hidden_script) {create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta}

    context 'when the student has no assigned scripts' do
      it 'returns false' do
        _(any_visible_assigned_scripts?).must_equal false
      end
    end

    context 'when the student has assigned scripts' do
      before do
        student.assign_script(visible_script)
        student.assign_script(hidden_script)
      end

      it 'returns true if there are visible scripts' do
        _(any_visible_assigned_scripts?).must_equal true
      end
    end

    context 'when the student has only hidden scripts' do
      before {student.assign_script(hidden_script)}
      it 'returns false' do
        _(any_visible_assigned_scripts?).must_equal false
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

  describe '#most_recently_assigned_unit_group_unit' do
    let(:user) {create :student}
    let(:section_1) {create :section, unit_group: unit_group}
    let(:unit_group_unit) {create :script}
    subject(:most_recently_assigned_unit_group_unit) {user.most_recently_assigned_unit_group_unit}

    before do
      create :unit_group_unit, unit_group: unit_group, script: unit_group_unit, position: 1
      user.assign_script(unit_group_unit)
    end

    context 'when the user has assigned scripts' do
      it 'returns the most recently assigned unit group unit' do
        _(user.most_recently_assigned_unit_group_unit).must_equal unit_group.default_unit_group_units.first
      end
    end

    context 'when the user has no assigned scripts' do
      before {user.user_scripts.destroy_all}
      it 'returns nil' do
        _(most_recently_assigned_unit_group_unit).must_be_nil
      end
    end
  end

  describe 'visible assigned scripts' do
    let(:hidden_script) {create :script, name: 'hidden-script', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta}
    let(:visible_script) {create :script, name: 'visible-script', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable}

    describe '#visible_assigned_scripts' do
      let(:user) {create :student}
      subject(:visible_assigned_scripts) {user.visible_assigned_scripts}
      context 'when a user has no assigned scripts' do
        it 'returns an empty array' do
          _(visible_assigned_scripts).must_equal []
        end
      end
      context 'when a user has assigned scripts' do
        before do
          user.assign_script(hidden_script)
          user.assign_script(visible_script)
        end

        it 'returns only the visible scripts' do
          _(visible_assigned_scripts.length).must_equal 1
          _(visible_assigned_scripts.first.name).must_equal 'visible-script'
        end
      end
    end

    describe '#any_visible_assigned_scripts?' do
      let(:user) {create :student}
      subject(:any_visible_assigned_scripts?) {user.any_visible_assigned_scripts?}

      context 'when a user has no assigned scripts' do
        it {_(any_visible_assigned_scripts?).must_equal false}
      end

      context 'when a user has assigned hiddent scripts' do
        before do
          user.assign_script(hidden_script)
        end

        it {_(any_visible_assigned_scripts?).must_equal false}
      end

      context 'when a user has assigned visible scripts' do
        before do
          user.assign_script(visible_script)
        end
        it {_(any_visible_assigned_scripts?).must_equal true}
      end
    end
  end

  describe 'recently assigned script' do
    let(:user) {create :student}
    let(:script1) {create :script, name: 'script1', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable}
    let(:script2) {create :script, name: 'script2', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable}

    before do
      Timecop.freeze(Time.now) do
        user.assign_script(script1)
        Timecop.travel(1.second)
        user.assign_script(script2)
      end
    end

    describe '#most_recently_assigned_user_script' do
      subject(:most_recently_assigned_user_script) {user.most_recently_assigned_user_script}
      it 'returns the most recently assigned script' do
        _(most_recently_assigned_user_script.script.name).must_equal 'script2'
      end
    end

    describe '#most_recently_assigned_script' do
      subject(:most_recently_assigned_script) {user.most_recently_assigned_script}
      it 'returns the script object of the most recently assigned user script' do
        _(most_recently_assigned_script.name).must_equal 'script2'
      end
    end
  end

  describe '#can_access_most_recently_assigned_script?' do
    let(:user) {create :student}
    let(:script) {create :script, name: 'recent-script', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable}
    subject(:can_access_most_recently_assigned_script?) {user.can_access_most_recently_assigned_script?}

    context 'when the user has no assigned scripts' do
      it {_(can_access_most_recently_assigned_script?).must_equal false}
    end

    context 'when the script is not a pilot' do
      before do
        user.assign_script(script)
      end
      it 'returns true' do
        _(can_access_most_recently_assigned_script?).must_equal true
      end
    end

    describe '#can_access_most_recently_assigned_script?' do
      let(:user) {create :student}
      let(:script) {create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable}
      subject(:can_access?) {user.can_access_most_recently_assigned_script?}

      context 'when the user has no assigned scripts' do
        it 'returns false' do
          _(can_access?).must_equal false
        end
      end

      context 'when the script is not a pilot' do
        before {user.assign_script(script)}
        it 'returns true' do
          _(can_access?).must_equal true
        end
      end

      context 'when the script is a pilot and the user has access' do
        let(:pilot_teacher) {create :teacher, pilot_experiment: 'my-experiment'}
        let(:pilot_script) {create :script, name: 'pilot-script', pilot_experiment: 'my-experiment'}
        let(:pilot_section) {create :section, user: pilot_teacher, script: pilot_script}
        let(:pilot_student) {create(:follower, section: pilot_section).student_user}
        subject(:can_access_pilot?) {pilot_student.can_access_most_recently_assigned_script?}

        it 'returns true' do
          _(can_access_pilot?).must_equal true
        end
      end

      context 'when the script is a pilot and the user does NOT have access' do
        let(:pilot_script) {create :script, pilot_experiment: 'test_experiment', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable}
        before {user.assign_script(pilot_script)}
        it 'returns false' do
          _(can_access?).must_equal false
        end
      end
    end
  end

  describe 'recent progress in scripts' do
    let(:user) {create :student}
    let(:script_1) {create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable}
    let(:script_2) {create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable}
    subject(:user_script_with_most_recent_progress) {user.user_script_with_most_recent_progress}

    before do
      user.assign_script(script_1)
      user.assign_script(script_2)
      user.user_scripts.find_by(script_id: script_1.id).update!(last_progress_at: 1.day.ago, assigned_at: 1.week.ago)
      user.user_scripts.find_by(script_id: script_2.id).update!(last_progress_at: 1.minute.ago, assigned_at: 1.hour.ago)
    end

    describe '#user_script_with_most_recent_progress' do
      context 'when the user has progress in multiple scripts' do
        it 'returns the user_script with the most recent progress' do
          _(user_script_with_most_recent_progress).must_equal user.user_scripts.find_by(script_id: script_2.id)
        end
      end
      context 'when the user has no progress in any scripts' do
        it 'returns nil' do
          user.user_scripts.update_all(last_progress_at: nil)
          _(user.user_script_with_most_recent_progress).must_be_nil
        end
      end

      context 'when the user has no assigned scripts' do
        it 'returns nil' do
          user.user_scripts.destroy_all
          _(user.user_script_with_most_recent_progress).must_be_nil
        end
      end
    end

    describe '#script_with_most_recent_progress' do
      context 'when the user has progress in multiple scripts' do
        it 'returns the user_script with the most recent progress' do
          _(user_script_with_most_recent_progress.script).must_equal script_2
        end
      end
    end

    describe '#most_recent_progress_in_recently_assigned_script?' do
      subject(:most_recent_progress_in_recently_assigned_script?) {user.most_recent_progress_in_recently_assigned_script?}

      context 'when the user has made most recent progress in most recently assigned script' do
        it {_(most_recent_progress_in_recently_assigned_script?).must_equal true}
      end

      context 'when the user has made most recent progress in an older assigned script' do
        it 'returns false' do
          # Update the last progress time of script_1 (older assigned script) to be more recent than script_2 (new assigned script)
          user.user_scripts.find_by(script_id: script_1.id).update!(last_progress_at: Time.now)
          _(most_recent_progress_in_recently_assigned_script?).must_equal false
        end
      end

      context 'when the user has assigned scripts without progress' do
        it 'returns false' do
          user.user_scripts.update_all(last_progress_at: nil)
          _(most_recent_progress_in_recently_assigned_script?).must_equal false
        end
      end

      context 'when the user has no assigned scripts' do
        it 'returns false' do
          user.user_scripts.destroy_all
          _(most_recent_progress_in_recently_assigned_script?).must_equal false
        end
      end
    end

    describe '#last_assignment_after_most_recent_progress?' do
      subject(:last_assignment_after_most_recent_progress?) {user.last_assignment_after_most_recent_progress?}

      context 'when the user has no new assignments after their most recent progress' do
        it 'returns false' do
          _(last_assignment_after_most_recent_progress?).must_equal false
        end
      end

      context 'when the user has a new assignment after their most recent progress' do
        it 'returns true' do
          user.user_scripts.find_by(script_id: script_1.id).update!(assigned_at: Time.now)
          _(last_assignment_after_most_recent_progress?).must_equal true
        end
      end

      context 'when the user has no assigned scripts' do
        it 'returns false' do
          user.user_scripts.destroy_all
          _(last_assignment_after_most_recent_progress?).must_equal false
        end
      end
    end
  end
end
