$(document).ready(function() {
    var items = $(".badge");
    var index = 2;
    var lastIndex = items.length - 1;
    var interval = 8000;
    var timer = setInterval(scrollBadges, interval);

    function scrollBadges () {
        if (index === 0) {
            items.eq(lastIndex).fadeOut("slow", function() {
                $("#level_indicator").text("Platinum Supporters ($3,000,000+ contribution)");
                items.eq(index).fadeIn("slow");
                items.eq(index + 1).fadeIn("slow");
                index += 2;
            });
        } else if (index === 2) {
            items.eq(index - 1).fadeOut("fast");
            items.eq(index - 2).fadeOut("fast", function() {
                $("#level_indicator").text("Gold Supporters ($1,000,000+ contribution)");
                items.eq(index).fadeIn("slow");
                items.eq(index + 1).fadeIn("slow");
                items.eq(index + 2).fadeIn("slow");
                index += 3;
            });
        } else {
            items.eq(index - 1).fadeOut("fast");
            items.eq(index - 2).fadeOut("fast");
            items.eq(index - 3).fadeOut("fast", function() {
                items.eq(index).fadeIn("slow");
                items.eq(index + 1).fadeIn("slow");
                items.eq(index + 2).fadeIn("slow");
                if (index >= lastIndex) {
                    index = 0;
                } else {
                    index += 3;
                }
            });
        }
    }

    items.hide();
    items.first().css("display", "inline-block");
    items.eq(1).show();
    items.hover(function () { clearInterval(timer); }, function () { timer = setInterval(scrollBadges, interval); });
});