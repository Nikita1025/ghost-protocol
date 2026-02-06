export async function getStreamReader(
  url: string
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Stream unavailable: ${res.status}`);
  if (!res.body) throw new Error("No response body");

  return res.body.getReader();
}
