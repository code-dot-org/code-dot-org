require_relative './rake_utils'
require_relative '../../deployment'

module TestRunUtils
  def self.run_apps_tests
    Dir.chdir(apps_dir) do
      RakeUtils.system 'npm run test-low-memory'
    end
  end

  def self.run_code_studio_tests
    Dir.chdir(code_studio_dir) do
      RakeUtils.system 'npm run test'
    end
  end

  def self.run_blockly_core_tests
    Dir.chdir(blockly_core_dir) do
      RakeUtils.system './test.sh'
    end
  end

  def self.run_dashboard_tests
    Dir.chdir(dashboard_dir) do
      RakeUtils.rake 'test'
      RakeUtils.rake 'konacha:run'
    end
  end

  def self.run_pegasus_tests
    Dir.chdir(pegasus_dir) do
      RakeUtils.rake 'test'
    end
  end

  def self.run_shared_tests
    Dir.chdir(shared_dir) do
      RakeUtils.rake 'test'
    end
  end

end
