/* global NexT, CONFIG, Velocity */

NexT.boot = {};

NexT.boot.registerEvents = function() {

  NexT.utils.registerScrollPercent();
  NexT.utils.registerCanIUseTag();

  // Keep the mobile drawer anchored to the real header height. The title can
  // wrap at narrow widths, so a fixed 79px offset would either overlap the
  // header or leave an unnecessary gap.
  var syncRailHeaderOffset = function() {
    var header = document.querySelector('.header-inner');
    if (!header) return;
    var headerBottom = Math.ceil(header.getBoundingClientRect().bottom);
    document.documentElement.style.setProperty('--rail-header-offset', headerBottom + 'px');
  };
  syncRailHeaderOffset();
  window.addEventListener('resize', syncRailHeaderOffset);

  // Mobile top menu bar. Keep the control semantic so keyboard and assistive
  // technology users can understand and operate the drawer.
  var navToggle = document.querySelector('.site-nav-toggle .toggle');
  var siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    var setNavigationState = function(willOpen) {
      navToggle.classList.toggle('toggle-close', willOpen);
      navToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      document.documentElement.classList.toggle('rail-drawer-open', willOpen);
    };

    var toggleNavigation = function() {
      var willOpen = !siteNav.classList.contains('site-nav-on');
      var animateAction = willOpen ? 'slideDown' : 'slideUp';

      setNavigationState(willOpen);

      if (typeof Velocity === 'function') {
        Velocity(siteNav, animateAction, {
          duration: 200,
          complete: function() {
            siteNav.classList.toggle('site-nav-on', willOpen);
          }
        });
      } else {
        siteNav.classList.toggle('site-nav-on', willOpen);
      }
    };

    navToggle.addEventListener('click', toggleNavigation);

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !siteNav.classList.contains('site-nav-on')) return;
      setNavigationState(false);
      siteNav.classList.remove('site-nav-on');
      navToggle.focus();
    });
  }

  // Preserve the full Work label in a native tooltip when the compact rail
  // truncates a long project title.
  document.querySelectorAll('.post-toc .nav-link').forEach(link => {
    if (!link.title) link.title = link.textContent.trim();
  });

  var TAB_ANIMATE_DURATION = 200;
  document.querySelectorAll('.sidebar-nav li').forEach((element, index) => {
    element.addEventListener('click', event => {
      var item = event.currentTarget;
      var activeTabClassName = 'sidebar-nav-active';
      var activePanelClassName = 'sidebar-panel-active';
      var targets = document.querySelectorAll('.sidebar-panel');
      var target = targets[index];
      var currentTarget = targets[1 - index];
      if (!target) return;

      // Pjax keeps the navigation rail in place while replacing the page
      // content. During that hand-off a tab can retain its active class even
      // when its panel has not been activated yet. Only treat the tab as a
      // no-op when both states agree, so a later click can repair the state.
      if (
        item.classList.contains(activeTabClassName)
        && target.classList.contains(activePanelClassName)
      ) return;

      // Article pages with a real table of contents intentionally hide the
      // redundant Overview panel. Keep this branch defensive for a future
      // single-panel render instead of animating an absent sibling.
      if (!currentTarget) {
        target.style.opacity = 1;
        target.classList.add(activePanelClassName);
        item.classList.add(activeTabClassName);
        return;
      }

      window.anime({
        targets : currentTarget,
        duration: TAB_ANIMATE_DURATION,
        easing  : 'linear',
        opacity : 0,
        complete: () => {
          // Prevent adding TOC to Overview if Overview was selected when close & open sidebar.
          currentTarget.classList.remove(activePanelClassName);
          target.style.opacity = 0;
          target.classList.add(activePanelClassName);
          window.anime({
            targets : target,
            duration: TAB_ANIMATE_DURATION,
            easing  : 'linear',
            opacity : 1
          });
        }
      });

      [...item.parentNode.children].forEach(element => {
        element.classList.remove(activeTabClassName);
      });
      item.classList.add(activeTabClassName);
    });
  });

  window.addEventListener('resize', NexT.utils.initSidebarDimension);

  window.addEventListener('hashchange', () => {
    var tHash = location.hash;
    if (tHash !== '' && !tHash.match(/%\S{2}/)) {
      var target = document.querySelector(`.tabs ul.nav-tabs li a[href="${tHash}"]`);
      target && target.click();
    }
  });
};

NexT.boot.refresh = function() {

  /**
   * Register JS handlers by condition option.
   * Need to add config option in Front-End at 'layout/_partials/head.swig' file.
   */
  CONFIG.fancybox && NexT.utils.wrapImageWithFancyBox();
  CONFIG.mediumzoom && window.mediumZoom('.post-body :not(a) > img, .post-body > img');
  CONFIG.lazyload && window.lozad('.post-body img').observe();
  CONFIG.pangu && window.pangu.spacingPage();

  CONFIG.exturl && NexT.utils.registerExtURL();
  CONFIG.copycode.enable && NexT.utils.registerCopyCode();
  NexT.utils.registerTabsTag();
  NexT.utils.registerActiveMenuItem();
  NexT.utils.registerLangSelect();
  NexT.utils.registerSidebarTOC();
  NexT.utils.wrapTableWithBox();
  NexT.utils.registerVideoIframe();
};

NexT.boot.motion = function() {
  // Define Motion Sequence & Bootstrap Motion.
  if (CONFIG.motion.enable) {
    NexT.motion.integrator
      .add(NexT.motion.middleWares.logo)
      .add(NexT.motion.middleWares.menu)
      .add(NexT.motion.middleWares.postList)
      .add(NexT.motion.middleWares.sidebar)
      .bootstrap();
  }
  NexT.utils.updateSidebarPosition();
};

document.addEventListener('DOMContentLoaded', () => {
  NexT.boot.registerEvents();
  NexT.boot.refresh();
  NexT.boot.motion();
});
