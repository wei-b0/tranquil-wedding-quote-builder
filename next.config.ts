import type { NextConfig } from "next"

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "picsum.photos",
  },
]
let allowLocalSupabaseImages = false

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  allowLocalSupabaseImages = ["127.0.0.1", "localhost"].includes(
    supabaseUrl.hostname
  )
  remotePatterns.push({
    protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
    hostname: supabaseUrl.hostname,
    port: supabaseUrl.port,
    pathname: "/storage/v1/object/public/quote-event-images/**",
  })
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    dangerouslyAllowLocalIP: allowLocalSupabaseImages,
  },
}

export default nextConfig
