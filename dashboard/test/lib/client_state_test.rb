require 'test_helper'

class ClientStateTest < ActiveSupport::TestCase
  subject(:described_instance) {ClientState.new(request:)}

  let(:anon_user_id) {Cdo::AnonUserId.generate}
  let(:session) {ActionController::TestSession.new}
  let(:request) {ActionDispatch::TestRequest.create.tap {|request| request.session = session}}

  let(:script_level) {create(:script_level)}
  let(:script) {script_level.script}
  let(:level) {script_level.level}

  describe '#level_progress' do
    subject(:level_progress) {described_instance.level_progress(script_id: script.id, level_id: level.id)}

    it 'returns 0' do
      _level_progress.must_equal 0
    end

    it 'does not create anonymous user ID' do
      level_progress

      _(request.existing_anon_user_id).must_be_nil
      _(session).wont_include Cdo::AnonUserId::KEY
    end

    context 'when other anonymous user has progress' do
      before do
        create(:anonymous_level_progress, script:, level:, best_result: 20)
      end

      it 'returns 0' do
        _level_progress.must_equal 0
      end
    end

    context 'when anonymous user ID is in session' do
      before do
        session[Cdo::AnonUserId::KEY] = anon_user_id
      end

      it 'returns 0' do
        _level_progress.must_equal 0
      end

      context 'when anonymous user has progress' do
        before do
          create(:anonymous_level_progress, anon_user_id:, script:, level:, best_result: 20)
        end

        it 'returns best result for script and level' do
          _level_progress.must_equal 20
        end
      end

      context 'when other anonymous user has progress' do
        before do
          create(:anonymous_level_progress, script:, level:, best_result: 20)
        end

        it 'returns 0' do
          _level_progress.must_equal 0
        end
      end

      context 'when anonymous user has progress on other levels and scripts' do
        before do
          create(:anonymous_level_progress, anon_user_id:, script:, best_result: 20)
          create(:anonymous_level_progress, anon_user_id:, level:, best_result: 20)
        end

        it 'returns 0' do
          _level_progress.must_equal 0
        end
      end
    end

    context 'when anonymous user ID is in cookie' do
      before do
        request.cookies[Cdo::AnonUserId::KEY] = anon_user_id
      end

      context 'when anonymous user has progress' do
        before do
          create(:anonymous_level_progress, anon_user_id:, script:, level:, best_result: 20)
        end

        it 'returns best result for script and level' do
          _level_progress.must_equal 20
        end
      end
    end
  end

  describe '#scripts' do
    subject(:scripts) {described_instance.scripts}

    let(:other_script) {create(:script)}

    it 'returns no scripts' do
      _scripts.must_equal []
    end

    it 'does not create anonymous user ID' do
      scripts

      _(request.existing_anon_user_id).must_be_nil
      _(session).wont_include Cdo::AnonUserId::KEY
    end

    context 'when other anonymous user has progress' do
      before do
        create(:anonymous_level_progress, script:)
      end

      it 'returns no scripts' do
        _scripts.must_equal []
      end
    end

    context 'when anonymous user ID is in session' do
      before do
        session[Cdo::AnonUserId::KEY] = anon_user_id
      end

      it 'returns no scripts' do
        _scripts.must_equal []
      end

      context 'when anonymous user has progress in several scripts' do
        before do
          create(:anonymous_level_progress, anon_user_id:, script:)
          create(:anonymous_level_progress, anon_user_id:, script:)
          create(:anonymous_level_progress, anon_user_id:, script: other_script)
        end

        it 'returns each script once' do
          _(scripts.sort).must_equal [script.id, other_script.id].sort
        end
      end

      context 'when other anonymous user has progress' do
        before do
          create(:anonymous_level_progress, anon_user_id:, script:)
          create(:anonymous_level_progress, script: other_script)
        end

        it 'ignores scripts of other anonymous user' do
          _scripts.must_equal [script.id]
        end
      end
    end
  end

  describe '#reset' do
    subject(:reset) {described_instance.reset}

    context 'when anonymous user has progress, videos and callouts seen' do
      before do
        request.cookies[Cdo::AnonUserId::KEY] = anon_user_id
        session[Cdo::AnonUserId::KEY] = anon_user_id
        create(:anonymous_level_progress, anon_user_id:, script:, level:, best_result: 20)
        described_instance.add_video_seen('video')
        described_instance.add_callout_seen('callout')
      end

      it 'clears anonymous user ID from cookie and session' do
        reset

        _(request.cookies).wont_include Cdo::AnonUserId::KEY
        _(request.cookie_jar.deleted?(Cdo::AnonUserId::KEY, domain: :all)).must_equal true
        _(session).wont_include Cdo::AnonUserId::KEY
        _(request.existing_anon_user_id).must_be_nil
      end

      it 'hides progress of previous anonymous user' do
        reset

        _(described_instance.level_progress(script_id: script.id, level_id: level.id)).must_equal 0
        _(described_instance.scripts).must_equal []
      end

      it 'clears videos and callouts seen' do
        reset

        _(described_instance.video_seen?('video')).must_be_nil
        _(described_instance.callout_seen?('callout')).must_be_nil
      end
    end
  end
end
