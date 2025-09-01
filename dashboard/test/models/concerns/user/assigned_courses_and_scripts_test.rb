require 'test_helper'

class AssignedCoursesAndScripts < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:student) {create(:student)}
  let(:teacher) {create(:teacher)}
  let(:section) {create(:section, user_id: teacher.id, unit_group: unit_group)}
  let(:unit_group) {create(:unit_group, name: 'course')}

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
      let(:another_course) {create(:unit_group, name: 'another-course')}
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
    let(:visible_script) {create(:script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)}
    let(:hidden_script) {create(:script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)}

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
    let(:visible_script) {create(:script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)}
    let(:hidden_script) {create(:script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)}

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
    let(:user) {create(:student)}
    let(:single_script) {create(:script)}
    let(:section_1) {create(:section, script: single_script)}
    let(:section_2) {create(:section, unit_group: unit_group)}
    let(:unit_group_unit) {create(:script)}
    before do
      create(:unit_group_unit, unit_group: unit_group, script: unit_group_unit, position: 1)
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
        let(:another_script) {create(:script)}
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
    let(:user) {create(:student)}
    let(:section_1) {create(:section, unit_group: unit_group)}
    let(:unit_group_unit) {create(:script)}
    subject(:most_recently_assigned_unit_group_unit) {user.most_recently_assigned_unit_group_unit}

    before do
      create(:unit_group_unit, unit_group: unit_group, script: unit_group_unit, position: 1)
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
    let(:hidden_script) {create(:script, name: 'hidden-script', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)}
    let(:visible_script) {create(:script, name: 'visible-script', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)}

    describe '#visible_assigned_scripts' do
      let(:user) {create(:student)}
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
      let(:user) {create(:student)}
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
    let(:user) {create(:student)}
    let(:script1) {create(:script, name: 'script1', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)}
    let(:script2) {create(:script, name: 'script2', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)}

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
    let(:user) {create(:student)}
    let(:script) {create(:script, name: 'recent-script', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)}
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
      let(:user) {create(:student)}
      let(:script) {create(:script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)}
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
        let(:pilot_teacher) {create(:teacher, pilot_experiment: 'my-experiment')}
        let(:pilot_script) {create(:script, name: 'pilot-script', pilot_experiment: 'my-experiment')}
        let(:pilot_section) {create(:section, user: pilot_teacher, script: pilot_script)}
        let(:pilot_student) {create(:follower, section: pilot_section).student_user}
        subject(:can_access_pilot?) {pilot_student.can_access_most_recently_assigned_script?}

        it 'returns true' do
          _(can_access_pilot?).must_equal true
        end
      end

      context 'when the script is a pilot and the user does NOT have access' do
        let(:pilot_script) {create(:script, pilot_experiment: 'test_experiment', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)}
        before {user.assign_script(pilot_script)}
        it 'returns false' do
          _(can_access?).must_equal false
        end
      end
    end
  end

  describe 'recent progress in scripts' do
    let(:user) {create(:student)}
    let(:script_1) {create(:script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)}
    let(:script_2) {create(:script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)}
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

  describe 'recent courses and scripts' do
    let(:locale) {:'te-ST'}
    let(:custom_i18n) do
      {
        'data' => {
          'course' => {
            'name' => {
              'csd' => {
                'title' => 'Computer Science Discoveries',
                'description_short' => 'CSD short description',
              },
              'pl-csd' => {
                'title' => 'Computer Science Discoveries PL Course',
                'description_short' => 'PL CSD short description',
              }
            }
          },
          'script' => {
            'name' => {
              'other' => {
                title: 'Unit Other',
                'description_short' => 'other-description'
              },
              'pl-other' => {
                title: 'PL Unit Other',
                'description_short' => 'pl-other-description'
              }
            }
          }
        }
      }
    end

    let(:student) {create(:student)}
    let(:teacher) {create(:teacher)}
    let(:facilitator) {create(:facilitator)}

    let(:unit_group) {create(:unit_group, name: 'csd')}
    let(:other_script) {create(:single_unit_course, unit: create(:script, name: 'other')).first_unit}
    let(:section) {create(:section, user_id: teacher.id, unit_group: unit_group)}

    let(:pl_unit_group) {create(:unit_group, :pl_course, name: 'pl-csd')}
    let(:other_pl_script) {create(:single_unit_course, :pl_course, unit: create(:script, name: 'pl-other')).first_unit}

    let(:pl_section) {create(:section, :teacher_participants, user_id: facilitator.id, unit_group: pl_unit_group)}

    before do
      I18n.locale = locale
      I18n.backend.store_translations(locale, custom_i18n)

      create(:unit_group_unit, unit_group: unit_group, script: (create(:script, name: 'csd1')), position: 1)
      create(:unit_group_unit, unit_group: unit_group, script: (create(:script, name: 'csd2')), position: 2)

      student.assign_script(other_script)

      Follower.create!(section_id: section.id, student_user_id: student.id, user: teacher)

      create(:unit_group_unit, unit_group: pl_unit_group, script: (create(:script, name: 'pl-csd1', instructor_audience: nil, participant_audience: nil)), position: 1)
      create(:unit_group_unit, unit_group: pl_unit_group, script: (create(:script, name: 'pl-csd2', instructor_audience: nil, participant_audience: nil)), position: 2)

      teacher.assign_script(other_pl_script)

      Follower.create!(section_id: pl_section.id, student_user_id: teacher.id, user: facilitator)
    end

    describe '#recent_pl_courses_and_units' do
      subject(:recent_pl_courses_and_units) {teacher.recent_pl_courses_and_units(false)}

      it 'returns both pl courses and pl scripts' do
        _(recent_pl_courses_and_units.length).must_equal 2
        course_data = recent_pl_courses_and_units.first
        script_data = recent_pl_courses_and_units.last
        _(course_data[:name]).must_equal 'pl-csd'
        _(course_data[:title]).must_equal 'Computer Science Discoveries PL Course'
        _(course_data[:description]).must_equal 'PL CSD short description'
        _(course_data[:link]).must_equal '/courses/pl-csd'

        _(script_data[:name]).must_equal 'pl-other'
        _(script_data[:title]).must_equal 'PL Unit Other'
        _(script_data[:description]).must_equal 'pl-other-description'
        _(script_data[:link]).must_equal '/s/pl-other'
      end

      it 'does not return pl scripts that are in returned pl courses' do
        script = Unit.find_by_name('pl-csd1')
        teacher.assign_script(script)

        _(recent_pl_courses_and_units.length).must_equal 2
        _(recent_pl_courses_and_units.pluck(:title)).must_equal [
          'Computer Science Discoveries PL Course',
          'PL Unit Other'
        ]
        _(recent_pl_courses_and_units.pluck(:name)).wont_include 'pl-csd1'
      end
    end

    describe '#recent_student_courses_and_units' do
      subject(:recent_student_courses_and_units) {student.recent_student_courses_and_units(false)}

      it 'returns both courses and scripts' do
        _(recent_student_courses_and_units.length).must_equal 2
        course_data = recent_student_courses_and_units.first
        script_data = recent_student_courses_and_units.last

        _(course_data[:name]).must_equal 'csd'
        _(course_data[:title]).must_equal 'Computer Science Discoveries'
        _(course_data[:description]).must_equal 'CSD short description'
        _(course_data[:link]).must_equal '/courses/csd'

        _(script_data[:name]).must_equal 'other'
        _(script_data[:title]).must_equal 'Unit Other'
        _(script_data[:description]).must_equal 'other-description'
        _(script_data[:link]).must_equal '/s/other'
      end

      it 'does not return student scripts that are in returned student courses' do
        script = Unit.find_by_name('csd1')
        student.assign_script(script)

        _(recent_student_courses_and_units.length).must_equal 2
        _(recent_student_courses_and_units.pluck(:title)).must_equal [
          'Computer Science Discoveries',
          'Unit Other'
        ]
        _(recent_student_courses_and_units.pluck(:name)).wont_include 'csd1'
      end

      context 'when primary course should not be included in returned student courses' do
        let(:student) {create(:student)}
        let(:teacher) {create(:teacher)}

        let(:unit_group) {create(:unit_group, name: 'testcourse', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)}
        let(:unit_group_unit1) {create(:unit_group_unit, unit_group: unit_group, script: (create(:script, name: 'testscript1', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)), position: 1)}
        let(:other_script) {create(:script, name: 'otherscript', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)}
        let(:section) {create(:section, user_id: teacher.id, unit_group: unit_group)}

        before do
          create(:unit_group_unit, unit_group: unit_group, script: (create(:script, name: 'testscript2', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)), position: 2)
          create(:user_script, user: student, script: unit_group_unit1.script, started_at: (Time.now - 1.day))
          create(:user_script, user: student, script: other_script, started_at: (Time.now - 1.hour))
          Follower.create!(section_id: section.id, student_user_id: student.id, user: teacher)
        end

        it 'does not return primary course' do
          courses_and_scripts = student.recent_student_courses_and_units(true)
          _(courses_and_scripts.length).must_equal 1
          _(courses_and_scripts.pluck(:name)).must_equal ['testcourse']
        end
      end
    end
  end

  describe '#pl_units_started' do
    context 'when testing basic functionality' do
      subject(:pl_units_started) {user.pl_units_started}
      let(:user) {create(:teacher)}
      let(:unit) {create(:unit, :with_levels)}
      let(:unit_group) {create(:unit_group, participant_audience: 'teacher', instructor_audience: 'facilitator')}
      let!(:unit_group_unit) {create(:unit_group_unit, course_id: unit_group.id, script_id: unit.id, position: 1)}
      let!(:user_script) {create(:user_script, user: user, script: unit)}
      let(:modularity_enabled) {true}

      before do
        allow(Policies::Courses).to receive(:modularity_enabled?).and_return(modularity_enabled)
        unit.reload
        user.reload
      end

      it 'returns 1 result' do
        _(pl_units_started.count).must_equal 1
      end

      it 'returns an Array of Hash' do
        _(pl_units_started).must_be_kind_of Array
        _(pl_units_started.first).must_be_kind_of Hash
      end

      it 'returns the Unit name' do
        _(pl_units_started.first[:name]).must_equal unit.name
      end

      it 'returns the Unit title' do
        _(pl_units_started.first[:title]).must_equal unit.title_for_display
      end

      it 'returns 0 percent completed' do
        _(pl_units_started.first[:percent_completed]).must_equal 0
      end

      it 'returns nil finish_url' do
        _(pl_units_started.first[:finish_url]).must_equal nil
      end

      it 'returns the current Lesson name' do
        _(pl_units_started.first[:current_lesson_name]).must_equal unit.lessons.first.localized_name
      end

      it 'returns the path to the Unit' do
        _(pl_units_started.first[:path]).must_equal "/courses/#{unit_group.name}/units/1"
      end

      context 'modularity experiment is off' do
        let(:modularity_enabled) {false}

        it 'returns the deprecated /s/ path' do
          _(pl_units_started.first[:path]).must_equal "/s/#{unit.name}"
        end
      end
    end

    context 'with BubbleChoice level' do
      subject(:pl_units_started) {user.pl_units_started}
      let(:user) {create(:teacher)}
      let(:pl_unit) {create(:single_unit_course, :pl_course).first_unit}
      let(:sublevels) {[]}
      let(:bubble_choice_level) {create(:bubble_choice_level, sublevels: sublevels)}
      let(:lesson_group) {create(:lesson_group, script: pl_unit)}
      let(:lesson) {create(:lesson, script: pl_unit, lesson_group: lesson_group)}

      before do
        create(:course_version, content_root: pl_unit.original_unit_group)

        3.times do
          sublevels << create(:level)
        end

        create(:script_level, script: pl_unit, levels: [bubble_choice_level], position: 0, lesson: lesson)
        pl_unit.reload

        create(:user_script, user: user, script: pl_unit)

        sublevels.each {|sl| create(:user_level, user: user, script: pl_unit, level: sl, best_result: ActivityConstants::MINIMUM_PASS_RESULT)}

        create(:user_level, user: user, script: pl_unit, level: bubble_choice_level, best_result: ActivityConstants::MINIMUM_PASS_RESULT)
      end

      it 'only counts parent level' do
        _(pl_units_started[0][:percent_completed]).must_equal 100
      end
    end

    context 'with Predict level' do
      subject(:pl_units_started) {user.pl_units_started}
      let(:user) {create(:teacher)}
      let(:pl_unit) {create(:single_unit_course, :pl_course).first_unit}

      let(:free_response_level) {create(:free_response, name: 'free response level')}
      let(:game_level) {create(:level)}

      let(:lesson_group) {create(:lesson_group, script: pl_unit)}
      let(:lesson) {create(:lesson, script: pl_unit, lesson_group: lesson_group)}

      before do
        create(:course_version, content_root: pl_unit.original_unit_group)

        game_level.contained_level_names = ['free response level']
        game_level.save!

        create(:script_level, script: pl_unit, levels: [game_level], position: 0, lesson: lesson)
        pl_unit.reload

        create(:user_script, user: user, script: pl_unit)

        create(:user_level, user: user, script: pl_unit, level: free_response_level, best_result: ActivityConstants::MINIMUM_PASS_RESULT)
      end

      it 'only counts predict level' do
        _(pl_units_started[0][:percent_completed]).must_equal 100
      end
    end
  end
end
