require 'open-uri'
require 'json'
require 'fileutils'

module EyesUtils
  EYES_ACCESS_KEY_ENV_NAME = 'EYES_ACCESS_KEY'.freeze
  TMP_UTIL_DIR = File.expand_path('../../../.tmputils', __FILE__).freeze

  MERGE_UTIL_PATH = "#{TMP_UTIL_DIR}/applitools-merge.jar".freeze
  REMOTE_JAR_SOURCE = 'https://s3.amazonaws.com/cdo-circle-utils/applitools-merge.jar'.freeze
  EYES_API_URL = "https://eyes.applitools.com/api/baselines/copybranch?accesskey=$#{EYES_ACCESS_KEY_ENV_NAME}".freeze
  BASE_MERGE_UTIL_CALL = "java -jar #{MERGE_UTIL_PATH} -url #{EYES_API_URL}".freeze

  def self.check_eyes_set
    raise "Must export env var $#{EYES_ACCESS_KEY_ENV_NAME} to run eyes commands." unless ENV[EYES_ACCESS_KEY_ENV_NAME]
  end

  def self.ensure_merge_util
    java_version_output = `java -version 2>&1`
    raise "Applitools merge util requires Java 1.8 #{Emoji.find_by_alias('sweat_smile').raw}" unless java_version_output =~ /version "1\.8/
    unless File.exist? MERGE_UTIL_PATH
      Kernel.system("wget #{REMOTE_JAR_SOURCE} -O #{MERGE_UTIL_PATH}")
    end
  end

  def self.merge_eyes_baselines(branch, base)
    ensure_merge_util
    Kernel.system("#{BASE_MERGE_UTIL_CALL} -n Code.org -s #{branch} -t #{base}")
  end

  def self.force_merge_eyes_baselines(branch, base)
    ensure_merge_util
    Kernel.system("#{BASE_MERGE_UTIL_CALL} -n Code.org -o true -s #{branch} -t #{base}")
  end

  def self.copy_eyes_baselines(branch, base)
    ensure_merge_util
    Kernel.system("#{BASE_MERGE_UTIL_CALL} -n Code.org -c true -s #{branch} -t #{base}")
  end

  def self.force_copy_eyes_baselines(branch, base)
    ensure_merge_util
    Kernel.system("#{BASE_MERGE_UTIL_CALL} -n Code.org -o true -c true -s #{branch} -t #{base}")
  end

  def self.delete_eyes_branch(branch)
    ensure_merge_util
    Kernel.system("#{BASE_MERGE_UTIL_CALL} -n Code.org -s #{branch} -t #{branch} -d true")
  end

  def self.merge_delete_eyes_branch(branch, base)
    ensure_merge_util
    Kernel.system("#{BASE_MERGE_UTIL_CALL} -n Code.org -s #{branch} -t #{base} -d true")
  end
end
