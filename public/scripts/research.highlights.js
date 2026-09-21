window.addEventListener('load', () => {
    let elems = document.querySelectorAll('.count_custom');

    elems.forEach((item, index) => {
        let count = Number(item.innerHTML);
        let time = item.getAttribute('time');
        customCount(item, count, time);
    });
});

function customCount(element, count, time) {
    const delay = Math.round(time / count);
    let currentCount = 0;
    let intervalId = setInterval(() => {
        element.innerHTML = currentCount;
        if (currentCount === count) {
            clearInterval(intervalId);
        }
        currentCount++;
    }, delay);
}