import { getSession } from "@/lib/auth"
import type { EventMedia } from "@/lib/quotes/types"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const bucketName = "quote-event-images"
const maximumUploadBytes = 5 * 1024 * 1024

type EventMediaRow = {
  id: string
  public_url: string
  width: number
  height: number
  created_at: string
}

function getJpegDimensions(bytes: Uint8Array) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return null

  const frameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
    0xcf,
  ])
  let offset = 2

  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1
      continue
    }

    const marker = bytes[offset + 1]
    if (frameMarkers.has(marker)) {
      return {
        height: (bytes[offset + 5] << 8) + bytes[offset + 6],
        width: (bytes[offset + 7] << 8) + bytes[offset + 8],
      }
    }

    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2
      continue
    }

    const segmentLength = (bytes[offset + 2] << 8) + bytes[offset + 3]
    if (segmentLength < 2) return null
    offset += segmentLength + 2
  }

  return null
}

function toEventMedia(row: EventMediaRow): EventMedia {
  return {
    id: row.id,
    url: row.public_url,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
  }
}

export async function GET() {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Authentication required." }, { status: 401 })
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("event_media")
    .select("id, public_url, width, height, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return Response.json(
      { error: "Could not load the media library." },
      { status: 500 }
    )
  }

  return Response.json({ media: (data as EventMediaRow[]).map(toEventMedia) })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: "Authentication required." }, { status: 401 })
  }

  const contentLength = Number(request.headers.get("content-length"))
  if (contentLength && contentLength > maximumUploadBytes + 1024 * 1024) {
    return Response.json(
      { error: "The upload request is too large." },
      { status: 413 }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: "Invalid upload request." }, { status: 400 })
  }

  const file = formData.get("file")

  if (!(file instanceof File) || file.type !== "image/jpeg") {
    return Response.json(
      { error: "The cropped image must be a JPEG." },
      { status: 400 }
    )
  }

  if (!file.size || file.size > maximumUploadBytes) {
    return Response.json(
      { error: "The cropped image must be smaller than 5 MiB." },
      { status: 400 }
    )
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const dimensions = getJpegDimensions(bytes)
  if (!dimensions) {
    return Response.json(
      { error: "The uploaded file is not a valid JPEG." },
      { status: 400 }
    )
  }

  const { width, height } = dimensions
  if (
    width <= 0 ||
    height <= 0 ||
    width > 1200 ||
    height > 900 ||
    Math.abs(width / height - 4 / 3) > 0.01
  ) {
    return Response.json(
      { error: "The cropped image must use a 4:3 aspect ratio." },
      { status: 400 }
    )
  }

  const mediaId = crypto.randomUUID()
  const storagePath = `${session.userId}/${mediaId}.jpg`
  const supabase = await createSupabaseServerClient()
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, bytes, { contentType: "image/jpeg", upsert: false })

  if (uploadError) {
    return Response.json(
      { error: "Could not upload the image." },
      { status: 500 }
    )
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(storagePath)
  const { data, error: insertError } = await supabase
    .from("event_media")
    .insert({
      id: mediaId,
      owner_id: session.userId,
      storage_path: storagePath,
      public_url: publicUrlData.publicUrl,
      width,
      height,
      mime_type: "image/jpeg",
    })
    .select("id, public_url, width, height, created_at")
    .single()

  if (insertError) {
    await supabase.storage.from(bucketName).remove([storagePath])
    return Response.json(
      { error: "Could not save the image to your library." },
      { status: 500 }
    )
  }

  return Response.json(
    { media: toEventMedia(data as EventMediaRow) },
    { status: 201 }
  )
}
