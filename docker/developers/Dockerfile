# Web Environment
# ----------------

# Ubuntu 20.04
FROM ubuntu:focal AS cdo-web

ARG USERNAME=cdodev

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Los_Angeles

# Additional required packages
RUN apt-get update \
    && apt-get -y install --no-install-recommends ca-certificates \
    && apt-get -y install --no-install-recommends \
    autoconf gcc g++ bison build-essential libssl-dev libyaml-dev libreadline-dev \
    zlib1g-dev libncurses-dev libffi-dev git git-lfs parallel debian-archive-keyring

# Set the locale
RUN apt-get -y install locales
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && \
    locale-gen
ENV LANG en_US.UTF-8  
ENV LANGUAGE en_US:en  
ENV LC_ALL en_US.UTF-8 

# Set the non-root user for the container and switch
ARG UID
ARG GID
RUN apt-get -y install sudo
RUN groupadd -g ${GID} ${USERNAME} \
    && useradd -r -u ${UID} -g ${USERNAME} --shell /bin/bash --create-home ${USERNAME} \
    && echo "${USERNAME} ALL=NOPASSWD: ALL" >> /etc/sudoers \
    && chown -R ${USERNAME} /usr/local
USER ${USERNAME}

# Install ImageMagick
RUN sudo -E apt-get -y install --no-install-recommends libmagickwand-dev imagemagick

# MySQL Dependencies
RUN sudo -E apt-get -y install --no-install-recommends cmake wget libaio-dev

# Install MySQL Native Client
RUN sudo -E apt-get -y install --no-install-recommends mysql-client-8.0 libmysqlclient-dev

# Install rbenv
RUN sudo -E apt-get -y install rbenv \
    && sudo mkdir -p "/opt/plugins" \
    && mkdir -p /home/${USERNAME}/.rbenv/plugins \
    && sudo chown -R ${USERNAME} /opt/plugins \
    && git clone https://github.com/rbenv/ruby-build.git /opt/plugins/ruby-build \
    && ln -s /opt/plugins/ruby-build /home/${USERNAME}/.rbenv/plugins/ruby-build

# Install Ruby. Also replace the system ruby (required for RubyMine debugging).
ARG RUBY_VERSION=3.0.5
RUN rbenv install ${RUBY_VERSION} \
    && echo -n '\n# rbenv init\neval "$(rbenv init -)"\n' >> ~/.bashrc \
    && rbenv global ${RUBY_VERSION} \
    && sudo rm /usr/bin/ruby \
    && sudo ln -s /home/${USERNAME}/.rbenv/versions/${RUBY_VERSION} /usr/bin/ruby

# Install nvm
ARG NODE_VERSION=18.16.0
ARG NVM_VERSION=0.39.3
ARG NVM_DIR=/home/${USERNAME}/.nvm
RUN cd /home/${USERNAME} && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_VERSION}/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# Install Yarn
ARG YARN_VERSION=1.22.19
RUN . $NVM_DIR/nvm.sh \
    && npm i -g yarn@${YARN_VERSION} \
    && sudo mkdir -p /opt/base-nvm \
    && sudo chown -R ${USERNAME} /opt/base-nvm \
    && cp -r ${NVM_DIR}/* /opt/base-nvm/. \
    && rm -f /opt/base-nvm/README.md \
    && sudo chown -R ${USERNAME} /opt/base-nvm

# Install AWSCLI
RUN cd /home/${USERNAME} \
    && if [ $(uname -m) = "aarch64" ]; then curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"; else curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"; fi \
    && unzip awscliv2.zip \
    && ./aws/install

# Add Ruby binaries to path
RUN echo -n "\n# Add Ruby binaries on path\nexport PATH=\$PATH:/home/${USERNAME}/.rbenv/versions/${RUBY_VERSION}/bin\n" >> ~/.profile

# Install useful utilities for our install scripts
RUN sudo -E apt install -y jq

# Install node-pre-gyp (required for Web packaging)
RUN sudo -E apt install -y node-pre-gyp

# Install debugging tools
RUN sudo -E apt-get -y install gdb rsync lsof

# Install rbspy
RUN cd /home/${USERNAME} \
    && if [ $(uname -m) = "aarch64" ]; then curl -L "https://github.com/rbspy/rbspy/releases/download/v0.12.1/rbspy-aarch64-musl.tar.gz" -o "rbspy.tar.gz"; else curl -L "https://github.com/rbspy/rbspy/releases/download/v0.12.1/rbspy-x86_64-musl.tar.gz" -o "rbspy.tar.gz"; fi \
    && tar -xvf ./rbspy.tar.gz \
    && chmod +x ./rbspy*musl \
    && sudo cp ./rbspy*musl /usr/local/bin

RUN sudo apt-get -y install --no-install-recommends \
    python2

# Make temporary directory and do a bundle install
ARG BUNDLER_VERSION=2.3.22
RUN sudo mkdir -p /app/src
COPY Gemfile /app/src/.
COPY Gemfile.lock /app/src/.
COPY .ruby-version /app/src/.
RUN sudo chown -R ${USERNAME} /app
RUN cd /app/src \
    && eval "$(rbenv init -)" \
    && gem install bundler -v ${BUNDLER_VERSION} \
    && RAILS_ENV=development bundle config set --local without staging production test levelbuilder \
    && RAILS_ENV=development bundle install \
    && sudo cp -r /home/${USERNAME}/.rbenv /opt/base-rbenv \
    && sudo chown -R ${USERNAME} /opt/base-rbenv

# Test Environment
# ----------------

FROM cdo-web AS cdo-test

RUN sudo apt update
RUN sudo apt install -y libgl1-mesa-dev libosmesa6-dev libpci-dev firefox --no-install-recommends

# AWS Access Environment
# ----------------------

#FROM cdo-test AS cdo-aws-access

#RUN sudo apt update
#RUN sudo apt install xvfb x11vnc -y
#COPY bin/vnc-aws-access.sh /app/bin/vnc-aws-access.sh
#RUN sudo chmod +x /app/bin/vnc-aws-access.sh
