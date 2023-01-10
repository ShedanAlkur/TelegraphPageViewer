const baseUrl = new URL('https://api.telegra.ph')

async function getPageList(access_token, offset = 0, limit = 0) {
    const requestUrl = new URL('getPageList', baseUrl);
    requestUrl.search = new URLSearchParams({ access_token, offset, limit });
    
    // console.log(requestUrl.toString());
    // console.log(requestUrl.toString()); return;
    var response = await fetch('getPageList.json');
    // var response = await fetch(requestUrl);
    response = await response.json();
    
    return response;
}

async function getAccountInfo(access_token) {
    const requestUrl = new URL('getAccountInfo', baseUrl);
    requestUrl.search = new URLSearchParams({
        access_token,
        fields: `["short_name","author_name","author_url","page_count"]`
    });

    // console.log(requestUrl.toString()); return;
    var response = await fetch(requestUrl);
    response = await response.json();

    return response;
}

async function getAuthUrl(access_token) {
    const requestUrl = new URL('getAccountInfo', baseUrl);
    requestUrl.search = new URLSearchParams({
        access_token,
        fields: `["short_name","author_name","auth_url","page_count"]`
    });
    // console.log(requestUrl.toString()); return;
    var response = await fetch(requestUrl);
    response = await response.json();
    
    return response;
}

export { getPageList, getAccountInfo, getAuthUrl }