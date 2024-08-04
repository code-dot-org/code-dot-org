# Pushed to Docker Hub at codedotorg/code-dot-org:<version>
#
# This Dockerfile builds the image used on DroneCI
# and is referenced by version in .drone.yml


#########################################################
FROM ubuntu:20.04 as base
#########################################################
# multi-stage build for parallel compiling ruby:
# see: https://docs.docker.com/build/building/multi-stage/
#
# For adding regular deps, skip to `primary-layer` below
#########################################################

ENV \
    LANG=C.UTF-8 \
    TZ=Etc/UTC \
    DEBIAN_FRONTEND=noninteractive \
    USER=circleci \
    GROUP=circleci

# just enough to compile ruby: other deps => primary-layer below
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        autoconf \
        bison \
        build-essential \
        curl \
        git \
        libaio-dev \
        libaio1 \
        libffi-dev \
        libgdbm-dev \
        libncurses5-dev \
        libreadline-dev \
        libssl-dev \
        libyaml-dev \
        rbenv \
        sudo \
        zlib1g-dev \
        && true

# add circleci user
RUN groupadd --gid 3434 ${USER} && \
    useradd --uid 3434 --gid ${GROUP} --shell /bin/bash --create-home ${USER} && \
    printf "${USER} ALL=NOPASSWD: ALL\n" > /etc/sudoers.d/50-${USER}

#########################################################
FROM base as rbenv
#########################################################
# compile ruby to /home/${USER}/.rbenv
#########################################################

USER ${USER}

RUN mkdir -p "$(rbenv root)"/plugins && \
    git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build && \
    rbenv install 3.0.5 && \
    eval "$(rbenv init -)" && \
    rbenv shell 3.0.5 && \
    rbenv rehash && \
    gem install bundler -v 2.3.22


#########################################################
FROM base as primary-layer
#########################################################
# Main layer of this Dockerfile: add packages etc below
#########################################################

# MAINLINE UBUNTU PACKAGE DEPS SHOULD BE ADDED HERE
RUN apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    enscript \
    ghostscript \
    gnupg \
    gzip \
    imagemagick \
    jq \
    libicu-dev \
    libmagickwand-dev \
    locales \
    moreutils \
    openssh-client \
    parallel \
    python \
    python-dev \
    python3-pip \
    software-properties-common \
    sudo \
    tar \
    tzdata \
    unzip \
    vim \
    wget \
    xvfb \
    xz-utils \
    zlib1g-dev \
    && true

WORKDIR /tmp

# en_US.UTF-8 locale not available by default
RUN locale-gen en_US.UTF-8

# Install MySQL; implicitly targeting MySQL 8.0
RUN apt-get update && \
    apt-get install --yes libmysqlclient-dev mysql-client mysql-server

# disable auth for local dashboard mysql db
RUN service mysql start && \
    echo "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';" | mysql && \
    echo "CREATE USER 'readonly'@'localhost' IDENTIFIED WITH mysql_native_password BY '';" | mysql && \
    echo "GRANT SELECT ON dashboard_test.* TO 'readonly'@'localhost';" | mysql && \
    service mysql stop

# For some reason, MySQL 8 on Ubuntu 20 does not have a home directory by
# default, so we explicity specify one to avoid the error:
#
#   su: warning: cannot change directory to /nonexistent: No such file or directory
#
# For more, see:
#  https://serverfault.com/questions/755763/mysql-nonexistent-home-vs-no-directory-logging-in-with-home/942422
#  https://stackoverflow.com/a/63040661/1810460
RUN usermod -d /var/lib/mysql/ mysql

# Also for some reason, MySQL 8 on Ubuntu 20 only grants read permissions to
# the mysqld directory to the mysql user, but we need to be able to connect as
# circleci, so we explicitly grant permissions to avoid the error:
#
#  ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/run/mysqld/mysqld.sock' (13) 
RUN sudo chmod -R 755 /run/mysqld

