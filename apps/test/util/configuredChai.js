/** @file Import chai and configure it for our own test style. */
import chai from 'chai';
import chaiSubset from 'chai-subset';
import sinonChai from 'sinon-chai';
import sinonChaiInOrder from 'sinon-chai-in-order';
import chaiAsPromised from 'chai-as-promised';
import chaiXml from 'chai-xml';

chai.use(sinonChai);
chai.use(sinonChaiInOrder);
chai.use(chaiSubset);
chai.use(chaiAsPromised);
chai.use(chaiXml);
chai.includeStack = true;
chai.config.truncateThreshold = 0;
export default chai;
export const assert = chai.assert;
export const expect = chai.expect;
