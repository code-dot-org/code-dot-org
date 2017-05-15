import {itImplementsTheMakerBoardInterface} from './MakerBoardTest';
import FakeBoard from '@cdo/apps/lib/kits/maker/FakeBoard';


describe('FakeBoard', () => {
  itImplementsTheMakerBoardInterface(FakeBoard);
});
