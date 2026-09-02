// ─────────────────────────────────────────────────────────────────────────────
//  db.js  —  All database operations for Knockout Gym
//
//  SECURITY MODEL:
//  • kg_data      → PUBLIC read (website shows content), PRIVATE write (owner only)
//  • kg_members   → PRIVATE read+write (only authenticated owner)
//  • kg_enquiries → PUBLIC insert (contact form), PRIVATE read+delete (owner only)
//
//  The Supabase anon key in the browser can only do what RLS policies allow.
//  Member data is NEVER exposed to visitors — RLS blocks unauthenticated reads.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase, IS_DB_READY } from './supabase'
import defaultContent from '../data/defaultContent'

// ── localStorage fallback for local dev without Supabase ─────────────────────
const L = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb } catch { return fb } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch(e) { console.warn('Storage full', e) } }
}

// ─────────────────────────────────────────────────────────────────────────────
//  SITE CONTENT  (publicly readable, owner-only writable)
// ─────────────────────────────────────────────────────────────────────────────

export async function getContent() {
  if (!IS_DB_READY) return L.get('kg_content', null)
  const { data, error } = await supabase
    .from('kg_data').select('value').eq('key', 'content').maybeSingle()
  if (error) { console.error('getContent:', error.message); return L.get('kg_content', null) }
  return data?.value ?? null
}

export async function setContent(value) {
  if (!IS_DB_READY) { L.set('kg_content', value); return true }
  const { error } = await supabase
    .from('kg_data').upsert({ key: 'content', value }, { onConflict: 'key' })
  if (error) { console.error('setContent:', error.message); return false }
  return true
}

// ─────────────────────────────────────────────────────────────────────────────
//  MEMBERS  (owner-only — fully private)
// ─────────────────────────────────────────────────────────────────────────────

export async function getMembers() {
  if (!IS_DB_READY) return L.get('kg_members', [])
  const { data, error } = await supabase
    .from('kg_members').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('getMembers:', error.message)
    if (error.code === 'PGRST116' || error.message?.includes('policy')) return []
    return L.get('kg_members', [])
  }
  return data ?? []
}

export async function saveMember(member) {
  if (!IS_DB_READY) {
    const all = L.get('kg_members', [])
    if (member.id) { L.set('kg_members', all.map(m => m.id === member.id ? member : m)) }
    else { L.set('kg_members', [{ ...member, id: 'l_' + Date.now(), created_at: new Date().toISOString() }, ...all]) }
    return member
  }

  if (member.id) {
    const { data, error } = await supabase
      .from('kg_members').update(member).eq('id', member.id).select().single()
    if (error) { console.error('saveMember update:', error.message); return null }
    return data
  } else {
    const { id: _drop, ...rest } = member
    const { data, error } = await supabase
      .from('kg_members').insert({ ...rest, created_at: new Date().toISOString() }).select().single()
    if (error) { console.error('saveMember insert:', error.message); return null }
    return data
  }
}

export async function deleteMember(id) {
  if (!IS_DB_READY) { L.set('kg_members', L.get('kg_members', []).filter(m => m.id !== id)); return }
  const { error } = await supabase.from('kg_members').delete().eq('id', id)
  if (error) console.error('deleteMember:', error.message)
}

// ─────────────────────────────────────────────────────────────────────────────
//  ENQUIRIES  (public insert, owner-only read/delete)
// ─────────────────────────────────────────────────────────────────────────────

export async function addEnquiry({ name, phone, message }) {
  if (!IS_DB_READY) {
    const all = L.get('kg_enquiries', [])
    L.set('kg_enquiries', [{ name, phone, message, id: Date.now(), created_at: new Date().toISOString() }, ...all])
    return
  }
  const { error } = await supabase.from('kg_enquiries').insert({ name, phone, message })
  if (error) {
    console.error('addEnquiry:', error.message)
    // Fallback: save locally so enquiry isn't lost
    const all = L.get('kg_enquiries', [])
    L.set('kg_enquiries', [{ name, phone, message, id: Date.now() }, ...all])
  }
}

export async function getEnquiries() {
  if (!IS_DB_READY) return L.get('kg_enquiries', [])
  const { data, error } = await supabase
    .from('kg_enquiries').select('*').order('created_at', { ascending: false })
  if (error) { console.error('getEnquiries:', error.message); return [] }
  return data ?? []
}

export async function deleteEnquiry(id) {
  if (!IS_DB_READY) { L.set('kg_enquiries', L.get('kg_enquiries', []).filter(e => e.id !== id)); return }
  const { error } = await supabase.from('kg_enquiries').delete().eq('id', id)
  if (error) console.error('deleteEnquiry:', error.message)
}
