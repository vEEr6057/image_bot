import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const grading = formData.get('grading') as string

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Get backend URL from environment variable
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL

    if (!backendUrl) {
      // Fallback: Return original image if backend not configured
      console.warn('NEXT_PUBLIC_BACKEND_BASE_URL not set - returning original image')
      const buffer = await image.arrayBuffer()
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': image.type,
          'Content-Disposition': `attachment; filename="original-${image.name}"`,
          'X-Warning': 'Backend not configured - returning original image',
        },
      })
    }

    // Forward request to Real-ESRGAN backend (Colab via ngrok)
    const backendFormData = new FormData()
    backendFormData.append('image', image)
    
    console.log(`Forwarding to backend: ${backendUrl}/api/upscale`)
    
    const response = await fetch(`${backendUrl}/api/upscale`, {
      method: 'POST',
      body: backendFormData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      throw new Error(`Backend processing failed: ${response.status} ${errorText}`)
    }
    
    // Get enhanced image from backend
    const resultBlob = await response.blob()
    
    return new NextResponse(resultBlob, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="upscaled.png"',
      },
    })
  } catch (error) {
    console.error('Upscale API error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}
