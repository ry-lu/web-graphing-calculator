import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export const calculateMath = async (expression: string, assignments: string) => {
    const res = await axios.post(`${API_URL}/calculate`, { expression, assignments });
    return res.data;
};

export const calculateDerivative = async (expression: string, variable: string, assignments: string) => {
    const res = await axios.post(`${API_URL}/derivative`, { expression, variable, assignments });
    return res.data;
};

export const calculateIntegral = async (
    expression: string,
    variables: string[],
    lowers: number[],
    uppers: number[],
    assignments: string
) => {
    const res = await axios.post(`${API_URL}/integral`, { expression, variables, lowers, uppers, assignments });
    return res.data;
};

export const solveDifferentialEquation = async (params: {
    expression: string;
    xVar: string;
    yVar: string;
    x0: number;
    y0: number;
    xTarget: number;
    h: number;
    method: string;
    assignments: string;
}) => {
    const res = await axios.post(`${API_URL}/diffeq`, params);
    return res.data;
};

export const findIntersections = async (expr1: string, expr2: string, variable: string, assignments: string) => {
    const res = await axios.post(`${API_URL}/intersections`, { expr1, expr2, variable, assignments });
    return res.data.points;
};
