import { Elision as CoffeeElision } from 'decaffeinate-coffeescript2/lib/coffeescript/nodes';
import { Elision } from '../nodes';
import getLocation from '../util/getLocation';
import ParseContext from '../util/ParseContext';

export default function mapElision(context: ParseContext, node: CoffeeElision): Elision {
  let { line, column, start, end, raw } = getLocation(context, node);
  return new Elision(line, column, start, end, raw);
}
