/* global NexT, CONFIG */

var Affix = {
  init: function(element, options) {
    this.element = element;
    this.offset = options || 0;
    this.affixed = null;
    this.unpin = null;
    this.pinnedOffset = null;
    this.checkPosition();
    window.addEventListener('scroll', this.checkPosition.bind(this));
    window.addEventListener('click', this.checkPositionWithEventLoop.bind(this));
    window.matchMedia('(min-width: 992px)').addListener(event => {
      if (event.matches) {
        this.offset = NexT.utils.getAffixParam();
        this.checkPosition();
      }
    });
  },
  getState: function(scrollHeight, height, offsetTop, offsetBottom) {
    let scrollTop = window.scrollY;
    let targetHeight = window.innerHeight;
    if (offsetTop != null && this.affixed === 'top') {
      if (document.querySelector('.content-wrap').offsetHeight < offsetTop) return 'top';
      return scrollTop < offsetTop ? 'top' : false;
    }
    if (this.affixed === 'bottom') {
      if (offsetTop != null) return this.unpin <= this.element.getBoundingClientRect().top ? false : 'bottom';
      return scrollTop + targetHeight <= scrollHeight - offsetBottom ? false : 'bottom';
    }
    let initializing = this.affixed === null;
    let colliderTop = initializing ? scrollTop : this.element.getBoundingClientRect().top + scrollTop;
    let colliderHeight = initializing ? targetHeight : height;
    if (offsetTop != null && scrollTop <= offsetTop) return 'top';
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom';
    return false;
  },
  getPinnedOffset: function() {
    if (this.pinnedOffset) return this.pinnedOffset;
    this.element.classList.remove('affix-top', 'affix-bottom');
    this.element.classList.add('affix');
    return (this.pinnedOffset = this.element.getBoundingClientRect().top);
  },
  checkPositionWithEventLoop() {
    setTimeout(this.checkPosition.bind(this), 1);
  },
  checkPosition: function() {
    if (window.getComputedStyle(this.element).display === 'none') return;
    let height = this.element.offsetHeight;
    let { offset } = this;
    let offsetTop = offset.top;
    let offsetBottom = offset.bottom;
    let { scrollHeight } = document.body;
    let affix = this.getState(scrollHeight, height, offsetTop, offsetBottom);
    if (this.affixed !== affix) {
      if (this.unpin != null) this.element.style.top = '';
      let affixType = 'affix' + (affix ? '-' + affix : '');
      this.affixed = affix;
      this.unpin = affix === 'bottom' ? this.getPinnedOffset() : null;
      this.element.classList.remove('affix', 'affix-top', 'affix-bottom');
      this.element.classList.add(affixType);
    }
    if (affix === 'bottom') {
      this.element.style.top = scrollHeight - height - offsetBottom + 'px';
    }
  }
};

NexT.utils.getAffixParam = function() {
  let sidebar = document.querySelector('.sidebar');
  let rail = document.querySelector('.site-rail');

  if (rail && sidebar) {
    // The header and overview now live in one native scroll container. Keep
    // Affix's class for the existing sidebar state machine, but do not add a
    // second fixed position or a header-sized margin inside the rail.
    sidebar.style.marginTop = '0';
    document.documentElement.style.setProperty('--sidebar-affix-top', '0px');
    return {
      top   : -1,
      bottom: null
    };
  }

  let headerOffset = document.querySelector('.header-inner').offsetHeight;
  // Header and profile are rendered as one continuous desktop rail. The
  // overview starts at the header's lower edge instead of becoming a second
  // floating card with an arbitrary gap.
  let sidebarAffixTop = headerOffset;

  sidebar.style.marginTop = sidebarAffixTop + 'px';
  document.documentElement.style.setProperty('--sidebar-affix-top', sidebarAffixTop + 'px');

  return {
    // Pin the complete left rail from the first paint. The navigation card
    // is already in the fixed header; the profile card starts below it and
    // should not briefly scroll away before Affix engages. Leaving the
    // bottom boundary unset keeps both panels fixed for the full article.
    top   : -1,
    bottom: null
  };
};

document.addEventListener('DOMContentLoaded', () => {

  Affix.init(document.querySelector('.sidebar-inner'), NexT.utils.getAffixParam());
});
