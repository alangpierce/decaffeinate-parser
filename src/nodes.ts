import SourceToken from 'coffee-lex/dist/SourceToken';
import ParseContext from './util/ParseContext';

export type ChildField = Node | Array<Node | null> | null;

export abstract class Node {
  parentNode: Node | null = null;

  constructor(
    readonly type: string,
    readonly line: number,
    readonly column: number,
    readonly start: number,
    readonly end: number,
    readonly raw: string,
  ) {
  }

  getChildren(): Array<Node> {
    let children: Array<Node> = [];
    for (let childField of this.getChildFields()) {
      if (Array.isArray(childField)) {
        children.push(...childField.filter<Node>((node): node is Node => node !== null));
      } else if (childField) {
        children.push(childField);
      }
    }
    return children;
  }

  abstract getChildFields(): Array<ChildField>;
}

export class Identifier extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly data: string,
  ) {
    super('Identifier', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class Bool extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly data: boolean,
  ) {
    super('Bool', line, column, start, end, raw);
  }

  static true(): Bool {
    return new Bool(0, 0, 0, 0, '', true);
  }

  static false(): Bool {
    return new Bool(0, 0, 0, 0, '', false);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class JavaScript extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly data: string,
  ) {
    super('JavaScript', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class Number extends Node {
  constructor(
    type: string,
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly data: number,
  ) {
    super(type, line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class Float extends Number {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    data: number
  ) {
    super('Float', line, column, start, end, raw, data);
  }
}

export class Int extends Number {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    data: number
  ) {
    super('Int', line, column, start, end, raw, data);
  }
}

export abstract class AccessOp extends Node {
  constructor(
    type: string,
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly expression: Node,
  ) {
    super(type, line, column, start, end, raw);
  }
}

export class MemberAccessOp extends AccessOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
    readonly member: Identifier,
  ) {
    super('MemberAccessOp', line, column, start, end, raw, expression);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression, this.member];
  }
}

export class ProtoMemberAccessOp extends AccessOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node
  ) {
    super('ProtoMemberAccessOp', line, column, start, end, raw, expression);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression];
  }
}

export class SoakedMemberAccessOp extends AccessOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
    readonly member: Identifier,
  ) {
    super('SoakedMemberAccessOp', line, column, start, end, raw, expression);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression, this.member];
  }
}

export class SoakedProtoMemberAccessOp extends AccessOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node
  ) {
    super('SoakedProtoMemberAccessOp', line, column, start, end, raw, expression);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression];
  }
}

export class DynamicMemberAccessOp extends AccessOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
    readonly indexingExpr: Node
  ) {
    super('DynamicMemberAccessOp', line, column, start, end, raw, expression);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression, this.indexingExpr];
  }
}

export class SoakedDynamicMemberAccessOp extends AccessOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
    readonly indexingExpr: Node
  ) {
    super('SoakedDynamicMemberAccessOp', line, column, start, end, raw, expression);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression, this.indexingExpr];
  }
}

export class Quasi extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly data: string,
  ) {
    super('Quasi', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class String extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly quasis: Array<Quasi>,
    readonly expressions: Array<Node | null>,
  ) {
    super('String', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.quasis, this.expressions];
  }
}

export class ObjectInitialiser extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly members: Array<ObjectInitialiserMember | AssignOp>,
  ) {
    super('ObjectInitialiser', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.members];
  }
}

export class ObjectInitialiserMember extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly key: Node,
    // If null, this is a shorthand initializer and the key and value are the same.
    readonly expression: Node | null,
  ) {
    super('ObjectInitialiserMember', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.key, this.expression];
  }
}

export class Conditional extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly condition: Node,
    readonly consequent: Block | null,
    readonly alternate: Block | null,
    readonly isUnless: boolean,
  ) {
    super('Conditional', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.condition, this.consequent, this.alternate];
  }
}

export class Program extends Node {
  context: ParseContext;

  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly body: Block | null,
    context: ParseContext
  ) {
    super('Program', line, column, start, end, raw);
    this.context = context;
  }

  getChildFields(): Array<ChildField> {
    return [this.body];
  }
}

