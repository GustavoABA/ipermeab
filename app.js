(() => {
  "use strict";

  const config = window.IMPERMEABILIZE_CONFIG || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smooth = reducedMotion ? "auto" : "smooth";

  // Menu responsivo
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector("#mobile-nav");
  function closeMenu() {
    if (!menuButton || !mobileNav) return;
    mobileNav.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
  }
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      mobileNav.hidden = isOpen;
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
    });
    mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", (event) => {
      if (mobileNav.hidden || menuButton.contains(event.target) || mobileNav.contains(event.target)) return;
      closeMenu();
    });
  }

  // Navegação profunda das abas: cada solução tem seu próprio endereço compartilhável.
  const tabs = Array.from(document.querySelectorAll(".solution-tab"));
  const panels = Array.from(document.querySelectorAll(".solution-panel"));
  const solutionSection = document.querySelector("#solucoes");
  const solutionKeys = new Set(tabs.map((tab) => tab.dataset.solution));
  let activeSolution = tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.solution || "piscinas";

  function activateSolution(key, { focus = false, updateURL = false, scroll = false } = {}) {
    const selected = tabs.find((tab) => tab.dataset.solution === key);
    if (!selected) return;
    activeSolution = key;
    tabs.forEach((tab) => {
      const on = tab === selected;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== key;
    });
    if (updateURL) {
      const anchor = "#solucao-" + key;
      if (window.location.hash !== anchor) window.history.pushState(null, "", anchor);
    }
    if (focus) selected.focus();
    if (scroll && solutionSection) solutionSection.scrollIntoView({ behavior: smooth, block: "start" });
  }

  function solutionFromHash() {
    // Links malformados não devem impedir o restante do site de funcionar.
    let fragment;
    try { fragment = decodeURIComponent(window.location.hash.slice(1)); }
    catch { return null; }
    const key = fragment.startsWith("solucao-") ? fragment.slice("solucao-".length) : null;
    return key === "capilaridade" ? "aditivos" : key;
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateSolution(tab.dataset.solution, { updateURL: true }));
    tab.addEventListener("keydown", (event) => {
      const last = tabs.length - 1;
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = index === last ? 0 : index + 1;
      else if (event.key === "ArrowLeft") nextIndex = index === 0 ? last : index - 1;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = last;
      else return;
      event.preventDefault();
      activateSolution(tabs[nextIndex].dataset.solution, { focus: true, updateURL: true });
      tabs[nextIndex].scrollIntoView({ behavior: smooth, block: "nearest", inline: "nearest" });
    });
  });

  document.querySelectorAll("[data-go-solution]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      activateSolution(link.dataset.goSolution, { updateURL: true, scroll: true });
      closeMenu();
    });
  });

  function syncSolutionFromAddress(scroll = false) {
    const key = solutionFromHash();
    if (solutionKeys.has(key)) activateSolution(key, { scroll });
  }
  const initialSolution = solutionFromHash();
  syncSolutionFromAddress();
  // O ID da aba é virtual (#solucao-...), então o navegador não o rola sozinho.
  // Posicionar a seção assim que o DOM estiver pronto evita depender de fotos externas.
  if (solutionKeys.has(initialSolution)) {
    window.requestAnimationFrame(() => solutionSection?.scrollIntoView({ behavior: "auto", block: "start" }));
  }
  window.addEventListener("hashchange", () => syncSolutionFromAddress(true));
  window.addEventListener("popstate", () => syncSolutionFromAddress(true));

  // A URL acompanha a área visível, sem recarregar a página e sem inflar o histórico.
  const sectionIDs = ["inicio", "atendimento", "solucoes", "beneficios", "produtos", "sobre", "marcas", "duvidas", "contato"];
  const sections = sectionIDs.map((id) => document.getElementById(id)).filter(Boolean);
  let sectionFrame = 0;
  function syncVisibleSection() {
    sectionFrame = 0;
    const marker = window.scrollY + window.innerHeight * 0.38;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top + window.scrollY <= marker) current = section;
      else break;
    }
    if (!current) return;
    const anchor = current.id === "solucoes" ? "#solucao-" + activeSolution : "#" + current.id;
    if (window.location.hash !== anchor) window.history.replaceState(null, "", anchor);
  }
  window.addEventListener("scroll", () => {
    if (!sectionFrame) sectionFrame = window.requestAnimationFrame(syncVisibleSection);
  }, { passive: true });

  // Copiar o endereço direto do setor/aba usando o navegador.
  document.querySelectorAll("[data-copy-link]").forEach((button) => {
    button.addEventListener("click", async () => {
      const key = button.dataset.copyLink;
      const anchor = key === "current-solution" || key === "solucoes"
        ? "#solucao-" + activeSolution : "#" + key;
      const url = new URL(window.location.href);
      url.hash = anchor;
      try {
        await navigator.clipboard.writeText(url.href);
        const previous = button.textContent;
        button.textContent = "Link copiado!";
        window.setTimeout(() => { button.textContent = previous; }, 2000);
      } catch {
        window.prompt("Copie o link desta área:", url.href);
      }
    });
  });

  // Filtro de catálogo por fabricante
  const brandButtons = Array.from(document.querySelectorAll(".brand-filter"));
  const productCards = Array.from(document.querySelectorAll(".product-card"));
  brandButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const brand = button.dataset.brand;
      brandButtons.forEach((other) => {
        const active = other === button;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });
      productCards.forEach((card) => {
        card.hidden = brand !== "all" && card.dataset.brand !== brand;
      });
    });
  });

  // Atendimento será habilitado posteriormente. Não expor configurações internas ao visitante.
  const comingSoonDialog = document.querySelector("#coming-soon-dialog");
  const openComingSoon = () => {
    if (comingSoonDialog && typeof comingSoonDialog.showModal === "function") {
      if (!comingSoonDialog.open) comingSoonDialog.showModal();
    } else {
      window.alert("Em breve! Nosso atendimento estará disponível em breve.");
    }
  };
  document.querySelectorAll("[data-contact]").forEach((button) => {
    button.addEventListener("click", openComingSoon);
  });
  comingSoonDialog?.querySelector("[data-close-dialog]")?.addEventListener("click", () => comingSoonDialog.close());
  comingSoonDialog?.addEventListener("click", (event) => {
    if (event.target === comingSoonDialog) comingSoonDialog.close();
  });

  // Informações publicadas somente se forem preenchidas pelo responsável.
  const footerContact = document.querySelector("#footer-contact");
  const contactLines = [];
  if (config.phoneDisplay) contactLines.push(config.phoneDisplay);
  if (config.endereco) contactLines.push(config.endereco);
  if (config.horario) contactLines.push(config.horario);
  if (footerContact && contactLines.length) footerContact.textContent = contactLines.join(" • ");
  if (config.email && footerContact) {
    const mailLink = document.createElement("a");
    mailLink.href = "mailto:" + config.email;
    mailLink.textContent = config.email;
    mailLink.style.color = "#d5e4ee";
    footerContact.insertAdjacentElement("afterend", mailLink);
  }

  const socialContainer = document.querySelector("#social-links");
  const socialEntries = [
    { label: "Instagram", url: config.instagramUrl },
    { label: "Facebook", url: config.facebookUrl }
  ];
  if (socialContainer) {
    for (const social of socialEntries) {
      if (!social.url) continue;
      try {
        const parsed = new URL(social.url);
        if (parsed.protocol !== "https:") continue;
        const link = document.createElement("a");
        link.href = parsed.href;
        link.rel = "noopener noreferrer";
        link.target = "_blank";
        link.textContent = social.label;
        socialContainer.appendChild(link);
      } catch {
        // Ignora endereço incompleto.
      }
    }
  }


  // Uma composição de embalagens para cada aplicação; não é um kit nem especificação.
  const productAssets = {
    "SikaTop® Flex Fibras": "assets/produtos/sikatop-flex-fibras.webp",
    "SikaTop®-100": "assets/produtos/sikatop-100.webp",
    "Drykoelastic Pro": "assets/produtos/drykoelastic-pro.webp",
    "Sika® Baldrame": "assets/produtos/sika-baldrame.webp",
    "SikaShield®": "assets/produtos/sikashield.webp",
    "SikaFill® Rápido Branco": "assets/produtos/sikafill-rapido-branco.webp",
    "MC-Proof Multi": "assets/produtos/mc-proof-multi.webp",
    "MC-Proof 900 EL": "assets/produtos/mc-proof-900-el.webp",
    "Sika®-1": "assets/produtos/sika-1.webp",
    "Hydro 1": "assets/produtos/mc-hydro-1.webp",
    "Vedacit Aditivo": "assets/produtos/vedacit-aditivo.webp",
    "Drykocril D-9": "assets/produtos/drykocril-d9.webp"
  };
  const productGroups = {
    piscinas: ["SikaTop® Flex Fibras", "SikaTop®-100", "Drykoelastic Pro", "MC-Proof 900 EL"],
    baldrames: ["Sika® Baldrame", "SikaTop®-100", "SikaShield®"],
    lajes: ["SikaFill® Rápido Branco", "SikaShield®", "Drykocril D-9", "Drykoelastic Pro"],
    banheiros: ["SikaTop® Flex Fibras", "MC-Proof Multi", "Drykocril D-9"],
    aditivos: ["Sika®-1", "Hydro 1", "Vedacit Aditivo"]
  };
  const cardsByName = new Map(productCards.map((card) => [
    card.querySelector(".product-body h3")?.textContent.trim(), card
  ]));
  function loadPhoto(img, asset, originalURL) {
    if (!asset) return;
    img.addEventListener("error", () => {
      if (img.dataset.photoFallback !== "used") {
        img.dataset.photoFallback = "used";
        img.src = originalURL;
      } else {
        img.closest(".solution-product-item, .product-image")?.classList.add("is-fallback");
      }
    });
    img.src = asset;
  }
  for (const [name, card] of cardsByName) {
    const img = card.querySelector(".product-image img");
    if (img && productAssets[name]) {
      img.dataset.originalSrc = img.src;
      loadPhoto(img, productAssets[name], img.dataset.originalSrc);
    }
  }
  for (const panel of panels) {
    const names = productGroups[panel.dataset.panel] || [];
    const board = document.createElement("figure");
    board.className = "solution-product-board";
    const figcaption = document.createElement("figcaption");
    figcaption.textContent = "Produtos relacionados a esta aplicação";
    board.appendChild(figcaption);
    const stage = document.createElement("div");
    stage.className = "solution-product-stage";
    for (const name of names) {
      const card = cardsByName.get(name);
      const source = card?.querySelector(".product-image img");
      if (!source) continue;
      const item = document.createElement("div");
      item.className = "solution-product-item";
      const photo = document.createElement("img");
      photo.alt = "Embalagem de " + name;
      photo.loading = "lazy";
      photo.decoding = "async";
      loadPhoto(photo, productAssets[name], source.dataset.originalSrc || source.src);
      if (!productAssets[name]) photo.src = source.src;
      const title = document.createElement("span");
      title.textContent = name;
      item.append(photo, title);
      stage.appendChild(item);
    }
    // Em produção, uma montagem única utiliza as fotos originais fornecidas;
    // caso o arquivo não esteja disponível, o conjunto responsivo segue funcional.
    const montage = document.createElement("img");
    montage.className = "solution-montage";
    montage.alt = "Composição visual de embalagens relacionadas à solução " + (panel.querySelector("h3")?.textContent || panel.dataset.panel);
    montage.loading = "lazy";
    montage.decoding = "async";
    montage.addEventListener("load", () => board.classList.add("has-montage"), { once: true });
    montage.addEventListener("error", () => montage.remove(), { once: true });
    montage.src = "assets/montagens/" + panel.dataset.panel + ".webp";
    board.append(montage, stage);
    const foot = document.createElement("p");
    foot.className = "solution-board-note";
    foot.textContent = "Exemplos ilustrativos. Os itens não formam necessariamente um sistema único; a seleção exige análise e ficha técnica.";
    board.appendChild(foot);
    const content = panel.querySelector(".solution-content");
    const position = content?.querySelector(".technical-note, .text-link");
    if (position) content.insertBefore(board, position);
    else content?.appendChild(board);
  }

  // Sem fotos quebradas e sem prometer um produto visualmente diferente.
  document.querySelectorAll(".product-image img").forEach((img) => {
    const fallback = () => img.parentElement?.classList.add("is-fallback");
    img.addEventListener("error", fallback, { once: true });
    if (img.complete && img.naturalWidth === 0) fallback();
  });

  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
