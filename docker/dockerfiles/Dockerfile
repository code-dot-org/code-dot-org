# Based on Code.org CircleCI-dependencies Dockerfile in .circle directory
# Pushed to Docker Hub at cdodeploy/drone:latest
FROM ubuntu:18.04

USER root

# set timezone to UTC by default
RUN ln -sf /usr/share/zoneinfo/Etc/UTC /etc/localtime

# use unicode
RUN locale-gen C.UTF-8 || true
ENV LANG=C.UTF-8

# essential tools
RUN apt-get update && \
    apt-get install -y curl apt-transport-https sudo

# add circleci user
RUN groupadd --gid 3434 circleci \
  && useradd --uid 3434 --gid circleci --shell /bin/bash --create-home circleci \
  && echo 'circleci ALL=NOPASSWD: ALL' >> /etc/sudoers.d/50-circleci

# add yarn
RUN apt-get install -y gnupg
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# more tools
RUN apt-get update && \
		apt-get install -y \
		  git \
		  xvfb \
		  yarn \
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

# install node
RUN wget https://nodejs.org/dist/v14.17.1/node-v14.17.1.tar.gz && \
    tar -xzvf node-v14.17.1.tar.gz && \
    rm node-v14.17.1.tar.gz && \
    cd node-v14.17.1 && \
    ./configure && \
    make -j4 && \
    make install && \
    cd .. && \
    rm -r node-v14.17.1

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
RUN curl -sSL -o /tmp/mysql-apt-config_0.8.12-1_all.deb https://dev.mysql.com/get/mysql-apt-config_0.8.12-1_all.deb \
  && echo "mysql-apt-config mysql-apt-config/select-server select mysql-5.7" | /usr/bin/debconf-set-selections \
  && DEBIAN_FRONTEND=noninteractive dpkg -i /tmp/mysql-apt-config_0.8.12-1_all.deb || apt-get -fy install \
  && rm -rf /tmp/mysql-apt-config_0.8.12-1_all.deb \
  && apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    mysql-server \
    libmysqlclient-dev
RUN chown -R mysql:mysql /var/lib/mysql \
  && service mysql start \
  && echo "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';" | mysql \
  && chown -R mysql:mysql /var/lib/mysql /var/run/mysqld \
  && service mysql stop

# install a couple more things from config.yml
RUN apt-get update && apt-get -y install parallel libmagickwand-dev imagemagick
RUN mv /usr/bin/parallel /usr/bin/gnu_parallel

RUN curl -sSL -o /tmp/pdftk-java_3.0.2-2_all.deb https://mirrors.kernel.org/ubuntu/pool/universe/p/pdftk-java/pdftk-java_3.0.2-2_all.deb \
  && DEBIAN_FRONTEND=noninteractive dpkg -i /tmp/pdftk-java_3.0.2-2_all.deb || apt-get -fy install \
  && rm -rf /tmp/pdftk-java_3.0.2-2_all.deb
RUN apt-get update
RUN apt-get install -y libicu-dev enscript moreutils libmysqlclient-dev libsqlite3-dev
RUN wget https://github.com/htacg/tidy-html5/releases/download/5.4.0/tidy-5.4.0-64bit.deb \
	&& dpkg -i tidy-5.4.0-64bit.deb \
	&& rm tidy-5.4.0-64bit.deb
RUN mv /usr/bin/gnu_parallel /usr/bin/parallel

RUN apt-get install -y rbenv

# install https://github.com/boxboat/fixuid
RUN USER=circleci && \
    GROUP=circleci && \
    curl -SsL https://github.com/boxboat/fixuid/releases/download/v0.4/fixuid-0.4-linux-amd64.tar.gz | tar -C /usr/local/bin -xzf - && \
    chown root:root /usr/local/bin/fixuid && \
    chmod 4755 /usr/local/bin/fixuid && \
    mkdir -p /etc/fixuid && \
    printf "user: $USER\ngroup: $GROUP\n" > /etc/fixuid/config.yml

USER circleci

# Install ruby-build: https://github.com/rbenv/ruby-build#readme
RUN mkdir -p "$(rbenv root)"/plugins
RUN git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build

RUN rbenv install 2.5.8
RUN eval "$(rbenv init -)" && rbenv global 2.5.8 && rbenv rehash && gem install bundler -v 1.17
# This bashrc file will be used whenever someone runs bash in interactive mode.
# This is mostly intended for the use case where you want to start a shell into a running container with
# docker exec -it <container_name> bash, which bypasses the entrypoint script.
RUN echo 'eval "$(rbenv init -)"' >> ~/.bashrc

# We need git >= 2.15 to use git rev-parse --is-shallow-clone feature
# TODO: consolidate apt-get installs
RUN sudo apt-get install -y software-properties-common && sudo add-apt-repository ppa:git-core/ppa && sudo apt-get update && sudo apt-get install -y git
RUN sudo apt-get install -y jq

# en_US.UTF-8 locale not available by default
RUN sudo apt-get install -y locales
RUN sudo locale-gen en_US.UTF-8

COPY entrypoint.sh /entrypoint.sh
RUN sudo chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
