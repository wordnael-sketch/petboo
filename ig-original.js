// ===== Pet Boo · Galerias do Instagram (rotativas) =====
// Fonte dos posts: 1) /api/instagram (API oficial, precisa do token IG_TOKEN na Vercel)
//                  2) /instagram.json (lista atualizada pela rotina de sincronização 2x por semana)
(() => {
  const IG_MAX_DIAS_OFERTA = 90;     // ofertas mais antigas somem sozinhas (evita preço vencido)
  const ROTACAO_MS = 4500;           // tempo entre uma publicação e outra
  const MAX_VISIVEIS_PETS = 10;      // quantas fotos de pets entram no rodízio por visita

  const fmtData = iso => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const recente = iso => !iso || (Date.now() - new Date(iso)) / 864e5 <= IG_MAX_DIAS_OFERTA;
  const esc = s => String(s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const embaralhar = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const semAnimacao = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function slideApi(item, tipo) {
    const consultar = tipo === "produtos"
      ? `<a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(`Olá, Pet Boo! Vi esta oferta no site/Instagram: ${item.permalink}`)}">Consultar</a>` : "";
    return `<div class="slide"><a class="igcard" href="${item.permalink}" target="_blank" rel="noopener">
      <img src="${item.img}" alt="${esc((item.caption || "Post da Pet Boo").slice(0, 120))}" loading="lazy">
      <p>${esc(item.caption)}</p></a>
      <div class="igfoot"><span>${fmtData(item.timestamp)}</span>${consultar}</div></div>`;
  }
  function slideEmbed(item, tipo) {
    const data = tipo === "produtos" && item.data ? `<p class="igdate">Postado em ${fmtData(item.data + "T12:00")}</p>` : "";
    return `<div class="slide">
      <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/${item.id}/" data-instgrm-version="14">
        <a class="ph" href="https://www.instagram.com/p/${item.id}/" target="_blank" rel="noopener"><b>Pet Boo</b>Ver no Instagram</a>
      </blockquote>${data}</div>`;
  }

  // Rodízio automático: avança um post a cada ROTACAO_MS; volta ao início no fim.
  // Pausa quando o visitante passa o mouse, toca, rola manualmente ou troca de aba.
  function rotacionar(track) {
    if (semAnimacao || track.children.length < 2) return;
    let pausado = false, retomar;
    const pausar = (ms = 8000) => { pausado = true; clearTimeout(retomar); retomar = setTimeout(() => pausado = false, ms); };
    track.addEventListener("mouseenter", () => { pausado = true; clearTimeout(retomar); });
    track.addEventListener("mouseleave", () => pausar(1500));
    track.addEventListener("touchstart", () => pausar(), { passive: true });
    track.addEventListener("wheel", () => pausar(), { passive: true });
    let visivel = false;
    new IntersectionObserver(es => visivel = es[0].isIntersecting).observe(track);
    track._pausar = pausar;
    setInterval(() => {
      if (pausado || !visivel || document.hidden) return;
      const passo = (track.querySelector(".slide")?.offsetWidth || 300) + 18;
      const fim = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      track.scrollTo({ left: fim ? 0 : track.scrollLeft + passo, behavior: "smooth" });
    }, ROTACAO_MS);
  }

  let embedJs = false;
  function carregarEmbedJs() {
    if (embedJs) return window.instgrm && window.instgrm.Embeds.process();
    embedJs = true;
    const s = document.createElement("script"); s.async = true; s.src = "https://www.instagram.com/embed.js";
    document.body.appendChild(s);
  }

  let carregado = false;
  async function carregar() {
    if (carregado) return; carregado = true;
    let dados = null, modo = "embed";
    try { const r = await fetch("/api/instagram"); if (r.ok) { const j = await r.json(); if (j.source === "api") { dados = j; modo = "api"; } } } catch {}
    if (!dados) { try { dados = await (await fetch("/instagram.json", { cache: "no-cache" })).json(); } catch { dados = { pets: [], produtos: [] }; } }
    document.querySelectorAll("[data-ig]").forEach(track => {
      const tipo = track.dataset.ig;
      let itens = dados[tipo] || [];
      if (tipo === "produtos") itens = itens.filter(i => recente(i.timestamp || (i.data && i.data + "T12:00")) || i.semPreco);
      if (tipo === "pets") itens = embaralhar(itens).slice(0, MAX_VISIVEIS_PETS); // ordem diferente a cada visita
      if (!itens.length) { track.hidden = true; if (tipo === "produtos") track.previousElementSibling.hidden = true; return; }
      track.innerHTML = itens.map(i => modo === "api" ? slideApi(i, tipo) : slideEmbed(i, tipo)).join("");
      rotacionar(track);
    });
    if (modo === "embed") carregarEmbedJs();
  }

  const primeiro = document.querySelector("[data-ig]");
  if (primeiro) {
    new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { o.disconnect(); carregar(); } }, { rootMargin: "600px" }).observe(primeiro);
    setTimeout(carregar, 5000); // garantia: carrega mesmo se o observador não disparar
  }
  document.querySelectorAll(".arrows").forEach(box => box.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    const track = document.querySelector(`[data-ig="${box.dataset.for}"]`);
    track._pausar && track._pausar();
    const w = (track.querySelector(".slide")?.offsetWidth || 300) + 18;
    track.scrollBy({ left: w * +b.dataset.dir, behavior: "smooth" });
  })));
})();
