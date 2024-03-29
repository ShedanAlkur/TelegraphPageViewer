import * as Telegraph from './telegraphApi.js';
import { create as createBlock } from './telegraphPageBlock.js';
import cssClassNames from './class_names.js'


const SANDBOX_ACCESS_TOKEN = 'd3b25feccb89e508a9114afb82aa421fe2a9712b963b387cc5ad71e58722';

// html
const h = document.querySelector('html');
const hTopButton = document.getElementById('top_button');

// search form
const hSearchForm = document.getElementById('request_form');
const hAccessToken = document.getElementById('access_token');
const hOffset = document.getElementById('offset');
const hLimit = document.getElementById('limit');
const hSearchFormSubmit = document.getElementById('request_form_submit');
const hAuthUrl = document.getElementById('auth_url');

const hShowSetting = document.getElementById('show_setting');
const hSettingLabel = document.getElementById('label_show_setting');
const hSettingBlock = document.getElementById('setting_block');

// page number form
const hTopPaginatorDescription = document.getElementById('paginator_description');
const hPageForm = document.getElementById('page_form');
const hPageNumber = document.getElementById('page_number');
const hPageSelectorSubmit = document.getElementById('page_submit');

// page navigation button
const hTopPaginator = {
    toFirstPage: document.getElementById('top_button_first_page'),
    toPrevPage: document.getElementById('top_button_prev_page'),
    toNextPage: document.getElementById('top_button_next_page'),
    toLastPage: document.getElementById('top_button_last_page'),
}

//
const hLoader = document.getElementById('loader');
const hPageList = document.getElementById('page_list');

// form field value variables
var access_token = hAccessToken.value ?? SANDBOX_ACCESS_TOKEN;
var offset = +hOffset.value;
var limit = +hLimit.value;
var total_count = 0;
var page_number = +hPageNumber.value;

//
//  Flags
//

const flagNames = {
    hidePassword: 'hide_password',
    showSetting: 'show_setting',
    darkmode: 'darkmode',
    autorun: 'autorun',
    showCompact: 'show_compact',
    showDescription: 'show_description',
    showCover: 'show_cover',
}

var isRequestSubmitByPopState = false;

// flag values
const flags = new Map([
    [flagNames.hidePassword, false],
    [flagNames.showSetting, false],
    [flagNames.darkmode, false],
    [flagNames.autorun, false],
    [flagNames.showCompact, false],
    [flagNames.showDescription, false],
    [flagNames.showCover, false],
]);

// function toggleElementClass(element, className, flag, isReversed = false) {
//     element.classList.toggle(className, flag ^ isReversed);
// }
function toggleElementClass(element, className, flag, isReversed = false) {
    if (flag ^ isReversed) element.classList.add(className);
    else element.classList.remove(className);
}

const flagDelegates = new Map([
    [flagNames.darkmode, () => {
        toggleElementClass(h, cssClassNames.darkmode, flags.get(flagNames.darkmode))
    }],
    [flagNames.showSetting, () => {
        toggleElementClass(hSettingBlock, cssClassNames.disabledSetting, flags.get(flagNames.showSetting), true);
        toggleElementClass(hSettingLabel, cssClassNames.activeSettingLabel, flags.get(flagNames.showSetting));
    }],
    [flagNames.hidePassword, () => {
        if (flags.get(flagNames.hidePassword)) {
            hAccessToken.setAttribute('type', 'password');
            hCheckboxes.get(flagNames.hidePassword).setAttribute('title', 'Show password');
        } else {
            hAccessToken.setAttribute('type', 'text');
            hCheckboxes.get(flagNames.hidePassword).setAttribute('title', 'Hide password');
        }
    }],
    // is it okay?
    [flagNames.autorun, () => { }],
    [flagNames.showCompact, () => {
        toggleElementClass(hPageList, cssClassNames.showCompact, flags.get(flagNames.showCompact));
    }],
    [flagNames.showDescription, () => {
        toggleElementClass(hPageList, cssClassNames.showDescription, flags.get(flagNames.showDescription), true);
    }],
    [flagNames.showCover, () => {
        toggleElementClass(hPageList, cssClassNames.showCover, flags.get(flagNames.showCover), true);
    }],
]);

