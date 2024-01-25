describe command('git lfs --version') do
  its(:exit_status) {should eq 0}
  # we require git-lfs >= 3 for ssh support
  its(:stdout) {should match('git-lfs/[3-9]')}
end
