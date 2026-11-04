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

  // Tabs de soluções com navegação por teclado e sem perda de foco.
  const tabs = Array.from(document.querySelectorAll(".solution-tab"));
  const panels = Array.from(document.querySelectorAll(".solution-panel"));

  function activateSolution(key, focus = false) {
    const selected = tabs.find((tab) => tab.dataset.solution === key);
    if (!selected) return;
    tabs.forEach((tab) => {
      const isActive = tab === selected;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== key;
    });
    if (focus) selected.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateSolution(tab.dataset.solution));
    tab.addEventListener("keydown", (event) => {
      const last = tabs.length - 1;
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = index === last ? 0 : index + 1;
      else if (event.key === "ArrowLeft") nextIndex = index === 0 ? last : index - 1;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = last;
      else return;
      event.preventDefault();
      activateSolution(tabs[nextIndex].dataset.solution, true);
      tabs[nextIndex].scrollIntoView({ behavior: smooth, block: "nearest", inline: "nearest" });
    });
  });

  document.querySelectorAll("[data-go-solution]").forEach((link) => {
    link.addEventListener("click", () => {
      activateSolution(link.dataset.goSolution);
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

  // Mensagens do WhatsApp só são abertas quando um número verdadeiro
  // foi configurado pelo proprietário em config.js.
  const status = document.querySelector("#contact-status");
  const contactSection = document.querySelector("#contato");
  const cleanPhone = (value) => String(value || "").replace(/\D/g, "");
  const validPhone = (value) => /^55\d{10,11}$/.test(cleanPhone(value));
  const baseMessages = {
    sales: "Olá! Gostaria de informações sobre os produtos e soluções de impermeabilização.",
    technical: "Olá! Gostaria de orientação técnica para um sistema de impermeabilização."
  };
  const salesNumber = config.whatsappVendas;
  const techNumber = config.whatsappTecnico || salesNumber;

  function showContactFeedback(message) {
    if (status) status.textContent = message;
    if (contactSection) contactSection.scrollIntoView({ behavior: smooth, block: "start" });
  }

  document.querySelectorAll("[data-contact]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.contact === "technical" ? "technical" : "sales";
      const number = type === "technical" ? techNumber : salesNumber;
      if (!validPhone(number)) {
        showContactFeedback("WhatsApp ainda não cadastrado. Configure os canais oficiais em config.js.");
        return;
      }
      const url = "https://wa.me/" + cleanPhone(number) + "?text=" + encodeURIComponent(baseMessages[type]);
      window.open(url, "_blank", "noopener,noreferrer");
    });
  });

  // Informações publicadas somente se forem preenchidas pelo responsável.
  const footerContact = document.querySelector("#footer-contact");
  const contactLines = [];
  if (config.phoneDisplay) contactLines.push(config.phoneDisplay);
  if (config.endereco) contactLines.push(config.endereco);
  if (config.horario) contactLines.push(config.horario);
  if (footerContact && contactLines.length) footerContact.textContent = contactLines.join(" • ");
  if (status && (validPhone(salesNumber) || validPhone(techNumber))) {
    status.textContent = "Escolha um canal acima para abrir o WhatsApp.";
  }
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

  // Sem fotos quebradas e sem prometer um produto visualmente diferente.
  document.querySelectorAll(".product-image img").forEach((img) => {
    const fallback = () => img.parentElement?.classList.add("is-fallback");
    img.addEventListener("error", fallback, { once: true });
    if (img.complete && img.naturalWidth === 0) fallback();
  });

  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
