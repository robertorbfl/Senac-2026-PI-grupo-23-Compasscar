// CompassCar - frontend que consome a API de veículos
// Ajusta a URL base da API na própria página (salva em localStorage).

const STORAGE_KEY = "compasscar_api_url";
const LIMIT = 5;

let currentPage = 1;
let currentFilters = {};
let editingId = null;

// ---- Helpers de estado da API ----
function defaultApiUrl() {
  if (window.location.protocol.startsWith("http")) {
    const { hostname, port, origin } = window.location;
    if (
      (hostname === "localhost" || hostname === "127.0.0.1") &&
      (port === "3000" || port === "")
    ) {
      return origin;
    }
  }
  return "http://localhost:3000";
}

function normalizeApiUrl(raw) {
  let url = String(raw || "").trim();
  if (!url) return defaultApiUrl();
  if (/^\d+$/.test(url)) url = `http://localhost:${url}`;
  else if (!/^https?:\/\//i.test(url)) url = "http://" + url;
  return url.replace(/\/+$/, "").replace(/\/api\/v1$/i, "");
}

function getApiUrl() {
  return normalizeApiUrl(localStorage.getItem(STORAGE_KEY) || defaultApiUrl());
}

function setStatus(message, type = "") {
  const el = document.getElementById("status");
  el.textContent = message;
  el.className = "status" + (type ? " " + type : "");
}

// ---- Carregar lista de carros ----
async function loadCars(page = 1) {
  currentPage = page;
  setStatus("Carregando...");

  const params = new URLSearchParams({ page, limit: LIMIT });
  if (currentFilters.brand) params.append("brand", currentFilters.brand);
  if (currentFilters.model) params.append("model", currentFilters.model);
  if (currentFilters.year) params.append("year", currentFilters.year);

  const url = `${getApiUrl()}/api/v1/cars?${params.toString()}`;

  try {
    const res = await fetch(url);

    if (res.status === 204) {
      renderCars([]);
      renderPagination(0, 0);
      setStatus("Nenhum veículo encontrado.");
      return;
    }
    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

    const body = await res.json();
    renderCars(body.data || []);
    renderPagination(body.pages || 0, page);
    setStatus(`${body.count} veículo(s) cadastrado(s).`, "ok");
  } catch (err) {
    renderCars([]);
    renderPagination(0, 0);
    setStatus(
      "Não foi possível conectar à API. Verifique se o servidor está rodando e se a URL está correta.",
      "error"
    );
    console.error(err);
  }
}

// ---- Buscar detalhes (itens) de um carro por ID ----
async function fetchCarDetails(id) {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/cars/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ---- Renderização ----
function renderCars(cars) {
  const list = document.getElementById("carList");
  list.innerHTML = "";

  cars.forEach((car) => {
    const div = document.createElement("div");
    div.className = "car-item";
    div.innerHTML = `
      <h3>${escapeHtml(car.brand)} ${escapeHtml(car.model)}</h3>
      <div class="car-year">Ano: ${escapeHtml(String(car.year))}</div>
      <div class="car-items" id="items-${car.id}">Itens: —</div>
      <div class="car-actions">
        <button class="btn btn--small" data-details="${car.id}">Detalhes</button>
        <button class="btn btn--small" data-edit="${car.id}">Editar</button>
        <button class="btn btn--small btn--danger" data-delete="${car.id}">Excluir</button>
      </div>
    `;
    list.appendChild(div);
  });

  list.querySelectorAll("[data-details]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-details");
      const details = await fetchCarDetails(id);
      const target = document.getElementById(`items-${id}`);
      if (details && details.items && details.items.length) {
        target.textContent = "Itens: " + details.items.join(", ");
      } else {
        target.textContent = "Itens: nenhum item cadastrado.";
      }
    });
  });

  list.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => startEdit(btn.getAttribute("data-edit")));
  });

  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => deleteCar(btn.getAttribute("data-delete")));
  });
}

function renderPagination(pages, active) {
  const container = document.getElementById("pagination");
  container.innerHTML = "";
  if (pages <= 1) return;

  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === active) btn.classList.add("active");
    btn.addEventListener("click", () => loadCars(i));
    container.appendChild(btn);
  }
}

