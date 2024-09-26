import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { Icons } from "@/components/ui/icons";
import { Action } from "./types";
import { fetchFile } from "@ffmpeg/util";

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

export function bytesToSize(bytes: number): String {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  if (bytes === 0) return "0 Byte";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${size} ${sizes[i]}`;
}

export function compressFileName(fileName: any): string {
  // Define the maximum length for the substring
  const maxSubstrLength = 18;

  // Check if the fileName is longer than the maximum length
  if (fileName.length > maxSubstrLength) {
    // Extract the first part of the fileName (before the extension)
    const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".");

    // Extract the extension from the fileName
    const fileExtension = fileName.split(".").pop();

    // Calculate the length of characters to keep in the middle
    const charsToKeep =
      maxSubstrLength -
      (fileNameWithoutExtension.length + fileExtension.length + 3);

    // Create the compressed fileName
    const compressedFileName =
      fileNameWithoutExtension.substring(
        0,
        maxSubstrLength - fileExtension.length - 3
      ) +
      "..." +
      fileNameWithoutExtension.slice(-charsToKeep) +
      "." +
      fileExtension;

    return compressedFileName;
  } else {
    // If the fileName is shorter than the maximum length, return it as is
    return fileName.trim();
  }
}

// imports

function getFileExtension(file_name: string) {
  const regex = /(?:\.([^.]+))?$/; // Matches the last dot and everything after it
  const match = regex.exec(file_name);
  if (match && match[1]) {
    return match[1];
  }
  return ""; // No file extension found
}

function removeFileExtension(file_name: string) {
  const lastDotIndex = file_name.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    return file_name.slice(0, lastDotIndex);
  }
  return file_name; // No file extension found
}

export default async function convertFile(
  ffmpeg: FFmpeg,
  action: Action
): Promise<any> {
  const { file, to, file_name, file_type } = action;
  const input = getFileExtension(file_name);
  const output = removeFileExtension(file_name) + "." + to;
  ffmpeg.writeFile(input, await fetchFile(file));

  // FFMEG COMMANDS
  let ffmpeg_cmd: any = [];
  // 3gp video
  if (to === "3gp")
    ffmpeg_cmd = [
      "-i",
      input,
      "-r",
      "20",
      "-s",
      "352x288",
      "-vb",
      "400k",
      "-acodec",
      "aac",
      "-strict",
      "experimental",
      "-ac",
      "1",
      "-ar",
      "8000",
      "-ab",
      "24k",
      output,
    ];
  else ffmpeg_cmd = ["-i", input, output];

  // execute cmd
  await ffmpeg.exec(ffmpeg_cmd);

  const data = (await ffmpeg.readFile(output)) as any;
  const blob = new Blob([data], { type: file_type.split("/")[0] });
  const url = URL.createObjectURL(blob);
  return { url, output };
}
