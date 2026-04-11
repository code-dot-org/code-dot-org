#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "minitest/autorun"
require "mocha/minitest"
require "pathname"

load File.expand_path("../bin/argo-trace", __dir__)

class FakeShell
  attr_reader :caveats, :commands

  def initialize(text_map: {}, json_map: {})
    @text_map = text_map
    @json_map = json_map
    @caveats = []
    @commands = []
    @mutex = Mutex.new
  end

  def text!(*command, check: true)
    @mutex.synchronize do
      @commands << command
    end
    key = command.join("\u0000")
    return @text_map.fetch(key) if @text_map.key?(key)
    return JSON.generate(@json_map.fetch(key)) if @json_map.key?(key)
    return "" unless check

    raise "unexpected command: #{command.join(' ')}"
  end

  def json!(*command)
    @mutex.synchronize do
      @commands << command
    end
    key = command.join("\u0000")
    return @json_map.fetch(key) if @json_map.key?(key)

    JSON.parse(text!(*command))
  end

  def record_caveat(message)
    @mutex.synchronize do
      @caveats << message
    end
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
  BIN_DIR = Pathname.new(__dir__).parent / "bin"

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

  def test_parse_cli_options_defaults_max_kubectl_jobs_to_8
    options = parse_cli_options([])

    assert_equal 8, options[:max_kubectl_jobs]
  end

  def test_parse_cli_options_accepts_max_kubectl_jobs
    options = parse_cli_options(["--max-kubectl-jobs", "3"])

    assert_equal 3, options[:max_kubectl_jobs]
  end

  def test_argo_trace_uses_bundle_exec_shebang
    assert_equal "#!/usr/bin/env -S bundle exec ruby\n", (BIN_DIR / "argo-trace").readlines.first
  end

  def test_watch_argo_trace_wraps_argo_trace_under_watch
    contents = (BIN_DIR / "watch-argo-trace").read

    assert_equal "#!/usr/bin/env -S bundle exec ruby\n", contents.lines.first
    assert_includes contents, 'Shellwords.join(["bundle", "exec", script, *ARGV])'
    assert_includes contents, 'exec("watch", "--color", "-d", command)'
  end

  def test_render_trace_entry_formats_poll_header_and_trailing_newlines
    payload = {
      traces: [
        {
          tree: TreeNode.new(
            label: "app-of-apps",
            state: "progressing",
            detail: nil,
            children: [],
            evidence: [],
            path: ["app-of-apps"],
          ),
        },
      ],
      caveats: [],
    }

    output = render_trace_entry(
      payload: payload,
      include_header: true,
      status_label: "changed",
      now: Time.parse("2026-04-11T05:33:31-10:00"),
      start_time: Time.parse("2026-04-11T05:32:00-10:00"),
    )

    assert_includes output, "# ArgoCD dependency tree @ 5:33a and 31s (+1m 31s), argo-trace took unknown\n"
    assert output.end_with?("\n\n\n")
  end

  def test_render_tree_formats_status_without_parens_and_message_without_backticks
    node = TreeNode.new(
      label: "deployment/kargo-api",
      state: "progressing",
      detail: "(argo-status=OutOfSync, live-object=missing, via=argo-status)",
      metadata: [
        ["metadata.creationTimestamp", "50s ago (2026-04-11T05:00:10Z)"],
        ["metadata.deletionTimestamp", "10s ago (2026-04-11T05:00:50Z)"],
      ],
      children: [],
      evidence: ["`deployment/kargo-api`: `live object not found, but Argo still reports this resource`"],
      path: ["deployment/kargo-api"],
    )

    lines = render_tree(node)

    assert_includes lines, "- deployment/kargo-api: in progress"
    assert_includes lines, "  - Details: argo-status=OutOfSync, live-object=missing, via=argo-status"
    assert_includes lines, "  - metadata.creationTimestamp: 50s ago (2026-04-11T05:00:10Z)"
    assert_includes lines, "\e[31m  - metadata.deletionTimestamp: 10s ago (2026-04-11T05:00:50Z)\e[39m"
    assert_includes lines, "  - Message: live object not found, but Argo still reports this resource"
  end

  def test_render_tree_omits_state_suffix_for_structural_group_nodes
    node = TreeNode.new(
      label: "RollingSync step 1 (all apps)",
      state: nil,
      detail: nil,
      children: [],
      evidence: [],
      path: ["RollingSync step 1 (all apps)"],
    )

    assert_equal ["- RollingSync step 1 (all apps)"], render_tree(node)
  end

  def test_render_tree_soft_wraps_under_bullet_text
    node = TreeNode.new(
      label: "deployment/example-with-a-very-long-name-that-needs-wrapping-because-the-line-is-too-wide",
      state: "progressing",
      detail: nil,
      children: [],
      evidence: [],
      path: ["deployment/example"],
    )

    lines = render_tree(node, wrap_width: 40)

    assert_operator lines.length, :>=, 2
    assert_equal "- ", lines.first[0, 2]
    assert(lines.drop(1).all? {|line| line.start_with?("  ")})
    assert_equal "  ", lines[1][0, 2]
    rebuilt = [lines.first] + lines.drop(1).map {|line| line.delete_prefix("  ")}
    assert_equal "- deployment/example-with-a-very-long-name-that-needs-wrapping-because-the-line-is-too-wide: in progress", rebuilt.join
  end

  def test_render_tree_soft_wraps_emphasized_lines_under_bullet_text
    node = TreeNode.new(
      label: "zone/codeai-k8s-cluster-dns-certificate-da64c8ef083a",
      state: "blocked",
      detail: nil,
      children: [],
      evidence: [],
      path: ["app-of-apps", "zone/codeai-k8s-cluster-dns-certificate-da64c8ef083a"],
    )

    lines = render_tree(
      node,
      wrap_width: 35,
      emphasized_paths: Set[["app-of-apps", "zone/codeai-k8s-cluster-dns-certificate-da64c8ef083a"]],
      current_path: ["app-of-apps"],
    )

    assert_operator lines.length, :>=, 2
    assert_includes lines.first, "\e[1m→- zone/codeai-k8s-cluster-dns-"
    assert(lines.all? {|line| line.start_with?("\e[1m") && line.end_with?("\e[22m")})
    visible_lines = lines.map {|line| line.gsub(/\e\[\d+m/, "")}
    assert(visible_lines.drop(1).all? {|line| line.start_with?("  ")})
    assert visible_lines.first.start_with?("→- zone/codeai-k8s-cluster-dns-")
    assert visible_lines.last.end_with?(": blocked")
  end

  def test_render_trace_entry_bolds_deepest_blocking_resource
    blocked_leaf = TreeNode.new(
      label: "zone/codeai-k8s-cluster-dns-certificate-da64c8ef083a",
      state: "blocked",
      detail: nil,
      children: [],
      evidence: [],
      path: [
        "app-of-apps",
        "infra",
        "aws-resources",
        "xclusterdnscertificate/codeai-k8s-cluster-dns-certificate",
        "zone/codeai-k8s-cluster-dns-certificate-da64c8ef083a",
      ],
    )
    payload = {
      traces: [
        {
          tree: TreeNode.new(
            label: "app-of-apps",
            state: "progressing",
            detail: nil,
            children: [
              TreeNode.new(
                label: "infra",
                state: "progressing",
                detail: nil,
                children: [
                  TreeNode.new(
                    label: "aws-resources",
                    state: "progressing",
                    detail: nil,
                    children: [
                      TreeNode.new(
                        label: "xclusterdnscertificate/codeai-k8s-cluster-dns-certificate",
                        state: "deleting",
                        detail: nil,
                        children: [blocked_leaf],
                        evidence: [],
                        path: [
                          "app-of-apps",
                          "infra",
                          "aws-resources",
                          "xclusterdnscertificate/codeai-k8s-cluster-dns-certificate",
                        ],
                      ),
                    ],
                    evidence: [],
                    path: ["app-of-apps", "infra", "aws-resources"],
                  ),
                ],
                evidence: [],
                path: ["app-of-apps", "infra"],
              ),
            ],
            evidence: [],
            path: ["app-of-apps"],
          ),
        },
      ],
      caveats: [],
    }

    output = render_trace_entry(payload: payload, include_header: false)

    assert_includes output, "\e[1m→       - zone/codeai-k8s-cluster-dns-certificate-da64c8ef083a: blocked\e[22m"
    refute_includes output, "\e[1m      - aws-resources: in progress\e[22m"
  end

  def test_render_trace_entry_bolds_deepest_resource_not_helper_condition
    payload = {
      traces: [
        {
          tree: TreeNode.new(
            label: "app-of-apps",
            state: "progressing",
            detail: nil,
            children: [
              TreeNode.new(
                label: "zone/example",
                state: "blocked",
                detail: nil,
                children: [
                  TreeNode.new(
                    label: "status.conditions.Synced: blocked",
                    state: "blocked",
                    detail: nil,
                    children: [],
                    evidence: [],
                    path: ["status.conditions.Synced: blocked"],
                  ),
                ],
                evidence: [],
                path: ["zone/example"],
              ),
            ],
            evidence: [],
            path: ["app-of-apps"],
          ),
        },
      ],
      caveats: [],
    }

    output = render_trace_entry(payload: payload, include_header: false)

    assert_includes output, "\e[1m→ - zone/example: blocked\e[22m"
    assert_includes output, "\e[1m→   - status.conditions.Synced: blocked\e[22m"
  end

  def test_render_trace_entry_dims_lines_outside_deepest_blocker_subtree
    payload = {
      traces: [
        {
          tree: TreeNode.new(
            label: "app-of-apps",
            state: "progressing",
            detail: nil,
            children: [
              TreeNode.new(
                label: "infra",
                state: "progressing",
                detail: "sync=OutOfSync, via=appset-status",
                children: [
                  TreeNode.new(
                    label: "zone/example",
                    state: "blocked",
                    detail: nil,
                    children: [
                      TreeNode.new(
                        label: "status.conditions.Synced: blocked",
                        state: "blocked",
                        detail: nil,
                        children: [],
                        evidence: [],
                        path: ["status.conditions.Synced: blocked"],
                      ),
                    ],
                    evidence: [],
                    path: ["zone/example"],
                  ),
                ],
                evidence: [],
                path: ["infra"],
              ),
              TreeNode.new(
                label: "dex",
                state: "progressing",
                detail: nil,
                children: [],
                evidence: [],
                path: ["dex"],
              ),
            ],
            evidence: [],
            path: ["app-of-apps"],
          ),
        },
      ],
      caveats: [],
    }

    output = render_trace_entry(payload: payload, include_header: false)

    assert_includes output, "\e[2m- app-of-apps: in progress\e[22m"
    assert_includes output, "\e[2m  - infra: in progress\e[22m"
    assert_includes output, "\e[2m    - Details: sync=OutOfSync, via=appset-status\e[22m"
    assert_includes output, "\e[1m→   - zone/example: blocked\e[22m"
    assert_includes output, "\e[1m→     - status.conditions.Synced: blocked\e[22m"
    assert_includes output, "\e[2m  - dex: in progress\e[22m"
    refute_includes output, "\e[2m\e[1m→   - zone/example: blocked"
  end

  def test_trace_formats_metadata_timestamps_as_seconds_ago_with_raw_time
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {
        "name" => "my-app",
        "namespace" => "argocd",
        "uid" => "my-app-metadata",
        "creationTimestamp" => "2026-04-11T05:00:10Z",
        "deletionTimestamp" => "2026-04-11T05:00:50Z",
        "finalizers" => ["resources-finalizer.argocd.argoproj.io"],
      },
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
      },
    }

    snapshot = snapshot_from_objects([application])
    builder = TraceBuilder.new(
      snapshot: snapshot,
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app"),
    )
    metadata = builder.send(
      :metadata_lines_for,
      snapshot.k8s_object_for(Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app")),
      now: Time.parse("2026-04-11T05:01:00Z"),
    )

    assert_equal [
      ["metadata.creationTimestamp", "50s ago (2026-04-11T05:00:10Z)"],
      ["metadata.deletionTimestamp", "10s ago (2026-04-11T05:00:50Z)"],
      ["metadata.finalizers", "[\"resources-finalizer.argocd.argoproj.io\"]"],
    ], metadata
  end

  def test_deepest_blocking_resource_paths_ignore_structural_group_nodes_for_depth
    deeper_blocked_leaf = TreeNode.new(
      label: "zone/deeper",
      state: "blocked",
      detail: nil,
      children: [],
      evidence: [],
      path: ["zone/deeper"],
    )
    shallower_blocked_leaf = TreeNode.new(
      label: "configmap/shallower",
      state: "blocked",
      detail: nil,
      children: [],
      evidence: [],
      path: ["configmap/shallower"],
    )

    paths = deepest_blocking_resource_paths(
      [
        {
          tree: TreeNode.new(
            label: "root",
            state: "progressing",
            detail: nil,
            children: [
              TreeNode.new(
                label: "RollingSync step 1 (all apps)",
                state: nil,
                detail: nil,
                evidence: [],
                path: ["RollingSync step 1 (all apps)"],
                children: [
                  TreeNode.new(
                    label: "infra",
                    state: "progressing",
                    detail: nil,
                    evidence: [],
                    path: ["infra"],
                    children: [
                      TreeNode.new(
                        label: "deployment/deeper-parent",
                        state: "progressing",
                        detail: nil,
                        evidence: [],
                        path: ["deployment/deeper-parent"],
                        children: [deeper_blocked_leaf],
                      ),
                    ],
                  ),
                ],
              ),
              TreeNode.new(
                label: "RollingSync step 2 (all apps)",
                state: nil,
                detail: nil,
                evidence: [],
                path: ["RollingSync step 2 (all apps)"],
                children: [
                  TreeNode.new(
                    label: "sync-wave 1",
                    state: nil,
                    detail: nil,
                    evidence: [],
                    path: ["sync-wave 1"],
                    children: [
                      TreeNode.new(
                        label: "sync-wave 2",
                        state: nil,
                        detail: nil,
                        evidence: [],
                        path: ["sync-wave 2"],
                        children: [
                          TreeNode.new(
                            label: "other",
                            state: "progressing",
                            detail: nil,
                            evidence: [],
                            path: ["other"],
                            children: [shallower_blocked_leaf],
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
            evidence: [],
            path: ["root"],
          ),
        },
      ],
    )

    assert_equal Set[["root", "RollingSync step 1 (all apps)", "infra", "deployment/deeper-parent", "zone/deeper"]], paths
  end

  def test_profile_output_notice_includes_profile_directory
    ProfileSession.configure!(enabled: true)

    notice = profile_output_notice

    refute_nil notice
    assert_includes notice, "Profile output: "
    assert_includes notice, ProfileSession.current.profile_dir
  ensure
    ProfileSession.configure!(enabled: false)
  end

  def test_trace_payload_reuses_single_live_snapshot_for_rootless_inference
    root_ref = Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root")
    tree = TreeNode.new(label: "root", state: "progressing", detail: nil, children: [], evidence: [], path: ["root"])
    live = {
      shell: Struct.new(:caveats).new([]),
      snapshot: Object.new,
    }

    expects(:load_live_context).once.returns(live)
    expects(:infer_root_refs_from_snapshot).once.with(snapshot: live.fetch(:snapshot), requested_kind: nil, requested_namespace: nil).returns([root_ref])
    TraceBuilder.expects(:new).once.with(
      snapshot: live.fetch(:snapshot),
      root_ref: root_ref,
      recurse_crds: false,
      full_events: false,
    ).returns(stub(build: {tree: tree, deepest_paths: [], evidence: []}))

    payload = trace_payload(
      argocd_namespace: "argocd",
      recurse_crds: false,
      full_events: false,
      kubectl_timeout_seconds: 30,
      max_kubectl_jobs: 8,
    )

    assert_equal [root_ref], payload[:root_refs]
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

  def test_bounded_batch_map_preserves_input_order_when_parallel
    snapshot = Snapshot.new(
      shell: FakeShell.new,
      discovery: FakeDiscovery.new([]),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.default,
      max_kubectl_jobs: 3,
    )

    results = snapshot.send(:bounded_batch_map, [1, 2, 3]) do |value|
      sleep({1 => 0.03, 2 => 0.01, 3 => 0.02}.fetch(value))
      value * 10
    end

    assert_equal [10, 20, 30], results
  end

  def test_bounded_batch_map_stays_serial_when_max_kubectl_jobs_is_1
    snapshot = Snapshot.new(
      shell: FakeShell.new,
      discovery: FakeDiscovery.new([]),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.default,
      max_kubectl_jobs: 1,
    )

    thread_ids = snapshot.send(:bounded_batch_map, [1, 2, 3]) do
      Thread.current.object_id
    end

    assert_equal [Thread.current.object_id, Thread.current.object_id, Thread.current.object_id], thread_ids
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

  def test_prefetch_refs_parallel_fetch_keeps_objects_and_missing_refs_consistent
    configmap_def = ApiResource.new(group: "", version: "v1", kind: "ConfigMap", resource: "configmaps", namespaced: true, categories: [])
    secret_def = ApiResource.new(group: "", version: "v1", kind: "Secret", resource: "secrets", namespaced: true, categories: [])
    present_configmap = {
      "apiVersion" => "v1",
      "kind" => "ConfigMap",
      "metadata" => {"name" => "present", "namespace" => "ns-a", "uid" => "present-configmap"},
    }
    present_secret = {
      "apiVersion" => "v1",
      "kind" => "Secret",
      "metadata" => {"name" => "present-secret", "namespace" => "ns-b", "uid" => "present-secret"},
    }
    shell = FakeShell.new(
      json_map: {
        ["kubectl", "get", "configmaps/present", "configmaps/missing", "-n", "ns-a", "-o", "json", "--ignore-not-found"].join("\u0000") => {
          "items" => [present_configmap],
        },
        ["kubectl", "get", "secrets", "present-secret", "-n", "ns-b", "-o", "json", "--ignore-not-found"].join("\u0000") => present_secret,
      },
    )
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new([configmap_def, secret_def]),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.default,
      max_kubectl_jobs: 2,
    )
    present_ref = Ref.new(group: "", kind: "ConfigMap", namespace: "ns-a", name: "present")
    missing_ref = Ref.new(group: "", kind: "ConfigMap", namespace: "ns-a", name: "missing")
    secret_ref = Ref.new(group: "", kind: "Secret", namespace: "ns-b", name: "present-secret")

    snapshot.prefetch_refs([present_ref, missing_ref, secret_ref])

    assert_equal "present", snapshot.k8s_object_for(present_ref)&.name
    assert_nil snapshot.k8s_object_for(missing_ref)
    assert_equal "present-secret", snapshot.k8s_object_for(secret_ref)&.name
    assert_includes snapshot.instance_variable_get(:@missing_ref_keys), missing_ref.key
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

  def test_trace_groups_applicationset_children_by_rolling_sync_step_and_includes_rollout_condition
    root_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "root-app"},
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "argoproj.io", "version" => "v1alpha1", "kind" => "ApplicationSet", "namespace" => "argocd", "name" => "bootstrap"}
        ],
      },
    }
    bootstrap_appset = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "ApplicationSet",
      "metadata" => {"name" => "bootstrap", "namespace" => "argocd", "uid" => "bootstrap-appset"},
      "spec" => {
        "strategy" => {
          "rollingSync" => {
            "steps" => [
              {
                "matchExpressions" => [
                  {"key" => "code.org/bootstrap-group", "operator" => "In", "values" => ["infra"]}
                ],
              },
              {
                "matchExpressions" => [
                  {"key" => "code.org/bootstrap-group", "operator" => "NotIn", "values" => ["infra"]}
                ],
              },
            ],
          },
        },
      },
      "status" => {
        "conditions" => [
          {
            "type" => "RolloutProgressing",
            "status" => "True",
            "reason" => "ApplicationSetModified",
            "message" => "ApplicationSet is performing rollout of step 1",
          },
          {
            "type" => "ErrorOccurred",
            "status" => "False",
            "reason" => "ApplicationSetUpToDate",
          },
        ],
        "resources" => [
          {"kind" => "Application", "namespace" => "argocd", "name" => "infra", "status" => "OutOfSync", "health" => {"status" => "Progressing"}},
          {"kind" => "Application", "namespace" => "argocd", "name" => "codeai", "status" => "OutOfSync", "health" => {"status" => "Healthy"}},
          {"kind" => "Application", "namespace" => "argocd", "name" => "kargo", "status" => "OutOfSync", "health" => {"status" => "Missing"}},
        ],
        "applicationStatus" => [
          {"application" => "infra", "step" => "1", "status" => "Pending"},
          {"application" => "codeai", "step" => "2", "status" => "Waiting"},
        ],
      },
    }
    infra_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {
        "name" => "infra",
        "namespace" => "argocd",
        "uid" => "infra-app",
        "ownerReferences" => [{"apiVersion" => "argoproj.io/v1alpha1", "kind" => "ApplicationSet", "name" => "bootstrap", "uid" => "bootstrap-appset"}],
      },
      "status" => {"sync" => {"status" => "OutOfSync"}, "health" => {"status" => "Progressing"}},
    }
    codeai_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {
        "name" => "codeai",
        "namespace" => "argocd",
        "uid" => "codeai-app",
        "ownerReferences" => [{"apiVersion" => "argoproj.io/v1alpha1", "kind" => "ApplicationSet", "name" => "bootstrap", "uid" => "bootstrap-appset"}],
      },
      "status" => {"sync" => {"status" => "OutOfSync"}, "health" => {"status" => "Progressing"}},
    }
    kargo_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {
        "name" => "kargo",
        "namespace" => "argocd",
        "uid" => "kargo-app",
        "ownerReferences" => [{"apiVersion" => "argoproj.io/v1alpha1", "kind" => "ApplicationSet", "name" => "bootstrap", "uid" => "bootstrap-appset"}],
      },
      "status" => {"sync" => {"status" => "OutOfSync"}, "health" => {"status" => "Missing"}},
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([root_application, bootstrap_appset, infra_application, codeai_application, kargo_application]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root"),
    ).build

    appset_node = find_node(trace.fetch(:tree), "applicationset/bootstrap")

    assert_equal [
      "status.conditions.RolloutProgressing",
      "RollingSync step 1 (code.org/bootstrap-group In [infra])",
      "RollingSync step 2 (code.org/bootstrap-group NotIn [infra])",
      "kargo",
    ], appset_node.children.map(&:label)
    assert_equal [["status", "True"], ["reason", "ApplicationSetModified"], ["message", "ApplicationSet is performing rollout of step 1"]], appset_node.children.first.detail
    assert_equal ["infra"], appset_node.children[1].children.map(&:label)
    assert_equal ["codeai"], appset_node.children[2].children.map(&:label)
  end

  def test_trace_groups_application_children_by_sync_wave_with_annotation_fallback
    root_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "infra", "namespace" => "argocd", "uid" => "infra-root"},
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "argoproj.io", "version" => "v1alpha1", "kind" => "Application", "namespace" => "argocd", "name" => "crossplane", "status" => "OutOfSync", "health" => {"status" => "Progressing"}},
          {"group" => "argoproj.io", "version" => "v1alpha1", "kind" => "Application", "namespace" => "argocd", "name" => "aws-resources", "status" => "OutOfSync", "health" => {"status" => "Progressing"}, "syncWave" => 2},
          {"group" => "argoproj.io", "version" => "v1alpha1", "kind" => "Application", "namespace" => "argocd", "name" => "codeai", "status" => "OutOfSync", "health" => {"status" => "Missing"}},
        ],
      },
    }
    crossplane_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {
        "name" => "crossplane",
        "namespace" => "argocd",
        "uid" => "crossplane-app",
        "annotations" => {"argocd.argoproj.io/sync-wave" => "0"},
      },
      "status" => {"sync" => {"status" => "OutOfSync"}, "health" => {"status" => "Progressing"}},
    }
    aws_resources_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "aws-resources", "namespace" => "argocd", "uid" => "aws-resources-app"},
      "status" => {"sync" => {"status" => "OutOfSync"}, "health" => {"status" => "Progressing"}},
    }
    codeai_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "codeai", "namespace" => "argocd", "uid" => "codeai-app-wave"},
      "status" => {"sync" => {"status" => "OutOfSync"}, "health" => {"status" => "Missing"}},
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([root_application, crossplane_application, aws_resources_application, codeai_application]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "infra"),
    ).build

    assert_equal ["sync-wave 0", "sync-wave 2", "codeai"], trace.fetch(:tree).children.map(&:label)
    assert_equal ["crossplane"], trace.fetch(:tree).children[0].children.map(&:label)
    assert_equal ["aws-resources"], trace.fetch(:tree).children[1].children.map(&:label)
  end

  def test_nested_step_and_sync_wave_groups_render_and_keep_blocker_highlight_on_real_resource
    root_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "root-nested-app"},
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "argoproj.io", "version" => "v1alpha1", "kind" => "ApplicationSet", "namespace" => "argocd", "name" => "bootstrap"}
        ],
      },
    }
    bootstrap_appset = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "ApplicationSet",
      "metadata" => {"name" => "bootstrap", "namespace" => "argocd", "uid" => "bootstrap-nested-appset"},
      "spec" => {
        "strategy" => {
          "rollingSync" => {
            "steps" => [
              {
                "matchExpressions" => [
                  {"key" => "code.org/bootstrap-group", "operator" => "In", "values" => ["infra"]}
                ],
              },
            ],
          },
        },
      },
      "status" => {
        "conditions" => [
          {
            "type" => "RolloutProgressing",
            "status" => "True",
            "reason" => "ApplicationSetModified",
            "message" => "ApplicationSet is performing rollout of step 1",
          },
        ],
        "resources" => [
          {"kind" => "Application", "namespace" => "argocd", "name" => "infra", "status" => "OutOfSync", "health" => {"status" => "Progressing"}},
        ],
        "applicationStatus" => [
          {"application" => "infra", "step" => "1", "status" => "Pending"},
        ],
      },
    }
    infra_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {
        "name" => "infra",
        "namespace" => "argocd",
        "uid" => "infra-nested-app",
        "ownerReferences" => [{"apiVersion" => "argoproj.io/v1alpha1", "kind" => "ApplicationSet", "name" => "bootstrap", "uid" => "bootstrap-nested-appset"}],
      },
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "argoproj.io", "version" => "v1alpha1", "kind" => "Application", "namespace" => "argocd", "name" => "aws-resources", "status" => "OutOfSync", "health" => {"status" => "Progressing"}, "syncWave" => 2},
        ],
      },
    }
    aws_resources_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "aws-resources", "namespace" => "argocd", "uid" => "aws-resources-nested-app"},
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "example.crossplane.io", "version" => "v1alpha1", "kind" => "XClusterDNSCertificate", "name" => "example-cert", "status" => "Synced", "syncWave" => 1},
        ],
      },
    }
    certificate = {
      "apiVersion" => "example.crossplane.io/v1alpha1",
      "kind" => "XClusterDNSCertificate",
      "metadata" => {
        "name" => "example-cert",
        "uid" => "example-cert-uid",
        "deletionTimestamp" => "2026-04-11T17:00:00Z",
        "finalizers" => ["example.finalizer"],
      },
      "status" => {
        "conditions" => [
          {"type" => "Ready", "status" => "False", "reason" => "Deleting"},
        ],
      },
    }
    zone = {
      "apiVersion" => "example.crossplane.io/v1alpha1",
      "kind" => "Zone",
      "metadata" => {
        "name" => "example-zone",
        "uid" => "example-zone-uid",
        "ownerReferences" => [{"apiVersion" => "example.crossplane.io/v1alpha1", "kind" => "XClusterDNSCertificate", "name" => "example-cert", "uid" => "example-cert-uid"}],
        "deletionTimestamp" => "2026-04-11T17:00:00Z",
        "finalizers" => ["example.finalizer"],
      },
      "status" => {
        "conditions" => [
          {"type" => "Ready", "status" => "False", "reason" => "Deleting"},
          {"type" => "Synced", "status" => "False", "reason" => "ReconcileError", "message" => "delete failed"},
        ],
      },
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([root_application, bootstrap_appset, infra_application, aws_resources_application, certificate, zone]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root"),
    ).build

    labels = flatten_labels(trace.fetch(:tree))
    assert_includes labels, "RollingSync step 1 (code.org/bootstrap-group In [infra])"
    assert_includes labels, "sync-wave 2"
    assert_includes labels, "sync-wave 1"

    output = render_trace_entry(payload: {traces: [trace], caveats: []}, include_header: false)
    assert_includes output, "\e[1m→               - zone/example-zone: blocked\e[22m"
    refute_includes output, "\e[1m      - RollingSync step 1 (code.org/bootstrap-group In [infra])\e[22m"
    refute_includes output, "\e[1m          - sync-wave 2\e[22m"
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
    assert_includes noisy.detail, "via=appset-status"
    assert_includes noisy.detail, "live-object=missing"
  end

  def test_missing_argo_child_application_is_not_refetched
    root_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "root-app-no-refetch"},
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "argoproj.io", "version" => "v1alpha1", "kind" => "Application", "namespace" => "argocd", "name" => "missing-child", "status" => "OutOfSync", "health" => {"status" => "Missing"}}
        ],
      },
    }
    shell = FakeShell.new

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([root_application], shell: shell),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root"),
    ).build

    assert_includes flatten_labels(trace.fetch(:tree)), "missing-child"
    refute(shell.commands.any? {|command| command[0, 4] == ["kubectl", "get", "applications.argoproj.io", "missing-child"]})
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
    assert_includes deployment_node.detail, "via=argo-tracking"
  end

  def test_nested_missing_application_stays_collapsed_by_default
    root_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "root-app-missing-collapse"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Progressing"},
        "operationState" => {"phase" => "Running"},
        "resources" => [
          {"group" => "argoproj.io", "version" => "v1alpha1", "kind" => "Application", "namespace" => "argocd", "name" => "missing-child", "status" => "OutOfSync", "health" => {"status" => "Missing"}}
        ],
      },
    }
    missing_child = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {
        "name" => "missing-child",
        "namespace" => "argocd",
        "uid" => "missing-child-app",
        "ownerReferences" => [{"apiVersion" => "argoproj.io/v1alpha1", "kind" => "Application", "name" => "root", "uid" => "root-app-missing-collapse"}],
      },
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Missing"},
        "resources" => [
          {"group" => "apps", "version" => "v1", "kind" => "Deployment", "namespace" => "default", "name" => "missing-web", "status" => "OutOfSync"}
        ],
      },
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([root_application, missing_child]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root"),
    ).build

    labels = flatten_labels(trace.fetch(:tree))

    assert_includes labels, "missing-child"
    refute_includes labels, "deployment/missing-web"
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

  def test_root_applicationset_keeps_nested_synced_application_with_busy_applicationset_child
    root_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "root-app-nested-appset"},
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
            "name" => "root",
          },
        ],
      },
    }
    root_appset = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "ApplicationSet",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "root-appset-nested-appset"},
      "status" => {
        "resources" => [
          {
            "kind" => "Application",
            "namespace" => "argocd",
            "name" => "nested",
            "status" => "Synced",
            "health" => {"status" => "Healthy"},
          },
        ],
      },
    }
    nested_application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {
        "name" => "nested",
        "namespace" => "argocd",
        "uid" => "nested-app-nested-appset",
        "ownerReferences" => [{"apiVersion" => "argoproj.io/v1alpha1", "kind" => "ApplicationSet", "name" => "root", "uid" => "root-appset-nested-appset"}],
      },
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
            "health" => {"status" => "Healthy"},
          },
        ],
      },
    }
    nested_appset = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "ApplicationSet",
      "metadata" => {"name" => "nested", "namespace" => "argocd", "uid" => "nested-appset-nested-appset"},
      "status" => {
        "resources" => [
          {
            "kind" => "Application",
            "namespace" => "argocd",
            "name" => "busy-child",
            "status" => "OutOfSync",
            "health" => {"status" => "Progressing"},
          },
        ],
      },
    }
    busy_child = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {
        "name" => "busy-child",
        "namespace" => "argocd",
        "uid" => "busy-child-nested-appset",
        "ownerReferences" => [{"apiVersion" => "argoproj.io/v1alpha1", "kind" => "ApplicationSet", "name" => "nested", "uid" => "nested-appset-nested-appset"}],
      },
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
        "operationState" => {"phase" => "Running"},
      },
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([root_application, root_appset, nested_application, nested_appset, busy_child]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root"),
    ).build

    labels = flatten_labels(trace.fetch(:tree))

    assert_includes labels, "nested"
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
    assert_includes deployment_node.detail, "via=argo-status"
    refute_includes deployment_node.detail, "via=argo-tracking"
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
    assert_includes deployment_node.detail, "via=argo-status"
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

    refute_includes entry, "Status: changed"
    refute_includes entry, "## "
    refute_includes entry, "ArgoCD dependency tree: took "
    assert_includes entry, "\e[1m→- my-app: blocked\e[22m"
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
    assert_includes deepest, "status.conditions.Synced: blocked"
    assert_includes labels, "status.conditions.Synced: blocked"
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
        ["kubectl", "get", "replicasets.apps,pods", "-n", "default", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate({"items" => [replicaset, pod]}),
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
    assert_includes shell.commands, ["kubectl", "get", "replicasets.apps,pods", "-n", "default", "-o", "json", "--ignore-not-found"]
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

  def test_pod_persistent_volume_claims_appear_as_generic_children
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "my-app", "namespace" => "argocd", "uid" => "app-uid-pvc"},
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
      "metadata" => {"name" => "web", "namespace" => "default", "uid" => "deploy-uid-pvc"},
      "status" => {"conditions" => [{"type" => "Progressing", "status" => "True", "reason" => "ReplicaSetUpdated"}]}
    }
    replicaset = {
      "apiVersion" => "apps/v1",
      "kind" => "ReplicaSet",
      "metadata" => {
        "name" => "web-rs",
        "namespace" => "default",
        "uid" => "rs-uid-pvc",
        "ownerReferences" => [{"apiVersion" => "apps/v1", "kind" => "Deployment", "name" => "web", "uid" => "deploy-uid-pvc", "controller" => true}]
      },
      "status" => {"conditions" => [{"type" => "ReplicaFailure", "status" => "True", "reason" => "FailedCreate"}]}
    }
    pod = {
      "apiVersion" => "v1",
      "kind" => "Pod",
      "metadata" => {
        "name" => "web-pod",
        "namespace" => "default",
        "uid" => "pod-uid-pvc",
        "ownerReferences" => [{"apiVersion" => "apps/v1", "kind" => "ReplicaSet", "name" => "web-rs", "uid" => "rs-uid-pvc", "controller" => true}]
      },
      "spec" => {
        "volumes" => [
          {
            "name" => "data",
            "persistentVolumeClaim" => {"claimName" => "web-pvc"},
          },
        ],
      },
      "status" => {"phase" => "Pending", "conditions" => [{"type" => "PodScheduled", "status" => "False", "reason" => "Unschedulable"}]}
    }
    pvc = {
      "apiVersion" => "v1",
      "kind" => "PersistentVolumeClaim",
      "metadata" => {"name" => "web-pvc", "namespace" => "default", "uid" => "pvc-uid"},
      "status" => {"phase" => "Pending"},
    }

    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "deployments.apps", "web", "-n", "default", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate(deployment),
        ["kubectl", "get", "replicasets.apps,pods", "-n", "default", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate({"items" => [replicaset, pod]}),
        ["kubectl", "get", "persistentvolumeclaims", "web-pvc", "-n", "default", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate(pvc),
      },
    )
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(resource_defs_for([application, deployment, replicaset, pod, pvc])),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [application])

    trace = TraceBuilder.new(
      snapshot: snapshot,
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "my-app"),
    ).build

    deepest = trace.fetch(:deepest_paths).first.join(" -> ")

    assert_includes deepest, "pod/web-pod"
    assert_includes deepest, "persistentvolumeclaim/web-pvc"
    assert_includes shell.commands, ["kubectl", "get", "persistentvolumeclaims", "web-pvc", "-n", "default", "-o", "json", "--ignore-not-found"]
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
        "uid" => "configmap-uid-events",
        "deletionTimestamp" => "2026-04-08T03:00:00Z"
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

  def test_event_leaf_is_skipped_when_argo_edge_message_already_explains_blocker
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "app-root-events-skip"},
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "", "version" => "v1", "kind" => "ConfigMap", "namespace" => "default", "name" => "stuck", "status" => "OutOfSync", "health" => {"status" => "Progressing"}, "message" => "controller update conflict"}
        ]
      }
    }
    config_map = {
      "apiVersion" => "v1",
      "kind" => "ConfigMap",
      "metadata" => {
        "name" => "stuck",
        "namespace" => "default",
        "uid" => "configmap-uid-events-skip"
      }
    }
    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "events", "-n", "default", "--field-selector", "involvedObject.uid=configmap-uid-events-skip", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate(
          {"items" => [{"reason" => "ApplyFailed", "type" => "Warning", "message" => "should not be read", "metadata" => {"creationTimestamp" => "2026-04-08T03:05:00Z"}}]},
        ),
      },
    )

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([application, config_map], shell: shell),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root"),
    ).build

    refute_includes flatten_labels(trace.fetch(:tree)), "event/ApplyFailed"
    assert_includes trace.fetch(:evidence), "`configmap/stuck`: `controller update conflict`"
    refute(shell.commands.any? {|command| command[0, 3] == ["kubectl", "get", "events"]})
  end

  def test_full_events_restores_event_leaf_when_edge_message_exists
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "root", "namespace" => "argocd", "uid" => "app-root-events-full"},
      "status" => {
        "sync" => {"status" => "OutOfSync"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "", "version" => "v1", "kind" => "ConfigMap", "namespace" => "default", "name" => "stuck", "status" => "OutOfSync", "health" => {"status" => "Progressing"}, "message" => "controller update conflict"}
        ]
      }
    }
    config_map = {
      "apiVersion" => "v1",
      "kind" => "ConfigMap",
      "metadata" => {
        "name" => "stuck",
        "namespace" => "default",
        "uid" => "configmap-uid-events-full"
      }
    }
    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "events", "-n", "default", "--field-selector", "involvedObject.uid=configmap-uid-events-full", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate(
          {"items" => [{"reason" => "ApplyFailed", "type" => "Warning", "message" => "controller refused update", "metadata" => {"creationTimestamp" => "2026-04-08T03:05:00Z"}}]},
        ),
      },
    )

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([application, config_map], shell: shell),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "root"),
      full_events: true,
    ).build

    assert_includes flatten_labels(trace.fetch(:tree)), "event/ApplyFailed"
    assert(shell.commands.any? {|command| command[0, 3] == ["kubectl", "get", "events"]})
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
        "uid" => "clusterrole-uid-events-scope",
        "deletionTimestamp" => "2026-04-08T03:00:00Z"
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

  def test_crd_is_leaf_by_default_even_when_live_descendants_exist
    crd = {
      "apiVersion" => "apiextensions.k8s.io/v1",
      "kind" => "CustomResourceDefinition",
      "metadata" => {
        "name" => "widgets.example.com",
        "uid" => "crd-uid-default",
        "deletionTimestamp" => "2026-04-09T21:14:16Z",
      }
    }
    child = {
      "apiVersion" => "example.com/v1",
      "kind" => "Widget",
      "metadata" => {
        "name" => "widget-a",
        "namespace" => "default",
        "uid" => "widget-uid-default",
        "ownerReferences" => [{"apiVersion" => "apiextensions.k8s.io/v1", "kind" => "CustomResourceDefinition", "name" => "widgets.example.com", "uid" => "crd-uid-default", "controller" => true}],
      }
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([crd, child]),
      root_ref: Ref.new(group: "apiextensions.k8s.io", kind: "CustomResourceDefinition", namespace: nil, name: "widgets.example.com"),
    ).build

    refute_includes flatten_labels(trace.fetch(:tree)), "widget/widget-a"
    assert_equal "deleting", trace.fetch(:tree).state
  end

  def test_recurse_crds_flag_restores_crd_descendants
    crd = {
      "apiVersion" => "apiextensions.k8s.io/v1",
      "kind" => "CustomResourceDefinition",
      "metadata" => {
        "name" => "widgets.example.com",
        "uid" => "crd-uid-recurse",
        "deletionTimestamp" => "2026-04-09T21:14:16Z",
      }
    }
    child = {
      "apiVersion" => "example.com/v1",
      "kind" => "Widget",
      "metadata" => {
        "name" => "widget-a",
        "namespace" => "default",
        "uid" => "widget-uid-recurse",
        "ownerReferences" => [{"apiVersion" => "apiextensions.k8s.io/v1", "kind" => "CustomResourceDefinition", "name" => "widgets.example.com", "uid" => "crd-uid-recurse", "controller" => true}],
        "deletionTimestamp" => "2026-04-09T21:14:16Z",
      }
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([crd, child], recurse_crds: true),
      root_ref: Ref.new(group: "apiextensions.k8s.io", kind: "CustomResourceDefinition", namespace: nil, name: "widgets.example.com"),
      recurse_crds: true,
    ).build

    assert_includes flatten_labels(trace.fetch(:tree)), "widget/widget-a"
  end

  def test_crossplane_resource_refs_skip_broad_category_scans
    xr = {
      "apiVersion" => "infra.code.org/v1alpha1",
      "kind" => "XClusterDNSCertificate",
      "metadata" => {
        "name" => "dns-cert",
        "namespace" => "crossplane-system",
        "uid" => "xr-uid-resource-refs",
        "deletionTimestamp" => "2026-04-09T21:14:16Z",
      },
      "spec" => {
        "crossplane" => {
          "resourceRefs" => [
            {
              "apiVersion" => "route53.aws.m.upbound.io/v1beta1",
              "kind" => "Zone",
              "name" => "dns-zone",
            },
          ],
        },
      },
      "status" => {
        "conditions" => [
          {"type" => "Ready", "status" => "False", "reason" => "Deleting"},
        ],
      },
    }
    zone = {
      "apiVersion" => "route53.aws.m.upbound.io/v1beta1",
      "kind" => "Zone",
      "metadata" => {
        "name" => "dns-zone",
        "namespace" => "crossplane-system",
        "uid" => "zone-uid-resource-refs",
        "ownerReferences" => [{"apiVersion" => "infra.code.org/v1alpha1", "kind" => "XClusterDNSCertificate", "name" => "dns-cert", "uid" => "xr-uid-resource-refs"}],
        "deletionTimestamp" => "2026-04-09T21:14:16Z",
      },
      "status" => {
        "conditions" => [
          {"type" => "Synced", "status" => "False", "reason" => "ReconcileError", "message" => "hosted zone not empty"},
        ],
      },
    }
    shell = FakeShell.new

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([xr, zone], shell: shell),
      root_ref: Ref.new(group: "infra.code.org", kind: "XClusterDNSCertificate", namespace: "crossplane-system", name: "dns-cert"),
    ).build

    assert_includes flatten_labels(trace.fetch(:tree)), "zone/dns-zone"
    refute(shell.commands.any? {|command| command.include?("managed")})
    refute(shell.commands.any? {|command| command.include?("composite")})
  end

  def test_crossplane_missing_resource_refs_are_fetched_once_as_typed_batch
    xr = {
      "apiVersion" => "infra.code.org/v1alpha1",
      "kind" => "XClusterDNSCertificate",
      "metadata" => {
        "name" => "dns-cert",
        "namespace" => "crossplane-system",
        "uid" => "xr-uid-missing-refs",
        "deletionTimestamp" => "2026-04-09T21:14:16Z",
      },
      "spec" => {
        "crossplane" => {
          "resourceRefs" => [
            {
              "apiVersion" => "route53.aws.m.upbound.io/v1beta1",
              "kind" => "Record",
              "name" => "missing-record",
            },
            {
              "apiVersion" => "route53.aws.m.upbound.io/v1beta1",
              "kind" => "Zone",
              "name" => "missing-zone",
            },
          ],
        },
      },
      "status" => {
        "conditions" => [
          {"type" => "Ready", "status" => "False", "reason" => "Deleting"},
        ],
      },
    }
    shell = FakeShell.new(
      text_map: {
        ["kubectl", "get", "records.route53.aws.m.upbound.io/missing-record", "zones.route53.aws.m.upbound.io/missing-zone", "-n", "crossplane-system", "-o", "json", "--ignore-not-found"].join("\u0000") => JSON.generate({"items" => []}),
      },
    )
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(
        [
          ApiResource.new(group: "infra.code.org", version: "v1alpha1", kind: "XClusterDNSCertificate", resource: "xclusterdnscertificates", namespaced: true, categories: ["composite"]),
          ApiResource.new(group: "route53.aws.m.upbound.io", version: "v1beta1", kind: "Record", resource: "records", namespaced: true, categories: []),
          ApiResource.new(group: "route53.aws.m.upbound.io", version: "v1beta1", kind: "Zone", resource: "zones", namespaced: true, categories: []),
        ],
      ),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil),
    )
    prime_snapshot(snapshot, [xr])

    trace = TraceBuilder.new(
      snapshot: snapshot,
      root_ref: Ref.new(group: "infra.code.org", kind: "XClusterDNSCertificate", namespace: "crossplane-system", name: "dns-cert"),
    ).build

    assert_equal ["xclusterdnscertificate/dns-cert", "status.conditions.Ready: in progress"], flatten_labels(trace.fetch(:tree))
    assert_includes shell.commands, ["kubectl", "get", "records.route53.aws.m.upbound.io/missing-record", "zones.route53.aws.m.upbound.io/missing-zone", "-n", "crossplane-system", "-o", "json", "--ignore-not-found"]
    refute(shell.commands.any? {|command| command[0, 4] == ["kubectl", "get", "records", "missing-record"]})
    refute(shell.commands.any? {|command| command[0, 4] == ["kubectl", "get", "zones", "missing-zone"]})
    refute(shell.commands.any? {|command| command.include?("managed")})
  end

  def test_progressing_application_prefers_branchy_composite_child
    application = {
      "apiVersion" => "argoproj.io/v1alpha1",
      "kind" => "Application",
      "metadata" => {"name" => "aws-resources", "namespace" => "argocd", "uid" => "aws-resources-app"},
      "status" => {
        "sync" => {"status" => "Synced"},
        "health" => {"status" => "Progressing"},
        "resources" => [
          {"group" => "apiextensions.crossplane.io", "version" => "v1", "kind" => "Composition", "name" => "dns-cert-composition", "status" => "Synced"},
          {"group" => "aws.m.upbound.io", "version" => "v1beta1", "kind" => "ClusterProviderConfig", "name" => "default", "status" => "Synced"},
          {"group" => "iam.aws.m.upbound.io", "version" => "v1beta1", "kind" => "Policy", "namespace" => "crossplane-system", "name" => "external-dns", "status" => "Synced"},
          {"group" => "infra.code.org", "version" => "v1alpha1", "kind" => "XClusterDNSCertificate", "namespace" => "crossplane-system", "name" => "dns-cert", "status" => "Synced"},
        ],
      },
    }
    xr = {
      "apiVersion" => "infra.code.org/v1alpha1",
      "kind" => "XClusterDNSCertificate",
      "metadata" => {
        "name" => "dns-cert",
        "namespace" => "crossplane-system",
        "uid" => "progressing-app-xr",
        "deletionTimestamp" => "2026-04-09T21:14:16Z",
      },
      "status" => {
        "conditions" => [
          {"type" => "Ready", "status" => "False", "reason" => "Deleting"},
        ],
      },
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([application, xr]),
      root_ref: Ref.new(group: "argoproj.io", kind: "Application", namespace: "argocd", name: "aws-resources"),
    ).build

    labels = flatten_labels(trace.fetch(:tree))

    assert_includes labels, "xclusterdnscertificate/dns-cert"
    refute_includes labels, "composition/dns-cert-composition"
    refute_includes labels, "clusterproviderconfig/default"
    refute_includes labels, "policy/external-dns"
  end

  def test_blocking_object_message_stops_generic_child_expansion
    parent = {
      "apiVersion" => "v1",
      "kind" => "ConfigMap",
      "metadata" => {
        "name" => "stuck-parent",
        "namespace" => "default",
        "uid" => "configmap-blocked-parent",
        "deletionTimestamp" => "2026-04-09T21:14:16Z",
      },
      "status" => {
        "conditions" => [
          {
            "type" => "Ready",
            "status" => "False",
            "reason" => "DeleteBlocked",
            "message" => "delete failed: hosted zone not empty",
          }
        ],
      },
    }
    child = {
      "apiVersion" => "v1",
      "kind" => "Pod",
      "metadata" => {
        "name" => "should-not-expand",
        "namespace" => "default",
        "uid" => "pod-blocked-child",
        "ownerReferences" => [{"apiVersion" => "v1", "kind" => "ConfigMap", "name" => "stuck-parent", "uid" => "configmap-blocked-parent", "controller" => true}],
      },
    }

    trace = TraceBuilder.new(
      snapshot: snapshot_from_objects([parent, child]),
      root_ref: Ref.new(group: "", kind: "ConfigMap", namespace: "default", name: "stuck-parent"),
    ).build

    refute_includes flatten_labels(trace.fetch(:tree)), "pod/should-not-expand"
    assert_includes trace.fetch(:tree).evidence, "`configmap/stuck-parent`: `delete failed: hosted zone not empty`"
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
    assert_equal 2, shell.caveats.length
    assert_includes shell.caveats, "kubectl get pods returned malformed JSON; retrying per kind"
    assert_includes shell.caveats, "kubectl get pods returned malformed JSON"
  end

  def test_profile_session_writes_command_log_with_context
    ProfileSession.configure!(enabled: true)
    shell = Shell.new

    stdout = profile_context("smoke-test") do
      shell.text!("ruby", "-e", "puts 'ok'")
    end

    log_path = File.join(ProfileSession.current.profile_dir, "profile-commands.yaml")
    status_path = File.join(ProfileSession.current.profile_dir, "status.json")

    assert_equal "ok\n", stdout
    assert File.exist?(log_path)
    assert File.exist?(status_path)
    assert_includes File.read(log_path), "commands:"
    assert_includes File.read(log_path), "context:"
    assert_includes File.read(log_path), "- smoke-test"
    assert_includes File.read(log_path), "- ruby"
    assert_includes File.read(log_path), "- \"-e\""
  ensure
    ProfileSession.configure!(enabled: false)
  end

  def test_profile_session_logs_failed_command_launches
    ProfileSession.configure!(enabled: true)
    shell = Shell.new

    Process.stubs(:spawn).raises(Errno::ENOENT, "missing-binary")
    error = assert_raises(Errno::ENOENT) do
      shell.text!("missing-binary")
    end

    log_path = File.join(ProfileSession.current.profile_dir, "profile-commands.yaml")

    assert_equal "No such file or directory - missing-binary", error.message
    assert File.exist?(log_path)
    assert_includes File.read(log_path), "- missing-binary"
    assert_includes File.read(log_path), "success:"
  ensure
    Process.unstub(:spawn)
    ProfileSession.configure!(enabled: false)
  end

  def test_bounded_batch_map_preserves_profile_logging_under_concurrency
    ProfileSession.configure!(enabled: true)
    snapshot = Snapshot.new(
      shell: Shell.new,
      discovery: FakeDiscovery.new([]),
      argocd_namespace: "argocd",
      tracking_config: TrackingConfig.default,
      max_kubectl_jobs: 2,
    )

    snapshot.send(:bounded_batch_map, [1, 2]) do |value|
      profile_context("worker-#{value}") do
        snapshot.instance_variable_get(:@shell).text!("ruby", "-e", "sleep 0.05")
      end
    end

    log_path = File.join(ProfileSession.current.profile_dir, "profile-commands.yaml")
    log = YAML.load_file(log_path)

    assert_equal 2, log.fetch("commands").length
    assert_equal [
      ["worker-1"],
      ["worker-2"],
    ], log.fetch("commands").map {|entry| entry.fetch("context")}.sort
  ensure
    ProfileSession.configure!(enabled: false)
  end

  def test_with_stackprof_warns_and_yields_when_stackprof_is_unavailable
    stubs(:ensure_stackprof_loaded).returns(false)

    stdout, stderr = capture_io do
      result = with_stackprof(output_path: "/tmp/argo-trace-stackprof.dump") {"ok"}
      assert_equal "ok", result
    end

    assert_equal "", stdout
    assert_includes stderr, "WARNING: stackprof not found, not using"
  ensure
    unstub(:ensure_stackprof_loaded)
  end

  def test_stackprof_load_paths_expand_relative_require_paths_and_extension_dir
    spec = Struct.new(:full_gem_path, :require_paths, :extension_dir).new(
      "/tmp/stackprof-gem",
      ["lib", "/opt/stackprof/native"],
      "/tmp/stackprof-gem/ext",
    )

    assert_equal [
      "/tmp/stackprof-gem/lib",
      "/opt/stackprof/native",
      "/tmp/stackprof-gem/ext",
    ], stackprof_load_paths(spec)
  end

  def test_stackprof_global_spec_scans_gem_paths_when_bundler_hides_specs
    Dir.mktmpdir("stackprof-spec") do |dir|
      specs_dir = File.join(dir, "specifications")
      Dir.mkdir(specs_dir)
      File.write(
        File.join(specs_dir, "stackprof-9.9.9.gemspec"),
        <<~RUBY,
          Gem::Specification.new do |spec|
            spec.name = "stackprof"
            spec.version = "9.9.9"
            spec.summary = "stackprof"
            spec.author = "test"
            spec.files = []
            spec.require_paths = ["lib"]
          end
        RUBY
      )

      stubs(:stackprof_known_specs).returns([])
      stubs(:stackprof_global_gemspec_paths).returns([File.join(specs_dir, "stackprof-9.9.9.gemspec")])

      assert_equal "9.9.9", stackprof_global_spec.version.to_s
    ensure
      unstub(:stackprof_known_specs)
      unstub(:stackprof_global_gemspec_paths)
    end
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

    assert_includes deployment_node.detail, "via=argo-status"
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

    assert_includes deployment_node.detail, "via=argo-tracking"
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

  private def snapshot_for_fixture(name, shell: FakeShell.new, tracking_config:, recurse_crds: false)
    objects = JSON.parse((FIXTURE_DIR / name).read)
    snapshot_from_objects(objects, shell: shell, tracking_config: tracking_config, recurse_crds: recurse_crds)
  end

  private def snapshot_from_objects(objects, shell: FakeShell.new, tracking_config: TrackingConfig.new(tracking_method: "annotation", instance_label_key: "app.kubernetes.io/instance", installation_id: nil), recurse_crds: false)
    snapshot = Snapshot.new(
      shell: shell,
      discovery: FakeDiscovery.new(resource_defs_for(objects)),
      argocd_namespace: "argocd",
      tracking_config: tracking_config,
      recurse_crds: recurse_crds,
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
