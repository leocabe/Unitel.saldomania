window.openParticipationGate = function ({ onReady, remaining = 10 }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'participation-dialog';
  dialog.setAttribute('aria-labelledby', 'participationTitle');
  dialog.innerHTML = `
    <div class="participation-brand"><img src="assets/unitel-logo.png" alt="Unitel — Olá Mundo" width="329" height="68" /></div>
    <p class="participation-eyebrow">Campanha Saldo Mania</p>
    <section id="participationEntry">
      <div class="participation-symbol" aria-hidden="true">✦</div>
      <h2 id="participationTitle">O teu momento<br />começa aqui.</h2>
      <p class="participation-copy">Preenche os teus dados para começares a participar na campanha <strong>Saldo Mania</strong>.</p>
      <form id="participationForm" novalidate>
        <label for="participantName">O teu nome</label>
        <input id="participantName" name="name" type="text" autocomplete="name" maxlength="80" placeholder="Como te chamas?" aria-describedby="participantNameError" required />
        <p class="participation-error" id="participantNameError"></p>
        <label for="participantPhone">Número de telefone</label>
        <input id="participantPhone" name="tel" type="tel" inputmode="tel" autocomplete="tel" maxlength="24" placeholder="923456789" aria-describedby="participantPhoneError phoneHint" required />
        <p class="participation-error" id="participantPhoneError"></p>
        <p class="participation-hint" id="phoneHint">9 algarismos, com ou sem o indicativo +244.</p>
        <button class="primary participation-button" type="submit">Verificar os meus dados <span aria-hidden="true">→</span></button>
      </form>
      <p class="participation-privacy">Faça a verificação com o seu número UNITEL válido.</p>
    </section>
    <section id="participationLoading" hidden role="status" aria-live="polite" aria-busy="true">
      <div class="participation-spinner" aria-hidden="true"></div>
      <h2 id="participationLoadingTitle">A preparar a tua<br />participação…</h2>
      <p class="participation-copy">Os campos foram preenchidos. Estamos a preparar a roleta para ti.</p>
      <div class="participation-checks"><span>✓ Nome preenchido</span><span>✓ Formato do telefone válido</span></div>
    </section>
    <section id="participationSuccess" hidden>
      <div class="participation-symbol participation-success-icon" aria-hidden="true">✓</div>
      <h2 tabindex="-1" id="participationSuccessTitle">Parabéns!<br />Podes participar.</h2>
      <p class="participation-copy"><strong id="participantGreeting"></strong>, o seu nome e número de telefone foram validados, você é um cliente UNITEL. A roleta da campanha <strong>Saldo Mania</strong> está pronta para ti.</p>
      <div class="participation-allowance"><strong id="participationRemaining"></strong><span>para participares na roleta</span></div>
      <button class="primary participation-button" id="enterRoulette" type="button">Começar a jogar <span aria-hidden="true">→</span></button>
    </section>`;

  const find = id => dialog.querySelector('#' + id);
  const background = [...document.querySelectorAll('body > header, body > main')];
  const previousInert = background.map(el => el.inert);
  const previousOverflow = document.body.style.overflow;
  background.forEach(el => { el.inert = true; });
  document.body.style.overflow = 'hidden';
  document.body.appendChild(dialog);
  dialog.addEventListener('cancel', event => event.preventDefault());
  dialog.showModal();
  find('participantName').focus();

  find('participantPhone').addEventListener('input', event => {
    const input = event.target;
    const raw = input.value;
    const digits = raw.replace(/\D/g, '');
    const hasPlus = raw.trimStart().startsWith('+');
    const hasCountryCode = digits.startsWith('244');
    const value = (hasPlus ? '+' : '') + digits.slice(0, hasCountryCode ? 12 : 9);
    if (raw !== value) {
      const cursor = input.selectionStart;
      const beforeCursor = raw.slice(0, cursor);
      const position = beforeCursor.replace(/\D/g, '').length +
        (hasPlus && beforeCursor.includes('+') ? 1 : 0);
      input.value = value;
      input.setSelectionRange(Math.min(position, value.length), Math.min(position, value.length));
    }
  });

  find('participationForm').addEventListener('submit', event => {
    event.preventDefault();
    const nameInput = find('participantName');
    const phoneInput = find('participantPhone');
    const name = nameInput.value.trim().replace(/\s+/g, ' ');
    const rawPhone = phoneInput.value.trim();
    const digits = rawPhone.replace(/\D/g, '');
    const national = digits.length === 12 && digits.startsWith('244') ? digits.slice(3) : digits;
    const nameValid = name.length <= 80 && /^\p{L}[\p{L}\p{M} .’'-]+$/u.test(name) && (name.match(/\p{L}/gu) || []).length >= 2;
    const phoneValid = !/[^\d+()\s.-]/.test(rawPhone) && /^\d{9}$/.test(national) && !/^(\d)\1{8}$/.test(national);
    find('participantNameError').textContent = nameValid ? '' : 'Escreve um nome válido com pelo menos duas letras.';
    find('participantPhoneError').textContent = phoneValid ? '' : 'Insere um telefone com 9 algarismos, com ou sem +244.';
    nameInput.setAttribute('aria-invalid', String(!nameValid));
    phoneInput.setAttribute('aria-invalid', String(!phoneValid));
    if (!nameValid || !phoneValid) { (nameValid ? phoneInput : nameInput).focus(); return; }

    find('participationEntry').hidden = true;
    find('participationLoading').hidden = false;
    dialog.setAttribute('aria-labelledby', 'participationLoadingTitle');
    setTimeout(() => {
      find('participationLoading').hidden = true;
      find('participationLoading').setAttribute('aria-busy', 'false');
      find('participantGreeting').textContent = name.split(' ')[0];
      find('participationRemaining').textContent = `${remaining} ${remaining === 1 ? 'giro disponível' : 'giros disponíveis'}`;
      if (remaining === 0) {
        find('participationSuccessTitle').textContent = 'Os teus giros já terminaram.';
        find('participationSuccess').querySelector('.participation-copy').textContent = `${name.split(' ')[0]}, já utilizaste os teus 10 giros neste navegador. Podes voltar à roleta para consultar a página.`;
        find('enterRoulette').textContent = 'Ver a roleta';
      }
      find('participationSuccess').hidden = false;
      dialog.setAttribute('aria-labelledby', 'participationSuccessTitle');
      find('participationSuccessTitle').focus();
    }, 1200);
  });

  find('enterRoulette').addEventListener('click', () => {
    dialog.close(); dialog.remove();
    background.forEach((el, index) => { el.inert = previousInert[index]; });
    document.body.style.overflow = previousOverflow;
    onReady();
  });
};
