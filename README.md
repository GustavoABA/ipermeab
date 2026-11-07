# Impermeabilize

Site institucional responsivo e catálogo de soluções em impermeabilização, baseado na identidade visual azul-marinho, amarelo e branco.

## Tecnologia

**HTML5 + CSS3 + JavaScript**, sem dependências obrigatórias, sem backend e sem etapa de compilação. O site pode ser servido como arquivo estático pelo GitHub Pages.

## O que já foi implementado

- Página inicial com hero, argumentos de valor e atendimento.
- Seis painéis interativos: piscinas, baldrames, lajes/coberturas, banheiros elevados, redutores de capilaridade e fundações, com composições de produtos em cada aba.
- Catálogo ilustrativo com 12 produtos e filtros por marca (Sika, Vedacit, MC-Bauchemie e Dryko).
- Informações institucionais, perguntas frequentes, seção de contato e rodapé.
- Menu mobile, navegação por teclado nas abas, estados acessíveis, adaptação a telas pequenas e URLs compartilháveis para seções e soluções.\n- Botões de atendimento abrem temporariamente uma janela “Em breve”, sem exibir erros ou configurações internas.

## Como executar

Basta abrir o arquivo `index.html` em um navegador. Para desenvolver com servidor local, use qualquer servidor estático de sua preferência.

## Links por área

O site é uma **única página**. A URL muda para o setor visível durante a rolagem, por exemplo `#sobre`, `#produtos` ou `#contato`. Clicar em uma aba de solução gera um link individual como `#solucao-piscinas`, `#solucao-baldrames` e `#solucao-capilaridade`.

Os botões “Copiar link” geram o endereço completo da seção. Ao abrir uma URL de solução, a aba correspondente é selecionada automaticamente.

## Imagens fornecidas

O novo banner aceita a foto real da loja em Leme, SP, no caminho `assets/empresa/fachada-impermeabilize.webp`.

As composições de produtos usam `assets/montagens/{piscinas,baldrames,lajes,banheiros,capilaridade,fundacoes}.webp`. O catálogo e os cards responsivos utilizam imagens individuais de `assets/produtos/`.

**Esses arquivos binários devem ser enviados separadamente** para a branch, preservando as pastas. Até serem adicionados, o site tem imagens externas alternativas e pode não exibir o banner real ou as montagens finais.

As montagens são ilustrativas: os produtos não formam necessariamente um sistema único, nem substituem projeto e fichas técnicas.

## Atendimento temporário

Por enquanto, todos os botões comerciais e técnicos abrem um modal **“Em breve”**, independentemente de haver número configurado. Não há envio de mensagem nem tentativa de abrir o WhatsApp. Os dados oficiais podem continuar cadastrados em `config.js` para futura ativação, mas não aparecem mensagens de diagnóstico para clientes.

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
