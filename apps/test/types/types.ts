import {SinonStub} from 'sinon';

/** Utility type for a stubbed sinon function */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StubFunction<T extends (...args: any) => any> = SinonStub<
  Parameters<T>,
  ReturnType<T>
>;
