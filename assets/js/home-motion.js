(() => {
  const home = document.querySelector('.rm-home');
  if (!home || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const selectors = [
    '.rm-section-head',
    '.rm-step',
    '.rm-color-invite',
    '.rm-guide-card',
    '.rm-work-card',
    '.rm-trust-layout > div',
    '.rm-voice-card',
    '.rm-blog-card',
    '.rm-area-inner > div',
    '.rm-contact-inner > div:first-child'
  ];
  const targets = [...document.querySelectorAll(selectors.join(','))];
  if (!targets.length) return;

  targets.forEach((target) => {
    const siblings = [...target.parentElement.children];
    const position = siblings.indexOf(target);
    target.classList.add('rm-motion-target');
    target.style.setProperty('--rm-motion-delay', String(Math.min(position, 2) * 150) + 'ms');

    if (window.matchMedia('(min-width: 821px)').matches && target.matches('.rm-work-card, .rm-trust-layout > div')) {
      target.style.setProperty('--rm-motion-x', String(position % 2 ? 60 : -60) + 'px');
    }
  });

  home.classList.add('rm-motion-ready');
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('rm-motion-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });

  targets.forEach((target) => observer.observe(target));

  let scrollTicking = false;
  const revealPassedTargets = () => {
    const triggerLine = window.innerHeight * .94;
    targets.forEach((target) => {
      if (target.getBoundingClientRect().top < triggerLine) {
        target.classList.add('rm-motion-visible');
        observer.unobserve(target);
      }
    });
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(revealPassedTargets);
  }, { passive: true });
  revealPassedTargets();
})();
