import { ExpressionStatement, NumericLiteral } from 'babel-types';
import { parse } from 'babylon';

/**
 * Parses JavaScript source representing a number.
 */
export default function parseNumber(string: string): number {
  let expressionStatement = parse(`(${string})`).program.body[0] as ExpressionStatement;
  let literal = expressionStatement.expression as NumericLiteral;
  return literal.value;
}