// flag checkboxes
const hCheckboxes = new Map([
    [flagNames.hidePassword, document.getElementById('hide_password')],
    [flagNames.showSetting, document.getElementById('show_setting')],
    [flagNames.darkmode, document.getElementById('darkmode')],
    [flagNames.autorun, document.getElementById('autorun')],
    [flagNames.showCompact, document.getElementById('show_compact')],
    [flagNames.showCover, document.getElementById('show_cover')],
    [flagNames.showDescription, document.getElementById('show_description')],
]);

//
// Variables
//

const variableNames = {
    token: 'access_token',
    offset: 'offset',
    limit: 'limit',
    pageNumber: 'page_number',
    totalCount: 'total_count',
}

const avaliableQueryNames = [
    variableNames.token,
    variableNames.offset,
    variableNames.limit
];

// variable Values
const variables = new Map([
    [variableNames.token, ''],
    [variableNames.offset, 0],
    [variableNames.limit, 0],
    [variableNames.pageNumber, 0],
    [variableNames.totalCount, 0],
]);

const hVariables = new Map([
    [variableNames.token, document.getElementById('access_token')],
    [variableNames.offset, document.getElementById('offset')],
    [variableNames.limit, document.getElementById('limit')],
    [variableNames.pageNumber, document.getElementById('page_number')],
]);


/** Load all flags and inputs from localStorage, sessionStorage and queryParams */
function initiateInternalValues() {
    console.debug('%cinit', 'color: yellow;');

    var value;

    // loading checkboxes from localStorage
    hCheckboxes.forEach((checkbox, flagName) => {
        if (value = localStorage.getItem(flagName)) {
            value = value === 'true';
            checkbox.checked = value;
        } else {
            value = checkbox.checked;
            localStorage.setItem(flagName, value); // OKAY?
        }
        flags.set(flagName, value);
        flagDelegates.get(flagName)();
    });
    console.debug('flags:');
    console.debug(flags);

    // loading variables from sessionStorage and queryParams
    var page_number, workaroundFlag = false;
    const urlParams = new URLSearchParams(window.location.search);
    hVariables.forEach((input, variableName) => {
        do {
            // get from sessionStorage
            if ((value = sessionStorage.getItem(variableName)) != null) break;
            // else get from queryParams
            if ((value = urlParams.get(variableName)) != null
                && avaliableQueryNames.includes(variableName)) break;
            // else get from current html element value
            if (variableName === variableNames.pageNumber) { // Workaround for page_number variable
                value = getPageNumber(
                    variables.get(variableNames.offset),
                    variables.get(variableNames.limit));
                page_number = value;
                workaroundFlag = true;
                break;
            }
            value = input.value;
        } while (false)
        if (variableName === variableNames.pageNumber && workaroundFlag) { // Workaround for page_number variable
            value = page_number;
            console.log(`page_number ${value}`);
        }
        if (input.type === 'number') value = +value;
        input.value = value;
        variables.set(variableName, value);
        sessionStorage.setItem(variableName, value); // OKAY?
    });
    console.debug('variables:');
    console.debug(variables);

}

//
// Work with History Api
//

function getHistoryStateObject() {
    var state = {};
    variables.forEach((value, variableName) => {
        state[variableName] = value;
    });
    return state;
}

function pushState() {
    console.debug('pushState');
    const access_token = variables.get(variableNames.token);
    const offset = variables.get(variableNames.offset);
    const limit = variables.get(variableNames.limit);
    if (history.state.access_token == access_token &&
        history.state.offset == offset &&
        history.state.limit == limit) return;
    const params = new URLSearchParams();
    // if (access_token) params.set(variableNames.token, access_token);
    params.set(variableNames.offset, offset);
    params.set(variableNames.limit, limit);
    history.pushState(getHistoryStateObject(), '', '?' + params.toString());
}

addEventListener('popstate', (event) => {
    console.debug('%cpopstate', 'color: yellow;');
    var value;
    variables.forEach((_, variableName) => {
        if ((value = history.state[variableName]) != null) {
            var input;
            if (input = hVariables.get(variableName)) {
                if (input.type !== 'text' && input.type !== 'password') value = +value;
                input.value = value;
                variables.set(variableName, value);
            } else {
                value = +value;
                variables.set(variableName, value);
            }
        }
    });
    hAccessToken.setCustomValidity('');
    isRequestSubmitByPopState = true;
    if (flags.get(flagNames.autorun)) hSearchForm.requestSubmit();
});

