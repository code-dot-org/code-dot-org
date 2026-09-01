require 'test_helper'

class Services::AnonymousLevelProgress::TrackerTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:described_class) {Services::AnonymousLevelProgress::Tracker}
  let(:described_instance) {described_class.new(**tracker_params)}

  let(:anon_user_id) {Faker::Internet.uuid}
  let(:script) {create(:unit)}
  let(:level) {create(:level)}
  let(:unit_group) {create(:unit_group)}
  let(:new_result) {ActivityConstants::MINIMUM_PASS_RESULT}
  let(:submitted) {false}
  let(:time_spent) {10}
  let(:locale) {'uk-UA'}
  let(:tracking_enabled) {true}

  let(:tracker_params) do
    {
      anon_user_id:,
      script_id: script.id,
      level_id: level.id,
      unit_group_id: unit_group.id,
      submitted: submitted,
      new_result: new_result,
      time_spent: time_spent,
      locale: locale,
    }
  end

  let(:progress_scope) {::AnonymousLevelProgress.where(anon_user_id:, script_id: script.id, level_id: level.id)}

  before do
    allow(DCDO).to receive(:get).and_call_original
    allow(DCDO).to receive(:get).with('anonymous_level_progress_tracking_enabled', false).and_return(tracking_enabled)
  end

  it 'inherits from Services::Base' do
    _(described_class.superclass).must_equal Services::Base
  end

  describe '#call' do
    subject(:track_progress) {described_instance.call}

    it 'creates anonymous level progress' do
      _ {track_progress}.must_change -> {progress_scope.count}, from: 0, to: 1
    end

    it 'records progress attributes' do
      track_progress

      progress = progress_scope.first!
      _(progress.attempts).must_equal 1
      _(progress.best_result).must_equal new_result
      _(progress.submitted).must_equal submitted
      _(progress.unit_group_id).must_equal unit_group.id
      _(progress.time_spent).must_equal time_spent
      _(progress.locale).must_equal locale
    end

    context 'when matching progress exists' do
      let!(:progress) do
        create(
          :anonymous_level_progress,
          anon_user_id: anon_user_id,
          script: script,
          level: level,
          attempts: 1,
          best_result: ActivityConstants::MINIMUM_FINISHED_RESULT
        )
      end

      it 'updates existing record' do
        _ {track_progress}.wont_change -> {progress_scope.count}

        progress.reload
        _(progress.attempts).must_equal 2
        _(progress.best_result).must_equal new_result
      end
    end

    context 'when another request creates matching progress first' do
      let(:new_progress) {instance_double(::AnonymousLevelProgress)}
      let(:existing_progress) {instance_double(::AnonymousLevelProgress)}
      let(:duplicate_entry_error) {ActiveRecord::RecordNotUnique.new(Mysql2::Error.new("Duplicate entry '#{anon_user_id}-#{script.id}-#{level.id}'"))}
      let(:progress_attributes) do
        {
          new_result: new_result,
          submitted: submitted,
          unit_group_id: unit_group.id,
          level_source_id: nil,
          is_navigator: false,
          time_spent: time_spent,
          locale: locale,
        }
      end

      before do
        allow(::AnonymousLevelProgress).to receive(:find_or_initialize_by).
          with(anon_user_id:, script_id: script.id, level_id: level.id).
          and_return(new_progress, existing_progress)
        allow(new_progress).to receive(:update_progress!).and_raise(duplicate_entry_error)
        allow(existing_progress).to receive(:update_progress!)
      end

      it 're-queries and updates existing progress' do
        track_progress

        expect(::AnonymousLevelProgress).to have_received(:find_or_initialize_by).twice
        expect(existing_progress).to have_received(:update_progress!).with(progress_attributes).once
      end
    end

    context 'when tracking is disabled' do
      let(:tracking_enabled) {false}

      it 'does not persist progress' do
        _ {track_progress}.wont_change -> {progress_scope.count}
      end

      it 'logs progress payload' do
        CDO.log.expects(:info).once.with do |message|
          payload = JSON.parse(message)
          payload['namespace'] == 'anonymous_level_progress' &&
            payload['event'] == 'tracking' &&
            payload['anon_user_id'] == anon_user_id &&
            payload['script_id'] == script.id &&
            payload['level_id'] == level.id &&
            payload['unit_group_id'] == unit_group.id &&
            payload['submitted'] == submitted &&
            payload['new_result'] == new_result
        end

        track_progress
      end
    end
  end
end
