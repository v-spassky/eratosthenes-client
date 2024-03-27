import {
    Button, Popover, PopoverContent, PopoverTrigger, Switch, Table, TableBody, TableCell, TableColumn, TableHeader,
    TableRow,
} from "@nextui-org/react";
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
            <Table removeWrapper hideHeader aria-label="Theme preferences">
                <TableHeader>
                    <TableColumn>Настройка</TableColumn>
                    <TableColumn>Ручка</TableColumn>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                            Светло или темно
                        </TableCell>
                        <TableCell>
                            <Switch
                                startContent={<FaSun />}
                                endContent={<FaMoon />}
                                isSelected={theme === "dark"}
                                onValueChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                            </Switch>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </PopoverContent>
    </Popover>
}
