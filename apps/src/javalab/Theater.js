export default class Theater {
  constructor() {
    this.canvas = null;
    this.context = null;
  }

  handleSignal(data) {
    const imageString = 'data:image/gif;base64,' + data.detail.image;
    const imgElement = this.getImgElement();
    imgElement.src = imageString;
  }

  reset() {
    const imgElement = this.getImgElement();
    imgElement.src = '';
  }

  getImgElement() {
    return document.getElementById('theater');
  }
}
