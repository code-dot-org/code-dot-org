#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "open3"
require "pathname"
require "stringio"
require "tmpdir"

load File.expand_path("../../bin/argo-trace", __dir__)

class FakeTtyOutput < StringIO
  def initialize(tty:, width: 91)
    super()
    @tty = tty
    @width = width
  end

  def tty?
    @tty
  end

  def winsize
    [24, @width]
  end
end

class ArgoTraceTest < Minitest::Test
  BIN_DIR = Pathname.new(__dir__).parent.parent / "bin"

  def test_parse_cli_options_defaults_to_one_shot_and_auto_wrap
    options = ArgoTrace.parse_cli_options([])

    assert_nil options[:poll_every]
    assert_equal :auto, options[:soft_wrap]
  end

  def test_parse_cli_options_accepts_poll_every_and_wrap_flags
    options = ArgoTrace.parse_cli_options(["--poll-every", "30s", "--soft-wrap", "88"])

    assert_equal 30, options[:poll_every]
    assert_equal 88, options[:soft_wrap]
  end

  def test_parse_cli_options_disables_wrap
    options = ArgoTrace.parse_cli_options(["--no-wrap"])

    assert_nil options[:soft_wrap]
  end

  def test_parse_duration_accepts_supported_units
    assert_equal 30, ArgoTrace.parse_duration("30s")
    assert_equal 60, ArgoTrace.parse_duration("1m")
    assert_equal 3600, ArgoTrace.parse_duration("1hr")
  end

  def test_render_snapshot_formats_startup_header_and_trailing_newlines
    rendered = ArgoTrace.render_snapshot(
      start_time: Time.parse("2026-04-12T12:33:00-10:00"),
      end_time: Time.parse("2026-04-12T12:33:10-10:00"),
      elapsed_seconds: 10.0,
      body_text: ""
    )

    assert_equal <<~TEXT, rendered
      starting argo-trace @ 12:33p and 0s

      # ArgoCD dependency tree @ 12:33p and 10s, argo-trace took 10.0s


    TEXT
  end

  def test_render_snapshot_uses_tty_width_for_auto_wrap
    output = FakeTtyOutput.new(tty: true, width: 123)
    assert_equal 123, ArgoTrace.wrap_width_for_snapshot({soft_wrap: :auto}, output: output)
  end

  def test_soft_wrap_rendered_lines_wraps_tree_content_with_hanging_indent
    wrapped = ArgoTrace.soft_wrap_rendered_lines(
      ["- this line wraps nicely"],
      wrap_width: 12
    )

    assert_equal ["- this line", "  wraps", "  nicely"], wrapped
  end

  def test_soft_wrap_rendered_lines_keeps_ansi_control_lines_and_arrow_alignment
    wrapped = ArgoTrace.soft_wrap_rendered_lines(
      ["\e[1m", "→ - bad leaf detail happened badly", "\e[22m"],
      wrap_width: 20
    )

    assert_equal "\e[1m", wrapped.first
    assert_equal "→ -", wrapped[1][0, 3]
    assert_equal "    happened badly", wrapped[2]
    assert_equal "\e[22m", wrapped.last
  end

  def test_snapshot_body_applies_soft_wrap_to_real_tree_output
    body_text = ArgoTrace.snapshot_body(
      command_runner: fixture_command_runner,
      wrap_width: 55
    )

    assert_includes body_text, "- app-of-apps (Application) [sync.status=Synced,"
    assert_includes body_text, "  health.status=Healthy,"
  end

  def test_snapshot_body_respects_no_wrap
    body_text = ArgoTrace.snapshot_body(
      command_runner: fixture_command_runner,
      wrap_width: nil
    )

    assert_includes body_text, "- app-of-apps (Application) [sync.status=Synced, health.status=Healthy, status.operationState.phase=Succeeded]"
  end

  def test_run_executes_once_without_polling
    output = StringIO.new
    times = [
      Time.parse("2026-04-12T12:33:00-10:00"),
      Time.parse("2026-04-12T12:33:05-10:00"),
    ]
    body_calls = 0
    sleeps = []

    ArgoTrace.run(
      {poll_every: nil, soft_wrap: :auto},
      output: output,
      now: -> {times.shift},
      sleep_proc: ->(seconds) {sleeps << seconds},
      body: ->(**) {body_calls += 1; ""}
    )

    assert_equal 1, body_calls
    assert_equal [], sleeps
    assert_equal 1, output.string.scan(/^starting argo-trace @ /).length
  end

  def test_run_uses_start_time_for_startup_line_and_end_time_for_header_line
    output = StringIO.new
    times = [
      Time.parse("2026-04-12T11:59:58-10:00"),
      Time.parse("2026-04-12T12:00:03-10:00"),
    ]

    ArgoTrace.run(
      {poll_every: nil, soft_wrap: :auto},
      output: output,
      now: -> {times.shift},
      body: ->(**) {"body"}
    )

    assert_includes output.string, "starting argo-trace @ 11:59a and 58s\n"
    assert_includes output.string, "# ArgoCD dependency tree @ 12:00p and 3s, argo-trace took 5.0s\n"
  end

  def test_run_measures_elapsed_across_body_generation
    output = StringIO.new
    times = [
      Time.parse("2026-04-12T12:33:00-10:00"),
      Time.parse("2026-04-12T12:33:07-10:00"),
    ]
    body_wrap_widths = []

    ArgoTrace.run(
      {poll_every: nil, soft_wrap: :auto},
      output: output,
      now: -> {times.shift},
      body: ->(wrap_width:) {body_wrap_widths << wrap_width; "generated body"}
    )

    assert_equal [150], body_wrap_widths
    assert_includes output.string, "argo-trace took 7.0s"
  end

  def test_run_polls_until_max_snapshots_in_test_mode
    output = StringIO.new
    times = [
      Time.parse("2026-04-12T12:33:00-10:00"),
      Time.parse("2026-04-12T12:33:01-10:00"),
      Time.parse("2026-04-12T12:33:30-10:00"),
      Time.parse("2026-04-12T12:33:32-10:00"),
    ]
    sleeps = []

    ArgoTrace.run(
      {poll_every: 30, soft_wrap: :auto},
      output: output,
      now: -> {times.shift},
      sleep_proc: ->(seconds) {sleeps << seconds},
      body: ->(**) {""},
      max_snapshots: 2
    )

    assert_equal [30], sleeps
    assert_equal 2, output.string.scan(/^starting argo-trace @ /).length
  end

  def test_run_without_body_uses_real_snapshot_pipeline
    output = StringIO.new

    ArgoTrace.run(
      {poll_every: nil, soft_wrap: :auto},
      output: output,
      now: -> {Time.parse("2026-04-12T12:33:10-10:00")},
      command_runner: fixture_command_runner
    )

    assert_includes output.string, "- app-of-apps (Application)"
    assert_includes output.string, "  - app-of-apps (ApplicationSet) [all conditions good]"
  end

  def test_run_without_body_matches_expected_full_snapshot_text
    output = StringIO.new
    times = [
      Time.parse("2026-04-12T12:32:40-10:00"),
      Time.parse("2026-04-12T12:33:10-10:00"),
    ]

    ArgoTrace.run(
      {poll_every: nil, soft_wrap: nil},
      output: output,
      now: -> {times.shift},
      command_runner: fixture_command_runner
    )

    assert_equal expected_run_snapshot_text(
      start_clock: "12:32p and 40s",
      end_clock: "12:33p and 10s"
    ), output.string
  end

  def test_run_without_body_preserves_polling_separator_behavior
    output = StringIO.new
    times = [
      Time.parse("2026-04-12T12:32:40-10:00"),
      Time.parse("2026-04-12T12:33:10-10:00"),
      Time.parse("2026-04-12T12:33:40-10:00"),
      Time.parse("2026-04-12T12:34:10-10:00"),
    ]
    sleeps = []

    ArgoTrace.run(
      {poll_every: 30, soft_wrap: nil},
      output: output,
      now: -> {times.shift},
      sleep_proc: ->(seconds) {sleeps << seconds},
      command_runner: fixture_command_runner,
      max_snapshots: 2
    )

    expected = expected_run_snapshot_text(
      start_clock: "12:32p and 40s",
      end_clock: "12:33p and 10s"
    ) + expected_run_snapshot_text(
      start_clock: "12:33p and 40s",
      end_clock: "12:34p and 10s"
    )
    assert_equal expected, output.string
    assert_equal [30], sleeps
  end

  def test_argo_trace_uses_bundle_exec_shebang
    assert_equal "#!/usr/bin/env -S bundle exec ruby\n", (BIN_DIR / "argo-trace").readlines.first
  end

  def test_watch_argo_trace_wraps_script_under_watch
    contents = (BIN_DIR / "watch-argo-trace").read

    assert_equal "#!/usr/bin/env -S bundle exec ruby\n", contents.lines.first
    assert_includes contents, 'Shellwords.join(["bundle", "exec", script, *ARGV])'
    assert_includes contents, 'exec("watch", "--color", command)'
  end

  def test_real_executable_path_renders_tree_body_from_saved_fixture_data
    output, status = run_script_with_fake_cli(BIN_DIR / "argo-trace")

    assert status.success?, output
    assert_includes output, "# ArgoCD dependency tree @ "
    assert_includes output, "- app-of-apps (Application)"
    assert_includes output, "  - app-of-apps (ApplicationSet) [all conditions good]"
  end

  def test_watch_wrapper_executes_real_trace_command_in_fake_watch
    output, status = run_script_with_fake_cli(BIN_DIR / "watch-argo-trace", include_watch: true)

    assert status.success?, output
    assert_includes output, "- app-of-apps (Application)"
  end

  private def fixture_command_runner
    fixture_dir = Pathname.new(__dir__) / "fixtures" / "argo-cli-data"

    lambda do |*command, **_kwargs|
      if command == ArgoTrace::WAVE1_APPSET_LIST_COMMAND
        (fixture_dir / "appset-list.yaml").read
      elsif command == ArgoTrace::WAVE1_APP_LIST_COMMAND
        (fixture_dir / "app-list.yaml").read
      elsif command[0, 4] == ["argocd", "--core", "appset", "get"] && command[-2, 2] == ["-o", "yaml"]
        (fixture_dir / "appset-get-#{command[4]}.yaml").read
      elsif command[0, 6] == ["argocd", "--core", "--app-namespace", "argocd", "app", "get"] &&
          command[-2, 2] == ["-o", "yaml"]
        (fixture_dir / "app-get-#{command[6]}.yaml").read
      else
        raise "unexpected command: #{command.inspect}"
      end
    end
  end

  private def run_script_with_fake_cli(script_path, include_watch: false)
    Dir.mktmpdir("argo-trace-test") do |temp_dir|
      bin_dir = Pathname.new(temp_dir) / "bin"
      bin_dir.mkpath
      write_fake_argocd(bin_dir / "argocd")
      write_fake_watch(bin_dir / "watch") if include_watch

      env = {
        "PATH" => "#{bin_dir}:#{ENV.fetch('PATH')}",
        "ARGO_CLI_TRACE_FIXTURE_DIR" => (Pathname.new(__dir__) / "fixtures" / "argo-cli-data").to_s,
      }
      Open3.capture2e(env, script_path.to_s, chdir: script_path.dirname.to_s)
    end
  end

  private def expected_run_snapshot_text(start_clock:, end_clock:)
    <<~TEXT.delete_suffix("\n") + "\n\n\n"
      starting argo-trace @ #{start_clock}

      # ArgoCD dependency tree @ #{end_clock}, argo-trace took 30.0s

      #{expected_fixture_body_text}
    TEXT
  end

  private def expected_fixture_body_text
    expected_fixture_output.lines.drop(4).join.chomp
  end

  private def expected_fixture_output
    (Pathname.new(__dir__) / "expected-output-from-argo-trace-given-data-responses.txt").read
  end

  private def write_fake_argocd(path)
    path.write(<<~SH)
      #!/bin/sh
      fixture_dir="$ARGO_CLI_TRACE_FIXTURE_DIR"
      if [ "$1" = "--core" ] && [ "$2" = "appset" ] && [ "$3" = "list" ] && [ "$4" = "-o" ] && [ "$5" = "yaml" ]; then
        exec cat "$fixture_dir/appset-list.yaml"
      fi

      if [ "$1" = "--core" ] && [ "$2" = "--app-namespace" ] && [ "$3" = "argocd" ] && [ "$4" = "app" ] && [ "$5" = "list" ] && [ "$6" = "-o" ] && [ "$7" = "yaml" ]; then
        exec cat "$fixture_dir/app-list.yaml"
      fi

      if [ "$1" = "--core" ] && [ "$2" = "appset" ] && [ "$3" = "get" ] && [ "$5" = "-o" ] && [ "$6" = "yaml" ]; then
        exec cat "$fixture_dir/appset-get-$4.yaml"
      fi

      if [ "$1" = "--core" ] && [ "$2" = "--app-namespace" ] && [ "$3" = "argocd" ] && [ "$4" = "app" ] && [ "$5" = "get" ] && [ "$7" = "-o" ] && [ "$8" = "yaml" ]; then
        exec cat "$fixture_dir/app-get-$6.yaml"
      fi

      echo "unexpected argocd command: $*" >&2
      exit 1
    SH
    path.chmod(0o755)
  end

  private def write_fake_watch(path)
    path.write(<<~SH)
      #!/bin/sh
      [ "$1" = "--color" ] && shift
      eval "exec $1"
    SH
    path.chmod(0o755)
  end
end
