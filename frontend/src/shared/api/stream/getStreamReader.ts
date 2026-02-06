import { config } from "@/shared/lib/config";

export const getStreamReader = async (): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
  const res = await fetch(`${config.BASE_URL}/stream`);

  if (!res.ok) throw new Error(`Stream unavailable: ${res.status}`);
  if (!res.body) throw new Error("No response body");

  return res.body.getReader();
};
