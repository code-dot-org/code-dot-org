import Honeybadger from '@honeybadger-io/js';

const projectRoot = process.cwd();
Honeybadger.configure({
  apiKey: process.env.HONEYBADGER_SERVER_API_KEY,
  environment: process.env.NEXT_PUBLIC_STAGE || process.env.NODE_ENV,
  revision: process.env.NEXT_PUBLIC_CONTAINER_DIGEST,
  projectRoot: 'webpack:///./',
  debug: true,
  reportData: true,
}).beforeNotify(notice => {
  if (!notice) {
    return;
  }
  notice.backtrace.forEach(line => {
    if (line.file) {
      line.file = line.file.replace(`${projectRoot}/.next/server`, `..`);
    }
    return line;
  });
  console.log('pwd', projectRoot);
  console.log('notify ', notice);
});
Honeybadger.logger.debug('Honeybadger configured for server');
