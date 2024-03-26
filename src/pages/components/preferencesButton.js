import { Button, Popover, PopoverContent, PopoverTrigger, Switch } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { FaBrush, FaMoon, FaSun } from "react-icons/fa6";

export default function PreferencesButton() {
    const { theme, setTheme } = useTheme();

    return <Popover placement={"top-start"}>
        <PopoverTrigger>
            <Button
                isIconOnly
                color="primary"
                aria-label="Show preferences"
            >
                    <FaBrush />
            </Button>
        </PopoverTrigger>
        <PopoverContent>
            <Switch
                size="lg"
                startContent={<FaSun />}
                endContent={<FaMoon />}
                isSelected={theme === "dark"}
                onValueChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                Светло или темно
            </Switch>
        </PopoverContent>
    </Popover>
}
