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

const ALL_OPS: Operation[] = ['+', '-', '*', '/'];

export function generateProblem(difficulty: Difficulty, allowedOps: Operation[] = ALL_OPS): MathProblem {
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

function randInt(min: number, max:number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOperation(preferred: Operation[], allowedOps: Operation[]): Operation {
  const filtered = preferred.filter((op) => allowedOps.includes(op));
  const pool = filtered.length > 0 ? filtered : preferred;
  return pool[randInt(0, pool.length - 1)];
}

function opSymbol(op: Operation): string {
  if (op === '*') return 'x';
  if (op === '/') return '÷';
  return op;
}

function apply(op: Operation, a: number, b: number): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return a / b;
  }
}

function generateLevel1(id: string, allowedOps: Operation[]): MathProblem {
  // Level 1: simple single-digit +, -, *, /
  const op = pickOperation(['+', '-', '*', '/'], allowedOps);

  if(op === '+'){
    const a = randInt(1, 9);
    const b = randInt(1, 9);
    return {
      id,
      expression: `${a} + ${b}`,
      operator: '+',
      operands: [a, b],
      expectedAnswer: a + b,
      difficulty: 1,
      type: 'single_digit_add',
    };
  }

  if(op === '-'){
    const a = randInt(1, 9);
    const b = randInt(1, a);
    return {
      id,
      expression: `${a} - ${b}`,
      operator: '-',
      operands: [a, b],
      expectedAnswer: a - b,
      difficulty: 1,
      type: 'single_digit_subtract',
      };
    }

  if(op === '*'){
    const a = randInt(1, 9);
    const b = randInt(1, 9);
    return {
      id,
      expression: `${a} ${opSymbol('*')} ${b}`,
      operator: '*',
      operands: [a, b],
      expectedAnswer: a * b,
      difficulty: 1,
      type: 'single_digit_multiply',
      };
    }

  if(op === '/'){
    const a = randInt(1, 9);
    const b = randInt(1, 9);
    return {
      id,
      expression: `${a} ${opSymbol('/')} ${b}`,
      operator: '*',
      operands: [a, b],
      expectedAnswer: a * b,
      difficulty: 1,
      type: 'single_digit_multiply',
      };
    }
  
  const dividend = randInt(1, 9);
  const divisors = Array.from({ length: 9 }, (_, i) => i + 1).filter((d) => dividend % d === 0);
  const divisor = divisors[randInt(0, divisors.length - 1)];
  return{
    id, 
    expression: `${dividend} ${opSymbol('/')} ${divisor}`,
    operator: '/',
    operands: [dividend, divisor],
    expectedAnswer: dividend / divisor,
    difficulty: 1,
    type: 'single_digit_divide',
  };
}

function generateLevel2(id: string, allowedOps: Operation[]): MathProblem {
  // Level 2: 2-digit + and - with and without carry/borrow
  const op = pickOperation(['+', '-'], allowedOps);
  const withCarryOrBorrow = Math.random() < 0.5;

  if(op === '+') {
    const onesA = withCarryOrBorrow ? randInt(1,9) : randInt(0, 9);
    const onesB = withCarryOrBorrow ? randInt(10 - onesA, 9): randInt(0, 9 - onesA);

    const tensA = randInt(1, 7);
    const maxTensB = 9 - tensA - (withCarryOrBorrow ? 1 : 0);
    const tensB = randInt(1, Math.max(1, maxTensB));

    const a = tensA * 10 + onesA;
    const b = tensB * 10 + onesB;

    return {
      id,
      expression: `${a} + ${b}`,
      operator: '+',
      operands: [a, b],
      expectedAnswer: a + b,
      difficulty: 2,
      type: withCarryOrBorrow ? 'two_digit_add_with_carry' : 'two_digit_add_no_carry',
    };
  }

  // subtraction
  if (!withCarryOrBorrow) {
    // no borrow: onesA >= onesB
    const onesB = randInt(0, 9);
    const onesA = randInt(onesB, 9);

    const tensB = randInt(1, 8);
    const tensA = randInt(tensB, 9);

    const a = tensA * 10 + onesA;
    const b = tensB * 10 + onesB;

    return {
      id,
      expression: `${a} - ${b}`,
      operator: '-',
      operands: [a, b],
      expectedAnswer: a - b,
      difficulty: 2,
      type: 'two_digit_sub_no_borrow',
    };
  }

  // with borrow: onesA < onesB and keep a > b

  const onesA = randInt(0, 8);
  const onesB = randInt(onesA + 1, 9);
  const tensB = randInt(1, 8);
  const tensA = randInt(tensB + 1, 9);

  const a = tensA * 10 + onesA;
  const b = tensB * 10 + onesB;

  return {
    id,
    expression: `${a} - ${b}`,
    operator: '-',
    operands: [a, b],
    expectedAnswer: a - b,
    difficulty: 2,
    type: 'two_digit_sub_with_borrow',
  };
  
}

