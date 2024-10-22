# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.191.1/containers/ruby/.devcontainer/base.Dockerfile

# [Choice] Ruby version: 3, 3.3, 3.2, 3.1, 3.0, 2, 2.7, 2.6
ARG VARIANT="3.0"
FROM mcr.microsoft.com/devcontainers/ruby:${VARIANT}

# Install packages required for Code.org
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends libpq-dev \
        ffmpeg mupdf mupdf-tools libvips-dev poppler-utils \
        libxml2-dev sqlite3 imagemagick \
        libmagickcore-dev python3-pip git-lfs mariadb-client

RUN chown -R vscode:vscode /usr/local/rvm

# Rootless user command execution
USER vscode

############################
# Force Ruby to 3.0.5      #
# Remove after 3.3 upgrade #
############################
ENV PATH="/home/vscode/.rbenv/shims:$PATH"
RUN rbenv install 3.0.5
RUN rbenv global 3.0.5

# Add the Rails main Gemfile and install the gems. This means the gem install can be done
# during build instead of on start. When a fork or branch has different gems, we still have an
# advantage due to caching of the other gems.
RUN gem install bundler
RUN mkdir -p /tmp/rails
COPY --chown=vscode:vscode Gemfile Gemfile.lock /tmp/rails/

RUN cd /tmp/rails \
    && bundle install \
    && rm -rf /tmp/rails

# Install PDM
RUN pip install --user pdm

# Instantiate Git LFS
WORKDIR /workspaces
RUN git lfs install