$(document).ready(function() {
    var platinum = $(".platinum");
    var gold = $(".gold");
    var badges = $(".badge");

    var masterIndex = 0;
    var combinedLength = platinum.length + gold.length;
    var interval = 1000;
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
            items.eq(index - 1).hide();
            items.eq(index - 2).hide();

            items.eq(index).show();
            items.eq(index + 1).show();

            if (masterIndex + 2 > platinum.length) {
                masterIndex++;
            } else {
                masterIndex += 2;
            }
        } else {
            items.eq(index - 1).hide();
            items.eq(index - 2).hide();
            items.eq(index - 3).hide();

            items.eq(index).show();
            items.eq(index + 1).show();
            items.eq(index + 2).show();
            masterIndex += 3;
        }
    }

    badges.hide();
    platinum.first().css("display", "inline-block");
    platinum.eq(1).show();

    $('.badge').hover(function () { clearInterval(timer); }, function () { timer = setInterval(setManager, interval); });
});