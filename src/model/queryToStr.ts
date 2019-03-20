export default function queryToStr(
  query: string | string[] | undefined
): string | undefined {
  return query instanceof Array ? query.join("") : query;
}
