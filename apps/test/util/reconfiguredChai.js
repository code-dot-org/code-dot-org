/** @file Import chai and configure it for our own test style. */
import chai from 'chai'; // eslint-disable-line no-restricted-imports
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import chaiXml from 'chai-xml';
import sinonChai from 'sinon-chai'; // eslint-disable-line no-restricted-imports

chai.use(sinonChai);
chai.use(chaiSubset);
chai.use(chaiAsPromised);
chai.use(chaiXml);
chai.includeStack = true;
chai.config.truncateThreshold = 0;
export default chai;
export const assert = chai.assert;
export const expect = chai.expect;
