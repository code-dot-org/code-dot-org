# Build an Ubuntu container with a specific version of Chef installed.
FROM ubuntu:14.04
MAINTAINER Will Jordan <will@code.org>
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
  sudo \
  curl \
  lsb-release \
&& apt-get autoremove -y \
&& apt-get autoclean \
&& apt-get clean \
&& rm -rf /var/lib/apt/lists/*
# Install Chef
RUN curl -L https://getchef.com/chef/install.sh | \
  bash -s -- -v 11.18.12
# Add 'ubuntu' user
RUN useradd -s /bin/bash -m ubuntu && \
  echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/ubuntu
