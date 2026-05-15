'use client'
import { useState, useRef, useEffect } from 'react'
import goldData from '@/data/gold_catalog.json'

/* ═══ TYPES ═══ */
type Screen = 'home' | 'catalog' | 'chat' | 'wardrobe' | 'profile' | 'faq'
type MainTab = 'home' | 'catalog' | 'chat' | 'wardrobe' | 'profile'
interface Msg { role: 'assistant' | 'user'; content: string; type?: string; product?: Prod; options?: string[] }
interface Prod { name: string; image_url: string; web_url: string; woo_id?: number; code?: string }
interface GItem { name: string; image_url: string; web_url: string; woo_id?: number; addedAt: string }
interface Lead { name: string; email: string; lead_id: string; session_id: string }
type RawProduct = { code?: string; name: string; gender?: string; scent_family?: string; in_stock?: boolean; image_url?: string; web_url?: string; woo_id?: number }

/* ═══ TOKENS ═══ */
const T = {
  ink: '#2B2640', soft: '#5E5878', muted: '#8A85A1',
  bg: 'linear-gradient(155deg,#FFFFFF 0%,#FDFCFE 50%,#FAFAFE 100%)',
  glass: 'rgba(255,255,255,0.42)', glassS: 'rgba(255,255,255,0.62)', glassE: 'rgba(255,255,255,0.85)',
  shadow: '0 12px 30px rgba(94,88,140,0.12)',
  neoO: '6px 6px 14px rgba(160,152,195,0.30),-6px -6px 14px rgba(255,255,255,0.95)',
  neoI: 'inset 4px 4px 10px rgba(160,152,195,0.22),inset -4px -4px 10px rgba(255,255,255,0.85)',
  accent: 'linear-gradient(135deg,#B9A5E8,#9FB4E0)',
}

/* ═══ CATALOG DATA ═══ */
const catalogProducts = (goldData as RawProduct[])
  .filter(p => p.in_stock !== false)
  .slice(0, 24)
  .map(p => ({
    code: p.code || '',
    name: p.name.split('–')[0].split('|')[0].trim(),
    gender: p.gender || 'unisex',
    scent: p.scent_family || '',
    img: p.image_url || '',
    url: p.web_url || '',
  }))

const scentFamilies = ['Tümü', ...Array.from(new Set(catalogProducts.map(p => p.scent).filter(Boolean)))]

/* ═══ SHARED COMPONENTS ═══ */
function Bg({ variant = 'a' }: { variant?: string }) {
  const sets: Record<string, Array<{top?:number;left?:number;right?:number;bottom?:number;w:number;h:number;c:string;o:number}>> = {
    a: [{top:-60,left:-80,w:320,h:320,c:'#EFE8F6',o:.35},{top:280,right:-100,w:280,h:280,c:'#E8EEF6',o:.30},{bottom:-120,left:-40,w:360,h:360,c:'#F2EDF7',o:.40}],
    b: [{top:-100,right:-60,w:340,h:340,c:'#F0E9F7',o:.35},{top:360,left:-120,w:320,h:320,c:'#E9EFF7',o:.30},{bottom:-80,right:-80,w:300,h:300,c:'#F3EEF8',o:.36}],
    c: [{top:120,left:-60,w:380,h:380,c:'#F0E9F7',o:.38},{top:280,right:-120,w:360,h:360,c:'#E9EFF7',o:.30}],
  }
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',background:T.bg}}>
      {(sets[variant]||sets.a).map((b,i)=>(
        <div key={i} style={{position:'absolute',top:b.top,left:b.left,right:b.right,bottom:b.bottom,width:b.w,height:b.h,borderRadius:'50%',background:b.c,opacity:b.o,filter:'blur(60px)'}}/>
      ))}
    </div>
  )
}

function BottleGlyph({size=44,hue='#D8CDEE'}:{size?:number;hue?:string}) {
  return (
    <svg width={size} height={size*1.35} viewBox="0 0 44 60" fill="none">
      <rect x="17" y="3" width="10" height="7" rx="1.2" fill="#FFF" stroke="#A89FC7" strokeOpacity=".5" strokeWidth="1"/>
      <rect x="19.5" y="10" width="5" height="4" fill="#FFF" stroke="#A89FC7" strokeOpacity=".45" strokeWidth="1"/>
      <path d="M8 22 Q8 14,18 14 L26 14 Q36 14,36 22 L36 50 Q36 56,30 56 L14 56 Q8 56,8 50 Z" fill={hue} stroke="#A89FC7" strokeOpacity=".35" strokeWidth="1"/>
      <rect x="14" y="34" width="16" height="8" rx="1.5" fill="#FFF" opacity=".5"/>
    </svg>
  )
}

function AsyaAvatar({size=32}:{size?:number}) {
  return (
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'linear-gradient(145deg,#FFFFFF,#D8CDEE)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.45,fontFamily:'"Cormorant Garamond",serif',fontStyle:'italic',fontWeight:600,color:T.soft,boxShadow:'0 0 0 1px rgba(255,255,255,0.85),0 4px 12px rgba(94,88,140,0.15)'}}>
      A
    </div>
  )
}

function ChatBubble({from,children}:{from:'asya'|'user';children:React.ReactNode}) {
  const isA = from==='asya'
  return (
    <div style={{display:'flex',justifyContent:isA?'flex-start':'flex-end',marginTop:8}}>
      <div style={{maxWidth:'78%',padding:'12px 16px',borderRadius:isA?'18px 18px 18px 6px':'18px 18px 6px 18px',background:isA?T.glassS:'linear-gradient(135deg,#C8B8E8,#B8CCE8)',backdropFilter:isA?'blur(14px)':undefined,WebkitBackdropFilter:isA?'blur(14px)':undefined,border:isA?`1px solid ${T.glassE}`:'none',boxShadow:isA?'0 6px 16px rgba(94,88,140,.10),inset 0 1px 0 rgba(255,255,255,.7)':'0 8px 18px rgba(140,120,200,.25)',fontSize:14.5,lineHeight:1.45,color:isA?T.ink:'#FFF',fontWeight:isA?400:500}}>
        {children}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span style={{display:'inline-flex',gap:5,alignItems:'center',padding:'4px 4px'}}>
      {[0,1,2].map(i=>(
        <span key={i} style={{width:7,height:7,borderRadius:'50%',background:T.muted,display:'inline-block',animation:`asyaDot 1.1s ${i*0.18}s infinite ease-in-out`}}/>
      ))}
    </span>
  )
}

function OptionChips({options,onSelect}:{options:string[];onSelect:(o:string)=>void}) {
  return (
    <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8,marginLeft:2}}>
      {options.map(opt=>(
        <button key={opt} onClick={()=>onSelect(opt)} style={{padding:'9px 16px',borderRadius:999,background:'rgba(255,255,255,0.55)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',border:`1px solid ${T.glassE}`,fontSize:13,color:T.ink,fontWeight:500,boxShadow:'0 3px 8px rgba(94,88,140,.08)',cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function ProductCard({product,cardType,coupon,onSave,saved}:{product:Prod;cardType:string;coupon?:string;onSave?:(p:Prod)=>void;saved?:boolean}) {
  const labels:Record<string,string> = {recommendation:'Sizin İçin Seçildi',elegancia:'Elegancia Premium',home:'Oda Kokusu'}
  const hues:Record<string,string> = {recommendation:'#E2D6F1',elegancia:'#D6E2F1',home:'#E2F1E2'}
  return (
    <div style={{background:'rgba(255,255,255,0.70)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:`1px solid ${T.glassE}`,borderRadius:22,overflow:'hidden',boxShadow:'0 12px 30px rgba(94,88,140,.10),inset 0 1px 0 rgba(255,255,255,.9)',maxWidth:340,marginTop:8}}>
      <div style={{padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.5)'}}>
        <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:999,fontSize:10,fontWeight:600,letterSpacing:'0.10em',textTransform:'uppercase',background:'linear-gradient(135deg,rgba(185,165,232,.15),rgba(159,180,224,.15))',border:'1px solid rgba(185,165,232,.30)',color:T.soft}}>
          {labels[cardType]||labels.recommendation}
        </span>
        {onSave && cardType!=='home' && (
          <button onClick={()=>onSave(product)} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,padding:'4px 10px',borderRadius:999,cursor:'pointer',fontFamily:'inherit',background:saved?'rgba(185,165,232,.15)':'rgba(0,0,0,.04)',color:saved?T.soft:T.muted,border:saved?'1px solid rgba(185,165,232,.3)':'1px solid rgba(0,0,0,.08)',transition:'all .2s'}}>
            {saved?'♥ Kayıtlı':'♡ Kaydet'}
          </button>
        )}
      </div>
      <div style={{padding:16,display:'flex',gap:14}}>
        <div style={{flexShrink:0}}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} style={{width:80,height:96,objectFit:'cover',borderRadius:16,boxShadow:'0 4px 16px rgba(0,0,0,.10)'}}/>
            : <div style={{width:80,height:96,borderRadius:16,background:`linear-gradient(160deg,${hues[cardType]||'#E2D6F1'},#FFF)`,display:'flex',alignItems:'center',justifyContent:'center'}}><BottleGlyph size={36} hue={hues[cardType]||'#E2D6F1'}/></div>
          }
        </div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:16,color:T.ink,margin:'0 0 6px',lineHeight:1.2}}>{product.name}</p>
          {coupon && (
            <div style={{padding:'8px 10px',borderRadius:12,background:'linear-gradient(135deg,rgba(185,165,232,.10),rgba(159,180,224,.10))',border:'1px solid rgba(185,165,232,.25)',marginBottom:8}}>
              <p style={{fontSize:10,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:T.soft,margin:0}}>%10 İndirim</p>
              <p style={{fontFamily:'monospace',fontWeight:700,fontSize:13,letterSpacing:'0.15em',color:T.ink,margin:'2px 0 0'}}>{coupon}</p>
            </div>
          )}
          <a href={product.web_url} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:999,fontSize:12,fontWeight:500,color:'#FFF',background:T.accent,textDecoration:'none',border:'none',cursor:'pointer',marginTop:4}}>
            {cardType==='home'?'İncele':'Hemen İncele'} →
          </a>
        </div>
      </div>
    </div>
  )
}

