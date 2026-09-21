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
                publication.classList.remove("hidden");
                hasMatches = true;
                total_numbers = total_numbers + 1;
            } else {
                publication.classList.add("hidden");
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



document.addEventListener("DOMContentLoaded", () => {
    FilterSearchbarInit();
});