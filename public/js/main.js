document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  const params = new URLSearchParams(window.location.search);
  const group = params.get("group");
  const select = document.querySelector('select[name="bloodGroup"]');
  if (group && select && !select.value) {
    select.value = group;
  }
});
