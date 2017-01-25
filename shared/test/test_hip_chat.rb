require_relative 'test_helper'
require 'webmock/minitest'

require 'cdo/hip_chat'

class HipchatTest < Minitest::Test
  def test_slackify
    assert_equal 'this should be *bold*', HipChat.slackify('this should be <b>bold</b>')
    assert_equal 'this should be _italic_', HipChat.slackify('this should be <i>italic</i>')
    assert_equal "this should be\n```\na block of code\n```", HipChat.slackify("this should be\n<pre>\na block of code\n</pre>")

    assert_equal "*dashboard* tests failed <https://a-link.to/somewhere|html output>\n_rerun: bundle exec ./runner.rb -c iPhone -f features/applab/sharedApps.feature --html_",
      HipChat.slackify('<b>dashboard</b> tests failed <a href="https://a-link.to/somewhere">html output</a><br/><i>rerun: bundle exec ./runner.rb -c iPhone -f features/applab/sharedApps.feature --html</i>')
  end
end
