#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "pathname"

load File.expand_path("../../bin/argo-cli-trace", __dir__)

class ArgoCliTraceNodeRenderingTest < Minitest::Test
  FIXTURE_DIR = Pathname.new(__dir__) / "fixtures" / "argo-cli-data"

  def setup
    @argocd_apps = ArgoCliTrace.argocd_output_list(
      ArgoCliTrace.load_argocd_yaml((FIXTURE_DIR / "app-list.yaml").read)
    )
    @argocd_appsets = ArgoCliTrace.argocd_output_list(
      ArgoCliTrace.load_argocd_yaml((FIXTURE_DIR / "appset-list.yaml").read)
    )
    @app_inventory = ArgoCliTrace.build_app_inventory(@argocd_apps)
    @appset_inventory = ArgoCliTrace.build_appset_inventory(@argocd_appsets)
    @root_inventory = ArgoCliTrace.build_root_inventory(@app_inventory)
    @app_enrichment = {
      "app-of-apps" => {raw: fixture_get("app-get-app-of-apps.yaml"), error: nil},
      "codeai" => {raw: fixture_get("app-get-codeai.yaml"), error: nil},
      "infra" => {raw: fixture_get("app-get-infra.yaml"), error: nil},
      "kargo" => {raw: fixture_get("app-get-kargo.yaml"), error: nil},
      "codeai-staging" => {raw: fixture_get("app-get-codeai-staging.yaml"), error: nil},
      "codeai-test" => {raw: fixture_get("app-get-codeai-test.yaml"), error: nil},
    }
    @appset_enrichment = {
      "app-of-apps" => {raw: fixture_get("appset-get-app-of-apps.yaml"), error: nil},
      "codeai" => {raw: fixture_get("appset-get-codeai.yaml"), error: nil},
    }
    @tree = ArgoCliTrace.build_tree(
      root_inventory: @root_inventory,
      app_inventory: @app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment,
      appset_enrichment: @appset_enrichment
    )
  end

  def test_application_label_includes_exact_field_names_and_rollout_summary
    lines = ArgoCliTrace.render_display_lines(@tree)

    assert_includes lines, "- app-of-apps (Application) [sync.status=Synced, health.status=Healthy, status.operationState.phase=Succeeded]"
    assert_includes lines, "      - infra (Application) [step=1, status=Healthy]"
  end

  def test_applicationset_label_uses_mechanical_all_conditions_good_summary
    lines = ArgoCliTrace.render_display_lines(@tree)

    assert_includes lines, "  - app-of-apps (ApplicationSet) [all conditions good]"
    assert_includes lines, "        - codeai (ApplicationSet) [all conditions good]"
  end

  def test_renders_condition_subtrees_and_operation_messages_for_non_good_conditions
    lines = ArgoCliTrace.render_display_lines(@tree)

    assert_includes lines, "          - codeai-staging (Application) [sync.status=Unknown, health.status=Healthy, status.operationState.phase=Error, ComparisonError=True]"
    assert_includes lines, "→           - status.conditions.ComparisonError"
    assert_includes lines, "→             - message: Failed to load target state: failed to generate manifest for source 1 of 2: rpc error: code = Unknown desc = unable to resolve 'k8s/reorg' to a commit SHA"
    assert_includes lines, "→           - status.operationState.message: ComparisonError: Failed to load target state: failed to generate manifest for source 1 of 2: rpc error: code = Unknown desc = unable to resolve 'k8s/reorg' to a commit SHA"
  end

  def test_operator_output_includes_metadata_lines_from_saved_fixture_output
    lines = ArgoCliTrace.render_display_lines(@tree)

    assert_includes lines, "  - metadata.creationTimestamp: 2026-04-12T08:31:09Z"
    assert_includes lines, '  - metadata.finalizers: ["resources-finalizer.argocd.argoproj.io"]'
  end

  def test_operator_output_includes_metadata_lines_when_subtree_is_not_all_ok
    node = ArgoCliTrace::TreeNode.new(
      kind: "Application",
      name: "metadata-heavy-app",
      children: [
        ArgoCliTrace::TreeNode.new(
          kind: "Application",
          name: "broken-child",
          children: [],
          metadata: {
            raw: {
              "status" => {
                "sync" => {"status" => "Unknown"},
                "health" => {"status" => "Healthy"},
              }
            }
          }
        )
      ],
      metadata: {
        raw: {
          "metadata" => {
            "creationTimestamp" => "2026-04-12T08:31:09Z",
            "deletionTimestamp" => "2026-04-12T09:00:00Z",
            "finalizers" => ["resources-finalizer.argocd.argoproj.io"],
          },
          "status" => {
            "sync" => {"status" => "Synced"},
            "health" => {"status" => "Healthy"},
          }
        }
      }
    )

    lines = ArgoCliTrace.render_display_lines([node])

    assert_includes lines, "  - metadata.creationTimestamp: 2026-04-12T08:31:09Z"
    assert_includes lines, "  - metadata.deletionTimestamp: 2026-04-12T09:00:00Z"
    assert_includes lines, '  - metadata.finalizers: ["resources-finalizer.argocd.argoproj.io"]'
  end

  def test_operator_output_suppresses_detail_bullets_under_fully_all_ok_subtree
    node = ArgoCliTrace::TreeNode.new(
      kind: "Application",
      name: "healthy-leaf",
      children: [],
      metadata: {
        raw: {
          "metadata" => {
            "creationTimestamp" => "2026-04-12T08:31:09Z",
            "finalizers" => ["resources-finalizer.argocd.argoproj.io"],
          },
          "status" => {
            "sync" => {"status" => "Synced"},
            "health" => {"status" => "Healthy"},
            "operationState" => {"phase" => "Succeeded", "message" => "done"},
          }
        }
      }
    )

    lines = ArgoCliTrace.render_display_lines([node])

    assert_equal ["- healthy-leaf (Application) [sync.status=Synced, health.status=Healthy]"], lines
  end

  def test_renders_error_attachment_in_operator_output
    node = ArgoCliTrace::TreeNode.new(
      kind: "Application",
      name: "broken-app",
      children: [],
      metadata: {
        enrichment_result: {
          error: {
            command: "argocd --core --app-namespace argocd app get broken-app -o yaml",
            stderr: "timed out after 60s",
            message: :timeout,
          }
        }
      }
    )

    lines = ArgoCliTrace.render_display_lines([node])

    assert_equal "- broken-app (Application) [timed out]", lines.first
    assert_includes lines, "→ - argo_cli_trace.command: argocd --core --app-namespace argocd app get broken-app -o yaml"
    assert_includes lines, "→ - argo_cli_trace.stderr: timed out after 60s"
  end

  def test_non_idle_child_application_under_normal_application_is_arrowed
    app_inventory = Marshal.load(Marshal.dump(@app_inventory))
    app_inventory["networking"][:raw]["status"]["health"]["status"] = "Progressing"
    app_inventory["networking"][:raw]["status"]["conditions"] = []
    app_inventory["networking"][:raw]["status"].delete("operationState")

    infra_node = ArgoCliTrace.build_application_tree(
      "infra",
      app_inventory: app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment,
      appset_enrichment: @appset_enrichment
    )

    lines = ArgoCliTrace.render_display_lines([infra_node])

    assert_includes lines, "→     - networking (Application) [sync.status=Synced, health.status=Progressing]"
  end

  def test_non_application_resource_leaf_under_normal_application_is_rendered_and_arrowed
    argocd_app = Marshal.load(Marshal.dump(@app_enrichment["infra"][:raw]))
    argocd_app["status"]["resources"] << {
      "kind" => "Namespace",
      "name" => "levelbuilder",
      "status" => "Synced",
      "syncWave" => 30,
      "health" => {
        "status" => "Progressing",
        "message" => "Pending deletion",
      },
    }

    infra_node = ArgoCliTrace.build_application_tree(
      "infra",
      app_inventory: @app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment.merge("infra" => {raw: argocd_app, error: nil}),
      appset_enrichment: @appset_enrichment
    )

    lines = ArgoCliTrace.render_display_lines([infra_node])

    assert_includes lines, "→     - levelbuilder (Namespace) [sync.status=Synced, health.status=Progressing]"
    assert_includes lines, "→       - health.message: Pending deletion"
  end

  def test_appset_children_app_children_and_resource_leaves_share_attention_selection
    codeai_node = @tree.first.children.first.children.last.children.first
    codeai_appset_node = codeai_node.children.first
    codeai_selected_children = codeai_appset_node.children.select do |node|
      ArgoCliTrace.arrowed_child_node_ids(codeai_appset_node.children).include?(node.object_id)
    end

    assert_equal %w[codeai-staging codeai-test], codeai_selected_children.map(&:name)

    app_inventory = Marshal.load(Marshal.dump(@app_inventory))
    app_inventory["networking"][:raw]["status"]["health"]["status"] = "Progressing"
    app_inventory["networking"][:raw]["status"]["conditions"] = []
    app_inventory["networking"][:raw]["status"].delete("operationState")

    infra_node = ArgoCliTrace.build_application_tree(
      "infra",
      app_inventory: app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment,
      appset_enrichment: @appset_enrichment
    )
    sync_wave_3 = infra_node.children.find {|child| child.name == "sync-wave 3"}
    app_selected_children = sync_wave_3.children.select do |node|
      ArgoCliTrace.arrowed_child_node_ids(sync_wave_3.children).include?(node.object_id)
    end

    assert_equal ["networking"], app_selected_children.map(&:name)

    argocd_app = Marshal.load(Marshal.dump(@app_enrichment["infra"][:raw]))
    argocd_app["status"]["resources"] << {
      "kind" => "Namespace",
      "name" => "levelbuilder",
      "status" => "Synced",
      "syncWave" => 30,
      "health" => {
        "status" => "Progressing",
        "message" => "Pending deletion",
      },
    }

    infra_with_resource_leaf = ArgoCliTrace.build_application_tree(
      "infra",
      app_inventory: @app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment.merge("infra" => {raw: argocd_app, error: nil}),
      appset_enrichment: @appset_enrichment
    )
    sync_wave_30 = infra_with_resource_leaf.children.find {|child| child.name == "sync-wave 30"}
    resource_selected_children = sync_wave_30.children.select do |node|
      ArgoCliTrace.arrowed_child_node_ids(sync_wave_30.children).include?(node.object_id)
    end

    assert_equal ["levelbuilder"], resource_selected_children.map(&:name)
  end

  private def fixture_get(filename)
    ArgoCliTrace.load_argocd_yaml((FIXTURE_DIR / filename).read)
  end
end
