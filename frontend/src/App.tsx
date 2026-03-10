import { useState, useMemo, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { create, all } from 'mathjs';
import { calculateMath, calculateDerivative, calculateIntegral, solveDifferentialEquation, findIntersections as apiFindIntersections } from './services/api';
import { ExamplesSection } from './components/ExamplesSection';
import { Keypad } from './components/Keypad';
import { ChartDisplay } from './components/ChartDisplay';

const math = create(all);
function App() {
    const [tab, setTab] = useState('calc');
    const [expression, setExpression] = useState('');
    const [result, setResult] = useState('');
    const [latex, setLatex] = useState('');


    const [variable, setVariable] = useState('x');
    const [lowerBound, setLowerBound] = useState('0');
    const [upperBound, setUpperBound] = useState('10');


    const [variable2, setVariable2] = useState('');
    const [lowerBound2, setLowerBound2] = useState('0');
    const [upperBound2, setUpperBound2] = useState('10');


    const [yVar, setYVar] = useState('y');
    const [x0, setX0] = useState('0');
    const [y0, setY0] = useState('1');
    const [xTarget, setXTarget] = useState('10');
    const [h, setH] = useState('0.1');
    const [diffeqMethod, setDiffeqMethod] = useState('RK4');


    const [assignments, setAssignments] = useState('');


    const [intersections, setIntersections] = useState<{ x: number, y: number }[]>([]);
    const [diffeqPoints, setDiffeqPoints] = useState<{ x: number, y: number }[]>([]);

    useEffect(() => {
        setIntersections([]);
        setDiffeqPoints([]);
    }, [expression, variable, tab, x0, y0, xTarget, h, assignments, yVar, variable2]);

    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        const saved = localStorage.getItem('calc-state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.expression !== undefined) setExpression(parsed.expression);
                if (parsed.variable !== undefined) setVariable(parsed.variable);
                if (parsed.tab !== undefined) setTab(parsed.tab);
                if (parsed.assignments !== undefined) setAssignments(parsed.assignments);
                if (parsed.lowerBound !== undefined) setLowerBound(parsed.lowerBound);
                if (parsed.upperBound !== undefined) setUpperBound(parsed.upperBound);
                if (parsed.yVar !== undefined) setYVar(parsed.yVar);
                if (parsed.x0 !== undefined) setX0(parsed.x0);
                if (parsed.y0 !== undefined) setY0(parsed.y0);
                if (parsed.xTarget !== undefined) setXTarget(parsed.xTarget);
                if (parsed.h !== undefined) setH(parsed.h);
                if (parsed.diffeqMethod !== undefined) setDiffeqMethod(parsed.diffeqMethod);
                if (parsed.variable2 !== undefined) setVariable2(parsed.variable2);
                if (parsed.lowerBound2 !== undefined) setLowerBound2(parsed.lowerBound2);
                if (parsed.upperBound2 !== undefined) setUpperBound2(parsed.upperBound2);
            } catch (e) { }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem('calc-state', JSON.stringify({
            expression, variable, tab, assignments, lowerBound, upperBound, yVar, x0, y0, xTarget, h, diffeqMethod, variable2, lowerBound2, upperBound2
        }));
    }, [expression, variable, tab, assignments, lowerBound, upperBound, yVar, x0, y0, xTarget, h, diffeqMethod, variable2, lowerBound2, upperBound2, isLoaded]);

    const tabs = [
        { id: 'calc', label: 'Standard' },
        { id: 'matrix', label: 'Matrix' },
        { id: 'derivative', label: 'Derivatives' },
        { id: 'integral', label: 'Integrals' },
        { id: 'diffeq', label: 'Diff Eq' },
        { id: 'graph', label: 'Graphing' }
    ];

    /**
     * Handles the evaluation of logic and queries from the basic calculator tabs.
     * @returns Updates mathematical results and LaTeX visually on screen.
     */
    const handleCalculate = async () => {
        try {
            const resData = await calculateMath(expression, assignments);
            setResult(JSON.stringify(JSON.parse(resData.result)));
            setLatex(resData.latex);
        } catch (err: any) {
            setResult('Error: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDerivative = async () => {
        try {
            const resData = await calculateDerivative(expression, variable, assignments);
            setResult(resData.result);
            setLatex(resData.latex);
        } catch (err: any) {
            setResult('Error: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleIntegral = async () => {
        try {
            const variables = variable2 ? [variable, variable2] : [variable];
            const lowers = variable2 ? [parseFloat(lowerBound), parseFloat(lowerBound2)] : [parseFloat(lowerBound)];
            const uppers = variable2 ? [parseFloat(upperBound), parseFloat(upperBound2)] : [parseFloat(upperBound)];

            const resData = await calculateIntegral(expression, variables, lowers, uppers, assignments);
            setResult(resData.result);
            setLatex(resData.latex);
        } catch (err: any) {
            setResult('Error: ' + (err.response?.data?.error || err.message));
        }
    };

    /**
     * Implements RK4 or Eulers differential equation methods mapping through standard params layout.
     * Generates a dynamic tracing object stored internally to reflect trace on graphs.
     * @returns Traces step by step mapping of a multi dimensional curve to UI.
     */
    const handleDiffeq = async () => {
        try {
            const resData = await solveDifferentialEquation({
                expression,
                xVar: variable,
                yVar,
                x0: parseFloat(x0),
                y0: parseFloat(y0),
                xTarget: parseFloat(xTarget),
                h: parseFloat(h),
                method: diffeqMethod,
                assignments
            });
            setResult(resData.result);
            setLatex(resData.latex);
            setDiffeqPoints(resData.points);
        } catch (err: any) {
            setResult('Error: ' + (err.response?.data?.error || err.message));
        }
    }

    /**
     * Automatically Newton-Raphson approximation intersection function root bindings.
     * @returns Scatter plot intersection arrays populated successfully.
     */
    const handleFindIntersections = async () => {
        const exprs = expression.split(',').map(e => e.trim()).filter(e => e);
        if (exprs.length < 2) {
            setResult('Error: Please enter at least two expressions separated by a comma to find their intersection.');
            return;
        }
        try {
            const points = await apiFindIntersections(exprs, variable, assignments);
            setIntersections(points);
        } catch (err: any) {
            setResult('Error: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleAction = () => {
        if (tab === 'calc' || tab === 'matrix') handleCalculate();
        else if (tab === 'derivative') handleDerivative();
        else if (tab === 'integral') handleIntegral();
        else if (tab === 'diffeq') handleDiffeq();
    };

    const addToExpression = (val: string) => {
        setExpression((prev) => prev + val);
    };

    const chartData = useMemo(() => {
        if (tab === 'diffeq') {
            if (diffeqPoints.length === 0) return null;
            return {
                labels: diffeqPoints.map(p => math.round(p.x, 3)),
                datasets: [
                    {
                        label: `ODE Trace (RK4)`,
                        data: diffeqPoints.map(p => p.y),
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.5)',
                        tension: 0.1,
                        pointRadius: 2
                    }
                ]
            };
        }

        if (tab !== 'graph' || !expression) return null;
        try {
            const exprs = expression.split(',').map((e: string) => e.trim()).filter((e: string) => e);
            if (exprs.length === 0) return null;

            const labels = [];
            for (let x = -10; x <= 10; x += 0.5) labels.push(x);

            const colors = ['rgb(37, 99, 235)', 'rgb(220, 38, 38)', 'rgb(22, 163, 74)', 'rgb(217, 119, 6)'];


            const scopeEnv: any = {};
            if (assignments) {
                const parts = assignments.split(/[,;]\s*(?=[a-zA-Z_]\w*\s*=)/);
                for (let part of parts) {
                    try { math.evaluate(part.trim(), scopeEnv); } catch (e) { }
                }
            }

            const datasets = exprs.map((expr: string, i: number) => {
                const data = [];
                let compiled;
                try {
                    compiled = math.compile(expr);
                } catch (e) { }
                for (let x = -10; x <= 10; x += 0.5) {
                    try {
                        let localScope = { ...scopeEnv, [variable]: x };
                        data.push(compiled ? compiled.evaluate(localScope) : null);
                    } catch (e) {
                        data.push(null);
                    }
                }
                return {
                    label: `f(${variable}) = ${expr}`,
                    data,
                    borderColor: colors[i % colors.length],
                    backgroundColor: colors[i % colors.length].replace(')', ', 0.5)').replace('rgb', 'rgba'),
                    tension: 0.1
                };
            });


            if (intersections.length > 0) {
                datasets.push({
                    label: 'Intersections',
                    data: labels.map(l => {
                        const point = intersections.find(p => Math.abs(p.x - l) < 0.25);
                        return point ? point.y : null;
                    }),
                    borderColor: 'rgb(0, 0, 0)',
                    backgroundColor: 'rgba(0, 0, 0, 1)',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false
                } as any);
            }

            return { labels, datasets };
        } catch (e) {
            return null;
        }
    }, [expression, tab, variable, intersections, diffeqPoints]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-8 font-sans transition-colors duration-200">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Advanced Calculator</h1>
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-lg flex-wrap">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { setTab(t.id); setResult(''); setLatex(''); }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${tab === t.id
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <h2 className="text-lg font-medium text-slate-800 mb-4 capitalize">{tabs.find(t => t.id === tab)?.label} Input</h2>
                        <div className="mb-6 space-y-4">

                            {(tab === 'calc' || tab === 'matrix') && (
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Variable Assignments:</label>
                                    <input
                                        type="text"
                                        value={assignments}
                                        onChange={(e) => setAssignments(e.target.value)}
                                        placeholder="e.g. x=2, y=3, m=[1, 2; 3, 4]"
                                        className="w-full text-md p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            {(tab === 'derivative' || tab === 'integral' || tab === 'solve' || tab === 'graph' || tab === 'diffeq') && (
                                <div className="flex items-center gap-4 flex-wrap">
                                    <label className="text-sm font-medium text-slate-600">Var (x):</label>
                                    <input
                                        type="text"
                                        value={variable}
                                        onChange={(e) => setVariable(e.target.value)}
                                        className="w-12 text-center text-md p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                    {tab === 'diffeq' && (
                                        <>
                                            <label className="text-sm font-medium text-slate-600">Var (y):</label>
                                            <input
                                                type="text"
                                                value={yVar}
                                                onChange={(e) => setYVar(e.target.value)}
                                                className="w-12 text-center text-md p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <label className="text-sm font-medium text-slate-600">x0:</label>
                                            <input type="text" value={x0} onChange={(e) => setX0(e.target.value)} className="w-12 text-center text-md p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            <label className="text-sm font-medium text-slate-600">y0:</label>
                                            <input type="text" value={y0} onChange={(e) => setY0(e.target.value)} className="w-12 text-center text-md p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />

                                            <div className="w-full flex items-center gap-4 mt-2">
                                                <label className="text-sm font-medium text-slate-600">Goal X:</label>
                                                <input type="text" value={xTarget} onChange={(e) => setXTarget(e.target.value)} className="w-16 text-center text-md p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                <label className="text-sm font-medium text-slate-600">Step (h):</label>
                                                <input type="text" value={h} onChange={(e) => setH(e.target.value)} className="w-16 text-center text-md p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                <label className="text-sm font-medium text-slate-600">Method:</label>
                                                <select value={diffeqMethod} onChange={(e) => setDiffeqMethod(e.target.value)} className="p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="RK4">RK4</option>
                                                    <option value="Euler">Euler</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {tab === 'integral' && (
                                        <>
                                            <label className="text-sm font-medium text-slate-600 ml-2">Bounds:</label>
                                            <input
                                                type="text"
                                                value={lowerBound}
                                                onChange={(e) => setLowerBound(e.target.value)}
                                                className="w-16 text-center text-lg p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                title="Lower Bound"
                                            />
                                            <span>to</span>
                                            <input
                                                type="text"
                                                value={upperBound}
                                                onChange={(e) => setUpperBound(e.target.value)}
                                                className="w-16 text-center text-lg p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                title="Upper Bound"
                                            />

                                            <label className="text-sm font-medium text-slate-600 ml-4">Var 2:</label>
                                            <input
                                                type="text"
                                                value={variable2}
                                                onChange={(e) => setVariable2(e.target.value)}
                                                className="w-12 text-center text-md p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="(Opt)"
                                            />
                                            {variable2 && (
                                                <>
                                                    <label className="text-sm font-medium text-slate-600 ml-2">Bounds 2:</label>
                                                    <input
                                                        type="text"
                                                        value={lowerBound2}
                                                        onChange={(e) => setLowerBound2(e.target.value)}
                                                        className="w-16 text-center text-lg p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <span>to</span>
                                                    <input
                                                        type="text"
                                                        value={upperBound2}
                                                        onChange={(e) => setUpperBound2(e.target.value)}
                                                        className="w-16 text-center text-lg p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            <ExamplesSection
                                tab={tab}
                                setExpression={setExpression}
                                setAssignments={setAssignments}
                                setVariable={setVariable}
                                setVariable2={setVariable2}
                                setLowerBound={setLowerBound}
                                setUpperBound={setUpperBound}
                                setLowerBound2={setLowerBound2}
                                setUpperBound2={setUpperBound2}
                                setYVar={setYVar}
                                setX0={setX0}
                                setY0={setY0}
                                setXTarget={setXTarget}
                                setH={setH}
                            />

                            <input
                                type="text"
                                value={expression}
                                onChange={(e) => setExpression(e.target.value)}
                                placeholder={tab === 'graph' ? `Enter functions of ${variable} (comma separated)` : (tab === 'diffeq' ? `Enter f(${variable}, ${yVar}) for ${yVar}' = f` : `Enter expression in terms of ${variable || 'x'}`)}
                                className="w-full text-lg p-4 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                            />
                        </div>

                        <Keypad tab={tab} addToExpression={addToExpression} />

                        <div className="flex-1"></div>

                        {tab !== 'graph' && (
                            <button
                                onClick={handleAction}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98] mt-4"
                            >
                                Compute Result
                            </button>
                        )}
                        {tab === 'graph' && (
                            <button
                                onClick={handleFindIntersections}
                                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-4 px-6 rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98] mt-4"
                            >
                                Find Intersections
                            </button>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
                        {(tab === 'graph' || tab === 'diffeq') ? (
                            <ChartDisplay
                                tab={tab}
                                chartData={chartData}
                                intersections={intersections}
                                variable={variable}
                                diffeqPoints={diffeqPoints}
                                result={result}
                                latex={latex}
                            />
                        ) : latex || result ? (
                            <div className="text-center w-full">
                                <div className="text-sm font-medium text-slate-500 mb-4 tracking-wider uppercase">Result</div>
                                <div className="text-2xl mb-8 overflow-x-auto p-4 bg-slate-50 rounded-xl max-h-[400px]">
                                    {latex && <BlockMath math={latex} />}
                                </div>
                                <div className="text-lg font-mono text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 break-all max-h-[200px] overflow-y-auto">
                                    {result}
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-400 text-center">
                                <div className="text-4xl mb-4 opacity-50">∑</div>
                                <p>Results will appear here</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