//
// Handlers
//

function handler_onChange_checkbox(event) {
    flags.set(event.target.name, event.target.checked);
    localStorage.setItem(event.target.name, event.target.checked);
    flagDelegates.get(event.target.name)();
}

function handler_onInput_input(event) {
    const value = event.target.type === 'number' ? +event.target.value : event.target.value;
    variables.set(event.target.name, value);
    sessionStorage.setItem(event.target.name, event.target.value);
}

function handler_onClick_paginatorButton(event) {
    event.preventDefault();
    var page_number;
    const total_count = variables.get(variableNames.totalCount);
    const limit = variables.get(variableNames.limit);
    switch (event.target.dataset.destination) {
        case 'first': page_number = 1; break;
        case 'prev': page_number = (+hPageNumber.value - 1); break;
        case 'next': page_number = (+hPageNumber.value + 1); break;
        case 'last':
            page_number = Math.floor(total_count / limit);
            page_number += ((total_count % limit == 0) ? 0 : 1);
            page_number = Math.max(page_number, 1);
            break;
        default:
            return;
    }
    sessionStorage.setItem(variableNames.pageNumber, page_number);
    variables.set(variableNames.pageNumber, page_number);
    hPageNumber.value = page_number;
    hPageForm.requestSubmit();
}

document.getElementById('copy_url').addEventListener('click', (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const access_token = variables.get(variableNames.token);
    if (access_token) params.set(variableNames.token, access_token);
    const limit = variables.get(variableNames.limit);
    params.set(variableNames.limit, limit);
    const offset = variables.get(variableNames.offset);
    params.set(variableNames.offset, offset);

    const url = new URL(window.location.href);
    url.search = params.toString();
    navigator.clipboard.writeText(url.toString());
});

window.addEventListener('scroll', (event) => {
    toggleElementClass(hTopButton, cssClassNames.hiddenTopButton, window.scrollY > 250, true)
})

hTopButton.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

//
// Submits
//

hSearchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const doPushState = !isRequestSubmitByPopState;
    isRequestSubmitByPopState = false;
    console.debug('%chSearchForm loading!', 'color: yellow;');

    const pageNumber = getPageNumber(
        variables.get(variableNames.offset),
        variables.get(variableNames.limit)
    );
    hPageNumber.value = pageNumber;
    variables.set(variableNames.pageNumber, pageNumber);
    sessionStorage.setItem(variableNames.pageNumber, pageNumber);
    updatePageButtonStatus(pageNumber);

    loadPageList(
        variables.get(variableNames.token),
        variables.get(variableNames.offset),
        variables.get(variableNames.limit)
    );
    if (doPushState) pushState();
    console.debug('%chSearchForm loaded!', 'color: green;');
})

hPageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    console.debug('%chPageForm loading!', 'color: yellow;');

    if (!hLimit.reportValidity()) return;

    const limit = variables.get(variableNames.limit);
    const page_number = variables.get(variableNames.pageNumber);
    const offset = getOffset(limit, page_number);
    hOffset.value = offset;
    variables.set(variableNames.offset, offset);
    sessionStorage.setItem(variableNames.offset, offset);

    // document.getElementById('offset').validity.valid;
    hSearchForm.requestSubmit();

    // updatePageButtons(variables.get(variableNames.pageNumber));

    // pushState();
    console.debug('%chPageForm loaded!', 'color: green;');
});

//
// Utils
//

function getOffset(limit, page_number) {
    return (page_number - 1) * limit;
}

