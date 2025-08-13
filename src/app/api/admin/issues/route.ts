import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    // Check admin session
    const cookieStore = cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get all issues ordered by creation date
    const { data: issues, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(issues)

  } catch (error) {
    console.error('Get issues error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin session
    const cookieStore = cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, preheader, source_url, content_md, content_html, slug } = body

    if (!title || (!content_md && !content_html)) {
      return NextResponse.json({ error: 'Título y contenido son requeridos' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Generate slug if not provided
    const finalSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const { data: existingIssue } = await supabase
      .from('issues')
      .select('id')
      .eq('slug', finalSlug)
      .single()

    if (existingIssue) {
      return NextResponse.json({ error: 'Ya existe un newsletter con ese slug' }, { status: 400 })
    }

    // Create new issue
    const issueData = {
      id: uuidv4(),
      slug: finalSlug,
      title,
      preheader: preheader || '',
      source_url: source_url || '',
      content_md: content_md || '',
      html: content_html || '',
      status: 'draft'
    }

    const { data: newIssue, error } = await supabase
      .from('issues')
      .insert(issueData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(newIssue, { status: 201 })

  } catch (error) {
    console.error('Create issue error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 