(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());
  gtag('config', 'G-PCG1M6JXX0');

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a') : null;
    if (!link) return;

    var href = link.getAttribute('href') || '';
    var label = (link.innerText || '').trim().slice(0, 40);
    var params = {link_url: href, link_text: label};

    var customEvent = link.getAttribute('data-ga-event');
    if (customEvent) {
      gtag('event', customEvent, params);
    }
    if (href.indexOf('tel:') === 0) {
      gtag('event', 'phone_click', params);
    } else if (href.indexOf('lin.ee') !== -1 || href.indexOf('line.me') !== -1) {
      gtag('event', 'line_click', params);
    } else if (href.indexOf('contact/') !== -1) {
      gtag('event', 'contact_form_click', params);
    } else if (href.indexOf('painting_simulator') !== -1) {
      gtag('event', 'simulator_click', params);
    } else if (href.indexOf('photo-estimate/') !== -1) {
      gtag('event', 'photo_estimate_click', params);
    }
  }, true);

  if ((window.location.pathname.endsWith('/contact/thanks/') || window.location.pathname.endsWith('/contact/thanks/index.html')) && window.top === window) {
    gtag('event', 'contact_form_submit', {
      event_category: 'contact_form',
      submission_source: 'direct_thanks_page'
    });
  }
})();
