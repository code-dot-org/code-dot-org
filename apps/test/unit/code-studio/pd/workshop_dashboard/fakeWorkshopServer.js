import sinon from 'sinon';

/**
 * Creates a sinon fake server that can respond to API requests about
 * a given workshop.
 * @param {workshopShape} workshop
 * @returns A sinon fake server
 * @see https://sinonjs.org/releases/latest/fake-xhr-and-server/
 */
export default function fakeWorkshopServer(workshop) {
  const server = sinon.createFakeServer();

  // Workshop load request
  server.respondWith('GET', `/api/v1/pd/workshops/${workshop.id}`, [
    200,
    {'Content-Type': 'application/json'},
    JSON.stringify(workshop)
  ]);

  // Enrollments load request
  server.respondWith('GET', `/api/v1/pd/workshops/${workshop.id}/enrollments`, [
    200,
    {'Content-Type': 'application/json'},
    JSON.stringify([])
  ]);

  return server;
}
