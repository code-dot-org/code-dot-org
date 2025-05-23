import {render} from '@testing-library/react';

import NewRelicAgent from '@/providers/newrelic/agent';

import NewRelicLoader from '../NewRelicLoader';

jest.mock('@/providers/newrelic/agent', () => ({
  then: jest.fn().mockReturnValue({catch: jest.fn()}),
}));

describe('NewRelicLoader', () => {
  it('should render without crashing', () => {
    const {container} = render(<NewRelicLoader />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should initialize New Relic agent on mount', async () => {
    const mockThen = jest.fn().mockImplementation(callback => {
      callback(true);
      return {catch: jest.fn()};
    });
    (NewRelicAgent.then as jest.Mock).mockImplementation(mockThen);

    render(<NewRelicLoader />);

    expect(mockThen).toHaveBeenCalled();
  });

  it('should log an error if New Relic initialization fails', async () => {
    const consoleDebugSpy = jest
      .spyOn(console, 'debug')
      .mockImplementation(() => {});
    const mockCatch = jest
      .fn()
      .mockImplementation(callback => callback('Initialization error'));
    (NewRelicAgent.then as jest.Mock).mockImplementation(() => ({
      catch: mockCatch,
    }));

    render(<NewRelicLoader />);

    expect(mockCatch).toHaveBeenCalled();
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      'Error initializing New Relic',
      'Initialization error',
    );

    consoleDebugSpy.mockRestore();
  });

  it('should log a success message if New Relic initializes successfully', async () => {
    const consoleDebugSpy = jest
      .spyOn(console, 'debug')
      .mockImplementation(() => {});
    const mockThen = jest.fn().mockImplementation(callback => {
      callback(true);
      return {catch: jest.fn()};
    });
    (NewRelicAgent.then as jest.Mock).mockImplementation(mockThen);

    render(<NewRelicLoader />);

    expect(consoleDebugSpy).toHaveBeenCalledWith('New Relic initialized');

    consoleDebugSpy.mockRestore();
  });
});
