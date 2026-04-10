#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "minitest/autorun"
require "pathname"

load File.expand_path("../bin/argo-trace", __dir__)

class FakeShell
  attr_reader :caveats, :commands

  def initialize(text_map: {}, json_map: {})
    @text_map = text_map
    @json_map = json_map
    @caveats = []
    @commands = []
  end

  def text!(*command, check: true)
    @commands << command
    key = command.join("\u0000")
    return @text_map.fetch(key) if @text_map.key?(key)
    return JSON.generate(@json_map.fetch(key)) if @json_map.key?(key)
    return "" unless check

    raise "unexpected command: #{command.join(' ')}"
  end

  def json!(*command)
    @commands << command
    key = command.join("\u0000")
    return @json_map.fetch(key) if @json_map.key?(key)

    JSON.parse(text!(*command))
  end

  def record_caveat(message)
    @caveats << message
  end
end

class FakeDiscovery
  attr_reader :refreshes

  def initialize(resources)
    @resources_by_gk = resources.each_with_object({}) do |resource, index|
      index[[resource.group, resource.kind]] = resource
    end
    @refreshes = 0
  end

  def find(group, kind)
    @resources_by_gk[[group.to_s, kind]]
  end

  def each(&block)
    @resources_by_gk.values.each(&block)
  end

  def refresh!
    @refreshes += 1
  end
end

class RefreshingDiscovery < FakeDiscovery
  def initialize(initial_resources:, refreshed_resources:)
    super(initial_resources)
    @refreshed_resources = refreshed_resources.each_with_object({}) do |resource, index|
      index[[resource.group, resource.kind]] = resource
    end
  end

  def refresh!
    super
    @refreshed_resources.each do |key, value|
      @resources_by_gk[key] = value
    end
  end
end

