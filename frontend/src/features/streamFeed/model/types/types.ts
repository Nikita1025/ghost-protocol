export interface IStreamClient {
  getReader(url: string): Promise<ReadableStreamDefaultReader<Uint8Array>>;
}
