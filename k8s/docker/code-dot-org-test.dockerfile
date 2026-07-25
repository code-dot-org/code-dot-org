ARG CODE_DOT_ORG

FROM $CODE_DOT_ORG

RUN <<EOF
  # Install apt packages needed for test runs

  export DEBIAN_FRONTEND=noninteractive
  apt-get -qq -y install --no-install-recommends \
    flatpak \
    jq
    > /dev/null
EOF

# # install chrome
# RUN curl -sSLo google-chrome.deb "https://dl.google.com/linux/direct/google-chrome-stable_current_$(dpkg --print-architecture).deb" && \
#   dpkg -i google-chrome.deb || apt-get -fy install && \
#   rm google-chrome.deb 
#   # && \
#   # sed -i 's|HERE/chrome"|HERE/chrome" --disable-setuid-sandbox --no-sandbox|g' \
#   # /opt/google/chrome/google-chrome

# # install chromedriver
# RUN \
#   CHROME_ARCH=$(uname -m | awk '/x86_64/ {print "linux64"} /aarch64/ {print "linux-arm64"}') && \
#   CHROME_STABLE_VERSION=$(curl -s https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json | jq -r .channels.Stable.version) && \
#   curl -sSLJ "https://storage.googleapis.com/chrome-for-testing-public/$CHROME_STABLE_VERSION/$CHROME_ARCH/chromedriver.zip" -o chromedriver.zip && \
#   unzip -j chromedriver.zip -d chromedriver && \
#   mv chromedriver/chromedriver /usr/local/bin/chromedriver && \
#   chmod +x /usr/local/bin/chromedriver && \
#   rm -r chromedriver chromedriver.zip
