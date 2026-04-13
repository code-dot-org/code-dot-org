#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "yaml"

load File.expand_path("../../bin/argo-trace", __dir__)

class Wave3FakeCommandRunner
  attr_reader :commands, :max_in_flight

  def initialize(outputs: {}, delays: {})
    @outputs = outputs
    @delays = delays
    @commands = Queue.new
    @mutex = Mutex.new
    @in_flight = 0
    @max_in_flight = 0
  end

  def call(*command)
    @commands << command
    @mutex.synchronize do
      @in_flight += 1
      @max_in_flight = [@max_in_flight, @in_flight].max
    end

    sleep(@delays.fetch(command, 0))
    @outputs.fetch(command) do
      raise "unexpected command: #{command.inspect}"
    end
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

class ArgoTraceWave3KubectlDetailsTest < Minitest::Test
  def test_parse_cli_options_defaults_kubectl_details_to_enabled
    options = ArgoTrace.parse_cli_options([])

    assert_equal true, options[:kubectl_details]
  end

  def test_parse_cli_options_accepts_supported_kubectl_details_values
    assert_equal true, ArgoTrace.parse_cli_options(["--kubectl-details", "1"])[:kubectl_details]
    assert_equal false, ArgoTrace.parse_cli_options(["--kubectl-details", "0"])[:kubectl_details]
    assert_equal true, ArgoTrace.parse_cli_options(["--kubectl-details", "true"])[:kubectl_details]
    assert_equal false, ArgoTrace.parse_cli_options(["--kubectl-details", "false"])[:kubectl_details]
  end

  def test_snapshot_body_keeps_wave_3_off_when_frontier_is_only_apps_and_appsets
    command_runner = Wave3FakeCommandRunner.new(outputs: fixture_argocd_outputs_only)

    body_text = ArgoTrace.snapshot_body(
      command_runner: command_runner,
      wrap_width: nil,
      kubectl_details: true
    )

    assert_includes body_text, "- app-of-apps (Application)"
    refute(command_runner.seen_commands.any? {|command| command.first == "kubectl"})
  end

  def test_snapshot_body_turns_wave_3_on_for_emphasized_non_app_resource_leaves
    kubectl_command = ["kubectl", "get", "namespace", "production", "-o", "yaml", "--ignore-not-found"]
    command_runner = Wave3FakeCommandRunner.new(
      outputs: wave_3_fixture_outputs.merge(
        kubectl_command => <<~YAML
          metadata:
            name: production
            deletionTimestamp: 2026-04-12T09:00:00Z
            finalizers:
              - kubernetes
          status:
            phase: Active
            conditions:
              - type: NamespaceDeletionDiscoveryFailure
                status: "True"
                reason: DiscoveryFailed
                message: waiting for discovery
        YAML
      )
    )

    body_text = ArgoTrace.snapshot_body(
      command_runner: command_runner,
      wrap_width: nil,
      kubectl_details: true
    )

    assert_includes command_runner.seen_commands, kubectl_command
    assert_includes body_text, "→     - production (Namespace) [sync.status=Synced, health.status=Progressing]"
    assert_includes body_text, "      - metadata.deletionTimestamp: 2026-04-12T09:00:00Z"
    assert_includes body_text, '      - metadata.finalizers: ["kubernetes"]'
    assert_includes body_text, "      - status.phase: Active"
    assert_includes body_text, "→     - status.conditions.NamespaceDeletionDiscoveryFailure: status=True, reason=DiscoveryFailed, message=waiting for discovery"
  end

  def test_wave_3_runs_selected_kubectl_fetches_in_parallel
    resource_nodes = [
      wave_3_resource_node(kind: "Namespace", name: "production"),
      wave_3_resource_node(kind: "Namespace", name: "staging"),
    ]
    production_command = ["kubectl", "get", "namespace", "production", "-o", "yaml", "--ignore-not-found"]
    staging_command = ["kubectl", "get", "namespace", "staging", "-o", "yaml", "--ignore-not-found"]
    command_runner = Wave3FakeCommandRunner.new(
      outputs: {
        production_command => {"metadata" => {"name" => "production"}}.to_yaml,
        staging_command => {"metadata" => {"name" => "staging"}}.to_yaml,
      },
      delays: {
        production_command => 0.02,
        staging_command => 0.02,
      }
    )

    details = ArgoTrace.fetch_wave_3_kubectl_details(
      command_runner: command_runner,
      resource_nodes: resource_nodes,
      max_parallel_calls: 2,
      per_call_timeout_seconds: 1,
      total_snapshot_timeout_seconds: 1
    )

    assert_equal ["production"], Array(details[["", "Namespace", "", "production"]][:raw].dig("metadata", "name"))
    assert_equal ["staging"], Array(details[["", "Namespace", "", "staging"]][:raw].dig("metadata", "name"))
    assert_operator command_runner.max_in_flight, :>, 1
  end

  def test_wave_3_does_not_recurse_beyond_direct_live_object_fetch
    kubectl_command = ["kubectl", "get", "namespace", "production", "-o", "yaml", "--ignore-not-found"]
    command_runner = Wave3FakeCommandRunner.new(
      outputs: wave_3_fixture_outputs.merge(
        kubectl_command => <<~YAML
          metadata:
            name: production
            finalizers:
              - kubernetes
          status:
            phase: Active
        YAML
      )
    )

    ArgoTrace.snapshot_body(
      command_runner: command_runner,
      wrap_width: nil,
      kubectl_details: true
    )

    kubectl_commands = command_runner.seen_commands.select {|command| command.first == "kubectl"}
    assert_equal [kubectl_command], kubectl_commands
  end

  def test_wave_3_keeps_detail_bullets_suppressed_for_fully_all_ok_subtrees
    command_runner = Wave3FakeCommandRunner.new(outputs: fixture_argocd_outputs_only)

    body_text = ArgoTrace.snapshot_body(
      command_runner: command_runner,
      wrap_width: nil,
      kubectl_details: true
    )

    assert_includes body_text, "          - networking (Application) [sync.status=Synced, health.status=Healthy]"
    refute_includes body_text, "            - metadata.creationTimestamp: 2026-04-12T08:32:19Z"
    refute_includes body_text, "        - status.applicationStatus.message: Application resource became Healthy, updating status from Progressing to Healthy"
    refute_includes body_text, "        - metadata.creationTimestamp: 2026-04-12T08:41:30Z"
  end

  private def fixture_argocd_outputs_only
    fixture_dir = File.expand_path("fixtures/argo-cli-data", __dir__)

    {
      ArgoTrace::WAVE1_APPSET_LIST_COMMAND => File.read(File.join(fixture_dir, "appset-list.yaml")),
      ArgoTrace::WAVE1_APP_LIST_COMMAND => File.read(File.join(fixture_dir, "app-list.yaml")),
      ArgoTrace.appset_get_command("app-of-apps") => File.read(File.join(fixture_dir, "appset-get-app-of-apps.yaml")),
      ArgoTrace.appset_get_command("codeai") => File.read(File.join(fixture_dir, "appset-get-codeai.yaml")),
      ArgoTrace.app_get_command("app-of-apps") => File.read(File.join(fixture_dir, "app-get-app-of-apps.yaml")),
      ArgoTrace.app_get_command("codeai") => File.read(File.join(fixture_dir, "app-get-codeai.yaml")),
      ArgoTrace.app_get_command("codeai-staging") => File.read(File.join(fixture_dir, "app-get-codeai-staging.yaml")),
      ArgoTrace.app_get_command("codeai-test") => File.read(File.join(fixture_dir, "app-get-codeai-test.yaml")),
      ArgoTrace.app_get_command("infra") => File.read(File.join(fixture_dir, "app-get-infra.yaml")),
      ArgoTrace.app_get_command("kargo") => File.read(File.join(fixture_dir, "app-get-kargo.yaml")),
    }
  end

  private def wave_3_fixture_outputs
    {
      ArgoTrace::WAVE1_APPSET_LIST_COMMAND => [].to_yaml,
      ArgoTrace::WAVE1_APP_LIST_COMMAND => [
        {
          "metadata" => {
            "name" => "standard-envtypes",
            "namespace" => "argocd",
          },
          "status" => {
            "sync" => {"status" => "Synced"},
            "health" => {"status" => "Healthy"},
          },
        }
      ].to_yaml,
      ArgoTrace.app_get_command("standard-envtypes") => {
        "metadata" => {
          "name" => "standard-envtypes",
          "namespace" => "argocd",
        },
        "status" => {
          "sync" => {"status" => "Synced"},
          "health" => {"status" => "Healthy"},
          "resources" => [
            {
              "kind" => "Namespace",
              "name" => "production",
              "status" => "Synced",
              "health" => {
                "status" => "Progressing",
                "message" => "Pending deletion",
              },
              "syncWave" => 30,
            }
          ],
        },
      }.to_yaml,
    }
  end

  private def wave_3_resource_node(kind:, name:, namespace: nil, group: "")
    ArgoTrace::TreeNode.new(
      kind: kind,
      name: name,
      namespace: namespace,
      children: [],
      metadata: {
        argo_resource_ref: {
          group: group,
          kind: kind,
          name: name,
          namespace: namespace,
        }
      }
    )
  end
end
