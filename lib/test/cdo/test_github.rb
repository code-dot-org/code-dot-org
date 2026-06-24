require_relative '../test_helper'
require 'cdo/github'

class GitHubTest < Minitest::Test
  describe 'dispatch_workflow' do
    it 'forwards the workflow id, ref, and empty inputs to Octokit' do
      GitHub.stubs(:configure_octokit)
      Octokit.expects(:workflow_dispatch).with(GitHub::REPO, 'dtt.yml', 'test', inputs: {})

      GitHub.dispatch_workflow(workflow_id: 'dtt.yml', ref: 'test')
    end

    it 'passes declared inputs through' do
      GitHub.stubs(:configure_octokit)
      Octokit.expects(:workflow_dispatch).with(GitHub::REPO, 'dtt.yml', 'test', inputs: {'target_url' => 'https://adhoc.code.org'})

      GitHub.dispatch_workflow(workflow_id: 'dtt.yml', ref: 'test', inputs: {'target_url' => 'https://adhoc.code.org'})
    end
  end
end
