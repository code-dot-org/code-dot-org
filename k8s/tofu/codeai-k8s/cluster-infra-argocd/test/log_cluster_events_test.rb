#!/usr/bin/env ruby
# frozen_string_literal: true

require "fileutils"
require "minitest/autorun"
require "open3"
require "tmpdir"

class LogClusterEventsTest < Minitest::Test
  SOURCE_DIR = File.expand_path("..", __dir__)
  LOG_CLUSTER_EVENTS = File.join(SOURCE_DIR, "bin", "log-cluster-events")

  def test_start_writes_logs_and_prints_tail_commands
    with_fake_module do |module_dir, fake_bin|
      capture_path = File.join(module_dir, "watcher-commands.log")
      env = {
        "LOG_CLUSTER_EVENTS_CAPTURE" => capture_path,
        "PATH" => "#{fake_bin}:#{ENV.fetch('PATH')}",
      }

      stdout, stderr, status = Open3.capture3(
        env,
        File.join(module_dir, "bin", "log-cluster-events"),
        "start",
        "destroy",
      )

      assert status.success?, stderr

      first_lines = stdout.lines.first(3).map(&:strip)
      assert_match(%r{\Atail -n \+1 -f .*/logs/cluster-.*-destroy\.log\z}, first_lines[0])
      assert_match(%r{\Atail -n \+1 -f .*/cluster\.log\z}, first_lines[1])
      assert_match(%r{\Atail -n \+1 -f .*/logs/argo-trace-destroy-.*\.log\.md\z}, first_lines[2])

      run_log = Dir.glob(File.join(module_dir, "logs", "cluster-*-destroy.log")).fetch(0)
      argo_trace_log = Dir.glob(File.join(module_dir, "logs", "argo-trace-destroy-*.log.md")).fetch(0)

      wait_for_file_content(argo_trace_log, "## fake trace\n")
      wait_for_file_includes(capture_path, "kubectl get events -A\n")
      wait_for_file_includes(capture_path, "kubectl get events -A --watch-only --output-watch-events\n")
      wait_for_file_includes(capture_path, "kubectl logs -n argocd statefulset/argocd-application-controller --tail=200 -f\n")
      wait_for_file_includes(capture_path, "kubectl logs -n argocd deployment/argocd-applicationset-controller --tail=200 -f\n")
      assert_includes File.read(run_log), "===== START OF CLUSTER DESTROY LOG SESSION ====="
      assert_includes File.read(run_log), "[meta] argo-trace-log=#{argo_trace_log}"
      assert_equal "## fake trace\n", File.read(argo_trace_log)
      refute_includes File.read(capture_path), "--tail=0"
    end
  end

  def test_stop_succeeds_without_watchers
    stdout, stderr, status = Open3.capture3(LOG_CLUSTER_EVENTS, "stop")

    assert status.success?, stderr
    assert_equal "", stdout
  end

  def test_usage_requires_start_or_stop
    stdout, stderr, status = Open3.capture3(LOG_CLUSTER_EVENTS, "destroy")

    refute status.success?
    assert_match(/usage: .*log-cluster-events <start\|stop> \[label\]/, stderr + stdout)
  end

  private def with_fake_module
    Dir.mktmpdir("log-cluster-events-test") do |tmpdir|
      module_dir = File.join(tmpdir, File.basename(tmpdir))
      bin_dir = File.join(module_dir, "bin")
      fake_bin = File.join(tmpdir, "fake-bin")

      FileUtils.mkdir_p(bin_dir)
      FileUtils.mkdir_p(fake_bin)
      FileUtils.cp(LOG_CLUSTER_EVENTS, File.join(bin_dir, "log-cluster-events"))
      FileUtils.chmod("+x", File.join(bin_dir, "log-cluster-events"))

      write_executable(File.join(bin_dir, "argo-trace"), <<~SH)
        #!/bin/sh
        printf '## fake trace\n'
      SH

      write_fake_commands(fake_bin)
      yield module_dir, fake_bin
    end
  end

  private def write_fake_commands(fake_bin)
    write_executable(File.join(fake_bin, "kubectl"), <<~SH)
      #!/bin/sh
      if [ -n "${LOG_CLUSTER_EVENTS_CAPTURE:-}" ]; then
        printf 'kubectl %s\n' "$*" >> "$LOG_CLUSTER_EVENTS_CAPTURE"
      fi
      exit 0
    SH

    write_executable(File.join(fake_bin, "stdbuf"), <<~SH)
      #!/bin/sh
      while [ $# -gt 0 ]; do
        case "$1" in
          -o*|-e*)
            shift
            ;;
          *)
            break
            ;;
        esac
      done
      exec "$@"
    SH

    write_executable(File.join(fake_bin, "ts"), <<~SH)
      #!/bin/sh
      cat
    SH
  end

  private def write_executable(path, content)
    File.write(path, content)
    FileUtils.chmod("+x", path)
  end

  private def wait_for_file_content(path, expected)
    100.times do
      return if File.exist?(path) && File.read(path) == expected

      sleep 0.05
    end

    flunk("timed out waiting for #{path} to equal #{expected.inspect}")
  end

  private def wait_for_file_includes(path, expected)
    100.times do
      return if File.exist?(path) && File.read(path).include?(expected)

      sleep 0.05
    end

    flunk("timed out waiting for #{path} to include #{expected.inspect}")
  end
end
