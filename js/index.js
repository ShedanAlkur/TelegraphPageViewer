import * as Telegraph from './telegraphApi.js';
import { create as createBlock } from './telegraphPageBlock.js';

const SANDBOX_ACCESS_TOKEN = 'd3b25feccb89e508a9114afb82aa421fe2a9712b963b387cc5ad71e58722';

const h = document.querySelector('html');

// search form
const hSearchForm = document.getElementById('search_form');
const hAccessToken = document.getElementById('access_token');
const hOffset = document.getElementById('offset');
const hLimit = document.getElementById('limit');
const hSearchFormSubmit = document.getElementById('search_form_submit');

// page number form
const hPaginatorDescription = document.getElementById('paginator_description');
const hPageForm = document.getElementById('page_selector');
const hPageNumber = document.getElementById('page_number');
const hPageSelectorSubmit = document.getElementById('page_submit');

// page navigation button
const hTopToFirstPage = document.getElementById('top_button_first_page');
const hTopToPrevPage = document.getElementById('top_button_prev_page');
const hTopToNextPage = document.getElementById('top_button_next_page');
const hTopToLastPage = document.getElementById('top_button_last_page');

//
const hPageList = document.getElementById('page_list');

// form field value variables
var access_token = hAccessToken.value ?? SANDBOX_ACCESS_TOKEN;
var offset = +hOffset.value;
var limit = +hLimit.value;
var total_count = 0;
var page_number = +hPageNumber.value;

// visual variables
var darkmode = false;
var autorun = true;
var showCompact = false;
var showCover = true;
var showDescription = true;
var hidePassword = false;

function setVisualClass(element, className, flag, reversed = false){
    if (flag ^ reversed){
        element.classList.add(className);
    } else{
        element.classList.remove(className);
    }
}

function getLocalStorage() {
    if (localStorage.getItem('darkmode') != null) {
        darkmode = localStorage.getItem('darkmode') == 'true';
        document.getElementById('darkmode').checked = darkmode;
    }
    if (localStorage.getItem('autorun') != null) {
        autorun = localStorage.getItem('autorun') == 'true';
        document.getElementById('autorun').checked = autorun;
    }
    if (localStorage.getItem('showCompact') != null) {
        showCompact = localStorage.getItem('showCompact') == 'true';
        document.getElementById('showCompact').checked = showCompact;
    }
    if (localStorage.getItem('showCover') != null) {
        showCover = localStorage.getItem('showCover') == 'true';
        document.getElementById('showCover').checked = showCover;
    }
    if (localStorage.getItem('showDescription') != null) {
        showDescription = localStorage.getItem('showDescription') == 'true';
        document.getElementById('showDescription').checked = showDescription;
    }
    if (localStorage.getItem('hidePassword') != null) {
        hidePassword = localStorage.getItem('hidePassword') == 'true';
        document.getElementById('hidePassword').checked = hidePassword;
    }
    
    setVisualClass(h, 'darkmode', darkmode, false);
    setVisualClass(hPageList, 'page-list_compact', showCompact, false);
    setVisualClass(hPageList, 'page-list_description_hidden', showDescription, true);
    setVisualClass(hPageList, 'page-list_cover_hidden', showCover, true);
}

async function loadPageList(access_token, offset, limit) {
    const response = await Telegraph.getPageList(
        access_token ? access_token : SANDBOX_ACCESS_TOKEN,
        offset,
        limit);
    console.log(response);
    if (response.ok) {
        total_count = response.result.total_count;
        hPaginatorDescription.innerText = getPaginatorDescription(offset, limit, total_count);
        response.result.pages.forEach(page => {
            hPageList.appendChild(createBlock(page));
        });
    } else {
        if (response.error === 'ACCESS_TOKEN_INVALID') {
            hAccessToken.setCustomValidity(response.error);
            hAccessToken.reportValidity();
        }
    }
}

/** Creating string that represents showing page interval */
function getPaginatorDescription(offset, limit, total_count) {
    var firstIndex = offset + 1;
    var lastIndex = Math.min(offset + limit, total_count);
    var result;
    if (firstIndex > total_count)
        result = `Showing 0 of ${total_count}`
    else
        result = `Showing ${firstIndex} - ${lastIndex} of ${total_count}`
    return result;
}

