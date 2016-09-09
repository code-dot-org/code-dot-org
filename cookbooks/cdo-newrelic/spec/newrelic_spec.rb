require 'chefspec'
require 'chefspec/berkshelf'

require File.expand_path('libraries/newrelic.rb')

describe 'NewRelicClient' do
  context 'retry_with_timeout' do
    it 'retries correct amount and length' do
      timeout = 100
      sleep_total = 0
      expect(Kernel).to receive(:sleep).exactly(Math.log2(timeout).floor).times {|wait| sleep_total += wait}
      expect do
        NewRelicClient.new.retry_with_timeout(timeout) do
          raise 'nope'
        end
      end.to raise_error(RuntimeError)
      expect(sleep_total).to equal(timeout)
    end
  end
end
