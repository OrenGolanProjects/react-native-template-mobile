import { useEffect, useState } from "react";
import { getBrowserId } from "@/services/device";

export function useBrowserId(): string | null {
  const [browserId, setBrowserId] = useState<string | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      const id = await getBrowserId();
      setBrowserId(id);
    }
    load();
  }, []);

  return browserId;
}
