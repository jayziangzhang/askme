(function () {
  const input = document.getElementById('question-input');
  const sendBtn = document.getElementById('send-btn');
  const answerBox = document.getElementById('answer-box');
  const answerText = document.getElementById('answer-text');
  const sourcesEl = document.getElementById('sources');

  let apiUrl = 'http://127.0.0.1:8000/query';

  // Load API URL from profile.json
  fetch('data/profile.json')
    .then(function (r) { return r.json(); })
    .then(function (p) { if (p.apiUrl) apiUrl = p.apiUrl; })
    .catch(function () {});

  function ask(question) {
    if (!question.trim()) return;

    input.value = question;
    sendBtn.disabled = true;

    answerBox.classList.add('visible');
    answerText.innerHTML = '<span class="spinner"></span> Thinking...';
    sourcesEl.innerHTML = '';

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question, use_hyde: true, use_rewrite: true })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('API error ' + r.status);
        return r.json();
      })
      .then(function (data) {
        answerText.textContent = data.answer || 'No answer returned.';

        if (data.sources && data.sources.length > 0) {
          data.sources.forEach(function (s) {
            var tag = document.createElement('span');
            tag.className = 'source-tag';
            tag.textContent = s;
            sourcesEl.appendChild(tag);
          });
        }
      })
      .catch(function (err) {
        answerText.innerHTML = '<span class="error-text">Could not reach the API. Please try again later.</span>';
        console.error(err);
      })
      .finally(function () {
        sendBtn.disabled = false;
      });
  }

  sendBtn.addEventListener('click', function () {
    ask(input.value);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') ask(input.value);
  });

  // Chip click handlers wired in index.html via data-question attribute
  document.querySelectorAll('.chip[data-question]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      ask(chip.getAttribute('data-question'));
    });
  });
})();
