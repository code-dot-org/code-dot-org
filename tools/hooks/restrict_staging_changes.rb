require_relative 'hooks_utils.rb'

REPO_DIR = File.expand_path('../../../', __FILE__)

Dir.chdir REPO_DIR
branchname = `git rev-parse --abbrev-ref HEAD`.strip

exit(0) unless branchname == 'staging'
staged_files = HooksUtils.get_staged_files

unless staged_files.empty?
  raise <<ERR
The staging branch is currently LOCKED for Hour of Code.  If you absolutely must
commit to staging, please retry your commit with the --no-verify flag to bypass
this lock.  Otherwise, new changes should go to the staging-next branch.

  d[ o_0 ]b
ERR
end
