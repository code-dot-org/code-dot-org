#
# Cookbook Name:: cdo-java-7
# Recipe:: default
#

include_recipe "build-essential"

apt_package 'openjdk-7-jre-headless'
