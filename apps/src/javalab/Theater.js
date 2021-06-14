export default class Theater {
  constructor() {
    this.canvas = null;
    this.context = null;
  }

  afterInject() {
    // this.canvas = document.getElementById('theater');
    // this.context = this.canvas.getContext('2d');
    // if (this.context) {
    //   // Fill the canvas with a white "default" background
    //   this.context.fillStyle = 'white';
    //   this.context.rect(0, 0, 400, 400);
    //   this.context.fill();
    // }
  }

  handleSignal(data) {
    var imageString = 'data:image/gif;base64,' + data.detail.image;
    //var base_image = new Image();
    var imgElement = document.getElementById('theater');
    imgElement.src = imageString;
    // base_image.onload = () => {
    //   this.context.drawImage(base_image, 0, 0);
    // };
  }
}
