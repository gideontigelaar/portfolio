export const paginate = <T>(items: readonly T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, page) => items.slice(page * size, (page + 1) * size));