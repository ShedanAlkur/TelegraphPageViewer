// ==UserScript==
// @name         Image navigation on telegraph
// @namespace    https://github.com/ShedanAlkur/
// @version      0.1.5
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

    const backwardLinkStyle =
        `.backward-link{position:absolute;width:calc(40% + 100px);height:100%;left:-100px;border:none !important}.backward-link:hover{background-color:rgba(0,0,0,.15)}`
    const imageCounterStyle =
        `.image-counter{display:inline-block;position:fixed;z-index:999;bottom:0;left:50%;transform:translate(-50%,0);margin-bottom:12px;padding:4px 12px;color:#000;background-color:#fff;font-family:CustomSansSerif,'Lucida Grande',Arial,sans-serif;font-weight:600;font-style:normal;font-size:17px;text-decoration:none;border:2px solid #333;border-radius:16px;text-transform:uppercase;opacity:70%;cursor:default}.image-counter:hover{opacity:30%}.image-counter:empty{display:none}`;
    const addressCheckbox =
        `.address-checkbox input{accent-color:rgb(121,130,139)}.address-checkbox::before{content:'•';padding:0 7px}`;
    const darkmode =
        `.darkmode body{background-color:#191919}.darkmode .tl_article .tl_article_content,.darkmode .tl_article .tl_article_content .ql-editor *,.darkmode .tl_article.tl_article_edit.title_focused [data-label]:after,.darkmode .tl_article.tl_article_edit.title_required h1[data-placeholder]:before{color:rgba(255,255,255,.75)}.darkmode .tl_article .tl_article_content,.darkmode .tl_article h1,.darkmode .tl_article h2{color:rgba(255,255,255,.8)}.darkmode .tl_article .share_button,.darkmode .tl_article_edit .publish_button,.darkmode .tl_article_editable .edit_button,.darkmode .tl_article_saving .publish_button{color:rgba(255,255,255,.8);background-color:rgba(255,255,255,.2);border-color:rgba(255,255,255,0)}.darkmode .tl_article .tl_article_content code,.darkmode .tl_article .tl_article_content pre{background-color:rgba(255,255,255,.2)}.darkmode .tl_article .tl_article_content blockquote,.darkmode .tl_article a[href]{border-color:rgba(255,255,255,.75)}.darkmode .account,.darkmode .tl_article address{color:rgba(255,255,255,.5)}.darkmode .address[data-placeholder].empty:after,.darkmode .tl_article.tl_article_edit [data-placeholder].empty:before,.darkmode .tl_article.tl_article_edit figcaption[data-placeholder].empty:after{color:rgba(255,255,255,.44)}.darkmode img{filter:brightness(80%)}*{transition:background-color .1s linear}`;
    var _images;
    var _currentIndex = 0, _imageCount = 0, _scrollIndex = 0;
    var _hCounter;
    var _hLabelUseExt, hInputUseExt;
    var _counterTimeout, _scrollTimeout, _preventScrollIndexTimeout;
    var _preventScrollIndex = false;
    var _useImageNavigationExt = localStorage.getItem('_useImageNavigationExt') == 'true';
    var _useDarkmode = localStorage.getItem('_useDarkmode') == 'true';

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
        _hCounter.innerHTML = `${(_scrollIndex | 0) + 1}/${_imageCount}`;
        clearTimeout(_counterTimeout);
        _counterTimeout = setTimeout(() => { _hCounter.innerHTML = '' }, fadeoutTime);
    }

    function disableScrollIndexPrevention() {
        _preventScrollIndex = false;
        history.replaceState(null, null, ' ');
    }

    function handleLinkClick(event) {
        _currentIndex = _scrollIndex = +event.target.dataset.indexto;
        _preventScrollIndex = true;
        clearTimeout(_preventScrollIndexTimeout);
        _preventScrollIndexTimeout =
            setTimeout(disableScrollIndexPrevention, _scrollTimeout + 1);
        updateCounter();
    }

    function toImage() {
        _scrollIndex = _currentIndex;
        _images[_currentIndex].scrollIntoView();
        _preventScrollIndex = true;
        clearTimeout(_preventScrollIndexTimeout);
        _preventScrollIndexTimeout =
            setTimeout(disableScrollIndexPrevention, SCROLL_APPLY_TIME);
        updateCounter();
    }

    //
    // Event handlers 
    //

    function handleKeydown(event) {
        if (event.key === 'ArrowRight') {
            _currentIndex = Math.floor(_currentIndex + 1);
            if (_currentIndex >= _imageCount) _currentIndex = 0;
            toImage();
        } else if (event.key === 'ArrowLeft') {
            _currentIndex = Math.ceil(_currentIndex - 1);
            if (_currentIndex < 0) _currentIndex = _imageCount - 1;
            toImage();
        }
    }

    function handleChange_checkboxWrapImage(event) {
        event.target.disabled = true;
        if (event.target.checked) {
            _useImageNavigationExt = true;
            localStorage.setItem('_useImageNavigationExt', true);
            EnableImageWrapping();
        } else {
            _useImageNavigationExt = false;
            localStorage.setItem('_useImageNavigationExt', false);
            DisableImageWrapping();
        }
        event.target.disabled = false;
        // window.location.reload();
    }

    function handleChange_checkboxDarkmode(event) {
        event.target.disabled = true;
        if (event.target.checked) {
            _useDarkmode = true;
            localStorage.setItem('_useDarkmode', true);
        } else {
            _useDarkmode = false;
            localStorage.setItem('_useDarkmode', false);
        }
        document.querySelector('html').classList.toggle('darkmode');
        event.target.disabled = false;
        // window.location.reload();
    }

    function handleScroll(event) {
        if (_preventScrollIndex) {
            clearTimeout(_preventScrollIndexTimeout);
            _preventScrollIndexTimeout =
                setTimeout(disableScrollIndexPrevention, SCROLL_APPLY_TIME);
            return;
        }

        _scrollIndex = 0;
        var rect;
        var hiddenCounter = true;
        for (; _scrollIndex < _imageCount; _scrollIndex++) {
            rect = _images[_scrollIndex].getBoundingClientRect();
            if (rect.top > window.innerHeight) { // if current image under the view
                _scrollIndex = _scrollIndex - .5; break;
            }
            if ((rect.top + rect.bottom) / 2 >= 0) { // if current image in the view
                hiddenCounter = false;
                break;
            }
        }
        if (rect.bottom < 0) { // if last image above the view
            _scrollIndex = _imageCount - 0.5;
        }

        if (_scrollIndex > _imageCount) {
            _scrollIndex = _imageCount - 1;
            console.log("How I ended up here?!");
        }

        if (hiddenCounter) {
            clearTimeout(_scrollTimeout);
            // _hCounter.innerHTML = '';
            _scrollTimeout = setTimeout(() => {
                _currentIndex = _scrollIndex;
            }, SCROLL_APPLY_TIME);
        } else {
            clearTimeout(_scrollTimeout);
            _scrollTimeout = setTimeout(() => {
                _currentIndex = _scrollIndex;
                updateCounter(COUNTER_FADEOUT_TIME - SCROLL_APPLY_TIME);
            }, SCROLL_APPLY_TIME);

            updateCounter();
        }
    }

    //
    // Wrapping images
    //

    function EnableImageWrapping() {
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

            linkF.addEventListener('click', handleLinkClick);
            linkB.addEventListener('click', handleLinkClick);
        }

        if (_images) {
            _hCounter = document.createElement('div');
            _hCounter.classList.add('image-counter');
            document.querySelector('body').appendChild(_hCounter);
        }

        window.addEventListener('keydown', handleKeydown);
        window.addEventListener('scroll', handleScroll)
    }

    function DisableImageWrapping() {
        window.removeEventListener('keydown', handleKeydown);
        window.removeEventListener('scroll', handleScroll);

        var figureWrapper;
        _images.forEach(i => {
            figureWrapper = i.parentNode.parentNode;
            figureWrapper.insertBefore(i, figureWrapper.firstChild);
            i.removeAttribute('id');
            i.removeAttribute('data-index');
            i.removeAttribute('data-indexto');
        })
        document.querySelectorAll('[href^="#_img-"]').forEach(x => x.remove());
        _hCounter.remove();
        _images = [];
    }

    //  
    // MAIN PART
    //

    window.addEventListener('load', function () {
        console.log('%c"Image navigation on telegraph" is running', 'color: yellow;');
        history.replaceState(null, null, ' ');

        //
        // Adding and changing the page style
        //

        document.querySelector('html').style.scrollBehavior = 'smooth';
        addGlobalStyle(backwardLinkStyle + imageCounterStyle + addressCheckbox);
        addGlobalStyle(darkmode);

        //
        // Adding an extension control checkbox
        //

        _hLabelUseExt = document.createElement('label');
        document.querySelector('address').appendChild(_hLabelUseExt);
        _hLabelUseExt.classList.add('address-checkbox');

        hInputUseExt = document.createElement('input');
        hInputUseExt.setAttribute('type', 'checkbox');
        hInputUseExt.checked = _useImageNavigationExt;
        _hLabelUseExt.appendChild(hInputUseExt)

        _hLabelUseExt.appendChild(document.createTextNode('Image navigation'));

        hInputUseExt.addEventListener('change', handleChange_checkboxWrapImage);

        document.getElementById('_edit_button')
            .addEventListener('click', () => {
                hInputUseExt.checked = false;
                DisableImageWrapping();
            });

        //
        // Adding an darkmode control checkbox
        //

        var _hLabelUseDarkmode = document.createElement('label');
        document.querySelector('address').appendChild(_hLabelUseDarkmode);
        _hLabelUseDarkmode.classList.add('address-checkbox');

        var hInputDarkmode = document.createElement('input');
        hInputDarkmode.setAttribute('type', 'checkbox');
        hInputDarkmode.checked = _useDarkmode;
        _hLabelUseDarkmode.appendChild(hInputDarkmode)

        _hLabelUseDarkmode.appendChild(document.createTextNode('Dark mode'));

        hInputDarkmode.addEventListener('change', handleChange_checkboxDarkmode);

        //
        // Wrapping images
        //

        if (_useImageNavigationExt) EnableImageWrapping();

        if (_useDarkmode) {
            document.querySelector('html').classList.toggle('darkmode');
        }
        
        console.log('%c"Image navigation on telegraph" has been successfully launched', 'color: green;');
    }, false)

})();
