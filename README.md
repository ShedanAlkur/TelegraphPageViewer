
# Web tools for improved telegraph usage

## Telegraph list page viewer

**[Open](https://shedanalkur.github.io/TelegraphPageViewer/?run "Page")** page of viewer

Supported query url parameters:
- `run`.
Automatically loads the list of articles by the parameters available on the page.
*Does not require a value*.
- `access_token` *(String)*.
Required. Access token of the Telegraph account.
- `offset` *(Integer, default = 0)*.
Sequential number of the first page to be returned.
- `limit` *(Integer, 0-200, default = 50)*.
Limits the number of pages to be retrieved.
- `thumbnails` *(boolean, default = true)*.
Show page preview images of articles.
- `descriptions` *(boolean, default = true)*.
Show article descriptions.
- `slim` *(boolean, default = false)*.
Show the list of articles in a compact mode

Example 1: https://shedanalkur.github.io/TelegraphPageViewer/?run

Example 2: https://shedanalkur.github.io/TelegraphPageViewer/?run&access_token=myaccesstoken&offset=0&limit=50&thumbnails=false&descriptions=true&slim=true


## User script

**[Install](https://github.com/ShedanAlkur/TelegraphPageViewer/raw/anime/Telegraph_image_navigation.user.js "Install")**
user script to navigate between images on telegraph.
