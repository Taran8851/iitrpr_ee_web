const FilterCourses = (query, id) => {
  const notFoundMessageElement = document.getElementById(
    `notFoundMessage${id}`
  );
  notFoundMessageElement.style.display = "none";

  const course_card_head = document.querySelectorAll(
    `#courses_table${id} tbody .course_card_head`
  );
  const course_card_desc = document.querySelectorAll(
    `#courses_table${id} tbody .course_card_desc`
  );
  let isFound = false;
  course_card_desc.forEach((item, index) => {
    const text = item.innerText.trim().toString().toLowerCase();
    const text1 = course_card_head[index].innerText
      .trim()
      .toString()
      .toLowerCase();
    if (
      text.includes(query.toLowerCase()) ||
      text1.includes(query.toLowerCase())
    ) {
      isFound = true;
      item.style.display = "table-row";
      course_card_head[index].style.display = "table-row";
    } else {
      item.style.display = "none";
      course_card_head[index].style.display = "none";
    }
  });
  isFound
    ? (notFoundMessageElement.style.display = "none")
    : (notFoundMessageElement.style.display = "block");
};

window.addEventListener("load", () => {
  const searchValueElement = document.getElementById("search1");
  searchValueElement.addEventListener("input", () => {
    FilterCourses(searchValueElement.value, "1");
  });
  const searchValueElement1 = document.getElementById("search2");
  searchValueElement1.addEventListener("input", () => {
    FilterCourses(searchValueElement1.value, "2");
  });
  const searchValueElement2 = document.getElementById("search3");
  searchValueElement2.addEventListener("input", () => {
    FilterCourses(searchValueElement2.value, "3");
  });
  const searchValueElement3 = document.getElementById("search4");
  searchValueElement3.addEventListener("input", () => {
    FilterCourses(searchValueElement3.value, "4");
  });
});
