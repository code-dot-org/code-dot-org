#!/usr/bin/env ruby
# frozen_string_literal: true

require "fileutils"
require "minitest/autorun"
require "open3"
require "tmpdir"

class LoggedTofuTest < Minitest::Test
  SOURCE_DIR = File.expand_path("..", __dir__)
  LOGGED_TOFU = File.join(SOURCE_DIR, "bin", "logged-tofu")

  def test_destroy_writes_logs_and_passes_extra_args_to_tofu
    with_fake_module do |module_dir, fake_bin|
      args_file = File.join(module_dir, "tofu-args.txt")
      env = {
        "PATH" => "#{fake_bin}:#{ENV.fetch('PATH')}",
        "FAKE_TOFU_ARGS_FILE" => args_file,
      }

      stdout, stderr, status = Open3.capture3(
        env,
        File.join(module_dir, "bin", "logged-tofu"),
        "destroy",
        "-refresh=false",
        "-target=module.foo",
      )

      assert status.success?, stderr

      first_lines = stdout.lines.first(3).map(&:strip)
      assert_match(%r{\Atail -n \+1 -f .*/logs/tofu-.*-destroy\.log\z}, first_lines[0])
      assert_match(%r{\Atail -n \+1 -f .*/tofu\.log\z}, first_lines[1])
      assert_match(%r{\Atail -n \+1 -f .*/logs/argocd-destroy-.*\.log\.md\z}, first_lines[2])

      assert_equal "destroy -refresh=false -target=module.foo", File.read(args_file).strip

      run_log = Dir.glob(File.join(module_dir, "logs", "tofu-*-destroy.log")).fetch(0)
      argocd_log = Dir.glob(File.join(module_dir, "logs", "argocd-destroy-*.log.md")).fetch(0)

      assert_includes File.read(run_log), "===== START OF TOFU DESTROY RUN ====="
      assert_includes File.read(run_log), "[meta] argocd-log=#{argocd_log}"
      assert_equal "## fake trace\n", File.read(argocd_log)
    end
  end

  def test_plan_is_rejected
    stdout, stderr, status = Open3.capture3(LOGGED_TOFU, "plan")

    refute status.success?
    assert_match(/usage: .*logged-tofu <apply\|destroy> \[extra tofu args\.\.\.\]/, stderr + stdout)
  end

  private def with_fake_module
    Dir.mktmpdir("logged-tofu-test") do |tmpdir|
      module_dir = File.join(tmpdir, File.basename(tmpdir))
      bin_dir = File.join(module_dir, "bin")
      fake_bin = File.join(tmpdir, "fake-bin")

      FileUtils.mkdir_p(bin_dir)
      FileUtils.mkdir_p(fake_bin)
      FileUtils.cp(LOGGED_TOFU, File.join(bin_dir, "logged-tofu"))
      FileUtils.chmod("+x", File.join(bin_dir, "logged-tofu"))

      write_executable(File.join(bin_dir, "logged-tofu-stop"), <<~SH)
        #!/bin/sh
        exit 0
      SH

      write_executable(File.join(bin_dir, "argo-trace"), <<~RUBY)
        #!/usr/bin/env ruby
        puts "## fake trace"
      RUBY

      write_fake_commands(fake_bin)
      yield module_dir, fake_bin
    end
  end

  private def write_fake_commands(fake_bin)
    write_executable(File.join(fake_bin, "kubectl"), <<~SH)
      #!/bin/sh
      exit 0
    SH

    write_executable(File.join(fake_bin, "stdbuf"), <<~SH)
      #!/bin/sh
      while [ $# -gt 0 ]; do
        case "$1" in
          -o*|-e*)
            shift
            ;;
          *)
            break
            ;;
        esac
      done
      exec "$@"
    SH

    write_executable(File.join(fake_bin, "ts"), <<~SH)
      #!/bin/sh
      cat
    SH

    write_executable(File.join(fake_bin, "script"), <<~SH)
      #!/bin/sh
      while [ $# -gt 0 ]; do
        if [ "$1" = "-c" ]; then
          shift
          exec /bin/sh -c "$1"
        fi
        shift
      done
      exit 2
    SH

    write_executable(File.join(fake_bin, "tofu"), <<~SH)
      #!/bin/sh
      printf '%s\\n' "$*" > "$FAKE_TOFU_ARGS_FILE"
      printf 'fake tofu complete\\n'
    SH
  end

  private def write_executable(path, content)
    File.write(path, content)
    FileUtils.chmod("+x", path)
  end
end
