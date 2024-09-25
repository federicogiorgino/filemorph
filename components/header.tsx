"use client";

import { Github } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Icons } from "./ui/icons";

export function Header() {
  return (
    <nav className="container mx-auto px-4 md:px-0">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-2">
          <Icons.logo className="text-primary" />
          <span className="text-lg font-bold">
            File<span className="text-primary">Morph</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="https://github.com/federico-giorgino/filemorph"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon">
              <Github className="w-5 h-5" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
