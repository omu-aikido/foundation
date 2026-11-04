declare module "culori" {
  export function wcagContrast(foreground: unknown, background: unknown): number;
  export function toGamut(destination?: string, mode?: string): (color: unknown) => unknown;
}
