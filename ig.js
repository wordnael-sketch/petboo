// Carrega as galerias originais (ig-original.js) e a faixa de site demonstrativo (sem pop-up).
document.write('<script src="/ig-original.js"><\/script>');

// ===== Aviso de site demonstrativo (proposta ainda não aprovada) =====
(function () {
  var CLIENTE = 'a Pet Boo', TIPO = 'site';
  function run() {
    if (document.getElementById('demo-aviso-faixa')) return;
    if (!/^\[DEMONSTRATIVO\]/.test(document.title)) document.title = '[DEMONSTRATIVO] ' + document.title;
    if (!document.querySelector('meta[name="robots"]')) { var m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex, nofollow'; document.head.appendChild(m); }
    var font = "font-family:system-ui,-apple-system,'Segoe UI',sans-serif;";
    var faixa = document.createElement('div');
    faixa.id = 'demo-aviso-faixa'; faixa.setAttribute('role', 'note');
    faixa.style.cssText = font + 'position:relative;z-index:2147483000;background:#14241A;color:#fff;font-size:14px;line-height:1.4;padding:10px 16px;text-align:center;';
    faixa.innerHTML = '<strong style="background:#FFD21F;color:#14241A;padding:2px 8px;border-radius:6px;margin-right:8px;">SITE DEMONSTRATIVO</strong>Esta é uma <strong>proposta de site</strong> criada por Leandro Araújo para ' + CLIENTE + '. Não é o site oficial: conteúdos, preços e imagens são ilustrativos.';
    document.body.insertBefore(faixa, document.body.firstChild);
    var rod = document.createElement('div');
    rod.style.cssText = font + 'background:#14241A;color:#fff;font-size:13px;padding:14px 16px;text-align:center;';
    rod.innerHTML = '<strong style="color:#FFD21F;">Site demonstrativo</strong> · proposta de Leandro Araújo para ' + CLIENTE + '. Não é o site oficial.';
    document.body.appendChild(rod);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
