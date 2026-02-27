require 'test_helper'

class UserAiAccessibleTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:user) {create(:user)}
  let(:disabled_section) {create(:section, ai_chat_access_level: Section::AI_CHAT_ACCESS_LEVELS[:DISABLED])}

  before do
    user.extend(User::AiAccessible)

    allow(user).to receive(:teachers).and_return([])
    allow(user).to receive(:sections_as_student).and_return([disabled_section])
    allow(user).to receive(:teacher?).and_return(false)
    allow(user).to receive(:student?).and_return(true)
    allow(user).to receive(:verified_instructor?).and_return(false)
    allow(user).to receive(:oauth?).and_return(false)

    allow(Policies::Lti).to receive(:lti?).and_return(false)
    allow(DCDO).to receive(:get).and_call_original
  end

  describe '#can_use_ai_iteration_tools?' do
    subject(:can_use_ai_iteration_tools?) {user.can_use_ai_iteration_tools?}

    it 'returns true if user has permission and is a levelbuilder' do
      allow(user).to receive(:levelbuilder?).and_return(true)
      _can_use_ai_iteration_tools?.must_equal true
    end

    it 'returns false otherwise' do
      _can_use_ai_iteration_tools?.must_equal false
    end
  end

  describe '#teacher_can_access_ai_chat_lab?' do
    subject(:teacher_can_access_ai_chat_lab?) {user.teacher_can_access_ai_chat_lab?}

    it 'returns true for verified instructor' do
      allow(user).to receive(:teacher?).and_return(true)
      allow(user).to receive(:verified_instructor?).and_return(true)
      _teacher_can_access_ai_chat_lab?.must_equal true
    end

    it 'returns true for oauth' do
      allow(user).to receive(:teacher?).and_return(true)
      allow(user).to receive(:oauth?).and_return(true)
      _teacher_can_access_ai_chat_lab?.must_equal true
    end

    it 'returns true for LTI teacher' do
      allow(user).to receive(:teacher?).and_return(true)
      allow(Policies::Lti).to receive(:lti?).with(user).and_return(true)
      _teacher_can_access_ai_chat_lab?.must_equal true
    end

    it 'returns false if none of the conditions are met' do
      _teacher_can_access_ai_chat_lab?.must_equal false
    end
  end

  describe '#student_can_access_ai_chat_lab?' do
    subject(:student_can_access_ai_chat_lab?) {user.student_can_access_ai_chat_lab?}

    let(:qualified_teacher) {create(:teacher).tap {|t| allow(t).to receive(:teacher_can_access_ai_chat_lab?).and_return(true)}}

    context 'when teacher can access and access level is ENABLED' do
      it 'returns true' do
        enabled_section = create(:section, ai_chat_access_level: Section::AI_CHAT_ACCESS_LEVELS[:ENABLED])
        allow(user).to receive(:teachers).and_return([qualified_teacher])
        allow(user).to receive(:sections_as_student).and_return([enabled_section])
        _student_can_access_ai_chat_lab?.must_equal true
      end
    end

    context 'when teacher can access and access level is ESSENTIAL_ONLY' do
      it 'returns true' do
        essential_section = create(:section, ai_chat_access_level: Section::AI_CHAT_ACCESS_LEVELS[:ESSENTIAL_ONLY])
        allow(user).to receive(:teachers).and_return([qualified_teacher])
        allow(user).to receive(:sections_as_student).and_return([essential_section])
        _student_can_access_ai_chat_lab?.must_equal true
      end
    end

    context 'when teacher can access but access level is DISABLED' do
      it 'returns false' do
        allow(user).to receive(:teachers).and_return([qualified_teacher])
        # sections_as_student returns disabled_section from before block
        _student_can_access_ai_chat_lab?.must_equal false
      end
    end

    context 'when teacher cannot access' do
      it 'returns false' do
        enabled_section = create(:section, ai_chat_access_level: Section::AI_CHAT_ACCESS_LEVELS[:ENABLED])
        allow(user).to receive(:sections_as_student).and_return([enabled_section])
        # teachers returns [] from before block
        _student_can_access_ai_chat_lab?.must_equal false
      end
    end
  end

  describe '#ai_chat_access_level' do
    subject(:ai_chat_access_level) {user.ai_chat_access_level}

    context 'when user is a teacher' do
      it 'returns ENABLED' do
        allow(user).to receive(:teacher?).and_return(true)
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:ENABLED]
      end
    end

    context 'when student is in a section with ENABLED access' do
      it 'returns ENABLED' do
        enabled_section = create(:section, ai_chat_access_level: Section::AI_CHAT_ACCESS_LEVELS[:ENABLED])
        allow(user).to receive(:sections_as_student).and_return([enabled_section])
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:ENABLED]
      end
    end

    context 'when student is in a section with ESSENTIAL_ONLY access' do
      it 'returns ESSENTIAL_ONLY' do
        essential_section = create(:section, ai_chat_access_level: Section::AI_CHAT_ACCESS_LEVELS[:ESSENTIAL_ONLY])
        allow(user).to receive(:sections_as_student).and_return([essential_section])
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:ESSENTIAL_ONLY]
      end
    end

    context 'when student is only in sections with DISABLED access' do
      it 'returns DISABLED' do
        # sections_as_student returns disabled_section from before block
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:DISABLED]
      end
    end

    context 'when student has no sections' do
      it 'returns DISABLED' do
        allow(user).to receive(:sections_as_student).and_return([])
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:DISABLED]
      end
    end

    context 'when student is in multiple sections and one has ENABLED access' do
      it 'returns ENABLED' do
        enabled_section = create(:section, ai_chat_access_level: Section::AI_CHAT_ACCESS_LEVELS[:ENABLED])
        allow(user).to receive(:sections_as_student).and_return([disabled_section, enabled_section])
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:ENABLED]
      end
    end
  end

  describe '#has_aichat_lab_access?' do
    subject(:has_aichat_lab_access?) {user.has_aichat_lab_access?}
    it 'returns true if teacher has access' do
      allow(user).to receive(:teacher_can_access_ai_chat_lab?).and_return(true)
      _has_aichat_lab_access?.must_equal true
    end

    it 'returns true if student has access' do
      allow(user).to receive(:student_can_access_ai_chat_lab?).and_return(true)
      _has_aichat_lab_access?.must_equal true
    end

    it 'returns false otherwise' do
      _has_aichat_lab_access?.must_equal false
    end
  end
end
