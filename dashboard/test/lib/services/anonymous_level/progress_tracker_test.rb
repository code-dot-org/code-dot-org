require 'test_helper'

class Services::AnonymousLevel::ProgressTrackerTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:described_class) {Services::AnonymousLevel::ProgressTracker}
  let(:described_instance) {described_class.new(**tracker_params)}

  let(:anon_user_id) {Cdo::AnonUserId.generate}
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
      submitted:,
      new_result:,
      time_spent:,
      locale:,
    }
  end

  let(:progress_scope) {::AnonymousLevel::Progress.where(anon_user_id:, script:, level:)}

  before do
    allow(DCDO).to receive(:get).and_call_original
    allow(DCDO).to receive(:get).with('anonymous_level_tracking_enabled', false).and_return(tracking_enabled)
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
          anon_user_id:,
          script:,
          level:,
          attempts: 1,
          best_result: ActivityConstants::MINIMUM_FINISHED_RESULT,
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
      let(:new_progress) {instance_double(::AnonymousLevel::Progress)}
      let(:existing_progress) {instance_double(::AnonymousLevel::Progress)}
      let(:duplicate_entry_error) {ActiveRecord::RecordNotUnique.new(Mysql2::Error.new("Duplicate entry '#{anon_user_id}-#{script.id}-#{level.id}'"))}
      let(:progress_attributes) do
        {
          new_result:,
          submitted:,
          unit_group_id: unit_group.id,
          level_source_id: nil,
          is_navigator: false,
          time_spent:,
          locale:,
        }
      end

      before do
        allow(::AnonymousLevel::Progress).to receive(:find_or_initialize_by).
          with(anon_user_id:, script_id: script.id, level_id: level.id).
          and_return(new_progress, existing_progress)
        allow(new_progress).to receive(:update_progress!).and_raise(duplicate_entry_error)
        allow(existing_progress).to receive(:update_progress!)
      end

      it 're-queries and updates existing progress' do
        track_progress

        expect(::AnonymousLevel::Progress).to have_received(:find_or_initialize_by).twice
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
          _(payload['namespace']).must_equal 'anonymous_level'
          _(payload['event']).must_equal 'progress_tracking'
          _(payload['anon_user_id']).must_equal anon_user_id
          _(payload['script_id']).must_equal script.id
          _(payload['level_id']).must_equal level.id
          _(payload['unit_group_id']).must_equal unit_group.id
          _(payload['submitted']).must_equal submitted
          _(payload['new_result']).must_equal new_result
        end

        track_progress
      end
    end
  end
end
