function embedPlayer(node, videoId) {
    var iframe = document.createElement("iframe");
    var url = window.location.protocol + "//www.youtube.com/embed/" + videoId + "?autoplay=1&autohide=1&rel=0&controls=2";
    iframe.setAttribute("src", url);
    iframe.setAttribute("frameborder", '0');
    iframe.setAttribute("allowfullscreen", '');
    iframe.className = "yt-embed";
    node.parentNode.replaceChild(iframe, node);
}