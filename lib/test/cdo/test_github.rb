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

  describe 'find_workflow_run' do
    let(:since) {Time.utc(2026, 9, 1, 22, 53, 0)}

    it 'asks for dispatch runs on the ref created at or after since, in the search date syntax' do
      GitHub.stubs(:configure_octokit)
      older = stub(created_at: since + 5)
      newest = stub(created_at: since + 90)
      Octokit.expects(:workflow_runs).
        with(GitHub::REPO, 'dtt.yml', event: 'workflow_dispatch', branch: 'test', created: '>=2026-09-01T22:53:00+00:00').
        returns(stub(workflow_runs: [older, newest]))

      assert_equal newest, GitHub.find_workflow_run(workflow_id: 'dtt.yml', ref: 'test', since: since)
    end

    it 'is nil while GitHub has not created the run' do
      GitHub.stubs(:configure_octokit)
      Octokit.stubs(:workflow_runs).returns(stub(workflow_runs: []))

      assert_nil GitHub.find_workflow_run(workflow_id: 'dtt.yml', ref: 'test', since: since)
    end
  end

  describe 'wait_for_workflow_run' do
    it 'polls until the run completes' do
      GitHub.stubs(:configure_octokit)
      completed = stub(status: 'completed', conclusion: 'success')
      Octokit.expects(:workflow_run).with(GitHub::REPO, 42).times(3).
        returns(stub(status: 'queued'), stub(status: 'in_progress'), completed)

      assert_equal completed, GitHub.wait_for_workflow_run(42, timeout: 60, interval: 0)
    end

    it 'raises at the deadline instead of polling forever' do
      GitHub.stubs(:configure_octokit)
      Octokit.stubs(:workflow_run).returns(stub(status: 'in_progress'))

      assert_raises(Timeout::Error) {GitHub.wait_for_workflow_run(42, timeout: 0, interval: 0)}
    end
  end

  describe 'workflow_run_jobs' do
    it 'returns the jobs list' do
      GitHub.stubs(:configure_octokit)
      jobs = [stub(name: 'e2e / eyes'), stub(name: 'e2e / e2e (1)')]
      Octokit.expects(:workflow_run_jobs).with(GitHub::REPO, 42).returns(stub(jobs: jobs))

      assert_equal jobs, GitHub.workflow_run_jobs(42)
    end
  end
end
