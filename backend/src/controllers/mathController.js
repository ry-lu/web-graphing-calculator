const { math, parseScope, numericalIntegral } = require('../utils/mathUtils');

/**
 * Handles standard evaluation and computations via POST /api/calculate.
 * 
 * Expects an expression and an optional custom variable assignment string.
 * It will parse the string, evaluate the math string via mathjs, 
 * format it appropriately (especially if it's a Matrix), 
 * and return the result and the raw LaTeX string.
 *
 * @name calculate
 * @function
 * @param {Object} req - Express request object containing `expression` and `assignments`.
 * @param {Object} res - Express response object.
 */
const calculate = (req, res) => {
    try {
        const { expression, assignments = "" } = req.body;
        const scope = parseScope(assignments);
        let result = math.evaluate(expression, scope);


        if (result && result.isResultSet) {
            result = result.entries.map(e => e.toString());
        } else if (result && result.isMatrix) {
            result = result.toArray();
        } else if (typeof result !== 'string' && typeof result !== 'number') {
            result = result.toString();
        }

        res.json({ result: JSON.stringify(result), latex: math.parse(expression).toTex() });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Computes the symbolic derivative of a given expression with respect to a single variable.
 * 
 * Uses `mathjs.derivative` to calculate the formal derivative expression. Allows overriding calculations
 * with the scope object to attempt inline evaluation of the result.
 *
 * @name derivative
 * @function
 * @param {Object} req - Express request object with `expression`, `variable`, and `assignments`.
 * @param {Object} res - Express response object.
 */
const derivative = (req, res) => {
    try {
        const { expression, variable, assignments = "" } = req.body;
        const scope = parseScope(assignments);
        const deriv = math.derivative(expression, variable);
        let resultStr = deriv.toString();

        if (Object.keys(scope).length > 0) {
            try {
                resultStr = deriv.evaluate(scope).toString();
            } catch (e) { }
        }
        res.json({ result: resultStr, latex: deriv.toTex() });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Calculates single or multidimensional integrals sequentially over arbitrary bounds using Simpson's rule.
 * 
 * Supports dynamically parsed scope injection, arbitrary variables, and multiple limits seamlessly.
 * Return format generates a stacked `\int` latex element corresponding to the dimension level.
 *
 * @name integral
 * @function
 * @param {Object} req - Express request object with `expression`, `variables` array, `lowers` array, `uppers` array, and `assignments`.
 * @param {Object} res - Express response object.
 */
const integral = (req, res) => {
    try {
        const { expression, variable, lower, upper, variables, lowers, uppers, assignments = "" } = req.body;
        const scope = parseScope(assignments);

        let targetVariables = variables || [variable];
        let targetLowers = lowers !== undefined ? lowers : [parseFloat(lower)];
        let targetUppers = uppers !== undefined ? uppers : [parseFloat(upper)];

        targetLowers = targetLowers.map(l => parseFloat(l));
        targetUppers = targetUppers.map(u => parseFloat(u));

        if (targetLowers.some(isNaN) || targetUppers.some(isNaN)) {
            throw new Error("Lower and upper bounds must be valid numbers");
        }

        const result = numericalIntegral(expression, targetVariables, targetLowers, targetUppers, scope);


        let latex = math.parse(expression).toTex();
        for (let i = targetVariables.length - 1; i >= 0; i--) {
            latex = `\\int_{${targetLowers[i]}}^{${targetUppers[i]}} ${latex} \\, d${targetVariables[i]}`;
        }
        latex += ` \\approx ${math.round(result, 6)}`;

        res.json({ result, latex });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Deprecated route initially built for root-finding numeric approximations.
 * Removed per user request.
 *
 * @name solve
 * @function
 * @deprecated Use /api/intersections to find roots instead for cleaner behavior.
 */
const solve = (req, res) => {
    res.status(404).json({ error: "Solve endpoint removed per user request." });
};

/**
 * Finds numerical intersections of two separate multi-dimensional expressions.
 * 
 * Subtracts the two expressions and utilizes the Newton-Raphson approximation technique
 * to identify roots across a mapped axis domain simultaneously.
 *
 * @name intersections
 * @function
 * @param {Object} req - Express request object containing `expr1`, `expr2`, `variable`, and `assignments`.
 * @param {Object} res - Express response object.
 */
const intersections = (req, res) => {
    try {
        const { expr1, expr2, variable = 'x', assignments = "" } = req.body;
        const scopeEnv = parseScope(assignments);
        const intersectionExpr = `(${expr1}) - (${expr2})`;

        const compiled = math.compile(intersectionExpr);
        const f = (val) => {
            let scope = { ...scopeEnv }; scope[variable] = val;
            return compiled.evaluate(scope);
        };
        const fPrimeExpr = math.derivative(intersectionExpr, variable).toString();
        const compiledPrime = math.compile(fPrimeExpr);
        const fPrime = (val) => {
            let scope = { ...scopeEnv }; scope[variable] = val;
            return compiledPrime.evaluate(scope);
        };

        const roots = [];
        const numSamples = 200;
        const start = -10, end = 10;
        const step = (end - start) / numSamples;
        let prevSign = null;

        for (let i = 0; i <= numSamples; i++) {
            const x = start + i * step;
            const y = f(x);
            const sign = Math.sign(y);

            if (prevSign !== null && sign !== prevSign && sign !== 0) {
                let root = x - step / 2;
                let iter = 0;
                while (Math.abs(f(root)) > 1e-7 && iter < 100) {
                    let df = fPrime(root);
                    if (df === 0) break;
                    root = root - f(root) / df;
                    iter++;
                }
                if (Math.abs(f(root)) <= 1e-5) {
                    if (!roots.some(r => Math.abs(r - root) < 1e-4)) {
                        roots.push(root);
                    }
                }
            } else if (Math.abs(y) <= 1e-7) {
                if (!roots.some(r => Math.abs(r - x) < 1e-4)) {
                    roots.push(x);
                }
            }
            prevSign = sign !== 0 ? sign : prevSign;
        }

        const points = roots.map(root => {
            let scope = {}; scope[variable] = root;
            return { x: root, y: math.evaluate(expr1, scope) };
        });

        res.json({ points });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * SOTA Ordinary Differential Equation (ODE) numerical solver.
 * 
 * Implements standard Euler's Method alongside an advanced Runge-Kutta 4th Order (RK4) method algorithm.
 * Extrapolates points seamlessly across the trace to accurately approximate bounds up to `xTarget`.
 *
 * @name diffeq
 * @function
 * @param {Object} req - Express request containing `expression`, `xVar`, `yVar`, `x0`, `y0`, `xTarget`, `h` (step), `method`, and `assignments`.
 * @param {Object} res - Express response object containing final predicted `y` bound, `points` trace, and a LaTeX string.
 */
const diffeq = (req, res) => {
    try {
        let { expression, xVar = 'x', yVar = 'y', x0 = 0, y0 = 1, xTarget = 10, h = 0.1, method = 'RK4', assignments = "" } = req.body;
        x0 = parseFloat(x0);
        y0 = parseFloat(y0);
        xTarget = parseFloat(xTarget);
        h = parseFloat(h);

        const scopeEnv = parseScope(assignments);
        const compiled = math.compile(expression);
        const f = (xVal, yVal) => {
            let scope = { ...scopeEnv };
            scope[xVar] = xVal;
            scope[yVar] = yVal;
            return compiled.evaluate(scope);
        };

        let x = x0;
        let y = y0;
        const points = [{ x, y }];

        const numSteps = Math.ceil(Math.abs(xTarget - x) / Math.abs(h));
        if (numSteps > 100000) throw new Error("Too many steps. Increase step size h.");

        const sign = Math.sign(xTarget - x);
        const step = sign * Math.abs(h);

        for (let i = 0; i < numSteps; i++) {
            if (method === 'Euler') {
                y = y + step * f(x, y);
                x = x + step;
            } else {
                let k1 = step * f(x, y);
                let k2 = step * f(x + step / 2, y + k1 / 2);
                let k3 = step * f(x + step / 2, y + k2 / 2);
                let k4 = step * f(x + step, y + k3);

                y = y + (k1 + 2 * k2 + 2 * k3 + k4) / 6;
                x = x + step;
            }


            if ((sign > 0 && x > xTarget) || (sign < 0 && x < xTarget)) {
                x = xTarget;
            }
            points.push({ x, y });
        }

        res.json({ result: y, points, latex: `${yVar}(${xTarget}) \\approx ${math.round(y, 6)}` });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    calculate,
    derivative,
    integral,
    solve,
    intersections,
    diffeq
};
