const express = require("express");
const router = express.Router();

const currentYear = new Date().getFullYear();
const MIN_YEAR = currentYear - 10;

let nextId = 1;
const cars = [];

function findCar(id) {
  return cars.find((car) => car.id === Number(id));
}

function isDuplicate(brand, model, year, exceptId) {
  return cars.some(
    (car) =>
      car.id !== exceptId &&
      car.brand.toLowerCase() === String(brand).trim().toLowerCase() &&
      car.model.toLowerCase() === String(model).trim().toLowerCase() &&
      Number(car.year) === Number(year)
  );
}

function parseItems(items) {
  if (!Array.isArray(items)) return [];
  return [...new Set(items.map((item) => String(item).trim()).filter(Boolean))];
}

router.post("/api/v1/cars", (req, res) => {
  const { brand, model, year, items } = req.body || {};
  const uniqueItems = parseItems(items);

  if (!brand) return res.status(400).json({ error: "brand is required" });
  if (!model) return res.status(400).json({ error: "model is required" });
  if (!year) return res.status(400).json({ error: "year is required" });
  if (!uniqueItems.length) {
    return res.status(400).json({ error: "items is required" });
  }

  const parsedYear = parseInt(year, 10);
  if (isNaN(parsedYear) || parsedYear < MIN_YEAR || parsedYear > currentYear) {
    return res.status(400).json({
      error: `year should be between ${MIN_YEAR} and ${currentYear}`,
    });
  }

  if (isDuplicate(brand, model, parsedYear)) {
    return res.status(409).json({ error: "there is already a car with this data" });
  }

  const car = {
    id: nextId++,
    brand: String(brand).trim(),
    model: String(model).trim(),
    year: parsedYear,
    items: uniqueItems,
  };
  cars.push(car);
  return res.status(201).json({ message: `id:${car.id}` });
});

router.get("/api/v1/cars", (req, res) => {
  let { page = 1, limit = 5, brand, model, year } = req.query;
  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 5;
  if (limit > 10) limit = 10;
  if (limit < 1) limit = 5;

  let filtered = cars.slice();
  if (brand) {
    const q = String(brand).toLowerCase();
    filtered = filtered.filter((car) => car.brand.toLowerCase().includes(q));
  }
  if (model) {
    const q = String(model).toLowerCase();
    filtered = filtered.filter((car) => car.model.toLowerCase().includes(q));
  }
  if (year) {
    const min = parseInt(year, 10);
    filtered = filtered.filter((car) => car.year >= min);
  }

  if (filtered.length === 0) {
    return res.status(204).send();
  }

  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit).map(({ items, ...car }) => car);

  return res.status(200).json({
    count: filtered.length,
    pages: Math.ceil(filtered.length / limit),
    data,
  });
});

router.get("/api/v1/cars/:id", (req, res) => {
  const car = findCar(req.params.id);
  if (!car) return res.status(404).json({ message: "car not found" });
  return res.status(200).json(car);
});

router.patch("/api/v1/cars/:id", (req, res) => {
  const car = findCar(req.params.id);
  if (!car) return res.status(404).json({ error: "car not found" });

  const { brand, model, year, items } = req.body || {};
  const nextBrand = brand !== undefined ? String(brand).trim() : car.brand;
  const nextModel = model !== undefined ? String(model).trim() : car.model;
  let nextYear = car.year;

  if (brand !== undefined && !nextBrand) {
    return res.status(400).json({ error: "Brand cannot be empty" });
  }
  if (model !== undefined && !nextModel) {
    return res.status(400).json({ error: "Model cannot be empty" });
  }
  if (year !== undefined) {
    const parsedYear = parseInt(year, 10);
    if (isNaN(parsedYear) || parsedYear < MIN_YEAR || parsedYear > currentYear) {
      return res.status(400).json({
        error: `year should be between ${MIN_YEAR} and ${currentYear}`,
      });
    }
    nextYear = parsedYear;
  }

  if (isDuplicate(nextBrand, nextModel, nextYear, car.id)) {
    return res.status(409).json({ message: "there is already a car with this data" });
  }

  car.brand = nextBrand;
  car.model = nextModel;
  car.year = nextYear;
  if (items && Array.isArray(items)) {
    car.items = parseItems(items);
  }

  return res.status(204).send();
});

router.delete("/api/v1/cars/:id", (req, res) => {
  const index = cars.findIndex((car) => car.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "car not found" });
  cars.splice(index, 1);
  return res.status(204).send();
});

module.exports = router;