/* ═══ CHAT LOGIC HOOK ═══ */
function useChatLogic() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [chatPhase, setChatPhase] = useState<'register'|'chat'>('register')
  const [lead, setLead] = useState<Lead|null>(null)
  const [gardrop, setGardrop] = useState<GItem[]>([])
  const [coupon, setCoupon] = useState<string|null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const emailSentRef = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    try { setGardrop(JSON.parse(localStorage.getItem('asya_gardrop')||'[]')) } catch {}
    try {
      const s = localStorage.getItem('asya_lead')
      if (s) { const l = JSON.parse(s); setLead(l) }
    } catch {}
  },[])

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:'smooth'})
  },[messages,loading])

  const saveToGardrop = (p:Prod) => {
    const item:GItem = {name:p.name,image_url:p.image_url,web_url:p.web_url,woo_id:p.woo_id,addedAt:new Date().toISOString()}
    const next = [item,...gardrop.filter(g=>g.name!==p.name)]
    setGardrop(next)
    localStorage.setItem('asya_gardrop',JSON.stringify(next))
  }

  const isInGardrop = (name:string) => gardrop.some(g=>g.name===name)

  const handleRegister = async (name:string, email:string) => {
    try {
      const res = await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,mode:'koku_testi'})})
      const data = await res.json()
      const newLead:Lead = {name,email,lead_id:data.lead_id,session_id:data.session_id}
      setLead(newLead)
      localStorage.setItem('asya_lead',JSON.stringify(newLead))
      setChatPhase('chat')
      await sendMessage('',newLead,[])
    } catch {
      setChatPhase('chat')
      await sendMessage('',null,[])
    }
  }

  const sendMessage = async (text:string, currentLead?:Lead|null, currentMsgs?:Msg[]) => {
    const l = currentLead !== undefined ? currentLead : lead
    const msgs = currentMsgs !== undefined ? currentMsgs : messages
    const newMsgs:Msg[] = text ? [...msgs,{role:'user',content:text}] : msgs
    if (text) setMessages(newMsgs)
    setLoading(true)
    setInput('')
    try {
      const res = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:newMsgs,session_id:l?.session_id})})
      const data = await res.json()
      const parsed = JSON.parse(data.response)
      const assistantMsg:Msg = {role:'assistant',content:parsed.output,type:parsed.type,product:parsed.product,options:parsed.options}
      const finalMsgs = [...newMsgs,assistantMsg]
      setMessages(finalMsgs)
      if (parsed.type==='recommendation' && l && !emailSentRef.current) {
        emailSentRef.current = true
        let cpn:string|null = null
        try {
          const cr = await fetch('/api/coupon',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lead_id:l.lead_id})})
          const cd = await cr.json(); cpn = cd.coupon||null
        } catch {}
        setCoupon(cpn)
        fetch('/api/send-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lead_id:l.lead_id,name:l.name,email:l.email,product:parsed.product,coupon:cpn,session_id:l.session_id})}).catch(()=>{})
      }
    } catch (e) {
      setMessages(m=>[...m,{role:'assistant',content:'Bir sorun oluştu, tekrar dener misin?'}])
    }
    setLoading(false)
  }

  const send = (text:string) => { if (!text.trim()||loading) return; sendMessage(text) }
  const reset = () => { setMessages([]); setChatPhase('register'); emailSentRef.current=false; setCoupon(null) }

  return { messages, chatPhase, lead, gardrop, coupon, input, setInput, loading, bottomRef, handleRegister, send, saveToGardrop, isInGardrop, reset }
}

