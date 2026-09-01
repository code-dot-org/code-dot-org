require 'test_helper'

class AnonymousLevel::ProgressTest < ActiveSupport::TestCase
  let(:described_class) {AnonymousLevel::Progress}

  let(:script) {create(:unit)}
  let(:level) {create(:level)}
  let(:anon_user_id) {Faker::Internet.uuid}

  describe 'shared level progress behavior' do
    let(:progress) do
      create(
        :anonymous_level_progress,
        anon_user_id:,
        script: script,
        level: level,
        best_result: ActivityConstants::MINIMUM_PASS_RESULT,
        time_spent: 10
      )
    end

    it 'is attempted' do
      _(progress).must_be :attempted?
    end

    it 'is passing' do
      _(progress).must_be :passing?
    end

    it 'calculates total time spent' do
      _(progress.calculate_total_time_spent(5)).must_equal 15
    end

    it 'resolves its unit' do
      _(progress.resolved_unit).must_equal script
    end

    it 'is included in passing scope' do
      _(described_class.passing).must_include progress
    end
  end

  describe 'validations' do
    it 'requires a stable ID' do
      progress = build(:anonymous_level_progress, anon_user_id: nil)

      _(progress).wont_be :valid?
      _(progress.errors[:anon_user_id]).must_include 'is required'
    end

    it 'requires a script' do
      progress = build(:anonymous_level_progress, script: nil)

      _(progress).wont_be :valid?
      _(progress.errors[:script_id]).must_include 'is required'
    end

    it 'requires a level' do
      progress = build(:anonymous_level_progress, level: nil)

      _(progress).wont_be :valid?
      _(progress.errors[:level_id]).must_include 'is required'
    end

    context 'when the stable ID, script, and level already exist' do
      let(:duplicate) {build(:anonymous_level_progress, anon_user_id:, script:, level:)}

      before do
        create(:anonymous_level_progress, anon_user_id:, script:, level:)
      end

      it 'requires a unique stable ID within a script and level' do
        _(duplicate).wont_be :valid?
        _(duplicate.errors[:anon_user_id]).must_include 'has already been taken'
      end
    end
  end

  describe 'when submitted changes from true to false' do
    let(:progress) do
      create(
        :anonymous_level_progress,
        anon_user_id:,
        script:,
        level:,
        submitted: true,
        best_result: ActivityConstants::REVIEW_REJECTED_RESULT
      )
    end

    it 'resets the best result through the shared callback' do
      progress.update!(submitted: false)

      _(progress.best_result).must_equal ActivityConstants::UNSUBMITTED_RESULT
    end
  end
end
