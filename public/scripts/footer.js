const initDate = () => {
    let elem = document.getElementById("current_datetime");

    // Get current date and time
    let currentDate = new Date();

    // Options for formatting the date and time
    let options = {
        weekday: "long", // Display the full weekday name
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false // Use 24-hour format
    };

    // Format the date and time without time zone
    let formattedDate = currentDate.toLocaleString(undefined, options);

    // Set the formatted date and time to the element
    elem.innerHTML = formattedDate;
}

setInterval(() => {
    initDate()
}, 1000)