function getPageNumber(offset, limit) {
    return page_number = Math.floor(offset / limit) + 1;
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

async function loadPageList(access_token, offset, limit) {
    try {
        hPageList.innerHTML = '';
        hLoader.classList.remove(cssClassNames.disabledLoader);
        const response = await Telegraph.getPageList(
            access_token ? access_token : SANDBOX_ACCESS_TOKEN,
            offset,
            limit);
        console.debug(response);
        if (response.ok) {
            hPageList.innerHTML = '';
            const total_count = response.result.total_count;
            variables.set(variableNames.totalCount, total_count);
            hTopPaginatorDescription.innerText = getPaginatorDescription(offset, limit, total_count);
            updatePageButtonHref(variables.get(variableNames.pageNumber));
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
    catch (err) {
        console.error(err);
    }
    finally {
        hLoader.classList.add(cssClassNames.disabledLoader);
    }
}

function updatePageButtonStatus(page_number) {
    if (page_number <= 1) {
        hTopPaginator.toFirstPage.classList.add(cssClassNames.disabledPaginatorButton);
        hTopPaginator.toPrevPage.classList.add(cssClassNames.disabledPaginatorButton);
    } else {
        hTopPaginator.toFirstPage.classList.remove(cssClassNames.disabledPaginatorButton);
        hTopPaginator.toPrevPage.classList.remove(cssClassNames.disabledPaginatorButton);
    }
}

function updatePageButtonHref(page_number) {
    // console.log('Ахтунг!');
    const access_token = variables.get(variableNames.token);
    const limit = variables.get(variableNames.limit);
    const total_count = variables.get(variableNames.totalCount);

    const params = new URLSearchParams();
    if (access_token) params.set(variableNames.token, access_token);
    params.set(variableNames.limit, limit);

    // to first page
    params.set(variableNames.offset, 0);
    hTopPaginator.toFirstPage.href = '?' + params.toString();
    // to previous page
    params.set(variableNames.offset, getOffset(limit, page_number - 1));
    hTopPaginator.toPrevPage.href = '?' + params.toString();
    // to next page
    params.set(variableNames.offset, getOffset(limit, page_number + 1));
    hTopPaginator.toNextPage.href = '?' + params.toString();
    // to last page
    page_number = Math.floor(total_count / limit);
    page_number += ((total_count % limit == 0) ? 0 : 1);
    page_number = Math.max(page_number, 1);
    params.set(variableNames.offset, getOffset(limit, page_number));
    hTopPaginator.toLastPage.href = '?' + params.toString();
}

document.getElementById('access_token_auth').addEventListener('click', async (event) => {
    hLoader.classList.remove(cssClassNames.disabledLoader);
    const access_token = variables.get(variableNames.token);
    const response = await Telegraph.getAuthUrl(access_token ? access_token : SANDBOX_ACCESS_TOKEN);
    hAuthUrl.innerText = '';
    if (response.ok) {
        const total_count = response.result.total_count;
        variables.set(variableNames.totalCount, total_count);
        const short_name = response.result.short_name;
        const author_name = response.result.author_name;
        const auth_url = response.result.auth_url;
        var text = '';
        if (short_name) text += ` "${short_name}" `;
        if (author_name) text += ` - "${author_name}" `;
        text += ` auth url`;
        hAuthUrl.innerText = text;
        hAuthUrl.href = auth_url;
    } else {
        if (response.error === 'ACCESS_TOKEN_INVALID') {
            hAccessToken.setCustomValidity(response.error);
            hAccessToken.reportValidity();
        }
    }
    hLoader.classList.add(cssClassNames.disabledLoader);
});

addEventListener('DOMContentLoaded', (event) => {
    console.debug('%cDOMContentLoaded', 'color: yellow;');
    initiateInternalValues();

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete(variableNames.token);
    history.replaceState(getHistoryStateObject(), '', '?' + urlParams.toString());

    // checkbox inChange handlers
    hCheckboxes.forEach((checkbox, flagName) => {
        checkbox.addEventListener('change', handler_onChange_checkbox);
    });
    // variable onInput handlers
    hVariables.forEach((input, variableName) => {
        input.addEventListener('input', handler_onInput_input);
    });
    hAccessToken.addEventListener('input', () => { hAccessToken.setCustomValidity(''); });

    updatePageButtonStatus(variables.get(variableNames.pageNumber));
    updatePageButtonHref(variables.get(variableNames.pageNumber));
    hTopPaginator.toFirstPage.addEventListener('click', handler_onClick_paginatorButton);
    hTopPaginator.toPrevPage.addEventListener('click', handler_onClick_paginatorButton);
    hTopPaginator.toNextPage.addEventListener('click', handler_onClick_paginatorButton);
    hTopPaginator.toLastPage.addEventListener('click', handler_onClick_paginatorButton);


    if (flags.get(flagNames.autorun)) hSearchForm.requestSubmit();
});
