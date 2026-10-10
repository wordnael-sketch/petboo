// ===== Pet Boo · Vitrine de produtos (/produtos) =====
// Dados em /vitrine.json. Fotos em /img/produtos/<slug>.jpg (baixadas dos posts do Instagram no build).
// Se a foto faltar, o card mostra um ícone no lugar.
(() => {
  const ICONS = {
    racao: '<svg viewBox="0 0 64 64"><path d="M16 10h32l-3 10H19z" fill="#5b265a"/><path d="M19 20h26l3 34a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z" fill="#df0621"/><circle cx="32" cy="38" r="8" fill="#fdf6c0"/><g fill="#5b265a"><circle cx="28.5" cy="35" r="1.6"/><circle cx="32" cy="33.5" r="1.6"/><circle cx="35.5" cy="35" r="1.6"/><ellipse cx="32" cy="40" rx="3.4" ry="2.6"/></g></svg>',
    pulga: '<svg viewBox="0 0 64 64"><path d="M32 6l20 8v16c0 13-9 22-20 28C21 52 12 43 12 30V14z" fill="#5b265a"/><path d="M32 13l14 5.6V30c0 9.5-6.2 16.3-14 20.8C24.2 46.3 18 39.5 18 30V18.6z" fill="#fdf6c0"/><path d="M25 31l5 5 10-11" stroke="#df0621" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    petisco: '<svg viewBox="0 0 64 64"><g transform="rotate(-30 32 32)"><rect x="12" y="27" width="40" height="10" rx="5" fill="#df0621"/><circle cx="12" cy="26" r="6" fill="#df0621"/><circle cx="12" cy="38" r="6" fill="#df0621"/><circle cx="52" cy="26" r="6" fill="#df0621"/><circle cx="52" cy="38" r="6" fill="#df0621"/></g><circle cx="47" cy="47" r="7" fill="#5b265a"/></svg>',
    cama: '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="42" rx="26" ry="12" fill="#5b265a"/><ellipse cx="32" cy="38" rx="20" ry="8" fill="#fdf6c0"/><path d="M8 38c0-10 10-16 24-16s24 6 24 16" fill="none" stroke="#df0621" stroke-width="7" stroke-linecap="round"/></svg>',
    passeio: '<svg viewBox="0 0 64 64"><path d="M14 22c6 10 30 10 36 0" fill="none" stroke="#5b265a" stroke-width="7" stroke-linecap="round"/><path d="M18 30c4 8 24 8 28 0v8c-4 8-24 8-28 0z" fill="#df0621"/><circle cx="32" cy="42" r="4" fill="#fee7a1" stroke="#5b265a" stroke-width="2"/></svg>',
    roupa: '<svg viewBox="0 0 64 64"><path d="M22 10l10 6 10-6 14 10-6 10-6-3v27H20V27l-6 3-6-10z" fill="#df0621"/><path d="M26 30h12M26 38h12M26 46h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>'
  };
  const CATS = [
    { id: "todos", nome: "Todos" }, { id: "racoes", nome: "Rações" }, { id: "saude", nome: "Antipulgas" },
    { id: "petiscos", nome: "Petiscos" }, { id: "camas", nome: "Camas e colchões" },
    { id: "passeio", nome: "Passeio" }, { id: "roupas", nome: "Roupinhas" }
  ];
  const WA_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.4 1 2.9.8 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg>';
  const grid = document.getElementById("grid"), tabs = document.getElementById("tabs");
  if (!grid || !tabs) return;
  // foto mostrada inteira no quadro (sem corte); "cobrir" preenche o quadro; "zoom" recorta (só fotos quadradas)
  document.head.insertAdjacentHTML("beforeend", "<style>.prod .art img{object-fit:contain}</style>");
  let PRODUTOS = [];

  const foto = p => p.slug
    ? `<img src="/img/produtos/${p.slug}.jpg" alt="${p.nome}" loading="lazy" ${p.cobrir ? `style="object-fit:cover"` : p.zoom && !p.inteira ? `style="object-fit:cover;object-position:${p.foco || "50% 50%"};transform:scale(${p.zoom});transform-origin:${p.foco || "50% 50%"}"` : ""} onerror="this.outerHTML=this.dataset.icone" data-icone='${ICONS[p.icon] || ""}'>`
    : (ICONS[p.icon] || "");

  function render(cat) {
    if (!CATS.some(c => c.id === cat)) cat = "todos";
    tabs.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", t.dataset.cat === cat));
    const list = cat === "todos" ? PRODUTOS : PRODUTOS.filter(p => p.cat === cat);
    grid.innerHTML = list.map((p, i) => `
      <article class="prod" style="animation-delay:${i * 40}ms">
        <div class="art">${p.tag ? `<span class="tag2">${p.tag}</span>` : ""}<span class="cb">+ cashback</span>${foto(p)}</div>
        <div class="body">
          <span class="brand">${p.marca}</span>
          <h3>${p.nome}</h3>
          <p>${p.desc}</p>
          <div class="opts">${(p.opts || []).map(o => `<span>${o}</span>`).join("")}</div>
          ${p.post ? `<a class="ig" href="https://www.instagram.com/p/${p.post}/" target="_blank" rel="noopener">Ver post no Instagram ↗</a>` : ""}
          <a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(`Olá, Pet Boo! Vi no site e quero saber preço e disponibilidade de: ${p.nome}${p.marca && !/Várias|Pet Boo/.test(p.marca) ? ` (${p.marca})` : ""}.`)}">${WA_ICON} Consultar preço</a>
        </div>
      </article>`).join("") + `
      <article class="prod ask" style="animation-delay:${list.length * 40}ms">
        <h3>Não achou o que procura?</h3>
        <p>Temos muito mais na loja. Pergunte pelo WhatsApp que a gente verifica.</p>
        <a class="btn btn-cream" target="_blank" rel="noopener" href="${waLink("Olá, Pet Boo! Vocês têm este produto: ")}">Perguntar</a>
      </article>`;
  }

  fetch("/vitrine.json", { cache: "no-cache" }).then(r => r.json()).then(d => {
    PRODUTOS = d.produtos || [];
    const count = c => c === "todos" ? PRODUTOS.length : PRODUTOS.filter(p => p.cat === c).length;
    tabs.innerHTML = CATS.filter(c => count(c.id)).map(c => `<button class="tab" role="tab" data-cat="${c.id}">${c.nome}<span class="c">${count(c.id)}</span></button>`).join("");
    render(location.hash.slice(1));
  }).catch(() => { grid.innerHTML = '<p class="note">Não foi possível carregar a vitrine agora. Fale com a gente pelo WhatsApp.</p>'; });

  tabs.addEventListener("click", e => { const t = e.target.closest(".tab"); if (t) { render(t.dataset.cat); history.replaceState(null, "", "#" + t.dataset.cat); } });
  addEventListener("hashchange", () => { const h = location.hash.slice(1); if (CATS.some(c => c.id === h)) { render(h); document.getElementById("vitrine").scrollIntoView({ behavior: "smooth" }); } });
})();
