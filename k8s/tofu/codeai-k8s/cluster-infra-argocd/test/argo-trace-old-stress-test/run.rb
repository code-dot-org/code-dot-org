#!/usr/bin/env ruby
# frozen_string_literal: true

require "fileutils"
require "json"
require "open3"
require "pathname"
require "tempfile"
require "time"

$stdout.sync = true

class StressHarnessError < StandardError; end

class StressHarness
  BRANCH = "main"
  WAIT_REASONS = %w[ErrImagePull ImagePullBackOff].freeze

  def initialize(mode: "full")
    @mode = mode
    @cluster_root = Pathname(__dir__).join("..", "..").realpath
    @k8s_gitops = Pathname("~/src/k8s-gitops").expand_path
    @argo_trace = @cluster_root / "bin" / "argo-trace-old"
    @artifact_dir = @cluster_root / "logs" / "argo-trace-old-stress-test" / Time.now.utc.strftime("%Y-%m-%dT%H-%M-%SZ")
    @cleanup_enabled = true
  end

  def run!
    case @mode
    when "full"
      run_full!
    when "stage-profile-root"
      ensure_remote_branch!
      cleanup_live_state!
      wait_for_stress_roots_gone!
      wait_for_stress_namespaces_gone!
      stage_profile_root!
    when "cleanup"
      cleanup_live_state!
      wait_for_stress_roots_gone!
      wait_for_stress_namespaces_gone!
    else
      raise StressHarnessError, "unknown mode #{@mode.inspect}"
    end
  end

  def run_full!
    started_at = Time.now
    ensure_remote_branch!
    FileUtils.mkdir_p(@artifact_dir)
    cleanup_live_state!
    wait_for_stress_roots_gone!
    wait_for_stress_namespaces_gone!

    begin
      log("running quiet-root scenarios")
      run_quiet_root_scenarios
      emit_review!("25")

      log("running active-root scenarios")
      run_active_root_scenarios
      emit_review!("50")

      log("running delete-time scenarios")
      run_delete_scenarios
      emit_review!("final")
    ensure
      log("cleaning up live stress roots")
      cleanup_live_state! if @cleanup_enabled
    end

    elapsed = Time.now - started_at
    puts "artifacts: #{@artifact_dir}"
    puts format("elapsed: %.2fs", elapsed)
  end

  # rubocop:disable Style/AccessModifierDeclarations, CustomCops/GroupedInlinePrivateMethods
  private

  # The harness is intentionally blunt about shelling out. It is easier to
  # trust a small number of explicit kubectl calls than a larger abstraction
  # layer that hides which reads and writes happened.
  def sh!(*command, allow_failure: false, input: nil, timeout: 45)
    stdout = +""
    stderr = +""
    status = nil

    Tempfile.create("argo-trace-old-stress-stdout") do |stdout_file|
      Tempfile.create("argo-trace-old-stress-stderr") do |stderr_file|
        spawn_options = {out: stdout_file.path, err: stderr_file.path}

        if input
          Tempfile.create("argo-trace-old-stress-stdin") do |stdin_file|
            stdin_file.write(input)
            stdin_file.flush
            spawn_options[:in] = stdin_file.path
            status = wait_for_process(Process.spawn(*command, spawn_options), timeout: timeout, command: command)
          end
        else
          status = wait_for_process(Process.spawn(*command, spawn_options), timeout: timeout, command: command)
        end

        stdout = File.read(stdout_file.path)
        stderr = File.read(stderr_file.path)
      end
    end

    return stdout if status.success?
    return stdout if allow_failure

    raise StressHarnessError, <<~TEXT
      command failed: #{command.join(" ")}
      stdout:
      #{stdout}
      stderr:
      #{stderr}
    TEXT
  end

  def wait_for_process(pid, timeout:, command:)
    deadline = Time.now + timeout

    loop do
      result = Process.wait2(pid, Process::WNOHANG)
      return result.last if result

      if Time.now >= deadline
        terminate_process(pid)
        raise StressHarnessError, "command timed out after #{timeout}s: #{command.join(' ')}"
      end

      sleep 0.2
    end
  end

  def terminate_process(pid)
    Process.kill("TERM", pid)
    deadline = Time.now + 5

    loop do
      result = Process.wait2(pid, Process::WNOHANG)
      return result.last if result
      break if Time.now >= deadline

      sleep 0.1
    end
  rescue StandardError
    nil
  ensure
    begin
      Process.kill("KILL", pid)
      Process.wait(pid)
    rescue StandardError
      nil
    end
  end

  def json!(*command)
    JSON.parse(sh!(*command))
  end

  def log(message)
    puts "[stress] #{message}"
  end

  def ensure_remote_branch!
    output = sh!("git", "-C", @k8s_gitops.to_s, "ls-remote", "--heads", "origin", BRANCH, allow_failure: true)
    return if output.lines.any? {|line| line.end_with?("refs/heads/#{BRANCH}\n")}

    raise StressHarnessError, "push #{@k8s_gitops} branch #{BRANCH.inspect} before running the live harness"
  end

  def apply_bootstrap!(path)
    sh!("kubectl", "apply", "--server-side", "--field-manager=terraform", "-f", path.to_s)
  end

  def delete_bootstrap!(path, wait: false)
    args = %W[kubectl delete --cascade=foreground --wait=#{wait} -f #{path}]
    sh!(*args, allow_failure: true)
  end

  def wait_until(description, timeout: 600, interval: 5)
    deadline = Time.now + timeout

    loop do
      result = yield
      return result if result

      raise StressHarnessError, "timed out waiting for #{description}" if Time.now >= deadline

      sleep interval
    end
  end

  def app_json(name)
    output = sh!("kubectl", "get", "application", name, "-n", "argocd", "-o", "json", allow_failure: true)
    return nil if output.strip.empty?

    JSON.parse(output)
  rescue JSON::ParserError
    nil
  end

  def appset_json(name)
    output = sh!("kubectl", "get", "applicationset", name, "-n", "argocd", "-o", "json", allow_failure: true)
    return nil if output.strip.empty?

    JSON.parse(output)
  rescue JSON::ParserError
    nil
  end

  def wait_for_app(name, sync: nil, health: nil, timeout: 600)
    wait_until("application #{name} sync=#{sync.inspect} health=#{health.inspect}", timeout: timeout) do
      app = app_json(name)
      next false unless app

      sync_status = app.dig("status", "sync", "status")
      health_status = app.dig("status", "health", "status")
      next false if sync && sync_status != sync
      next false if health && health_status != health

      app
    end
  end

  def wait_for_status_resources(kind:, name:, expected_names:, timeout: 600)
    wait_until("#{kind} #{name} status.resources to include #{expected_names.join(', ')}", timeout: timeout, interval: 3) do
      object = case kind
               when "application"
                 app_json(name)
               when "applicationset"
                 appset_json(name)
               else
                 raise StressHarnessError, "unsupported status.resources kind #{kind.inspect}"
               end
      next false unless object

      resource_names = Array(object.dig("status", "resources")).map {|resource| resource["name"]}
      expected_names.all? {|expected_name| resource_names.include?(expected_name)} ? object : false
    end
  end

  def wait_for_any_application_resources(name, timeout: 600)
    wait_until("application #{name} status.resources to be populated", timeout: timeout, interval: 3) do
      app = app_json(name)
      next false unless app

      resources = Array(app.dig("status", "resources"))
      resources.empty? ? false : app
    end
  end

  def wait_for_job_active(namespace, name, timeout: 300)
    wait_until("job #{namespace}/#{name} to become active", timeout: timeout, interval: 3) do
      job = json!("kubectl", "get", "job", name, "-n", namespace, "-o", "json")
      job.dig("status", "active").to_i.positive? ? job : false
    rescue StressHarnessError
      false
    end
  end

  def wait_for_job_complete(namespace, name, timeout: 300)
    wait_until("job #{namespace}/#{name} to complete", timeout: timeout, interval: 3) do
      job = json!("kubectl", "get", "job", name, "-n", namespace, "-o", "json")
      Array(job.dig("status", "conditions")).any? {|condition| condition["type"] == "Complete" && condition["status"] == "True"} ? job : false
    rescue StressHarnessError
      false
    end
  end

  def wait_for_pod_wait_reason(namespace, selector, timeout: 300)
    wait_until("pod in #{namespace} with selector #{selector} to report a wait reason", timeout: timeout, interval: 3) do
      pods = json!("kubectl", "get", "pods", "-n", namespace, "-l", selector, "-o", "json").fetch("items")
      waiting = pods.find do |pod|
        Array(pod.dig("status", "containerStatuses")).any? do |status|
          reason = status.dig("state", "waiting", "reason")
          WAIT_REASONS.include?(reason)
        end
      end
      waiting || false
    rescue StressHarnessError
      false
    end
  end

  def wait_for_pod_phase(namespace, selector, phase, timeout: 300)
    wait_until("pod in #{namespace} with selector #{selector} to reach phase #{phase}", timeout: timeout, interval: 3) do
      pods = json!("kubectl", "get", "pods", "-n", namespace, "-l", selector, "-o", "json").fetch("items")
      pod = pods.find {|item| item.dig("status", "phase") == phase}
      pod || false
    rescue StressHarnessError
      false
    end
  end

  def wait_for_resource(namespace:, kind:, name:, deleting: false, timeout: 300)
    wait_until("#{kind} #{namespace}/#{name}#{deleting ? ' deleting' : ''}", timeout: timeout, interval: 3) do
      object = json!("kubectl", "get", kind, name, "-n", namespace, "-o", "json")
      deletion_timestamp = object.dig("metadata", "deletionTimestamp")
      if deleting
        deletion_timestamp ? object : false
      else
        object
      end
    rescue StressHarnessError
      false
    end
  end

  def wait_for_cluster_resource(kind:, name:, timeout: 300)
    wait_until("#{kind} #{name}", timeout: timeout, interval: 3) do
      json!("kubectl", "get", kind, name, "-o", "json")
    rescue StressHarnessError
      false
    end
  end

  # Each scenario writes its raw trace output. The assertions intentionally use
  # short, stable substrings. Pod hashes and full event messages are not stable
  # enough to be good regression signals.
  def capture_trace!(scenario_name, root_name: nil)
    command = [@argo_trace.to_s]
    command += ["--root-name", root_name] if root_name
    log("capturing #{scenario_name} with #{command.join(' ')}")
    output = sh!(*command, timeout: 150)
    (@artifact_dir / "#{scenario_name}.md").write(output)
    output
  end

  def assert_includes(text, needle, scenario_name)
    return if strip_ansi(text).include?(needle)

    raise StressHarnessError, "#{scenario_name}: expected output to include #{needle.inspect}"
  end

  def assert_excludes(text, needle, scenario_name)
    return unless strip_ansi(text).include?(needle)

    raise StressHarnessError, "#{scenario_name}: expected output to exclude #{needle.inspect}"
  end

  def assert_matches(text, pattern, scenario_name)
    return if pattern.match?(strip_ansi(text))

    raise StressHarnessError, "#{scenario_name}: expected output to match #{pattern.inspect}"
  end

  def strip_ansi(text)
    text.gsub(/\e\[[\d;]*m/, "")
  end

  def emit_review!(milestone)
    (@artifact_dir / "critique-#{milestone}.md").write(critique_text(milestone))
  end

  def primary_bootstrap
    @k8s_gitops / "argo-trace-old-stress-test" / "roots" / "primary" / "bootstrap.yaml"
  end

  def secondary_bootstrap
    @k8s_gitops / "argo-trace-old-stress-test" / "roots" / "secondary" / "bootstrap.yaml"
  end

  def critique_text(milestone)
    case milestone
    when "25"
      <<~TEXT
        Coverage: enough to prove the harness boots, captures one idle root, and reaches live active branches.

        Fragility: the main risk here is waiting on Argo state that has not settled yet. Avoid string checks on pod hashes or full event text.

        Simplify: keep one runner. Keep plain text assertions. Do not add a second harness layer unless the current one stops explaining failures.
      TEXT
    when "50"
      <<~TEXT
        Coverage: enough to prove app-of-apps recursion, hook jobs, owner-ref workload chains, storage wait states, and cluster-scoped ref edges.

        Fragility: the expensive paths are shallow Argo status and delete churn. Tests should wait for the minimum live condition needed, then capture once.

        Simplify: prefer fewer high-signal shapes over more apps. Drop any scenario that only adds time or cluster-specific noise.
      TEXT
    when "final"
      <<~TEXT
        Coverage: good for Argo roots, ApplicationSet recursion, hook jobs, owner refs, storage waits, finalizers, cluster-scoped refs, and safe Crossplane delete holds.

        Fragility: live timing is still the weak point. The harness must fail fast on real timeouts and must not rely on exact event wording.

        Simplify: if the top-level root trace stays too slow, keep the root scenario but trim only redundant readiness waits. Do not weaken the traced object shapes.
      TEXT
    else
      raise StressHarnessError, "unknown critique milestone #{milestone.inspect}"
    end
  end

  def clear_synthetic_finalizers!
    sh!("kubectl", "patch", "configmap", "stress-argo-trace-old-finalizer", "-n", "stress-argo-trace-old-finalizer", "--type=merge", "-p", '{"metadata":{"finalizers":[]}}', allow_failure: true)
    sh!("kubectl", "patch", "xstresstrace", "stress-argo-trace-old", "-n", "stress-argo-trace-old-crossplane", "--type=merge", "-p", '{"metadata":{"finalizers":[]}}', allow_failure: true)
    usages = sh!("kubectl", "get", "usage.protection.crossplane.io", "-n", "stress-argo-trace-old-crossplane", "-o", "name", allow_failure: true)
    usages.lines.map(&:strip).reject(&:empty?).each do |usage|
      sh!("kubectl", "patch", usage, "-n", "stress-argo-trace-old-crossplane", "--type=merge", "-p", '{"metadata":{"finalizers":[]}}', allow_failure: true)
    end
    sh!("kubectl", "patch", "stressmanagedthing", "stress-argo-trace-old-root", "stress-argo-trace-old-middle", "stress-argo-trace-old-leaf", "-n", "stress-argo-trace-old-crossplane", "--type=merge", "-p", '{"metadata":{"finalizers":[]}}', allow_failure: true)
    sh!("kubectl", "patch", "stressmanagedthing", "stress-argo-trace-old-leaf", "-n", "stress-argo-trace-old-crossplane", "--type=merge", "-p", '{"metadata":{"finalizers":[]}}', allow_failure: true)
  end

  def delete_crossplane_stress_residue!
    sh!("kubectl", "delete", "usage.protection.crossplane.io", "-A", "-l", "crossplane.io/composite=stress-argo-trace-old", "--ignore-not-found=true", "--wait=false", allow_failure: true)
    sh!("kubectl", "delete", "stressmanagedthing", "stress-argo-trace-old-root", "stress-argo-trace-old-middle", "stress-argo-trace-old-leaf", "-n", "stress-argo-trace-old-crossplane", "--ignore-not-found=true", "--wait=false", allow_failure: true)
    sh!("kubectl", "delete", "xstresstrace", "stress-argo-trace-old", "-n", "stress-argo-trace-old-crossplane", "--ignore-not-found=true", "--wait=false", allow_failure: true)
  end

  def force_delete_stress_argo_roots!
    resources = sh!("kubectl", "get", "application,applicationset", "-n", "argocd", "-o", "name", allow_failure: true)
    resources.lines.grep(/stress-argo-trace-old/).map(&:strip).reject(&:empty?).each do |resource|
      sh!("kubectl", "patch", resource, "-n", "argocd", "--type=merge", "-p", '{"metadata":{"finalizers":[]}}', allow_failure: true)
    end
  end

  def cleanup_live_state!
    clear_synthetic_finalizers!
    delete_bootstrap!(primary_bootstrap, wait: false)
    delete_bootstrap!(secondary_bootstrap, wait: false)
    delete_crossplane_stress_residue!
    force_delete_stress_argo_roots!
  end

  def wait_for_stress_roots_gone!(timeout: 600)
    wait_until("stress Applications and ApplicationSets to be deleted", timeout: timeout, interval: 3) do
      resources = sh!("kubectl", "get", "application,applicationset", "-n", "argocd", "-o", "name", allow_failure: true)
      resources.lines.grep(/stress-argo-trace-old/).empty?
    end
  end

  def wait_for_stress_namespaces_gone!(timeout: 600)
    wait_until("stress namespaces to finish terminating", timeout: timeout, interval: 3) do
      namespaces = json!("kubectl", "get", "namespace", "-o", "json")
      namespaces.fetch("items", []).none? do |namespace|
        namespace.dig("metadata", "name").to_s.start_with?("stress-argo-trace-old-") &&
          namespace.dig("metadata", "deletionTimestamp")
      end
    rescue StressHarnessError
      false
    end
  end

  # The secondary root is intentionally quiet. It proves that a healthy root
  # stays readable and that root inference does not require production naming.
  def run_quiet_root_scenarios
    stage_quiet_root!

    output = capture_trace!("single-idle-root", root_name: "stress-argo-trace-old-secondary-root")
    assert_matches(output, /stress-argo-trace-old-secondary-root(?:: idle| \[idle\])/, "single-idle-root")
    assert_excludes(output, "Caveats:", "single-idle-root")
  end

  # The primary root carries the noisy states that tend to break generic traces.
  # The harness keeps them together so a single root trace has to prune and
  # recurse correctly instead of succeeding on a toy single-app world.
  def run_active_root_scenarios
    stage_active_root!

    # On a shared dev cluster, a rootless trace is supposed to walk every live
    # top-level Argo root it can discover, not just this harness. That makes
    # no-root mode a bad live stress input here. Multi-root inference itself is
    # still covered in the fast unit tests; the live harness instead proves that
    # explicit root tracing stays isolated even when more than one stress root
    # exists at once.
    secondary_output = capture_trace!("secondary-root-with-primary-present", root_name: "stress-argo-trace-old-secondary-root")
    assert_matches(secondary_output, /stress-argo-trace-old-secondary-root(?:: idle| \[idle\])/, "secondary-root-with-primary-present")
    assert_excludes(secondary_output, "stress-argo-trace-old-app-of-apps", "secondary-root-with-primary-present")

    # Capture the top-level root while every noisy child branch is still live.
    # The narrower per-app traces below take time, and the hook job can finish
    # while they run. Re-check the Argo graph immediately before this capture
    # so the root scenario is testing the tracer, not an avoidable timing race.
    wait_for_status_resources(
      kind: "applicationset",
      name: "stress-argo-trace-old-app-of-apps",
      expected_names: %w[
        stress-argo-trace-old-broken-pod
        stress-argo-trace-old-broken-statefulset
        stress-argo-trace-old-cluster-scope
        stress-argo-trace-old-hook-job
        stress-argo-trace-old-nested
        stress-argo-trace-old-pvc-pending
      ],
    )
    wait_for_status_resources(
      kind: "applicationset",
      name: "stress-argo-trace-old-nested",
      expected_names: [
        "stress-argo-trace-old-noisy",
        "stress-argo-trace-old-quiet",
      ],
    )
    wait_for_pod_wait_reason("stress-argo-trace-old-noisy", "app=stress-argo-trace-old-noisy")
    nested_output = capture_trace!("nested-active-branch", root_name: "stress-argo-trace-old-app-of-apps")
    assert_includes(nested_output, "stress-argo-trace-old-nested", "nested-active-branch")
    assert_includes(nested_output, "stress-argo-trace-old-noisy", "nested-active-branch")
    assert_excludes(nested_output, "stress-argo-trace-old-secondary-root", "nested-active-branch")

    hook_output = capture_trace!("hook-job-in-progress", root_name: "stress-argo-trace-old-hook-job")
    assert_includes(hook_output, "job/stress-argo-trace-old-presync", "hook-job-in-progress")

    workload_output = capture_trace!("owner-ref-workload-chain", root_name: "stress-argo-trace-old-broken-pod")
    assert_matches(workload_output, %r{replicaset/}, "owner-ref-workload-chain")
    assert_matches(workload_output, %r{pod/}, "owner-ref-workload-chain")
    assert_matches(workload_output, /ImagePullBackOff|ErrImagePull|pulling image/i, "owner-ref-workload-chain")

    statefulset_output = capture_trace!("statefulset-workload-chain", root_name: "stress-argo-trace-old-broken-statefulset")
    assert_includes(statefulset_output, "statefulset/stress-argo-trace-old-broken-statefulset", "statefulset-workload-chain")
    assert_matches(statefulset_output, %r{pod/}, "statefulset-workload-chain")
    assert_matches(statefulset_output, /ImagePullBackOff|ErrImagePull|pulling image/i, "statefulset-workload-chain")

    storage_output = capture_trace!("pvc-pending-workload", root_name: "stress-argo-trace-old-pvc-pending")
    assert_includes(storage_output, "persistentvolumeclaim/stress-argo-trace-old-pvc", "pvc-pending-workload")
    assert_matches(storage_output, %r{pod/}, "pvc-pending-workload")
    assert_matches(storage_output, /PersistentVolumeClaim|persistentvolumeclaim|unbound|storage/i, "pvc-pending-workload")

    cluster_scope_output = capture_trace!("cluster-scope-resource-ref", root_name: "stress-argo-trace-old-cluster-scope")
    assert_includes(cluster_scope_output, "clustertracething/stress-argo-trace-old-cluster-parent", "cluster-scope-resource-ref")
    assert_includes(cluster_scope_output, "clustertracething/stress-argo-trace-old-cluster-child", "cluster-scope-resource-ref")
    assert_includes(cluster_scope_output, "status.conditions.Ready: waiting", "cluster-scope-resource-ref")
    assert_matches(cluster_scope_output, /via=resource-ref/, "cluster-scope-resource-ref")

    # This real Crossplane-core shape is intentionally quiet on apply once the
    # XR and composed resources settle. The live graph proof we care about is
    # the delete-time hold below, where the tracer must walk XR -> managed ->
    # Usage -> managed and stop at the real blocker.
  end

  def stage_quiet_root!
    log("staging quiet root")
    apply_bootstrap!(secondary_bootstrap)
    wait_for_app("stress-argo-trace-old-secondary-idle", sync: "Synced", health: "Healthy")
  end

  def stage_profile_root!
    log("staging profile root")
    stage_quiet_root!
    stage_active_root!(require_active_hook_job: false)
  end

  def stage_active_root!(require_active_hook_job: true)
    log("staging active root")
    apply_bootstrap!(primary_bootstrap)

    wait_for_app("stress-argo-trace-old-broken-pod")
    wait_for_app("stress-argo-trace-old-broken-statefulset")
    wait_for_app("stress-argo-trace-old-pvc-pending")
    wait_for_app("stress-argo-trace-old-cluster-scope")
    wait_for_app("stress-argo-trace-old-hook-job")
    wait_for_app("stress-argo-trace-old-crossplane")
    wait_for_status_resources(kind: "application", name: "stress-argo-trace-old-app-of-apps", expected_names: ["stress-argo-trace-old-app-of-apps"])
    wait_for_status_resources(
      kind: "applicationset",
      name: "stress-argo-trace-old-app-of-apps",
      expected_names: %w[
        stress-argo-trace-old-broken-pod
        stress-argo-trace-old-broken-statefulset
        stress-argo-trace-old-cluster-scope
        stress-argo-trace-old-hook-job
        stress-argo-trace-old-nested
        stress-argo-trace-old-pvc-pending
      ],
    )
    wait_for_app("stress-argo-trace-old-nested", sync: "Synced", health: "Healthy")
    wait_for_status_resources(kind: "application", name: "stress-argo-trace-old-nested", expected_names: ["stress-argo-trace-old-nested"])
    wait_for_status_resources(
      kind: "applicationset",
      name: "stress-argo-trace-old-nested",
      expected_names: [
        "stress-argo-trace-old-noisy",
        "stress-argo-trace-old-quiet",
      ],
    )
    wait_for_app("stress-argo-trace-old-noisy")
    if require_active_hook_job
      wait_for_job_active("stress-argo-trace-old-hook-job", "stress-argo-trace-old-presync")
    else
      wait_for_any_application_resources("stress-argo-trace-old-hook-job")
    end
    wait_for_pod_wait_reason("stress-argo-trace-old-broken-pod", "app=stress-argo-trace-old-broken-pod")
    wait_for_pod_wait_reason("stress-argo-trace-old-broken-statefulset", "app=stress-argo-trace-old-broken-statefulset")
    wait_for_pod_wait_reason("stress-argo-trace-old-noisy", "app=stress-argo-trace-old-noisy")
    wait_for_pod_phase("stress-argo-trace-old-pvc-pending", "app=stress-argo-trace-old-pvc-pending", "Pending")
    wait_for_resource(namespace: "stress-argo-trace-old-pvc-pending", kind: "persistentvolumeclaim", name: "stress-argo-trace-old-pvc")
    wait_for_cluster_resource(kind: "clustertracething", name: "stress-argo-trace-old-cluster-parent")
    wait_for_cluster_resource(kind: "clustertracething", name: "stress-argo-trace-old-cluster-child")
    wait_for_resource(namespace: "stress-argo-trace-old-crossplane", kind: "stressmanagedthing", name: "stress-argo-trace-old-root")
    wait_for_resource(namespace: "stress-argo-trace-old-crossplane", kind: "stressmanagedthing", name: "stress-argo-trace-old-leaf")
    wait_for_any_application_resources("stress-argo-trace-old-broken-pod")
    wait_for_any_application_resources("stress-argo-trace-old-broken-statefulset")
    wait_for_any_application_resources("stress-argo-trace-old-hook-job")
    wait_for_any_application_resources("stress-argo-trace-old-pvc-pending")
    wait_for_any_application_resources("stress-argo-trace-old-cluster-scope")
    wait_for_any_application_resources("stress-argo-trace-old-crossplane")
    wait_for_any_application_resources("stress-argo-trace-old-noisy")
  end

  # Delete-time tracing is where the generic walker usually proves itself or
  # fails. The harness deletes the whole primary root so Argo, Kubernetes, and
  # Crossplane all get a chance to expose their real blocking leaves.
  def run_delete_scenarios
    delete_bootstrap!(primary_bootstrap, wait: false)
    wait_for_resource(namespace: "stress-argo-trace-old-finalizer", kind: "configmap", name: "stress-argo-trace-old-finalizer", deleting: true)
    wait_for_resource(namespace: "stress-argo-trace-old-crossplane", kind: "stressmanagedthing", name: "stress-argo-trace-old-leaf", deleting: true)

    # The app-of-apps recursion is already exercised on the apply side. For the
    # delete-time finalizer case, the sharper check is the app that actually
    # owns the stalled ConfigMap. That keeps this scenario fast and isolates the
    # generic finalizer leaf behavior from unrelated sibling delete churn.
    finalizer_output = capture_trace!("finalizer-delete-stall", root_name: "stress-argo-trace-old-finalizer-stall")
    assert_includes(finalizer_output, "configmap/stress-argo-trace-old-finalizer", "finalizer-delete-stall")
    assert_includes(finalizer_output, "stress.argotrace.test/finalizer", "finalizer-delete-stall")

    crossplane_output = capture_trace!("crossplane-delete-hold", root_name: "stress-argo-trace-old-crossplane")
    assert_includes(crossplane_output, "xstresstrace/stress-argo-trace-old", "crossplane-delete-hold")
    assert_includes(crossplane_output, "stressmanagedthing/stress-argo-trace-old-leaf", "crossplane-delete-hold")
    assert_matches(crossplane_output, /usage\/|via=usage\./, "crossplane-delete-hold")
  ensure
    clear_synthetic_finalizers!
  end

  # rubocop:enable Style/AccessModifierDeclarations, CustomCops/GroupedInlinePrivateMethods
end

StressHarness.new(mode: ARGV.fetch(0, "full")).run!
