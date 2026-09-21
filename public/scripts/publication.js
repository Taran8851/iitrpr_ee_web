const RedirectPage = (paramName, paramValue) => {
    const url = new URL(window.location.href);
    if (paramValue !== '') {
        url.searchParams.set(paramName, paramValue);
    } else {
        url.searchParams.delete(paramName);
    }
    url.searchParams.set('page', 1);
    window.location.href = url.toString();
};


const fn = (event, type) => {
    if (event.key === 'Enter') {
        const inputValue = event.target.value.trim();
        RedirectPage(type, inputValue);
        event.preventDefault();
    }
};


const RedirectChangePage = (q, maxPages) => {
    const url = new URL(window.location.href);
    let currentPage = parseInt(url.searchParams.get('page')) || 1;
    if (q === 'prev') {
        currentPage = Math.max(1, currentPage - 1);
    } else if (q === 'next') {
        if (currentPage == maxPages) {
            currentPage = maxPages;
        } else {
            currentPage += 1;
        }
    }
    url.searchParams.set('page', currentPage);
    window.location.href = url.toString();
};

const FilterSearchbarInit = () => {
    const total_results = document.getElementById("total_results");
    const searchInput = document.getElementById("journal_search");
    const errorDiv = document.getElementById("error_message");

    errorDiv.classList.add("hidden");
    searchInput.addEventListener("input", () => {
        let total_numbers = 0;
        const searchTerm = searchInput.value.trim().toLowerCase();

        const publications = document.querySelectorAll("#publication_container li");
        let hasMatches = false;

        publications.forEach((publication) => {
            const journal = publication.textContent.toLowerCase();

            if (journal.includes(searchTerm)) {
                publication.style.display = "list-item";
                hasMatches = true;
                total_numbers = total_numbers + 1;
            } else {
                publication.style.display = "none";
            }
        });

        if (!hasMatches) {
            errorDiv.classList.remove("hidden");
        } else {
            errorDiv.classList.add("hidden");
        }
        total_results.innerHTML = total_numbers;
    });
};