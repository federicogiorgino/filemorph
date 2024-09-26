import { FilesDropzone } from "@/components/files-dropzone";
import { Icons } from "@/components/ui/icons";
import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col justify-center flex-1 space-y-8">
      <div className="space-y-6">
        <div className="flex items-center gap-2 justify-center">
          <Icons.logo className="size-12 text-primary" />
          <h1 className="text-3xl font-bold text-center md:text-5xl">
            File<span className="text-primary">Morph</span>
          </h1>
        </div>
        <p className="text-center text-muted-foreground text-md md:text-lg md:px-24 xl:px-44 2xl:px-52">
          With FileMorph you easily convert any image, audio or video in
          seconds! Our free, user-friendly app simplifies the process, helping
          you handle documents, images locally.
        </p>
      </div>
      <FilesDropzone />
    </div>
  );
}
