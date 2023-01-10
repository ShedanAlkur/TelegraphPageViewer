import * as Telegraph from './telegraphApi.js';
import { create as createBlock } from './telegraphPageBlock.js';
import cssClassNames from './class_names.js'


const SANDBOX_ACCESS_TOKEN = 'd3b25feccb89e508a9114afb82aa421fe2a9712b963b387cc5ad71e58722';

// html
const h = document.querySelector('html');

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
            hCheckboxes.get(flagNames.hidePassword).setAttribute('title', 'Hide password');
        } else {
            hAccessToken.setAttribute('type', 'text');
            hCheckboxes.get(flagNames.hidePassword).setAttribute('title', 'Show password');
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
    const urlParams = new URLSearchParams(window.location.search);
    hVariables.forEach((input, variableName) => {
        do {
            // get from sessionStorage
            if ((value = sessionStorage.getItem(variableName)) != null) break;
            // else get from queryParams
            if ((value = urlParams.get(variableName)) != null
                && avaliableQueryNames.includes(variableName)) break;
            // else get from current html element value
            value = input.value;
        } while (false)
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
    console.log(history.state);
    if (history.state.access_token == variables.get(variableNames.access_token) &&
        history.state.offset == variables.get(variableNames.offset) &&
        history.state.limit == variables.get(variableNames.limit)) return;
    history.pushState(getHistoryStateObject(), '', '');
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

    hPageList.innerHTML = '';
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

    const offset = getOffset(
        variables.get(variableNames.limit),
        variables.get(variableNames.pageNumber));
    hOffset.value = offset;
    variables.set(variableNames.offset, offset);
    sessionStorage.setItem(variableNames.offset, offset);

    // document.getElementById('offset').validity.valid;
    hSearchForm.requestSubmit();

    updatePageButtonState(variables.get(variableNames.pageNumber));

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
    const response = await Telegraph.getPageList(
        access_token ? access_token : SANDBOX_ACCESS_TOKEN,
        offset,
        limit);
    console.log(response);
    if (response.ok) {
        const total_count = response.result.total_count;
        variables.set(variableNames.totalCount, total_count);
        hTopPaginatorDescription.innerText = getPaginatorDescription(offset, limit, total_count);
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
function updatePageButtonState(page_number) {
    if (page_number <= 1) {
        hTopPaginator.toFirstPage.classList.add(cssClassNames.disabledPaginatorButton);
        hTopPaginator.toPrevPage.classList.add(cssClassNames.disabledPaginatorButton);
    } else {
        hTopPaginator.toFirstPage.classList.remove(cssClassNames.disabledPaginatorButton);
        hTopPaginator.toPrevPage.classList.remove(cssClassNames.disabledPaginatorButton);
    }
}

document.getElementById('access_token_auth').addEventListener('click', async (event) => {
    const access_token = variables.get(variableNames.token);
    const response = await Telegraph.getAuthUrl(access_token ? access_token : SANDBOX_ACCESS_TOKEN);
    hAuthUrl.innerText = '';
    console.log(response);
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
});

addEventListener('DOMContentLoaded', (event) => {
    console.debug('%cDOMContentLoaded', 'color: yellow;');
    initiateInternalValues();

    if (history.state == null) history.replaceState(getHistoryStateObject(), '', '');
    console.log(history.state);

    // checkbox inChange handlers
    hCheckboxes.forEach((checkbox, flagName) => {
        checkbox.addEventListener('change', handler_onChange_checkbox);
    });
    // variable onInput handlers
    hVariables.forEach((input, variableName) => {
        input.addEventListener('input', handler_onInput_input);
    });
    hAccessToken.addEventListener('input', () => { hAccessToken.setCustomValidity(''); });

    updatePageButtonState(variables.get(variableNames.pageNumber));
    hTopPaginator.toFirstPage.addEventListener('click', handler_onClick_paginatorButton);
    hTopPaginator.toPrevPage.addEventListener('click', handler_onClick_paginatorButton);
    hTopPaginator.toNextPage.addEventListener('click', handler_onClick_paginatorButton);
    hTopPaginator.toLastPage.addEventListener('click', handler_onClick_paginatorButton);


    if (flags.get(flagNames.autorun)) hSearchForm.requestSubmit();
});
