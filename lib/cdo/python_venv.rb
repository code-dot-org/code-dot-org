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
    run 'which python'
  end

  def self.site_packages_path
    run "python -c 'import site; print(site.getsitepackages()[0])'"
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
      error = RuntimeError.new("'#{command}' returned #{status}")
      raise error, error.message, CDO.filter_backtrace([output])
    end

    output.strip
  end
end
