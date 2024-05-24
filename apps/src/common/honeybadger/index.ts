import Honeybadger from '@honeybadger-io/js';

const config = {
  apiKey: 'hbp_gK0ih24nLeJICW8gbfe0c4z9yO8e7x2F1FBj',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  environment: (window as any).dashboard?.rack_env ?? 'development',
  enableUncaught: false,
  enableUnhandledRejection: false,
  eventsEnabled: false,
};
export default Honeybadger.configure(config);
