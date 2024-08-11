require_relative './venv'

module Python
  module LoadPyCall
    # Loads PyCall pointing to the correct Python Venv, courtesy of `pdm`.
    # Should not be invoked from outside this module for thread-safety reasons.
    def self.load_pycall
      # Cronjobs load rails with pwd outside the repo, which breaks pdm assumptions,
      # so we cd into the repo root first to ensure we find the venv.
      Dir.chdir(File.expand_path('../../', __dir__)) do
        # Snag this /before/ PyCall fiddles with PYTHONHOME:
        site_packages_path = Python::Venv.site_packages_path

        ENV['PYTHON'] = Python::Venv.python_bin_path
        unless File.exist? ENV['PYTHON']
          raise "Python bin not found at #{ENV['PYTHON']}. Please run `pdm install` again."
        end

        require 'pycall'

        # Python initializes its site-packages directory using site.py:
        # https://github.com/python/cpython/blob/main/Lib/site.py
        # Which looks for pyenv.cfg relative to sys.executable, and uses that to properly
        # initialize the site-packages directory. Because pycall.rb uses libpython,
        # sys.executable is set to the ruby interpreter, and site.py doesn't properly
        # add site-packages for our venv to the sys.path. So, we do it manually:
        site = PyCall.import_module 'site'
        site.addsitedir(site_packages_path)

        # Now that we've done an import, unset PYTHON & PYTHONHOME so we don't
        # mess up python3-using apps launched from our Ruby processes (like the aws cli)
        # see: https://github.com/code-dot-org/code-dot-org/pull/60048#issuecomment-2267510208
        ENV.delete('PYTHONHOME')
        ENV.delete('PYTHON')
      end
    end
  end
end