/** Calculating offset by current page group number */
function getOffset(limit, page_number) {
    return (page_number - 1) * limit;
}

function getPageNumber(offset, limit) {
    return page_number = Math.floor(offset / limit) + 1;
}

function setSessionStorage() {
    console.debug('setSessionStorage');
    sessionStorage.setItem('access_token', access_token);
    sessionStorage.setItem('offset', offset);
    sessionStorage.setItem('limit', limit);
    sessionStorage.setItem('total_count', total_count);
    sessionStorage.setItem('page_number', page_number);
}

function getSessionStorage() {
    console.debug('getSessionStorage');
    console.debug(sessionStorage);
    if (sessionStorage.getItem('access_token') != null) access_token = sessionStorage.getItem('access_token');
    if (sessionStorage.getItem('offset') != null) offset = +sessionStorage.getItem('offset');
    if (sessionStorage.getItem('limit') != null) limit = +sessionStorage.getItem('limit');
    if (sessionStorage.getItem('total_count') != null) total_count = +sessionStorage.getItem('total_count');
    if (sessionStorage.getItem('page_number') != null) page_number = +sessionStorage.getItem('page_number');
}

/** Set internal variables to html values */
function setHtmlValues() {
    console.debug('setHtmlValues');
    if (access_token != null) hAccessToken.value = access_token;
    if (offset != null) hOffset.value = offset;
    if (limit != null) hLimit.value = limit;
    if (page_number != null) hPageNumber.value = page_number;
}

/** Get html values to internal variables */
function getHtmlValues() {
    console.debug('getHtmlValues');
    access_token = hAccessToken.value;
    offset = hOffset.value;
    limit = hLimit.value;
    page_number = hPageNumber.value;
}

/** Push all variables with History Api */
function pushState() {
    console.debug('pushState');
    if (history.state.access_token == access_token &&
        history.state.offset == offset &&
        history.state.limit == limit) return;
    history.pushState(
        {
            access_token: hAccessToken.value,
            offset: hOffset.value,
            limit: hLimit.value,
            total_count,
            page_number: hPageNumber.value
        },
        '', ''
    );
}

/** Pop all variables with History Api */
function popState() {
    console.debug('popstate');
    if (history.state == null) {
        location.reload();
        return;
    }

    access_token = history.state.access_token ?? access_token;
    hAccessToken.setCustomValidity('');
    offset = history.state.offset ?? offset;
    limit = history.state.limit ?? limit;
    total_count = history.state.total_count ?? total_count;
    page_number = history.state.page_number ?? page_number;
}

addEventListener('popstate', (event) => {
    popState()
    setHtmlValues();
    updatePageButtonState();
    if (autorun) hSearchForm.requestSubmit();
});

