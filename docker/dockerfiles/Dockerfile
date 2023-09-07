# Pushed to Docker Hub at codedotorg/code-dot-org:<version>
#
# This Dockerfile builds the image used on DroneCI
# and is referenced by version in .drone.yml


#########################################################
FROM ubuntu:18.04 as base
#########################################################
# multi-stage build for parallel compiling node & ruby: 
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
FROM ubuntu:18.04 as node
#########################################################
# compile node to /build, this layer is merged at the end
#########################################################

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        g++ \
        g++-8 \
        gcc-8 \
        python3-pip

# install node
RUN curl -sSLOJ https://nodejs.org/dist/v18.16.0/node-v18.16.0.tar.gz && \
    tar -xzf node-v18.16.0.tar.gz && \
    rm node-v18.16.0.tar.gz && \
    cd node-v18.16.0 && \
    # C and CXX flags needed for ubuntu <=18.04: see https://github.com/nodesource/distributions/issues/1392
    C=/usr/bin/gcc-8 CXX=/usr/bin/g++-8 \
    ./configure && \
    make -j `nproc` && \
    make install PREFIX=/build && \
    cd .. && \
    rm -r node-v18.16.0


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

# Install MySQL.
#
# We explicitly target MySQL 5.7, and because of that we also explicitly target
# Ubuntu Bionic (18.x).
#
# We also explicitly install both mysql-client and mysql-server, so that we can
# also explicitly define the versions of both; normally only the latter is
# required since it depends on the former.
#
# Once we update to MySQL 8+, this can be simplified.
RUN curl -sSLOJ https://dev.mysql.com/get/mysql-apt-config_0.8.22-1_all.deb && \
    echo "mysql-apt-config mysql-apt-config/select-server select mysql-5.7" | /usr/bin/debconf-set-selections && \
    echo "mysql-apt-config mysql-apt-config/repo-codename select bionic" | /usr/bin/debconf-set-selections && \
    dpkg -i mysql-apt-config_0.8.22-1_all.deb || apt-get --fix-broken --yes install && \
    rm -rf mysql-apt-config_0.8.22-1_all.deb && \
    apt-get update && \
    apt-get install --yes libmysqlclient-dev mysql-client=5.7.42-1ubuntu18.04 mysql-server=5.7.42-1ubuntu18.04

# disable auth for local dashboard mysql db
RUN service mysql start && \
    echo "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';" | mysql && \
    echo "CREATE USER 'readonly'@'localhost' IDENTIFIED WITH mysql_native_password BY '';" | mysql && \
    echo "GRANT SELECT ON dashboard_test.* TO 'readonly'@'localhost';" | mysql && \
    service mysql stop

# install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install -y yarn=3.6.3

# we need git >= 2.15 to use git rev-parse --is-shallow-clone feature
RUN add-apt-repository ppa:git-core/ppa && \
    apt-get update && \
    apt-get install -y git>=2.15

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

USER ${USER}

WORKDIR /home/${USER}

# This bashrc file will be used whenever someone runs bash in interactive mode.
# This is mostly intended for the use case where you want to start a shell into a running container with
# docker exec -it <container_name> bash, which bypasses the entrypoint script.
RUN echo 'eval "$(rbenv init -)"' >> ~/.bashrc

# Finally, merge in the node & ruby layers
COPY --from=rbenv --chown=${USER}:${GROUP} /home/${USER}/.rbenv /home/${USER}/.rbenv
COPY --from=node /build /usr/local

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
