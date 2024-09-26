import { useTheme } from "next-themes";
import { Icons } from "./ui/icons";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Tabs value={theme} onValueChange={setTheme}>
      <TabsList>
        <TabsTrigger value={"light"}>
          <Icons.sun className="size-4" />
        </TabsTrigger>
        <TabsTrigger value={"dark"}>
          <Icons.moon className="size-4" />
        </TabsTrigger>
        <TabsTrigger value={"system"}>
          <Icons.system className="size-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
