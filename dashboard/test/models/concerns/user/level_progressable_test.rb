require 'test_helper'

class LevelProgressableTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  describe '#next_unpassed_visible_progression_level' do
    subject(:next_unpassed_visible_progression_level) {user.next_unpassed_visible_progression_level(script)}

    context 'when none of the lessons are hidden' do
      let(:user) {create(:user)}
      let(:script) {create(:script, :in_single_unit_course, :with_levels, levels_count: 5)}

      context 'when the user has no progress' do
        it 'returns the first visible level' do
          _(next_unpassed_visible_progression_level.chapter).must_equal 1
        end
      end

      context 'when the user has some progress' do
        let(:second_script_level) {script.get_script_level_by_chapter(2)}

        before do
          UserLevel.create(
            user: user,
            level: second_script_level.level,
            script: script,
            attempts: 1,
            best_result: Activity::MINIMUM_PASS_RESULT
          )
        end
        it 'returns the next visible level' do
          _(next_unpassed_visible_progression_level.chapter).must_equal 3
        end
      end

      context 'when the user skips a level' do
        before do
          script.script_levels.take(3).each do |sl|
            UserLevel.create(
              user: user,
              level: sl.level,
              script: script,
              attempts: 1,
              best_result: Activity::MINIMUM_PASS_RESULT
            )
          end
          UserLevel.create(
            user: user,
            level: script.script_levels.last.level,
            script: script,
            attempts: 1,
            best_result: Activity::MINIMUM_PASS_RESULT
          )
        end

        it 'returns the skipped level' do
          _(next_unpassed_visible_progression_level.chapter).must_equal 4
        end
      end

      context 'when the user makes progress out of order' do
        let(:first_script_level) {script.get_script_level_by_chapter(1)}
        let(:second_script_level) {script.get_script_level_by_chapter(2)}
        let(:third_script_level) {script.get_script_level_by_chapter(3)}

        before do
          UserLevel.create(
            user: user,
            level: first_script_level.level,
            script: script,
            attempts: 1,
            best_result: Activity::MINIMUM_PASS_RESULT
          )

          UserLevel.create(
            user: user,
            level: third_script_level.level,
            script: script,
            attempts: 1,
            best_result: Activity::MINIMUM_PASS_RESULT
          )

          UserLevel.create(
            user: user,
            level: second_script_level.level,
            script: script,
            attempts: 1,
            best_result: Activity::MINIMUM_PASS_RESULT
          )
        end

        it 'returns the next visible level' do
          _(next_unpassed_visible_progression_level.chapter).must_equal 4
        end
      end

      context 'when the user has completed all visible levels but the script is not completed' do
        before do
          script.script_levels.each do |sl|
            UserLevel.create(
              user: user,
              level: sl.level,
              script: script,
              attempts: 1,
              best_result: Activity::MINIMUM_PASS_RESULT
            )
          end
        end
        it 'returns the first visible level' do
          _(next_unpassed_visible_progression_level.chapter).must_equal 1
        end
      end

      context 'when the user has completed all visible levels and the script is completed' do
        before do
          allow(Policies::ScriptActivity).to receive(:completed?).with(user, script).and_return(true)
          script.script_levels.each do |sl|
            UserLevel.create(
              user: user,
              level: sl.level,
              script: script,
              attempts: 1,
              best_result: Activity::MINIMUM_PASS_RESULT
            )
          end
        end
        it 'returns nil' do
          _(next_unpassed_visible_progression_level).must_be_nil
        end
      end
    end

    context 'when a lesson is hidden' do
      let(:student) {create :student}
      let(:teacher) {create :teacher}
      let(:script) {create(:script, :in_single_unit_course, :with_levels, lessons_count: 3, levels_count: 1)}
      let(:section) {create(:section, user_id: teacher.id, script_id: script.try(:id), participant_type: 'student', grades: ['9'])}

      context 'when a student has completed the first lesson' do
        before do
          student.sections_as_student << section
          # User completed the first lesson
          script.lessons[0].script_levels.each do |sl|
            UserLevel.create(
              user: student,
              level: sl.level,
              script: script,
              attempts: 1,
              best_result: Activity::MINIMUM_PASS_RESULT
            )
          end

          # Hide the second lesson
          SectionHiddenLesson.create(
            section_id: section.id,
            stage_id: script.lessons[1].id
          )
        end
        it 'returns the third level' do
          _(student.next_unpassed_visible_progression_level(script)).must_equal script.lessons[2].script_levels.first
        end
      end

      context 'when the last level is completed but the script is not complete' do
        before do
          student.sections_as_student << section
          refute_empty student.visible_script_levels(script)

          UserLevel.create(
            user: student,
            level: script.script_levels.last.level,
            script: script,
            attempts: 1,
            best_result: Activity::MINIMUM_PASS_RESULT
          )

          # Hide the first lesson
          SectionHiddenLesson.create(
            section_id: section.id,
            stage_id: script.lessons.first.id
          )
        end

        it 'returns the next unpassed visible level after a hidden first lesson' do
          refute_nil student.next_unpassed_visible_progression_level(script)
          _(student.next_unpassed_visible_progression_level(script).chapter).must_equal 2
        end
      end
    end
  end

  describe '#next_unpassed_progression_level' do
    subject(:next_unpassed_progression_level) {user.next_unpassed_progression_level(script)}

    context 'when the user has made no progress' do
      let(:user) {create :user}
      let(:script)  {create :script, :in_single_unit_course}
      let(:lesson_group)  {create :lesson_group, script: script}
      let(:lesson)  {create :lesson, script: script, lesson_group: lesson_group}

      before do
        create(:script_level, script: script, lesson: lesson, levels: [create(:maze)])
        create(:script_level, script: script, lesson: lesson, levels: [create(:maze)])
        create :user_script, user: user, script: script
      end
      it 'returns the first level' do
        _(next_unpassed_progression_level.chapter).must_equal 1
      end
    end

    context 'when user has not completed any unplugged level' do
      let(:user) {create(:user)}
      let(:script) {create(:script, :in_single_unit_course)}

      before do
        [:unplugged, :level, :unplugged, :level, :unplugged].each do |type|
          level = create(type)
          script_level = create(:script_level, levels: [level], script: script)
          create(:lesson_group, lessons: [script_level.lesson], script: script)
        end

        # Mark all non-unplugged levels as complete
        script.script_levels.each do |sl|
          next if sl.level.game.unplugged?
          UserLevel.create(
            user: user,
            level: sl.level,
            script: script,
            attempts: 1,
            best_result: Activity::MINIMUM_PASS_RESULT
          )
        end
      end

      it 'returns the most recently submitted level' do
        _(next_unpassed_progression_level.chapter).must_equal 4
      end
    end

    context 'when other user has made progress' do
      let(:user) {create :user}
      let(:other_user) {create :user}
      let(:script) {create(:script, :in_single_unit_course, :with_levels, levels_count: 5)}

      before do
        script.script_levels.each do |script_level|
          UserLevel.create(
            user: other_user,
            level: script_level.level,
            script: script,
            attempts: 1,
            best_result: Activity::MINIMUM_PASS_RESULT
          )
        end
      end

      it 'is not tainting current user progress' do
        _(next_unpassed_progression_level.chapter).must_equal 1
      end
    end

    context 'when most recent level is not passed' do
      let(:user) {create :user}
      let(:script) {create(:script, :in_single_unit_course, :with_levels, levels_count: 5)}
      before do
        script.script_levels.each do |script_level|
          next if script_level.chapter != 3
          UserLevel.create(
            user: user,
            level: script_level.level,
            script: script,
            attempts: 1,
            best_result: Activity::MINIMUM_FINISHED_RESULT
          )
        end
      end

      it 'returns most recent not passed level' do
        # The level we most recently had progress on we did not pass, so that's
        # where we should go
        _(next_unpassed_progression_level.chapter).must_equal 3
      end
    end

    context 'when most recent level is the last level' do
      let(:user) {create :user}
      let(:script) {create(:script, :in_single_unit_course, :with_levels, levels_count: 5)}
      let(:script_level) {script.script_levels.last}

      before do
        UserLevel.create(
          user: user,
          level: script_level.level,
          script: script,
          attempts: 1,
          best_result: Activity::MINIMUM_PASS_RESULT
        )
      end

      it 'returns the last level' do
        # User's most recent progress is on last level in script. There's nothing
        # following it, so just return to the last level
        _(next_unpassed_progression_level.chapter).must_equal script_level.chapter
      end
    end

    context 'when most recent level not a progression level' do
      let(:user) {create :user}
      let(:script) {create :script, :in_single_unit_course}
      let(:lesson_group) {create :lesson_group, script: script}
      let(:lesson) {create :lesson, script: script, lesson_group: lesson_group}
      let!(:script_levels) do
        [
          create(:script_level, script: script, lesson: lesson, levels: [create(:maze)]),
          create(:script_level, script: script, lesson: lesson, levels: [create(:unplugged)]),
          create(:script_level, script: script, lesson: lesson, levels: [create(:unplugged)]),
          create(:script_level, script: script, lesson: lesson, levels: [create(:maze)])
        ]
      end
      before do
        create :user_script, user: user, script: script

        UserLevel.create(
          user: user,
          level: script_levels[1].level,
          script: script,
          attempts: 1,
          best_result: Activity::MINIMUM_PASS_RESULT
        )
      end

      it 'returns the the next uncompleted progression level' do
        # User's most recent progress is on unplugged level, that is followed by another
        # unplugged level. We should end up at the first non unplugged level
        _(next_unpassed_progression_level.chapter).must_equal 4
      end
    end

    context 'when last updated user_level is inside a level group' do
      let(:user) {create :user}
      let(:script) {create :script, :in_single_unit_course}
      let(:sub_level_name) {'sublevel1'}
      let(:lesson_group) {create :lesson_group, script: script}
      let(:lesson) {create :lesson, script: script, lesson_group: lesson_group}
      let(:level_group) {create(:level_group, :with_sublevels, name: 'LevelGroupLevel1')}

      let!(:sub_level1) {create :text_match, name: sub_level_name}

      before do
        create :script_level, script: script, levels: [level_group], lesson: lesson
        create :user_script, user: user, script: script

        # Create a UserLevel for our level_group and sublevel, the sublevel is more recent
        UserLevel.create(
          user: user,
          level: level_group,
          script: script,
          attempts: 1,
          best_result: Activity::MINIMUM_PASS_RESULT,
          updated_at: Time.now - 1
        )

        UserLevel.create(
          user: user,
          level: sub_level1,
          script: script,
          attempts: 1,
          best_result: Activity::MINIMUM_PASS_RESULT,
          updated_at: Time.now
        )
      end
      it 'returns a non-nil script level' do
        _next_unpassed_progression_level.wont_be_nil
      end
    end
  end

  describe '#completed_progression_levels?' do
    subject(:completed_progression_levels?) {user.completed_progression_levels?(script)}

    let(:user) {create :user}
    let(:script) {create(:script, :in_single_unit_course, :with_levels, levels_count: 3)}

    context 'when not all progression levels have a passing result' do
      before do
        UserLevel.create(
          user: user,
          level: script.script_levels.first.level,
          script: script,
          attempts: 1,
          best_result: Activity::MINIMUM_PASS_RESULT
        )
      end
      it 'returns false' do
        _completed_progression_levels?.must_equal false
      end
    end

    context 'when all progression levels have a passing result' do
      before do
        script.script_levels.each do |sl|
          UserLevel.create(
            user: user,
            level: sl.level,
            script: script,
            attempts: 1,
            best_result: Activity::MINIMUM_PASS_RESULT
          )
        end
      end
      it 'returns true' do
        _completed_progression_levels?.must_equal true
      end
    end

    context 'when all progression levels with contained levels have a passing result' do
      before do
        # Set up the first level to have contained levels
        contained_level = create(:free_response, name: 'contained level')
        level_with_contained_levels = script.script_levels.first.level
        level_with_contained_levels.contained_level_names = [contained_level.name]
        level_with_contained_levels.save!

        # User progress in contained level
        UserLevel.create(
          user: user,
          level: level_with_contained_levels.contained_levels.first,
          script: script,
          attempts: 1,
          best_result: Activity::MINIMUM_PASS_RESULT
        )

        # User progress in remaining levels
        script.script_levels.drop(1).each do |sl|
          UserLevel.create(
            user: user,
            level: sl.level,
            script: script,
            attempts: 1,
            best_result: Activity::MINIMUM_PASS_RESULT
          )
        end
      end
      it 'returns true' do
        _completed_progression_levels?.must_equal true
      end
    end
  end

  describe '#num_unpassed_progression_levels' do
    subject(:num_unpassed_progression_levels) {user.num_unpassed_progression_levels(script)}

    let(:user) {create :user}
    let(:script) {create(:script, :in_single_unit_course, :with_levels, levels_count: 3)}

    let(:level1) {script.script_levels.first.level}
    let(:level2) {script.script_levels.second.level}
    let(:level3) {script.script_levels.third.level}

    context 'when no levels have progress' do
      it 'returns the number of progression levels' do
        _num_unpassed_progression_levels.must_equal 3
      end
    end

    context 'when some levels are unpassed' do
      before do
        UserLevel.create(
          user: user,
          level: level1,
          script: script,
          attempts: 1,
          best_result: Activity::MINIMUM_PASS_RESULT
        )
        UserLevel.create(
          user: user,
          level: level2,
          script: script,
          attempts: 1,
          best_result: Activity::MINIMUM_FINISHED_RESULT
        )
      end

      it 'returns the number of unpassed progression levels' do
        # The levels are:
        # level1 - passed
        # level2 - failed (unpassed)
        # level3 - no progress (unpassed)
        _num_unpassed_progression_levels.must_equal 2
      end
    end

    context 'when all levels are passed' do
      before do
        # Set all levels as passed
        [level1, level2, level3].each do |level|
          UserLevel.create(
            user: user,
            level: level,
            script: script,
            attempts: 1,
            best_result: Activity::MINIMUM_PASS_RESULT
          )
        end
      end

      it 'returns 0 unpassed progression levels' do
        _num_unpassed_progression_levels.must_equal 0
      end
    end
  end

  describe '#unpassed_progression_level?' do
    subject(:unpassed_progression_level?) {user.unpassed_progression_level?(script_level, user_levels)}

    let(:user) {create :user}
    let(:script) {create(:script, :in_single_unit_course, :with_levels, levels_count: 3)}
    let(:script_level) {script.script_levels.first}

    let(:level) {script_level.level}
    let(:user_level_1) {create(:user_level, user: user, level: level, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)}
    let(:user_level_2) {create(:user_level, user: user, level: level, attempts: 1, best_result: Activity::MINIMUM_FINISHED_RESULT)}
    let(:user_levels) {[user_level_1, user_level_2]}

    context 'when script level is valid progression level' do
      it 'returns false when at least one user level is passing' do
        _unpassed_progression_level?.must_equal false
      end

      it 'returns true when none of the user levels are passing' do
        user_level_1.update(best_result: Activity::MINIMUM_FINISHED_RESULT)
        _unpassed_progression_level?.must_equal true
      end
    end

    context 'when script level is not a valid progression level' do
      before do
        allow(script_level).to receive(:valid_progression_level?).and_return(false)
      end

      it 'returns false' do
        _unpassed_progression_level?.must_equal false
      end
    end
  end

  describe '#script_level_hidden?' do
    subject(:script_level_hidden?) {user.script_level_hidden?(script_level)}

    let(:user) {create :user}
    let(:teacher) {create :teacher}
    let(:script) {create :script, :in_single_unit_course}
    let(:lesson_group) {create :lesson_group, script: script}
    let(:lesson) {create :lesson, script: script, lesson_group: lesson_group}
    let(:script_level) {create :script_level, script: script, lesson: lesson, levels: [create(:level)]}

    context 'when user can be an instructor' do
      let(:section) {create :section, user: teacher, script: nil}

      before do
        # Forcing the user to be an instructor
        allow(script).to receive(:can_be_instructor?).and_return(true)
        # Setting the user be in a section that hides the script
        allow(user).to receive(:sections_as_student).and_return([section])
        allow(script_level).to receive(:hidden_for_section?).with(section.id).and_return(true)
      end

      it 'returns false' do
        _script_level_hidden?.must_equal false
      end
    end

    context 'when user has no sections' do
      it 'returns false' do
        _script_level_hidden?.must_equal false
      end
    end

    context 'when user sections have no script assigned and the lesson is hidden for at least one section' do
      let(:section1) {create :section, user: teacher, script: nil}
      let(:section2) {create :section, user: teacher, script: nil}

      before do
        allow(user).to receive(:sections_as_student).and_return([section1, section2])
        allow(script_level).to receive(:hidden_for_section?).with(section1.id).and_return(true)
        allow(script_level).to receive(:hidden_for_section?).with(section2.id).and_return(false)
      end

      it 'returns true' do
        _script_level_hidden?.must_equal true
      end
    end

    context 'when a user section has a visible script assigned' do
      let(:section1) {create :section, user: teacher, script: script}
      let(:section2) {create :section, user: teacher, script: nil}

      before do
        allow(user).to receive(:sections_as_student).and_return([section1, section2])
      end

      it 'returns false' do
        _script_level_hidden?.must_equal false
      end
    end

    context 'when user has one section with hidden script' do
      let(:section1) {create(:section, user: teacher, script: script)}
      let(:section2) {create(:section, user: teacher, script: script)}

      before do
        allow(user).to receive(:sections_as_student).and_return([section1, section2])
        allow(script_level).to receive(:hidden_for_section?).with(section1.id).and_return(true)
        allow(script_level).to receive(:hidden_for_section?).with(section2.id).and_return(false)
      end

      it 'returns false if any matching section does not hide the script_level' do
        _script_level_hidden?.must_equal false
      end
    end

    context 'when user has all section with hidden script' do
      let(:section1) {create(:section, user: teacher, script: script)}
      let(:section2) {create(:section, user: teacher, script: script)}

      before do
        allow(user).to receive(:sections_as_student).and_return([section1, section2])
        allow(script_level).to receive(:hidden_for_section?).with(section1.id).and_return(true)
        allow(script_level).to receive(:hidden_for_section?).with(section2.id).and_return(true)
      end
      it 'returns true' do
        _script_level_hidden?.must_equal true
      end
    end
  end

  describe '#visible_script_levels' do
    subject(:visible_script_levels) {user.visible_script_levels(script)}

    let(:user) {create :user}
    let(:script) {create(:script, :in_single_unit_course)}
    let(:lesson_group) {create :lesson_group, script: script}
    let(:lesson) {create :lesson, script: script, lesson_group: lesson_group}
    let!(:script_levels) do
      [
        create(:script_level, script: script, lesson: lesson, levels: [create(:level)]),
        create(:script_level, script: script, lesson: lesson, levels: [create(:level)]),
        create(:script_level, script: script, lesson: lesson, levels: [create(:level)]),
      ]
    end

    before do
      # Stub `script_level_hidden?` to control visibility
      allow(user).to receive(:script_level_hidden?).with(script_levels[0]).and_return(false)
      allow(user).to receive(:script_level_hidden?).with(script_levels[1]).and_return(true)
      allow(user).to receive(:script_level_hidden?).with(script_levels[2]).and_return(false)
    end

    it 'returns only the visible script levels' do
      _visible_script_levels.must_equal [script_levels[0], script_levels[2]]
    end
  end
end
