import { Accordion, AccordionItem } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function AccordionWithResponsiveBackground({title, children}) {
    const [headingBackgroundColor, setHeadingBackgroundColor] = useState("");
    const { theme, _setTheme } = useTheme();

    function toggleHeadingBackgroundColor() {
        const bgColor = theme === "light" ? "rgb(243, 244, 246)" : "rgb(63, 63, 70)";
        setHeadingBackgroundColor(headingBackgroundColor === "" ? bgColor : "");
    }

    return <Accordion isCompact style={{ padding: "0px" }}>
        <AccordionItem
            key="1"
            isCompact
            aria-label={title}
            title={
                <p
                    id="about-api-key-heading"
                    style={{
                        width: "min-content", whiteSpace: "nowrap", padding: "2px 4px 2px 4px",
                        backgroundColor: headingBackgroundColor, borderRadius: "4px",
                    }}
                    onMouseEnter={toggleHeadingBackgroundColor}
                    onMouseLeave={toggleHeadingBackgroundColor}
                >
                    {title}
                </p>
            }
        >
            {children}
        </AccordionItem>
    </Accordion>;
}