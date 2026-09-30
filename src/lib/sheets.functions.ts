import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const fetchSheetCsv = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ sheetId: z.string().regex(/^[a-zA-Z0-9-_]+$/), gid: z.string().regex(/^\d+$/) }).parse(d),
  )
  .handler(async ({ data }) => {
    const url = `https://docs.google.com/spreadsheets/d/${data.sheetId}/export?format=csv&gid=${data.gid}`;
    const res = await fetch(url, { redirect: "follow" });
    const text = await res.text();
    if (!res.ok || text.trimStart().startsWith("<")) {
      throw new Error(
        `Não foi possível ler a planilha [${res.status}]. Verifique se ela está compartilhada como "Qualquer pessoa com o link".`,
      );
    }
    return { csv: text };
  });
