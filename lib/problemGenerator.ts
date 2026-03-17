// lib/problemGenerator.ts
export type Operation = '+' | '-' | '*' | '/';
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface MathProblem {
  id: string;
  expression: string;
  operator: Operation;
  operands: number[];
  expectedAnswer: number;
  difficulty: Difficulty;
  type: string;
}

export function generateProblem(difficulty: Difficulty, allowedOps: Operation[] = ['+']): MathProblem {
  const id = crypto.randomUUID();
  
  switch (difficulty) {
    case 1:
      return generateLevel1(id, allowedOps);
    case 2:
      return generateLevel2(id, allowedOps);
    case 3:
      return generateLevel3(id, allowedOps);
    case 4:
      return generateLevel4(id, allowedOps);
    case 5:
      return generateLevel5(id, allowedOps);
    default:
      return generateLevel1(id, allowedOps);
  }
}

function generateLevel1(id: string, ops: Operation[]): MathProblem {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * (9 - a)) + 1;
  
  return {
    id,
    expression: `${a} + ${b}`,
    operator: '+',
    operands: [a, b],
    expectedAnswer: a + b,
    difficulty: 1,
    type: 'addition_no_carry',
  };
}

function generateLevel2(id: string, ops: Operation[]): MathProblem {
  const a = (Math.floor(Math.random() * 4) + 1) * 10 + Math.floor(Math.random() * 5);
  const b = (Math.floor(Math.random() * 4) + 1) * 10 + Math.floor(Math.random() * (5 - (a % 10)));
  
  return {
    id,
    expression: `${a} + ${b}`,
    operator: '+',
    operands: [a, b],
    expectedAnswer: a + b,
    difficulty: 2,
    type: 'addition_double_no_carry',
  };
}

function generateLevel3(id: string, ops: Operation[]): MathProblem {
  const a = Math.floor(Math.random() * 50) + 10;
  const b = Math.floor(Math.random() * (99 - a)) + 1;
  
  return {
    id,
    expression: `${a} + ${b}`,
    operator: '+',
    operands: [a, b],
    expectedAnswer: a + b,
    difficulty: 3,
    type: 'addition_with_carry',
  };
}

function generateLevel4(id: string, ops: Operation[]): MathProblem {
  const a = Math.floor(Math.random() * 9) + 2;
  const b = Math.floor(Math.random() * 9) + 1;
  
  return {
    id,
    expression: `${a} × ${b}`,
    operator: '*',
    operands: [a, b],
    expectedAnswer: a * b,
    difficulty: 4,
    type: 'multiplication_simple',
  };
}

function generateLevel5(id: string, ops: Operation[]): MathProblem {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const c = Math.floor(Math.random() * 20) + 1;
  
  return {
    id,
    expression: `${a} + ${b} + ${c}`,
    operator: '+',
    operands: [a, b, c],
    expectedAnswer: a + b + c,
    difficulty: 5,
    type: 'addition_three_numbers',
  };
}