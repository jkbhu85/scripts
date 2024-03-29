// ==UserScript==
// @name         Youtube Utilities
// @namespace    http://tampermonkey.net/
// @version      1.5.0
// @description  Open a video in a new tab in mobile youtube.
// @author       Optimus Prime
// @match        https://m.youtube.com/*
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const css = `
/* for opening videos in tab directly */
@keyframes nodeInserted {
    from { opacity: 0.99; }
    to { opacity: 1; }
}
ytm-media-item {
    animation-duration: 0.001s;
    animation-name: nodeInserted;
    position: relative;
}
/* hide reels */
ytd-reel-shelf-renderer,
ytd-rich-shelf-renderer,
ytm-reel-shelf-renderer {
    display: none !important;
}
`;
    const attrViedoInNewTab = 'data-video-in-new-tab';

    const style = document.createElement('style');
    style.innerHTML = css;
    document.body.appendChild(style);

    function findParent(elem) {
        if (elem == document.body) {
            return null;
        }
        const tg = elem.tagName.toLowerCase();
        if (tg === 'ytm-media-item') {
            return elem;
        }
        return findParent(elem.parentNode);
    }

    window.openInNewTab = function(event) {
        console.log(event.target.tagName);
        let elem;
        if ((elem = findParent(event.target)) != null) {
            console.log('element found');
            event.preventDefault();
            event.stopPropagation();
            const a = elem.querySelector("a.media-item-thumbnail-container");
            if (a) {
                console.log("Opening in new tab. Link: " + a.href);
                window.open(a.href, "_blank");
            }
        } else {
            console.warn('parent not found.');
        }
    }

    const coverSetter = function setupCover(elem) {
        if (elem.getAttribute(attrViedoInNewTab) === 't') {
            return;
        }
        elem.onclick = window.openInNewTab;
        elem.setAttribute(attrViedoInNewTab, "t");
    }

    const nodeInsertListener = function(event){
        if (event.animationName == "nodeInserted") {
            coverSetter(event.target);
        }
    }

    function videoInNewTab() {
        document.addEventListener("animationstart", nodeInsertListener, false);
        console.log("Video in new tab set up for new items.");
    }

    function videoInNewTabExistingItems() {
        const items = document.querySelectorAll("ytm-media-item");
        items.forEach(e => coverSetter(e));
        console.log("Video in new tab set up for existing [" + items.length + "] items.");
    }
    videoInNewTab();
    videoInNewTabExistingItems();
})();
