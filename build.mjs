// Build da Vercel (node build.mjs):
// 1) para cada produto de vitrine.json, baixa a foto INTEIRA do post ("full"; ou tenta a página de embed);
//    se não der, usa o link "src" (miniatura quadrada, recortada pelo Instagram);
//    se o link já expirou, reaproveita a foto publicada no site;
// 2) grava public/vitrine.json com "inteira": true nos itens com foto inteira (sem recorte via CSS);
// 3) copia os arquivos do site para a pasta public/ (saída do build) e insere responsivo.css + menu.js em todas as páginas.
import fs from "fs";
import path from "path";
const SITE = "https://petboo-ten.vercel.app";
const OUT = "public";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const IGNORAR = new Set(["api", OUT, "build.mjs", "package.json", "vercel.json", "node_modules", ".vercel"]);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(`${OUT}/img/produtos`, { recursive: true });

const vitrine = JSON.parse(fs.readFileSync("vitrine.json", "utf8"));
const produtos = vitrine.produtos || [];

// modo de cada foto já publicada (para o caso de reaproveitar a do site)
let publicado = {};
try { const r = await fetch(`${SITE}/img/produtos/_ok.json`); const j = await r.json(); if (!Array.isArray(j)) publicado = j; } catch {}

// link da maior versão da foto do post, lida da página de embed
const cacheEmbed = {};
async function fotoInteira(post) {
  if (!post) return null;
  if (post in cacheEmbed) return cacheEmbed[post];
  let url = null;
  try {
    const r = await fetch(`https://www.instagram.com/p/${post}/embed/`, { headers: { "user-agent": UA, "accept-language": "pt-BR" } });
    const html = await r.text();
    const bloco = html.match(/class="EmbeddedMediaImage"[^>]*>/) || html.match(/<img[^>]+srcset="[^"]{500,}"[^>]*>/);
    const srcset = bloco && (bloco[0].match(/srcset="([^"]+)"/) || [])[1];
    if (srcset) {
      const op = srcset.replace(/&amp;/g, "&").split(",").map(s => s.trim().split(/\s+/)).filter(a => a[0] && a[1]);
      op.sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
      url = op[0] ? op[0][0] : null;
    }
    if (!url) console.log("embed sem foto:", post, r.status, html.length);
  } catch (e) { console.log("embed falhou:", post, e.message); }
  return (cacheEmbed[post] = url);
}

async function baixar(url, destino) {
  const r = await fetch(url, { headers: { "user-agent": UA } });
  const tipo = r.headers.get("content-type") || "";
  if (!r.ok || !tipo.startsWith("image/")) throw new Error(r.status + " " + tipo);
  fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
}

const modos = {};
for (const p of produtos) {
  const destino = `${OUT}/img/produtos/${p.slug}.jpg`;
  const tentativas = [
    [p.full, "inteira"],                    // link da foto inteira coletado pela rotina (navegador)
    [p.full ? null : await fotoInteira(p.post), "inteira"],
    [p.src, "quadrada"],
    [`${SITE}/img/produtos/${p.slug}.jpg`, publicado[p.slug] || "quadrada"],
  ].filter(t => t[0]);
  for (const [url, modo] of tentativas) {
    try { await baixar(url, destino); modos[p.slug] = modo; console.log("foto ok:", p.slug, modo, url.startsWith(SITE) ? "(site)" : "(instagram)"); break; }
    catch (e) { console.log("falhou:", p.slug, modo, e.message); }
  }
  if (modos[p.slug] === "inteira") { p.inteira = true; delete p.foco; delete p.zoom; }
}
fs.writeFileSync(`${OUT}/img/produtos/_ok.json`, JSON.stringify(modos));
const n = Object.keys(modos).length, ni = Object.values(modos).filter(m => m === "inteira").length;
console.log(`${n}/${produtos.length} fotos de produtos (${ni} inteiras)`);

function copiar(dir) {
  for (const nome of fs.readdirSync(dir)) {
    const origem = path.join(dir, nome);
    if (dir === "." && IGNORAR.has(nome)) continue;
    const destino = path.join(OUT, origem);
    if (fs.statSync(origem).isDirectory()) { fs.mkdirSync(destino, { recursive: true }); copiar(origem); }
    else fs.copyFileSync(origem, destino);
  }
}
copiar(".");
// arquivos compartilhados: responsivo.css (depois do styles.css) e menu.js (hambúrguer) em todas as páginas
for (const nome of fs.readdirSync(OUT).filter(n => n.endsWith(".html"))) {
  let html = fs.readFileSync(`${OUT}/${nome}`, "utf8");
  if (!html.includes("/responsivo.css")) html = html.replace(/(<link[^>]+href="\/styles\.css"[^>]*>)/, '$1\n<link rel="stylesheet" href="/responsivo.css">');
  if (!html.includes("/menu.js")) html = html.replace("</body>", '<script src="/menu.js" defer></script>\n</body>');
  fs.writeFileSync(`${OUT}/${nome}`, html);
}
fs.writeFileSync(`${OUT}/vitrine.json`, JSON.stringify(vitrine, null, 1)); // versão com "inteira"
console.log("arquivos copiados para", OUT);
