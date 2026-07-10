import type {ZodType} from 'zod';

/**
 * The Rails-hydrated batch routes inject request data as a data-certificate
 * JSON attribute on the #vite-root shell element
 * (dashboard/app/views/frontend_studio/index.html.haml). Malformed or
 * mismatched payloads read as null, same as an absent attribute.
 */
export function readShellCertificateData<T>(schema: ZodType<T>): T | null {
  const raw =
    document.querySelector<HTMLElement>('[data-certificate]')?.dataset
      .certificate;
  if (!raw) {
    return null;
  }

  try {
    const result = schema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
