// Shared accordion logic — handles every [data-accordion] on the page.
// One-open-at-a-time behavior is scoped to each accordion container.
function initAccordions(): void {
  document.querySelectorAll<HTMLElement>('[data-accordion]').forEach(accordion => {
    const items = accordion.querySelectorAll<HTMLElement>('[data-acc-item]');
    items.forEach(item => {
      const btn  = item.querySelector<HTMLButtonElement>('[data-acc-btn]')!;
      const body = item.querySelector<HTMLElement>('[data-acc-body]')!;
      if (!btn || !body) return;

      // Start collapsed: hide the panel from assistive tech so screen readers
      // don't announce content that's visually collapsed. Set here (not in the
      // markup) so no-JS users still get the full content in the a11y tree.
      body.setAttribute('aria-hidden', 'true');

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close all items in this accordion
        items.forEach(i => {
          i.classList.remove('is-open');
          const b = i.querySelector<HTMLElement>('[data-acc-body]');
          const h = i.querySelector<HTMLButtonElement>('[data-acc-btn]');
          if (b) { b.style.maxHeight = '0'; b.setAttribute('aria-hidden', 'true'); }
          if (h) h.setAttribute('aria-expanded', 'false');
        });

        // Open the clicked item if it was closed
        if (!isOpen) {
          item.classList.add('is-open');
          body.style.maxHeight = body.scrollHeight + 'px';
          body.setAttribute('aria-hidden', 'false');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
}

initAccordions();
