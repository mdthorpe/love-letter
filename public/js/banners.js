"use strict";

var flash_banner = function() {
    $(".banners").attr("data-anim", "showBanner").fadeIn();
    setTimeout(function() {
        $(".banners").attr("data-anim", "hideBanner").fadeOut();
    }, 2000);
}

var toggle_banner = function() {
    var a = $(".banners").attr("data-anim");
    if (a === "hideBanner") {
        show_banner();
    } else {
        hide_banner();
    }
}

var hide_banner = function() {
    $(".banners").attr("data-anim", "hideBanner").fadeOut();
}

var show_banner = function() {
    $(".banners").attr("data-anim", "showBanner").fadeIn();
}

var set_banner = function(message) {
    $(".banners .banner").html(message)
}


socket.on('broadcast-message', function(message, flash) {
    status_message('host/socket/broadcast-message', message, flash);
    set_banner(message);
    if(flash) { flash_banner(); }
    else { show_banner(); }
    return false;
});
