require 'test_helper'

class Queries::User::EnabledExperimentsTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:experiment_name_1) {'ai-tutor'}
  let(:experiment_name_2) {'progress-v2'}

  let(:user) {create(:user)}

  before do
    exp_1 = {name: experiment_name_1}
    exp_2 = {name: experiment_name_2}

    allow(Experiment).to receive(:get_all_enabled).with(user: user).and_return([exp_1, exp_2])
  end

  describe '#call' do
    subject(:call) {Queries::User::EnabledExperiments.new(user).call}

    it 'returns enabled experiment names for the user' do
      _call.must_equal [experiment_name_1, experiment_name_2]
    end
  end
end
