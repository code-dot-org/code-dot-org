import crypto from 'crypto';

export function md5(content: string): string {
  const md5Hasher = crypto.createHash('md5');

  md5Hasher.update(content);

  return md5Hasher.digest('hex');
}
