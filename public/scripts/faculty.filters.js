let active = 0;

const types = [
    'Power Engineering',
    'Microelectronics and VLSI Design',
    "Signal Processing and Communication",
    "Faculty Fellows",
    "Former Faculty",
    "Retired Faculty"
]

const showAll = (faculties) => {
    let error_div = document.getElementById("error_div");
    error_div.classList.add("hidden");
    if (active == 0) {
        faculties.forEach((faculty) => {
            if (faculty.id == "Former Faculty" || faculty.id == "Retired Faculty") {
                faculty.classList.add("hidden");
            } else {
                faculty.classList.remove("hidden");
            }
    
        });
        
    }
    
}


const showByType = (faculties) => {
    let error_div = document.getElementById("error_div");
    error_div.classList.add("hidden");
    const type = types[active - 1];
    faculties.forEach((faculty) => {
        if (faculty.id != type) {
            faculty.classList.add("hidden");
        } else {
            faculty.classList.remove("hidden");
        }

    });
}

const handleTabsChange = (tabs, faculties) => {
    let error_div = document.getElementById("error_div");
    error_div.classList.add("hidden");
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t, index) => {
                t.classList.remove('active');
                t.classList.add("false");
                if (t == tab) {
                    active = index;
                    if (active == 0) {
                        showAll(faculties);
                    } else {
                        showByType(faculties)
                    }
                }
            });
            tab.classList.add('active');
            tab.classList.remove('false');
        })
    })
}

const handleSearchFaculty = (query, faculties) => {
    const type = active == 0 ? 0 : types[active - 1];
    let error_div = document.getElementById("error_div");
    error_div.classList.add("hidden");
    let found = false;
    if (type == 0) {
        faculties.forEach((faculty) => {
            faculty.classList.remove("hidden");
            let cards = faculty.querySelectorAll(".people_card");

            let isFoundInType = false;
            cards.forEach((card) => {
                let text = card.textContent.toLowerCase();
                if (text.includes(query.toLowerCase())) {
                    card.classList.remove("hidden");
                    faculty.classList.remove("hidden");
                    found = true;
                    isFoundInType = true;
                } else {
                    card.classList.add("hidden");
                }
            })
            if (!isFoundInType) {
                faculty.classList.add("hidden");
            }

        })
    } else {
        faculties.forEach((faculty) => {
            if (faculty.id == types[active - 1]) {
                faculty.classList.remove("hidden");
                let cards = faculty.querySelectorAll(".people_card");
                let isFoundInType = false;
                cards.forEach((card) => {
                    let text = card.textContent.toLowerCase();
                    if (text.includes(query.toLowerCase())) {
                        card.classList.remove("hidden");
                        faculty.classList.remove("hidden");
                        found = true;
                        isFoundInType = true;
                    } else {
                        card.classList.add("hidden");
                    }
                })
                if (!isFoundInType) {
                    faculty.classList.add("hidden");
                }
            }
        })
    }!found ? error_div.classList.remove("hidden") : error_div.classList.add("hidden");
}

window.addEventListener('load', () => {
    let faculties = document.querySelectorAll(".faculty_section");
    showAll(faculties);
    let tabs = document.querySelectorAll("#filter_by_types span");
    handleTabsChange(tabs, faculties);
    // Searchbar
    let searchbar = document.getElementById("search_faculty");
    searchbar.addEventListener('input', () => {
        let query = searchbar.value;
        handleSearchFaculty(query, faculties);

    })
})