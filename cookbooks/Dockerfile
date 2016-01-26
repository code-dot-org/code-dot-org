# Build an Ubuntu container with a specific version of Chef installed.
FROM ubuntu:14.04
MAINTAINER Will Jordan <will@code.org>
RUN apt-get -yqq update
RUN apt-get -yqq install curl lsb-release
RUN curl -L https://getchef.com/chef/install.sh | bash -s -- -v 11.18.12
RUN useradd -m ubuntu
RUN adduser ubuntu sudo
USER ubuntu
