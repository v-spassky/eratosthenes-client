import {
    Button, Popover, PopoverContent, PopoverTrigger, Switch, Table, TableBody, TableCell, TableColumn, TableHeader,
    TableRow,
} from "@nextui-org/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { FaBrush, FaMoon, FaSun } from "react-icons/fa6";
import { VscMusic, VscMute } from "react-icons/vsc";
import { soundsAreMuted, toggleMute} from "utils/sounds.js";

export default function PreferencesButton() {
    const { theme, setTheme } = useTheme();
    const [isMuted, setIsMuted] = useState(soundsAreMuted());

    function onSoundSettingsChange() {
        toggleMute();
        setIsMuted(soundsAreMuted());
    }

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
                                aria-label="Switch between themes"
                                startContent={<FaSun />}
                                endContent={<FaMoon />}
                                isSelected={theme === "dark"}
                                onValueChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                            </Switch>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                            Громко или тихо
                        </TableCell>
                        <TableCell>
                            <Switch
                                aria-label="Whether to play sounds"
                                startContent={<VscMusic />}
                                endContent={<VscMute />}
                                isSelected={isMuted}
                                onValueChange={onSoundSettingsChange}
                            >
                            </Switch>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </PopoverContent>
    </Popover>;
}
