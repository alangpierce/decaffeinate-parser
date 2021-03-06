import SourceToken from 'coffee-lex/dist/SourceToken';
import SourceType from 'coffee-lex/dist/SourceType';
import {LocationData} from 'decaffeinate-coffeescript2/lib/coffeescript/nodes';
import {firstSemanticTokenAfter, firstSemanticTokenBefore} from './getLocation';
import locationDataFromSourceRange from './locationDataFromSourceRange';
import ParseContext from './ParseContext';
import sourceRangeFromLocationData, {SourceRange} from './sourceRangeFromLocationData';

export default function expandToIncludeParens(context: ParseContext, locationData: LocationData): LocationData {
  let sourceRange = sourceRangeFromLocationData(context, locationData);
  while (true) {
    let tokens = getSurroundingParens(context, sourceRange);
    if (tokens === null) {
      break;
    }
    sourceRange = {start: tokens.openParen.start, end: tokens.closeParen.end};
  }
  return locationDataFromSourceRange(context, sourceRange);
}

type Tokens = {openParen: SourceToken, closeParen: SourceToken};

function getSurroundingParens(context: ParseContext, sourceRange: SourceRange): Tokens | null {
  let tokenBefore = firstSemanticTokenBefore(context, sourceRange.start);
  let tokenAfter = firstSemanticTokenAfter(context, sourceRange.end);
  if (tokenBefore === null || tokenBefore.type !== SourceType.LPAREN) {
    return null;
  }
  if (tokenAfter === null || tokenAfter.type !== SourceType.RPAREN) {
    return null;
  }
  return {openParen: tokenBefore, closeParen: tokenAfter};
}