addEventListener('DOMContentLoaded', (event) => {
    console.debug('DOMContentLoaded');

    // 
    //  Initializating internal variables
    //

    getLocalStorage();
    getSessionStorage();
    setHtmlValues();
    updatePageButtonState(page_number);
    if (history.state == null) {
        history.replaceState(
            {
                access_token: hAccessToken.value,
                offset: hOffset.value,
                limit: hLimit.value,
                total_count,
                page_number: hPageNumber.value
            },
            '', ''
        );
    }

    //
    // Setting form event
    //

    document.getElementById('darkmode').addEventListener('change', (event) => {
        localStorage.setItem(event.target.name, event.target.checked);
        darkmode = event.target.checked;
        setVisualClass(h, 'darkmode', darkmode, false);
    });

    document.getElementById('autorun').addEventListener('change', (event) => {
        localStorage.setItem(event.target.name, event.target.checked);
        autorun = event.target.checked;
    });

    document.getElementById('showCompact').addEventListener('change', (event) => {
        localStorage.setItem(event.target.name, event.target.checked);
        showCompact = event.target.checked;
        setVisualClass(hPageList, 'page-list_compact', showCompact, false);
    });

    document.getElementById('showDescription').addEventListener('change', (event) => {
        localStorage.setItem(event.target.name, event.target.checked);
        showDescription = event.target.checked;
        setVisualClass(hPageList, 'page-list_description_hidden', showDescription, true);
    });

    document.getElementById('showCover').addEventListener('change', (event) => {
        localStorage.setItem(event.target.name, event.target.checked);
        showCover = event.target.checked;
        setVisualClass(hPageList, 'page-list_cover_hidden', showCover, true);
    });

    //
    // Search form events
    //

    const accessTokenCheckbox = document.getElementById('access_token_checkbox');
    accessTokenCheckbox.addEventListener('change', (event) => {
        if (event.target.checked) {
            hAccessToken.setAttribute('type', 'password');
            event.target.setAttribute('title', 'Show password');
        }
        else {
            hAccessToken.setAttribute('type', 'text');
            event.target.setAttribute('title', 'Hide password');
        }
    });

    hSearchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.debug('%chSearchForm loading!', 'color: yellow;');

        hPageNumber.value = getPageNumber(offset, limit);

        hPageList.innerHTML = '';
        loadPageList(access_token, offset, limit);
        pushState();
        console.debug('%chSearchForm loaded!', 'color: green;');
    })

    document.getElementById('access_token_apply').addEventListener('click', async (event) => {
        const response = await Telegraph.getAccountInfo(access_token ? access_token : SANDBOX_ACCESS_TOKEN);
        console.log(response);
        if (response.ok) {
            total_count = response.result.total_count;
        } else {
            if (response.error === 'ACCESS_TOKEN_INVALID') {
                hAccessToken.setCustomValidity(response.error);
                hAccessToken.reportValidity();
            }
        }
    });

    // on search form input
    hAccessToken.addEventListener('input', () => {
        access_token = hAccessToken.value;
        sessionStorage.setItem('access_token', access_token);
        hAccessToken.setCustomValidity('');
    });
    hOffset.addEventListener('input', () => {
        offset = +hOffset.value;
        sessionStorage.setItem('offset', offset);
    });
    hLimit.addEventListener('input', () => {
        limit = +hLimit.value;
        sessionStorage.setItem('limit', limit);
    });

    //
    // Page selector events
    //

    function updatePageButtonState(page_number) {
        if (page_number <= 1) {
            hTopToFirstPage.classList.add('menu-button_disabled');
            hTopToPrevPage.classList.add('menu-button_disabled');
        } else {
            hTopToFirstPage.classList.remove('menu-button_disabled');
            hTopToPrevPage.classList.remove('menu-button_disabled');
        }
    }

    hPageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        console.debug('%chPageForm loading!', 'color: yellow;');

        if (!hLimit.reportValidity()) return;

        offset = getOffset(limit, page_number)
        sessionStorage.setItem('offset', offset);
        hOffset.value = offset;

        // document.getElementById('offset').validity.valid;
        hSearchForm.requestSubmit();

        updatePageButtonState(page_number);

        // pushState();
        console.debug('%chPageForm loaded!', 'color: green;');
    })

    // on page form input
    hPageNumber.addEventListener('input', () => {
        page_number = +hPageNumber.value;
        sessionStorage.setItem('page_number', page_number);
    });

    //
    // page navigation buttons
    //

    hTopToFirstPage.addEventListener('click', (event) => {
        event.preventDefault();
        page_number = 1;
        sessionStorage.setItem('page_number', page_number);
        hPageNumber.value = page_number;
        hPageForm.requestSubmit();
    })

    hTopToPrevPage.addEventListener('click', (event) => {
        event.preventDefault();
        page_number = (+hPageNumber.value - 1);
        sessionStorage.setItem('page_number', page_number);
        hPageNumber.value = page_number;
        hPageForm.requestSubmit();
    })

    hTopToNextPage.addEventListener('click', (event) => {
        event.preventDefault();
        page_number = (+hPageNumber.value + 1)
        sessionStorage.setItem('page_number', page_number);
        hPageNumber.value = page_number;
        hPageForm.requestSubmit();
    })

    hTopToLastPage.addEventListener('click', (event) => {
        event.preventDefault();
        page_number = (Math.floor(total_count / limit) + ((total_count % limit == 0) ? 0 : 1));
        sessionStorage.setItem('page_number', page_number);
        hPageNumber.value = page_number;
        hPageForm.requestSubmit();
    })

    if (autorun) hSearchForm.requestSubmit();
});
