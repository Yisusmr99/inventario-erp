const request = require('supertest');
const app = require('../app');

describe('GET /api/product-categories/:id', () => {
  it('debería devolver 200 con una categoría válida', async () => {
    const res = await request(app).get('/api/product-categories/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id_categoria');
    expect(res.body.data).toHaveProperty('nombre');
  });

  it('debería devolver 404 si no existe la categoría', async () => {
    const res = await request(app).get('/api/product-categories/999999');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no encontrada/i);
  });
});
