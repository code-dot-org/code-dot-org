# Pushed to Docker Hub at codedotorg/code-dot-org:<version>
FROM ubuntu:18.04

USER root

ENV \
  LANG=C.UTF-8 \
  DEBIAN_FRONTEND=noninteractive \
  USER=circleci \
  GROUP=circleci

RUN \
  # set timezone to UTC by default
  ln -sf /usr/share/zoneinfo/Etc/UTC /etc/localtime && \
  # use unicode
  locale-gen C.UTF-8 || true

# install packages from mainline ubuntu repositories
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      apt-transport-https \
      autoconf \
      build-essential \
      ca-certificates \
      curl \
      curl \
      enscript \
      g++-8 \
      gcc-8 \
      git \
      gnupg \
      gzip \
      imagemagick \   
      jq \
      libaio-dev \
      libaio1 \
      libicu-dev \
      libmagickwand-dev \
      libreadline-dev \
      libsqlite3-dev \
      libssl-dev \
      locales \
      moreutils \
      openssh-client \
      parallel \
      python3 python3-dev \
      rbenv \
      software-properties-common \
      sudo \
      sudo \
      tar \
      unzip \
      vim \
      xvfb \
      xz-utils \
      zlib1g-dev \
      && true

WORKDIR /tmp

# install node
RUN curl -sSLOJ https://nodejs.org/dist/v18.16.0/node-v18.16.0.tar.gz && \
  tar -xzvf node-v18.16.0.tar.gz && \
  rm node-v18.16.0.tar.gz && \
  cd node-v18.16.0 && \
  # C and CXX flags needed for ubuntu <=18.04: see https://github.com/nodesource/distributions/issues/1392
  C=/usr/bin/gcc-8 CXX=/usr/bin/g++-8 \
  ./configure && \
  make -j8 && \
  make install && \
  cd .. && \
  rm -r node-v18.16.0

# install mysql
RUN curl -sSLOJ https://dev.mysql.com/get/mysql-apt-config_0.8.22-1_all.deb && \
  echo "mysql-apt-config mysql-apt-config/select-server select mysql-5.7" | /usr/bin/debconf-set-selections && \
  dpkg -i mysql-apt-config_0.8.22-1_all.deb || apt-get -fy install && \
  rm -rf mysql-apt-config_0.8.22-1_all.deb && \
  apt-get update && \
  # warning: mysql-server debconf hangs forever if wget is already installed (!)
  apt-get install -y mysql-server libmysqlclient-dev

# disable auth for local dashboard mysql db
RUN chown -R mysql:mysql /var/lib/mysql && \
  service mysql start && \
  echo "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';" | mysql && \
  echo "CREATE USER 'readonly'@'localhost' IDENTIFIED WITH mysql_native_password BY '';" | mysql && \
  echo "GRANT SELECT ON dashboard_test.* TO 'readonly'@'localhost';" | mysql && \
  chown -R mysql:mysql /var/lib/mysql /var/run/mysqld && \
  service mysql stop

# install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install -y yarn=1.22.19-1

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

# en_US.UTF-8 locale not available by default
RUN locale-gen en_US.UTF-8

# add circleci user
RUN groupadd --gid 3434 ${USER} && \
    useradd --uid 3434 --gid ${GROUP} --shell /bin/bash --create-home ${USER} && \
    echo "${USER} ALL=NOPASSWD: ALL" >> /etc/sudoers.d/50-${USER}

# install https://github.com/boxboat/fixuid
RUN curl -SsL https://github.com/boxboat/fixuid/releases/download/v0.4/fixuid-0.4-linux-amd64.tar.gz | tar -C /usr/local/bin -xzf - && \
    chown root:root /usr/local/bin/fixuid && \
    chmod 4755 /usr/local/bin/fixuid && \
    mkdir -p /etc/fixuid && \
    printf "user: ${USER}\ngroup: ${GROUP}\n" > /etc/fixuid/config.yml

USER ${USER}

# install rbenv & ruby-build
RUN mkdir -p "$(rbenv root)"/plugins && \
    git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build && \
    rbenv install 2.7.5 && \
    eval "$(rbenv init -)" && \
    rbenv shell 2.7.5 && \
    rbenv rehash && \
    gem install bundler -v 2.3.22 && \
    # This bashrc file will be used whenever someone runs bash in interactive mode.
    # This is mostly intended for the use case where you want to start a shell into a running container with
    # docker exec -it <container_name> bash, which bypasses the entrypoint script.
    echo 'eval "$(rbenv init -)"' >> ~/.bashrc

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
