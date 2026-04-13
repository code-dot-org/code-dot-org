#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "pathname"

load File.expand_path("../../bin/argo-trace", __dir__)

class ArgoTraceAppsRequiringDetailTest < Minitest::Test
  FIXTURE_DIR = Pathname.new(__dir__) / "fixtures" / "argo-cli-data"

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
  end

  def test_apps_requiring_detail_is_deterministic_for_saved_fixture
    assert_equal %w[app-of-apps codeai codeai-staging codeai-test infra kargo],
      ArgoTrace.apps_requiring_detail(
        app_inventory: @app_inventory,
        root_inventory: @root_inventory,
        argocd_appsets: @argocd_appsets
      )
  end

  def test_keeps_all_appsets_for_wave_2
    assert_equal %w[app-of-apps codeai],
      ArgoTrace.appsets_requiring_detail(@appset_inventory)
  end

  def test_keeps_generic_non_healthy_apps
    @app_inventory["crossplane"][:raw]["status"]["health"]["status"] = "Progressing"

    assert_includes ArgoTrace.apps_requiring_detail(
      app_inventory: @app_inventory,
      root_inventory: @root_inventory,
      argocd_appsets: @argocd_appsets
    ), "crossplane"
  end

  def test_keeps_apps_with_conditions_even_when_other_top_level_states_look_healthy
    @app_inventory["crossplane"][:raw]["status"]["conditions"] = [
      {"type" => "ComparisonError", "message" => "boom"}
    ]

    assert_includes ArgoTrace.apps_requiring_detail(
      app_inventory: @app_inventory,
      root_inventory: @root_inventory,
      argocd_appsets: @argocd_appsets
    ), "crossplane"
  end

  def test_no_recursion_first_version_rule_does_not_pull_in_healthy_grandchildren
    refute_includes ArgoTrace.apps_requiring_detail(
      app_inventory: @app_inventory,
      root_inventory: @root_inventory,
      argocd_appsets: @argocd_appsets
    ), "kargo-project-codeai"

    refute_includes ArgoTrace.apps_requiring_detail(
      app_inventory: @app_inventory,
      root_inventory: @root_inventory,
      argocd_appsets: @argocd_appsets
    ), "argocd"
  end

  def test_keeps_non_idle_child_app_visible_under_parent_application_from_wave_1
    @app_inventory["networking"][:raw]["status"]["health"]["status"] = "Progressing"

    assert_includes ArgoTrace.apps_requiring_detail(
      app_inventory: @app_inventory,
      root_inventory: @root_inventory,
      argocd_appsets: @argocd_appsets
    ), "networking"
  end
end
