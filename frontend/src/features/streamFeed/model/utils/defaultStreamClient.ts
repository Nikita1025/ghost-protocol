import { getStreamReader } from "@/shared/api/stream";
import type { IStreamClient } from "../types/types";

export const defaultStreamClient: IStreamClient = {
  getReader: (url: string) => getStreamReader(url),
};
