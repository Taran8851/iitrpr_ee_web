window.addEventListener("load", () => {
    console.log("working")
        // Create a script element for FontAwesome
    let fontAwesome = document.createElement("script");
    fontAwesome.src = "https://kit.fontawesome.com/e87ee1495e.js";
    fontAwesome.crossOrigin = "anonymous";
    document.head.appendChild(fontAwesome);

    // Check if the Google Translate script is not already present
    if (!document.querySelector('script[src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"]')) {
        // Create a script element for Google Translate
        let googleScript = document.createElement("script");
        googleScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.head.append(googleScript);
    }

    googleTranslateElementInit
    // // Prevent context menu
    // document.addEventListener("contextmenu", function(event) {
    //     event.preventDefault();
    // }, false);
});

function googleTranslateElementInit() {
    new google.translate.TranslateElement({
            pageLanguage: "en",
            includedLanguages: "en,hi,pa,fr,zh-CN,gu,ta,kn,ml,te,ur,bn,or,mr",
            // Specify the languages you want
            autoDisplay: false,
        },
        "google_translate_element"
    );
}


// Navbar
document.addEventListener("DOMContentLoaded", function() {
    const navBar = document.querySelector(".navbarBgDark");
    const sttp = document.getElementById("back-to-top_");
    let prevScrollPos = window.scrollY;

    const handleScroll = () => {
        const currentScrollPos = window.scrollY;

        // Calculate 20% of the viewport height
        const percentHeight = 1.5 * window.innerHeight;

        // Check the scroll direction and position
        if (currentScrollPos > percentHeight && currentScrollPos > prevScrollPos) {
            // Scrolling down, add the class
            navBar.classList.add("navbar_links");
            sttp.classList.add("back-to-top-active")

        } else {
            // Scrolling up or not scrolled enough, remove the class
            navBar.classList.remove("navbar_links");
            sttp.classList.remove("back-to-top-active")
        }

        prevScrollPos = currentScrollPos;
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener when the page is unloaded
    window.addEventListener("unload", function() {
        window.removeEventListener("scroll", handleScroll);
    });
});