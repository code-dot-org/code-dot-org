#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "mocha/minitest"
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

  def call(*command, timeout_seconds: nil)
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
    assert_equal 2, options[:ref_max_recursion_depth]
  end

  def test_parse_cli_options_accepts_supported_kubectl_details_values
    assert_equal true, ArgoTrace.parse_cli_options(["--kubectl-details", "1"])[:kubectl_details]
    assert_equal false, ArgoTrace.parse_cli_options(["--kubectl-details", "0"])[:kubectl_details]
    assert_equal true, ArgoTrace.parse_cli_options(["--kubectl-details", "true"])[:kubectl_details]
    assert_equal false, ArgoTrace.parse_cli_options(["--kubectl-details", "false"])[:kubectl_details]
  end

  def test_parse_cli_options_accepts_ref_max_recursion_depth
    assert_equal 0, ArgoTrace.parse_cli_options(["--ref-max-recursion-depth", "0"])[:ref_max_recursion_depth]
    assert_equal 3, ArgoTrace.parse_cli_options(["--ref-max-recursion-depth", "3"])[:ref_max_recursion_depth]
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
    kubectl_command = ["kubectl", "get", "Namespace", "production", "-o", "yaml", "--ignore-not-found"]
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

    deletion_now = Time.parse("2026-04-12T09:00:09Z")
    Time.stubs(:now).returns(deletion_now)
    body_text = ArgoTrace.snapshot_body(
      command_runner: command_runner,
      wrap_width: nil,
      kubectl_details: true
    )

    assert_includes command_runner.seen_commands, kubectl_command
    assert_includes body_text, "→   - production (Namespace) [sync.status=Synced, health.status=Progressing, status.conditions.NamespaceDeletionDiscoveryFailure=True]"
    assert_includes body_text, "      - metadata.deletionTimestamp: #{ArgoTrace.display_metadata_timestamp('2026-04-12T09:00:00Z', now: deletion_now)}"
    assert_includes body_text, '      - metadata.finalizers: ["kubernetes"]'
    assert_includes body_text, "      - status.phase: Active"
    assert_includes body_text, "→     - status.conditions.NamespaceDeletionDiscoveryFailure: status=True, reason=DiscoveryFailed, message=waiting for discovery"
  end

  def test_wave_3_runs_selected_kubectl_fetches_in_parallel
    resource_nodes = [
      wave_3_resource_node(kind: "Namespace", name: "production"),
      wave_3_resource_node(kind: "Namespace", name: "staging"),
    ]
    production_command = ["kubectl", "get", "Namespace", "production", "-o", "yaml", "--ignore-not-found"]
    staging_command = ["kubectl", "get", "Namespace", "staging", "-o", "yaml", "--ignore-not-found"]
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
    kubectl_command = ["kubectl", "get", "Namespace", "production", "-o", "yaml", "--ignore-not-found"]
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

  def test_wave_3_ignores_plain_missing_resources_without_more_signal
    jobs = ArgoTrace.wave_3_application_resource_detail_jobs(
      [
        ArgoTrace::TreeNode.new(
          kind: "Application",
          name: "kargo",
          namespace: "argocd",
          children: [],
          metadata: {
            raw: {
              "status" => {
                "resources" => [
                  {
                    "kind" => "ClusterRole",
                    "name" => "boring-missing-cluster-role",
                    "status" => "OutOfSync",
                    "health" => {"status" => "Missing"},
                  },
                  {
                    "kind" => "RoleBinding",
                    "name" => "also-boring-missing-role-binding",
                    "status" => "OutOfSync",
                    "health" => {"status" => "Missing"},
                  },
                  {
                    "kind" => "Certificate",
                    "name" => "useful-lead",
                    "namespace" => "default",
                    "status" => "Synced",
                    "health" => {"status" => "Progressing", "message" => "waiting for issuer"},
                  },
                ],
              },
            },
          }
        ),
      ]
    )

    assert_equal 1, jobs.length
    assert_equal "useful-lead", jobs.first.fetch(:app_resource).fetch("name")
  end

  def test_wave_3_limits_application_resource_fetches_to_top_four_ranked_leads
    jobs = ArgoTrace.wave_3_application_resource_detail_jobs(
      [
        ArgoTrace::TreeNode.new(
          kind: "Application",
          name: "infra",
          namespace: "argocd",
          children: [],
          metadata: {
            raw: {
              "status" => {
                "resources" => [
                  {"kind" => "Certificate", "name" => "first-lead", "status" => "Synced", "health" => {"status" => "Progressing", "message" => "waiting for issuer"}},
                  {"kind" => "Namespace", "name" => "production", "status" => "Synced", "health" => {"status" => "Progressing", "message" => "pending deletion"}},
                  {"kind" => "Deployment", "name" => "second-lead", "namespace" => "argocd", "status" => "OutOfSync", "health" => {"status" => "Progressing", "message" => "waiting for rollout"}},
                  {"kind" => "Ingress", "name" => "argocd-server", "namespace" => "argocd", "status" => "OutOfSync", "health" => {"status" => "Progressing", "message" => "waiting for load balancer cleanup"}},
                  {"kind" => "StatefulSet", "name" => "third-lead", "namespace" => "argocd", "status" => "OutOfSync", "health" => {"status" => "Progressing"}},
                  {"kind" => "ConfigMap", "name" => "too-boring", "status" => "OutOfSync", "health" => {"status" => "Missing"}},
                  {"kind" => "ServiceAccount", "name" => "also-too-boring", "status" => "OutOfSync", "health" => {"status" => "Missing"}},
                ],
              },
            },
          }
        ),
      ]
    )

    assert_equal 4, jobs.length
    assert_equal(
      ["second-lead", "argocd-server", "first-lead", "production"],
      jobs.map {|job| job.fetch(:app_resource).fetch("name")}
    )
  end

  def test_selected_wave_3_application_nodes_skips_boring_missing_apps
    aws_resources = ArgoTrace::TreeNode.new(
      kind: "Application",
      name: "aws-resources",
      namespace: "argocd",
      children: [],
      metadata: {
        raw: {
          "status" => {
            "sync" => {"status" => "Synced"},
            "health" => {"status" => "Progressing"},
            "resources" => [
              {"kind" => "XClusterDNSCertificate", "name" => "dns-cert", "status" => "Synced"},
            ],
          },
        },
      }
    )
    kargo = ArgoTrace::TreeNode.new(
      kind: "Application",
      name: "kargo",
      namespace: "argocd",
      children: [],
      metadata: {
        raw: {
          "status" => {
            "sync" => {"status" => "OutOfSync"},
            "health" => {"status" => "Missing"},
            "resources" => [
              {"kind" => "ClusterRole", "name" => "boring-missing", "status" => "OutOfSync", "health" => {"status" => "Missing"}},
            ],
          },
        },
      }
    )

    selected_nodes = ArgoTrace.selected_wave_3_application_nodes([aws_resources, kargo])

    assert_equal ["aws-resources"], selected_nodes.map(&:name)
  end

  def test_wave_3_keeps_detail_bullets_suppressed_for_fully_all_ok_subtrees
    command_runner = Wave3FakeCommandRunner.new(outputs: fixture_argocd_outputs_only)

    body_text = ArgoTrace.snapshot_body(
      command_runner: command_runner,
      wrap_width: nil,
      kubectl_details: true
    )

    plain_body_text = ArgoTrace.strip_ansi_codes(body_text)

    assert_includes body_text, "          - networking (Application) [sync.status=Synced, health.status=Healthy]"
    refute_match(
      /          - networking \(Application\) \[sync\.status=Synced, health\.status=Healthy\]\n            - metadata\.creationTimestamp:/,
      plain_body_text
    )
    refute_includes body_text, "        - status.applicationStatus.message: Application resource became Healthy, updating status from Progressing to Healthy"
    refute_match(
      /          - kargo-project-codeai \(Application\) \[sync\.status=Synced, health\.status=Healthy\]\n            - metadata\.creationTimestamp:/,
      plain_body_text
    )
  end

  def test_wave_4_follows_crossplane_resource_refs_from_arrowed_live_resource_nodes
    xcert_command = ["kubectl", "get", "XClusterDNSCertificate", "codeai-k8s-cluster-dns-certificate", "-n", "crossplane-system", "-o", "yaml", "--ignore-not-found"]
    zone_command = ["kubectl", "get", "Zone", "codeai-k8s-cluster-dns-certificate-zone", "-n", "crossplane-system", "-o", "yaml", "--ignore-not-found"]
    command_runner = Wave3FakeCommandRunner.new(
      outputs: wave_4_crossplane_fixture_outputs.merge(
        xcert_command => <<~YAML,
          apiVersion: infra.code.org/v1alpha1
          kind: XClusterDNSCertificate
          metadata:
            name: codeai-k8s-cluster-dns-certificate
            namespace: crossplane-system
            deletionTimestamp: 2026-04-13T04:05:07Z
            finalizers:
              - foregroundDeletion
          spec:
            crossplane:
              resourceRefs:
                - apiVersion: route53.aws.m.upbound.io/v1beta1
                  kind: Zone
                  name: codeai-k8s-cluster-dns-certificate-zone
          status:
            conditions:
              - type: Ready
                status: "False"
                reason: Deleting
        YAML
        zone_command => <<~YAML
          apiVersion: route53.aws.m.upbound.io/v1beta1
          kind: Zone
          metadata:
            name: codeai-k8s-cluster-dns-certificate-zone
            namespace: crossplane-system
            deletionTimestamp: 2026-04-13T04:05:07Z
            finalizers:
              - finalizer.managedresource.crossplane.io
          status:
            conditions:
              - type: Ready
                status: "False"
                reason: Deleting
              - type: Synced
                status: "False"
                reason: ReconcileError
                message: HostedZoneNotEmpty
        YAML
      )
    )

    body_text = ArgoTrace.snapshot_body(
      command_runner: command_runner,
      wrap_width: nil,
      kubectl_details: true,
      ref_max_recursion_depth: 2
    )

    seen_commands = command_runner.seen_commands
    assert_includes seen_commands, xcert_command
    assert_includes seen_commands, zone_command
    assert_includes body_text, "    - codeai-k8s-cluster-dns-certificate (XClusterDNSCertificate) [sync.status=Synced, health.status=Progressing, status.conditions.Ready=False]"
    assert_includes body_text, "→     - codeai-k8s-cluster-dns-certificate-zone (Zone) [status.conditions.Ready=False, status.conditions.Synced=False]"
    assert_includes body_text, "→       - status.conditions.Synced: status=False, reason=ReconcileError, message=HostedZoneNotEmpty"
  end

  def test_wave_4_stops_recursing_after_child_exposes_blocker_message
    xcert_command = ["kubectl", "get", "XClusterDNSCertificate", "codeai-k8s-cluster-dns-certificate", "-n", "crossplane-system", "-o", "yaml", "--ignore-not-found"]
    zone_command = ["kubectl", "get", "Zone", "codeai-k8s-cluster-dns-certificate-zone", "-n", "crossplane-system", "-o", "yaml", "--ignore-not-found"]
    record_command = ["kubectl", "get", "Record", "codeai-k8s-cluster-dns-certificate-record", "-n", "crossplane-system", "-o", "yaml", "--ignore-not-found"]
    command_runner = Wave3FakeCommandRunner.new(
      outputs: wave_4_crossplane_fixture_outputs.merge(
        xcert_command => <<~YAML,
          apiVersion: infra.code.org/v1alpha1
          kind: XClusterDNSCertificate
          metadata:
            name: codeai-k8s-cluster-dns-certificate
            namespace: crossplane-system
            deletionTimestamp: 2026-04-13T04:05:07Z
          spec:
            crossplane:
              resourceRefs:
                - apiVersion: route53.aws.m.upbound.io/v1beta1
                  kind: Zone
                  name: codeai-k8s-cluster-dns-certificate-zone
          status:
            conditions:
              - type: Ready
                status: "False"
                reason: Deleting
        YAML
        zone_command => <<~YAML,
          apiVersion: route53.aws.m.upbound.io/v1beta1
          kind: Zone
          metadata:
            name: codeai-k8s-cluster-dns-certificate-zone
            namespace: crossplane-system
            deletionTimestamp: 2026-04-13T04:05:07Z
          spec:
            crossplane:
              resourceRefs:
                - apiVersion: route53.aws.m.upbound.io/v1beta1
                  kind: Record
                  name: codeai-k8s-cluster-dns-certificate-record
          status:
            conditions:
              - type: Synced
                status: "False"
                reason: ReconcileError
                message: HostedZoneNotEmpty
        YAML
        record_command => <<~YAML
          apiVersion: route53.aws.m.upbound.io/v1beta1
          kind: Record
          metadata:
            name: codeai-k8s-cluster-dns-certificate-record
            namespace: crossplane-system
          status:
            conditions:
              - type: Ready
                status: "False"
                reason: Deleting
                message: should not be fetched
        YAML
      )
    )

    body_text = ArgoTrace.snapshot_body(
      command_runner: command_runner,
      wrap_width: nil,
      kubectl_details: true,
      ref_max_recursion_depth: 2
    )

    seen_commands = command_runner.seen_commands
    assert_includes seen_commands, xcert_command
    assert_includes seen_commands, zone_command
    refute_includes seen_commands, record_command
    assert_includes body_text, "→       - status.conditions.Synced: status=False, reason=ReconcileError, message=HostedZoneNotEmpty"
    refute_includes body_text, "codeai-k8s-cluster-dns-certificate-record"
  end

  def test_wave_4_does_not_start_when_wave_3_node_already_has_blocker_message
    xcert_command = ["kubectl", "get", "XClusterDNSCertificate", "codeai-k8s-cluster-dns-certificate", "-n", "crossplane-system", "-o", "yaml", "--ignore-not-found"]
    command_runner = Wave3FakeCommandRunner.new(
      outputs: wave_4_crossplane_fixture_outputs.merge(
        xcert_command => <<~YAML
          apiVersion: infra.code.org/v1alpha1
          kind: XClusterDNSCertificate
          metadata:
            name: codeai-k8s-cluster-dns-certificate
            namespace: crossplane-system
            deletionTimestamp: 2026-04-13T04:05:07Z
          status:
            conditions:
              - type: Synced
                status: "False"
                reason: ReconcileError
                message: HostedZoneNotEmpty
          spec:
            crossplane:
              resourceRefs:
                - apiVersion: route53.aws.m.upbound.io/v1beta1
                  kind: Zone
                  name: codeai-k8s-cluster-dns-certificate-zone
        YAML
      )
    )

    body_text = ArgoTrace.snapshot_body(
      command_runner: command_runner,
      wrap_width: nil,
      kubectl_details: true,
      ref_max_recursion_depth: 2
    )

    seen_commands = command_runner.seen_commands
    assert_includes seen_commands, xcert_command
    refute_includes seen_commands, ["kubectl", "get", "Zone", "codeai-k8s-cluster-dns-certificate-zone", "-n", "crossplane-system", "-o", "yaml", "--ignore-not-found"]
    assert_includes body_text, "→   - codeai-k8s-cluster-dns-certificate (XClusterDNSCertificate) [sync.status=Synced, health.status=Progressing, status.conditions.Synced=False]"
    assert_includes body_text, "→     - status.conditions.Synced: status=False, reason=ReconcileError, message=HostedZoneNotEmpty"
  end

  def test_wave_4_follows_owner_references_from_arrowed_live_resource_nodes
    config_map_command = ["kubectl", "get", "ConfigMap", "app-config", "-n", "default", "-o", "yaml", "--ignore-not-found"]
    owner_command = ["kubectl", "get", "Deployment", "app-owner", "-n", "default", "-o", "yaml", "--ignore-not-found"]
    command_runner = Wave3FakeCommandRunner.new(
      outputs: wave_4_owner_ref_fixture_outputs.merge(
        config_map_command => <<~YAML,
          apiVersion: v1
          kind: ConfigMap
          metadata:
            name: app-config
            namespace: default
            deletionTimestamp: 2026-04-13T04:05:07Z
            ownerReferences:
              - apiVersion: apps/v1
                kind: Deployment
                name: app-owner
        YAML
        owner_command => <<~YAML
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: app-owner
            namespace: default
            deletionTimestamp: 2026-04-13T04:05:07Z
          status:
            conditions:
              - type: Available
                status: "False"
                reason: Deleting
                message: deployment is deleting
        YAML
      )
    )

    body_text = ArgoTrace.snapshot_body(
      command_runner: command_runner,
      wrap_width: nil,
      kubectl_details: true,
      ref_max_recursion_depth: 1
    )

    seen_commands = command_runner.seen_commands
    assert_includes seen_commands, config_map_command
    assert_includes seen_commands, owner_command
    assert_includes body_text, "→     - app-owner (Deployment) [status.conditions.Available=False]"
    assert_includes body_text, "→       - status.conditions.Available: status=False, reason=Deleting, message=deployment is deleting"
  end

  def test_wave_4_respects_ref_max_recursion_depth_limit
    xcert_command = ["kubectl", "get", "XClusterDNSCertificate", "codeai-k8s-cluster-dns-certificate", "-n", "crossplane-system", "-o", "yaml", "--ignore-not-found"]
    zone_command = ["kubectl", "get", "Zone", "codeai-k8s-cluster-dns-certificate-zone", "-n", "crossplane-system", "-o", "yaml", "--ignore-not-found"]
    command_runner = Wave3FakeCommandRunner.new(
      outputs: wave_4_crossplane_fixture_outputs.merge(
        xcert_command => <<~YAML,
          apiVersion: infra.code.org/v1alpha1
          kind: XClusterDNSCertificate
          metadata:
            name: codeai-k8s-cluster-dns-certificate
            namespace: crossplane-system
            deletionTimestamp: 2026-04-13T04:05:07Z
          spec:
            crossplane:
              resourceRefs:
                - apiVersion: route53.aws.m.upbound.io/v1beta1
                  kind: Zone
                  name: codeai-k8s-cluster-dns-certificate-zone
          status:
            conditions:
              - type: Ready
                status: "False"
                reason: Deleting
        YAML
      )
    )

    ArgoTrace.snapshot_body(
      command_runner: command_runner,
      wrap_width: nil,
      kubectl_details: true,
      ref_max_recursion_depth: 0
    )

    refute_includes command_runner.seen_commands, zone_command
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

  private def wave_4_crossplane_fixture_outputs
    {
      ArgoTrace::WAVE1_APPSET_LIST_COMMAND => [].to_yaml,
      ArgoTrace::WAVE1_APP_LIST_COMMAND => [
        {
          "metadata" => {
            "name" => "aws-resources",
            "namespace" => "argocd",
          },
          "status" => {
            "sync" => {"status" => "Synced"},
            "health" => {"status" => "Progressing"},
            "operationState" => {"phase" => "Succeeded"},
          },
        }
      ].to_yaml,
      ArgoTrace.app_get_command("aws-resources") => {
        "metadata" => {
          "name" => "aws-resources",
          "namespace" => "argocd",
        },
        "status" => {
          "sync" => {"status" => "Synced"},
          "health" => {"status" => "Progressing"},
          "operationState" => {"phase" => "Succeeded"},
          "resources" => [
            {
              "group" => "infra.code.org",
              "kind" => "XClusterDNSCertificate",
              "name" => "codeai-k8s-cluster-dns-certificate",
              "namespace" => "crossplane-system",
              "status" => "Synced",
              "health" => {
                "status" => "Progressing",
                "message" => "Waiting for referenced zone",
              },
              "syncWave" => 1,
            }
          ],
        },
      }.to_yaml,
    }
  end

  private def wave_4_owner_ref_fixture_outputs
    {
      ArgoTrace::WAVE1_APPSET_LIST_COMMAND => [].to_yaml,
      ArgoTrace::WAVE1_APP_LIST_COMMAND => [
        {
          "metadata" => {
            "name" => "sample-app",
            "namespace" => "argocd",
          },
          "status" => {
            "sync" => {"status" => "Synced"},
            "health" => {"status" => "Progressing"},
            "operationState" => {"phase" => "Succeeded"},
          },
        }
      ].to_yaml,
      ArgoTrace.app_get_command("sample-app") => {
        "metadata" => {
          "name" => "sample-app",
          "namespace" => "argocd",
        },
        "status" => {
          "sync" => {"status" => "Synced"},
          "health" => {"status" => "Progressing"},
          "operationState" => {"phase" => "Succeeded"},
          "resources" => [
            {
              "kind" => "ConfigMap",
              "name" => "app-config",
              "namespace" => "default",
              "status" => "Synced",
              "health" => {
                "status" => "Progressing",
                "message" => "Pending deletion",
              },
              "syncWave" => 1,
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
