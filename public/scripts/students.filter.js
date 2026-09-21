const FilterStudents = (query, id) => {
    const notFoundMessageElement = document.getElementById(
        `notFoundMessage${Number(id) == 1 ? "" : Number(id) - 1}`
    );
    notFoundMessageElement.style.display = "none";
    const cardBody = document.querySelectorAll(`#student_table${id} tbody tr`);
    let isFound = false;
    cardBody.forEach((item) => {
        const text = item.innerText.trim().toString().toLowerCase();
        console.log(text);
        if (text.includes(query.toLowerCase())) {
            isFound = true;
            item.style.display = "table-row";
        } else {
            item.style.display = "none";
        }
    });
    isFound
        ?
        (notFoundMessageElement.style.display = "none") :
        (notFoundMessageElement.style.display = "block");
};

const FilterStudentsByYear = (year, id) => {
    const notFoundMessageElement = document.getElementById(
        `notFoundMessage${id}`
    );
    notFoundMessageElement.style.display = "none";
    const cardBody = document.querySelectorAll(
        `#student_table${id + 1} tbody tr`
    );
    if (year == "All") {
        cardBody.forEach((item) => {
            item.style.display = "table-row";
        });
    } else {
        let isFound = false;
        cardBody.forEach((item) => {
            const text = item.querySelector(".batch_year").textContent.toString();
            if (text.includes(year.toLowerCase())) {
                isFound = true;
                item.style.display = "table-row";
            } else {
                item.style.display = "none";
            }
        });
        isFound
            ?
            (notFoundMessageElement.style.display = "none") :
            (notFoundMessageElement.style.display = "block");
    }
};
window.addEventListener("load", () => {
    const searchValueElement = document.getElementById("search_student");
    searchValueElement.addEventListener("input", () => {
        FilterStudents(searchValueElement.value, "1");
    });
    const searchValueElement1 = document.getElementById("search_student1");
    searchValueElement1.addEventListener("input", () => {
        FilterStudents(searchValueElement1.value, "2");
    });
    const searchValueElement2 = document.getElementById("search_student2");
    searchValueElement2.addEventListener("input", () => {
        FilterStudents(searchValueElement2.value, "3");
    });
    try {
        const searchValueElement3 = document.getElementById("search_student3");
        searchValueElement3.addEventListener("input", () => {
            FilterStudents(searchValueElement3.value, "4");
        });
    } catch {}
});