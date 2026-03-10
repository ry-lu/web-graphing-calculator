import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from './server.js';
import { parseScope, numericalIntegral } from './src/utils/mathUtils.js';

describe('Math Utilities', () => {
    it('Should correctly parse valid assignment string', () => {
        const scope = parseScope('x=10, y=5, A=[1,2;3,4]');
        expect(scope.x).toBe(10);
        expect(scope.y).toBe(5);
        expect(scope.A).toBeDefined();
    });

    it('Should return empty scope for blank assignments', () => {
        const scope = parseScope('');
        expect(Object.keys(scope).length).toBe(0);
    });

    it('Should correctly perform simple numerical integration', () => {
        const val = numericalIntegral('x^2', ['x'], [0], [10]);
        expect(val).toBeCloseTo(333.333, 1);
    });

    it('Should correctly perform multi-dimensional integration', () => {
        // Double integral of x * y over x from 0 to 2, y from 1 to 3
        const val = numericalIntegral('x * y', ['x', 'y'], [0, 1], [2, 3]);
        // \int_1^3 \int_0^2 x*y dx dy 
        // inner = y * [x^2/2]_0^2 = 2y
        // outer = \int_1^3 2y dy = [y^2]_1^3 = 9 - 1 = 8
        expect(val).toBeCloseTo(8, 2);
    });
});

describe('Backend API Routes', () => {
    it('Evaluate a basic arithmetic expression', async () => {
        const res = await request(app).post('/api/calculate').send({ expression: '2 + 3 * 4' });
        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe('14');
        expect(res.body.latex).toBeDefined();
    });

    it('Evaluate matrix algebra', async () => {
        const res = await request(app).post('/api/calculate').send({ expression: 'A * B', assignments: 'A=[1,2;3,4], B=[5,6;7,8]' });
        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe('[[19,22],[43,50]]');
    });

    it('Calculate a derivative', async () => {
        const res = await request(app).post('/api/derivative').send({ expression: 'x^2', variable: 'x' });
        expect(res.statusCode).toBe(200);
        expect(res.body.result).toContain('2 * x');
    });

    it('Evaluate derivative with assignment', async () => {
        const res = await request(app).post('/api/derivative').send({ expression: 'x^2', variable: 'x', assignments: 'x=5' });
        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe('10');
    });

    it('Calculate a numerical integral', async () => {
        const res = await request(app).post('/api/integral').send({ expression: 'x^2', variable: 'x', lower: 0, upper: 10 });
        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBeCloseTo(333.333, 1);
    });

    it('Solve differential equation using RK4', async () => {
        const res = await request(app).post('/api/diffeq').send({
            expression: 'x * y',
            xVar: 'x',
            yVar: 'y',
            x0: 0,
            y0: 1,
            xTarget: 5,
            h: 0.1,
            method: 'RK4'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBeGreaterThan(0);
        expect(Array.isArray(res.body.points)).toBe(true);
    });

    it('Find intersections', async () => {
        const res = await request(app).post('/api/intersections').send({
            expr1: 'x^2',
            expr2: 'x+2',
            variable: 'x'
        });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.points)).toBe(true);
        expect(res.body.points.some(p => Math.abs(p.x - 2) < 0.1)).toBe(true);
    });
});
