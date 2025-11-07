const root = "..";

export const menuItems = [
  { name: "HOME", href: root + "/index.html" },
  { name: "TCG", href: `${root}/Pokemon Card Page/index.html` },
  { name: "POKEDEX", href: `${root}/Pokedex Page/index.html` },
  { name: "SETTINGS", href: `${root}/settings.html` },
];

export function initialise(currentPage) {
  let nav = document.querySelector("header > nav");

  if (!nav) {
    const header = document.querySelector("header");
    if (!header) {
      console.warn("initialise() called before header exists. Aborting.");
      return;
    }
    nav = document.createElement("nav");
    nav.setAttribute("aria-hidden", "true");
    header.appendChild(nav);
  }

  nav.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'slide-menu';
  wrapper.innerHTML = `
    <div class="slide-menu-inner" id="siteMenu">
      <ul class="slide-menu-list" role="menu"></ul>
    </div>
  `;

  nav.appendChild(wrapper);

  const ul = wrapper.querySelector('ul.slide-menu-list');

  for (let menuItem of menuItems) {
    const li = document.createElement("li");
    li.setAttribute('role', 'none');

    const a = document.createElement("a");
    a.setAttribute('role', 'menuitem');
    a.setAttribute('href', menuItem.href);
    a.dataset.key = menuItem.name;
    a.tabIndex = -1;

    const labels = document.createElement('span');
    labels.className = 'slide-menu-labels';
    labels.innerHTML = `
      <span class="label oswald">${menuItem.name}</span>
      <span class="label protest">${menuItem.name}</span>
    `;

    a.appendChild(labels);

    if (currentPage === menuItem.name) {
      a.classList.add("active");
    }

    li.appendChild(a);
    ul.appendChild(li);
  }

  wrapper.id = 'siteMenu';
}
