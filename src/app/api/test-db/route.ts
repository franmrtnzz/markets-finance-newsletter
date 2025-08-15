import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    const supabase = createServerClient()
    
    // Probar conexión básica
    console.log('Supabase client created')
    
    // Verificar si la tabla subscribers existe
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('*')
      .limit(1)
    
    if (subscribersError) {
      console.error('Error accessing subscribers table:', subscribersError)
      return NextResponse.json({ 
        error: 'Error accessing subscribers table',
        details: subscribersError.message,
        code: subscribersError.code
      }, { status: 500 })
    }
    
    console.log('Subscribers table accessible, count:', subscribers?.length || 0)
    
    // Verificar si la tabla issues existe
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('*')
      .limit(1)
    
    if (issuesError) {
      console.error('Error accessing issues table:', issuesError)
      return NextResponse.json({ 
        error: 'Error accessing issues table',
        details: issuesError.message,
        code: issuesError.code
      }, { status: 500 })
    }
    
    console.log('Issues table accessible, count:', issues?.length || 0)
    
    // Obtener estadísticas reales
    const { data: allSubscribers } = await supabase
      .from('subscribers')
      .select('*')
    
    const { data: allIssues } = await supabase
      .from('issues')
      .select('*')
    
    return NextResponse.json({
      message: 'Database connection successful',
      tables: {
        subscribers: {
          accessible: true,
          count: allSubscribers?.length || 0,
          sample: allSubscribers?.slice(0, 3) || []
        },
        issues: {
          accessible: true,
          count: allIssues?.length || 0,
          sample: allIssues?.slice(0, 3) || []
        }
      }
    })
    
  } catch (error) {
    console.error('Unexpected error testing database:', error)
    return NextResponse.json({ 
      error: 'Unexpected error testing database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 