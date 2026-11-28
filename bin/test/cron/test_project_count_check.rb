require_relative '../test_helper'
require_relative '../../cron/project_count_check'

describe ProjectCountCheck do
  let(:existing_count) {677_501}
  let(:dropped_count) {3_932}

  describe 'in production' do
    it 'raises if the project count decreased significantly' do
      error = assert_raises(RuntimeError) do
        ProjectCountCheck.verify!(existing_count, dropped_count, production: true)
      end
      assert_equal "standalone project count decreased from #{existing_count} to #{dropped_count}", error.message
    end

    it 'does not raise for a small decrease' do
      ProjectCountCheck.verify!(existing_count, existing_count - 9_999, production: true)
    end

    it 'does not raise when the count increases' do
      ProjectCountCheck.verify!(existing_count, existing_count + 1, production: true)
    end
  end

  describe 'outside production' do
    it 'does not raise when the project count decreased significantly' do
      ProjectCountCheck.verify!(existing_count, dropped_count, production: false)
    end
  end
end