export class Block extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly statements: Array<Node>,
    readonly inline: boolean,
  ) {
    super('Block', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.statements];
  }

  withInline(inline: boolean): Block {
    return new Block(
      this.line, this.column, this.start, this.end, this.raw, this.statements, inline
    );
  }
}

export class Loop extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly body: Node | null,
  ) {
    super('Loop', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.body];
  }
}

export class While extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly condition: Node,
    readonly guard: Node | null,
    readonly body: Node | null,
    readonly isUntil: boolean,
  ) {
    super('While', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.condition, this.guard, this.body];
  }
}

export abstract class For extends Node {
  constructor(
    type: string,
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly keyAssignee: Node | null,
    readonly valAssignee: Node | null,
    readonly target: Node,
    readonly filter: Node | null,
    readonly body: Block | null,
  ) {
    super(type, line, column, start, end, raw);
  }
}

export class ForOf extends For {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    keyAssignee: Node | null,
    valAssignee: Node | null,
    target: Node,
    filter: Node | null,
    body: Block | null,
    readonly isOwn: boolean,
  ) {
    super('ForOf', line, column, start, end, raw, keyAssignee, valAssignee, target, filter, body);
  }

  getChildFields(): Array<ChildField> {
    return [this.keyAssignee, this.valAssignee, this.target, this.filter, this.body];
  }
}

export class ForIn extends For {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    keyAssignee: Node | null,
    valAssignee: Node | null,
    target: Node,
    filter: Node | null,
    body: Block | null,
    readonly step: Node | null,
  ) {
    super('ForIn', line, column, start, end, raw, keyAssignee, valAssignee, target, filter, body);
  }

  getChildFields(): Array<ChildField> {
    return [this.keyAssignee, this.valAssignee, this.target, this.step, this.filter, this.body];
  }
}

export class Switch extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly expression: Node | null,
    readonly cases: Array<SwitchCase>,
    readonly alternate: Block | null,
  ) {
    super('Switch', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression, this.cases, this.alternate];
  }
}

export class SwitchCase extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly conditions: Array<Node>,
    readonly consequent: Block | null,
  ) {
    super('SwitchCase', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.conditions, this.consequent];
  }
}

export class RegexFlags {
  readonly g: boolean;
  readonly i: boolean;
  readonly m: boolean;
  readonly y: boolean;

  constructor(
    readonly global: boolean,
    readonly ignoreCase: boolean,
    readonly multiline: boolean,
    readonly sticky: boolean,
  ) {
    this.g = global;
    this.i = ignoreCase;
    this.m = multiline;
    this.y = sticky;
  }

  static parse(flags: string): RegexFlags {
    let global = false;
    let ignoreCase = false;
    let multiline = false;
    let sticky = false;

    for (let i = 0; i < flags.length; i++) {
      switch (flags.charCodeAt(i)) {
        case 103:
          global = true;
          break;

        case 105:
          ignoreCase = true;
          break;

        case 109:
          multiline = true;
          break;

        case 121:
          sticky = true;
          break;

        default:
          throw new Error(`invalid regular expression flags: ${flags}`);
      }
    }

    return new RegexFlags(global, ignoreCase, multiline, sticky);
  }
}

export class Heregex extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly quasis: Array<Quasi>,
    readonly expressions: Array<Node | null>,
    readonly flags: RegexFlags,
  ) {
    super('Heregex', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.quasis, this.expressions];
  }
}

export class Null extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
  ) {
    super('Null', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class Undefined extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
  ) {
    super('Undefined', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class Regex extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly pattern: string,
    readonly flags: RegexFlags,
  ) {
    super('Regex', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class Return extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly expression: Node | null,
  ) {
    super('Return', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression];
  }
}

export class YieldReturn extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly expression: Node | null,
  ) {
    super('YieldReturn', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression];
  }
}

export class This extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
  ) {
    super('This', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class Throw extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly expression: Node | null,
  ) {
    super('Throw', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression];
  }
}

export class ArrayInitialiser extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly members: Array<Node>,
  ) {
    super('ArrayInitialiser', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.members];
  }
}

