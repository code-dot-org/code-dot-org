// Smooth Scroll
	$('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') 
        || location.hostname == this.hostname) {

        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
           if (target.length) {
             $('html,body').animate({
                 scrollTop: target.offset().top
            }, 1000);
            return false;
        }
    }
});


//Mail
    var form = $('.contact-form');
    form.submit(function () {
    $this = $(this);
    $.post($(this).attr('action'),$(this).serialize(), function(data) {
        $this.prev().text(data.message).fadeIn().delay(3000).fadeOut();
    },'json');
    return false;
    });
		
		