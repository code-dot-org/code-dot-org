require_relative '../test_helper'
require 'cdo/developers_topic'

class DevelopersTopicTest < Minitest::Test
  describe 'dotd' do
    it 'returns the dotd (excluding @ symbol)' do
      Slack.stubs(:get_topic).returns('DOTD: @someone; DTS: yes; DTT: yes; DTP: yes; DTL: yes')

      assert_equal 'someone', DevelopersTopic.dotd
    end

    it 'raises an exception if topic is malformed' do
      Slack.stubs(:get_topic).returns('DTS: yes; DTT: yes; DTP: yes; DTL: yes')

      assert_raises {DevelopersTopic.dotd}
    end
  end
end
