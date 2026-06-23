import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadDocument } from '@/lib/actions/documents'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const formData = await request.formData()
    const doc = await uploadDocument(formData)
    return NextResponse.json({ success: true, document: doc })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    )
  }
}
