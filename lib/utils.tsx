import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { Icons } from "@/components/ui/icons";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function loadFfmpeg(): Promise<FFmpeg> {
  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  return ffmpeg;
}

export function fileToIcon(file_type: any): any {
  if (file_type.includes("video")) return <Icons.video />;
  if (file_type.includes("audio")) return <Icons.audio />;
  if (file_type.includes("text")) return <Icons.text />;
  if (file_type.includes("image")) return <Icons.image />;
  else return <Icons.logo />;
}
