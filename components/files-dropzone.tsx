"use client";

import { useToast } from "@/hooks/use-toast";
import React, { useEffect, useRef, useState } from "react";
import ReactDropzone from "react-dropzone";
import { Icons } from "./ui/icons";
import { ACCEPTED_FILES } from "@/lib/consts";
import { Action } from "@/lib/types";
import { loadFfmpeg } from "@/lib/utils";
import { FFmpeg } from "@ffmpeg/ffmpeg";

export function FilesDropzone() {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  const [isReady, setIsReady] = React.useState<boolean>(false);
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
  const [isDone, setIsDone] = React.useState<boolean>(false);
  const [isConverting, setIsConverting] = React.useState<boolean>(false);

  const [actions, setActions] = useState<Action[]>([]);
  const [files, setFiles] = useState<Array<any>>([]);

  const [defaultValues, setDefaultValues] = useState("video");

  const [selected, setSelected] = useState("...");

  const ffmpegRef = useRef<any>(null);

  const handleHover = () => setIsHovered(true);
  const handleExitHover = () => setIsHovered(false);

  //resets most of the state to their initial value
  const reset = () => {
    setIsDone(false);
    setActions([]);
    setFiles([]);
    setIsReady(false);
    setIsConverting(false);
  };

  const download = (action: Action) => {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = action.url;
    a.download = action.output;

    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(action.url);
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    for (let action of actions) {
      !action.is_error && download(action);
    }
  };

  const handleUpload = (data: Array<any>): void => {
    handleExitHover();
    setFiles(data);
    const tmp: Action[] = [];
    data.forEach((file: any) => {
      const formData = new FormData();
      tmp.push({
        file_name: file.name,
        file_size: file.size,
        from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
        to: null,
        file_type: file.type,
        file,
        is_converted: false,
        is_converting: false,
        is_error: false,
      });
    });
    setActions(tmp);
  };

  const updateAction = (file_name: String, to: String) => {
    setActions(
      actions.map((action): Action => {
        if (action.file_name === file_name) {
          return {
            ...action,
            to,
          };
        }

        return action;
      })
    );
  };

  const checkReady = (): void => {
    let tmpIsReady = true;
    actions.forEach((action: Action) => {
      if (!action.to) tmpIsReady = false;
    });
    setIsReady(tmpIsReady);
  };

  const deleteAction = (action: Action): void => {
    setActions(actions.filter((elt) => elt !== action));
    setFiles(files.filter((elt) => elt.name !== action.file_name));
  };

  const load = async () => {
    const ffmpeg_response: FFmpeg = await loadFfmpeg();
    ffmpegRef.current = ffmpeg_response;
    setIsLoaded(true);
  };

  useEffect(() => {
    if (!actions.length) {
      setIsDone(false);
      setFiles([]);
      setIsReady(false);
      setIsConverting(false);
    } else checkReady();
  }, [actions]);

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      {isHovered ? "Hovered" : "Not Hovered"}
      <ReactDropzone
        accept={ACCEPTED_FILES}
        onDrop={handleUpload}
        onDragEnter={handleHover}
        onDragLeave={handleExitHover}
        onDropRejected={() => {
          handleExitHover();

          toast({
            variant: "destructive",
            title: "Error uploading your file(s)",
            description: "Allowed Files: Audio, Video and Images.",
            duration: 5000,
          });
        }}
        onError={() => {
          handleExitHover();
          toast({
            variant: "destructive",
            title: "Error uploading your file(s)",
            description: "Allowed Files: Audio, Video and Images.",
            duration: 5000,
          });
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            className="flex items-center justify-center border-2 border-dashed shadow-sm cursor-pointer bg-background h-72 lg:h-80 xl:h-96 rounded-3xl border-secondary"
          >
            <input {...getInputProps()} />
            <div className="space-y-4 text-foreground">
              {isHovered ? (
                <>
                  <div className="flex justify-center text-6xl">
                    <Icons.logo />
                  </div>
                  <h3 className="text-2xl font-medium text-center">
                    Yes, right there
                  </h3>
                </>
              ) : (
                <>
                  <div className="flex justify-center text-6xl">
                    <Icons.cloud />
                  </div>
                  <h3 className="text-2xl font-medium text-center">
                    Click, or drop your files here
                  </h3>
                </>
              )}
            </div>
          </div>
        )}
      </ReactDropzone>
    </div>
  );
}
