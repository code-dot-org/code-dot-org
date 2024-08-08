require 'pty'

module PythonVenv
  def self.install(*args)
    # --dev: install dev deps
    # --prod: don't install dev deps
    # --frozen-lockfile: don't update the lockfile
    # --check: fail if lockfile is not up-to-date
    flags = if ENV['CI']
              '--dev --frozen-lockfile --check'
            elsif rack_env? :production
              '--prod --frozen-lockfile'
            elsif rack_env? :test
              '--dev --frozen-lockfile --check'
            else # staging, adhocs, local environments
              '--dev'
            end

    pdm 'install', flags, *args
  end

  def self.lint(*args)
    run 'ruff check', *args
  end

  def self.lint_command
    'pdm run ruff check'
  end

  def self.python_bin_path
    `pdm run which python`.strip
  end

  def self.site_packages_path
    `pdm run python -c 'import site; print(site.getsitepackages()[0])'`.strip
  end

  def self.run(*args)
    pdm 'run', *args
  end

  def self.pdm(*args)
    if `which pdm` == ''
      raise 'Tried `which pdm`: pdm not found. Please install pdm and try again, see SETUP.md.'
    end

    _run_command('pdm', *args)
  end

  def self.run_python_block(args_dict:, &block)
    Tempfile.open do |out_file|
      Tempfile.open do |in_file|
        in_file.write(args_dict.to_json)
        in_file.fsync
        pycode = <<~PYTHON
          from pycdo.json import read_json, write_json
          _return = lambda _: write_json('#{out_file.path}', _)
          #{yield("read_json('#{in_file.path}')")}
        PYTHON
        single_line_pycode = '"' + pycode.split("\n").join(';') + '"'
        run('python', '-c', single_line_pycode)
      end
      JSON.parse(File.read(out_file.path))
    end
  end

  def self._run_command(*args)
    command = args.map(&:to_s).join(' ')
    CDO.log.info command

    output = ""
    IO.popen(command) do |io|
      io.each_line do |line|
        puts line if ENV['RAKE_VERBOSE']
        output << line
      end
    end

    unless $?.exitstatus == 0
      error = RuntimeError.new("'#{command}' returned #{$?.exitstatus}")
      raise error, error.message, CDO.filter_backtrace([output])
    end

    output.strip
  end
end