function setFormMode(isEditing) {
  document.getElementById("formTitle").textContent = isEditing
    ? "Editar veículo"
    : "Cadastrar veículo";
  document.getElementById("formSubmit").textContent = isEditing
    ? "Salvar alterações"
    : "Cadastrar";
  document.getElementById("cancelEdit").hidden = !isEditing;
}

function cancelEdit() {
  editingId = null;
  document.getElementById("createForm").reset();
  setFormMode(false);
}

async function startEdit(id) {
  const details = await fetchCarDetails(id);
  if (!details) {
    setStatus("Não foi possível carregar o veículo para edição.", "error");
    return;
  }

  editingId = details.id;
  document.getElementById("brand").value = details.brand || "";
  document.getElementById("model").value = details.model || "";
  document.getElementById("year").value = details.year || "";
  document.getElementById("items").value = (details.items || []).join(", ");
  setFormMode(true);
  document.getElementById("formPanel").scrollIntoView({ behavior: "smooth" });
}

function getFormPayload() {
  const brand = document.getElementById("brand").value.trim();
  const model = document.getElementById("model").value.trim();
  const year = parseInt(document.getElementById("year").value, 10);
  const itemsRaw = document.getElementById("items").value.trim();
  const items = itemsRaw
    ? itemsRaw.split(",").map((i) => i.trim()).filter(Boolean)
    : [];
  return { brand, model, year, items };
}

// ---- Cadastro e edição ----
async function saveCar(event) {
  event.preventDefault();

  const payload = getFormPayload();
  const isEditing = Boolean(editingId);
  const url = isEditing
    ? `${getApiUrl()}/api/v1/cars/${editingId}`
    : `${getApiUrl()}/api/v1/cars`;

  try {
    const res = await fetch(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));

    if (isEditing && (res.ok || res.status === 204)) {
      setStatus("Veículo atualizado com sucesso!", "ok");
      cancelEdit();
      loadCars(currentPage);
    } else if (!isEditing && res.status === 201) {
      setStatus("Veículo cadastrado com sucesso!", "ok");
      document.getElementById("createForm").reset();
      loadCars(1);
    } else {
      const action = isEditing ? "atualizar" : "cadastrar";
      setStatus(
        `Não foi possível ${action}: ` +
          (body.error || body.errors || body.message || `erro ${res.status}`),
        "error"
      );
    }
  } catch (err) {
    setStatus(
      "Não foi possível conectar à API. Abra o sistema em http://localhost:3000/app.html e use a URL http://localhost:3000.",
      "error"
    );
    console.error(err);
  }
}

// ---- Exclusão ----
async function deleteCar(id) {
  if (!confirm("Deseja realmente excluir este veículo?")) return;

  try {
    const res = await fetch(`${getApiUrl()}/api/v1/cars/${id}`, {
      method: "DELETE",
    });

    if (res.ok || res.status === 204) {
      setStatus("Veículo excluído.", "ok");
      loadCars(currentPage);
    } else {
      setStatus(`Não foi possível excluir (erro ${res.status}).`, "error");
    }
  } catch (err) {
    setStatus("Erro ao conectar à API para excluir.", "error");
    console.error(err);
  }
}

// ---- Filtros ----
function applyFilters(event) {
  event.preventDefault();
  currentFilters = {
    brand: document.getElementById("fBrand").value.trim(),
    model: document.getElementById("fModel").value.trim(),
    year: document.getElementById("fYear").value.trim(),
  };
  loadCars(1);
}

function clearFilters() {
  currentFilters = {};
  document.getElementById("filterForm").reset();
  loadCars(1);
}

// ---- Util ----
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---- Inicialização ----
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("apiUrl").value = getApiUrl();

  document.getElementById("saveApiUrl").addEventListener("click", () => {
    const val = normalizeApiUrl(document.getElementById("apiUrl").value);
    localStorage.setItem(STORAGE_KEY, val);
    document.getElementById("apiUrl").value = val;
    setStatus("URL da API salva: " + val, "ok");
    loadCars(1);
  });

  document.getElementById("createForm").addEventListener("submit", saveCar);
  document.getElementById("cancelEdit").addEventListener("click", cancelEdit);
  document.getElementById("filterForm").addEventListener("submit", applyFilters);
  document.getElementById("clearFilter").addEventListener("click", clearFilters);
  document.getElementById("reload").addEventListener("click", () => loadCars(currentPage));

  loadCars(1);
});
