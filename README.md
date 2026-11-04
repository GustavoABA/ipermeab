# Impermeabilize

Site institucional responsivo e catálogo de soluções em impermeabilização, baseado na identidade visual azul-marinho, amarelo e branco.

## Tecnologia

**HTML5 + CSS3 + JavaScript**, sem dependências obrigatórias, sem backend e sem etapa de compilação. O site pode ser servido como arquivo estático pelo GitHub Pages.

## O que já foi implementado

- Página inicial com hero, argumentos de valor e atendimento.
- Seis painéis interativos: piscinas, baldrames, lajes/coberturas, banheiros, redutores de capilaridade e fundações.
- Catálogo ilustrativo com 12 produtos e filtros por marca (Sika, Vedacit, MC-Bauchemie e Dryko).
- Informações institucionais, perguntas frequentes, seção de contato e rodapé.
- Menu mobile, navegação por teclado nas tabs, estados acessíveis e adaptação a telas pequenas.

## Como executar

Basta abrir o arquivo `index.html` em um navegador. Para desenvolver com servidor local, use qualquer servidor estático de sua preferência.

## Configuração dos contatos

Edite `config.js` para adicionar somente dados oficiais:

- `whatsappVendas` e `whatsappTecnico`: números brasileiros com código de país, somente dígitos (`55` seguido de DDD e telefone).
- `email`, `phoneDisplay`, `endereco`, `horario`, `instagramUrl` e `facebookUrl`.

Enquanto não houver número válido configurado, os botões de WhatsApp **não simulam um atendimento**; mostram uma mensagem de configuração pendente.

## Publicar pelo GitHub Pages

No repositório do GitHub, abra **Settings → Pages**, escolha **Deploy from a branch**, selecione **main** e a pasta **/(root)**. Salve e aguarde o GitHub informar o endereço público. A publicação não foi ativada automaticamente por este projeto.

## Fontes e especificação

Consulte `REFERENCIAS_TECNICAS.md`. Os textos do site são orientativos e **não substituem** projeto e ficha técnica do fabricante. Algumas linhas, como Sika®-1 e MC-Hydro 1, não são indicadas para concreto armado nas respectivas fichas brasileiras.

## Imagens e produção

Na versão inicial, as embalagens e fotografias são carregadas de **URLs externas**, como referências visuais. Esse conteúdo pode mudar ou ficar indisponível. Antes de usar comercialmente em produção, confirme direitos de uso e disponibilidade, substitua por imagens autorizadas hospedadas em `assets/` e ajuste os endereços em `index.html` e `styles.css`.

## Pendências comerciais

- Confirmar os dados da empresa (telefones, e-mail, endereço, horários e redes).
- Confirmar a lista exata de produtos comercializados e a disponibilidade.
- Revisar textos finais com responsável técnico e publicar fotos autorizadas.
