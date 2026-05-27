require_relative 'hooks_utils'

# Warn (do not block) when a commit touches .gitattributes. Changing Git LFS
# rules does not rewrite already-committed blobs, so the committer should run
# `git add --renormalize .` to reconcile files with their new attributes and
# include any conversions in the same commit. CI (bin/drone/check-lfs-pointers)
# is the enforcing backstop; this is just a nudge at the right moment.
def main
  touched = HooksUtils.get_staged_files.any? {|f| File.basename(f) == '.gitattributes'}
  return unless touched

  # Bold red, but only when stderr is a terminal -- avoid escape codes in logs.
  red = $stderr.tty? ? "\e[1;31m" : ''
  reset = $stderr.tty? ? "\e[0m" : ''
  warn <<~MSG
    #{red}ACTION REQUIRED: this commit touches .gitattributes. If you changed any Git LFS
    rules, run the following command and include the result in the same commit:
        git add --renormalize .#{reset}
  MSG
end

main
