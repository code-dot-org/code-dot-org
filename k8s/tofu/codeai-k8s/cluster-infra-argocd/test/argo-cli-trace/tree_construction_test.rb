#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "pathname"

load File.expand_path("../../bin/argo-cli-trace", __dir__)

class ArgoCliTraceTreeConstructionTest < Minitest::Test
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
  end

  def test_build_tree_preserves_wrapper_app_and_appset_structure
    tree = ArgoCliTrace.build_tree(
      root_inventory: @root_inventory,
      app_inventory: @app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment,
      appset_enrichment: @appset_enrichment
    )

    assert_equal ["app-of-apps"], tree.map(&:name)
    assert_equal "Application", tree.first.kind
    assert_equal ["app-of-apps"], tree.first.children.map(&:name)
    assert_equal "ApplicationSet", tree.first.children.first.kind
  end

  def test_build_tree_groups_app_of_apps_children_by_rolling_sync_step
    appset_node = build_tree.first.children.first

    assert_equal [
      "RollingSync step 1 (code.org/bootstrap-group In [infra])",
      "RollingSync step 2 (code.org/bootstrap-group NotIn [infra])",
    ], appset_node.children.map(&:name)

    assert_equal ["infra"], appset_node.children.first.children.map(&:name)
    assert_equal %w[codeai kargo], appset_node.children.last.children.map(&:name)
  end

  def test_build_tree_groups_child_applications_by_sync_wave
    infra_node = build_tree.first.children.first.children.first.children.first

    assert_equal [
      "sync-wave 0",
      "sync-wave 2",
      "sync-wave 3",
      "sync-wave 4",
      "sync-wave 20",
      "sync-wave 25",
      "sync-wave 30",
      "sync-wave 40",
    ], infra_node.children.map(&:name)

    assert_equal ["crossplane"], infra_node.children[0].children.map(&:name)
    assert_equal %w[kargo-secrets standard-envtypes], infra_node.children[6].children.map(&:name)
  end

  def test_build_tree_keeps_wrapper_app_for_nested_appset
    codeai_node = build_tree.first.children.first.children.last.children.first

    assert_equal ["codeai"], codeai_node.children.map(&:name)
    assert_equal "ApplicationSet", codeai_node.children.first.kind
    assert_equal %w[codeai-staging codeai-test], codeai_node.children.first.children.map(&:name)
  end

  def test_duplicate_name_disambiguation_uses_namespace_suffix_when_needed
    argocd_app = Marshal.load(Marshal.dump(@app_enrichment["infra"][:raw]))
    argocd_app["status"]["resources"] << {
      "kind" => "Application",
      "name" => "argocd",
      "namespace" => "other-namespace",
    }

    node = ArgoCliTrace.build_application_tree(
      "infra",
      app_inventory: @app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment.merge("infra" => {raw: argocd_app, error: nil}),
      appset_enrichment: @appset_enrichment
    )

    assert_includes node.children.flat_map {|child| child.children.map(&:name)}, "argocd/argocd"
    assert_includes node.children.flat_map {|child| child.children.map(&:name)}, "argocd/other-namespace"
  end

  def test_build_tree_keeps_non_application_resource_leaves_when_they_carry_active_state
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

    node = ArgoCliTrace.build_application_tree(
      "infra",
      app_inventory: @app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment.merge("infra" => {raw: argocd_app, error: nil}),
      appset_enrichment: @appset_enrichment
    )

    sync_wave_30 = node.children.find {|child| child.name == "sync-wave 30"}
    refute_nil sync_wave_30
    assert_includes sync_wave_30.children.map(&:name), "levelbuilder"
  end

  private def build_tree
    @build_tree ||= ArgoCliTrace.build_tree(
      root_inventory: @root_inventory,
      app_inventory: @app_inventory,
      appset_inventory: @appset_inventory,
      app_enrichment: @app_enrichment,
      appset_enrichment: @appset_enrichment
    )
  end

  private def fixture_get(filename)
    ArgoCliTrace.load_argocd_yaml((FIXTURE_DIR / filename).read)
  end
end
