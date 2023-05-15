# Install https://rbspy.github.io/ to allow manual debugging of ruby performance issues.

ark 'rbspy' do
  url "https://github.com/rbspy/rbspy/releases/download/v0.17.0/#{name}-x86_64-musl.tar.gz"
  strip_components 0
  has_binaries ['rbspy']
end
