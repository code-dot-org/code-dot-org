import {MockFirebase} from 'firebase-mock';

// Previously, this file contained patches for firebase-mock 1.0.5 which are no longer needed in version 1.0.8.
// However, this file aliases the named MockFirebase as a default export resulting in some integration test failures.
// Temporarily allow for this alias until we can come back and fix the import/export redirection.
export default MockFirebase;
