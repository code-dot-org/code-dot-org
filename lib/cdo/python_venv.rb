require 'pty'

module PythonVenv
  def self.install(*args)
    flags = if ENV['CI']
              '--dev --frozen'
            elsif rack_env? :production
              '--no-dev --frozen'
            elsif rack_env? :test
              '--dev --frozen'
            else # staging, adhocs, local environments
              '--dev'
            end

    uv 'sync', flags, *args
  end

  def self.lint(*args)
    run 'ruff check', *args
  end

  def self.lint_command
    'uv run ruff check'
  end

  def self.python_bin_path
    `uv run which python`.strip
  end

  def self.site_packages_path
    `uv run python -c 'import site; print(site.getsitepackages()[0])'`.strip
  end

  def self.run(*args)
    uv 'run', *args
  end

  def self.pytest(*args)
    run 'pytest', *args
  end

  def self.uv(*args)
    if `which uv` == ''
      raise 'Tried `which uv`: uv not found. Please install uv and try again, see SETUP.md.'
    end

    _run_command('uv', *args)
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
