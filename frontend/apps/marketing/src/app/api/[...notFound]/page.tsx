import {notFound} from 'next/navigation';

/**
 * Catch-all route for handling 404 since the /api route only has an allow list of API paths.
 */
export default function NotFoundCatchAll() {
  return notFound();
}
