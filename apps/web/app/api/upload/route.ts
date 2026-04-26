import { v2 as cloudinary } from 'cloudinary'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ALLOWED_IMAGE_TYPES } from '@/lib/types'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const isPublicRaw = formData.get('isPublic') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Restrict to images only: JPEG, PNG, WebP
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      return NextResponse.json(
        { error: `Only image files are allowed (${ALLOWED_IMAGE_TYPES.join(', ')})` },
        { status: 400 }
      )
    }

    const isPublic = isPublicRaw === 'true'

    // Convert File to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `uploads/${user.id}`,
          public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}`,
          resource_type: 'image',
          type: isPublic ? 'upload' : 'authenticated',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    return NextResponse.json({
      url: uploadResult.secure_url,
      pathname: uploadResult.public_id,
      size: file.size,
      contentType: file.type,
      name: file.name,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
