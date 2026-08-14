(() => {
  "use strict";

  document.documentElement.classList.add("js");

  document.querySelectorAll(".sitehead").forEach((header) => {
    const button = header.querySelector(".menu-toggle");
    const nav = header.querySelector(".site-nav");
    const label = button?.querySelector(".visually-hidden");
    if (!button || !nav) return;

    const setOpen = (open) => {
      header.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = open ? "メニューを閉じる" : "メニューを開く";
      document.body.classList.toggle("nav-open", open);
    };

    button.addEventListener("click", () => setOpen(!header.classList.contains("is-open")));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      setOpen(!header.classList.contains("is-open"));
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (header.classList.contains("is-open") && !header.contains(event.target)) setOpen(false);
    });
    window.matchMedia("(min-width: 981px)").addEventListener("change", (event) => {
      if (event.matches) setOpen(false);
    });
  });
})();