class ArgocdProgressTraceTest < Minitest::Test
  FIXTURE_DIR = Pathname.new(__dir__) / "fixtures" / "argocd_progress_trace"

  def test_parse_duration_accepts_common_units
    assert_equal 0, parse_duration("0s")
    assert_equal 30, parse_duration("30s")
    assert_equal 60, parse_duration("1m")
    assert_equal 3600, parse_duration("1hr")
    assert_equal 5400, parse_duration("1h 30m")
  end

  def test_kubectl_timeout_seconds_uses_30s_default_and_caps_to_poll_interval
    assert_equal 30, kubectl_timeout_seconds(nil)
    assert_equal 30, kubectl_timeout_seconds(0)
    assert_equal 30, kubectl_timeout_seconds(60)
    assert_equal 15, kubectl_timeout_seconds(15)
  end

  def test_normalize_options_does_not_enable_output_by_default
    options = normalize_options(
      argocd_namespace: "argocd",
      root_name: "my-app",
    )

    assert_nil options[:output]
  end

  def test_infer_root_refs_returns_single_top_level_root
    objects = [
      {"apiVersion" => "argoproj.io/v1alpha1", "kind" => "Application", "metadata" => {"name" => "app-of-apps", "namespace" => "argocd", "uid" => "app-root"}, "status" => {"sync" => {"status" => "OutOfSync"}, "health" => {"status" => "Progressing"}, "resources" => [{"group" => "argoproj.io", "version" => "v1alpha1", "kind" => "ApplicationSet", "namespace" => "argocd", "name" => "app-of-apps"}]}},
      {"apiVersion" => "argoproj.io/v1alpha1", "kind" => "ApplicationSet", "metadata" => {"name" => "app-of-apps", "namespace" => "argocd", "uid" => "appset-root"}, "status" => {"resources" => [{"kind" => "Application", "namespace" => "argocd", "name" => "infra"}]}},
      {"apiVersion" => "argoproj.io/v1alpha1", "kind" => "Application", "metadata" => {"name" => "infra", "namespace" => "argocd", "uid" => "app-infra", "ownerReferences" => [{"apiVersion" => "argoproj.io/v1alpha1", "kind" => "ApplicationSet", "name" => "app-of-apps", "uid" => "appset-root"}]}, "status" => {"sync" => {"status" => "OutOfSync"}, "health" => {"status" => "Progressing"}}}
    ]

    refs = infer_root_refs_from_snapshot(
      snapshot: snapshot_from_objects(objects),
    )

    assert_equal([["Application", "argocd", "app-of-apps"]], refs.map {|ref| [ref.kind, ref.namespace, ref.name]})
  end

  def test_infer_root_refs_returns_multiple_top_level_roots
    objects = [
      {"apiVersion" => "argoproj.io/v1alpha1", "kind" => "Application", "metadata" => {"name" => "alpha", "namespace" => "argocd", "uid" => "app-alpha"}, "status" => {"sync" => {"status" => "OutOfSync"}, "health" => {"status" => "Progressing"}}},
      {"apiVersion" => "argoproj.io/v1alpha1", "kind" => "Application", "metadata" => {"name" => "beta", "namespace" => "argocd", "uid" => "app-beta"}, "status" => {"sync" => {"status" => "Unknown"}, "health" => {"status" => "Healthy"}, "operationState" => {"phase" => "Error"}}}
    ]

    refs = infer_root_refs_from_snapshot(
      snapshot: snapshot_from_objects(objects),
    )

    assert_equal([
                   ["Application", "argocd", "alpha"],
                   ["Application", "argocd", "beta"]
                 ], refs.map {|ref| [ref.kind, ref.namespace, ref.name]}
)
  end

  def test_application_children_include_annotation_tracked_resources
    snapshot = snapshot_for_fixture(
      "annotation_tracking_objects.json",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )

    application = snapshot.k8s_object_for(Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app"))
    children = snapshot.application_children(application)

    assert_equal(["deployment/web"], children.map {|child| child.ref.display})
  end

  def test_application_children_include_label_tracked_resources
    snapshot = snapshot_for_fixture(
      "label_tracking_objects.json",
      tracking_config: TrackingConfig.new(tracking_method: "label", instance_label_key: "custom.instance", installation_id: nil),
    )

    application = snapshot.k8s_object_for(Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-label-app"))
    children = snapshot.application_children(application)

    assert_equal(["job/sync-job"], children.map {|child| child.ref.display})
  end

  def test_applicationset_children_include_live_owner_reference_children
    snapshot = snapshot_for_fixture(
      "applicationset_owner_refs.json",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )

    appset = snapshot.k8s_object_for(Ref.new(group: "argoproj.io", kind: "ApplicationSet", namespace: "argocd", name: "app-of-apps"))
    children = snapshot.applicationset_children(appset)

    assert_equal ["infra"], (children.map {|child| child.ref.name})
  end

  def test_trace_keeps_applicationset_branch_when_argo_still_reports_missing_child_application
    root_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "root-app"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Healthy"},
        "resources" => [
          {"group" => "argoproj.io", "version" => "v1alpha1", "kind" => "ApplicationSet", "namespace" => "argocd", "name" => "nested"}
        ]
      }
    }
    nested_appset = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "ApplicationSet",
      "metadata" => {"name" => "nested", "namespace" => "argocd", "uid" => "nested-appset"},
      "status" => {
        "resources" => [
          {
            "kind" => "Application",
            "namespace" => "argocd",
            "name" => "noisy",
            "status" => "OutOfSync",
            "health" => {"status" => "Missing"}
          }
        ]
      }
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([root_application, nested_appset]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root"),
    ).build

    labels = flatten_labels(trace.fetch(:tree))
    noisy = find_node(trace.fetch(:tree), "noisy")

    assert_includes labels, "applicationset/nested"
    assert_includes labels, "noisy"
    assert_equal "waiting", noisy.state
    assert_includes noisy.detail, "via=appset-status(observed)"
    assert_includes noisy.detail, "live-object=missing"
  end

  def test_trace_reaches_tracked_applicationset_when_root_application_status_is_shallow
    root_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "root-app-shallow"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Healthy"}
      }
    }
    nested_appset = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "ApplicationSet",
      "metadata" => {
        "name" => "nested",
        "namespace" => "argocd",
        "uid" => "nested-appset-shallow",
        "annotations" => {
          "argocd.argoproj.io/tracking-id" => "root:argoproj.io/ApplicationSet:argocd/nested"
        }
      },
      "status" => {
        "resources" => [
          {
            "kind" => "Application",
            "namespace" => "argocd",
            "name" => "noisy",
            "status" => "OutOfSync",
            "health" => {"status" => "Progressing"}
          }
        ]
      }
    }
    noisy_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {
        "name" => "noisy",
        "namespace" => "argocd",
        "uid" => "noisy-app-shallow",
        "ownerReferences" => [{"apiVersion" => "argoproj.io/v1alpha1", "kind" => "ApplicationSet", "name" => "nested", "uid" => "nested-appset-shallow"}]
      },
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
        "operationState" => {"phase" => "Running"}
      }
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([root_application, nested_appset, noisy_application]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root"),
    ).build

    labels = flatten_labels(trace.fetch(:tree))

    assert_includes labels, "applicationset/nested"
    assert_includes labels, "noisy"
  end

  def test_trace_reaches_live_tracked_child_when_application_status_has_no_resources
    root_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "root-app-fallback"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Healthy"},
        "operationState" => {"phase" => "Succeeded"}
      }
    }
    deployment = {
      "apiVersion" => "apps/v1",
      "kind" => "Deployment",
      "metadata" => {
        "name" => "web",
        "namespace" => "default",
        "uid" => "deploy-fallback",
        "deletionTimestamp" => "2026-04-09T21:14:16Z",
        "annotations" => {
          "argocd.argoproj.io/tracking-id" => "root:apps/Deployment:default/web"
        }
      }
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([root_application, deployment]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root"),
    ).build

    deployment_node = find_node(trace.fetch(:tree), "deployment/web")

    refute_nil deployment_node
    assert_equal "deleting", deployment_node.state
    assert_includes deployment_node.detail, "via=argo-tracking(inferred)"
  end

  def test_annotation_tracking_scans_argo_tree_before_full_cluster_scan
    root_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "root-app-tree-scan"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Healthy"},
        "operationState" => {"phase" => "Succeeded"}
      }
    }
    nested_appset = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "ApplicationSet",
      "metadata" => {
        "name" => "nested",
        "namespace" => "argocd",
        "uid" => "nested-appset-tree-scan",
        "annotations" => {
          "argocd.argoproj.io/tracking-id" => "root:argoproj.io/ApplicationSet:argocd/nested"
        }
      }
    }

    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "applications.argoproj.io,applicationsets.argoproj.io", "-A", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate({"items" => [nested_appset]}),
      },
    )
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(resource_defs_for([root_application, nested_appset])),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [root_application])

    application_object = snapshot.k8s_object_for(Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root"))
    children = snapshot.application_children(application_object)

    assert_equal ["nested"], (children.map {|child| child.ref.name})
    assert_includes shell.commands, ["kubectl", "get", "applications.argoproj.io,applicationsets.argoproj.io", "-A", "-o", "json", "--ignore-not-found"]
    refute(
      shell.commands.any? do |command|
        command[2].to_s.include?("deployments") || command[2].to_s.include?("jobs") || command[2].to_s.include?("pods")
      end,
    )
  end

  def test_synced_application_keeps_argo_tree_child_with_deeper_busy_branch
    root_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "root-app-deep"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Healthy"},
        "operationState" => {"phase" => "Succeeded"},
        "resources" => [
          {
            "group" => "argoproj.io",
            "version" => "v1alpha1",
            "kind" => "ApplicationSet",
            "namespace" => "argocd",
            "name" => "nested",
            "status" => "Synced",
            "health" => {"status" => "Healthy"}
          }
        ]
      }
    }
    nested_appset = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "ApplicationSet",
      "metadata" => {
        "name" => "nested",
        "namespace" => "argocd",
        "uid" => "nested-appset-deep",
        "annotations" => {
          "argocd.argoproj.io/tracking-id" => "root:argoproj.io/ApplicationSet:argocd/nested"
        }
      },
      "status" => {
        "resources" => [
          {
            "kind" => "Application",
            "namespace" => "argocd",
            "name" => "busy-child",
            "status" => "OutOfSync",
            "health" => {"status" => "Progressing"}
          }
        ]
      }
    }
    busy_child = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {
        "name" => "busy-child",
        "namespace" => "argocd",
        "uid" => "busy-child-app",
        "ownerReferences" => [{"apiVersion" => "argoproj.io/v1alpha1", "kind" => "ApplicationSet", "name" => "nested", "uid" => "nested-appset-deep"}]
      },
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
        "operationState" => {"phase" => "Running"}
      }
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([root_application, nested_appset, busy_child]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root"),
    ).build

    labels = flatten_labels(trace.fetch(:tree))

    assert_includes labels, "applicationset/nested"
    assert_includes labels, "busy-child"
  end

  def test_live_child_replaces_missing_placeholder_when_object_exists
    root_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "root-app-live-child"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Healthy"},
        "resources" => [
          {"group" => "argoproj.io", "version" => "v1alpha1", "kind" => "ApplicationSet", "namespace" => "argocd", "name" => "nested"}
        ]
      }
    }
    nested_appset = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "ApplicationSet",
      "metadata" => {"name" => "nested", "namespace" => "argocd", "uid" => "nested-appset-live-child"},
      "status" => {
        "resources" => [
          {
            "kind" => "Application",
            "namespace" => "argocd",
            "name" => "noisy",
            "status" => "OutOfSync",
            "health" => {"status" => "Progressing"}
          }
        ]
      }
    }
    noisy_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {
        "name" => "noisy",
        "namespace" => "argocd",
        "uid" => "noisy-app-live-child",
        "ownerReferences" => [{"apiVersion" => "argoproj.io/v1alpha1", "kind" => "ApplicationSet", "name" => "nested", "uid" => "nested-appset-live-child"}]
      },
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
        "operationState" => {"phase" => "Running"}
      }
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([root_application, nested_appset, noisy_application]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root"),
    ).build

    noisy_node = find_node(trace.fetch(:tree), "noisy")

    refute_nil noisy_node
    refute_includes noisy_node.detail.to_s, "live-object=missing"
    assert_equal "progressing", noisy_node.state
  end

  def test_application_children_prefer_observed_edge_over_duplicate_tracking_edge
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "my-app", "namespace" => "argocd", "uid" => "app-uid-dedup"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "apps", "version" => "v1", "kind" => "Deployment", "namespace" => "default", "name" => "web", "status" => "OutOfSync", "health" => {"status" => "Progressing"}}
        ]
      }
    }
    deployment = {
      "apiVersion" => "apps/v1",
      "kind" => "Deployment",
      "metadata" => {
        "name" => "web",
        "namespace" => "default",
        "uid" => "deploy-uid-dedup",
        "annotations" => {
          "argocd.argoproj.io/tracking-id" => "my-app:apps/Deployment:default/web"
        }
      },
      "status" => {"observedGeneration" => 1},
      "spec" => {"replicas" => 1}
    }

    snapshot = snapshot_from_objects([application, deployment])
    application_object = snapshot.k8s_object_for(Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app"))
    children = snapshot.application_children(application_object)
    trace = TraceBuilder.new(
      snapshot: snapshot,
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app"),
    ).build
    deployment_node = find_node(trace.fetch(:tree), "deployment/web")

    assert_equal 1, children.length
    assert_equal "argo-status", children.first.source
    assert_includes deployment_node.detail, "via=argo-status(observed)"
    refute_includes deployment_node.detail, "via=argo-tracking(inferred)"
  end

  def test_trace_merges_argo_status_and_live_tracked_children_without_duplication
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "my-app", "namespace" => "argocd", "uid" => "app-uid-merge"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "apps", "version" => "v1", "kind" => "Deployment", "namespace" => "default", "name" => "web", "status" => "OutOfSync", "health" => {"status" => "Progressing"}}
        ]
      }
    }
    deployment = {
      "apiVersion" => "apps/v1",
      "kind" => "Deployment",
      "metadata" => {"name" => "web", "namespace" => "default", "uid" => "deploy-uid-merge"},
      "status" => {"observedGeneration" => 1},
      "spec" => {"replicas" => 1}
    }
    job = {
      "apiVersion" => "batch/v1",
      "kind" => "Job",
      "metadata" => {
        "name" => "sync-job",
        "namespace" => "default",
        "uid" => "job-uid-merge",
        "deletionTimestamp" => "2026-04-09T21:14:16Z",
        "annotations" => {
          "argocd.argoproj.io/tracking-id" => "my-app:batch/Job:default/sync-job"
        }
      }
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([application, deployment, job]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app"),
    ).build
    labels = flatten_labels(trace.fetch(:tree))

    assert_equal 1, labels.count("deployment/web")
    assert_includes labels, "deployment/web"
    assert_includes labels, "job/sync-job"
  end

  def test_live_object_state_beats_stale_argo_edge_status
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "my-app", "namespace" => "argocd", "uid" => "app-uid-stale"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Healthy"},
        "resources" => [
          {"group" => "apps", "version" => "v1", "kind" => "Deployment", "namespace" => "default", "name" => "web", "status" => "Synced", "health" => {"status" => "Healthy"}}
        ]
      }
    }
    deployment = {
      "apiVersion" => "apps/v1",
      "kind" => "Deployment",
      "metadata" => {
        "name" => "web",
        "namespace" => "default",
        "uid" => "deploy-uid-stale",
        "deletionTimestamp" => "2026-04-09T21:14:16Z"
      }
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([application, deployment]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app"),
    ).build
    deployment_node = find_node(trace.fetch(:tree), "deployment/web")

    assert_equal "deleting", deployment_node.state
    assert_includes deployment_node.detail, "via=argo-status(observed)"
  end

  def test_deepest_blocker_paths_are_deduplicated_when_leaf_labels_repeat
    trace = TreeNode.new(
      label: "root",
      state: "progressing",
      detail: nil,
      evidence: [],
      path: ["root"],
      children: [
        TreeNode.new(
          label: "pod/foo",
          state: "waiting",
          detail: nil,
          evidence: [],
          path: ["pod/foo"],
          children: [
            TreeNode.new(label: "event/Failed", state: "blocked", detail: nil, evidence: [], path: ["event/Failed"], children: []),
            TreeNode.new(label: "event/Failed", state: "blocked", detail: nil, evidence: [], path: ["event/Failed"], children: [])
          ],
        )
      ],
    )

    builder = TraceBuilder.new(snapshot: snapshot_from_objects([]), root_ref: Ref.new(group: "", kind: "ConfigMap", namespace: "default", name: "unused"))
    paths = builder.send(:deepest_blocker_paths, trace)

    assert_equal [["root", "pod/foo", "event/Failed"]], paths
  end

  def test_render_trace_entry_without_header_is_plain_snapshot
    payload = {
      traces: [
        {
          tree: TreeNode.new(
            label: "my-app",
            state: "blocked",
            detail: nil,
            children: [],
            evidence: ["`my-app`: `something failed`"],
            path: ["my-app"],
          ),
          deepest_paths: [["my-app"]],
          evidence: ["`my-app`: `something failed`"],
        },
      ],
      caveats: [],
    }

    entry = render_trace_entry(payload: payload, include_header: false)

    refute_includes entry, "## +"
    refute_includes entry, "Status:"
    assert_includes entry, "Dependency tree:"
    assert_includes entry, "- my-app [blocked]"
    refute_includes entry, "Caveats:"
  end

  def test_render_trace_entry_includes_caveats_only_when_present
    payload = {
      traces: [
        {
          tree: TreeNode.new(
            label: "my-app",
            state: "blocked",
            detail: nil,
            children: [],
            evidence: ["`my-app`: `something failed`"],
            path: ["my-app"],
          ),
          deepest_paths: [["my-app"]],
          evidence: ["`my-app`: `something failed`"],
        },
      ],
      caveats: ["kubectl get pods failed: timeout"],
    }

    entry = render_trace_entry(payload: payload, include_header: false)

    assert_includes entry, "Caveats:"
    assert_includes entry, "- kubectl get pods failed: timeout"
  end

  def test_idle_trace_for_root_reports_deleting_root_state
    snapshot = snapshot_from_objects(
      [
        {
          "apiVersion" => "argoproj.io/v1alpha1",
          "kind" => "Application",
          "metadata" => {
            "name" => "app-of-apps",
            "namespace" => "argocd",
            "uid" => "app-root",
            "deletionTimestamp" => "2026-04-09T21:14:16Z",
          },
          "status" => {
            "sync" => {"status" => "Synced"},
            "health" => {"status" => "Progressing"},
            "operationState" => {"phase" => "Succeeded", "message" => "successfully synced (all tasks run)"},
          },
        },
      ],
    )

    trace = idle_trace_for_root(
      snapshot: snapshot,
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "app-of-apps"),
    )

    assert_equal "deleting", trace.fetch(:tree).state
    assert_includes trace.fetch(:evidence).first, "deletion timestamp"
  end

  def test_trace_descends_through_crossplane_resource_refs_and_blocking_condition_leaf
    snapshot = snapshot_for_fixture(
      "crossplane_block_objects.json",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )

    trace = TraceBuilder.new(
      snapshot: snapshot,
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "aws-resources"),
    ).build

    deepest = trace.fetch(:deepest_paths).first.join(" -> ")
    labels = flatten_labels(trace.fetch(:tree))

    assert_includes deepest, "xclusterdnscertificate/codeai-k8s-cluster-dns-certificate"
    assert_includes deepest, "zone/codeai-k8s-cluster-dns-certificate-39af57c73370"
    assert_includes deepest, "condition/Synced"
    assert_includes labels, "condition/Synced"
  end

  def test_application_prefetches_children_before_rendering_owner_subtree
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "my-app", "namespace" => "argocd", "uid" => "app-uid-prefetch"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "apps", "version" => "v1", "kind" => "Deployment", "namespace" => "default", "name" => "web"},
          {"group" => "apps", "version" => "v1", "kind" => "ReplicaSet", "namespace" => "default", "name" => "web-rs"},
          {"group" => "", "version" => "v1", "kind" => "Pod", "namespace" => "default", "name" => "web-pod"}
        ]
      }
    }
    deployment = {
      "apiVersion" => "apps/v1",
      "kind" => "Deployment",
      "metadata" => {"name" => "web", "namespace" => "default", "uid" => "deploy-uid"},
      "status" => {"conditions" => [{"type" => "Progressing", "status" => "True", "reason" => "ReplicaSetUpdated"}]}
    }
    replicaset = {
      "apiVersion" => "apps/v1",
      "kind" => "ReplicaSet",
      "metadata" => {
        "name" => "web-rs",
        "namespace" => "default",
        "uid" => "rs-uid",
        "ownerReferences" => [{"apiVersion" => "apps/v1", "kind" => "Deployment", "name" => "web", "uid" => "deploy-uid", "controller" => true}]
      },
      "status" => {"conditions" => [{"type" => "ReplicaFailure", "status" => "True", "reason" => "FailedCreate"}]}
    }
    pod = {
      "apiVersion" => "v1",
      "kind" => "Pod",
      "metadata" => {
        "name" => "web-pod",
        "namespace" => "default",
        "uid" => "pod-uid",
        "ownerReferences" => [{"apiVersion" => "apps/v1", "kind" => "ReplicaSet", "name" => "web-rs", "uid" => "rs-uid", "controller" => true}]
      },
      "status" => {"phase" => "Pending", "conditions" => [{"type" => "PodScheduled", "status" => "False", "reason" => "Unschedulable"}]}
    }

    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "deployments.apps", "web", "-n", "default", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate(deployment),
        ["kubectl", "get", "replicasets.apps", "web-rs", "-n", "default", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate(replicaset),
        ["kubectl", "get", "pods", "web-pod", "-n", "default", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate(pod)
      },
    )
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(resource_defs_for([application, deployment, replicaset, pod])),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [application])

    trace = TraceBuilder.new(
      snapshot: snapshot,
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app"),
    ).build

    deepest = trace.fetch(:deepest_paths).first.join(" -> ")

    assert_includes deepest, "deployment/web"
    assert_includes deepest, "replicaset/web-rs"
    assert_includes deepest, "pod/web-pod"
  end

  def test_resource_children_are_loaded_lazily_from_namespace_scan
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "my-app", "namespace" => "argocd", "uid" => "app-uid-lazy"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "apps", "version" => "v1", "kind" => "Deployment", "namespace" => "default", "name" => "web"}
        ]
      }
    }
    deployment = {
      "apiVersion" => "apps/v1",
      "kind" => "Deployment",
      "metadata" => {"name" => "web", "namespace" => "default", "uid" => "deploy-uid-lazy"},
      "status" => {"conditions" => [{"type" => "Progressing", "status" => "True", "reason" => "ReplicaSetUpdated"}]}
    }
    replicaset = {
      "apiVersion" => "apps/v1",
      "kind" => "ReplicaSet",
      "metadata" => {
        "name" => "web-rs",
        "namespace" => "default",
        "uid" => "rs-uid-lazy",
        "ownerReferences" => [{"apiVersion" => "apps/v1", "kind" => "Deployment", "name" => "web", "uid" => "deploy-uid-lazy", "controller" => true}]
      },
      "status" => {"conditions" => [{"type" => "ReplicaFailure", "status" => "True", "reason" => "FailedCreate"}]}
    }
    pod = {
      "apiVersion" => "v1",
      "kind" => "Pod",
      "metadata" => {
        "name" => "web-pod",
        "namespace" => "default",
        "uid" => "pod-uid-lazy",
        "ownerReferences" => [{"apiVersion" => "apps/v1", "kind" => "ReplicaSet", "name" => "web-rs", "uid" => "rs-uid-lazy", "controller" => true}]
      },
      "status" => {
        "phase" => "Pending",
        "conditions" => [{"type" => "PodScheduled", "status" => "False", "reason" => "Unschedulable"}]
      }
    }

    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "replicasets.apps,pods", "-n", "default", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate(
          {"items" => [deployment, replicaset, pod]},
        )
      },
    )
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(resource_defs_for([application, deployment, replicaset, pod])),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [application, deployment])

    trace = TraceBuilder.new(
      snapshot: snapshot,
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app"),
    ).build

    deepest = trace.fetch(:deepest_paths).first.join(" -> ")

    assert_includes deepest, "deployment/web"
    assert_includes deepest, "replicaset/web-rs"
    assert_includes deepest, "pod/web-pod"
  end

  def test_snapshot_refreshes_discovery_for_unknown_gvk
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "aws-resources", "namespace" => "argocd", "uid" => "app-uid-5"},
      "status" => {
        "resources" => [
          {
            "group" => "infra.code.org",
            "version" => "v1alpha1",
            "kind" => "XClusterDNSCertificate",
            "namespace" => "crossplane-system",
            "name" => "codeai-k8s-cluster-dns-certificate"
          }
        ]
      }
    }
    xr = {
      "apiVersion" => "infra.code.org/v1alpha1",
      "kind" => "XClusterDNSCertificate",
      "metadata" => {"name" => "codeai-k8s-cluster-dns-certificate", "namespace" => "crossplane-system", "uid" => "xr-uid-2"}
    }

    initial_resources = resource_defs_for([application])
    refreshed_resources = resource_defs_for([xr])
    discovery = RefreshingDiscovery.new(initial_resources: initial_resources, refreshed_resources: refreshed_resources)
    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "xclusterdnscertificates.infra.code.org", "codeai-k8s-cluster-dns-certificate", "-n", "crossplane-system", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate(xr)
      },
    )
    snapshot = Snapshot.new(
      shell: shell,
      discovery: discovery,
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [application])

    app = snapshot.k8s_object_for(Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "aws-resources"))
    child_ref = snapshot.application_children(app).first.ref
    child = snapshot.k8s_object_for(child_ref)

    assert_equal "codeai-k8s-cluster-dns-certificate", child.name
    assert_equal 1, discovery.refreshes
  end

  def test_application_children_skip_tracking_scan_for_manifest_generation_errors
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "broken-app", "namespace" => "argocd", "uid" => "app-uid-broken"},
      "status" => {
        "sync" => {"status" => "Unknown"},
        "health" => {"status" => "Healthy"},
        "operationState" => {"phase" => "Error", "message" => "Failed to load target state"}
      }
    }

    snapshot = Snapshot.new(
      shell: FakeShell.new,
      discovery: FakeDiscovery.new(resource_defs_for([application])),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [application])

    app = snapshot.k8s_object_for(Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "broken-app"))

    assert_equal [], snapshot.application_children(app)
  end

  def test_application_children_scan_tracked_resources_for_failed_runtime_operations
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "runtime-failed", "namespace" => "argocd", "uid" => "app-uid-runtime-failed"},
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Degraded"},
        "operationState" => {"phase" => "Failed", "message" => "one or more objects failed to apply"}
      }
    }
    deployment = {
      "apiVersion" => "apps/v1",
      "kind" => "Deployment",
      "metadata" => {
        "name" => "web",
        "namespace" => "default",
        "uid" => "deploy-runtime-failed",
        "annotations" => {
          "argocd.argoproj.io/tracking-id" => "runtime-failed:apps/Deployment:default/web"
        }
      }
    }

    snapshot = snapshot_from_objects(
      [application, deployment],
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    application_object = snapshot.k8s_object_for(Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "runtime-failed"))

    assert_equal(["deployment/web"], snapshot.application_children(application_object).map {|child| child.ref.display})
  end

  def test_infer_root_refs_uses_live_tracked_application_children
    objects = [
      {
        "apiVersion" => "argoproj.io/v1alpha1",
        "kind" => "Application",
        "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "app-root-live"},
        "status" => {"sync" => {"status" => "OutOfSync"}, "health" => {"status" => "Progressing"}}
      },
      {
        "apiVersion" => "argoproj.io/v1alpha1",
        "kind" => "Application",
        "metadata" => {
          "name" => "infra",
          "namespace" => "argocd",
          "uid" => "app-child-live",
          "annotations" => {
            "argocd.argoproj.io/tracking-id" => "root:argoproj.io/Application:argocd/infra"
          }
        },
        "status" => {"sync" => {"status" => "OutOfSync"}, "health" => {"status" => "Progressing"}}
      }
    ]

    refs = infer_root_refs_from_snapshot(snapshot: snapshot_from_objects(objects))

    assert_equal([["Application", "argocd", "root"]], refs.map {|ref| [ref.kind, ref.namespace, ref.name]})
  end

  def test_finalizer_is_leaf_when_no_deeper_blocker_exists
    shell = FakeShell.new
    config_map = {
      "apiVersion" => "v1",
      "kind" => "ConfigMap",
      "metadata" => {
        "name" => "stuck",
        "namespace" => "default",
        "uid" => "configmap-uid-1",
        "deletionTimestamp" => "2026-04-08T03:00:00Z",
        "finalizers" => ["cleanup.example.com/finalizer"]
      }
    }
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(resource_defs_for([config_map])),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [config_map])

    trace = TraceBuilder.new(
      snapshot: snapshot,
      root_ref: Ref.new(group: "", kind: "ConfigMap", namespace: "default", name: "stuck"),
    ).build

    assert_includes flatten_labels(trace.fetch(:tree)), "finalizer/cleanup.example.com/finalizer"
  end

  def test_event_is_leaf_when_no_condition_or_finalizer_exists
    config_map = {
      "apiVersion" => "v1",
      "kind" => "ConfigMap",
      "metadata" => {
        "name" => "stuck",
        "namespace" => "default",
        "uid" => "configmap-uid-events"
      },
      "status" => {
        "conditions" => [{"type" => "Reconciling", "status" => "True", "reason" => "Steady"}]
      }
    }
    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "events", "-n", "default", "--field-selector", "involvedObject.uid=configmap-uid-events", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate(
          {
            "items" => [
              {
                "reason" => "FailedMount",
                "type" => "Warning",
                "message" => "volume is still attached elsewhere",
                "metadata" => {"creationTimestamp" => "2026-04-08T03:05:00Z"}
              }
            ]
          },
        )
      },
    )
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(resource_defs_for([config_map])),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [config_map])

    trace = TraceBuilder.new(
      snapshot: snapshot,
      root_ref: Ref.new(group: "", kind: "ConfigMap", namespace: "default", name: "stuck"),
    ).build

    assert_includes flatten_labels(trace.fetch(:tree)), "event/FailedMount"
    assert_includes trace.fetch(:evidence), "`configmap/stuck`: `volume is still attached elsewhere`"
  end

  def test_event_fetch_parse_failure_records_caveat
    config_map = {
      "apiVersion" => "v1",
      "kind" => "ConfigMap",
      "metadata" => {
        "name" => "stuck",
        "namespace" => "default",
        "uid" => "configmap-uid-events-bad"
      }
    }
    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "events", "-n", "default", "--field-selector", "involvedObject.uid=configmap-uid-events-bad", "-o", "json", "--ignore-not-found"].join("\u0000") => "{not-json"
      },
    )
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(resource_defs_for([config_map])),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [config_map])

    config_map_object = snapshot.k8s_object_for(Ref.new(group: "", kind: "ConfigMap", namespace: "default", name: "stuck"))
    assert_equal [], snapshot.events_for(config_map_object)
    assert_includes shell.caveats, "kubectl get events for configmap/stuck returned malformed JSON"
  end

  def test_event_fetch_scopes_namespaced_objects_to_their_namespace
    config_map = {
      "apiVersion" => "v1",
      "kind" => "ConfigMap",
      "metadata" => {
        "name" => "stuck",
        "namespace" => "default",
        "uid" => "configmap-uid-events-scope"
      }
    }
    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "events", "-n", "default", "--field-selector", "involvedObject.uid=configmap-uid-events-scope", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate({"items" => []})
      },
    )
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(resource_defs_for([config_map])),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [config_map])

    config_map_object = snapshot.k8s_object_for(Ref.new(group: "", kind: "ConfigMap", namespace: "default", name: "stuck"))

    assert_equal [], snapshot.events_for(config_map_object)
  end

  def test_event_fetch_uses_all_namespaces_for_cluster_scoped_objects
    cluster_role = {
      "apiVersion" => "rbac.authorization.k8s.io/v1",
      "kind" => "ClusterRole",
      "metadata" => {
        "name" => "stuck",
        "uid" => "clusterrole-uid-events-scope"
      }
    }
    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "events", "-A", "--field-selector", "involvedObject.uid=clusterrole-uid-events-scope", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate(
          {"items" => [{"reason" => "ApplyFailed", "type" => "Warning", "message" => "controller refused update", "metadata" => {"creationTimestamp" => "2026-04-08T03:05:00Z"}}]},
        )
      },
    )
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(resource_defs_for([cluster_role])),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [cluster_role])

    trace = TraceBuilder.new(
      snapshot: snapshot,
      root_ref: Ref.new(group: "rbac.authorization.k8s.io", kind: "ClusterRole", namespace: nil, name: "stuck"),
    ).build

    assert_includes flatten_labels(trace.fetch(:tree)), "event/ApplyFailed"
  end

  def test_cluster_scoped_owner_reference_child_is_traced
    cluster_role = {
      "apiVersion" => "rbac.authorization.k8s.io/v1",
      "kind" => "ClusterRole",
      "metadata" => {"name" => "parent", "uid" => "clusterrole-uid-parent"}
    }
    cluster_role_binding = {
      "apiVersion" => "rbac.authorization.k8s.io/v1",
      "kind" => "ClusterRoleBinding",
      "metadata" => {
        "name" => "child",
        "uid" => "clusterrolebinding-uid-child",
        "deletionTimestamp" => "2026-04-09T21:14:16Z",
        "ownerReferences" => [{"apiVersion" => "rbac.authorization.k8s.io/v1", "kind" => "ClusterRole", "name" => "parent", "uid" => "clusterrole-uid-parent", "controller" => true}]
      }
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([cluster_role, cluster_role_binding]),
      root_ref: Ref.new(group: "rbac.authorization.k8s.io", kind: "ClusterRole", namespace: nil, name: "parent"),
    ).build

    assert_includes flatten_labels(trace.fetch(:tree)), "clusterrolebinding/child"
  end

  def test_pod_detail_surfaces_container_wait_reason
    pod = {
      "apiVersion" => "v1",
      "kind" => "Pod",
      "metadata" => {
        "name" => "web",
        "namespace" => "default",
        "uid" => "pod-uid-detail"
      },
      "status" => {
        "phase" => "Pending",
        "containerStatuses" => [
          {
            "name" => "main",
            "state" => {
              "waiting" => {
                "reason" => "ImagePullBackOff",
                "message" => "back-off pulling image"
              }
            }
          }
        ]
      }
    }
    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "events", "-A", "--field-selector", "involvedObject.uid=pod-uid-detail", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate({"items" => []})
      },
    )
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(resource_defs_for([pod])),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [pod])

    trace = TraceBuilder.new(
      snapshot: snapshot,
      root_ref: Ref.new(group: "", kind: "Pod", namespace: "default", name: "web"),
    ).build

    tree = trace.fetch(:tree)
    assert_includes tree.detail, "phase=Pending"
    assert_includes tree.detail, "containers=main:ImagePullBackOff"
    assert_includes trace.fetch(:evidence), "`pod/web`: `container main waiting: back-off pulling image`"
  end

  def test_leaf_detail_surfaces_likely_managers
    config_map = {
      "apiVersion" => "v1",
      "kind" => "ConfigMap",
      "metadata" => {
        "name" => "stuck",
        "namespace" => "default",
        "uid" => "configmap-uid-manager",
        "deletionTimestamp" => "2026-04-08T03:00:00Z",
        "finalizers" => ["cleanup.example.com/finalizer"],
        "managedFields" => [
          {"manager" => "crossplane"},
          {"manager" => "provider-aws"},
          {"manager" => "crossplane"}
        ]
      }
    }
    snapshot = Snapshot.new(
      shell: FakeShell.new,
      discovery: FakeDiscovery.new(resource_defs_for([config_map])),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [config_map])

    trace = TraceBuilder.new(
      snapshot: snapshot,
      root_ref: Ref.new(group: "", kind: "ConfigMap", namespace: "default", name: "stuck"),
    ).build

    assert_includes trace.fetch(:tree).detail, "managers=crossplane,provider-aws"
  end

  def test_multiple_malformed_reads_record_multiple_caveats_without_hiding_blocker
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "my-app", "namespace" => "argocd", "uid" => "app-uid-caveats"},
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "batch", "version" => "v1", "kind" => "Job", "namespace" => "default", "name" => "web", "status" => "OutOfSync", "health" => {"status" => "Progressing"}}
        ]
      }
    }
    job = {
      "apiVersion" => "batch/v1",
      "kind" => "Job",
      "metadata" => {"name" => "web", "namespace" => "default", "uid" => "job-uid-caveats"},
      "status" => {"active" => 1}
    }
    pod_def = {"apiVersion" => "v1", "kind" => "Pod", "metadata" => {"name" => "unused-pod", "namespace" => "default", "uid" => "unused-pod"}}
    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "pods", "-n", "default", "-o", "json", "--ignore-not-found"].join("\u0000") => "{bad-json",
        ["kubectl", "get", "events", "-n", "default", "--field-selector", "involvedObject.uid=job-uid-caveats", "-o", "json", "--ignore-not-found"].join("\u0000") => "{still-bad-json"
      },
    )
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(resource_defs_for([application, job, pod_def])),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [application, job])

    trace = TraceBuilder.new(
      snapshot: snapshot,
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app"),
    ).build

    assert_includes flatten_labels(trace.fetch(:tree)), "job/web"
    assert_equal 3, shell.caveats.length
    assert_includes shell.caveats, "kubectl get pods returned malformed JSON; retrying per kind"
    assert_includes shell.caveats, "kubectl get pods returned malformed JSON"
    assert_includes shell.caveats, "kubectl get events for job/web returned malformed JSON"
  end

  def test_application_resource_detail_marks_argo_status_edge_as_observed
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "my-app", "namespace" => "argocd", "uid" => "app-uid-observed"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "apps", "version" => "v1", "kind" => "Deployment", "namespace" => "default", "name" => "web", "status" => "OutOfSync", "health" => {"status" => "Progressing"}}
        ]
      }
    }
    deployment = {
      "apiVersion" => "apps/v1",
      "kind" => "Deployment",
      "metadata" => {"name" => "web", "namespace" => "default", "uid" => "deploy-uid-observed"},
      "status" => {"observedGeneration" => 1},
      "spec" => {"replicas" => 1}
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([application, deployment]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app"),
    ).build

    deployment_node = find_node(trace.fetch(:tree), "deployment/web")

    assert_includes deployment_node.detail, "via=argo-status(observed)"
  end

  def test_application_resource_detail_marks_tracking_edge_as_inferred
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "my-app", "namespace" => "argocd", "uid" => "app-uid-inferred"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Progressing"}
      }
    }
    deployment = {
      "apiVersion" => "apps/v1",
      "kind" => "Deployment",
      "metadata" => {
        "name" => "web",
        "namespace" => "default",
        "uid" => "deploy-uid-inferred",
        "deletionTimestamp" => "2026-04-09T21:14:16Z",
        "annotations" => {
          "argocd.argoproj.io/tracking-id" => "my-app:apps/Deployment:default/web"
        }
      }
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([application, deployment]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app"),
    ).build

    deployment_node = find_node(trace.fetch(:tree), "deployment/web")

    assert_includes deployment_node.detail, "via=argo-tracking(inferred)"
  end

  def test_annotation_tracking_respects_installation_id
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "my-app", "namespace" => "argocd", "uid" => "app-uid-installation"},
      "status" => {"sync" => {"status" => "Synced"}, "health" => {"status" => "Healthy"}}
    }
    matching = {
      "apiVersion" => "apps/v1",
      "kind" => "Deployment",
      "metadata" => {
        "name" => "good",
        "namespace" => "default",
        "uid" => "deploy-good",
        "annotations" => {
          "argocd.argoproj.io/tracking-id" => "my-app:apps/Deployment:default/good",
          "argocd.argoproj.io/installation-id" => "expected"
        }
      }
    }
    mismatched = {
      "apiVersion" => "apps/v1",
      "kind" => "Deployment",
      "metadata" => {
        "name" => "bad",
        "namespace" => "default",
        "uid" => "deploy-bad",
        "annotations" => {
          "argocd.argoproj.io/tracking-id" => "my-app:apps/Deployment:default/bad",
          "argocd.argoproj.io/installation-id" => "wrong"
        }
      }
    }

    snapshot = snapshot_from_objects(
      [application, matching, mismatched],
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: "expected"),
    )
    application_object = snapshot.k8s_object_for(Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app"))

    assert_equal(["deployment/good"], snapshot.application_children(application_object).map {|child| child.ref.display})
  end

  private def snapshot_for_fixture(name, shell: FakeShell.new, tracking_config:)
    objects = JSON.parse((FIXTURE_DIR / name).read)
    snapshot_from_objects(objects, shell: shell, tracking_config: tracking_config)
  end

  private def snapshot_from_objects(objects, shell: FakeShell.new, tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil))
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(resource_defs_for(objects)),
      argocd_namespace: "argocd",
      tracking_config: tracking_config,
    )
    prime_snapshot(snapshot, objects)
    snapshot
  end

  private def prime_snapshot(snapshot, objects)
    snapshot.send(:prime_objects, objects)
    snapshot.send(:rebuild_index)
    snapshot
  end

  private def resource_defs_for(objects)
    defs = objects.map do |object|
      api_version = object.fetch("apiVersion")
      group, version = if api_version.include?("/")
                         api_version.split("/", 2)
                       else
                         ["", api_version]
                       end

      ApiResource.new(
        group: group,
        version: version,
        kind: object.fetch("kind"),
        resource: resource_name_for(object.fetch("kind")),
        namespaced: !object.dig("metadata", "namespace").nil?,
        categories: object.fetch("kind") == "XClusterDNSCertificate" ? ["composite"] : [],
      )
    end

    defs.uniq {|resource| [resource.group, resource.kind]}
  end

  private def resource_name_for(kind)
    case kind
    when "Application"
      "applications"
    when "ApplicationSet"
      "applicationsets"
    when "Deployment"
      "deployments"
    when "ReplicaSet"
      "replicasets"
    when "Job"
      "jobs"
    when "Pod"
      "pods"
    when "ConfigMap"
      "configmaps"
    when "Zone"
      "zones"
    when "XClusterDNSCertificate"
      "xclusterdnscertificates"
    else
      "#{kind.downcase}s"
    end
  end

  private def flatten_labels(node)
    [node.label, *node.children.flat_map {|child| flatten_labels(child)}]
  end

  private def find_node(node, label)
    return node if node.label == label

    node.children.each do |child|
      found = find_node(child, label)
      return found if found
    end

    nil
  end
end
