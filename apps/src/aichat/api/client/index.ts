export async function getClientApi() {
  return await import(
    /* webpackChunkName: "aichat-client-api" */ './aichat-client-api.js'
  );
}
