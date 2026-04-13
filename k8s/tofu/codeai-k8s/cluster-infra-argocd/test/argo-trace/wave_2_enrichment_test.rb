#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "pathname"

load File.expand_path("../../bin/argo-trace", __dir__)

class ConcurrentFakeCommandRunner
  attr_reader :commands, :max_in_flight

  def initialize(outputs: {}, delays: {}, errors: {})
    @outputs = outputs
    @delays = delays
    @errors = errors
    @commands = Queue.new
    @mutex = Mutex.new
    @in_flight = 0
    @max_in_flight = 0
  end

  def call(*command, timeout_seconds: nil)
    @commands << command
    @mutex.synchronize do
      @in_flight += 1
      @max_in_flight = [@max_in_flight, @in_flight].max
    end

    delay = @delays.fetch(command, 0)
    if timeout_seconds && delay > timeout_seconds
      sleep(timeout_seconds)
      raise Timeout::Error
    end

    sleep(delay)
    raise @errors.fetch(command) if @errors.key?(command)

    @outputs.fetch(command)
  ensure
    @mutex.synchronize do
      @in_flight -= 1
    end
  end

  def seen_commands
    commands = []
    commands << @commands.pop until @commands.empty?
    commands
  end
end

class ArgoTraceWave2EnrichmentTest < Minitest::Test
  FIXTURE_DIR = Pathname.new(__dir__) / "fixtures" / "argo-cli-data"

  def test_fetches_all_appsets_and_selected_apps
    command_runner = ConcurrentFakeCommandRunner.new(
      outputs: {
        ArgoTrace.appset_get_command("app-of-apps") => (FIXTURE_DIR / "appset-get-app-of-apps.yaml").read,
        ArgoTrace.appset_get_command("codeai") => (FIXTURE_DIR / "appset-get-codeai.yaml").read,
        ArgoTrace.app_get_command("app-of-apps") => (FIXTURE_DIR / "app-get-app-of-apps.yaml").read,
        ArgoTrace.app_get_command("codeai") => (FIXTURE_DIR / "app-get-codeai.yaml").read,
      }
    )

    enrichment = ArgoTrace.fetch_wave_2_app_details(
      command_runner: command_runner,
      appset_names: %w[app-of-apps codeai],
      app_names: %w[app-of-apps codeai],
      max_parallel_calls: 4
    )

    assert_equal %w[app-of-apps codeai], enrichment[:appsets].keys
    assert_equal %w[app-of-apps codeai], enrichment[:apps].keys
    assert_equal "app-of-apps", enrichment[:appsets]["app-of-apps"][:raw].dig("metadata", "name")
    assert_equal "codeai", enrichment[:apps]["codeai"][:raw].dig("metadata", "name")
    assert_equal false, enrichment[:timed_out]
  end

  def test_fetch_wave_2_accepts_live_unwrapped_object_payloads
    command_runner = ConcurrentFakeCommandRunner.new(
      outputs: {
        ArgoTrace.app_get_command("app-of-apps") => "---\nmetadata:\n  name: app-of-apps\n",
      }
    )

    enrichment = ArgoTrace.fetch_wave_2_app_details(
      command_runner: command_runner,
      appset_names: [],
      app_names: %w[app-of-apps],
      max_parallel_calls: 1
    )

    assert_equal "app-of-apps", enrichment[:apps]["app-of-apps"][:raw].dig("metadata", "name")
  end

  def test_argocd_output_object_accepts_live_direct_object_payload
    payload = {"metadata" => {"name" => "app-of-apps"}}

    assert_equal payload, ArgoTrace.argocd_output_object(payload)
  end

  def test_fetch_wave_2_accepts_live_unwrapped_object_payloads_for_apps_and_appsets
    command_runner = ConcurrentFakeCommandRunner.new(
      outputs: {
        ArgoTrace.appset_get_command("app-of-apps") => <<~YAML,
          ---
          metadata:
            name: app-of-apps
            namespace: argocd
        YAML
        ArgoTrace.app_get_command("app-of-apps") => <<~YAML,
          ---
          metadata:
            name: app-of-apps
            namespace: argocd
        YAML
      }
    )

    enrichment = ArgoTrace.fetch_wave_2_app_details(
      command_runner: command_runner,
      appset_names: %w[app-of-apps],
      app_names: %w[app-of-apps],
      max_parallel_calls: 2
    )

    assert_equal "app-of-apps", enrichment[:appsets]["app-of-apps"][:raw].dig("metadata", "name")
    assert_equal "app-of-apps", enrichment[:apps]["app-of-apps"][:raw].dig("metadata", "name")
  end

  def test_respects_max_parallel_call_cap
    app_names = Array.new(55) {|i| "app-#{i}"}
    outputs = app_names.to_h do |name|
      [ArgoTrace.app_get_command(name), "---\nmetadata:\n  name: #{name}\n"]
    end
    command_runner = ConcurrentFakeCommandRunner.new(
      outputs: outputs,
      delays: outputs.keys.to_h {|command| [command, 0.02]}
    )

    ArgoTrace.fetch_wave_2_app_details(
      command_runner: command_runner,
      appset_names: [],
      app_names: app_names,
      max_parallel_calls: 50,
      per_call_timeout_seconds: 1,
      total_snapshot_timeout_seconds: 3
    )

    assert_operator command_runner.max_in_flight, :<=, 50
  end

  def test_attaches_per_call_timeout_errors_without_discarding_other_results
    slow_command = ArgoTrace.app_get_command("slow-app")
    fast_command = ArgoTrace.app_get_command("fast-app")
    command_runner = ConcurrentFakeCommandRunner.new(
      outputs: {
        slow_command => "---\nmetadata:\n  name: slow-app\n",
        fast_command => "---\nmetadata:\n  name: fast-app\n",
      },
      delays: {
        slow_command => 0.05,
      }
    )

    enrichment = ArgoTrace.fetch_wave_2_app_details(
      command_runner: command_runner,
      appset_names: [],
      app_names: %w[slow-app fast-app],
      max_parallel_calls: 2,
      per_call_timeout_seconds: 0.01,
      total_snapshot_timeout_seconds: 1
    )

    assert_equal :timeout, enrichment[:apps]["slow-app"][:error][:message]
    assert_includes enrichment[:apps]["slow-app"][:error][:stderr], "timed out after 0.01s"
    assert_equal "fast-app", enrichment[:apps]["fast-app"][:raw].dig("metadata", "name")
  end

  def test_attaches_command_failures_to_results
    command = ArgoTrace.appset_get_command("codeai")
    command_runner = ConcurrentFakeCommandRunner.new(
      outputs: {},
      errors: {
        command => RuntimeError.new("argocd said no"),
      }
    )

    enrichment = ArgoTrace.fetch_wave_2_app_details(
      command_runner: command_runner,
      appset_names: %w[codeai],
      app_names: [],
      max_parallel_calls: 1
    )

    assert_equal :command_failed, enrichment[:appsets]["codeai"][:error][:message]
    assert_equal "argocd --core appset get codeai -o yaml", enrichment[:appsets]["codeai"][:error][:command]
    assert_equal "argocd said no", enrichment[:appsets]["codeai"][:error][:stderr]
  end

  def test_falls_back_to_wave_1_objects_when_wave_2_get_fails
    app_inventory = {
      "codeai" => {
        raw: {
          "metadata" => {"name" => "codeai"},
          "status" => {
            "sync" => {"status" => "OutOfSync"},
            "health" => {"status" => "Healthy"},
          },
        },
      },
    }
    appset_inventory = {
      "codeai" => {
        raw: {
          "metadata" => {"name" => "codeai"},
          "status" => {
            "conditions" => [{"type" => "ResourcesUpToDate", "status" => "True"}],
          },
        },
      },
    }
    command_runner = ConcurrentFakeCommandRunner.new(
      outputs: {},
      errors: {
        ArgoTrace.app_get_command("codeai") => RuntimeError.new("helm core mode blew up"),
        ArgoTrace.appset_get_command("codeai") => RuntimeError.new("permission denied"),
      }
    )

    enrichment = ArgoTrace.fetch_wave_2_app_details(
      command_runner: command_runner,
      appset_names: %w[codeai],
      app_names: %w[codeai],
      app_inventory: app_inventory,
      appset_inventory: appset_inventory,
      max_parallel_calls: 2
    )

    assert_equal "codeai", enrichment[:apps]["codeai"][:raw].dig("metadata", "name")
    assert_nil enrichment[:apps]["codeai"][:error]
    assert_equal "codeai", enrichment[:appsets]["codeai"][:raw].dig("metadata", "name")
    assert_nil enrichment[:appsets]["codeai"][:error]
  end

  def test_total_snapshot_timeout_marks_unfinished_jobs
    slow_command = ArgoTrace.app_get_command("slow-app")
    queued_command = ArgoTrace.app_get_command("queued-app")
    command_runner = ConcurrentFakeCommandRunner.new(
      outputs: {
        slow_command => "---\nmetadata:\n  name: slow-app\n",
        queued_command => "---\nmetadata:\n  name: queued-app\n",
      },
      delays: {
        slow_command => 0.05,
      }
    )

    enrichment = ArgoTrace.fetch_wave_2_app_details(
      command_runner: command_runner,
      appset_names: [],
      app_names: %w[slow-app queued-app],
      max_parallel_calls: 1,
      per_call_timeout_seconds: 1,
      total_snapshot_timeout_seconds: 0.01
    )

    assert_equal true, enrichment[:timed_out]
    assert_equal :total_timeout, enrichment[:apps]["slow-app"][:error][:message]
    assert_equal :total_timeout, enrichment[:apps]["queued-app"][:error][:message]
    assert_includes enrichment[:apps]["queued-app"][:error][:stderr], "total snapshot timeout after 0.01s"
  end
end
