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

# Add Ruby binaries to path
RUN echo -n "\n# Add Ruby binaries on path\nexport PATH=\$PATH:/home/${USERNAME}/.rbenv/versions/${RUBY_VERSION}/bin\n" >> ~/.profile

# Install node-pre-gyp (required for Web packaging)
RUN sudo -E apt install -y --no-install-recommends node-pre-gyp

# Install python2 which might be required by some dependencies during their compilation
RUN sudo -E apt install -y --no-install-recommends python2

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

# Install python and pdm
RUN sudo apt update
RUN sudo -E apt-get -y install python3-pip python3-venv
RUN sudo curl -sSL https://pdm-project.org/install-pdm.py | python3 -

# Add pdm binaries to path
RUN echo -n "\n# Add pdm binaries on path\nexport PATH=\$PATH:/home/${USERNAME}/.local/bin\n" >> ~/.bashrc

# Development Environment
# -----------------------

FROM cdo-web AS cdo-web-dev

# Install ffmpeg for audio processing for local bucket population
RUN sudo apt-get update
RUN sudo -E apt install -y --no-install-recommends ffmpeg

# Install useful editors
RUN sudo -E apt install -y --no-install-recommends vim emacs

# Install useful shells and utilities
RUN sudo -E apt install -y --no-install-recommends tmux bash zsh

# Install useful utilities for our install scripts
RUN sudo -E apt install -y --no-install-recommends jq

# Install debugging tools
RUN sudo -E apt-get -y install gdb rsync lsof

# Install rbspy
RUN cd /home/${USERNAME} \
    && if [ $(uname -m) = "aarch64" ]; then curl -L "https://github.com/rbspy/rbspy/releases/download/v0.12.1/rbspy-aarch64-musl.tar.gz" -o "rbspy.tar.gz"; else curl -L "https://github.com/rbspy/rbspy/releases/download/v0.12.1/rbspy-x86_64-musl.tar.gz" -o "rbspy.tar.gz"; fi \
    && tar -xvf ./rbspy.tar.gz \
    && chmod +x ./rbspy*musl \
    && sudo cp ./rbspy*musl /usr/local/bin

# Install AWSCLI
RUN cd /home/${USERNAME} \
    && if [ $(uname -m) = "aarch64" ]; then curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"; else curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"; fi \
    && unzip awscliv2.zip \
    && ./aws/install

# Generate the HTTPS self-signed certificates, just in case we start with HTTPS
RUN sudo mkdir /var/keys
RUN sudo chown -R ${USERNAME} /var/keys
RUN openssl genrsa 2048 > /var/keys/server.key
RUN chmod 400 /var/keys/server.key
RUN openssl req -new -x509 -nodes -sha256 -days 365 -key /var/keys/server.key -subj '/CN=cdo-self-signed-cert/C=SK/' -out /var/keys/server.crt

# Allow the 'home' volume to get mounted which is where we persist things like
# bash / irb history and such for different contexts.
# Your containers can mount /mnt/home to separate volumes to retain separate histories.
RUN sudo mkdir -p /mnt/home
RUN sudo chown -R ${USERNAME} /mnt/home
RUN touch /mnt/home/.bash_history
RUN touch /mnt/home/.zsh_history
RUN touch /mnt/home/.irb_history
RUN rm -f $HOME/.bash_history
RUN rm -f $HOME/.irb_history
RUN rm -f $HOME/.zsh_history
RUN ln -s /mnt/home/.bash_history $HOME/.bash_history
RUN ln -s /mnt/home/.zsh_history $HOME/.zsh_history
RUN ln -s /mnt/home/.irb_history $HOME/.irb_history

# Test Environment
# ----------------

FROM cdo-web AS cdo-test

RUN sudo apt update
RUN sudo apt install -y libgl1-mesa-dev libosmesa6-dev libpci-dev firefox --no-install-recommends
RUN sudo apt install -y ssh --no-install-recommends

# Generate a key and allow it to connect to any of our containers
RUN mkdir /home/cdodev/.ssh
RUN ssh-keygen -f /home/cdodev/.ssh/id_rsa
RUN cp /home/cdodev/.ssh/id_rsa.pub /home/cdodev/.ssh/authorized_keys

USER 0
RUN echo 'PubkeyAuthentication yes' >> /etc/ssh/sshd_config
RUN echo 'PasswordAuthentication no' >> /etc/ssh/sshd_config
RUN echo 'StrictHostKeyChecking no' >> /etc/ssh/ssh_config
USER ${USERNAME}

# AWS Access Environment
# ----------------------

#FROM cdo-test AS cdo-aws-access

#RUN sudo apt update
#RUN sudo apt install xvfb x11vnc -y
#COPY bin/vnc-aws-access.sh /app/bin/vnc-aws-access.sh
#RUN sudo chmod +x /app/bin/vnc-aws-access.sh
