export const request = jest.fn();

const client = {transport: {request}};

export const useApiClient = () => client;
