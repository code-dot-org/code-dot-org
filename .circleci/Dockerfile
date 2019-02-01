# Code.org CircleCI-dependencies Dockerfile
# Pushed to Docker Hub at wjordan/code-dot-org:trusty
FROM ubuntu:14.04

USER root

# set timezone to UTC by default
RUN ln -sf /usr/share/zoneinfo/Etc/UTC /etc/localtime

# use unicode
RUN locale-gen C.UTF-8 || true
ENV LANG=C.UTF-8

# add circleci user
RUN groupadd --gid 3434 circleci \
  && useradd --uid 3434 --gid circleci --shell /bin/bash --create-home circleci \
  && echo 'circleci ALL=NOPASSWD: ALL' >> /etc/sudoers.d/50-circleci

# essential tools
RUN apt-get update && \
    apt-get install -y curl apt-transport-https

# add yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# more tools
RUN apt-get update && \
		apt-get install -y \
		  git \
		  xvfb \
		  yarn=0.27.5-1 \
		  sudo \
		  openssh-client \
		  ca-certificates \
		  tar \
		  gzip \
		  wget \
		  xz-utils \
		  autoconf \
		  build-essential \
		  zlib1g-dev \
		  libssl-dev \
		  curl \
		  libreadline-dev \
		  python python-dev

# install ruby
RUN wget https://cache.ruby-lang.org/pub/ruby/2.5/ruby-2.5.0.tar.gz && \
    tar -xzvf ruby-2.5.0.tar.gz && \
    rm ruby-2.5.0.tar.gz && \
    cd ruby-2.5.0 && \
    ./configure && \
    make -j"$(nproc)" && \
    make install && \
    cd .. && \
    rm -r ruby-2.5.0

# install bundler
RUN gem install bundler -v 1.17 && \
    mkdir -p /usr/local/bundle && \
    chown -R circleci /usr/local/bundle

# install node
RUN wget https://nodejs.org/dist/v8.15.0/node-v8.15.0.tar.gz && \
    tar -xzvf node-v8.15.0.tar.gz && \
    rm node-v8.15.0.tar.gz && \
    cd node-v8.15.0 && \
    ./configure && \
    make -j4 && \
    make install && \
    cd .. && \
    rm -r node-v8.15.0

# more more tools
RUN apt-get install -y unzip

# install firefox
RUN curl --output /tmp/firefox.deb https://s3.amazonaws.com/circle-downloads/firefox-mozilla-build_47.0.1-0ubuntu1_amd64.deb \
  && echo 'ef016febe5ec4eaf7d455a34579834bcde7703cb0818c80044f4d148df8473bb  /tmp/firefox.deb' | sha256sum -c \
  && sudo dpkg -i /tmp/firefox.deb || sudo apt-get -f install  \
  && apt-get update && apt-get install -y libgtk3.0-cil-dev \
  && rm -rf /tmp/firefox.deb

# install chrome
RUN curl -sSL -o /tmp/google-chrome-stable_current_amd64.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
      && (sudo dpkg -i /tmp/google-chrome-stable_current_amd64.deb || sudo apt-get -fy install)  \
      && rm -rf /tmp/google-chrome-stable_current_amd64.deb \
      && sudo sed -i 's|HERE/chrome"|HERE/chrome" --disable-setuid-sandbox --no-sandbox|g' \
           "/opt/google/chrome/google-chrome"

# install chromedriver
RUN export CHROMEDRIVER_RELEASE=$(curl http://chromedriver.storage.googleapis.com/LATEST_RELEASE) \
      && curl -sSL -o /tmp/chromedriver_linux64.zip "http://chromedriver.storage.googleapis.com/$CHROMEDRIVER_RELEASE/chromedriver_linux64.zip" \
      && cd /tmp \
      && unzip chromedriver_linux64.zip \
      && rm -rf chromedriver_linux64.zip \
      && sudo mv chromedriver /usr/local/bin/chromedriver \
      && sudo chmod +x /usr/local/bin/chromedriver

# install mysql
RUN curl -sSL -o /tmp/mysql-apt-config_0.8.9-1_all.deb https://dev.mysql.com/get/mysql-apt-config_0.8.9-1_all.deb \
  && echo "mysql-apt-config mysql-apt-config/select-server select mysql-5.7" | /usr/bin/debconf-set-selections \
  && DEBIAN_FRONTEND=noninteractive dpkg -i /tmp/mysql-apt-config_0.8.9-1_all.deb || apt-get -fy install \
  && rm -rf /tmp/mysql-apt-config_0.8.9-1_all.deb \
  && apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    mysql-server \
    libmysqlclient-dev
RUN service mysql start \
  && echo "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';" | mysql \
  && service mysql stop

# install a couple more things from config.yml
RUN apt-get update && apt-get -y install parallel libmagickwand-dev imagemagick

USER circleci
