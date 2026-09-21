document.addEventListener('DOMContentLoaded', () => {
    let elems = document.querySelectorAll('.links_container');
    elems.forEach((elem) => {
        let elemText = elem.textContent;
        let urlRegex = /(https?:\/\/[^\s\[\]]+(?![^\[]*\]))/g;
        let elemWithLinks = elemText.replace(urlRegex, function(url) {
            return '<a target="_blank" href="' + url + '">' + url + '</a>';
        });
        elem.innerHTML = elemWithLinks;
    });
});