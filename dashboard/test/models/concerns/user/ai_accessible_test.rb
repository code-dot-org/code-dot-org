require 'test_helper'

class UserAiAccessibleTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:user) {create(:user)}
  let(:section) {create(:section, ai_tutor_enabled: true)}

  before do
    user.extend(User::AiAccessible)

    allow(user).to receive(:permission?).with(UserPermission::AI_TUTOR_ACCESS).and_return(false)
    allow(user).to receive(:teachers).and_return([])
    allow(user).to receive(:sections_as_student).and_return([section])
    allow(user).to receive(:teacher?).and_return(false)
    allow(user).to receive(:verified_instructor?).and_return(false)
    allow(user).to receive(:oauth?).and_return(false)

    allow(Policies::Lti).to receive(:lti?).and_return(false)
    allow(DCDO).to receive(:get).and_call_original
    allow(DCDO).to receive(:get).with('ai-tutor-disabled', false).and_return(false)
    allow(SingleUserExperiment).to receive(:enabled?).with(user: user, experiment_name: 'ai-tutor').and_return(false)
    allow(Queries::User::TeacherEnabledExperiments).to receive(:call).with(user).and_return(['ai-tutor'])
  end

  describe '#has_ai_tutor_access?' do
    subject(:has_ai_tutor_access?) {user.has_ai_tutor_access?}

    it 'returns false if ai_tutor_access_denied is true' do
      user.update!(ai_tutor_access_denied: true)
      _has_ai_tutor_access?.must_equal false
    end

    it 'returns false if globally disabled' do
      allow(DCDO).to receive(:get).with('ai-tutor-disabled', false).and_return(true)
      _has_ai_tutor_access?.must_equal false
    end

    it 'returns true if user has AI tutor permission' do
      allow(user).to receive(:permission?).with(UserPermission::AI_TUTOR_ACCESS).and_return(true)
      _has_ai_tutor_access?.must_equal true
    end

    it 'returns true if in experiment and section is enabled' do
      _has_ai_tutor_access?.must_equal true
    end
  end

  describe '#can_enable_ai_tutor?' do
    subject(:can_enable_ai_tutor?) {user.can_enable_ai_tutor?}

    it 'returns false if globally disabled' do
      allow(DCDO).to receive(:get).with('ai-tutor-disabled', false).and_return(true)
      _can_enable_ai_tutor?.must_equal false
    end

    it 'returns true if permission is present' do
      allow(user).to receive(:permission?).with(UserPermission::AI_TUTOR_ACCESS).and_return(true)
      _can_enable_ai_tutor?.must_equal true
    end

    it 'returns true if SingleUserExperiment is enabled' do
      allow(SingleUserExperiment).to receive(:enabled?).with(user: user, experiment_name: 'ai-tutor').and_return(true)
      _can_enable_ai_tutor?.must_equal true
    end
  end

  describe '#can_use_ai_iteration_tools?' do
    subject(:can_use_ai_iteration_tools?) {user.can_use_ai_iteration_tools?}

    it 'returns true if user has permission and is a levelbuilder' do
      allow(user).to receive(:permission?).with(UserPermission::AI_TUTOR_ACCESS).and_return(true)
      allow(user).to receive(:levelbuilder?).and_return(true)
      _can_use_ai_iteration_tools?.must_equal true
    end

    it 'returns false otherwise' do
      _can_use_ai_iteration_tools?.must_equal false
    end
  end

  describe '#can_view_student_ai_chat_messages?' do
    subject(:can_view_student_ai_chat_messages?) {user.can_view_student_ai_chat_messages?}

    let(:ai_unit_group) {create(:unit_group, name: 'programming-fundamentals-aitutor-2024')}
    let(:ai_section) {create(:section, unit_group: ai_unit_group)}

    it 'returns true if student is in correct course and experiment is enabled' do
      allow(user).to receive(:sections).and_return([ai_section])
      allow(SingleUserExperiment).to receive(:enabled?).with(user: user, experiment_name: 'ai-tutor').and_return(true)
      _can_view_student_ai_chat_messages?.must_equal true
    end

    it 'returns false for unrelated courses' do
      unrelated_group = create(:unit_group, name: 'other-course')
      section.update!(unit_group: unrelated_group)
      allow(user).to receive(:sections).and_return([section])
      _can_view_student_ai_chat_messages?.must_equal false
    end
  end

  describe '#teacher_can_access_ai_chat?' do
    subject(:teacher_can_access_ai_chat?) {user.teacher_can_access_ai_chat?}

    it 'returns true for verified instructor' do
      allow(user).to receive(:teacher?).and_return(true)
      allow(user).to receive(:verified_instructor?).and_return(true)
      _teacher_can_access_ai_chat?.must_equal true
    end

    it 'returns true for oauth' do
      allow(user).to receive(:teacher?).and_return(true)
      allow(user).to receive(:oauth?).and_return(true)
      _teacher_can_access_ai_chat?.must_equal true
    end

    it 'returns true for LTI teacher' do
      allow(user).to receive(:teacher?).and_return(true)
      allow(Policies::Lti).to receive(:lti?).with(user).and_return(true)
      _teacher_can_access_ai_chat?.must_equal true
    end

    it 'returns false if none of the conditions are met' do
      _teacher_can_access_ai_chat?.must_equal false
    end
  end

  describe '#student_can_access_ai_chat?' do
    subject(:student_can_access_ai_chat?) {user.student_can_access_ai_chat?}
    it 'returns true if teacher can access and section has AI chat enabled' do
      teacher = create(:teacher)
      allow(section).to receive(:assigned_ai_chat?).and_return(true)

      allow(teacher).to receive(:teacher_can_access_ai_chat?).and_return(true)
      allow(user).to receive(:teachers).and_return([teacher])
      allow(user).to receive(:sections_as_student).and_return([section])

      _student_can_access_ai_chat?.must_equal true
    end

    it 'returns false otherwise' do
      _student_can_access_ai_chat?.must_equal false
    end
  end

  describe '#has_aichat_access?' do
    subject(:has_aichat_access?) {user.has_aichat_access?}
    it 'returns true if teacher has access' do
      allow(user).to receive(:teacher_can_access_ai_chat?).and_return(true)
      _has_aichat_access?.must_equal true
    end

    it 'returns true if student has access' do
      allow(user).to receive(:student_can_access_ai_chat?).and_return(true)
      _has_aichat_access?.must_equal true
    end

    it 'returns false otherwise' do
      _has_aichat_access?.must_equal false
    end
  end
end
