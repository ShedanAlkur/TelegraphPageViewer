function create(pageObject) {

    const url = pageObject.url;
    const title = pageObject.title;
    const author = pageObject.author_name;
    const description = pageObject.description;
    const views = pageObject.views;
    const imageUrl = pageObject.image_url;

    var infoContainer
    var infoHeader;
    var infoContent;

    const pageBlock = document.createElement('div');
    pageBlock.classList.add('page-block');

    const info = document.createElement('div');
    info.classList.add('page-block__info');
    pageBlock.appendChild(info);

    // Title
    const header = document.createElement('a');
    header.classList.add('page-block__title');
    info.appendChild(header);
    header.setAttribute('href', url);
    header.innerText = title;

    // Author
    if (author) {
        infoContainer = document.createElement('div');
        info.appendChild(infoContainer);
        infoHeader = document.createElement('span');
        infoHeader.classList.add('page-block__info-header');
        infoHeader.innerText = 'Author:';
        infoContainer.appendChild(infoHeader);
        infoContent = document.createElement('span');
        infoContent.classList.add('page-block__info-content');
        infoContent.innerText = author;
        infoContainer.appendChild(infoContent);
        info.appendChild(infoContainer);
    }
    // Description
    if (description) {
        infoContainer = document.createElement('div');
        infoContainer.classList.add('description-container');        
        info.appendChild(infoContainer);
        infoHeader = document.createElement('span');
        infoHeader.classList.add('page-block__info-header');
        infoHeader.innerText = 'Description:';
        infoContainer.appendChild(infoHeader);
        infoContent = document.createElement('span');
        infoContent.classList.add('page-block__info-content');
        infoContent.innerText = description;
        infoContainer.appendChild(infoContent);
        info.appendChild(infoContainer);
    }
    // Views
    infoContainer = document.createElement('div');
    info.appendChild(infoContainer);
    infoHeader = document.createElement('span');
    infoHeader.classList.add('page-block__info-header');
    infoHeader.innerText = 'Views:';
    infoContainer.appendChild(infoHeader);
    infoContent = document.createElement('span');
    infoContent.classList.add('page-block__info-content');
    infoContent.innerText = views;
    infoContainer.appendChild(infoContent);
    info.appendChild(infoContainer);

    // Cover
    if (imageUrl){
        const imageContainer = document.createElement('a');
        imageContainer.classList.add('page-block__image-container');
        pageBlock.append(imageContainer);
        imageContainer.setAttribute('href', url);
        const image = document.createElement('img');
        image.setAttribute('src', imageUrl);
        imageContainer.appendChild(image);
    }

    return pageBlock;
}

export { create }