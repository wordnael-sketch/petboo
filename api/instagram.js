// Vercel Function: sincroniza a galeria do site com o Instagram da Pet Boo.
// Configure em Vercel > Project > Settings > Environment Variables:
//   IG_TOKEN  = token de longa duração da conta @petboodf (Instagram API with Instagram Login)
// Regras de classificação (a loja controla pelo próprio post):
//   - legenda com #vitrinepetboo  -> "Ofertas no Instagram" (produtos)
//   - legenda com #aumiguinhos    -> galeria "Nossos aumiguinhos" (pets)
//   - sem hashtag: posts com R$ / promoção / oferta vão para produtos; o resto, ignorado.
const TAG_PROD = /#vitrinepetboo\b/i;
const TAG_PET = /#aumiguinhos\b/i;
const PARECE_OFERTA = /(R\$\s?\d|promo[cç][aã]o|oferta|imperd[ií]vel|desconto)/i;

export default async function handler(req, res) {
  const token = process.env.IG_TOKEN;
  if (!token) return res.status(200).json({ source: "none" });
  try {
    const url = "https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=60&access_token=" + encodeURIComponent(token);
    const r = await fetch(url);
    if (!r.ok) throw new Error("instagram " + r.status + " " + (await r.text()).slice(0, 200));
    const { data = [] } = await r.json();
    const pets = [], produtos = [];
    for (const m of data) {
      const img = m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url;
      if (!img) continue;
      const cap = m.caption || "";
      const item = { id: m.id, img, permalink: m.permalink, timestamp: m.timestamp, caption: cap.replace(/#\S+/g, "").trim() };
      if (TAG_PROD.test(cap)) produtos.push(item);
      else if (TAG_PET.test(cap)) pets.push(item);
      else if (PARECE_OFERTA.test(cap)) produtos.push(item);
    }
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({ source: "api", atualizado: new Date().toISOString(), pets: pets.slice(0, 12), produtos: produtos.slice(0, 12) });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ source: "erro" }); // o site cai para /instagram.json
  }
}
