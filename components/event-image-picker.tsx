"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { Check, ImageIcon, Loader2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getEventImageSrc,
  quoteEventImageAssets,
} from "@/lib/quotes/event-images"
import { getEventImageObjectPosition } from "@/lib/quotes/presentation-shared"
import type {
  EventMedia,
  QuoteEventImage,
  QuoteEvent,
} from "@/lib/quotes/types"

const acceptedSourceTypes = ["image/jpeg", "image/png", "image/webp"]
const maximumSourceBytes = 10 * 1024 * 1024

async function createCroppedJpeg(source: string, area: Area) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new window.Image()
    nextImage.onload = () => resolve(nextImage)
    nextImage.onerror = () =>
      reject(new Error("Could not read the selected image."))
    nextImage.src = source
  })
  const scale = Math.min(1, 1200 / area.width, 900 / area.height)
  const width = Math.max(4, Math.round((area.width * scale) / 4) * 4)
  const height = Math.max(3, Math.round((width * 3) / 4))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Image cropping is not supported in this browser.")
  }

  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    width,
    height
  )

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) =>
        value
          ? resolve(value)
          : reject(new Error("Could not prepare the cropped image.")),
      "image/jpeg",
      0.9
    )
  })

  return { blob, width, height }
}

export function EventImagePicker({
  event,
  media,
  mediaLoading,
  mediaError,
  onChange,
  onMediaAdded,
}: {
  event: QuoteEvent
  media: EventMedia[]
  mediaLoading: boolean
  mediaError: string | null
  onChange: (image: QuoteEventImage) => void
  onMediaAdded: (media: EventMedia) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [cropSource, setCropSource] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const imageSrc = getEventImageSrc(event)

  function clearCropSource() {
    if (cropSource) URL.revokeObjectURL(cropSource)
    setCropSource(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedArea(null)
  }

  function closePicker() {
    if (uploading) return
    clearCropSource()
    setError(null)
    setIsOpen(false)
  }

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape" && !uploading) closePicker()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  })

  useEffect(
    () => () => {
      if (cropSource) URL.revokeObjectURL(cropSource)
    },
    [cropSource]
  )

  function selectImage(image: QuoteEventImage) {
    onChange(image)
    closePicker()
  }

  function selectSource(file: File | undefined) {
    if (!file) return
    setError(null)

    if (!acceptedSourceTypes.includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image.")
      return
    }

    if (file.size > maximumSourceBytes) {
      setError("Choose an image smaller than 10 MiB.")
      return
    }

    if (cropSource) URL.revokeObjectURL(cropSource)
    setCropSource(URL.createObjectURL(file))
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedArea(null)
  }

  async function uploadCrop() {
    if (!cropSource || !croppedArea) return
    setUploading(true)
    setError(null)

    try {
      const result = await createCroppedJpeg(cropSource, croppedArea)
      const formData = new FormData()
      formData.set("file", result.blob, "event-image.jpg")
      formData.set("width", String(result.width))
      formData.set("height", String(result.height))
      const response = await fetch("/api/event-media", {
        method: "POST",
        body: formData,
      })
      const payload = (await response.json()) as {
        media?: EventMedia
        error?: string
      }

      if (!response.ok || !payload.media) {
        throw new Error(payload.error || "Could not upload the image.")
      }

      onMediaAdded(payload.media)
      onChange({
        source: "media",
        mediaId: payload.media.id,
        url: payload.media.url,
      })
      clearCropSource()
      setIsOpen(false)
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload the image."
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="relative h-[60px] w-20 shrink-0 overflow-hidden rounded-lg bg-[#eee9df]">
          <Image
            src={imageSrc}
            alt={event.title ? `${event.title} image` : "Event image"}
            fill
            sizes="80px"
            className="object-cover"
            style={{ objectPosition: getEventImageObjectPosition(event) }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#39362f]">
            {event.image.source === "auto"
              ? "Recommended image"
              : event.image.source === "media"
                ? "Media library image"
                : "Selected event image"}
          </p>
          <p className="mt-1 truncate text-xs text-[#7f776b]">
            Used on the event card and in the PDF
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hover:text-[#39362f]"
            onClick={() => setIsOpen(true)}
          >
            Change
          </Button>
          {event.image.source !== "auto" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[#687662] hover:text-[#39362f]"
              onClick={() => onChange({ source: "auto" })}
            >
              Reset
            </Button>
          ) : null}
        </div>
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Choose event image"
          onMouseDown={(mouseEvent) => {
            if (mouseEvent.target === mouseEvent.currentTarget) closePicker()
          }}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[1.6rem] bg-[#fffdf9] p-5 shadow-2xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.25em] text-[#7b776f] uppercase">
                  Event image
                </p>
                <h3 className="mt-2 font-serif text-2xl text-[#39362f]">
                  {cropSource ? "Crop your image" : "Choose an image"}
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close image picker"
                disabled={uploading}
                onClick={closePicker}
              >
                <X />
              </Button>
            </div>

            {cropSource ? (
              <div className="mt-5">
                <div className="relative h-[min(58vh,30rem)] overflow-hidden rounded-2xl bg-[#1d1d1b]">
                  <Cropper
                    image={cropSource}
                    crop={crop}
                    zoom={zoom}
                    aspect={4 / 3}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, pixels) => setCroppedArea(pixels)}
                  />
                </div>
                <label className="mt-4 grid gap-2 text-sm font-medium text-[#39362f]">
                  Zoom
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(rangeEvent) =>
                      setZoom(Number(rangeEvent.target.value))
                    }
                  />
                </label>
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={clearCropSource}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    disabled={uploading || !croppedArea}
                    className="bg-[#6f7f68] text-white hover:bg-[#65755e]"
                    onClick={uploadCrop}
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Upload />
                    )}
                    {uploading ? "Uploading…" : "Crop and upload"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(inputEvent) => {
                    selectSource(inputEvent.target.files?.[0])
                    inputEvent.target.value = ""
                  }}
                />
                <button
                  type="button"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#aeb9a8] bg-[#f5faf3] px-5 py-5 text-sm font-medium text-[#566552] transition hover:bg-[#edf5ea]"
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  Upload JPEG, PNG, or WebP
                </button>

                <div className="mt-7">
                  <h4 className="text-sm font-medium text-[#39362f]">
                    Event image collection
                  </h4>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {quoteEventImageAssets.map((asset) => {
                      const selected =
                        event.image.source === "asset" &&
                        event.image.assetKey === asset.key

                      return (
                        <button
                          key={asset.key}
                          type="button"
                          className="group text-left"
                          onClick={() =>
                            selectImage({
                              source: "asset",
                              assetKey: asset.key,
                            })
                          }
                        >
                          <span className="relative block aspect-4/3 overflow-hidden rounded-xl bg-[#eee9df] ring-offset-2 group-focus-visible:ring-2 group-focus-visible:ring-[#6f7f68]">
                            <Image
                              src={asset.src}
                              alt={asset.label}
                              fill
                              sizes="(max-width: 640px) 50vw, 220px"
                              className="object-cover transition group-hover:scale-[1.03]"
                            />
                            {selected ? (
                              <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-[#6f7f68] text-white">
                                <Check className="size-4" />
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-2 block text-xs font-medium text-[#5e5a54]">
                            {asset.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-7 border-t border-[#e5dfd5] pt-6">
                  <h4 className="text-sm font-medium text-[#39362f]">
                    Your media library
                  </h4>
                  {mediaLoading ? (
                    <div className="mt-4 flex items-center gap-2 text-sm text-[#7f776b]">
                      <Loader2 className="size-4 animate-spin" /> Loading
                      images…
                    </div>
                  ) : mediaError ? (
                    <p className="mt-4 text-sm text-red-700">{mediaError}</p>
                  ) : media.length ? (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {media.map((item) => {
                        const selected =
                          event.image.source === "media" &&
                          event.image.mediaId === item.id

                        return (
                          <button
                            key={item.id}
                            type="button"
                            className="group text-left"
                            onClick={() =>
                              selectImage({
                                source: "media",
                                mediaId: item.id,
                                url: item.url,
                              })
                            }
                          >
                            <span className="relative block aspect-4/3 overflow-hidden rounded-xl bg-[#eee9df] ring-offset-2 group-focus-visible:ring-2 group-focus-visible:ring-[#6f7f68]">
                              <Image
                                src={item.url}
                                alt="Uploaded event image"
                                fill
                                sizes="(max-width: 640px) 50vw, 220px"
                                className="object-cover transition group-hover:scale-[1.03]"
                              />
                              {selected ? (
                                <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-[#6f7f68] text-white">
                                  <Check className="size-4" />
                                </span>
                              ) : null}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f4f1eb] px-4 py-4 text-sm text-[#7f776b]">
                      <ImageIcon className="size-4" /> Uploaded images will
                      appear here.
                    </div>
                  )}
                </div>
              </>
            )}

            {error ? (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
