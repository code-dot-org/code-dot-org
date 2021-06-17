export default class Theater {
  constructor() {
    this.canvas = null;
    this.context = null;
  }

  handleSignal(data) {
    var imageString = 'data:image/gif;base64,' + data.detail.image;
    var imgElement = this.getImgElement();
    imgElement.src = imageString;
  }

  reset() {
    var imgElement = this.getImgElement();
    imgElement.src = '';
  }

  getImgElement() {
    return document.getElementById('theater');
  }
}
