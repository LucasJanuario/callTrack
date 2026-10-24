export const HOURS_PER_MONTH = 220;

/** Dias úteis (seg–sáb) e repousos (domingos) de um mês "YYYY-MM". */
export function monthDays(month: string) {
  const [y, m] = month.split("-").map(Number);
  const total = new Date(y, m, 0).getDate();
  let rest = 0;
  for (let d = 1; d <= total; d++) if (new Date(y, m - 1, d).getDay() === 0) rest++;
  return { workDays: total - rest, restDays: rest };
}

const round2 = (v: number) => Math.round(v * 100) / 100;

export function calcOvertime(salary: number, t100: number, t70: number, month: string) {
  const hourly = salary > 0 ? salary / HOURS_PER_MONTH : 0;
  const v100 = round2(t100 * hourly * 2);
  const v70 = round2(t70 * hourly * 1.7);
  const { workDays, restDays } = monthDays(month);
  const dsr = workDays ? round2(((v100 + v70) / workDays) * restDays) : 0;
  const dsrHours = hourly ? round2(dsr / hourly) : 0;
  return { hourly, v100, v70, dsr, dsrHours, workDays, restDays, total: round2(v100 + v70 + dsr) };
}
