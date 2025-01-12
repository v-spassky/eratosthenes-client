import { useLingui } from "@lingui/react"
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@nextui-org/react"
import { SupportedLocale } from "localization/all"
import { setSelectedLanguage } from "localStorage/storage"
import { useTheme } from "next-themes"
import React, { ReactElement, useState } from "react"
import { IoMdSettings } from "react-icons/io"
import { VscMusic, VscMute } from "react-icons/vsc"
import { soundsAreMuted, toggleMute } from "utils/sounds"

export default function PreferencesButton(): ReactElement {
    const { theme, setTheme } = useTheme()
    const strings = useLingui()
    const [isMuted, setIsMuted] = useState(soundsAreMuted())
    const [isEnglish, setIsEnglish] = useState(strings.i18n.locale === "en")

    function onSoundSettingsChange(): void {
        toggleMute()
        setIsMuted(soundsAreMuted())
    }

    return (
        <Popover placement={"top-start"}>
            <PopoverTrigger>
                <Button isIconOnly color="primary" aria-label="Show preferences">
                    <IoMdSettings />
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
                                {strings.i18n._("lightOrDark")}
                            </TableCell>
                            <TableCell>
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button variant="bordered" size="sm">
                                            {strings.i18n._(`${theme}Theme`)}
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Current theme"
                                        variant="flat"
                                        disallowEmptySelection
                                        selectionMode="single"
                                        selectedKeys={[theme || "system"]}
                                        onSelectionChange={(selectedThemes) => {
                                            const selectedTheme = [...selectedThemes][0]
                                            setTheme(selectedTheme.toString())
                                        }}
                                    >
                                        <DropdownItem key="light">{strings.i18n._("lightTheme")}</DropdownItem>
                                        <DropdownItem key="dark">{strings.i18n._("darkTheme")}</DropdownItem>
                                        <DropdownItem key="system">{strings.i18n._("systemTheme")}</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                                {strings.i18n._("loudOrQuiet")}
                            </TableCell>
                            <TableCell>
                                <Switch
                                    aria-label="Whether to play sounds"
                                    startContent={<VscMusic />}
                                    endContent={<VscMute />}
                                    isSelected={isMuted}
                                    onValueChange={onSoundSettingsChange}
                                ></Switch>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                                {strings.i18n._("language")}
                            </TableCell>
                            <TableCell>
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button variant="bordered" size="sm">
                                            {isEnglish ? "English" : "Русский"}
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Language selection"
                                        variant="flat"
                                        disallowEmptySelection
                                        selectionMode="single"
                                        selectedKeys={isEnglish ? ["en"] : ["ru"]}
                                        onSelectionChange={(selectedLanguages) => {
                                            const selectedLanguage = [...selectedLanguages][0] as SupportedLocale
                                            strings.i18n.activate(selectedLanguage)
                                            setSelectedLanguage(selectedLanguage)
                                            setIsEnglish(selectedLanguage === "en")
                                        }}
                                    >
                                        <DropdownItem key="en">English</DropdownItem>
                                        <DropdownItem key="ru">Русский</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </PopoverContent>
        </Popover>
    )
}
