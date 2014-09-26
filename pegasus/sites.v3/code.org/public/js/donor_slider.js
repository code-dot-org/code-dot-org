$(document).ready(function() {
    var platinum = $(".platinum");
    var gold = $(".gold");

    var masterIndex = 2;
    var combinedLength = platinum.length + gold.length;
    var interval = 8000;
    var timer = setInterval(setManager, interval);

    function setManager () {
        if (masterIndex > combinedLength) {
            masterIndex = 0;
        }
        if (masterIndex < platinum.length) {
            gold.hide();
            $("#level_indicator").text("Platinum Supporters ($3,000,000+ contribution)");
            scrollBadges(platinum, masterIndex);
        } else {
            platinum.hide();
            $("#level_indicator").text("Gold Supporters ($1,000,000+ contribution)");
            scrollBadges(gold, masterIndex - platinum.length);
        }
    }

    function scrollBadges (items, index) {
        if (items.eq(index).attr("class") === "badge platinum") {
            items.eq(index - 1).fadeOut("slow");
            items.eq(index - 2).fadeOut("slow", function () {
                items.eq(index).fadeIn("slow");
                items.eq(index + 1).fadeIn("slow");

                if (masterIndex + 2 > platinum.length) {
                    masterIndex++;
                } else {
                    masterIndex += 2;
                }
            });
        } else {
            items.eq(index - 1).fadeOut("slow");
            items.eq(index - 2).fadeOut("slow");
            items.eq(index - 3).fadeOut("slow", function () {
                items.eq(index).fadeIn("slow");
                items.eq(index + 1).fadeIn("slow");
                items.eq(index + 2).fadeIn("slow");
                masterIndex += 3;
            });
        }
    }

    platinum.first().css("display", "inline-block");
    platinum.eq(1).css("display", "inline-block");

    $('.badge').hover(function () { clearInterval(timer); }, function () { timer = setInterval(setManager, interval); });
});