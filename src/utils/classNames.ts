export const classNames = (...params: unknown[]) =>
  params.filter(Boolean).join(" ");
