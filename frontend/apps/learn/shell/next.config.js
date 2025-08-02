import { withMicrofrontends } from '@vercel/microfrontends/next/config';
import { MicrofrontendsServer } from '@vercel/microfrontends/microfrontends/server';
import { withRelatedProject } from '@vercel/related-projects';
import { withVercelToolbar } from '@vercel/toolbar/plugins/next';
import { NextFederationPlugin } from '@module-federation/nextjs-mf';

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, options) {
    const { isServer } = options;
    const microfrontends = MicrofrontendsServer.infer();
    const apps = microfrontends.config.getAllApplications();

    const remotes = apps.reduce((remotes, app) => {
      const { name, packageName, development } = app;

      // remove the prefix from the project name to have a cleaner remote name
      const remoteName = (packageName ?? name).replace(
        'microfrontends-nextjs-pages-federation-',
        '',
      );
      const url = withRelatedProject({
        projectName: name,
        defaultHost: development.local.toString(),
      });

      if (remoteName === 'root') {
        return remotes;
      }

      remotes[remoteName] =
        `_mf_${remoteName}@${url}/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`;
      return remotes;
    }, {});

    config.plugins.push(
      new NextFederationPlugin({
        name: 'root',
        filename: 'static/chunks/remoteEntry.js',
        remotes,
      }),
    );
    return config;
  },
};

export default withVercelToolbar()(
  withMicrofrontends(nextConfig, { supportPagesRouter: true }),
);
