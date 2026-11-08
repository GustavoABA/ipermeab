import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const js = readFileSync("app.js", "utf8");
const css = readFileSync("styles.css", "utf8");

const keys = ["piscinas", "baldrames", "lajes", "banheiros", "aditivos"];
const areas = ["inicio", "atendimento", "solucoes", "sobre", "produtos", "linhas-produtos", "beneficios", "marcas", "duvidas", "contato"];
const errors = [];
let checks = 0;
function verify(name, test) {
  checks += 1;
  try { assert.ok(test, name); }
  catch { errors.push(name); }
}
for (const key of keys) {
  verify("Aba " + key, html.includes('data-solution="' + key + '"'));
  verify("Painel " + key, html.includes('data-panel="' + key + '"'));
  verify("Relação de produtos " + key, new RegExp("\\b" + key + ": \\[", "u").test(js));
}
for (const id of areas) verify("Área compartilhável " + id, html.includes('id="' + id + '"'));
verify("Banners responsivos desktop e mobile", html.includes("assets/hero/impermeabilize-desktop.webp") && html.includes("assets/hero/impermeabilize-mobile.webp") && html.includes("<picture"));
verify("Foto real da fachada preservada", existsSync("assets/empresa/fachada-impermeabilize.webp"));
verify("Botões reais sobre as artes", (html.match(/class="hero-hotspot hero-hotspot-/g) || []).length === 2);
for (const icon of ["piscinas.webp", "baldrames.webp", "lajes.webp", "banheiros.svg", "aditivos.svg"]) {
  verify("Ícone na aba " + icon, html.includes("assets/icones/" + icon) && existsSync("assets/icones/" + icon));
}
verify("Modal de atendimento", html.includes('id="coming-soon-dialog"') && js.includes("showModal()"));
verify("Links individuais por solução", js.includes('"#solucao-" + key') && js.includes("syncSolutionFromAddress"));
verify("Botão para copiar link", js.includes("navigator.clipboard.writeText"));
verify("Responsividade", css.includes("@media(max-width:600px)"));
verify("Sem mensagens técnicas no atendimento", !html.includes("WhatsApp ainda não cadastrado") && !js.includes("Configure os canais oficiais"));
verify("Drykocril D-9 no catálogo", html.includes("<h3>Drykocril D-9</h3>"));
verify("Alias de link de capilaridade", js.includes('key === "capilaridade" ? "aditivos" : key'));
verify("Aba Fundações removida", !html.includes('id="tab-fundacoes"') && !html.includes('id="panel-fundacoes"'));
verify("Cinco abas de soluções", (html.match(/role="tab" id="tab-/g) || []).length === 5);
verify("Aditivos para concreto e Banheiros elevados", html.includes("Aditivos para concreto") && html.includes("Banheiros elevados"));
verify("Nove famílias de produtos", (html.match(/class="product-family"/g) || []).length === 9);
const familiesStart = html.indexOf('<div class="product-families"');
const familiesEnd = html.indexOf('<div class="family-caution"', familiesStart);
const familiesHTML = familiesStart >= 0 && familiesEnd > familiesStart ? html.slice(familiesStart, familiesEnd) : "";
verify("Vinte e três produtos na lista", (familiesHTML.match(/<li>/g) || []).length === 23);
const sectionsInOrder = ["solucoes", "sobre", "produtos", "linhas-produtos", "beneficios", "marcas"];
const sectionPositions = sectionsInOrder.map((id) => html.indexOf('id="' + id + '"'));
verify("Ordem de seção: soluções, quem somos, catálogo, linhas", sectionPositions.every((pos, i) => pos >= 0 && (i === 0 || pos > sectionPositions[i - 1])));
verify("Catálogo com doze cartões com fotos", (html.match(/class="product-card"/g) || []).length === 12 && (html.match(/class="product-image"/g) || []).length === 12);
verify("Linhas de produtos depois do catálogo", html.indexOf('id="produtos"') < html.indexOf('id="linhas-produtos"'));
verify("Navegação acompanha a ordem", js.includes('"solucoes", "sobre", "produtos", "linhas-produtos", "beneficios"'));
verify("Logo com duas coberturas alinhadas", (html.match(/class="brand-mark"/g) || []).length === 2 && !html.includes("m6 53 19-14") && html.includes("M5 31 L40 5 L75 31"));
verify("Atendimento usa Fale conosco", html.includes('Fale <strong>conosco</strong>') && !/Falar com vendas|Conversar com vendas|Fale com Vendas|Fale com <strong>vendas<\/strong>/i.test(html));
verify("Botão no banner com texto e ação", html.includes('<span>Fale conosco</span>') && html.includes('data-contact="sales"'));

verify("Foto da loja após banner", html.includes('class="hero-intro"') && html.includes('assets/empresa/fachada-impermeabilize.webp'));
verify("Novas imagens de aplicação", css.includes("assets/aplicacoes/baldrames.webp") && css.includes("assets/aplicacoes/lajes.webp"));


const requiredAssets = [
  "assets/empresa/fachada-impermeabilize.webp",
  ...keys.map((key) => "assets/montagens/" + key + ".webp"),
  "assets/aplicacoes/baldrames.webp", "assets/aplicacoes/lajes.webp",
  ...[
    "sikatop-flex-fibras", "sikatop-100", "drykoelastic-pro",
    "sika-baldrame", "sikashield", "sikafill-rapido-branco",
    "mc-proof-multi", "mc-proof-900-el", "sika-1",
    "mc-hydro-1", "vedacit-aditivo", "drykocril-d9"
  ].map((name) => "assets/produtos/" + name + ".webp")
];
if (existsSync("assets")) {
  for (const file of requiredAssets) verify("Imagem: " + file, existsSync(file));
} else {
  console.warn("AVISO: 19 imagens ainda não foram enviadas ao repositório. Execute o importador.");
}
if (errors.length) {
  for (const e of errors) console.error("FALHOU: " + e);
  process.exitCode = 1;
} else {
  console.log("Validação estática concluída: " + checks + " verificações aprovadas.");
}
