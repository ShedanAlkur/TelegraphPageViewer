// ==UserScript==
// @name         Image navigation on telegra.ph
// @namespace    https://github.com/ShedanAlkur/
// @version      0.1.1
// @downloadURL  https://github.com/ShedanAlkur/TelegraphPageViewer/raw/anime/Telegraph_image_navigation.user.js
// @updateURL    https://github.com/ShedanAlkur/TelegraphPageViewer/raw/anime/Telegraph_image_navigation.user.js
// @description  More options for navigating between pictures on telegra.ph
// @author       ShedanAlkur
// @match        https://telegra.ph/*
// @icon         https://telegra.ph/favicon.ico?1
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const COUNTER_FADEOUT_TIME = 2500;
    const SCROLL_APPLY_TIME = 120;

    var _images;
    var _currentIndex = 0, _imageCount = 0, _scrollIndex = 0;
    var _hCounter;
    var _counterTimeout, _scrollTimeout, _preventScrollIndexTimeout;
    var _preventScrollIndex = false;

    const backwardLinkStyle =
        `.backward-link{position:absolute;width:calc(40% + 100px);height:100%;left:-100px;border:none !important}.backward-link:hover{background-color:rgba(0,0,0,.2)}`
    const imageCounterStyle =
        `.image-counter{display:inline-block;position:fixed;z-index:999;bottom:0;left:50%;transform:translate(0,-50%);padding:4px 12px;color:#000;background-color:#fff;font-family:CustomSansSerif,'Lucida Grande',Arial,sans-serif;font-weight:600;font-style:normal;font-size:17px;text-decoration:none;border:2px solid #333;border-radius:16px;text-transform:uppercase;opacity:70%;cursor:default}.image-counter:hover{opacity:30%}.image-counter:empty{display:none}`;

    function addGlobalStyle(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }

    function updateCounter(fadeoutTime = COUNTER_FADEOUT_TIME) {
        _hCounter.innerHTML = `${_currentIndex + 1}/${_imageCount}`
        clearTimeout(_counterTimeout);
        _counterTimeout = setTimeout(() => { _hCounter.innerHTML = '' }, fadeoutTime);
    }

    function _preventScrollIndexDisable() {
        _preventScrollIndex = false
    }

    function onLinkClick(event) {
        _currentIndex = _scrollIndex = +event.target.dataset.indexto;
        _preventScrollIndex = true;
        clearTimeout(_preventScrollIndexTimeout);
        _preventScrollIndexTimeout =
            setTimeout(_preventScrollIndexDisable, _scrollTimeout + 1);
        updateCounter();
    }

    function toImage() {
        _scrollIndex = _currentIndex;
        _images[_currentIndex].scrollIntoView();
        _preventScrollIndex = true;
        clearTimeout(_preventScrollIndexTimeout);
        _preventScrollIndexTimeout =
            setTimeout(_preventScrollIndexDisable, SCROLL_APPLY_TIME);
        updateCounter();
    }


    window.addEventListener('load', function () {
        document.querySelector('html').style.scrollBehavior = 'smooth';

        // addGlobalStyle('html { background-color: red ! important; }');
        addGlobalStyle(backwardLinkStyle);
        addGlobalStyle(imageCounterStyle);

        _images = document.querySelectorAll('img');

        var index = 0, indexTo = 0, hrefS = '#_img-';
        var linkB, linkF;
        _imageCount = _images.length
        for (; index < _imageCount; index++) {
            indexTo = ((index <= 0) ? _imageCount - 1 : index - 1);
            linkB = document.createElement('a');
            linkB.setAttribute('href', hrefS + indexTo);
            linkB.setAttribute('data-index', index);
            linkB.setAttribute('data-indexto', indexTo);
            linkB.classList.add('backward-link');

            indexTo = ((index < _imageCount - 1) ? index + 1 : 0);
            _images[index].setAttribute('id', '_img-' + index);
            _images[index].setAttribute('data-index', index);
            _images[index].setAttribute('data-indexto', indexTo);
            linkF = document.createElement('a');
            linkF.setAttribute('href', hrefS + indexTo);

            _images[index].parentNode.appendChild(linkB);
            _images[index].parentNode.appendChild(linkF);
            linkF.appendChild(_images[index]);

            linkF.addEventListener('click', onLinkClick);
            linkB.addEventListener('click', onLinkClick);
        }

        if (_images) {
            _hCounter = this.document.createElement('div');
            _hCounter.classList.add('image-counter');
            document.querySelector('body').appendChild(_hCounter);

            // _hCounter.addEventListener('click', (event) => {
            //     console.log(`_currentIndex ${_currentIndex} - _scrollIndex ${_scrollIndex}`)
            // })
        }

        window.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') {
                if (++_currentIndex >= _imageCount) _currentIndex = 0;
                toImage();
            } else if (event.key === 'ArrowLeft') {
                if (--_currentIndex < 0) _currentIndex = _imageCount - 1;
                toImage();
            }
        });

        window.addEventListener('scroll', (event) => {
            if (_preventScrollIndex) {
                clearTimeout(_preventScrollIndexTimeout);
                _preventScrollIndexTimeout =
                    setTimeout(_preventScrollIndexDisable, SCROLL_APPLY_TIME);
                return;
            }
            console.log(`scroll ${_preventScrollIndex}`);
            _scrollIndex = 0;
            var rect;
            for (; _scrollIndex < _imageCount; _scrollIndex++) {
                rect = _images[_scrollIndex].getBoundingClientRect();
                if ((rect.top + rect.bottom) / 2 >= 0) {
                    break;
                }
            }
            if (_scrollIndex >= _imageCount) {
                _scrollIndex = _imageCount - 1;
            }
            clearTimeout(_scrollTimeout);
            _scrollTimeout = setTimeout(() => {
                _currentIndex = _scrollIndex;
                updateCounter(COUNTER_FADEOUT_TIME - SCROLL_APPLY_TIME);
            }, SCROLL_APPLY_TIME);

            updateCounter();
        })

    }, false)
})();
