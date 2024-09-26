"use client";

import { useToast } from "@/hooks/use-toast";
import React, { useEffect, useRef, useState } from "react";
import ReactDropzone from "react-dropzone";
import { Icons } from "./ui/icons";
import { ACCEPTED_FILES, FILE_EXTENSIONS } from "@/lib/consts";
import { Action } from "@/lib/types";
import {
  bytesToSize,
  compressFileName,
  fileToIcon,
  loadFfmpeg,
} from "@/lib/utils";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Skeleton } from "./ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";

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

  if (actions.length) {
    return (
      <div className="space-y-6">
        {actions.map((action: Action, i: number) => (
          <div
            key={i}
            className="relative flex flex-wrap items-center justify-between w-full px-4 py-4 space-y-2 border cursor-pointer lg:py-0 rounded-xl h-fit lg:h-20 lg:px-10 lg:flex-nowrap"
          >
            {!isLoaded && (
              <Skeleton className="absolute w-full h-full -ml-10 cursor-progress rounded-xl" />
            )}

            <div className="flex items-center gap-4">
              <span className="text-2xl text-orange-600">
                {fileToIcon(action.file_type)}
              </span>
              <div className="flex items-center gap-1 w-96">
                <span className="overflow-x-hidden font-medium text-md">
                  {compressFileName(action.file_name)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({bytesToSize(action.file_size)})
                </span>
              </div>
            </div>

            {action.is_error ? (
              <Badge variant="destructive" className="flex gap-2">
                <span>Error Converting File</span>
                <Icons.error />
              </Badge>
            ) : action.is_converted ? (
              <Badge variant="default" className="flex gap-2 bg-green-500">
                <span>Done</span>
                <Icons.done />
              </Badge>
            ) : action.is_converting ? (
              <Badge variant="default" className="flex gap-2">
                <span>Converting</span>
                <span className="animate-spin">
                  <Icons.spinner />
                </span>
              </Badge>
            ) : (
              <div className="flex items-center gap-4 text-muted-foreground text-md">
                <span>Convert to</span>
                <Select
                  onValueChange={(value) => {
                    if (FILE_EXTENSIONS.audio.includes(value)) {
                      setDefaultValues("audio");
                    } else if (FILE_EXTENSIONS.video.includes(value)) {
                      setDefaultValues("video");
                    }
                    setSelected(value);
                    updateAction(action.file_name, value);
                  }}
                  value={selected}
                >
                  <SelectTrigger className="w-32 font-medium text-center outline-none focus:outline-none focus:ring-0 text-muted-foreground bg-background text-md">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent className="h-fit">
                    {action.file_type.includes("image") && (
                      <>
                        {FILE_EXTENSIONS.image.map((elt, i) => (
                          <SelectItem value={elt} className="mx-auto" key={i}>
                            {elt}
                          </SelectItem>
                        ))}
                      </>
                    )}
                    {action.file_type.includes("video") && (
                      <Tabs defaultValue={defaultValues} className="w-full">
                        <TabsList className="w-full">
                          <TabsTrigger value="video" className="w-full">
                            Video
                          </TabsTrigger>
                          <TabsTrigger value="audio" className="w-full">
                            Audio
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="video">
                          <>
                            {FILE_EXTENSIONS.video.map((elt, i) => (
                              <SelectItem
                                value={elt}
                                className="mx-auto"
                                key={i}
                              >
                                {elt}
                              </SelectItem>
                            ))}
                          </>
                        </TabsContent>
                        <TabsContent value="audio">
                          <>
                            {FILE_EXTENSIONS.audio.map((elt, i) => (
                              <SelectItem
                                value={elt}
                                className="mx-auto"
                                key={i}
                              >
                                {elt}
                              </SelectItem>
                            ))}
                          </>
                        </TabsContent>
                      </Tabs>
                    )}
                    {action.file_type.includes("audio") && (
                      <>
                        {FILE_EXTENSIONS.audio.map((elt, i) => (
                          <SelectItem value={elt} className="mx-auto" key={i}>
                            {elt}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {action.is_converted ? (
              <Button variant="outline" onClick={() => download(action)}>
                Download
              </Button>
            ) : (
              <span
                onClick={() => deleteAction(action)}
                className="flex items-center justify-center w-10 h-10 text-2xl rounded-full cursor-pointer hover:bg-muted text-foreground"
              >
                <Icons.close />
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div>
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
