# Install https://rbspy.github.io/ to allow manual debugging of ruby performance issues.

ark 'rbspy' do
  url "https://github.com/rbspy/rbspy/releases/download/v0.3.8/#{name}-v0.3.8-x86_64-unknown-linux-musl.tar.gz"
  strip_components 0
  has_binaries ['rbspy']
end
