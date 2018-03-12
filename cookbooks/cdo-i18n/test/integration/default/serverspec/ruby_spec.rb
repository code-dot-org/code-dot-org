require 'serverspec'
set :backend, :exec

def file_exist(file)
  describe file(file) do
    it {should exist}
  end
end

def package_installed(package)
  describe package(package) do
    it {should be_installed}
  end
end

def cmd(exec, match)
  describe command(exec) do
    its(:stdout) {should match match}
  end
end

file_exist '/etc/apt/sources.list.d/crowdin.list'
package_installed 'crowdin'
cmd 'crowdin --version', 'Crowdin CLI version is 2.0.22'
