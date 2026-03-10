import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BlockMath } from 'react-katex';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface ChartDisplayProps {
    tab: string;
    chartData: any;
    intersections: { x: number; y: number }[];
    variable: string;
    diffeqPoints: { x: number; y: number }[];
    result: string;
    latex: string;
}

export function ChartDisplay({ tab, chartData, intersections, variable, result, latex }: ChartDisplayProps) {
    if (tab !== 'graph' && tab !== 'diffeq') return null;

    if (!chartData) {
        return (
            <div className="text-slate-400 text-center"><p>Enter a valid function to graph</p></div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-1 min-h-[300px]">
                <Line data={chartData as any} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
            {intersections.length > 0 && tab === 'graph' && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl w-full">
                    <h3 className="text-sm font-semibold mb-2">Intersections:</h3>
                    <ul className="text-sm">
                        {intersections.map((pt, i) => (
                            <li key={i}>{variable} ≈ {pt.x.toFixed(4)}, y ≈ {pt.y.toFixed(4)}</li>
                        ))}
                    </ul>
                </div>
            )}
            {tab === 'diffeq' && result && (
                <div className="mt-4 text-center w-full">
                    <div className="text-lg font-mono text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 break-all">
                        {latex && <BlockMath math={latex} />}
                    </div>
                </div>
            )}
        </div>
    );
}
