const handleClickPublicationCount = (typeid) => {
    const tablist = document.querySelectorAll(".tablist_research");
    tablist.forEach((item) => {
        let span = item.querySelector("span");
        // Check if the span has an id attribute starting with "research_work_tab"
        if (item.id === "research_work_tab") {
            span.classList.add("active");
        } else {
            span.classList.remove("active");
        }
    });
    const contentlist = document.querySelectorAll(".content_research");
    let journal_pub = document.getElementById(typeid);
    contentlist.forEach((item) => {
        item.classList.add("fade");
        if (item.id === "fourth") {
            item.classList.add("active");
            item.classList.add("show");
            journal_pub.classList.add("show");
        } else {
            item.classList.remove("show");
            item.classList.remove("active");
        }
    });
    const element = document.getElementById(typeid);
    element.scrollIntoView({ behavior: 'smooth' });
};