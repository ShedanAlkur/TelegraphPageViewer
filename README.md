
# Web tools for improved telegraph usage

## Telegraph page viewer v3

**[Open](https://shedanalkur.github.io/TelegraphPageViewer/ "Page")** page of viewer



**Supported query url parameters:**
- `access_token` *(String)*.
Access token of the Telegraph account. Sandbox account is used by default (from [Telegraph API tutorial](https://telegra.ph/api "Telegraph API tutorial")).
**Beware!** The access token parameter will be automatically deleted from the browser address bar after the page loads.
- `offset` *(Integer, default = 0)*.
Sequential number of the first page to be returned.
- `limit` *(Integer, 1-200, default = 50)*.
Limits the number of pages to be retrieved.

## Telegraph page viewer v2

**Outdated version with many problems and bugs** 

**[Open](https://shedanalkur.github.io/TelegraphPageViewer/v2/?run "Page")** page of viewer

Supported query url parameters:
- `run`.
Automatically loads the list of articles by the parameters available on the page.
*Does not require a value*.
- `access_token` *(String)*.
Access token of the Telegraph account. Sandbox account is used by default (from [Telegraph API tutorial](https://telegra.ph/api "Telegraph API tutorial")).
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

Example 1: https://shedanalkur.github.io/TelegraphPageViewer/v2/?run

Example 2: https://shedanalkur.github.io/TelegraphPageViewer/v2/?run&access_token=myaccesstoken&offset=0&limit=50&thumbnails=false&descriptions=true&slim=true


## User script

**[Install](https://github.com/ShedanAlkur/TelegraphPageViewer/raw/main/Telegraph_image_navigation.user.js "Install")** user script to navigate between images on telegraph.

The extension settings are placed in the drop-down menu in the author/date line.

**Features:**
- Dark theme for telegraph.
- Back to top button.
- Navigation between images:
	- Mouse clicks on the left and right side of the images.
	- Left and right arrows on the keyboard.

**Extension screenshots:**

![Extension_screenshot_1](assets/Extension_screenshot_1.png)
![Extension_screenshot_1](assets/Extension_screenshot_2.png)
