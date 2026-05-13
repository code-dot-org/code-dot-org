# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.191.1/containers/ruby/.devcontainer/base.Dockerfile

# [Choice] Ruby version: 3, 3.3, 3.2, 3.1, 3.0, 2, 2.7, 2.6
ARG VARIANT="3.2"
FROM mcr.microsoft.com/devcontainers/ruby:${VARIANT}

# Install packages required for Code.org
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends libpq-dev \
        ffmpeg mupdf mupdf-tools libvips-dev poppler-utils \
        libxml2-dev sqlite3 imagemagick \
        libmagickcore-dev pipx git-lfs mariadb-client

RUN chown -R vscode:vscode /usr/local/rvm

# Refresh ruby-build's known versions so recent Ruby patch releases resolve.
# Done as root since /usr/local/share/ruby-build is root-owned.
RUN git -C /usr/local/share/ruby-build pull

# Rootless user command execution
USER vscode

# Pin Ruby to match .ruby-version
ENV PATH="/home/vscode/.rbenv/shims:$PATH"
RUN rbenv install 3.2.11
RUN rbenv global 3.2.11

# Add the Rails main Gemfile and install the gems. This means the gem install can be done
# during build instead of on start. When a fork or branch has different gems, we still have an
# advantage due to caching of the other gems.
RUN gem install bundler
# Skip gem groups external contributors don't need; also avoids building
# mini_racer / libv8-node, which fails on aarch64 with the trixie-default Python 3.13.
RUN bundle config --global without 'staging test production levelbuilder'
RUN mkdir -p /tmp/rails
COPY --chown=vscode:vscode Gemfile Gemfile.lock /tmp/rails/

RUN cd /tmp/rails \
    && bundle install \
    && rm -rf /tmp/rails

# Install PDM via pipx (Debian trixie's system Python is PEP 668-managed,
# so a plain `pip install` is refused; pipx installs into a per-app venv
# and links binaries into ~/.local/bin).
RUN pipx install pdm

# Instantiate Git LFS
WORKDIR /workspaces
RUN git lfs install