export class DefaultParam extends Node {
  readonly param: Node;
  readonly default: Node;

  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    param: Node,
    defaultValue: Node
  ) {
    super('DefaultParam', line, column, start, end, raw);
    this.param = param;
    this.default = defaultValue;
  }

  getChildFields(): Array<ChildField> {
    return [this.param, this.default];
  }
}

export class Rest extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly expression: Node,
  ) {
    super('Rest', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression];
  }
}

export class Expansion extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
  ) {
    super('Expansion', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class Break extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
  ) {
    super('Break', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class Continue extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
  ) {
    super('Continue', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class Spread extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly expression: Node,
  ) {
    super('Spread', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression];
  }
}

export class Range extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly left: Node,
    readonly right: Node,
    readonly isInclusive: boolean,
  ) {
    super('Range', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.left, this.right];
  }
}

export abstract class BinaryOp extends Node {
  constructor(
    type: string,
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly left: Node,
    readonly right: Node,
  ) {
    super(type, line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.left, this.right];
  }
}

export abstract class UnaryOp extends Node {
  constructor(
    type: string,
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly expression: Node,
  ) {
    super(type, line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression];
  }
}

export class ChainedComparisonOp extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly operands: Array<Node>,
    readonly operators: Array<OperatorInfo>,
  ) {
    super('ChainedComparisonOp', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.operands];
  }
}

export class OperatorInfo {
  constructor(
    readonly operator: string,
    readonly token: SourceToken,
  ) {
  }
}

export type Op = UnaryOp | BinaryOp | ChainedComparisonOp;

export class EQOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('EQOp', line, column, start, end, raw, left, right);
  }
}

export class NEQOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('NEQOp', line, column, start, end, raw, left, right);
  }
}

export class LTOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('LTOp', line, column, start, end, raw, left, right);
  }
}

export class LTEOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('LTEOp', line, column, start, end, raw, left, right);
  }
}

export class GTOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('GTOp', line, column, start, end, raw, left, right);
  }
}

export class GTEOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('GTEOp', line, column, start, end, raw, left, right);
  }
}

export class LogicalNotOp extends UnaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
  ) {
    super('LogicalNotOp', line, column, start, end, raw, expression);
  }
}

export class LogicalAndOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
  ) {
    super('LogicalAndOp', line, column, start, end, raw, left, right);
  }
}

export class LogicalOrOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
  ) {
    super('LogicalOrOp', line, column, start, end, raw, left, right);
  }
}

export class SubtractOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('SubtractOp', line, column, start, end, raw, left, right);
  }
}

export class PlusOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('PlusOp', line, column, start, end, raw, left, right);
  }
}

export class UnaryPlusOp extends UnaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node
  ) {
    super('UnaryPlusOp', line, column, start, end, raw, expression);
  }
}

export class MultiplyOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('MultiplyOp', line, column, start, end, raw, left, right);
  }
}

export class DivideOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('DivideOp', line, column, start, end, raw, left, right);
  }
}

export class FloorDivideOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('FloorDivideOp', line, column, start, end, raw, left, right);
  }
}

export class ExistsOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('ExistsOp', line, column, start, end, raw, left, right);
  }
}

export class UnaryExistsOp extends UnaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node
  ) {
    super('UnaryExistsOp', line, column, start, end, raw, expression);
  }
}

export class UnaryNegateOp extends UnaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
  ) {
    super('UnaryNegateOp', line, column, start, end, raw, expression);
  }
}

export class BitNotOp extends UnaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
  ) {
    super('BitNotOp', line, column, start, end, raw, expression);
  }
}

export class BitAndOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
  ) {
    super('BitAndOp', line, column, start, end, raw, left, right);
  }
}

export class BitOrOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
  ) {
    super('BitOrOp', line, column, start, end, raw, left, right);
  }
}

export class BitXorOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
  ) {
    super('BitXorOp', line, column, start, end, raw, left, right);
  }
}

export class LeftShiftOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
  ) {
    super('LeftShiftOp', line, column, start, end, raw, left, right);
  }
}

