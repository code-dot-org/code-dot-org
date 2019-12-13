export default class LedMatrix {
  constructor(board) {
    this.board = board;
  }

  scrollString(value) {
    this.board.mb.scrollString(value);
  }

  scrollInteger(value) {
    this.board.mb.scrollInteger(value);
  }
}
