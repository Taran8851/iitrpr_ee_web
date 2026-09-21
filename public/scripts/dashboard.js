const dashboardToggle = () => {
    let sidebar = document.getElementById("dashboard_sidebar");
    sidebar.classList.toggle("sidebar_toggle");

}



window.addEventListener('load', () => {
    let sidebar = document.getElementById("dashboard_sidebar");
    // Check if the sidebar is in mobile mode (adjust the condition as needed)
    if (window.innerWidth < 1000) {
        sidebar.classList.add("sidebar_toggle");
    } else {
        sidebar.classList.remove("sidebar_toggle");
    }
});