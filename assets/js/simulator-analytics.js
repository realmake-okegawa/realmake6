// Measure the estimate journey without collecting form values or personal data.
(function () {
  var firstPanel = document.getElementById('p1');
  var secondPanel = document.getElementById('p2');
  var resultPanel = document.getElementById('p3');
  if (!firstPanel || !secondPanel || !resultPanel) return;

  var started = false;
  var resultVisible = false;
  function track(name, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    } catch (_) {
      // Analytics must never prevent calculation or navigation.
    }
  }
  function start() {
    if (started) return;
    started = true;
    track('simulator_start');
  }
  [firstPanel, secondPanel].forEach(function (panel) {
    panel.addEventListener('change', start);
    panel.addEventListener('click', function (event) {
      if (event.target.closest('.btn-next')) start();
    });
  });

  new MutationObserver(function () {
    var visible = resultPanel.classList.contains('active');
    if (visible && !resultVisible) {
      start();
      track('simulator_result_view');
    }
    resultVisible = visible;
  }).observe(resultPanel, {attributes: true, attributeFilter: ['class']});

  resultPanel.addEventListener('click', function (event) {
    if (event.target.closest('.btn-retry')) {
      track('simulator_restart');
      started = false;
      return;
    }
    var link = event.target.closest('a');
    if (!link || !resultPanel.classList.contains('active')) return;
    var href = link.getAttribute('href') || '';
    var method = /^tel:/.test(href) ? 'phone'
      : /https:\/\/(?:lin\.ee|line\.me)\//.test(href) ? 'line'
      : href.indexOf('contact/') !== -1 ? 'form' : '';
    if (method) track('simulator_contact_click', {contact_method: method, link_location: 'simulator_result'});
  });
})();
