(() => {
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase()
    .replace(/[-–—_]/g, ' ').replace(/\s+/g, ' ').trim();

  document.querySelectorAll('.library-downloads').forEach(section => {
    const search = section.querySelector('[data-library-search]');
    const items = Array.from(section.querySelectorAll('.library-download-item'));
    const empty = section.querySelector('[data-library-empty]');
    const status = section.querySelector('[data-library-status]');

    if (!search || !empty || !status) return;

    search.closest('.library-search').hidden = false;
    const searchableItems = items.map(item => ({
      item,
      text: normalize(item.querySelector('.library-download-item__content').textContent)
    }));

    search.addEventListener('input', () => {
      const query = normalize(search.value);
      const terms = query ? query.split(' ') : [];
      let visibleCount = 0;

      searchableItems.forEach(({ item, text }) => {
        const visible = terms.every(term => text.includes(term));
        item.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      empty.hidden = terms.length === 0 || visibleCount > 0;
      status.textContent = terms.length === 0
        ? ''
        : document.documentElement.lang === 'en'
          ? `${visibleCount} ${visibleCount === 1 ? 'file' : 'files'} found`
          : `找到 ${visibleCount} 个文件`;
    });
  });
})();
