import {useInMemoryEntities} from '@contentful/experiences-sdk-react';

export function resolveContentfulLink<T>(maybeLink: unknown): T | undefined {
  const inMemoryEntities = useInMemoryEntities();

  return maybeLink
    ? (inMemoryEntities.maybeResolveLink(maybeLink) as T)
    : undefined;
}
