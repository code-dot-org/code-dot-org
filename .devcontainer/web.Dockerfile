FROM mcr.microsoft.com/devcontainers/base:jammy

# Additional required packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends autoconf bison build-essential libssl-dev libyaml-dev libreadline6-dev zlib1g-dev libncurses5-dev libffi-dev libgdbm6 libgdbm-dev git chromium-browser parallel

# Switch to VSCode user
USER vscode

# Install rbenv
RUN sudo apt-get -y install rbenv \
    && mkdir -p /home/vscode/plugins \
    && git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build

# Install Ruby and replace the system symbolic link.
RUN rbenv install 2.7.5 \
    && echo -n '\n# rbenv init\neval "$(rbenv init -)"\n' >> ~/.bashrc \
    && rbenv global 2.7.5 \
    && sudo rm /usr/bin/ruby \
    && sudo ln -s /home/vscode/versions/2.7.5/bin/ruby /usr/bin/ruby

# Install Node
RUN sudo apt-get -y install nodejs npm \
    && sudo chown -R vscode /usr/local \
    && npm install -g n \
    && n 18.16.0

# Install Yarn
RUN npm i -g yarn@1.22.5

# # Install ImageMagick
RUN sudo apt-get -y install libmagickwand-dev imagemagick

# # Install MySQL Native Client
RUN sudo apt-get -y install libsqlite3-dev libmysqlclient-dev mariadb-client-core-10.6

# Install AWSCLI
RUN cd /home/vscode \
    && if [ $(uname -m) = "aarch64" ]; then curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"; else curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"; fi \
    && unzip awscliv2.zip \
    && ./aws/install

# Set AWS_PROFILE env var
ENV AWS_PROFILE=cdo

# Add CHROME_BIN env var to bashrc
RUN echo -n '\n# Chromium Binary\nexport CHROME_BIN=/usr/bin/chromium-browser\n' >> ~/.bashrc

# Add Ruby binaries to path
RUN echo -n '\n# Add Ruby binaries on path\nexport PATH=$PATH:/home/vscode/.rbenv/versions/2.7.5/bin\n' >> ~/.bashrc