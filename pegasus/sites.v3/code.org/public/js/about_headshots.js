window.addEventListener('resize', function () {
    window.location.reload();
});

if (document.documentElement.clientWidth < 970) {
  $('.avatar_container').outerHeight();
} else {
  $(window).load(function () {

    let i = 2;
    let j = 3;
    let k = 4;

    while ( i < 63 ) {

      let left = $("#"+i+"");
      let middle = $("#"+j+"");
      let right = $("#"+k+"");

      let maxHeight = Math.max(right.outerHeight(), middle.outerHeight());
      maxHeight = Math.max(maxHeight, left.outerHeight());

      right.outerHeight(maxHeight);
      middle.outerHeight(maxHeight);
      left.outerHeight(maxHeight);

      i = i + 3;
      j = j + 3;
      k = k + 3;
    }
  });
}
