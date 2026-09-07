// CompassCar - frontend que consome a API de veículos
// Ajusta a URL base da API na própria página (salva em localStorage).

const STORAGE_KEY = "compasscar_api_url";
const LIMIT = 5;

let currentPage = 1;
let currentFilters = {};

// ---- Helpers de estado da API ----
function getApiUrl() {
  return (localStorage.getItem(STORAGE_KEY) || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
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

// ---- Cadastro ----
async function createCar(event) {
  event.preventDefault();

  const brand = document.getElementById("brand").value.trim();
  const model = document.getElementById("model").value.trim();
  const year = parseInt(document.getElementById("year").value, 10);
  const itemsRaw = document.getElementById("items").value.trim();
  const items = itemsRaw
    ? itemsRaw.split(",").map((i) => i.trim()).filter(Boolean)
    : [];

  const payload = { brand, model, year, items };

  try {
    const res = await fetch(`${getApiUrl()}/api/v1/cars`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));

    if (res.status === 201) {
      setStatus("Veículo cadastrado com sucesso!", "ok");
      document.getElementById("createForm").reset();
      loadCars(1);
    } else {
      setStatus(
        "Não foi possível cadastrar: " + (body.errors || body.message || `erro ${res.status}`),
        "error"
      );
    }
  } catch (err) {
    setStatus("Erro ao conectar à API para cadastrar.", "error");
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
    const val = document.getElementById("apiUrl").value.trim();
    localStorage.setItem(STORAGE_KEY, val);
    setStatus("URL da API salva.", "ok");
    loadCars(1);
  });

  document.getElementById("createForm").addEventListener("submit", createCar);
  document.getElementById("filterForm").addEventListener("submit", applyFilters);
  document.getElementById("clearFilter").addEventListener("click", clearFilters);
  document.getElementById("reload").addEventListener("click", () => loadCars(currentPage));

  loadCars(1);
});
