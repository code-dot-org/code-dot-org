# Code.org Frontend Docker Images

## Overview

![](./architecture-diagram.drawio.png)

This directory contains Docker images for Code.org Next.js frontend applications. These images are intended for internal use only. External usage is not supported.

- Images are automatically built and published weekly on Sunday at 3am UTC via GitHub Actions.
- Images can also be built and published manually by maintainers.
- Images are not supported for public use outside of Code.org applications.

## Images

### `code-dot-org/frontend-base`
- Base image for all Next.js frontend applications at Code.org.
- Extends Ubuntu 24.04 LTS.
- Installs Node.js 20 LTS, curl, enables corepack, and sets up Yarn 4.6.0 globally.

## Maintenance

To trigger a manual build and publish of the images, maintainers can run the GitHub Actions workflow `frontend-docker-images.yml`.

This would only need to be done in case of a critical security update or other urgent issues that cannot wait for the next scheduled build.