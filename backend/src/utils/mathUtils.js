const { create, all } = require('mathjs');

const math = create(all);

// Save references to programmatic functions before overriding them
const _evaluate = math.evaluate;
const _parse = math.parse;
const _simplify = math.simplify;
const _derivative = math.derivative;

// Prevent arbitrary execution vulnerabilities inside user mathematical expressions
math.import({
    'import': function () { throw new Error('Function import is disabled for security reasons.') },
    'createUnit': function () { throw new Error('Function createUnit is disabled for security reasons.') },
    'evaluate': function () { throw new Error('Function evaluate is disabled for security reasons.') },
    'parse': function () { throw new Error('Function parse is disabled for security reasons.') },
    'simplify': function () { throw new Error('Function simplify is disabled for security reasons.') },
    'derivative': function () { throw new Error('Function derivative is disabled for security reasons.') }
}, { override: true });

// Restore programmatic references to allow backend computations to use them without exposing them to the user's expression input mapping
math.evaluate = _evaluate;
math.parse = _parse;
math.simplify = _simplify;
math.derivative = _derivative;

/**
 * Parses user-provided assignment strings to populate a math.js evaluation scope.
 * 
 * It splits assignments like `x=5, A=[1,2;3,4]` and evaluates them directly into 
 * the provided or newly generated scope object.
 * 
 * @param {string} assignments - A comma or semicolon-separated list of variable assignments.
 * @returns {Object} A populated math.js scope object.
 */
function parseScope(assignments) {
    let scope = {};
    if (!assignments) return scope;
    const parts = assignments.split(/[,;]\s*(?=[a-zA-Z_]\w*\s*=)/);
    for (let part of parts) {
        try {
            math.evaluate(part.trim(), scope);
        } catch (e) { }
    }
    return scope;
}

/**
 * Numerically integrates an expression over one or more variables using an iterative Simpson's 1/3 rule.
 * 
 * Recursively iterates through the given variables to evaluate multi-dimensional integrals cleanly.
 * 
 * @param {string} expr - The mathematical expression to integrate.
 * @param {string[]} variables - An array of variables to integrate over for each dimension.
 * @param {number[]} lowers - The corresponding lower bounds for integration.
 * @param {number[]} uppers - The corresponding upper bounds for integration.
 * @param {Object} [scope={}] - The mathematical scope/context containing constants or user assignments.
 * @param {number} [n=100] - The number of integration steps per dimension (must be even).
 * @returns {number} The evaluated numerical integral result.
 */
function numericalIntegral(expr, variables, lowers, uppers, scope = {}, n = 100) {
    const compiled = math.compile(expr);

    function integrate(varIndex, currentScope) {
        if (varIndex >= variables.length) {
            return compiled.evaluate(currentScope);
        }

        const variable = variables[varIndex];
        const lower = lowers[varIndex];
        const upper = uppers[varIndex];

        let local_n = n;
        if (local_n % 2 !== 0) local_n++;
        const h = (upper - lower) / local_n;

        const f = (x) => {
            let nextScope = { ...currentScope };
            nextScope[variable] = x;
            return integrate(varIndex + 1, nextScope);
        };

        let sum = f(lower) + f(upper);

        for (let i = 1; i < local_n; i++) {
            const x = lower + i * h;
            sum += i % 2 === 0 ? 2 * f(x) : 4 * f(x);
        }

        return (h / 3) * sum;
    }

    return integrate(0, scope);
}

module.exports = {
    math,
    parseScope,
    numericalIntegral
};
