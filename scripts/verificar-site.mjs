import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const js = readFileSync("app.js", "utf8");
const css = readFileSync("styles.css", "utf8");

const keys = ["piscinas", "baldrames", "lajes", "banheiros", "capilaridade", "fundacoes"];
const areas = ["inicio", "atendimento", "solucoes", "beneficios", "produtos", "sobre", "marcas", "duvidas", "contato"];
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
verify("Banner com a fachada de Leme", html.includes("assets/empresa/fachada-impermeabilize.webp"));
verify("Modal de atendimento", html.includes('id="coming-soon-dialog"') && js.includes("showModal()"));
verify("Links individuais por solução", js.includes('"#solucao-" + key') && js.includes("syncSolutionFromAddress"));
verify("Botão para copiar link", js.includes("navigator.clipboard.writeText"));
verify("Responsividade", css.includes("@media(max-width:600px)"));
verify("Sem mensagens técnicas no atendimento", !html.includes("WhatsApp ainda não cadastrado") && !js.includes("Configure os canais oficiais"));
verify("Drykocril D-9 no catálogo", html.includes("<h3>Drykocril D-9</h3>"));

const requiredAssets = [
  "assets/empresa/fachada-impermeabilize.webp",
  ...keys.map((key) => "assets/montagens/" + key + ".webp"),
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
