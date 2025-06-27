require 'test_helper'

class Queries::User::TeacherEnabledExperimentsTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:experiment_name_1) {'ai-tutor'}
  let(:experiment_name_2) {'progress-v2'}

  let(:user) {create(:user)}
  let(:teacher_1) {create(:teacher)}
  let(:teacher_2) {create(:teacher)}

  before do
    exp_1 = {name: experiment_name_1}
    exp_2 = {name: experiment_name_2}

    # Stub the `teachers` method on user with RSpecMocks style
    allow(user).to receive(:teachers).and_return([teacher_1])

    allow(Experiment).to receive(:get_all_enabled).with(user: teacher_1).and_return([exp_1])
    allow(Experiment).to receive(:get_all_enabled).with(user: teacher_2).and_return([exp_1, exp_2])
  end

  describe '#call' do
    subject(:call) {Queries::User::TeacherEnabledExperiments.call(user)}

    it 'returns unique enabled experiment names from the user’s teachers' do
      _call.must_equal [experiment_name_1]
    end

    context 'when user has no teachers' do
      before do
        allow(user).to receive(:teachers).and_return(nil)
      end

      it 'returns an empty array' do
        _call.must_equal []
      end
    end

    context 'when teacher has no experiments' do
      before do
        allow(Experiment).to receive(:get_all_enabled).with(user: teacher_1).and_return([])
      end

      it 'returns an empty array' do
        _call.must_equal []
      end
    end

    context 'when user has multiple teachers and duplicate experiments' do
      before do
        allow(user).to receive(:teachers).and_return([teacher_1, teacher_2])
      end

      it 'returns unique experiment names from all teachers' do
        _call.must_equal [experiment_name_1, experiment_name_2]
      end
    end
  end
end
