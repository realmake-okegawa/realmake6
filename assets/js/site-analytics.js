(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());
  gtag('config', 'G-PCG1M6JXX0');

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link) return;

    var href = link.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) {
      gtag('event', 'phone_click', {link_url: href});
    } else if (href.indexOf('lin.ee') !== -1) {
      gtag('event', 'line_click', {link_url: href});
    } else if (href.indexOf('painting_simulator.html') !== -1) {
      gtag('event', 'simulator_click', {link_url: href});
    }
  });
})();