function generateLevel3(id: string, allowedOps: Operation[]): MathProblem {
  // Level 3: multiplication/division with single-digit and two-digit by one-digit
  const op = pickOperation(['*', '/'], allowedOps);

  if (op === '*') {
    const useTwoDigit = Math.random() < 0.5;
    const a = useTwoDigit ? randInt(10, 99) : randInt(2, 9);
    const b = randInt(2, 9); // one digit

    return {
      id, 
      expression: `${a} ${opSymbol('*')} ${b}`,
      operator: '*',
      operands: [a, b],
      expectedAnswer: a * b,
      difficulty: 3,
      type: useTwoDigit ? 'two_digit_by_one_digit_multiply' : 'single_digit_multiply',
    };
  }

  const useTwoDigitDividend = Math.random() < 0.7;

  if (useTwoDigitDividend) {
    // two-digit dividend divide by one digit, exact division
    let dividend = 0;
    let divisor = 0;
    let quotient = 0;
    
    for (let i = 0; i < 100; i++) {
      divisor = randInt(2, 9);
      quotient = randInt(2, 12);
      dividend = divisor * quotient;
      if (dividend >= 10 && dividend <= 99) break;
    }

    return {
      id,
      expression: `${dividend} ${opSymbol('/')} ${divisor}`,
      operator: '/',
      operands: [dividend, divisor],
      expectedAnswer: quotient,
      difficulty: 3,
      type: 'two_digit_by_one_digit_divide',
    };
  }

  // single-digit dividend divided by one digit, exact division
  const divisor = randInt(2, 9);
  const maxQ = Math.max(1, Math.floor(9 / divisor));
  const quotient = randInt(1, maxQ);
  const dividend = divisor * quotient;

  return {
    id, 
    expression: `${dividend} ${opSymbol('/')} ${divisor}`,
    operator: '/',
    operands: [dividend, divisor],
    expectedAnswer: quotient,
    difficulty: 3,
    type: 'single_digit_divide',
  };
}

function generateLevel4(id: string, allowedOps: Operation[]): MathProblem {
  // Level 4: multi-step addition/subtraction
  for (let i = 0; i < 100; i++) {
    const op1 = pickOperation(['+', '-'], allowedOps);
    const op2 = pickOperation(['+', '-'], allowedOps);

    const a = randInt(20, 99);
    const b = randInt(10, 99);
    const c = randInt(10, 99);

    const step1 = apply(op1, a, b);
    const answer = apply(op2, step1, c);

    if (answer >= 0 && Number.isInteger(answer)) {
      return{
        id,
        expression: `${a} ${opSymbol(op1)} ${b} ${opSymbol(op2)} ${c}`,
        operator: op1,
        operands: [a, b, c],
        expectedAnswer: answer,
        difficulty: 4,
        type: 'multi_step_add_sub',
      };
    }
  }

  // fallback
  return {
    id,
    expression: '50 + 20 - 10',
    operator: '+',
    operands: [50, 20, 10],
    expectedAnswer: 60,
    difficulty: 4,
    type: 'multi_step_add_sub',
  };
}

function generateLevel5(id: string, allowedOps: Operation[]): MathProblem {
  // Level 5: multi-step multiplication/divison with integer result
  for (let i = 0; i< 100; i ++) {
    const op1 = pickOperation(['*', '/'], allowedOps);
    // const op2: Operation = op1 === '*' ? '/' : '*';

    const a = randInt(10, 99); // include two-digit numbers
    const b = randInt(2, 9);
    const c = randInt(2, 9);

    if (op1 === '*') {
      const answer = (a * b) / c;
      if (Number.isInteger(answer)) {
        return {
          id,
          expression: `${a} ${opSymbol('*')} ${b} ${opSymbol('/')} ${c}`,
          operator: '*',
          operands: [a, b, c],
          expectedAnswer: answer,
          difficulty: 5,
          type: 'multi_step_mul_div',
        };
      }
    } else {
      if (a % b !== 0) continue;
      const answer = (a / b) * c;
      if (Number.isInteger(answer)) {
        return{
          id,
          expression: `${a} ${opSymbol('/')} ${b} ${opSymbol('*')} ${c}`,
          operator: '/',
          operands: [a, b, c],
          expectedAnswer: answer,
          difficulty: 5,
          type: 'multi_step_mul_div'
        };
      }
    }
  }

  // fallback
  return {
    id, 
    expression: '36 ÷ 6 × 4',
    operator: '/',
    operands: [36, 6, 4],
    expectedAnswer: 24,
    difficulty: 5,
    type: 'multi_step_mul_div',
  };
}