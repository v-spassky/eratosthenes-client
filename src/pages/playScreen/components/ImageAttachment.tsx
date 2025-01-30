import { Modal, ModalContent } from "@nextui-org/react"
import { getTemporaryAttachmentLinks } from "api/http"
import React, { ReactElement, useEffect, useRef, useState } from "react"

const INITIAL_RETRY_DELAY = 1000
const MAX_RETRY_DELAY = 32000

interface ImageAttachmentProps {
    id: string
}

// TODO: cache the full image
export default function ImageAttachment({ id }: ImageAttachmentProps): ReactElement {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [previewSrc, setPreviewSrc] = useState("/images/loading.gif")
    const [fullSrc, setFullSrc] = useState<string | null>(null)

    const [retryCount, setRetryCount] = useState(0)
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    useEffect(() => {
        return (): void => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current)
            }
        }
    }, [])

    async function scheduleImageFetchingRetry(): Promise<void> {
        const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY)
        retryTimeoutRef.current = setTimeout(async () => {
            setRetryCount((prev) => prev + 1)
            const imgLinks = await getTemporaryAttachmentLinks([id])
            const imgLink = imgLinks[0]
            setPreviewSrc(imgLink.preview)
            setFullSrc(imgLink.full)
        }, delay)
    }

    return (
        <>
            <img
                src={previewSrc}
                alt="Attached image preview"
                style={{
                    width: "50px",
                    height: "30px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    cursor: isLoaded ? "zoom-in" : "default",
                    transition: isLoaded ? "outline 0.2s ease" : "none",
                    outline: isLoaded ? "2px solid transparent" : "none",
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.outline = "2px solid #3b82f6"
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.outline = "2px solid transparent"
                }}
                onClick={() => {
                    if (isLoaded) {
                        setIsModalOpen(true)
                    }
                }}
                onError={() => {
                    setPreviewSrc("/images/loading.gif")
                    scheduleImageFetchingRetry()
                }}
                onLoad={() => {
                    if (previewSrc !== "/images/loading.gif") {
                        setIsLoaded(true)
                    } else {
                        scheduleImageFetchingRetry()
                    }
                }}
            />
            <Modal size="3xl" isOpen={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
                <ModalContent>
                    <img src={fullSrc!} alt="Attached image" style={{ width: "100%", borderRadius: "8px" }} />
                </ModalContent>
            </Modal>
        </>
    )
}
