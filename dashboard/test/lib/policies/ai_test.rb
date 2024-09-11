require 'test_helper'
require 'user'
require 'policies/ai'

class Policies::AiTest < ActiveSupport::TestCase
  class AiRubricsEnabledTest < ActiveSupport::TestCase
    setup do
      @user = create :authorized_teacher
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
      script = create :script

      # Create a student/teacher/section
      @teacher = create :authorized_teacher
      @section = create :section, user: @teacher, script: script
      @user = create(:follower, section: @section).student_user

      opt_out_teacher = create :authorized_teacher
      opt_out_teacher.ai_rubrics_disabled = true
      opt_out_teacher.save!
      opt_out_section = create :section, user: opt_out_teacher, script: script
      create(:follower, student_user: @user, section: opt_out_section)

      lesson_group = create :lesson_group, script: script
      lesson = create :lesson, script: script, lesson_group: lesson_group
      @script_level = create(
        :script_level,
        script: script,
        lesson: lesson,
        levels: [
          create(:maze, name: 'test level'),
        ],
      )
      create :user_script, user: @user, script: script
    end

    test 'ai_rubrics_enabled_for_script_level? should return false if given nil as the user' do
      refute Policies::Ai.ai_rubrics_enabled_for_script_level?(nil, @script_level)
    end

    test 'ai_rubrics_enabled_for_script_level? should return false if given nil as the script_level' do
      refute Policies::Ai.ai_rubrics_enabled_for_script_level?(@user, nil)
    end

    test 'ai_rubrics_enabled_for_script_level? should return false if student not part of any sections' do
      isolated_user = create :user
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
      alt_teacher = create :authorized_teacher
      alt_section = create :section, user: alt_teacher
      create(:follower, student_user: @user, section: alt_section)

      assert Policies::Ai.ai_rubrics_enabled_for_script_level?(@user, @script_level)
    end

    test 'ai_rubrics_enabled_for_script_level? should return true as long as a related section the student is in does not opt-out' do
      # Create a section without a Unit
      alt_teacher = create :teacher
      alt_teacher.ai_rubrics_disabled = true
      alt_teacher.save!
      alt_section = create :section, user: alt_teacher
      create(:follower, student_user: @user, section: alt_section)

      assert Policies::Ai.ai_rubrics_enabled_for_script_level?(@user, @script_level)
    end

    test 'ai_rubrics_enabled_for_script_level? should return false if all related sections have teachers that opt-out' do
      # The specific section teacher opts out
      @teacher.ai_rubrics_disabled = true
      @teacher.save!

      # Create a section for a different Unit with a different teacher that does not opt out
      alt_teacher = create :teacher
      alt_script = create :script
      alt_section = create :section, user: alt_teacher, script: alt_script
      create(:follower, student_user: @user, section: alt_section)

      # Should not run the AI analysis
      refute Policies::Ai.ai_rubrics_enabled_for_script_level?(@user, @script_level)
    end
  end
end
