# Use an official Ruby image as a parent image, specifying version 3.0.5
FROM amd64/ruby:3.0.5

# Install Node.js 18.16.0, Python 3 (with virtual environment support), MySQL client, and gzip for gzcat
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs=18.16.0-1nodesource1 python3 python3-venv default-mysql-client gzip && \
    apt-get update

# Set the working directory inside the container
WORKDIR /app

# Copy the Gemfile and Gemfile.lock first to leverage Docker's cache
COPY Gemfile Gemfile.lock ./

# Set up a Python virtual environment and install PDM
RUN python3 -m venv /app/venv && \
    /app/venv/bin/pip install --upgrade pip && \
    /app/venv/bin/pip install "pdm>=2.17"

# Install yarn
RUN npm install -g yarn

# Install the specified version of Bundler and Ruby dependencies
RUN gem install bundler -v 2.3.22 && bundle install

# Copy the rest of the application code (causes docker to cache the previous steps)
# NOTE: this is overridden by docker-compose, as it mounts the local directory over the top of /app
COPY . .

# Expose port 3000 to the host
EXPOSE 3000

# Define the command to run your application (overridden by docker-compose)
CMD ["/bin/bash", "-c", "./bin/dashboard-server"]