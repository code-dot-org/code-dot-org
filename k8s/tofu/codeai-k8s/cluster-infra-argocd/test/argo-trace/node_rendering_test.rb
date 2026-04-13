#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "mocha/minitest"
require "pathname"

load File.expand_path("../../bin/argo-trace", __dir__)

class ArgoTraceNodeRenderingTest < Minitest::Test
  FIXTURE_DIR = Pathname.new(__dir__) / "fixtures" / "argo-cli-data"
  FIXED_METADATA_NOW = Time.parse("2026-04-12T09:00:09Z")

  def setup
    @argocd_apps = ArgoTrace.argocd_output_list(
      ArgoTrace.load_argocd_yaml((FIXTURE_DIR / "app-list.yaml").read)
    )
    @argocd_appsets = ArgoTrace.argocd_output_list(
      ArgoTrace.load_argocd_yaml((FIXTURE_DIR / "appset-list.yaml").read)
    )
    @app_inventory = ArgoTrace.build_app_inventory(@argocd_apps)
    @appset_inventory = ArgoTrace.build_appset_inventory(@argocd_appsets)
    @root_inventory = ArgoTrace.build_root_inventory(@app_inventory)
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
    @tree = ArgoTrace.build_tree(
      root_inventory: @root_inventory,
      app_inventory: @app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment,
      appset_enrichment: @appset_enrichment
    )
  end

  def test_application_label_includes_exact_field_names_and_rollout_summary
    lines = ArgoTrace.render_display_lines(@tree)

    assert_includes lines, "- app-of-apps (Application) [sync.status=Synced, health.status=Healthy, status.operationState.phase=Succeeded]"
    assert_includes lines, "      - infra (Application) [sync.status=Synced, health.status=Healthy, status.operationState.phase=Succeeded, step=1, rollout.status=Healthy]"
  end

  def test_missing_delete_race_application_renders_as_missing_not_stale_rollout_status
    missing_codeai_tree = ArgoTrace.build_tree(
      root_inventory: ArgoTrace.build_root_inventory(@app_inventory.reject {|name, _argocd_app| name == "codeai"}),
      app_inventory: @app_inventory.reject {|name, _argocd_app| name == "codeai"},
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment.reject {|name, _result| name == "codeai"},
      appset_enrichment: @appset_enrichment
    )

    lines = ArgoTrace.render_display_lines(missing_codeai_tree)

    assert_includes lines, "→     - codeai (Application) [missing]"
    refute_includes lines, "      - codeai (Application) [step=2, status=Healthy]"
  end

  def test_missing_child_under_deleting_parent_renders_as_missing_but_not_arrowed
    deleting_parent = Marshal.load(Marshal.dump(@app_enrichment["infra"][:raw]))
    deleting_parent["metadata"]["deletionTimestamp"] = "2026-04-13T04:02:47Z"
    app_inventory_without_external_dns = @app_inventory.reject {|name, _argocd_app| name == "external-dns"}

    infra_node = ArgoTrace.build_application_tree(
      "infra",
      app_inventory: app_inventory_without_external_dns,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment.merge("infra" => {raw: deleting_parent, error: nil}).reject {|name, _result| name == "external-dns"},
      appset_enrichment: @appset_enrichment
    )

    lines = ArgoTrace.render_display_lines([infra_node])

    assert_includes lines, "    - external-dns (Application) [missing]"
    refute_includes lines, "        → external-dns (Application) [missing]"
  end

  def test_deepest_non_good_frontier_gets_arrow_not_the_whole_ancestor_chain
    lines = ArgoTrace.render_display_lines(@tree)

    refute(lines.any? {|line| line.start_with?("→ - app-of-apps (Application)")})
    refute(lines.any? {|line| line.start_with?("      → codeai (Application)")})
  end

  def test_applicationset_label_uses_mechanical_all_conditions_good_summary
    lines = ArgoTrace.render_display_lines(@tree)

    assert_includes lines, "  - app-of-apps (ApplicationSet) [all conditions good]"
    assert_includes lines, "        - codeai (ApplicationSet) [all conditions good]"
  end

  def test_renders_condition_subtrees_and_operation_messages_for_non_good_conditions
    lines = ArgoTrace.render_display_lines(@tree)

    assert_includes lines, "          - codeai-staging (Application) [sync.status=Unknown, health.status=Healthy, status.operationState.phase=Error, ComparisonError=True]"
    assert_includes lines, "→           - status.conditions.ComparisonError"
    assert_includes lines, "→             - message: Failed to load target state: failed to generate manifest for source 1 of 2: rpc error: code = Unknown desc = unable to resolve 'k8s/reorg' to a commit SHA"
    assert_includes lines, "→           - status.operationState.message: ComparisonError: Failed to load target state: failed to generate manifest for source 1 of 2: rpc error: code = Unknown desc = unable to resolve 'k8s/reorg' to a commit SHA"
  end

  def test_operator_output_includes_metadata_lines_from_saved_fixture_output
    Time.stubs(:now).returns(FIXED_METADATA_NOW)
    lines = ArgoTrace.render_display_lines(@tree)

    assert_includes lines, "  - metadata.creationTimestamp: #{ArgoTrace.display_metadata_timestamp('2026-04-12T08:31:09Z', now: FIXED_METADATA_NOW)}"
    assert_includes lines, '  - metadata.finalizers: ["resources-finalizer.argocd.argoproj.io"]'
  end

  def test_operator_output_includes_metadata_lines_when_subtree_is_not_all_ok
    node = ArgoTrace::TreeNode.new(
      kind: "Application",
      name: "metadata-heavy-app",
      children: [
        ArgoTrace::TreeNode.new(
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

    Time.stubs(:now).returns(FIXED_METADATA_NOW)
    lines = ArgoTrace.render_display_lines([node])
    ansi_lines = ArgoTrace.render_ansi_display_lines([node])

    assert_includes lines, "  - metadata.creationTimestamp: #{ArgoTrace.display_metadata_timestamp('2026-04-12T08:31:09Z', now: FIXED_METADATA_NOW)}"
    assert_includes lines, "  - metadata.deletionTimestamp: #{ArgoTrace.display_metadata_timestamp('2026-04-12T09:00:00Z', now: FIXED_METADATA_NOW)}"
    assert_includes lines, '  - metadata.finalizers: ["resources-finalizer.argocd.argoproj.io"]'
    assert_includes ansi_lines, "\e[2m  - metadata.creationTimestamp: #{ArgoTrace.display_metadata_timestamp('2026-04-12T08:31:09Z', now: FIXED_METADATA_NOW)}\e[22m"
    assert_includes ansi_lines, "\e[2;31m  - metadata.deletionTimestamp: #{ArgoTrace.display_metadata_timestamp('2026-04-12T09:00:00Z', now: FIXED_METADATA_NOW)}\e[39;22m"
  end

  def test_operator_output_suppresses_detail_bullets_under_fully_all_ok_subtree
    node = ArgoTrace::TreeNode.new(
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

    lines = ArgoTrace.render_display_lines([node])

    assert_equal ["- healthy-leaf (Application) [sync.status=Synced, health.status=Healthy]"], lines
  end

  def test_successful_operation_message_is_not_rendered_as_active_detail
    node = ArgoTrace::TreeNode.new(
      kind: "Application",
      name: "deleting-app",
      children: [],
      metadata: {
        raw: {
          "metadata" => {
            "deletionTimestamp" => "2026-04-13T04:02:47Z",
            "finalizers" => ["resources-finalizer.argocd.argoproj.io"],
          },
          "status" => {
            "sync" => {"status" => "Synced"},
            "health" => {"status" => "Progressing"},
            "operationState" => {
              "phase" => "Succeeded",
              "message" => "successfully synced (all tasks run)",
            },
          }
        }
      }
    )

    lines = ArgoTrace.render_display_lines([node])

    refute(lines.any? {|line| line.include?("status.operationState.message: successfully synced (all tasks run)")})
  end

  def test_renders_error_attachment_in_operator_output
    node = ArgoTrace::TreeNode.new(
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

    lines = ArgoTrace.render_display_lines([node])

    assert_equal "- broken-app (Application) [timed out]", lines.first
    assert_includes lines, "→ - argo_trace.command: argocd --core --app-namespace argocd app get broken-app -o yaml"
    assert_includes lines, "→ - argo_trace.stderr: timed out after 60s"
  end

  def test_non_idle_child_application_under_normal_application_is_arrowed
    app_inventory = Marshal.load(Marshal.dump(@app_inventory))
    app_inventory["networking"][:raw]["status"]["health"]["status"] = "Progressing"
    app_inventory["networking"][:raw]["status"]["conditions"] = []
    app_inventory["networking"][:raw]["status"].delete("operationState")

    infra_node = ArgoTrace.build_application_tree(
      "infra",
      app_inventory: app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment,
      appset_enrichment: @appset_enrichment
    )

    lines = ArgoTrace.render_display_lines([infra_node])

    assert_includes lines, "→   - networking (Application) [sync.status=Synced, health.status=Progressing]"
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

    infra_node = ArgoTrace.build_application_tree(
      "infra",
      app_inventory: @app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment.merge("infra" => {raw: argocd_app, error: nil}),
      appset_enrichment: @appset_enrichment
    )

    lines = ArgoTrace.render_display_lines([infra_node])

    assert_includes lines, "→   - levelbuilder (Namespace) [sync.status=Synced, health.status=Progressing]"
    assert_includes lines, "→     - health.message: Pending deletion"
  end

  def test_live_kubectl_detail_makes_resource_child_non_good_and_shows_detail
    node = ArgoTrace::TreeNode.new(
      kind: "XClusterDNSCertificate",
      name: "codeai-k8s-cluster-dns-certificate",
      children: [],
      metadata: {
        raw: {
          "kind" => "XClusterDNSCertificate",
          "name" => "codeai-k8s-cluster-dns-certificate",
          "status" => "Synced",
        },
        kubectl_detail: {
          raw: {
            "metadata" => {
              "deletionTimestamp" => "2026-04-13T04:05:07Z",
              "finalizers" => ["foregroundDeletion"],
            },
            "status" => {
              "conditions" => [
                {
                  "type" => "Ready",
                  "status" => "False",
                  "reason" => "Deleting",
                }
              ]
            }
          }
        }
      }
    )

    deletion_now = Time.parse("2026-04-13T04:05:16Z")
    Time.stubs(:now).returns(deletion_now)
    lines = ArgoTrace.render_display_lines([node])

    assert_includes lines, "→ - codeai-k8s-cluster-dns-certificate (XClusterDNSCertificate) [sync.status=Synced, status.conditions.Ready=False]"
    assert_includes lines, "  - metadata.deletionTimestamp: #{ArgoTrace.display_metadata_timestamp('2026-04-13T04:05:07Z', now: deletion_now)}"
    assert_includes lines, '  - metadata.finalizers: ["foregroundDeletion"]'
    assert_includes lines, "→ - status.conditions.Ready: status=False, reason=Deleting"
  end

  def test_appset_children_app_children_and_resource_leaves_share_attention_selection
    codeai_node = @tree.first.children.first.children.last.children.first
    codeai_appset_node = codeai_node.children.first
    codeai_selected_children = codeai_appset_node.children.select do |node|
      ArgoTrace.arrowed_child_node_ids(codeai_appset_node.children).include?(node.object_id)
    end

    assert_equal %w[codeai-staging codeai-test], codeai_selected_children.map(&:name)

    app_inventory = Marshal.load(Marshal.dump(@app_inventory))
    app_inventory["networking"][:raw]["status"]["health"]["status"] = "Progressing"
    app_inventory["networking"][:raw]["status"]["conditions"] = []
    app_inventory["networking"][:raw]["status"].delete("operationState")

    infra_node = ArgoTrace.build_application_tree(
      "infra",
      app_inventory: app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment,
      appset_enrichment: @appset_enrichment
    )
    sync_wave_3 = infra_node.children.find {|child| child.name == "sync-wave 3"}
    app_selected_children = sync_wave_3.children.select do |node|
      ArgoTrace.arrowed_child_node_ids(sync_wave_3.children).include?(node.object_id)
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

    infra_with_resource_leaf = ArgoTrace.build_application_tree(
      "infra",
      app_inventory: @app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment.merge("infra" => {raw: argocd_app, error: nil}),
      appset_enrichment: @appset_enrichment
    )
    sync_wave_30 = infra_with_resource_leaf.children.find {|child| child.name == "sync-wave 30"}
    resource_selected_children = sync_wave_30.children.select do |node|
      ArgoTrace.arrowed_child_node_ids(sync_wave_30.children).include?(node.object_id)
    end

    assert_equal ["levelbuilder"], resource_selected_children.map(&:name)
  end

  def test_sync_wave_rendering_does_not_duplicate_wrapper_appset_child
    lines = ArgoTrace.render_display_lines(@tree)

    refute_includes lines, "  - sync-wave 0"
    assert_equal 1, (lines.count {|line| line == "  - app-of-apps (ApplicationSet) [all conditions good]"})
  end

  def test_later_sync_wave_missing_nodes_are_not_arrowed_while_earlier_wave_has_real_blocker
    infra_node = ArgoTrace::TreeNode.new(
      kind: "Application",
      name: "infra",
      children: [
        ArgoTrace::TreeNode.new(
          kind: "SyncWave",
          name: "sync-wave 2",
          children: [
            ArgoTrace::TreeNode.new(
              kind: "Application",
              name: "aws-resources",
              children: [],
              metadata: {
                raw: {
                  "status" => {
                    "sync" => {"status" => "Synced"},
                    "health" => {"status" => "Progressing"},
                  },
                },
              }
            )
          ],
          metadata: {}
        ),
        ArgoTrace::TreeNode.new(
          kind: "SyncWave",
          name: "sync-wave 4",
          children: [
            ArgoTrace::TreeNode.new(
              kind: "Application",
              name: "external-dns",
              children: [],
              metadata: {
                raw: {
                  "metadata" => {
                    "annotations" => {
                      "argo-trace/code-object-missing" => "true",
                    },
                  },
                  "status" => {},
                },
              }
            )
          ],
          metadata: {}
        ),
      ],
      metadata: {
        raw: {
          "status" => {
            "sync" => {"status" => "OutOfSync"},
            "health" => {"status" => "Progressing"},
          },
        },
      }
    )

    lines = ArgoTrace.render_display_lines([infra_node])

    assert_includes lines, "→   - aws-resources (Application) [sync.status=Synced, health.status=Progressing]"
    assert_includes lines, "    - external-dns (Application) [missing]"
    refute_includes lines, "→   - external-dns (Application) [missing]"
  end

  def test_later_rolling_sync_step_missing_nodes_are_not_arrowed_while_earlier_step_is_active
    appset_node = ArgoTrace::TreeNode.new(
      kind: "ApplicationSet",
      name: "app-of-apps",
      children: [
        ArgoTrace::TreeNode.new(
          kind: "RollingSyncStep",
          name: "RollingSync step 1 (group In [infra])",
          children: [
            ArgoTrace::TreeNode.new(
              kind: "Application",
              name: "infra",
              children: [],
              metadata: {
                raw: {
                  "status" => {
                    "sync" => {"status" => "OutOfSync"},
                    "health" => {"status" => "Progressing"},
                  },
                },
              }
            )
          ],
          metadata: {}
        ),
        ArgoTrace::TreeNode.new(
          kind: "RollingSyncStep",
          name: "RollingSync step 2 (group NotIn [infra])",
          children: [
            ArgoTrace::TreeNode.new(
              kind: "Application",
              name: "codeai",
              children: [],
              metadata: {
                raw: {
                  "metadata" => {
                    "annotations" => {
                      "argo-trace/code-object-missing" => "true",
                    },
                  },
                  "status" => {},
                },
              }
            )
          ],
          metadata: {}
        ),
      ],
      metadata: {
        raw: {
          "status" => {
            "conditions" => [],
          },
        },
      }
    )

    lines = ArgoTrace.render_display_lines([appset_node])

    assert_includes lines, "→   - infra (Application) [sync.status=OutOfSync, health.status=Progressing]"
    assert_includes lines, "    - codeai (Application) [missing]"
    refute_includes lines, "→   - codeai (Application) [missing]"
  end

  private def fixture_get(filename)
    ArgoTrace.load_argocd_yaml((FIXTURE_DIR / filename).read)
  end
end
