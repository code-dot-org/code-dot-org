# syntax=docker.io/docker/dockerfile:1.4

###################################################################################
# This Dockerfile is used to produce a minial production executable image for the #
# Code.org marketing app.                                                         #
###################################################################################

FROM ubuntu:20.04 AS base

# install operating system dependencies
RUN apt-get update && \
    apt-get install -y curl

# install node, based on instructions at https://github.com/nodesource/distributions#using-ubuntu-1
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

##############################################################################
# Source Code Layer                                                          #
#                                                                            #
# Takes the `frontend` monorepo and prunes any apps or packages that are not #
# needed for the target docker image.                                        #
#                                                                            #
# This generates a partial monorepo removing unneeded packages and apps.     #
#                                                                            #
# Input: The base operating system                                           #
# Output: The pruned partial monorepo for the target app                     #
##############################################################################

FROM base AS source-code

# Enable corepack
RUN corepack enable

WORKDIR /app

COPY . .
 
# Generate a partial monorepo with a pruned lockfile for a target workspace.
# See: https://turbo.build/repo/docs/reference/prune
RUN yarn turbo prune @code-dot-org/marketing --docker

##############################################################################
# Builder Layer                                                              #
#                                                                            #
# Builds the partial `frontend` monorepo for the target application          #
#                                                                            #
# Inputs: The base operating system and pruned `frontend` monorepo           #
# Output: The built version of the target application                        #
##############################################################################

FROM base AS builder

# Enable corepack
RUN corepack enable

WORKDIR /app

# First install the dependencies (as they change less often)
COPY --link --from=source-code /app/out/json/ .
RUN yarn install
 
# Build the project
COPY --link --from=source-code /app/out/full/ .
RUN yarn turbo run build

##############################################################################
# Runnner Layer                                                              #
#                                                                            #
# Runtime execution options for the application                              #
# Note: the source code is not included in the final image                   #
#                                                                            #
# Inputs: The base operating system and built version of the target app      #
# Output: Rootless execution env for the target app with minimal artifacts   #
##############################################################################

FROM base AS runner
WORKDIR /app
 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
 
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --link --from=builder --chown=nextjs:nodejs /app/apps/marketing/.next/standalone ./
COPY --link --from=builder --chown=nextjs:nodejs /app/apps/marketing/.next/static ./apps/marketing/.next/static
 
CMD ["node", "apps/marketing/server.js"]