/* ═══ REGISTER FORM ═══ */
function RegisterForm({onSubmit,isDesktop}:{onSubmit:(name:string,email:string)=>void;isDesktop?:boolean}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const valid = name.trim().length>=2 && /.+@.+\..+/.test(email)
  const submit = async (e:React.FormEvent) => {
    e.preventDefault()
    if (!valid||submitting) return
    setSubmitting(true)
    onSubmit(name,email)
  }
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:isDesktop?'32px 40px':'24px 28px'}}>
      <AsyaAvatar size={isDesktop?56:72}/>
      <h2 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:isDesktop?28:32,color:T.ink,textAlign:'center',margin:'16px 0 8px',lineHeight:1.15}}>
        Önce <em style={{fontStyle:'italic'}}>kısaca tanışalım</em>
      </h2>
      <p style={{fontSize:13,color:T.soft,textAlign:'center',maxWidth:300,lineHeight:1.55,margin:'0 0 24px'}}>
        Size özel koku önerileri için adınızı ve e-postanızı paylaşır mısınız?
      </p>
      <form onSubmit={submit} style={{width:'100%',maxWidth:360}}>
        <div style={{padding:22,borderRadius:24,background:T.glassS,backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',border:`1px solid ${T.glassE}`,boxShadow:'0 14px 36px rgba(94,88,140,.14),inset 0 1px 0 rgba(255,255,255,.85)'}}>
          <NeoField label="İSİM" placeholder="örn. Selin Yıldız" value={name} onChange={setName}/>
          <div style={{height:12}}/>
          <NeoField label="E-POSTA" placeholder="selin@ornek.com" value={email} onChange={setEmail} type="email"/>
          <p style={{fontSize:11,color:T.muted,margin:'12px 0 0',lineHeight:1.4,display:'flex',gap:6}}>
            <span style={{flexShrink:0}}>🔒</span>
            Bilgileriniz yalnızca koku önerileri için kullanılır.
          </p>
        </div>
        <button type="submit" disabled={!valid||submitting} style={{width:'100%',marginTop:16,height:56,borderRadius:999,border:'none',background:valid?T.accent:T.glassS,backdropFilter:valid?undefined:'blur(16px)',color:valid?'#FFF':T.soft,fontSize:15,fontWeight:500,cursor:valid?'pointer':'not-allowed',fontFamily:'inherit',boxShadow:valid?'0 14px 30px rgba(140,120,200,.30)':T.shadow,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 10px 0 24px',transition:'all .2s',opacity:submitting?.7:1}}>
          <span>Sohbete Başla</span>
          <div style={{width:42,height:42,borderRadius:'50%',background:valid?'rgba(255,255,255,.25)':'linear-gradient(145deg,#FFF,#E2DAEE)',boxShadow:valid?undefined:T.neoO,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke={valid?'#FFF':T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </button>
      </form>
    </div>
  )
}

function NeoField({label,placeholder,value,onChange,type='text'}:{label:string;placeholder:string;value:string;onChange:(v:string)=>void;type?:string}) {
  const [focused,setFocused] = useState(false)
  return (
    <label style={{display:'block'}}>
      <div style={{fontSize:10,letterSpacing:'0.22em',fontWeight:600,color:T.muted,marginBottom:6}}>{label}</div>
      <div style={{height:50,borderRadius:16,background:'#FFF',boxShadow:focused?`inset 0 0 0 1.5px #B9A5E8,${T.neoI}`:T.neoI,display:'flex',alignItems:'center',padding:'0 16px',gap:10,transition:'box-shadow .2s'}}>
        <input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:14,color:T.ink,fontFamily:'inherit'}}/>
      </div>
    </label>
  )
}

/* ═══ CHAT PANEL (shared) ═══ */
function ChatPanel({chatLogic,onGoProfile,isDesktop}:{chatLogic:ReturnType<typeof useChatLogic>;onGoProfile?:()=>void;isDesktop?:boolean}) {
  const {messages,chatPhase,lead,coupon,input,setInput,loading,bottomRef,handleRegister,send,saveToGardrop,isInGardrop} = chatLogic
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const handleKey = (e:React.KeyboardEvent) => { if (e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(input)} }

  if (chatPhase==='register') {
    return <RegisterForm onSubmit={handleRegister} isDesktop={isDesktop}/>
  }

  return (
    <>
      <div style={{flex:1,overflowY:'auto',padding:isDesktop?'18px 22px':'12px 18px',display:'flex',flexDirection:'column'}}>
        {messages.map((msg,i)=>(
          <div key={i}>
            {msg.role==='assistant' ? (
              <div>
                <div style={{display:'flex',gap:10,alignItems:'flex-end'}}>
                  <AsyaAvatar size={isDesktop?32:28}/>
                  <ChatBubble from="asya">{msg.content}</ChatBubble>
                </div>
                {msg.options && !msg.product && (
                  <div style={{paddingLeft:isDesktop?42:38}}>
                    <OptionChips options={msg.options} onSelect={o=>send(o)}/>
                  </div>
                )}
                {msg.product && (
                  <div style={{paddingLeft:isDesktop?42:38}}>
                    <ProductCard product={msg.product} cardType={msg.type||'recommendation'} coupon={msg.type==='recommendation'?coupon||undefined:undefined} onSave={msg.type!=='home'?saveToGardrop:undefined} saved={isInGardrop(msg.product.name)}/>
                    {msg.type==='recommendation' && onGoProfile && (
                      <button onClick={onGoProfile} style={{marginTop:10,padding:'14px 18px',borderRadius:20,border:'none',background:'linear-gradient(135deg,rgba(185,165,232,.95),rgba(159,180,224,.95))',boxShadow:'0 14px 28px rgba(140,120,200,.28)',display:'flex',alignItems:'center',gap:12,cursor:'pointer',fontFamily:'inherit',textAlign:'left',position:'relative',overflow:'hidden',maxWidth:320}}>
                        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 0% 0%,rgba(255,255,255,.35),transparent 60%)',pointerEvents:'none'}}/>
                        <div style={{width:40,height:40,borderRadius:12,background:'rgba(255,255,255,.22)',border:'1px solid rgba(255,255,255,.35)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,position:'relative',zIndex:1}}>
                          <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="6" stroke="#FFF" strokeWidth="1.6"/><circle cx="11" cy="11" r="9.2" stroke="#FFF" strokeOpacity=".5" strokeWidth="1.6"/><circle cx="11" cy="11" r="1.6" fill="#FFF"/></svg>
                        </div>
                        <div style={{flex:1,position:'relative',zIndex:1}}>
                          <div style={{fontSize:10,letterSpacing:'0.22em',color:'rgba(255,255,255,.85)',fontWeight:600,textTransform:'uppercase'}}>Koku Portreniz Hazır</div>
                          <div style={{marginTop:2,fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:18,color:'#FFF',lineHeight:1.1}}>Koku Profilinizi Görün →</div>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <ChatBubble from="user">{msg.content}</ChatBubble>
            )}
          </div>
        ))}
        {loading && (
          <div style={{display:'flex',gap:10,alignItems:'flex-end',marginTop:8}}>
            <AsyaAvatar size={isDesktop?32:28}/>
            <div style={{padding:'12px 16px',background:T.glassS,backdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,borderRadius:'18px 18px 18px 6px',boxShadow:'0 6px 16px rgba(94,88,140,.10)'}}>
              <TypingDots/>
            </div>
          </div>
        )}
        <div ref={bottomRef} style={{height:4}}/>
      </div>

      <div style={{flexShrink:0,padding:isDesktop?'10px 18px 18px':'8px 16px 28px',display:'flex',gap:10,alignItems:'flex-end',background:'rgba(255,255,255,.55)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',borderTop:'1px solid rgba(255,255,255,.5)'}}>
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} placeholder="ASYA'ya bir mesaj yazın…" disabled={loading} rows={1}
          style={{flex:1,resize:'none',background:'rgba(255,255,255,.62)',border:`1.5px solid ${loading?'rgba(255,255,255,.85)':'rgba(185,165,232,.4)'}`,borderRadius:16,padding:'12px 16px',fontSize:14,fontFamily:'inherit',color:T.ink,outline:'none',lineHeight:1.5,minHeight:48,maxHeight:100,transition:'border-color .2s'}}/>
        <button onClick={()=>send(input)} disabled={loading||!input.trim()}
          style={{width:48,height:48,borderRadius:'50%',border:'none',flexShrink:0,cursor:loading||!input.trim()?'default':'pointer',background:'linear-gradient(145deg,#FFF,#DED4ED)',boxShadow:loading||!input.trim()?'none':T.neoO,display:'flex',alignItems:'center',justifyContent:'center',opacity:loading||!input.trim()?.4:1,transition:'all .15s'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.soft} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </>
  )
}

/* ════════════════════════════════════════════
   MOBILE APP
════════════════════════════════════════════ */
function MobileWelcome({onAdvance}:{onAdvance:()=>void}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragX,setDragX] = useState(0)
  const [dragging,setDragging] = useState(false)
  const onDown = (e:React.PointerEvent)=>{setDragging(true);(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)}
  const onMove = (e:React.PointerEvent)=>{
    if(!dragging||!trackRef.current)return
    const r=trackRef.current.getBoundingClientRect()
    setDragX(Math.max(0,Math.min(r.width-58,e.clientX-r.left-29)))
  }
  const onUp = ()=>{
    if(!trackRef.current)return setDragging(false)
    const r=trackRef.current.getBoundingClientRect()
    if(dragX>r.width-58-8){setDragX(r.width-58);setTimeout(()=>{onAdvance();setDragX(0)},160)}else setDragX(0)
    setDragging(false)
  }
  return (
    <div style={{position:'fixed',inset:0,display:'flex',flexDirection:'column',alignItems:'center',paddingTop:80,fontFamily:'Inter,sans-serif',background:T.bg,overflow:'hidden'}}>
      <Bg variant="a"/>
      <p style={{position:'relative',zIndex:2,fontSize:11,letterSpacing:'0.28em',textTransform:'uppercase',fontWeight:500,color:T.muted}}>Elegance VIP · Koku Asistanı</p>
      <div style={{position:'relative',zIndex:2,marginTop:32,width:260,height:340,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
        <div style={{position:'absolute',inset:-24,borderRadius:'50%',background:'radial-gradient(ellipse at 50% 35%,rgba(244,238,252,.95),transparent 65%)',filter:'blur(10px)'}}/>
        <div style={{position:'relative',zIndex:1,width:224,height:300,borderRadius:22,boxShadow:'0 30px 60px rgba(94,88,140,.18),0 0 0 1px rgba(255,255,255,.6)',overflow:'hidden',background:'linear-gradient(160deg,#F0E9F7,#E3ECF5)'}}>
          <img src="/asya-portrait.png" alt="ASYA" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
          <div style={{position:'absolute',left:0,right:0,bottom:0,height:100,background:'linear-gradient(to bottom,transparent,#FAFAFE 95%)',pointerEvents:'none'}}/>
        </div>
      </div>
      <h1 style={{position:'relative',zIndex:2,fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:42,color:T.ink,letterSpacing:'-0.01em',margin:'20px 0 4px',textAlign:'center'}}>ASYA ile Tanışın</h1>
      <p style={{position:'relative',zIndex:2,fontSize:13,letterSpacing:'0.18em',textTransform:'uppercase',fontWeight:500,color:T.soft,margin:0}}>Koku Mimarı</p>
      <div style={{flex:1}}/>
      <div ref={trackRef} style={{position:'relative',zIndex:2,width:280,height:64,marginBottom:56,borderRadius:999,background:T.glassS,backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:`1px solid ${T.glassE}`,boxShadow:T.shadow,display:'flex',alignItems:'center',justifyContent:'center',userSelect:'none',touchAction:'none'}}>
        <span style={{fontSize:13,letterSpacing:'0.20em',color:T.soft,textTransform:'uppercase',fontWeight:500,opacity:Math.max(0,1-dragX/110)}}>Başlamak için kaydır</span>
        <div style={{position:'absolute',left:3,top:3,height:58,width:dragX+58,borderRadius:999,background:'linear-gradient(90deg,rgba(185,165,232,.45),rgba(159,180,224,.45))',transition:dragging?'none':'width .25s ease',pointerEvents:'none'}}/>
        <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} style={{position:'absolute',left:3+dragX,top:3,width:58,height:58,borderRadius:'50%',background:'linear-gradient(145deg,#FFF,#E8E2F0)',boxShadow:T.neoO,display:'flex',alignItems:'center',justifyContent:'center',cursor:'grab',transition:dragging?'none':'left .25s ease'}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M7 5l6 6-6 6" stroke={T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 5l6 6-6 6" stroke={T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity=".5"/></svg>
        </div>
      </div>
    </div>
  )
}

const mTabs = [
  {id:'home',label:'Ana Sayfa',g:(a:boolean)=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10l7-6 7 6v6a1 1 0 0 1-1 1h-3v-5h-6v5H4a1 1 0 0 1-1-1z" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4" strokeLinejoin="round"/></svg>},
  {id:'catalog',label:'Koleksiyon',g:(a:boolean)=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.2" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4"/><rect x="11" y="3" width="6" height="6" rx="1.2" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4"/><rect x="3" y="11" width="6" height="6" rx="1.2" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4"/><rect x="11" y="11" width="6" height="6" rx="1.2" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4"/></svg>},
  {id:'chat',label:'Sohbet',g:(a:boolean)=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 9.5C3 6 6 4 10 4s7 2 7 5.5S14 15 10 15c-.7 0-1.4-.06-2-.18L5 16l.5-2.4A5 5 0 0 1 3 9.5z" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4" strokeLinejoin="round"/></svg>},
  {id:'wardrobe',label:'Gardırop',g:(a:boolean)=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 7.2a1.7 1.7 0 1 1 1.7-1.7" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4" strokeLinecap="round"/><path d="M10 7.2v1.5L2 14h16L10 8.7" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4" strokeLinejoin="round"/></svg>},
  {id:'profile',label:'Profil',g:(a:boolean)=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4"/><path d="M3 17c.8-3.4 3.7-5 7-5s6.2 1.6 7 5" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4" strokeLinecap="round"/></svg>},
] as const

function MobileTabBar({active,onChange}:{active:MainTab;onChange:(t:MainTab)=>void}) {
  return (
    <div style={{position:'absolute',left:14,right:14,bottom:22,zIndex:10,padding:'8px 6px',borderRadius:999,background:'rgba(255,255,255,.78)',backdropFilter:'blur(22px) saturate(1.3)',WebkitBackdropFilter:'blur(22px) saturate(1.3)',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 18px 40px rgba(94,88,140,.18),inset 0 1px 0 rgba(255,255,255,.9)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      {mTabs.map(t=>{
        const isA = active===t.id
        return (
          <button key={t.id} onClick={()=>onChange(t.id as MainTab)} style={{flex:1,padding:'8px 4px',borderRadius:999,border:'none',background:isA?T.accent:'transparent',boxShadow:isA?'0 6px 14px rgba(140,120,200,.25)':'none',display:'flex',flexDirection:'column',alignItems:'center',gap:2,cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}}>
            {t.g(isA)}
            <span style={{fontSize:9.5,fontWeight:isA?600:500,color:isA?'#FFF':T.muted,letterSpacing:'0.04em'}}>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}

const dashTiles = [
  {title:'Koku Profilini',titleB:'Keşfet',g:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="6" stroke="#5E5878" strokeWidth="1.4"/><circle cx="14" cy="14" r="10.5" stroke="#5E5878" strokeWidth="1.4" opacity=".45"/><circle cx="14" cy="14" r="1.6" fill="#5E5878"/></svg>},
  {title:'Muadil',titleB:'Bul',g:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><rect x="6" y="9" width="7" height="14" rx="1.5" stroke="#5E5878" strokeWidth="1.4"/><rect x="15" y="5" width="7" height="18" rx="1.5" stroke="#5E5878" strokeWidth="1.4" opacity=".55"/></svg>},
  {title:'Hediye',titleB:'Sihirbazı',g:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><rect x="5" y="11" width="18" height="12" rx="1.5" stroke="#5E5878" strokeWidth="1.4"/><path d="M5 15h18M14 11v12" stroke="#5E5878" strokeWidth="1.4"/></svg>},
  {title:'Günün',titleB:'İlhamı',g:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="4.5" stroke="#5E5878" strokeWidth="1.4"/><path d="M14 3v3M14 22v3M3 14h3M22 14h3" stroke="#5E5878" strokeWidth="1.4" strokeLinecap="round"/></svg>},
]

function MobileHome({lead,onGoChat}:{lead:Lead|null;onGoChat:()=>void}) {
  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:108}}>
      <Bg variant="b"/>
      <div style={{position:'relative',zIndex:2,padding:'70px 28px 0'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:40}}>
          <div style={{padding:'10px 18px',borderRadius:999,background:T.glassS,backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 4px 12px rgba(94,88,140,.08)',fontSize:13,fontWeight:500,color:T.ink,display:'flex',alignItems:'center',gap:8}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke={T.soft} strokeWidth="1.4" strokeLinecap="round"/></svg>
            Koku Testi
          </div>
        </div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:36,lineHeight:1.08,color:T.ink,letterSpacing:'-0.01em',margin:'0 0 12px'}}>
          Selam{lead?`, ${lead.name.split(' ')[0]}`:''},<br/>Ben <em style={{fontStyle:'italic'}}>ASYA</em>.<br/>Bugün ruhunuzu<br/>yansıtacak kokuyu<br/>bulalım.
        </h1>
        <p style={{fontSize:13.5,color:T.soft,lineHeight:1.55,margin:'0 0 24px'}}>Koku dünyanızı keşfetmek için bir seçenek belirleyin:</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
          {dashTiles.map((t,i)=>(
            <button key={i} onClick={onGoChat} style={{height:108,padding:'14px 16px',borderRadius:22,background:T.glass,backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',border:`1px solid ${T.glassE}`,boxShadow:'0 10px 24px rgba(94,88,140,.10),inset 0 1px 0 rgba(255,255,255,.8)',display:'flex',flexDirection:'column',justifyContent:'space-between',cursor:'pointer',fontFamily:'inherit',textAlign:'left'}}>
              <div>{t.g}</div>
              <div style={{fontSize:14,fontWeight:500,lineHeight:1.2,color:T.ink}}>{t.title}<br/>{t.titleB}</div>
            </button>
          ))}
        </div>
        <button onClick={onGoChat} style={{width:'100%',height:60,borderRadius:999,padding:'0 10px 0 24px',background:T.glassS,backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:`1px solid ${T.glassE}`,boxShadow:T.shadow,display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',fontFamily:'inherit',marginBottom:20}}>
          <span style={{fontSize:15,color:T.ink,fontWeight:500}}>ASYA ile sohbete başla</span>
          <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(145deg,#FFF,#E2DAEE)',boxShadow:T.neoO,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none"><rect x="5" y="2" width="6" height="10" rx="3" stroke={T.soft} strokeWidth="1.4"/><path d="M2 9a6 6 0 0 0 12 0M8 15v3M5 18h6" stroke={T.soft} strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
        </button>
      </div>
    </div>
  )
}

function MobileChat({chatLogic,onGoProfile}:{chatLogic:ReturnType<typeof useChatLogic>;onGoProfile:()=>void}) {
  return (
    <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',zIndex:5}}>
      <Bg variant="c"/>
      <div style={{position:'relative',zIndex:3,padding:'60px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'6px 14px 6px 6px',borderRadius:999,background:T.glassS,backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 4px 12px rgba(94,88,140,.08)'}}>
          <AsyaAvatar size={30}/>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:T.ink}}>ASYA</div>
            <div style={{fontSize:10.5,color:T.muted,display:'flex',alignItems:'center',gap:4}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#7FB48C',display:'inline-block'}}/>çevrimiçi
            </div>
          </div>
        </div>
        <button onClick={chatLogic.reset} style={{padding:'8px 14px',borderRadius:999,background:T.glassS,backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 4px 12px rgba(94,88,140,.08)',fontSize:13,fontWeight:500,color:T.soft,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:6}}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke={T.soft} strokeWidth="1.5" strokeLinecap="round"/></svg>
          Yeni
        </button>
      </div>
      <div style={{position:'relative',zIndex:2,flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <ChatPanel chatLogic={chatLogic} onGoProfile={onGoProfile}/>
      </div>
    </div>
  )
}

function MobileCatalog() {
  const [filter,setFilter] = useState('Tümü')
  const filtered = filter==='Tümü' ? catalogProducts : catalogProducts.filter(p=>p.scent===filter)
  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:108}}>
      <Bg variant="b"/>
      <div style={{position:'relative',zIndex:2,padding:'70px 20px 0'}}>
        <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>Elegance VIP</div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:34,color:T.ink,letterSpacing:'-0.01em',margin:'0 0 20px'}}>Koku <em style={{fontStyle:'italic'}}>Koleksiyonu</em></h1>
        <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:12,marginBottom:16}}>
          {scentFamilies.map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 16px',borderRadius:999,border:'none',background:f===filter?T.accent:'rgba(255,255,255,.7)',color:f===filter?'#FFF':T.soft,fontSize:13,fontWeight:f===filter?600:500,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',boxShadow:f===filter?'0 6px 14px rgba(140,120,200,.25)':undefined,flexShrink:0}}>
              {f}
            </button>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {filtered.map((p,i)=>(
            <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',padding:14,borderRadius:20,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 8px 22px rgba(94,88,140,.08)',display:'block'}}>
              <div style={{height:130,borderRadius:14,background:'linear-gradient(160deg,#E2D6F1,#FFF)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10,position:'relative',overflow:'hidden'}}>
                {p.img ? <img src={p.img} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={60} hue="#E2D6F1"/>}
              </div>
              <div style={{fontSize:10,letterSpacing:'0.14em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>{p.scent}</div>
              <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:17,color:T.ink,lineHeight:1.15,marginTop:2}}>{p.name}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function MobileWardrobe({gardrop}:{gardrop:GItem[]}) {
  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:108}}>
      <Bg variant="d"/>
      <div style={{position:'relative',zIndex:2,padding:'70px 28px 0'}}>
        <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>Koleksiyonunuz</div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:34,color:T.ink,letterSpacing:'-0.01em',margin:'0 0 8px'}}>Koku <em style={{fontStyle:'italic'}}>Gardırobum</em></h1>
        <p style={{fontSize:13.5,color:T.soft,lineHeight:1.55,margin:'0 0 24px'}}>Beğendiğiniz kokuları buraya kaydedin.</p>
        {gardrop.length===0 ? (
          <div style={{textAlign:'center',padding:'60px 20px',background:'rgba(255,255,255,.55)',backdropFilter:'blur(14px)',borderRadius:22,border:`1px solid ${T.glassE}`}}>
            <BottleGlyph size={48} hue="#E2D6F1"/>
            <p style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:22,color:T.ink,margin:'16px 0 6px'}}>Gardırobunuz boş</p>
            <p style={{fontSize:13,color:T.soft}}>ASYA ile sohbet ederek koku öneri alın ve kaydedin.</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {gardrop.map((item,i)=>(
              <div key={i} style={{padding:16,borderRadius:20,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 8px 22px rgba(94,88,140,.08)',display:'flex',gap:14,alignItems:'center'}}>
                <div style={{width:56,height:68,borderRadius:14,background:'linear-gradient(160deg,#E2D6F1,#FFF)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'}}>
                  {item.image_url ? <img src={item.image_url} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={28} hue="#E2D6F1"/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:18,color:T.ink,lineHeight:1.15}}>{item.name}</div>
                  <a href={item.web_url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:T.soft,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4,marginTop:4}}>İncele →</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MobileProfile({lead,coupon}:{lead:Lead|null;coupon:string|null}) {
  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:108}}>
      <Bg variant="a"/>
      <div style={{position:'relative',zIndex:2,padding:'70px 28px 0'}}>
        {!lead ? (
          <div style={{textAlign:'center',paddingTop:60}}>
            <AsyaAvatar size={72}/>
            <h2 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:28,color:T.ink,margin:'20px 0 10px'}}>Koku Profiliniz</h2>
            <p style={{fontSize:13.5,color:T.soft,lineHeight:1.55}}>ASYA ile sohbet ettikten sonra<br/>kişisel koku profiliniz burada görünür.</p>
          </div>
        ) : (
          <>
            <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>{lead.name}'in Koku Portresi</div>
            <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:34,color:T.ink,letterSpacing:'-0.01em',margin:'0 0 24px'}}>Koku <em style={{fontStyle:'italic'}}>Profilim</em></h1>
            {coupon && (
              <div style={{padding:20,borderRadius:20,background:'linear-gradient(135deg,#2B2640 0%,#3E3458 60%,#5B4A82 100%)',boxShadow:'0 18px 36px rgba(43,38,64,.30)',color:'#FFF',marginBottom:20,position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 110% -20%,rgba(232,222,243,.35),transparent 55%)',pointerEvents:'none'}}/>
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{fontSize:10,letterSpacing:'0.22em',color:'rgba(255,255,255,.7)',fontWeight:600,textTransform:'uppercase',marginBottom:6}}>ASYA'ya Özel Hediye</div>
                  <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:26,color:'#FFF',lineHeight:1.05,marginBottom:14}}>İlk Kokunuzda <em style={{fontStyle:'italic'}}>%10</em> İndirim</div>
                  <div style={{display:'inline-flex',alignItems:'center',gap:12,padding:'10px 16px',borderRadius:12,background:'rgba(255,255,255,.10)',border:'1px dashed rgba(255,255,255,.35)'}}>
                    <span style={{fontFamily:'monospace',fontWeight:600,fontSize:16,color:'#FFF',letterSpacing:'0.18em'}}>{coupon}</span>
                    <button onClick={()=>navigator.clipboard?.writeText(coupon)} style={{padding:'6px 12px',borderRadius:999,border:'none',background:'#FFF',color:'#2B2640',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Kopyala</button>
                  </div>
                </div>
              </div>
            )}
            <div style={{padding:20,borderRadius:20,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 8px 22px rgba(94,88,140,.08)'}}>
              <p style={{fontSize:13.5,color:T.soft,lineHeight:1.6,margin:0}}>Koku profiliniz sohbet geçmişinize göre oluşturulur. ASYA ile konuşmaya devam ederek profilinizi zenginleştirin.</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MobileApp() {
  const [mobileScreen,setMobileScreen] = useState<'welcome'|'app'>('welcome')
  const [activeTab,setActiveTab] = useState<MainTab>('home')
  const chatLogic = useChatLogic()
  const {lead,gardrop,coupon} = chatLogic

  if (mobileScreen==='welcome') return <MobileWelcome onAdvance={()=>setMobileScreen('app')}/>

  const goChat = () => setActiveTab('chat')

  return (
    <div style={{position:'fixed',inset:0,overflow:'hidden',fontFamily:'Inter,sans-serif'}}>
      <div style={{position:'absolute',inset:0}}>
        {activeTab==='home' && <MobileHome lead={lead} onGoChat={goChat}/>}
        {activeTab==='catalog' && <MobileCatalog/>}
        {activeTab==='chat' && <MobileChat chatLogic={chatLogic} onGoProfile={()=>setActiveTab('profile')}/>}
        {activeTab==='wardrobe' && <MobileWardrobe gardrop={gardrop}/>}
        {activeTab==='profile' && <MobileProfile lead={lead} coupon={coupon}/>}
      </div>
      {activeTab!=='chat' && <MobileTabBar active={activeTab} onChange={setActiveTab}/>}
      {activeTab==='chat' && (
        <div style={{position:'absolute',bottom:16,left:'50%',transform:'translateX(-50%)',zIndex:20}}>
          <button onClick={()=>setActiveTab('home')} style={{padding:'8px 20px',borderRadius:999,background:'rgba(255,255,255,.85)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 4px 14px rgba(94,88,140,.12)',fontSize:12,fontWeight:500,color:T.soft,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:6}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke={T.soft} strokeWidth="1.5" strokeLinecap="round"/></svg>
            Kapat
          </button>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════
   DESKTOP APP
════════════════════════════════════════════ */
const dNavItems = [
  {id:'home' as Screen,label:'Ana Sayfa',g:(a:boolean)=><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 10l7-6 7 6v6a1 1 0 0 1-1 1h-3v-5h-6v5H4a1 1 0 0 1-1-1z" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4" strokeLinejoin="round"/></svg>},
  {id:'catalog' as Screen,label:'Koleksiyon',g:(a:boolean)=><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.2" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4"/><rect x="11" y="3" width="6" height="6" rx="1.2" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4"/><rect x="3" y="11" width="6" height="6" rx="1.2" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4"/><rect x="11" y="11" width="6" height="6" rx="1.2" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4"/></svg>},
  {id:'chat' as Screen,label:'ASYA · Sohbet',g:(a:boolean)=><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 9.5C3 6 6 4 10 4s7 2 7 5.5S14 15 10 15c-.7 0-1.4-.06-2-.18L5 16l.5-2.4A5 5 0 0 1 3 9.5z" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4" strokeLinejoin="round"/></svg>},
  {id:'wardrobe' as Screen,label:'Koku Gardırobum',g:(a:boolean)=><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 7.2a1.7 1.7 0 1 1 1.7-1.7" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4" strokeLinecap="round"/><path d="M10 7.2v1.5L2 14h16L10 8.7" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4" strokeLinejoin="round"/></svg>},
  {id:'profile' as Screen,label:'Koku Profilim',g:(a:boolean)=><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4"/><path d="M3 17c.8-3.4 3.7-5 7-5s6.2 1.6 7 5" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4" strokeLinecap="round"/></svg>},
]

function DesktopSidebar({active,onChange,lead}:{active:Screen;onChange:(s:Screen)=>void;lead:Lead|null}) {
  return (
    <aside style={{width:240,padding:'32px 18px',boxSizing:'border-box',borderRight:'1px solid rgba(94,88,140,.08)',display:'flex',flexDirection:'column',background:'rgba(255,255,255,.55)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',position:'relative',zIndex:2,flexShrink:0}}>
      <div style={{padding:'0 8px 28px'}}>
        <div style={{fontSize:9,letterSpacing:'0.32em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>Elegance · VIP</div>
        <div style={{marginTop:2,fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:24,color:T.ink,lineHeight:1,letterSpacing:'-0.01em'}}>Perfume <em style={{fontStyle:'italic'}}>Maison</em></div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:2}}>
        {dNavItems.map(it=>{
          const isA=it.id===active
          return (
            <button key={it.id} onClick={()=>onChange(it.id)} style={{padding:'10px 12px',borderRadius:12,border:'none',background:isA?'rgba(185,165,232,.18)':'transparent',display:'flex',alignItems:'center',gap:12,fontSize:13.5,fontWeight:isA?600:500,color:isA?T.ink:T.soft,cursor:'pointer',fontFamily:'inherit',textAlign:'left',transition:'background .15s',width:'100%'}}>
              {it.g(isA)}
              {it.label}
              {isA && <div style={{marginLeft:'auto',width:4,height:4,borderRadius:'50%',background:'#B9A5E8'}}/>}
            </button>
          )
        })}
      </div>
      <div style={{marginTop:24,padding:'12px 4px',borderTop:'1px solid rgba(94,88,140,.08)'}}>
        <div style={{fontSize:9,letterSpacing:'0.22em',color:T.muted,fontWeight:600,textTransform:'uppercase',padding:'0 8px 10px'}}>Daha Fazlası</div>
        {['Hediye Sihirbazı','Hakkımızda · SSS'].map(s=>(
          <button key={s} style={{width:'100%',padding:'8px 12px',borderRadius:10,border:'none',background:'transparent',textAlign:'left',fontSize:12.5,fontWeight:500,color:T.soft,cursor:'pointer',fontFamily:'inherit'}}>{s}</button>
        ))}
      </div>
      <div style={{flex:1}}/>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:10,borderRadius:14,background:'rgba(255,255,255,.65)',border:`1px solid ${T.glassE}`,boxShadow:'0 4px 12px rgba(94,88,140,.08)'}}>
        <div style={{width:36,height:36,borderRadius:'50%',flexShrink:0,background:'linear-gradient(145deg,#FFF,#D8CDEE)',display:'flex',alignItems:'center',justifyContent:'center',font:'italic 600 14px "Cormorant Garamond",serif',color:T.soft}}>
          {lead ? lead.name.charAt(0).toUpperCase() : 'S'}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12.5,fontWeight:600,color:T.ink}}>{lead?.name||'Ziyaretçi'}</div>
          <div style={{fontSize:10.5,color:T.muted}}>{lead?'VIP Üye':'Giriş Yap'}</div>
        </div>
      </div>
    </aside>
  )
}

function DesktopTopBar() {
  return (
    <div style={{height:64,padding:'0 36px',boxSizing:'border-box',display:'flex',alignItems:'center',gap:16,borderBottom:'1px solid rgba(94,88,140,.06)',background:'rgba(255,255,255,.55)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',position:'relative',zIndex:3,flexShrink:0}}>
      <div style={{flex:1,maxWidth:480,height:38,padding:'0 16px',display:'flex',alignItems:'center',gap:10,borderRadius:999,background:'rgba(255,255,255,.75)',border:'1px solid rgba(94,88,140,.10)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.7)'}}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke={T.muted} strokeWidth="1.4"/><path d="M9.5 9.5L13 13" stroke={T.muted} strokeWidth="1.4" strokeLinecap="round"/></svg>
        <span style={{fontSize:13,color:T.muted}}>Koku, nota ya da koleksiyon ara…</span>
      </div>
      <div style={{flex:1}}/>
      <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer" style={{padding:'8px 16px',borderRadius:999,border:'1px solid rgba(94,88,140,.12)',background:'rgba(255,255,255,.7)',fontSize:12.5,fontWeight:500,color:T.ink,textDecoration:'none',display:'flex',alignItems:'center',gap:6}}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={T.soft} strokeWidth="1.3"/><path d="M7 1c0 0-3 2.5-3 6s3 6 3 6" stroke={T.soft} strokeWidth="1.3" strokeLinecap="round"/><path d="M7 1c0 0 3 2.5 3 6s-3 6-3 6" stroke={T.soft} strokeWidth="1.3" strokeLinecap="round"/><path d="M1 7h12" stroke={T.soft} strokeWidth="1.3" strokeLinecap="round"/></svg>
        Web Sitesi
      </a>
    </div>
  )
}

function DesktopHome({onGoChat,onGoCatalog}:{onGoChat:()=>void;onGoCatalog:()=>void}) {
  const featured = catalogProducts.slice(0,4)
  return (
    <div style={{flex:1,overflowY:'auto',padding:'36px 48px 48px'}}>
      {/* Hero */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:40,padding:'28px 36px',borderRadius:28,background:'rgba(255,255,255,.55)',backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',border:`1px solid ${T.glassE}`,boxShadow:'0 24px 50px rgba(94,88,140,.10),inset 0 1px 0 rgba(255,255,255,.85)',marginBottom:40}}>
        <div style={{padding:'16px 0'}}>
          <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>ASYA Koku Asistanı · Elegance VIP</div>
          <h1 style={{margin:'14px 0',fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:58,lineHeight:1.0,color:T.ink,letterSpacing:'-0.015em'}}>
            Kendi <em style={{fontStyle:'italic'}}>koku<br/>imzanızı</em> bulun.
          </h1>
          <p style={{margin:'0 0 28px',maxWidth:460,fontSize:15,color:T.soft,lineHeight:1.55}}>
            ASYA, ruh halinizi, mevsimi ve günün gereksinimini birlikte değerlendirip Elegance VIP kütüphanesinden size en uygun parfümü seçer.
          </p>
          <div style={{display:'flex',gap:12,marginBottom:36}}>
            <button onClick={onGoChat} style={{padding:'0 26px',height:52,borderRadius:999,border:'none',background:T.accent,boxShadow:'0 14px 28px rgba(140,120,200,.30)',display:'flex',alignItems:'center',gap:10,fontSize:14.5,fontWeight:500,color:'#FFF',cursor:'pointer',fontFamily:'inherit'}}>
              Koku Profilimi Bul →
            </button>
            <button onClick={onGoCatalog} style={{padding:'0 22px',height:52,borderRadius:999,border:'1px solid rgba(94,88,140,.12)',background:'rgba(255,255,255,.85)',display:'flex',alignItems:'center',gap:10,fontSize:14.5,fontWeight:500,color:T.ink,cursor:'pointer',fontFamily:'inherit'}}>
              Koleksiyonu İncele
            </button>
          </div>
          <div style={{display:'flex',gap:32}}>
            {[['12.000+','aktif kullanıcı'],['180+','koku formülü'],['%97','müşteri memnuniyeti']].map(([v,l],i)=>(
              <div key={i}>
                <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:28,color:T.ink,lineHeight:1}}>{v}</div>
                <div style={{marginTop:4,fontSize:11,color:T.muted,letterSpacing:'0.10em',textTransform:'uppercase'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{position:'relative',borderRadius:22,background:'linear-gradient(160deg,#EFE6F8 0%,#DCE8F4 100%)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',boxShadow:'inset 0 1px 0 rgba(255,255,255,.9)'}}>
          <div style={{position:'absolute',top:30,left:30,width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,.5)',filter:'blur(20px)'}}/>
          <BottleGlyph size={160} hue="#E2D6F1"/>
          <div style={{position:'absolute',top:20,right:20,padding:'8px 14px',borderRadius:999,background:'rgba(255,255,255,.85)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',fontSize:11,fontWeight:600,color:T.ink,letterSpacing:'0.12em',textTransform:'uppercase'}}>Yeni Sezon</div>
        </div>
      </div>

      {/* Product grid */}
      <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:18}}>
        <div>
          <div style={{fontSize:10,letterSpacing:'0.22em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>Profilinize Göre</div>
          <h2 style={{margin:'6px 0 0',fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:30,color:T.ink,letterSpacing:'-0.01em'}}>Bugün <em style={{fontStyle:'italic'}}>Size Özel</em></h2>
        </div>
        <button onClick={onGoCatalog} style={{background:'transparent',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:13,color:T.soft,fontWeight:500,display:'flex',alignItems:'center',gap:6}}>Tümünü Gör →</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
        {featured.map((p,i)=>(
          <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',padding:16,borderRadius:22,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 8px 22px rgba(94,88,140,.08)',display:'block',transition:'transform .2s'}}>
            <div style={{height:160,borderRadius:16,background:'linear-gradient(160deg,#E2D6F1,#FFF)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,overflow:'hidden'}}>
              {p.img ? <img src={p.img} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={80} hue="#E2D6F1"/>}
            </div>
            <div style={{fontSize:10,letterSpacing:'0.18em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>{p.scent}</div>
            <div style={{marginTop:2,fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:20,color:T.ink,lineHeight:1.1}}>{p.name}</div>
          </a>
        ))}
      </div>
    </div>
  )
}

function DesktopCatalog() {
  const [filter,setFilter] = useState('Tümü')
  const filtered = filter==='Tümü' ? catalogProducts : catalogProducts.filter(p=>p.scent===filter)
  return (
    <div style={{flex:1,overflowY:'auto',padding:'32px 48px 48px'}}>
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:24}}>
        <div>
          <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>Elegance VIP</div>
          <h1 style={{margin:'8px 0 0',fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:48,color:T.ink,letterSpacing:'-0.015em'}}>Koku <em style={{fontStyle:'italic'}}>Koleksiyonu</em></h1>
        </div>
        <span style={{fontSize:12.5,color:T.muted}}>{filtered.length} koku</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:28}}>
        <aside>
          <div style={{fontSize:10,letterSpacing:'0.22em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:10}}>Koku Ailesi</div>
          <div style={{display:'flex',flexDirection:'column',gap:3}}>
            {scentFamilies.map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 12px',borderRadius:10,border:'none',background:f===filter?T.accent:'transparent',color:f===filter?'#FFF':T.soft,fontSize:13,fontWeight:f===filter?600:500,cursor:'pointer',fontFamily:'inherit',textAlign:'left',boxShadow:f===filter?'0 6px 14px rgba(140,120,200,.25)':'none',transition:'all .15s'}}>
                {f}
              </button>
            ))}
          </div>
        </aside>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {filtered.map((p,i)=>(
            <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',padding:16,borderRadius:22,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 8px 22px rgba(94,88,140,.08)',display:'block'}}>
              <div style={{height:180,borderRadius:16,background:'linear-gradient(160deg,#E2D6F1,#FFF)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,position:'relative',overflow:'hidden'}}>
                {p.img ? <img src={p.img} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={96} hue="#E2D6F1"/>}
                <div style={{position:'absolute',top:10,left:10,width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,.85)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 13.5s-5-3-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 4-5 7-5 7z" stroke={T.soft} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
              <div style={{fontSize:10,letterSpacing:'0.18em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>{p.scent}</div>
              <div style={{marginTop:2,fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:22,color:T.ink,lineHeight:1.1}}>{p.name}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function DesktopChat({chatLogic,onGoProfile}:{chatLogic:ReturnType<typeof useChatLogic>;onGoProfile:()=>void}) {
  const {lead,coupon,gardrop,reset} = chatLogic
  const hasResult = chatLogic.messages.some(m=>m.type==='recommendation')
  return (
    <div style={{flex:1,display:'grid',gridTemplateColumns:hasResult?'440px 1fr':'440px',overflow:'hidden'}}>
      {/* Chat panel */}
      <section style={{display:'flex',flexDirection:'column',borderRight:'1px solid rgba(94,88,140,.08)',background:'rgba(255,255,255,.55)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)'}}>
        <div style={{padding:'18px 22px 14px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid rgba(94,88,140,.06)',flexShrink:0}}>
          <AsyaAvatar size={38}/>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:T.ink}}>ASYA</div>
            <div style={{fontSize:11,color:T.muted,display:'flex',alignItems:'center',gap:4}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#7FB48C',display:'inline-block'}}/>
              çevrimiçi · genelde 2 saniyede yanıtlar
            </div>
          </div>
          <button onClick={reset} style={{padding:'6px 12px',borderRadius:999,border:`1px solid rgba(94,88,140,.12)`,background:'transparent',fontSize:12,color:T.soft,cursor:'pointer',fontFamily:'inherit'}}>Yeni</button>
        </div>
        <ChatPanel chatLogic={chatLogic} onGoProfile={onGoProfile} isDesktop/>
      </section>

      {/* Profile result panel */}
      {hasResult && (
        <section style={{overflowY:'auto',padding:'32px 40px 40px'}}>
          <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>{lead?.name||'Sizin'} Koku Portresi</div>
          <h1 style={{margin:'8px 0 20px',fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:42,color:T.ink,letterSpacing:'-0.015em'}}>Koku <em style={{fontStyle:'italic'}}>Profiliniz</em></h1>
          {coupon && (
            <div style={{padding:22,borderRadius:20,background:'linear-gradient(135deg,#2B2640 0%,#3E3458 60%,#5B4A82 100%)',boxShadow:'0 18px 36px rgba(43,38,64,.30)',color:'#FFF',marginBottom:24,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 110% -20%,rgba(232,222,243,.35),transparent 55%)',pointerEvents:'none'}}/>
              <div style={{position:'relative',zIndex:1}}>
                <div style={{fontSize:10,letterSpacing:'0.22em',color:'rgba(255,255,255,.7)',fontWeight:600,textTransform:'uppercase',marginBottom:6}}>ASYA'ya Özel Hediye</div>
                <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:28,color:'#FFF',lineHeight:1.05,marginBottom:16}}>İlk Kokunuzda <em style={{fontStyle:'italic'}}>%10</em> İndirim</div>
                <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',borderRadius:12,background:'rgba(255,255,255,.10)',border:'1px dashed rgba(255,255,255,.35)',width:'fit-content'}}>
                  <span style={{fontFamily:'monospace',fontWeight:600,fontSize:16,color:'#FFF',letterSpacing:'0.18em'}}>{coupon}</span>
                  <button onClick={()=>navigator.clipboard?.writeText(coupon!)} style={{padding:'6px 14px',borderRadius:999,border:'none',background:'#FFF',color:'#2B2640',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Kopyala</button>
                </div>
              </div>
            </div>
          )}
          {gardrop.length>0 && (
            <>
              <div style={{fontSize:10,letterSpacing:'0.22em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:12}}>Kaydedilen Kokular</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                {gardrop.slice(0,3).map((g,i)=>(
                  <a key={i} href={g.web_url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',padding:14,borderRadius:18,background:'rgba(255,255,255,.75)',border:`1px solid ${T.glassE}`,boxShadow:'0 6px 14px rgba(94,88,140,.08)',display:'block'}}>
                    <div style={{height:90,borderRadius:12,background:'linear-gradient(160deg,#E2D6F1,#FFF)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8,overflow:'hidden'}}>
                      {g.image_url ? <img src={g.image_url} alt={g.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={44} hue="#E2D6F1"/>}
                    </div>
                    <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:16,color:T.ink,lineHeight:1.15}}>{g.name}</div>
                  </a>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}

function DesktopWardrobe({gardrop}:{gardrop:GItem[]}) {
  return (
    <div style={{flex:1,overflowY:'auto',padding:'36px 48px 48px'}}>
      <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>Koleksiyonunuz</div>
      <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:48,color:T.ink,letterSpacing:'-0.015em',margin:'0 0 32px'}}>Koku <em style={{fontStyle:'italic'}}>Gardırobum</em></h1>
      {gardrop.length===0 ? (
        <div style={{textAlign:'center',padding:'80px 40px',background:'rgba(255,255,255,.55)',backdropFilter:'blur(14px)',borderRadius:28,border:`1px solid ${T.glassE}`}}>
          <BottleGlyph size={64} hue="#E2D6F1"/>
          <p style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:28,color:T.ink,margin:'20px 0 8px'}}>Gardırobunuz boş</p>
          <p style={{fontSize:14,color:T.soft}}>ASYA ile sohbet ederek koku önerisi alın ve kaydedin.</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
          {gardrop.map((item,i)=>(
            <a key={i} href={item.web_url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',padding:16,borderRadius:22,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 8px 22px rgba(94,88,140,.08)',display:'block'}}>
              <div style={{height:140,borderRadius:16,background:'linear-gradient(160deg,#E2D6F1,#FFF)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,overflow:'hidden'}}>
                {item.image_url ? <img src={item.image_url} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={60} hue="#E2D6F1"/>}
              </div>
              <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:20,color:T.ink,lineHeight:1.15}}>{item.name}</div>
              <div style={{fontSize:12,color:T.soft,marginTop:4}}>İncele →</div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function DesktopProfile({lead,coupon}:{lead:Lead|null;coupon:string|null}) {
  return (
    <div style={{flex:1,overflowY:'auto',padding:'36px 48px 48px'}}>
      <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>{lead?.name||'Sizin'} Koku Portresi</div>
      <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:48,color:T.ink,letterSpacing:'-0.015em',margin:'0 0 28px'}}>Koku <em style={{fontStyle:'italic'}}>Profilim</em></h1>
      {!lead ? (
        <div style={{textAlign:'center',padding:'60px 40px',background:'rgba(255,255,255,.55)',backdropFilter:'blur(14px)',borderRadius:28,border:`1px solid ${T.glassE}`}}>
          <AsyaAvatar size={64}/>
          <p style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:26,color:T.ink,margin:'20px 0 8px'}}>Henüz profiliniz yok</p>
          <p style={{fontSize:14,color:T.soft}}>ASYA ile sohbet ederek kişisel koku profilinizi oluşturun.</p>
        </div>
      ) : coupon ? (
        <div style={{padding:24,borderRadius:22,background:'linear-gradient(135deg,#2B2640 0%,#3E3458 60%,#5B4A82 100%)',boxShadow:'0 18px 36px rgba(43,38,64,.30)',color:'#FFF',marginBottom:24,position:'relative',overflow:'hidden',maxWidth:600}}>
          <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 110% -20%,rgba(232,222,243,.35),transparent 55%)',pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:10,letterSpacing:'0.22em',color:'rgba(255,255,255,.7)',fontWeight:600,textTransform:'uppercase',marginBottom:8}}>ASYA'ya Özel Hediye</div>
            <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:32,color:'#FFF',lineHeight:1.05,marginBottom:20}}>İlk Kokunuzda <em style={{fontStyle:'italic'}}>%10</em> İndirim</div>
            <div style={{display:'flex',alignItems:'center',gap:14,padding:'14px 20px',borderRadius:14,background:'rgba(255,255,255,.10)',border:'1px dashed rgba(255,255,255,.35)',width:'fit-content'}}>
              <span style={{fontFamily:'monospace',fontWeight:600,fontSize:18,color:'#FFF',letterSpacing:'0.20em'}}>{coupon}</span>
              <button onClick={()=>navigator.clipboard?.writeText(coupon!)} style={{padding:'8px 16px',borderRadius:999,border:'none',background:'#FFF',color:'#2B2640',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Kopyala</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{padding:24,borderRadius:22,background:'rgba(255,255,255,.55)',backdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`}}>
          <p style={{fontSize:14,color:T.soft,lineHeight:1.6,margin:0}}>ASYA ile sohbet ettikçe koku profiliniz oluşturulur ve burada görünür.</p>
        </div>
      )}
    </div>
  )
}

function DesktopApp() {
  const [screen,setScreen] = useState<Screen>('home')
  const chatLogic = useChatLogic()
  const {lead,gardrop,coupon} = chatLogic

  return (
    <div style={{position:'fixed',inset:0,display:'flex',fontFamily:'Inter,sans-serif',overflow:'hidden'}}>
      {/* Background */}
      <div style={{position:'absolute',inset:0}}>
        <div style={{position:'absolute',top:-180,left:-120,width:520,height:520,borderRadius:'50%',background:'#EFE8F6',opacity:.5,filter:'blur(100px)'}}/>
        <div style={{position:'absolute',top:280,right:-200,width:500,height:500,borderRadius:'50%',background:'#E8EEF6',opacity:.45,filter:'blur(100px)'}}/>
        <div style={{position:'absolute',bottom:-200,left:280,width:460,height:460,borderRadius:'50%',background:'#F2EDF7',opacity:.35,filter:'blur(110px)'}}/>
        <div style={{position:'absolute',inset:0,background:T.bg}}/>
      </div>
      <DesktopSidebar active={screen} onChange={setScreen} lead={lead}/>
      <main style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative',zIndex:1}}>
        <DesktopTopBar/>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {screen==='home' && <DesktopHome onGoChat={()=>setScreen('chat')} onGoCatalog={()=>setScreen('catalog')}/>}
          {screen==='catalog' && <DesktopCatalog/>}
          {screen==='chat' && <DesktopChat chatLogic={chatLogic} onGoProfile={()=>setScreen('profile')}/>}
          {screen==='wardrobe' && <DesktopWardrobe gardrop={gardrop}/>}
          {screen==='profile' && <DesktopProfile lead={lead} coupon={coupon}/>}
          {screen==='faq' && (
            <div style={{flex:1,overflowY:'auto',padding:'36px 48px'}}>
              <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:48,color:T.ink,margin:'0 0 8px'}}>Sıkça <em style={{fontStyle:'italic'}}>Sorulan Sorular</em></h1>
              <p style={{fontSize:14,color:T.soft,margin:'0 0 32px'}}>
                Daha fazla bilgi için{' '}
                <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer" style={{color:T.soft,fontWeight:600}}>elegancevipperfume.com</a> adresini ziyaret edin.
              </p>
              {[['ASYA nedir?','ASYA, Elegance VIP Perfume\'ün yapay zeka destekli koku danışmanıdır. Size özel koku profili çıkarır ve en uygun parfümü önerir.'],['Kargo ne zaman gelir?','Siparişleriniz genellikle 1-3 iş günü içinde kargoya verilir. Detaylar için siteyi ziyaret edin.'],['İade politikası nedir?','Ürünlerimiz için 14 gün iade garantisi sunuyoruz. İade taleplerini info@elegancevipperfume.com adresine iletebilirsiniz.'],['Gold ve Elegancia serisi farkı nedir?','Gold serisi 50ml EDP, Elegancia serisi ise daha yoğun ve kalıcı 100ml Extrait formatındadır. İkisi de özgün Elegance VIP formülasyonlarıdır.']].map(([q,a],i)=>(
                <div key={i} style={{marginBottom:12,padding:'18px 22px',borderRadius:18,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 6px 16px rgba(94,88,140,.06)'}}>
                  <div style={{fontWeight:600,fontSize:15,color:T.ink,marginBottom:6}}>{q}</div>
                  <div style={{fontSize:14,color:T.soft,lineHeight:1.55}}>{a}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

/* ════════════════════════════════════════════
   ROOT
════════════════════════════════════════════ */
export default function Page() {
  const [mounted,setMounted] = useState(false)
  const [isDesktop,setIsDesktop] = useState(false)
  useEffect(()=>{
    setMounted(true)
    const check=()=>setIsDesktop(window.innerWidth>=1024)
    check()
    window.addEventListener('resize',check)
    return ()=>window.removeEventListener('resize',check)
  },[])
  if (!mounted) return <div style={{position:'fixed',inset:0,background:'#FFFFFF'}}/>
  return isDesktop ? <DesktopApp/> : <MobileApp/>
}
