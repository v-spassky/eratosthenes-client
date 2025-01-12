import { Modal, ModalContent } from "@nextui-org/react"
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
    const previewImageUrl = `${process.env.REACT_APP_S3_URL}/image-${id}-preview`
    const fullImageUrl = `${process.env.REACT_APP_S3_URL}/image-${id}`
    const [src, setSrc] = useState(previewImageUrl)

    const [retryCount, setRetryCount] = useState(0)
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    useEffect(() => {
        return (): void => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current)
            }
        }
    }, [])

    return (
        <>
            <img
                src={src}
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
                    setSrc("/images/loading.gif")
                    const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY)
                    // TODO: bail out after N retries
                    retryTimeoutRef.current = setTimeout(() => {
                        setRetryCount((prev) => prev + 1)
                        setSrc(previewImageUrl)
                    }, delay)
                }}
                onLoad={() => {
                    if (src === previewImageUrl) {
                        setIsLoaded(true)
                    }
                }}
            />
            <Modal size="3xl" isOpen={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
                <ModalContent>
                    <img src={fullImageUrl} alt="Attached image" style={{ width: "100%", borderRadius: "8px" }} />
                </ModalContent>
            </Modal>
        </>
    )
}