# we need git >= 2.15 to use git rev-parse --is-shallow-clone feature
RUN add-apt-repository ppa:git-core/ppa && \
    apt-get update && \
    apt-get install -y git>=2.15

# we need git-lfs >= 3.0 to use SSH authentication with git-lfs
RUN curl -sS https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash && \
    apt-get install -y git-lfs

# install node, based on instructions at https://github.com/nodesource/distributions#using-ubuntu-1
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    corepack enable # corepack required for yarn support

# install firefox
RUN curl --output /tmp/firefox.deb https://s3.amazonaws.com/circle-downloads/firefox-mozilla-build_47.0.1-0ubuntu1_amd64.deb && \
    echo 'ef016febe5ec4eaf7d455a34579834bcde7703cb0818c80044f4d148df8473bb  /tmp/firefox.deb' | sha256sum -c && \
    dpkg -i /tmp/firefox.deb || sudo apt-get -f install && \
    rm /tmp/firefox.deb && \
    true

# install chrome
RUN curl -sSLOJ https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    dpkg -i google-chrome-stable_current_amd64.deb || apt-get -fy install && \
    rm google-chrome-stable_current_amd64.deb && \
    sed -i \
        's|HERE/chrome"|HERE/chrome" --disable-setuid-sandbox --no-sandbox|g' \
        "/opt/google/chrome/google-chrome"

# install chromedriver
RUN export CHROMEDRIVER_RELEASE=$(curl http://chromedriver.storage.googleapis.com/LATEST_RELEASE) && \
    curl -sSLOJ "http://chromedriver.storage.googleapis.com/$CHROMEDRIVER_RELEASE/chromedriver_linux64.zip" && \
    unzip chromedriver_linux64.zip && \
    rm chromedriver_linux64.zip && \
    mv chromedriver /usr/local/bin/chromedriver && \
    chmod +x /usr/local/bin/chromedriver

# install pdftk & tidy
RUN mv /usr/bin/parallel /usr/bin/gnu_parallel && \
    curl -sSLOJ https://mirrors.kernel.org/ubuntu/pool/universe/p/pdftk-java/pdftk-java_3.0.9-1_all.deb && \
    dpkg -i pdftk-java_3.0.9-1_all.deb || apt-get -fy install && \
    rm pdftk-java_3.0.9-1_all.deb && \
    curl -sSLOJ https://github.com/htacg/tidy-html5/releases/download/5.4.0/tidy-5.4.0-64bit.deb && \
    dpkg -i tidy-5.4.0-64bit.deb && \
    rm tidy-5.4.0-64bit.deb && \
    mv /usr/bin/gnu_parallel /usr/bin/parallel

# install https://github.com/boxboat/fixuid
RUN curl -SsL https://github.com/boxboat/fixuid/releases/download/v0.4/fixuid-0.4-linux-amd64.tar.gz | tar -C /usr/local/bin -xzf - && \
    chown root:root /usr/local/bin/fixuid && \
    chmod 4755 /usr/local/bin/fixuid && \
    mkdir -p /etc/fixuid && \
    printf "user: ${USER}\ngroup: ${GROUP}\n" > /etc/fixuid/config.yml

# install pdm for managing our python dependencies
RUN pip install --system --prefix=/usr/local pdm

USER ${USER}

WORKDIR /home/${USER}

# Enable Git LFS in ~/.gitconfig
RUN git lfs install

# This bashrc file will be used whenever someone runs bash in interactive mode.
# This is mostly intended for the use case where you want to start a shell into a running container with
# docker exec -it <container_name> bash, which bypasses the entrypoint script.
RUN echo 'eval "$(rbenv init -)"' >> ~/.bashrc

# Finally, merge in the ruby layer
COPY --from=rbenv --chown=${USER}:${GROUP} /home/${USER}/.rbenv /home/${USER}/.rbenv

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
