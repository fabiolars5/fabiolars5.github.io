(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (menuButton && nav) {
    function closeMenu() {
      menuButton.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        menuButton.focus();
      }
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.site-header')) closeMenu();
    });
    window.matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);
  }

  document.querySelectorAll('[data-project-tabs]').forEach(tablist => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    function activateTab(tab, focus = false) {
      tabs.forEach((item, index) => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        if (panels[index]) panels[index].hidden = !selected;
      });
      if (focus) tab.focus();
    }
    function followHash() {
      const tab = tabs.find(item => `#${item.getAttribute('aria-controls')}` === location.hash);
      if (tab) activateTab(tab);
    }
    tabs.forEach(tab => tab.addEventListener('click', () => {
      activateTab(tab);
      history.replaceState(null, '', `#${tab.getAttribute('aria-controls')}`);
    }));
    tablist.addEventListener('keydown', event => {
      const current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      let next;
      if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        activateTab(tabs[next], true);
        history.replaceState(null, '', `#${tabs[next].getAttribute('aria-controls')}`);
      }
    });
    activateTab(tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
    followHash();
    window.addEventListener('hashchange', followHash);
  });

  document.querySelectorAll('[data-filter-group]').forEach(group => {
    const items = [...document.querySelectorAll(`[data-filter-item="${group.dataset.filterGroup}"]`)];
    const input = document.querySelector(`[data-search="${group.dataset.filterGroup}"]`);
    const counter = document.querySelector(`[data-result-count="${group.dataset.filterGroup}"]`);
    const empty = document.querySelector(`[data-empty="${group.dataset.filterGroup}"]`);
    let category = 'all';
    function filter() {
      const query = (input?.value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      let count = 0;
      for (const item of items) {
        const text = item.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const matches = (category === 'all' || item.dataset.category.split(' ').includes(category)) && text.includes(query);
        item.hidden = !matches;
        if (matches) count++;
      }
      if (counter) counter.textContent = document.documentElement.lang === 'es'
        ? `${count} ${count === 1 ? 'caso' : 'casos'}`
        : `${count} case${count === 1 ? '' : 's'}`;
      if (empty) empty.hidden = count !== 0;
    }
    group.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      category = button.dataset.filter;
      group.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      filter();
    });
    input?.addEventListener('input', filter);
    document.addEventListener('portfolio:languagechange', filter);
    filter();
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-pending');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) element.classList.add('reveal-pending');
      revealObserver.observe(element);
    });
  }

  if ('IntersectionObserver' in window) {
    const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
    const sectionObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        }
      }
    }, { rootMargin: '-15% 0px -65% 0px' });
    navLinks.forEach(link => {
      const section = document.getElementById(link.hash.slice(1));
      if (section) sectionObserver.observe(section);
    });
  }

  if (location.hash) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    const details = target?.closest('details');
    if (details) {
      details.open = true;
      requestAnimationFrame(() => details.scrollIntoView());
    }
  }
})();
