// Shared accordion logic — handles every [data-accordion] on the page.
// One-open-at-a-time behavior is scoped to each accordion container.
function initAccordions(): void {
  document.querySelectorAll<HTMLElement>('[data-accordion]').forEach(accordion => {
    const items = accordion.querySelectorAll<HTMLElement>('[data-acc-item]');
    items.forEach(item => {
      const btn  = item.querySelector<HTMLButtonElement>('[data-acc-btn]')!;
      const body = item.querySelector<HTMLElement>('[data-acc-body]')!;
      if (!btn || !body) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close all items in this accordion
        items.forEach(i => {
          i.classList.remove('is-open');
          const b = i.querySelector<HTMLElement>('[data-acc-body]');
          const h = i.querySelector<HTMLButtonElement>('[data-acc-btn]');
          if (b) b.style.maxHeight = '0';
          if (h) h.setAttribute('aria-expanded', 'false');
        });

        // Open the clicked item if it was closed
        if (!isOpen) {
          item.classList.add('is-open');
          body.style.maxHeight = body.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
}

initAccordions();
