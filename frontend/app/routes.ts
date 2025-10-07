// app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/test", "routes/test.tsx"),
  route("/inventory", "routes/inventory.tsx"),
  route("/inventory/locations", "routes/inventory.locations.tsx"), // NUEVA ruta agregada
  route("/products", "routes/products.tsx"),
  route("/products/categories", "routes/products.categories.tsx"),
  route("/products/catalog", "routes/products.catalog.tsx"),
  route("/proveedores", "routes/proveedores.tsx"),
] satisfies RouteConfig;
