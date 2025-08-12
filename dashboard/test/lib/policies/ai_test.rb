require 'test_helper'
require 'user'
require 'policies/ai'

class Policies::AiTest < ActiveSupport::TestCase
  class AiRubricsEnabledTest < ActiveSupport::TestCase
    setup do
      @user = create(:authorized_teacher)
    end

    test 'ai_rubrics_enabled? should return true when the user ai_rubrics_disabled field is false' do
      @user.ai_rubrics_disabled = false
      assert Policies::Ai.ai_rubrics_enabled?(@user)
    end

    test 'ai_rubrics_enabled? should return false when the user ai_rubrics_disabled field is true' do
      @user.ai_rubrics_disabled = true
      refute Policies::Ai.ai_rubrics_enabled?(@user)
    end

    test 'ai_rubrics_enabled? should return false if given nil as the user' do
      refute Policies::Ai.ai_rubrics_enabled?(nil)
    end
  end

  class AiRubricsEnabledForScriptLevelTest < ActiveSupport::TestCase
    setup do
      # Create a script_level
      script = create(:script, :in_single_unit_course)

      # Create a student/teacher/section
      @teacher = create(:authorized_teacher)
      @section = create(:section, user: @teacher, script: script)
      @user = create(:follower, section: @section).student_user

      opt_out_teacher = create(:authorized_teacher)
      opt_out_teacher.ai_rubrics_disabled = true
      opt_out_teacher.save!
      opt_out_section = create(:section, user: opt_out_teacher, script: script)
      create(:follower, student_user: @user, section: opt_out_section)

      lesson_group = create(:lesson_group, script: script)
      lesson = create(:lesson, script: script, lesson_group: lesson_group)
      @script_level = create(
        :script_level,
        script: script,
        lesson: lesson,
        levels: [
          create(:maze, name: 'test level'),
        ],
      )
      create(:user_script, user: @user, script: script)
    end

    test 'ai_rubrics_enabled_for_script_level? should return false if given nil as the user' do
      refute Policies::Ai.ai_rubrics_enabled_for_script_level?(nil, @script_level)
    end

    test 'ai_rubrics_enabled_for_script_level? should return false if given nil as the script_level' do
      refute Policies::Ai.ai_rubrics_enabled_for_script_level?(@user, nil)
    end

    test 'ai_rubrics_enabled_for_script_level? should return false if student not part of any sections' do
      isolated_user = create(:user)
      refute Policies::Ai.ai_rubrics_enabled_for_script_level?(isolated_user, @script_level)
    end

    test 'ai_rubrics_enabled_for_script_level? should return false if student only in sections that opt-out' do
      @teacher.ai_rubrics_disabled = true
      @teacher.save!
      refute Policies::Ai.ai_rubrics_enabled_for_script_level?(@user, @script_level)
    end

    test 'ai_rubrics_enabled_for_script_level? should return true if student in one section that does not opt-out' do
      assert Policies::Ai.ai_rubrics_enabled_for_script_level?(@user, @script_level)
    end

    test 'ai_rubrics_enabled_for_script_level? should return true as long as a general section the student is in does not opt-out' do
      # The specific section teacher opts out
      @teacher.ai_rubrics_disabled = true
      @teacher.save!

      # Create a section without a Unit
      alt_teacher = create(:authorized_teacher)
      alt_section = create(:section, user: alt_teacher)
      create(:follower, student_user: @user, section: alt_section)

      assert Policies::Ai.ai_rubrics_enabled_for_script_level?(@user, @script_level)
    end

    test 'ai_rubrics_enabled_for_script_level? should return true as long as a related section the student is in does not opt-out' do
      # Create a section without a Unit
      alt_teacher = create(:teacher)
      alt_teacher.ai_rubrics_disabled = true
      alt_teacher.save!
      alt_section = create(:section, user: alt_teacher)
      create(:follower, student_user: @user, section: alt_section)

      assert Policies::Ai.ai_rubrics_enabled_for_script_level?(@user, @script_level)
    end

    test 'ai_rubrics_enabled_for_script_level? should return false if all related sections have teachers that opt-out' do
      # The specific section teacher opts out
      @teacher.ai_rubrics_disabled = true
      @teacher.save!

      # Create a section for a different Unit with a different teacher that does not opt out
      alt_teacher = create(:teacher)
      alt_script = create(:script, :in_single_unit_course)
      alt_section = create(:section, user: alt_teacher, script: alt_script)
      create(:follower, student_user: @user, section: alt_section)

      # Should not run the AI analysis
      refute Policies::Ai.ai_rubrics_enabled_for_script_level?(@user, @script_level)
    end
  end

  describe '.ai_differentiation_enabled?' do
    let(:ai_differentiation_enabled?) {Policies::Ai.ai_differentiation_enabled?(user)}
    let(:user_type) {'student'}

    let(:user) {build_stubbed(:user, user_type: user_type)}

    it 'returns false' do
      _(ai_differentiation_enabled?).must_equal false
    end

    context 'when the user is a teacher and has not specified a preference for enabling ai diff' do
      let(:user) {build_stubbed(:user, user_type: 'teacher')}

      it 'returns true' do
        _(ai_differentiation_enabled?).must_equal true
      end
    end

    context 'when the user is a teacher and has enabled access to ai diff' do
      let(:user) {build_stubbed(:user, user_type: 'teacher', ai_differentiation_toggled_off: false)}

      it 'returns true' do
        _(ai_differentiation_enabled?).must_equal true
      end
    end

    context 'when the user is a teacher and has disabled access to ai diff' do
      let(:user) {build_stubbed(:user, user_type: 'teacher', ai_differentiation_toggled_off: true)}

      it 'returns true' do
        _(ai_differentiation_enabled?).must_equal false
      end
    end
  end

  describe '.ai_differentiation_enabled_for_unit?' do
    let(:ai_differentiation_enabled_for_unit?) {Policies::Ai.ai_differentiation_enabled_for_unit?(unit_input)}

    let(:unit_group_name) {'some-unit-group'}
    let(:unit_group) {build(:unit_group, name: unit_group_name)}
    let(:unit_name) {'some-unit'}
    let(:unit) {build(:unit, name: unit_name)}

    let(:unit_input) {unit}

    context 'the unit is an actual unit' do
      context 'the unit name is stable' do
        let(:unit) {build(:unit, name: unit_name, published_state: 'stable')}
        it 'returns true' do
          _(ai_differentiation_enabled_for_unit?).must_equal true
        end
      end

      context 'the unit is not stable' do
        it 'returns false' do
          _(ai_differentiation_enabled_for_unit?).must_equal false
        end
      end
    end

    context 'the unit is a unit group' do
      let(:unit_input) {unit_group}

      context 'the unit group is stable' do
        let(:unit_group) {build(:unit_group, name: unit_group_name, published_state: 'stable')}
        it 'returns true' do
          _(ai_differentiation_enabled_for_unit?).must_equal true
        end
      end

      context 'the unit group is not stable' do
        it 'returns false' do
          _(ai_differentiation_enabled_for_unit?).must_equal false
        end
      end
    end
  end

  describe '.ai_differentiation_enabled_for_lesson?' do
    let(:ai_differentiation_enabled_for_lesson?) {Policies::Ai.ai_differentiation_enabled_for_lesson?(lesson)}

    let(:unit_name) {'some-unit'}
    let(:unit) {build(:unit, name: unit_name)}
    let(:lesson) {build(:lesson, script: unit)}

    context 'the unit of the lesson is stable' do
      let(:unit) {build(:unit, name: unit_name, published_state: 'stable')}
      it 'returns true' do
        _(ai_differentiation_enabled_for_lesson?).must_equal true
      end
    end

    context 'the unit is not stable' do
      it 'returns false' do
        _(ai_differentiation_enabled_for_lesson?).must_equal false
      end
    end

    context 'the lesson belongs to a real unit we are specifically allowing' do
      ['csd3-2023'].each do |real_unit_name|
        context(real_unit_name) do
          let(:unit) {build(:unit, name: real_unit_name, published_state: 'stable')}

          it 'returns true' do
            _(ai_differentiation_enabled_for_lesson?).must_equal true
          end
        end
      end
    end
  end
end
