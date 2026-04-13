#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "mocha/minitest"
require "pathname"

load File.expand_path("../../bin/argo-trace", __dir__)

class ArgoTraceExactOutputTest < Minitest::Test
  FIXTURE_DIR = Pathname.new(__dir__) / "fixtures" / "argo-cli-data"
  FIXED_NOW = Time.parse("2026-04-12T12:33:10-10:00")

  def test_matches_expected_output_fixture_for_saved_argocd_cli_data
    Time.stubs(:now).returns(FIXED_NOW)
    output = ArgoTrace.render_fixture_snapshot(
      tree_lines: ArgoTrace.render_ansi_display_lines(tree),
      start_time: FIXED_NOW,
      end_time: FIXED_NOW,
      elapsed_seconds: 30.0
    )

    assert_equal expected_output, output
  end

  private def tree
    argocd_apps = ArgoTrace.argocd_output_list(
      ArgoTrace.load_argocd_yaml((FIXTURE_DIR / "app-list.yaml").read)
    )
    argocd_appsets = ArgoTrace.argocd_output_list(
      ArgoTrace.load_argocd_yaml((FIXTURE_DIR / "appset-list.yaml").read)
    )
    app_inventory = ArgoTrace.build_app_inventory(argocd_apps)
    appset_inventory = ArgoTrace.build_appset_inventory(argocd_appsets)
    root_inventory = ArgoTrace.build_root_inventory(app_inventory)
    app_enrichment = %w[app-of-apps codeai infra kargo codeai-staging codeai-test].to_h do |name|
      [name, {raw: fixture_get("app-get-#{name}.yaml"), error: nil}]
    end
    appset_enrichment = %w[app-of-apps codeai].to_h do |name|
      [name, {raw: fixture_get("appset-get-#{name}.yaml"), error: nil}]
    end

    ArgoTrace.build_tree(
      root_inventory: root_inventory,
      app_inventory: app_inventory,
      appset_inventory: appset_inventory,
      app_enrichment: app_enrichment,
      appset_enrichment: appset_enrichment
    )
  end

  private def fixture_get(filename)
    ArgoTrace.load_argocd_yaml((FIXTURE_DIR / filename).read)
  end

  private def expected_output
    (Pathname.new(__dir__) / "expected-output-from-argo-trace-given-data-responses.txt").read
  end
end
