export default class Theater {
  constructor() {
    this.canvas = null;
    this.context = null;
  }

  afterInject() {
    this.canvas = document.getElementById('theater');
    this.context = this.canvas.getContext('2d')
    // if (this.context) {
    //   this.context.beginPath();
    //   this.context.arc(100, 100, 50, 0, 2 * Math.PI);
    //   this.context.fill();
    //   this.context.stroke();
    //   return true;
    // }
  }

  handleSignal(data) {
    // var bytes = new Uint8Array(data);
    // var imageData = "";
    // var len = bytes.byteLength;
    // for (var i = 0; i < len; ++i) {
    //   imageData += String.fromCharCode(bytes[i]);
    // }
    this.context = this.canvas.getContext('2d')
    var imageString = "data:image/png;base64," + data.detail.image

    var base_image = new Image();
    base_image.src = imageString //"data:image/png;base64,"+window.btoa(imageData);
    base_image.onload = () => {
      this.context.drawImage(base_image, 0, 0)
    }
    // img.src = "data:image/png;base64,"+window.btoa(data);
  }
}