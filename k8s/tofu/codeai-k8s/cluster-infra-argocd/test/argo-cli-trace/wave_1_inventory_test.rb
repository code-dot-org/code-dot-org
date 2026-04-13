#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "pathname"

load File.expand_path("../../bin/argo-cli-trace", __dir__)

class FakeCommandRunner
  attr_reader :commands

  def initialize(outputs)
    @outputs = outputs
    @commands = []
    @mutex = Mutex.new
  end

  def call(*command)
    @mutex.synchronize do
      @commands << command
    end
    @outputs.fetch(command)
  end
end

class ArgoCliTraceWave1InventoryTest < Minitest::Test
  FIXTURE_DIR = Pathname.new(__dir__) / "fixtures" / "argo-cli-data"

  def test_fixture_loading_parses_saved_argocd_cli_lists
    app_payload = ArgoCliTrace.load_argocd_yaml((FIXTURE_DIR / "app-list.yaml").read)
    appset_payload = ArgoCliTrace.load_argocd_yaml((FIXTURE_DIR / "appset-list.yaml").read)

    assert_kind_of Array, ArgoCliTrace.argocd_output_list(app_payload)
    assert_kind_of Array, ArgoCliTrace.argocd_output_list(appset_payload)
  end

  def test_argocd_output_list_accepts_live_top_level_array_shape
    payload = [{"metadata" => {"name" => "app-of-apps"}}]

    assert_equal payload, ArgoCliTrace.argocd_output_list(payload)
  end

  def test_argocd_output_list_accepts_items_wrapper_shape
    payload = {"items" => [{"metadata" => {"name" => "app-of-apps"}}]}

    assert_equal payload["items"], ArgoCliTrace.argocd_output_list(payload)
  end

  def test_builds_app_inventory_from_list_fixture
    argocd_apps = ArgoCliTrace.argocd_output_list(
      ArgoCliTrace.load_argocd_yaml((FIXTURE_DIR / "app-list.yaml").read)
    )

    app_inventory = ArgoCliTrace.build_app_inventory(argocd_apps)

    assert_equal 16, app_inventory.length
    assert_equal ["app-of-apps"], app_inventory["codeai"][:owner_appset_names]
    assert_equal ["codeai"], app_inventory["codeai-staging"][:owner_appset_names]
    assert_equal %w(argocd aws-resources crossplane dex external-dns external-secrets-operator kargo-secrets networking standard-envtypes),
      app_inventory["infra"][:child_application_names]
    assert_equal [], app_inventory["app-of-apps"][:owner_application_names]
  end

  def test_builds_appset_inventory_from_list_fixture
    argocd_appsets = ArgoCliTrace.argocd_output_list(
      ArgoCliTrace.load_argocd_yaml((FIXTURE_DIR / "appset-list.yaml").read)
    )

    appset_inventory = ArgoCliTrace.build_appset_inventory(argocd_appsets)

    assert_equal ["app-of-apps", "codeai"], appset_inventory.keys.sort
    assert_equal "argocd", appset_inventory["app-of-apps"][:namespace]
  end

  def test_builds_root_inventory_from_parentage_signals_in_app_list
    argocd_apps = ArgoCliTrace.argocd_output_list(
      ArgoCliTrace.load_argocd_yaml((FIXTURE_DIR / "app-list.yaml").read)
    )

    root_names = ArgoCliTrace.build_root_inventory(
      ArgoCliTrace.build_app_inventory(argocd_apps)
    ).map {|argocd_app| argocd_app.fetch(:name)}

    assert_equal ["app-of-apps"], root_names
  end

  def test_fetch_wave1_app_and_appset_list_uses_batched_argocd_list_calls
    command_runner = FakeCommandRunner.new(
      [
        [ArgoCliTrace::WAVE1_APPSET_LIST_COMMAND, (FIXTURE_DIR / "appset-list.yaml").read],
        [ArgoCliTrace::WAVE1_APP_LIST_COMMAND, (FIXTURE_DIR / "app-list.yaml").read],
      ].to_h
    )

    inventory = ArgoCliTrace.fetch_wave1_app_and_appset_list(command_runner: command_runner)

    assert_equal [ArgoCliTrace::WAVE1_APPSET_LIST_COMMAND, ArgoCliTrace::WAVE1_APP_LIST_COMMAND].sort, command_runner.commands.sort
    assert_equal(["app-of-apps"], inventory[:root_inventory].map {|argocd_app| argocd_app.fetch(:name)})
    assert_equal ["app-of-apps", "codeai"], inventory[:appset_inventory].keys.sort
    assert_equal ["codeai"], inventory[:app_inventory]["codeai-test"][:owner_appset_names]
  end

  def test_fetch_wave1_app_and_appset_list_accepts_live_top_level_array_list_payloads
    command_runner = FakeCommandRunner.new(
      [
        [ArgoCliTrace::WAVE1_APPSET_LIST_COMMAND, <<~YAML],
          ---
          - metadata:
              name: app-of-apps
              namespace: argocd
        YAML
        [ArgoCliTrace::WAVE1_APP_LIST_COMMAND, <<~YAML],
          ---
          - metadata:
              name: app-of-apps
              namespace: argocd
        YAML
      ].to_h
    )

    inventory = ArgoCliTrace.fetch_wave1_app_and_appset_list(command_runner: command_runner)

    assert_equal(["app-of-apps"], inventory[:root_inventory].map {|argocd_app| argocd_app.fetch(:name)})
    assert_equal ["app-of-apps"], inventory[:app_inventory].keys
    assert_equal ["app-of-apps"], inventory[:appset_inventory].keys
  end

  def test_fetch_wave1_app_and_appset_list_accepts_live_items_wrapper_list_payloads
    command_runner = FakeCommandRunner.new(
      [
        [ArgoCliTrace::WAVE1_APPSET_LIST_COMMAND, <<~YAML],
          ---
          items:
            - metadata:
                name: app-of-apps
                namespace: argocd
        YAML
        [ArgoCliTrace::WAVE1_APP_LIST_COMMAND, <<~YAML],
          ---
          items:
            - metadata:
                name: app-of-apps
                namespace: argocd
              status:
                resources: []
        YAML
      ].to_h
    )

    inventory = ArgoCliTrace.fetch_wave1_app_and_appset_list(command_runner: command_runner)

    assert_equal(["app-of-apps"], inventory[:root_inventory].map {|argocd_app| argocd_app.fetch(:name)})
    assert_equal "argocd", inventory[:appset_inventory]["app-of-apps"][:namespace]
  end
end
