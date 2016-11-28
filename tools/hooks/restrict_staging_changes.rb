require_relative 'hooks_utils.rb'

REPO_DIR = File.expand_path('../../../', __FILE__)
SCHEMA_CACHE_DUMP = File.expand_path(REPO_DIR + '/dashboard/db/schema_cache.dump', __FILE__)
COOKBOOKS_DIR = File.expand_path(REPO_DIR + '/cookbooks', __FILE__)
ERROR_MESSAGE = <<ERR
Commit blocked!

The staging branch is currently LOCKED for Hour of Code.  If you absolutely must
commit to staging, please retry your commit with the --no-verify flag to bypass
this lock.  Otherwise, new changes should go to the staging-next branch.

  d[ o_0 ]b

ERR

Dir.chdir REPO_DIR
branchname = `git rev-parse --abbrev-ref HEAD`.strip

exit(0) unless branchname == 'staging'
staged_files = HooksUtils.get_staged_files

staged_files.each do |filename|
  # Allow schema_cache.dump file, which gets automatically committed by staging.
  next if filename == SCHEMA_CACHE_DUMP

  # Allow changes to cookbooks, which get automatically committed by staging.
  next if filename.start_with?(COOKBOOKS_DIR)

  raise ERROR_MESSAGE
end
