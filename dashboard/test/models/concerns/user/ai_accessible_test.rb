require 'test_helper'

class UserAiAccessibleTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:user) {create(:user)}
  let(:qualified_teacher) {create(:teacher).tap {|t| allow(t).to receive(:teacher_can_access_aichat?).and_return(true)}}
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

  describe '#teacher_can_access_aichat?' do
    subject(:teacher_can_access_aichat?) {user.teacher_can_access_aichat?}

    it 'returns true for verified instructor' do
      allow(user).to receive(:teacher?).and_return(true)
      allow(user).to receive(:verified_instructor?).and_return(true)
      _teacher_can_access_aichat?.must_equal true
    end

    it 'returns true for oauth' do
      allow(user).to receive(:teacher?).and_return(true)
      allow(user).to receive(:oauth?).and_return(true)
      _teacher_can_access_aichat?.must_equal true
    end

    it 'returns true for LTI teacher' do
      allow(user).to receive(:teacher?).and_return(true)
      allow(Policies::Lti).to receive(:lti?).with(user).and_return(true)
      _teacher_can_access_aichat?.must_equal true
    end

    it 'returns true for teacher in the preverification pilot' do
      allow(user).to receive(:teacher?).and_return(true)
      create(
        :single_user_experiment,
        min_user_id: user.id,
        name: User::AiAccessible::TEACHER_PREVERIFICATION_PILOT
      )

      _teacher_can_access_aichat?.must_equal true
    end

    it 'returns false for student in the preverification pilot' do
      create(
        :single_user_experiment,
        min_user_id: user.id,
        name: User::AiAccessible::TEACHER_PREVERIFICATION_PILOT
      )

      _teacher_can_access_aichat?.must_equal false
    end

    it 'returns false if none of the conditions are met' do
      _teacher_can_access_aichat?.must_equal false
    end
  end

  describe '#ai_chat_access_level' do
    subject(:ai_chat_access_level) {user.ai_chat_access_level}

    context 'when user is a unverified teacher' do
      it 'returns DISABLED' do
        allow(user).to receive(:teacher?).and_return(true)
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:DISABLED]
      end
    end

    context 'when user is a verified teacher' do
      it 'returns ENABLED' do
        allow(user).to receive(:teacher?).and_return(true)
        allow(user).to receive(:verified_instructor?).and_return(true)
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:ENABLED]
      end
    end

    context 'when user is a levelbuilder' do
      it 'returns ENABLED' do
        allow(user).to receive(:levelbuilder?).and_return(true)
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:ENABLED]
      end
    end

    context 'when student is in a section with ENABLED access' do
      it 'returns ENABLED' do
        enabled_section = create(:section, ai_chat_access_level: Section::AI_CHAT_ACCESS_LEVELS[:ENABLED])
        allow(user).to receive(:teachers).and_return([qualified_teacher])
        allow(user).to receive(:sections_as_student).and_return([enabled_section])
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:ENABLED]
      end
    end

    context 'when student is in a section with ESSENTIAL_ONLY access' do
      it 'returns ESSENTIAL_ONLY' do
        essential_section = create(:section, ai_chat_access_level: Section::AI_CHAT_ACCESS_LEVELS[:ESSENTIAL_ONLY])
        allow(user).to receive(:teachers).and_return([qualified_teacher])
        allow(user).to receive(:sections_as_student).and_return([essential_section])
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:ESSENTIAL_ONLY]
      end
    end

    context 'when student is only in sections with DISABLED access' do
      it 'returns DISABLED' do
        allow(user).to receive(:teachers).and_return([qualified_teacher])
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

    context 'when student has no qualified teacher' do
      it 'returns DISABLED' do
        enabled_section = create(:section, ai_chat_access_level: Section::AI_CHAT_ACCESS_LEVELS[:ENABLED])
        allow(user).to receive(:sections_as_student).and_return([enabled_section])
        # teachers returns [] from before block
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:DISABLED]
      end
    end

    context 'when student is in multiple sections and one has ENABLED access' do
      it 'returns ENABLED' do
        enabled_section = create(:section, ai_chat_access_level: Section::AI_CHAT_ACCESS_LEVELS[:ENABLED])
        allow(user).to receive(:teachers).and_return([qualified_teacher])
        allow(user).to receive(:sections_as_student).and_return([disabled_section, enabled_section])
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:ENABLED]
      end
    end

    context 'when student is in a hidden (archived) section with ENABLED access' do
      it 'returns DISABLED' do
        hidden_section = create(:section, ai_chat_access_level: Section::AI_CHAT_ACCESS_LEVELS[:ENABLED], hidden: true)
        allow(user).to receive(:teachers).and_return([qualified_teacher])
        allow(user).to receive(:sections_as_student).and_return([hidden_section])
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:DISABLED]
      end
    end

    context 'when student is in a hidden (archived) section with ESSENTIAL_ONLY access' do
      it 'returns DISABLED' do
        hidden_section = create(:section, ai_chat_access_level: Section::AI_CHAT_ACCESS_LEVELS[:ESSENTIAL_ONLY], hidden: true)
        allow(user).to receive(:teachers).and_return([qualified_teacher])
        allow(user).to receive(:sections_as_student).and_return([hidden_section])
        _ai_chat_access_level.must_equal Section::AI_CHAT_ACCESS_LEVELS[:DISABLED]
      end
    end
  end

  describe '#can_access_aichat_chat_completion?' do
    let(:ai_chat_lab) {SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_CHAT_LAB]}
    let(:ai_tutor) {SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_TUTOR]}

    before do
      allow(user).to receive(:has_aichat_access?).and_return(false)
      allow(user).to receive(:trust_chat_client?).and_return(false)
    end

    it 'returns false if AI_CHAT_LAB is blocked via DCDO' do
      allow(DCDO).to receive(:get).with("block_aichat_lab_chat_completion", false).and_return(true)
      user.can_access_aichat_chat_completion?(ai_chat_lab, nil).must_equal false
    end

    it 'returns false if AI_TUTOR is blocked via DCDO' do
      allow(DCDO).to receive(:get).with("block_ai_tutor_chat_completion", false).and_return(true)
      user.can_access_aichat_chat_completion?(ai_tutor, nil).must_equal false
    end

    it 'does not block AI_CHAT_LAB when only AI_TUTOR DCDO flag is set' do
      allow(DCDO).to receive(:get).with("block_ai_tutor_chat_completion", false).and_return(true)
      allow(user).to receive(:has_aichat_access?).and_return(true)
      user.can_access_aichat_chat_completion?(ai_chat_lab, nil).must_equal true
    end

    it 'does not block AI_TUTOR when only AI_CHAT_LAB DCDO flag is set' do
      allow(DCDO).to receive(:get).with("block_aichat_lab_chat_completion", false).and_return(true)
      allow(user).to receive(:trust_chat_client?).and_return(true)
      user.can_access_aichat_chat_completion?(ai_tutor, nil).must_equal true
    end

    it 'returns true when user has_aichat_access?' do
      allow(user).to receive(:has_aichat_access?).and_return(true)
      user.can_access_aichat_chat_completion?(ai_chat_lab, 123).must_equal true
    end

    it 'returns true when trust_chat_client? is true' do
      allow(user).to receive(:trust_chat_client?).and_return(true)
      user.can_access_aichat_chat_completion?(ai_tutor, nil).must_equal true
    end

    it 'returns false when neither access check passes' do
      user.can_access_aichat_chat_completion?(ai_chat_lab, nil).must_equal false
    end
  end

  describe '#has_essential_aichat_access?' do
    subject(:has_essential_aichat_access?) {user.has_essential_aichat_access?}
    it 'returns true if teacher has access' do
      allow(user).to receive(:teacher_can_access_aichat?).and_return(true)
      _has_essential_aichat_access?.must_equal true
    end

    it 'returns true if access level is ESSENTIAL_ONLY' do
      allow(user).to receive(:ai_chat_access_level).and_return(Section::AI_CHAT_ACCESS_LEVELS[:ESSENTIAL_ONLY])
      _has_essential_aichat_access?.must_equal true
    end

    it 'returns false otherwise' do
      _has_essential_aichat_access?.must_equal false
    end
  end
end