export class SignedRightShiftOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
  ) {
    super('SignedRightShiftOp', line, column, start, end, raw, left, right);
  }
}

export class UnsignedRightShiftOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
  ) {
    super('UnsignedRightShiftOp', line, column, start, end, raw, left, right);
  }
}

export class PreDecrementOp extends UnaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
  ) {
    super('PreDecrementOp', line, column, start, end, raw, expression);
  }
}

export class PreIncrementOp extends UnaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
  ) {
    super('PreIncrementOp', line, column, start, end, raw, expression);
  }
}

export class PostDecrementOp extends UnaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
  ) {
    super('PostDecrementOp', line, column, start, end, raw, expression);
  }
}

export class PostIncrementOp extends UnaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
  ) {
    super('PostIncrementOp', line, column, start, end, raw, expression);
  }
}

export class ExpOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
  ) {
    super('ExpOp', line, column, start, end, raw, left, right);
  }
}

export class RemOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
  ) {
    super('RemOp', line, column, start, end, raw, left, right);
  }
}

export class ModuloOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
  ) {
    super('ModuloOp', line, column, start, end, raw, left, right);
  }
}

export class InOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
    readonly isNot: boolean,
  ) {
    super('InOp', line, column, start, end, raw, left, right);
  }
}

export class BaseAssignOp extends Node {
  constructor(
    type: string,
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly assignee: Node,
    readonly expression: Node,
  ) {
    super(type, line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.assignee, this.expression];
  }
}

export class AssignOp extends BaseAssignOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    assignee: Node,
    expression: Node
  ) {
    super('AssignOp', line, column, start, end, raw, assignee, expression);
  }

  withExpression(expression: Node): AssignOp {
    return new AssignOp(
      this.line, this.column, this.start, this.end, this.raw, this.assignee, expression
    );
  }
}

export class CompoundAssignOp extends BaseAssignOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    assignee: Node,
    expression: Node,
    readonly op: string,
  ) {
    super('CompoundAssignOp', line, column, start, end, raw, assignee, expression);
  }
}

export class ExtendsOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('ExtendsOp', line, column, start, end, raw, left, right);
  }
}

export class SeqOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node
  ) {
    super('SeqOp', line, column, start, end, raw, left, right);
  }
}

export class TypeofOp extends UnaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
  ) {
    super('TypeofOp', line, column, start, end, raw, expression);
  }
}

export class InstanceofOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
    readonly isNot: boolean,
  ) {
    super('InstanceofOp', line, column, start, end, raw, left, right);
  }
}

export class OfOp extends BinaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    left: Node,
    right: Node,
    readonly isNot: boolean,
  ) {
    super('OfOp', line, column, start, end, raw, left, right);
  }
}

export class DeleteOp extends UnaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
  ) {
    super('DeleteOp', line, column, start, end, raw, expression);
  }
}

export class Yield extends UnaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
  ) {
    super('Yield', line, column, start, end, raw, expression);
  }
}

export class YieldFrom extends UnaryOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    expression: Node,
  ) {
    super('YieldFrom', line, column, start, end, raw, expression);
  }
}

export class Slice extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly expression: Node,
    readonly left: Node | null,
    readonly right: Node | null,
    readonly isInclusive: boolean,
  ) {
    super('Slice', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression, this.left, this.right];
  }
}

export class SoakedSlice extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly expression: Node,
    readonly left: Node | null,
    readonly right: Node | null,
    readonly isInclusive: boolean,
  ) {
    super('SoakedSlice', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression, this.left, this.right];
  }
}

export abstract class BaseFunction extends Node {
  constructor(
    type: string,
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly parameters: Array<Node>,
    readonly body: Block | null,
  ) {
    super(type, line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.parameters, this.body];
  }

  abstract withParameters(parameters: Array<Node>): BaseFunction;
}

export class Function extends BaseFunction {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    parameters: Array<Node>,
    body: Block | null
  ) {
    super('Function', line, column, start, end, raw, parameters, body);
  }

  withParameters(parameters: Array<Node>): BaseFunction {
    return new Function(
      this.line, this.column, this.start, this.end, this.raw, parameters, this.body
    );
  }
}

