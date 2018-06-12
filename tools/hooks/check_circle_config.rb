#!/usr/bin/env ruby
# `pre-push` Git hook to ensure the latest Circle config is on the branch to be pushed.

REPO_DIR = File.expand_path('../../../', __FILE__)
require_relative "#{REPO_DIR}/lib/cdo/git_utils"

# Prints a warning message and exits the hook early with success.
def skip(msg)
  $stderr.puts "WARN: Skipping Circle config check: #{msg}."
  exit 0
end

# Ref: https://git-scm.com/docs/githooks#_pre_push
# "The hook is called with two parameters which provide the name and location of the destination remote"
remote, _remote_url = ARGV

# "Information about what is to be pushed is provided on the hook’s standard input with lines of the form:"
# `<local ref> SP <local sha1> SP <remote ref> SP <remote sha1> LF`
pushes = STDIN.readlines
skip "Pushing multiple (#{pushes.count}) refs" unless pushes.one?
push = pushes.first
local_ref, _local_sha1, _remote_ref, _remote_sha1 = push.split(' ')

skip "Not a branch: #{local_ref}" unless local_ref.start_with?('refs/heads/')
branch = local_ref.sub 'refs/heads/', ''
skip "Not the current branch: #{branch}" unless branch == GitUtils.current_branch

# GitUtils are currently hard-coded to the `origin` remote, so skip check if pushing elsewhere.
skip "Not pushing to `origin` remote: #{remote}" unless remote == 'origin'

GitUtils.ensure_latest_circle_yml
