const FilterStudents = (query, notFoundMessageElement) => {
  const data = document.querySelectorAll(`#publication_container li`);
  let isFound = false;
  data.forEach((item) => {
    const text = item.innerText.trim().toString().toLowerCase();
    if (text.includes(query.toLowerCase())) {
      isFound = true;
      item.style.display = "list-item";
    } else {
      item.style.display = "none";
    }
  });
  isFound
    ? (notFoundMessageElement.style.display = "none")
    : (notFoundMessageElement.style.display = "block");
};

window.addEventListener("load", () => {
  let search = document.getElementById("search_achie");
  const notFoundMessageElement = document.getElementById(`notFoundMessage`);
  notFoundMessageElement.style.display = "none";
  search.addEventListener("input", () => {
    FilterStudents(search.value, notFoundMessageElement);
  });
});
