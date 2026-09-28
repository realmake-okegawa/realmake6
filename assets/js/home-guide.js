// トップページの「3つの質問から見るページを案内する」機能。
// 入力された内容はどこにも送信しない。計測は既存の gtag があるときだけ、選択肢の種類（固定の英字キー）を匿名で送る。
(function () {
  var root = document.getElementById('home-guide');
  if (!root) return;

  var LINE = 'https://lin.ee/sEbKJ6O';
  var TEL = 'tel:09014340189';

  // 案内先はすべてサイト内に実在するページ
  var PAGES = {
    sim: { href: './painting_simulator.html', title: '30秒で概算費用をチェック', text: '建物の大きさなどを選ぶだけで、外壁・屋根塗装の費用の目安が分かります。名前の入力はありません。' },
    photo: { href: './photo-estimate/', title: '写真＋立面図から概算見積り', text: 'もっと具体的な金額を知りたい方は、写真＋立面図からの概算見積りもご利用いただけます。' },
    price: { href: './price/', title: '料金の目安', text: '外壁・屋根塗装の費用の考え方と目安をまとめています。' },
    exterior: { href: './services/exterior-painting/', title: '外壁塗装・外壁補修', text: '塗り替えが必要な症状と、塗る前に直すところをご説明しています。' },
    roof: { href: './services/roof-painting/', title: '屋根塗装・屋根修理', text: '屋根材によっては塗装が要らないこともあります。' },
    worksExterior: { href: './works/?type=exterior#works-list', title: '外壁・屋根の施工事例', text: '桶川市などで行った工事を、費用・工期まで公開しています。' },
    reviews: { href: './reviews/', title: 'お客様の声・Googleクチコミ', text: '工事をご依頼いただいた方の声をそのまま掲載しています。' },
    company: { href: './company/', title: '代表・会社について', text: '桶川市生まれ・桶川市在住の代表 大川がお話をうかがいます。' },
    reason: { href: './reason/', title: 'Real Makeの考え方', text: '必要のない工事はお勧めしません。' },
    faq: { href: './faq/', title: 'よくある質問', text: '網戸1枚からの依頼や、補助金についてもお答えしています。' },
    color: { href: './color-simulator/', title: '外壁カラーシミュレーター', text: '写真で外壁の色を試せます。' },
    interior: { href: './services/interior-reform/', title: '内装リフォーム', text: '壁紙や床など、「この部分だけ」のご相談もできます。' },
    interiorCost: { href: './services/interior-reform/#estimate', title: '内装リフォームの費用の確認ポイント', text: '費用が決まる要素と、見積りで確認することをまとめています。' },
    kitchen: { href: './services/kitchen-reform/', title: 'キッチンリフォーム', text: '商品が決まっていなくても、困っていることから相談できます。' },
    kitchenCost: { href: './services/kitchen-reform/#estimate', title: 'キッチンリフォームの費用の確認ポイント', text: '費用が決まる要素と、見積りで確認することをまとめています。' },
    toilet: { href: './services/toilet-reform/', title: 'トイレリフォーム', text: '便器の交換から、壁や床、手すりの設置まで。' },
    toiletCost: { href: './services/toilet-reform/#estimate', title: 'トイレリフォームの費用の確認ポイント', text: '費用が決まる要素と、見積りで確認することをまとめています。' },
    worksWindows: { href: './works/?type=windows#works-list', title: '窓まわりの施工事例', text: '内窓・網戸・面格子などの工事を掲載しています。' },
    kumagaya: { href: './works/kumagaya-inner-window/', title: '内窓19ヶ所の施工事例', text: '工事費約200万円のうち、約70万円に補助金を活用した例です。' },
    worksHome: { href: './works/?type=home#works-list', title: '小さな修理の施工事例', text: '障子の張り替え、ポスト交換、トイレの小物の取付けなど。' },
    freeSupport: { href: './free-support/', title: '30分無料サポート', text: '桶川市にお住まいで、初めてご利用の方向け（月3組まで）。電球交換や家具の移動などをお手伝いします。' },
    services: { href: '#services', title: 'Real Makeにできる工事', text: '外壁・屋根から水まわり、小さな修繕まで。' },
    budgetInterior: { href: './budget/#budget-interior', title: '工事ごとの予算の目安（内装・窓まわり）', text: 'クロスの張り替え、網戸、面格子などのだいたいの金額（税込）です。' },
    budgetWater: { href: './budget/#budget-water', title: '工事ごとの予算の目安（水まわり）', text: 'トイレ・キッチン・お風呂・洗面台などのだいたいの金額（税込）です。' },
    budget: { href: './budget/', title: '工事ごとの予算の目安', text: '外壁塗装から網戸1枚まで、工事ごとのだいたいの金額（税込）です。' }
  };

  var EXAMPLES = {
    windows: '「桶川市です。網戸1枚交換したいです」',
    small: '「桶川市です。トイレットペーパーホルダーを付け替えたいです」',
    unknown: '「北本市です。外壁にひびがあるのですが、何の工事が必要か分かりません」',
    interior: '「桶川市です。和室の壁紙を張り替えたいです」',
    kitchen: '「上尾市です。トイレが古くなってきたので相談したいです」',
    exterior: '「桶川市です。外壁の色あせが気になってきました」'
  };

  function plan(a) {
    var cards;
    var contact = 'normal';
    var messages = [];
    var q1 = a.q1, q2 = a.q2, q3 = a.q3;

    if (q1 === 'exterior') {
      cards = {
        cost: ['sim', 'photo', 'price'],
        work: ['exterior', 'roof', 'worksExterior'],
        vendor: ['worksExterior', 'reviews', 'company'],
        nosales: ['worksExterior', 'price', 'reason'],
        consult: ['exterior', 'sim', 'color']
      }[q3];
    } else if (q1 === 'interior') {
      cards = {
        cost: ['budgetInterior', 'interior', 'faq'],
        vendor: ['interior', 'reviews', 'company'],
        nosales: ['interior', 'reason']
      }[q3] || ['interior', 'faq'];
    } else if (q1 === 'kitchen') {
      cards = {
        cost: ['budgetWater', 'kitchen', 'toilet'],
        vendor: ['kitchen', 'toilet', 'reviews'],
        nosales: ['kitchen', 'toilet', 'reason']
      }[q3] || ['kitchen', 'toilet', 'faq'];
    } else if (q1 === 'windows') {
      cards = {
        cost: ['budgetInterior', 'kumagaya', 'worksWindows'],
        vendor: ['worksWindows', 'reviews', 'company']
      }[q3] || ['worksWindows', 'kumagaya', 'faq'];
      contact = 'primary';
    } else if (q1 === 'small') {
      messages.push('小さなことでも大丈夫です。まずは困っていることを教えてください。');
      cards = q3 === 'vendor' ? ['worksHome', 'reviews', 'company'] : q3 === 'cost' ? ['budget', 'worksHome', 'freeSupport'] : ['worksHome', 'freeSupport'];
      contact = 'primary';
    } else {
      messages.push('工事内容が分からなくても大丈夫です。気になっていることを、そのまま教えてください。');
      cards = q3 === 'vendor' ? ['reviews', 'company', 'faq'] : q3 === 'cost' ? ['budget', 'services', 'faq'] : ['services', 'faq'];
      contact = 'primary';
    }

    if (q3 === 'consult') contact = 'primary';
    if (q3 === 'nosales') {
      messages.push('まず情報を見るだけでも大丈夫です。相談したからといって、工事を依頼する必要はありません。');
      contact = 'quiet';
    }
    if (q2 === 'undecided') messages.push('急いで決める必要はありません。気になったときに、またご覧ください。');
    var phoneFirst = q2 === 'asap';
    if (phoneFirst && contact === 'quiet') contact = 'normal';

    return { cards: cards.slice(0, 3), contact: contact, messages: messages, phoneFirst: phoneFirst, example: EXAMPLES[q1] || null, showExample: contact === 'primary' };
  }

  var answers = {};
  var steps = Array.prototype.slice.call(root.querySelectorAll('[data-guide-step]'));
  var result = root.querySelector('[data-guide-result]');
  var progress = root.querySelector('[data-guide-progress]');
  var progressBar = root.querySelector('[data-guide-bar]');
  var started = false;

  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  function keepInView() {
    var top = root.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) {
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function show(index, moveFocus) {
    steps.forEach(function (step, i) { step.hidden = i !== index; });
    result.hidden = index !== steps.length;
    var n = Math.min(index + 1, steps.length);
    progress.textContent = index < steps.length ? n + ' / ' + steps.length : '';
    progressBar.style.width = (Math.min(index + 1, steps.length) / steps.length) * 100 + '%';
    root.querySelector('[data-guide-progress-wrap]').hidden = index >= steps.length;
    var target = index < steps.length ? steps[index].querySelector('.guide-q') : result.querySelector('.guide-result-title');
    if (moveFocus !== false && target) target.focus({ preventScroll: true });
  }

  function link(href, label, cls) {
    var external = href.indexOf('http') === 0;
    return '<a class="' + cls + '" href="' + href + '" data-ga-event="guide_result_click"' + (external ? ' target="_blank" rel="noopener"' : '') + '>' + label + '</a>';
  }

  function contactHtml(p) {
    var phone = link(TEL, '<small>お電話で相談（受付 8:00〜18:00）</small><b>090-1434-0189</b>', 'guide-contact-btn guide-contact-tel');
    var line = link(LINE, '<small>写真がなくてもOK</small><b>LINEで相談する</b>', 'guide-contact-btn guide-contact-line');
    if (p.contact === 'quiet') {
      return '<div class="guide-contact is-quiet"><p>相談したくなったときは、' + link(LINE, 'LINE', '') + 'や' + link(TEL, 'お電話（090-1434-0189）', '') + 'からどうぞ。</p></div>';
    }
    var html = '<div class="guide-contact' + (p.contact === 'primary' ? ' is-primary' : '') + '">';
    html += '<p class="guide-contact-title">' + (p.contact === 'primary' ? 'LINEで、そのまま送ってください' : '聞いてみたいことがあれば') + '</p>';
    if (p.showExample && p.example) {
      html += '<p class="guide-example">' + p.example + '</p><p class="guide-example-note">こんな一言だけでも大丈夫です。写真はあればで構いません。</p>';
    }
    if (p.phoneFirst) html += '<p class="guide-asap">お急ぎの場合は、お電話でもご相談いただけます。</p>';
    html += '<div class="guide-contact-buttons">' + (p.phoneFirst ? phone + line : line + phone) + '</div></div>';
    return html;
  }

  function cardsHtml(keys) {
    return keys.map(function (key, i) {
      var page = PAGES[key];
      return '<a class="guide-card' + (i === 0 ? ' is-first' : '') + '" href="' + page.href + '" data-ga-event="guide_result_click">' +
        (i === 0 ? '<span class="guide-card-tag">まずはここ</span>' : '') +
        '<b>' + page.title + '</b><span>' + page.text + '</span><i aria-hidden="true">→</i></a>';
    }).join('');
  }

  function renderResult() {
    var p = plan(answers);
    var body = result.querySelector('[data-guide-result-body]');
    var html = p.messages.map(function (m) { return '<p class="guide-message">' + m + '</p>'; }).join('');
    if (p.contact === 'primary') {
      html += contactHtml(p);
      html += '<p class="guide-sub">あわせて見ると安心なページ</p><div class="guide-cards">' + cardsHtml(p.cards) + '</div>';
    } else {
      html += '<div class="guide-cards">' + cardsHtml(p.cards) + '</div>';
      html += contactHtml(p);
    }
    body.innerHTML = html;
    track('guide_complete', { guide_q1: answers.q1, guide_q2: answers.q2, guide_q3: answers.q3 });
  }

  root.addEventListener('click', function (event) {
    var choice = event.target.closest('[data-guide-answer]');
    if (choice) {
      var step = choice.closest('[data-guide-step]');
      var key = step.getAttribute('data-guide-step');
      var index = steps.indexOf(step);
      answers[key] = choice.getAttribute('data-guide-answer');
      if (!started) { started = true; track('guide_start'); }
      track('guide_answer', { guide_question: key, guide_answer: answers[key] });
      if (index === steps.length - 1) renderResult();
      show(index + 1);
      keepInView();
      return;
    }
    if (event.target.closest('[data-guide-back]')) {
      var current = steps.findIndex(function (s) { return !s.hidden; });
      if (current > 0) show(current - 1);
      return;
    }
    if (event.target.closest('[data-guide-restart]')) {
      answers = {};
      track('guide_restart');
      show(0);
      keepInView();
    }
  });

  root.classList.add('is-ready');
  show(0, false);
})();