export class BoundFunction extends BaseFunction {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    parameters: Array<Node>,
    body: Block | null
  ) {
    super('BoundFunction', line, column, start, end, raw, parameters, body);
  }

  withParameters(parameters: Array<Node>): BaseFunction {
    return new BoundFunction(
      this.line, this.column, this.start, this.end, this.raw, parameters, this.body
    );
  }
}

export class GeneratorFunction extends BaseFunction {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    parameters: Array<Node>,
    body: Block | null
  ) {
    super('GeneratorFunction', line, column, start, end, raw, parameters, body);
  }

  withParameters(parameters: Array<Node>): BaseFunction {
    return new GeneratorFunction(
      this.line, this.column, this.start, this.end, this.raw, parameters, this.body
    );
  }
}

export class BoundGeneratorFunction extends BaseFunction {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    parameters: Array<Node>,
    body: Block | null
  ) {
    super('BoundGeneratorFunction', line, column, start, end, raw, parameters, body);
  }

  withParameters(parameters: Array<Node>): BaseFunction {
    return new BoundGeneratorFunction(
      this.line, this.column, this.start, this.end, this.raw, parameters, this.body
    );
  }
}

export class Try extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly body: Node | null,
    readonly catchAssignee: Node | null,
    readonly catchBody: Node | null,
    readonly finallyBody: Node | null,
  ) {
    super('Try', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.body, this.catchAssignee, this.catchBody, this.finallyBody];
  }
}

export class Constructor extends BaseAssignOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    assignee: Node,
    expression: Node
  ) {
    super('Constructor', line, column, start, end, raw, assignee, expression);
  }
}

export class ClassProtoAssignOp extends BaseAssignOp {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    assignee: Node,
    expression: Node
  ) {
    super('ClassProtoAssignOp', line, column, start, end, raw, assignee, expression);
  }
}

export class Class extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly nameAssignee: Node | null,
    readonly name: Node | null,
    readonly body: Block | null,
    readonly boundMembers: Array<ClassProtoAssignOp>,
    readonly parent: Node | null,
    readonly ctor: Constructor | null,
  ) {
    super('Class', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.nameAssignee, this.parent, this.body];
  }
}

export class FunctionApplication extends Node {
  readonly function: Node;
  readonly arguments: Array<Node>;

  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    fn: Node,
    args: Array<Node>
  ) {
    super('FunctionApplication', line, column, start, end, raw);
    this.function = fn;
    this.arguments = args;
  }

  getChildFields(): Array<ChildField> {
    return [this.function, this.arguments];
  }
}

export class SoakedFunctionApplication extends Node {
  readonly function: Node;
  readonly arguments: Array<Node>;

  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    fn: Node,
    args: Array<Node>
  ) {
    super('SoakedFunctionApplication', line, column, start, end, raw);
    this.function = fn;
    this.arguments = args;
  }

  getChildFields(): Array<ChildField> {
    return [this.function, this.arguments];
  }
}

export class Super extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
  ) {
    super('Super', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class BareSuperFunctionApplication extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
  ) {
    super('BareSuperFunctionApplication', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [];
  }
}

export class NewOp extends Node {
  readonly ctor: Node;
  readonly arguments: Array<Node>;

  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    ctor: Node,
    args: Array<Node>
  ) {
    super('NewOp', line, column, start, end, raw);
    this.ctor = ctor;
    this.arguments = args;
  }

  getChildFields(): Array<ChildField> {
    return [this.ctor, this.arguments];
  }
}

export class SoakedNewOp extends Node {
  readonly ctor: Node;
  readonly arguments: Array<Node>;

  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    ctor: Node,
    args: Array<Node>
  ) {
    super('SoakedNewOp', line, column, start, end, raw);
    this.ctor = ctor;
    this.arguments = args;
  }

  getChildFields(): Array<ChildField> {
    return [this.ctor, this.arguments];
  }
}

export class DoOp extends Node {
  constructor(
    line: number,
    column: number,
    start: number,
    end: number,
    raw: string,
    readonly expression: Node
  ) {
    super('DoOp', line, column, start, end, raw);
  }

  getChildFields(): Array<ChildField> {
    return [this.expression];
  }
}
