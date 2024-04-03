export default function fakeWorkshopServer(workshop) {
  const server = sinon.createFakeServer();

  // Workshop load request
  server.respondWith('GET', `/api/v1/pd/workshops/${workshop.id}`, [
    200,
    {'Content-Type': 'application/json'},
    JSON.stringify(workshop),
  ]);

  // Enrollments load request
  server.respondWith('GET', `/api/v1/pd/workshops/${workshop.id}/enrollments`, [
    200,
    {'Content-Type': 'application/json'},
    JSON.stringify([]),
  ]);

  return server;
}
