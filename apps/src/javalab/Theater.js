export default class Theater {
  constructor() {
    this.canvas = null;
    this.context = null;
  }

  afterInject() {
    this.canvas = document.getElementById('theater');
    this.context = this.canvas.getContext('2d');
  }

  handleSignal(data) {
    this.context = this.canvas.getContext('2d');
    var imageString = 'data:image/png;base64,' + data.detail.image;

    var base_image = new Image();
    base_image.src = imageString;
    base_image.onload = () => {
      this.context.drawImage(base_image, 0, 0);
    };
  }
}
