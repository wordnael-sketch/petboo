// ===== Pet Boo · menu hambúrguer (telas até 1040px) =====
// Cria o botão no cabeçalho e transforma o <nav class="links"> em painel. O build insere este script em todas as páginas.
(() => {
  const header = document.querySelector("header"), nav = header && header.querySelector("nav.links"), barra = header && header.querySelector(".nav");
  if (!nav || !barra || header.querySelector(".menu-btn")) return;
  nav.id = nav.id || "menu";
  nav.setAttribute("aria-label", "Menu principal");
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "menu-btn";
  btn.setAttribute("aria-controls", nav.id);
  btn.innerHTML = "<span></span><span></span><span></span>";
  barra.appendChild(btn);
  const abrir = on => {
    header.classList.toggle("aberto", on);
    document.documentElement.classList.toggle("menu-aberto", on);
    btn.setAttribute("aria-expanded", on);
    btn.setAttribute("aria-label", on ? "Fechar menu" : "Abrir menu");
  };
  abrir(false);
  btn.addEventListener("click", () => abrir(!header.classList.contains("aberto")));
  nav.addEventListener("click", e => { if (e.target.closest("a")) abrir(false); });
  document.addEventListener("click", e => { if (!header.contains(e.target)) abrir(false); });
  addEventListener("keydown", e => { if (e.key === "Escape" && header.classList.contains("aberto")) { abrir(false); btn.focus(); } });
  matchMedia("(min-width:1041px)").addEventListener("change", e => { if (e.matches) abrir(false); });
})();
