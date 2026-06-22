'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import goldData from '@/data/gold_catalog.json'
import eleganciaData from '@/data/elegancia_catalog.json'
import homeData from '@/data/home_catalog.json'

/* ═══ TYPES ═══ */
type Screen = 'home' | 'catalog' | 'chat' | 'wardrobe' | 'profile' | 'faq' | 'unboxing' | 'gift' | 'muadil'
type MainTab = 'home' | 'catalog' | 'chat' | 'wardrobe' | 'profile' | 'unboxing'
type ChatMode = 'profil' | 'muadil' | 'hediye' | 'ilham'

/* ═══ IMAGE COMPRESS (Canvas, no deps) ═══ */
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 800
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.6))
    }
    img.onerror = reject
    img.src = url
  })
}
interface ScentFamily { name: string; pct: number }
interface TopProduct { code?: string; name: string; series?: 'gold'|'elegancia'; match_pct: number; notes: string; top_notes: string[]; heart_notes: string[]; base_notes: string[]; story: string; image_url: string; web_url: string; woo_id?: number }
interface OdaKokusu { name: string; series: 'home'; woo_id: number; match_reason?: string; image_url?: string; web_url?: string }
interface ScentProfile { title: string; subtitle: string; fal_hikaye?: string; scent_families: ScentFamily[]; top3: TopProduct[]; oda_kokusu?: OdaKokusu }
interface Msg { role: 'assistant' | 'user'; content: string; type?: string; product?: Prod; options?: string[]; profile?: ScentProfile; quick_replies?: string[] }
interface Prod { name: string; image_url: string; web_url: string; woo_id?: number; code?: string; series?: string; notes?: string }
interface GItem { name: string; image_url: string; web_url: string; woo_id?: number; addedAt: string; series?: string; notes?: string }
interface Lead { name: string; email: string; lead_id: string; session_id: string }
type RawProduct = { code?: string; name: string; gender?: string; scent_family?: string; in_stock?: boolean; image_url?: string; web_url?: string; woo_id?: number; series?: string }

/* ═══ TOKENS ═══ */
const T = {
  ink: '#2B2521', soft: '#6E5038', muted: '#9A8C7A',
  bg: '#FFFFFF',
  glass: 'rgba(255,255,255,0.46)', glassS: 'rgba(255,255,255,0.66)', glassE: 'rgba(255,255,255,0.88)',
  shadow: '0 12px 30px rgba(90,70,55,0.12)',
  neoO: '6px 6px 14px rgba(180,160,148,0.30),-6px -6px 14px rgba(255,255,255,0.95)',
  neoI: 'inset 4px 4px 10px rgba(180,160,148,0.22),inset -4px -4px 10px rgba(255,255,255,0.85)',
  accent: 'linear-gradient(135deg,#C08A7E,#9A5B50)',
}

/* ═══ CATALOG DATA ═══ */
type CatProduct = { code:string; name:string; gender:string; scent:string; img:string; url:string; series:string }
const GENDERS = ['Tümü', 'Kadın', 'Erkek', 'Unisex']
const GENDER_MAP: Record<string,string> = { 'Kadın':'kadin', 'Erkek':'erkek', 'Unisex':'unisex' }

const SCENT_TR: Record<string,string> = {
  fresh:'Taze', floral:'Çiçeksi', oriental:'Oryantal', woody:'Odunsu',
  gourmand:'Gourmand', powdery:'Pudralı', aquatic:'Aquatik', citrus:'Narenciye',
  spicy:'Baharatlı', aromatic:'Aromatik', green:'Yeşil',
}

function normScent(raw: string|undefined): string {
  if (!raw) return ''
  return SCENT_TR[raw.toLowerCase()] || raw
}

function toCatProduct(p: RawProduct, defaultSeries='gold'): CatProduct {
  return {
    code: p.code || '',
    name: p.name.split('–')[0].split('|')[0].trim(),
    gender: p.gender || 'unisex',
    scent: normScent(p.scent_family),
    img: p.image_url || '',
    url: p.web_url || '',
    series: p.series || defaultSeries,
  }
}

const goldProducts: CatProduct[] = (goldData as RawProduct[])
  .filter(p => p.in_stock !== false)
  .map(p => toCatProduct(p))

const eleganciaProducts: CatProduct[] = (eleganciaData as RawProduct[])
  .filter(p => p.in_stock !== false)
  .map(p => toCatProduct(p, 'elegancia'))

/* ═══ FEATURED + UNBOXING DB ═══ */
interface PerfumeDB { code:string; name:string; keywords:string[]; image_url:string; web_url:string; top_notes:string[]; heart_notes:string[]; base_notes:string[]; story:string; series:'gold'|'elegancia' }

const PERFUME_DATABASE: PerfumeDB[] = [
  { code:'EL-001',series:'elegancia',name:'Elegancia Charm Serenity',keywords:['charm','serenity','charm serenity'],image_url:'https://res.cloudinary.com/diqrddkdk/image/upload/v1780594473/elegance-vip/products/xpzq6godvuweto4s6xm4.jpg',web_url:'https://elegancevipperfume.com/urun/elegancia-charm-serenity-edp-100-ml/',top_notes:['Tutku Meyvesi','Şeftali','Narenciye'],heart_notes:['Yasemin','Amberwood','Baharatlı Akorlar'],base_notes:['Amber','Misk','Sandal Ağacı'],story:'Charm Serenity ile ilk temaşanda şeftali ve narenciye ferahlığı burnuna doluyor — işte bu, kokunun en saf ilk izlenimi.' },
  { code:'EL-002',series:'elegancia',name:'Velvet Cardinal',keywords:['velvet','cardinal','velvet cardinal'],image_url:'https://res.cloudinary.com/diqrddkdk/image/upload/v1780595192/elegance-vip/products/dhzx5eipzp2cgegvgw6i.jpg',web_url:'https://elegancevipperfume.com/urun/velvet-cardinal-extrait-de-parfum/',top_notes:['Vanilya Özütü','Lavanta'],heart_notes:['Vanilya Tanesi','Yasemin'],base_notes:['Vanilya Absolüsü','Sandal Ağacı','Misk'],story:'Velvet Cardinal, Dubai\'nin sıcaklığını taşıyan kadifemsi bir dokunuş — vanilya ve lavantanın sıcaklığı şu an teninle buluşuyor.' },
  { code:'EL-003',series:'elegancia',name:'Elegancia Sapphire Noir',keywords:['sapphire','noir','sapphire noir'],image_url:'https://res.cloudinary.com/diqrddkdk/image/upload/v1780597644/elegance-vip/products/vkt2ylj3bmw2f3nmipch.jpg',web_url:'https://elegancevipperfume.com/urun/elegancia-sapphire-noir-extrait-de-parfum-100-ml/',top_notes:['Bergamot','Mandalina','Pembe Biber'],heart_notes:['Paçuli','Gül','Yasemin','Sedir'],base_notes:['Amber','Misk','Vanilya'],story:'Sapphire Noir, karanlıkta parlayan bir mücevher gibi — bergamot ve mandalinanın berraklığı ilk izlenimin olacak.' },
  { code:'EL-004',series:'elegancia',name:'Elegancia Reflection',keywords:['reflection','yansıma'],image_url:'https://res.cloudinary.com/diqrddkdk/image/upload/v1780597810/elegance-vip/products/h5eainx9ofrchnm9f2gg.jpg',web_url:'https://elegancevipperfume.com/urun/elegancia-reflection-extrait-de-parfum-100-ml/',top_notes:['Bergamot','Limon'],heart_notes:['Denizci Akoru','Çiçeksi Yasemin','Deniz Yosunu'],base_notes:['Misk','Ambroxan','Sedir'],story:'Reflection, saf bir ayna gibi berrak — bergamot ve limonun taze ışığı şu an burnuna ulaşıyor. Bu berraklık kokunun ruhudur.' },
  { code:'EL-005',series:'elegancia',name:'Elegancia NARCOTIC',keywords:['narcotic','narcotik','narkotik'],image_url:'https://res.cloudinary.com/diqrddkdk/image/upload/v1780597896/elegance-vip/products/nkjngv0eg22s4ihpm6bt.jpg',web_url:'https://elegancevipperfume.com/urun/elegancia-narcotic-extrait-de-parfum-100-ml/',top_notes:['Bergamot','Zencefil','Pembe Biber'],heart_notes:['Sümbül','Yasemin','Portakal Çiçeği'],base_notes:['Sandal Ağacı','Kehribar','Paçuli'],story:'NARCOTIC adından güç alıyor — bergamot ve zencefilin keskin enerjisi şu an teninle buluştu. Bu güçlü açılış, kokunun büyüleyici imzası.' },
  { code:'EL-006',series:'elegancia',name:'Elegancia Majestic Oud',keywords:['majestic','oud','majestic oud','ud'],image_url:'https://res.cloudinary.com/diqrddkdk/image/upload/v1780597978/elegance-vip/products/rhhxm5rt6ljufwgwc2fq.jpg',web_url:'https://elegancevipperfume.com/urun/elegancia-majestic-oud-extrait-de-parfum-100-ml/',top_notes:['Çarkıfelek Meyvesi','Safran'],heart_notes:['Öd Ağacı','Paçuli','Lavanta'],base_notes:['Deri','Kehribar'],story:'Majestic Oud, Doğu\'nun ruhunu taşıyan bir efsane — safran ve çarkıfelek meyvesiyle açılıp oud\'un derinliğiyle zamanı durduruyor.' },
  { code:'EL-007',series:'elegancia',name:'Elegancia Majestic Aura',keywords:['majestic aura','aura'],image_url:'https://elegancevipperfume.com/wp-content/uploads/2025/10/5-7.png',web_url:'https://elegancevipperfume.com/urun/elegancia-majestic-aura-extrait-de-parfum-100-ml/',top_notes:['Bergamot','Portakal'],heart_notes:['Amber','Misk'],base_notes:['Vanilya','Sedir','Deri'],story:'Majestic Aura, kraliyet saraylarında süzülen bir rüya — bergamot ve portakalın aydınlığı şu an burnundan süzülüyor.' },
  { code:'SPECIAL-LG',series:'gold',name:'Lira Gourmand',keywords:['lira','lira gourmand','gourmand'],image_url:'https://res.cloudinary.com/diqrddkdk/image/upload/v1780594309/elegance-vip/products/zoczrvvmaeldia13mrfa.jpg',web_url:'https://elegancevipperfume.com/urun/lira-gourmand-parfum/',top_notes:['Portakal','Bergamot','Limon'],heart_notes:['Karamel','Çikolata'],base_notes:['Vanilya','Misk','Odunsu Notalar'],story:'Lira, tatlı bir melodinin kokusu — portakal ve bergamotun ferah açılışı şu an burnuna ulaşıyor. İşte bu, Lira\'nın ilk şarkısı.' },
]

const FEATURED_CODES = ['EL-002','SPECIAL-LG','EL-005','EL-004']
const allForFeatured = [...goldProducts,...eleganciaProducts]
const catalogProducts = (()=>{
  const found = FEATURED_CODES.map(code=>allForFeatured.find(p=>p.code===code)).filter(Boolean) as CatProduct[]
  if (found.length<4) {
    const usedCodes = new Set(found.map(p=>p.code))
    const extras = eleganciaProducts.filter(p=>!usedCodes.has(p.code))
    while (found.length<4 && extras.length>0) found.push(extras.shift()!)
  }
  return found
})()

const goldScentFamilies = ['Tümü', ...Array.from(new Set(goldProducts.map(p => p.scent).filter(Boolean)))]
const elegScentFamilies = ['Tümü', ...Array.from(new Set(eleganciaProducts.map(p => p.scent).filter(Boolean)))]
const scentFamilies = goldScentFamilies

/* ═══ SHARED COMPONENTS ═══ */
function Bg({ variant = 'a' }: { variant?: string }) {
  void variant
  return <div style={{position:'absolute',inset:0,background:'#FFFFFF'}}/>
}

function BottleGlyph({size=44,hue='#E8DAD2'}:{size?:number;hue?:string}) {
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
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',flexShrink:0,boxShadow:'0 0 0 1.5px rgba(192,138,126,0.60),0 4px 12px rgba(90,70,55,0.18)'}}>
      <img src="/asyapp.png" alt="ASYA" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}}/>
    </div>
  )
}

function ChatBubble({from,children}:{from:'asya'|'user';children:React.ReactNode}) {
  const isA = from==='asya'
  return (
    <div style={{display:'flex',justifyContent:isA?'flex-start':'flex-end',marginTop:8}}>
      <div style={{maxWidth:'78%',padding:'12px 16px',borderRadius:isA?'18px 18px 18px 6px':'18px 18px 6px 18px',background:isA?T.glassS:'linear-gradient(135deg,#D8B3A8,#C79E92)',backdropFilter:isA?'blur(14px)':undefined,WebkitBackdropFilter:isA?'blur(14px)':undefined,border:isA?`1px solid ${T.glassE}`:'none',boxShadow:isA?'0 6px 16px rgba(90,70,55,.10),inset 0 1px 0 rgba(255,255,255,.7)':'0 8px 18px rgba(154,91,80,.25)',fontSize:14.5,lineHeight:1.45,color:isA?T.ink:'#FFF',fontWeight:isA?400:500}}>
        {children}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span style={{display:'inline-flex',gap:5,alignItems:'center',padding:'4px 4px'}}>
      <span className="dot"/>
      <span className="dot"/>
      <span className="dot"/>
    </span>
  )
}

function OptionChips({options,onSelect}:{options:string[];onSelect:(o:string)=>void}) {
  return (
    <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8,marginLeft:2}}>
      {options.map(opt=>(
        <button key={opt} onClick={()=>onSelect(opt)} style={{padding:'9px 16px',borderRadius:999,background:'rgba(255,255,255,0.55)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',border:`1px solid ${T.glassE}`,fontSize:13,color:T.ink,fontWeight:500,boxShadow:'0 3px 8px rgba(90,70,55,.08)',cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function ProductCard({product,cardType,coupon,onSave,saved}:{product:Prod;cardType:string;coupon?:string;onSave?:(p:Prod)=>void;saved?:boolean}) {
  const labels:Record<string,string> = {recommendation:'Sizin İçin Seçildi',elegancia:'Elegancia Premium',home:'Oda Kokusu'}
  const hues:Record<string,string> = {recommendation:'#EADFD8',elegancia:'#D6E2F1',home:'#E2F1E2'}
  return (
    <div style={{background:'rgba(255,255,255,0.70)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:`1px solid ${T.glassE}`,borderRadius:22,overflow:'hidden',boxShadow:'0 12px 30px rgba(90,70,55,.10),inset 0 1px 0 rgba(255,255,255,.9)',maxWidth:340,marginTop:8}}>
      <div style={{padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.5)'}}>
        <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:999,fontSize:10,fontWeight:600,letterSpacing:'0.10em',textTransform:'uppercase',background:'linear-gradient(135deg,rgba(192,138,126,.15),rgba(154,91,80,.15))',border:'1px solid rgba(192,138,126,.30)',color:T.soft}}>
          {labels[cardType]||labels.recommendation}
        </span>
        {onSave && cardType!=='home' && (
          <button onClick={()=>onSave(product)} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,padding:'4px 10px',borderRadius:999,cursor:'pointer',fontFamily:'inherit',background:saved?'rgba(192,138,126,.15)':'rgba(0,0,0,.04)',color:saved?T.soft:T.muted,border:saved?'1px solid rgba(192,138,126,.3)':'1px solid rgba(0,0,0,.08)',transition:'all .2s'}}>
            {saved?'♥ Kayıtlı':'♡ Kaydet'}
          </button>
        )}
      </div>
      <div style={{padding:16,display:'flex',gap:14}}>
        <div style={{flexShrink:0}}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} style={{width:90,height:90,objectFit:'cover',borderRadius:16,boxShadow:'0 4px 16px rgba(0,0,0,.10)'}}/>
            : <div style={{width:90,height:90,borderRadius:16,background:`linear-gradient(160deg,${hues[cardType]||'#EADFD8'},#FFF)`,display:'flex',alignItems:'center',justifyContent:'center'}}><BottleGlyph size={40} hue={hues[cardType]||'#EADFD8'}/></div>
          }
        </div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:16,color:T.ink,margin:'0 0 6px',lineHeight:1.2}}>{product.name}</p>
          {coupon && (
            <div style={{padding:'8px 10px',borderRadius:12,background:'linear-gradient(135deg,rgba(192,138,126,.10),rgba(154,91,80,.10))',border:'1px solid rgba(192,138,126,.25)',marginBottom:8}}>
              <p style={{fontSize:10,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:T.soft,margin:0}}>%10 İndirim</p>
              <p style={{fontFamily:'monospace',fontWeight:700,fontSize:13,letterSpacing:'0.15em',color:T.ink,margin:'2px 0 0'}}>{coupon}</p>
            </div>
          )}
          {cardType==='recommendation' && !coupon && (
            <div style={{padding:'6px 10px',borderRadius:10,background:'linear-gradient(135deg,rgba(192,138,126,.12),rgba(154,91,80,.10))',border:'1px solid rgba(192,138,126,.22)',marginBottom:6,display:'flex',alignItems:'center',gap:8}}>
              <div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:T.soft}}>%10 İndirim</div>
                <div style={{fontFamily:'monospace',fontWeight:700,fontSize:12,letterSpacing:'0.15em',color:T.ink}}>ASYA10</div>
              </div>
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

/* ════════════════════════════════════════════
   UNBOXING / CANLΙ KOKU DENEYİMİ
════════════════════════════════════════════ */
function UnboxingScreen({isDesktop,onGoChat}:{isDesktop?:boolean;onGoChat?:()=>void}) {
  const [step,setStep] = useState<'input'|'gender_ask'|'found'|'notfound'|'notes'>('input')
  const [inputVal,setInputVal] = useState('')
  const [pendingNum,setPendingNum] = useState('')
  const [matched,setMatched] = useState<PerfumeDB|null>(null)
  const [showHeart,setShowHeart] = useState(false)
  const [uxChat,setUxChat] = useState<{role:'user'|'asya';text:string}[]>([])
  const [uxInput,setUxInput] = useState('')
  const [uxLoading,setUxLoading] = useState(false)
  const [photoLoading,setPhotoLoading] = useState(false)
  const [photoError,setPhotoError] = useState('')
  const imgInputRef = useRef<HTMLInputElement>(null)

  /* look up by full code (e.g. "k-072") in PERFUME_DATABASE then gold catalog */
  const findByCode = (code: string): PerfumeDB | null => {
    const inDb = PERFUME_DATABASE.find(p => p.keywords.includes(code.toLowerCase()) || p.code.toLowerCase()===code.toLowerCase())
    if (inDb) return inDb
    const allCat = [...goldProducts, ...eleganciaProducts]
    const cat = allCat.find(p => p.code.toLowerCase()===code.toLowerCase())
    if (!cat) return null
    return {
      code: cat.code,
      name: cat.name,
      series: cat.series==='elegancia'?'elegancia':'gold',
      keywords: [code.toLowerCase(), cat.name.toLowerCase()],
      image_url: cat.img,
      web_url: cat.url,
      top_notes: [],
      heart_notes: [],
      base_notes: [],
      story: `${cat.name} — ${cat.scent||''} ailesinden zarif bir koku. Teninizle buluştuğu ilk an benzersiz bir iz bırakacak.`,
    }
  }

  const sessionId = useRef(Math.random().toString(36).slice(2))

  const logUnboxing = (f: PerfumeDB, question?: string, answer?: string) => {
    fetch('/api/unboxing-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_code: f.code,
        product_name: f.name,
        product_series: f.series,
        session_id: sessionId.current,
        question, answer,
      }),
    }).catch(() => {})
  }

  const handleUnboxingPhoto = (file: File) => {
    setPhotoLoading(true)
    setPhotoError('')
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1]
      const mimeType = file.type || 'image/jpeg'
      try {
        const res = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType })
        })
        const data = await res.json()
        if (data.type === 'match' && data.product) {
          /* Found in our catalog — map to PerfumeDB shape */
          const p = data.product
          const fake: PerfumeDB = {
            code: p.code || '',
            name: p.name,
            series: (p.series === 'elegancia' ? 'elegancia' : 'gold') as 'gold'|'elegancia',
            keywords: [],
            image_url: p.image_url || '',
            web_url: p.web_url || '',
            top_notes: p.top_notes || [],
            heart_notes: p.heart_notes || [],
            base_notes: p.base_notes || [],
            story: data.output || `${p.name} — kataloğumuzdaki özel bir koku.`,
          }
          setMatched(fake)
          setStep('found')
          setUxChat([])
          logUnboxing(fake)
        } else if (data.identified) {
          /* Identified but not in catalog — pre-fill and search */
          const q = data.identified
          setInputVal(q)
          const ql = q.toLowerCase()
          const f = PERFUME_DATABASE.find(p=>
            p.keywords.some(k=>ql.includes(k)||k.includes(ql)) ||
            p.name.toLowerCase().includes(ql)
          ) || findByCode(q)
          if (f) { setMatched(f); setStep('found'); setUxChat([]); logUnboxing(f) }
          else setPhotoError(`"${q}" tanımlandı ama veritabanımızda bulunamadı. Adını yazarak tekrar dene.`)
        } else if (data.type === 'no_perfume' || data.type === 'low_quality') {
          setPhotoError('Parfüm şişesi net görünmüyor. Farklı bir açıdan çekip tekrar dene.')
        } else {
          setPhotoError('Tanımlanamadı. İsmi yazarak arama yapabilirsin.')
        }
      } catch {
        setPhotoError('Fotoğraf işlenirken hata oluştu. Tekrar dene.')
      } finally {
        setPhotoLoading(false)
        if (imgInputRef.current) imgInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  const doSearch = () => {
    const q = inputVal.trim()
    if (!q) return
    const numOnly = q.replace(/[-\s]/g,'')
    /* pure number → ask gender */
    if (/^\d+$/.test(numOnly)) {
      setPendingNum(numOnly.padStart(3,'0'))
      setStep('gender_ask')
      return
    }
    const ql = q.toLowerCase()
    const f = PERFUME_DATABASE.find(p=>
      p.keywords.some(k=>ql.includes(k)||k.includes(ql)) ||
      p.name.toLowerCase().includes(ql)
    ) || findByCode(q)
    setMatched(f||null)
    setStep(f?'found':'notfound')
    setUxChat([])
    if (f) logUnboxing(f)
  }

  const selectGender = (prefix:'k'|'e'|'u') => {
    const code = `${prefix}-${pendingNum}`
    const f = findByCode(code)
    setMatched(f||null)
    setStep(f?'found':'notfound')
    setUxChat([])
    if (f) logUnboxing(f)
  }

  const reset = () => { setStep('input'); setInputVal(''); setMatched(null); setShowHeart(false); setUxChat([]); setUxInput(''); setPendingNum(''); setPhotoError(''); setPhotoLoading(false) }

  const sendUxMessage = async () => {
    if (!uxInput.trim() || !matched || uxLoading) return
    const userText = uxInput.trim()
    setUxInput('')
    const newChat = [...uxChat, {role:'user' as const, text:userText}]
    setUxChat(newChat)
    setUxLoading(true)
    try {
      const seedMsg = `Kullanıcı ${matched.name} parfümünü yeni aldı. Notaları: Üst: ${matched.top_notes.join(', ')}. Kalp: ${matched.heart_notes.join(', ')}. Dip: ${matched.base_notes.join(', ')}. Seri: ${matched.series==='elegancia'?'Elegancia Premium Extrait':'Gold Seri'}. ${matched.story}`
      const apiMessages = [
        {role:'assistant', content: seedMsg},
        ...uxChat.map(m=>({role:m.role==='user'?'user':'assistant', content:m.text})),
        {role:'user', content: userText}
      ]
      const res = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:apiMessages,language:'tr',mode:'profil'})})
      const data = await res.json()
      const reply = typeof data.output==='string' ? data.output : (data.message || 'Anlamadım, tekrar yazar mısın? 🌸')
      setUxChat(prev=>[...prev, {role:'asya', text:reply}])
      logUnboxing(matched, userText, reply)
    } catch {
      setUxChat(prev=>[...prev, {role:'asya', text:'Bir sorun oluştu, tekrar yazar mısın? 🌸'}])
    } finally {
      setUxLoading(false)
    }
  }

  return (
    <div style={{flex:1,overflowY:'auto',padding:isDesktop?'36px 48px 48px':undefined,paddingBottom:isDesktop?undefined:'calc(108px + env(safe-area-inset-bottom, 0px))',maxWidth:isDesktop?680:undefined,margin:isDesktop?'0 auto':undefined,width:'100%',boxSizing:'border-box'}}>
      {/* Hero image */}
      {!isDesktop && (
        <div style={{position:'relative',height:220,overflow:'hidden',marginBottom:0}}>
          <img src="/hero-mobile.jpg" alt="Elegance VIP" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 20%'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(43,38,64,.10) 0%,rgba(43,38,64,.70) 100%)'}}/>
          <div style={{position:'absolute',bottom:20,left:20,color:'#FFF'}}>
            <div style={{fontSize:9,letterSpacing:'0.28em',fontWeight:600,textTransform:'uppercase',opacity:.75,fontFamily:'Arial,sans-serif'}}>Elegance VIP · Canlı Deneyim</div>
            <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:28,fontWeight:500,lineHeight:1.05,marginTop:3}}>Kutumu <em style={{fontStyle:'italic'}}>Yeni Açtım</em></div>
          </div>
        </div>
      )}
      <div style={{padding:isDesktop?0:'24px 20px 0'}}>
      {/* Header (desktop only) */}
      {isDesktop && <div style={{marginBottom:28}}>
        <div style={{fontSize:10,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:6}}>Elegance VIP · Canlı Deneyim</div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:48,color:T.ink,margin:'0 0 6px',letterSpacing:'-0.01em'}}>Kutumu <em style={{fontStyle:'italic'}}>Yeni Açtım</em></h1>
        <p style={{fontSize:13,color:T.soft,margin:0,lineHeight:1.55}}>Parfümünü tanı — notalar, hikaye ve kişisel deneyim rehberi.</p>
      </div>}
      {!isDesktop && <div style={{marginBottom:20}}>
        <p style={{fontSize:13,color:T.soft,margin:0,lineHeight:1.55}}>Parfümünü tanı — notalar, hikaye ve kişisel deneyim rehberi.</p>
      </div>}

      {/* ASYA intro bubble */}
      <div style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:20}}>
        <AsyaAvatar size={32}/>
        <div style={{flex:1}}>
          <ChatBubble from="asya">
            Elegance dünyasına hoş geldin! 🎁 O şık kutuyu yeni açtığını görebiliyorum. Şu an teninle buluşan şaheserin adı nedir?
          </ChatBubble>
        </div>
      </div>

      {/* Step: Input */}
      {step==='input' && (
        <div style={{marginLeft:42}}>
          <input ref={imgInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files?.[0];if(f)handleUnboxingPhoto(f)}}/>

          {/* Photo scan button */}
          <button
            onClick={()=>imgInputRef.current?.click()}
            disabled={photoLoading}
            style={{width:'100%',padding:'14px 18px',borderRadius:18,border:'2px dashed rgba(192,138,126,.45)',background:'rgba(255,255,255,.65)',display:'flex',alignItems:'center',gap:14,cursor:'pointer',fontFamily:'inherit',marginBottom:14,boxShadow:'0 4px 14px rgba(90,70,55,.07)',transition:'all .18s'}}
          >
            <div style={{width:44,height:44,borderRadius:14,background:'linear-gradient(145deg,rgba(192,138,126,.25),rgba(154,91,80,.12))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {photoLoading
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".3"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/></path></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              }
            </div>
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{photoLoading?'Şişe tanımlanıyor…':'Şişe Fotoğrafı Çek / Yükle'}</div>
              <div style={{fontSize:12,color:T.muted,marginTop:2}}>{photoLoading?'Lütfen bekle':'Parfüm kutusunu veya şişeyi tara'}</div>
            </div>
          </button>

          {photoError && (
            <div style={{padding:'10px 14px',borderRadius:12,background:'rgba(220,100,100,.08)',border:'1px solid rgba(220,100,100,.15)',marginBottom:10,fontSize:12.5,color:'rgba(180,60,60,.9)'}}>
              {photoError}
            </div>
          )}

          {/* Text divider */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <div style={{flex:1,height:1,background:'rgba(192,138,126,.25)'}}/>
            <span style={{fontSize:11,color:T.muted,fontWeight:500}}>ya da ismini yaz</span>
            <div style={{flex:1,height:1,background:'rgba(192,138,126,.25)'}}/>
          </div>

          <div style={{display:'flex',gap:8,marginTop:4}}>
            <input
              value={inputVal}
              onChange={e=>setInputVal(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&doSearch()}
              placeholder="örn. Elegancia Charm Serenity, Narcotic, Lira…"
              style={{flex:1,height:48,borderRadius:16,border:'1.5px solid rgba(192,138,126,.40)',background:'rgba(255,255,255,.85)',padding:'0 16px',fontSize:16,fontFamily:'inherit',color:T.ink,outline:'none'}}
            />
            <button onClick={doSearch} style={{height:48,padding:'0 20px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#C08A7E,#9A5B50)',color:'#FFF',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',boxShadow:'0 8px 18px rgba(154,91,80,.28)'}}>
              Bul →
            </button>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:12}}>
            {['Charm Serenity','Reflection','NARCOTIC','Lira','Velvet Cardinal','Majestic Oud'].map(s=>(
              <button key={s} onClick={()=>{setInputVal(s);}} style={{padding:'6px 14px',borderRadius:999,background:'rgba(255,255,255,.65)',border:'1px solid rgba(192,138,126,.25)',fontSize:12,color:T.soft,cursor:'pointer',fontFamily:'inherit'}}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Gender Ask */}
      {step==='gender_ask' && (
        <div style={{marginLeft:42}}>
          <div style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:14}}>
            <AsyaAvatar size={32}/>
            <div style={{flex:1}}>
              <ChatBubble from="asya">
                {pendingNum} numaralı kokuyu arıyorum 🔍 Parfüm kime ait?
              </ChatBubble>
            </div>
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:4}}>
            {([['k','Kadın 👩','k-'+pendingNum],['e','Erkek 👨','e-'+pendingNum],['u','Unisex ✨','u-'+pendingNum]] as const).map(([prefix,label,code])=>(
              <button key={prefix} onClick={()=>selectGender(prefix as 'k'|'e'|'u')} style={{padding:'12px 22px',borderRadius:999,border:'1.5px solid rgba(192,138,126,.35)',background:'rgba(255,255,255,.80)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',fontSize:14,fontWeight:500,color:T.ink,cursor:'pointer',fontFamily:'inherit',display:'flex',flexDirection:'column',alignItems:'center',gap:2,minWidth:90}}>
                <span>{label}</span>
                <span style={{fontSize:10,color:T.muted,letterSpacing:'0.10em'}}>{code}</span>
              </button>
            ))}
          </div>
          <button onClick={reset} style={{marginTop:14,fontSize:12,color:T.muted,background:'none',border:'none',cursor:'pointer',padding:0,fontFamily:'inherit'}}>← Geri dön</button>
        </div>
      )}

      {/* Step: Not Found */}
      {step==='notfound' && (
        <div style={{marginLeft:42}}>
          <div style={{padding:'16px 18px',borderRadius:16,background:'rgba(255,255,255,.65)',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 6px 16px rgba(90,70,55,.08)',marginBottom:12}}>
            <div style={{fontSize:14,color:T.ink,marginBottom:8}}>🤔 Bu parfümü şu an veritabanımda bulamadım. Elegancia veya Gold serimizden mi?</div>
            <button onClick={reset} style={{padding:'8px 16px',borderRadius:999,border:'none',background:T.accent,color:'#FFF',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Tekrar Dene</button>
          </div>
          {onGoChat && <button onClick={onGoChat} style={{fontSize:13,color:T.soft,background:'none',border:'none',cursor:'pointer',padding:0,fontFamily:'inherit',textDecoration:'underline'}}>Veya ASYA ile sohbet et →</button>}
        </div>
      )}

      {/* Step: Found */}
      {(step==='found'||step==='notes') && matched && (
        <div style={{marginLeft:isDesktop?42:0}}>
          {/* Product Card */}
          <div style={{borderRadius:24,background:matched.series==='elegancia'?'linear-gradient(135deg,rgba(110,80,56,.06),rgba(192,138,126,.08))':'rgba(255,255,255,.75)',backdropFilter:'blur(14px)',border:matched.series==='elegancia'?'1px solid rgba(110,80,56,.20)':`1px solid ${T.glassE}`,boxShadow:'0 12px 30px rgba(90,70,55,.10)',overflow:'hidden',marginBottom:16}}>
            {matched.series==='elegancia'&&(
              <div style={{padding:'8px 18px',borderBottom:'1px solid rgba(110,80,56,.10)',background:'rgba(110,80,56,.06)'}}>
                <span style={{fontSize:9,letterSpacing:'0.22em',fontWeight:700,color:'rgba(110,80,56,.85)',textTransform:'uppercase'}}>✦ Elegancia Premium · 100ml Extrait</span>
              </div>
            )}
            <div style={{display:'flex',gap:16,padding:18,alignItems:'flex-start'}}>
              <div style={{width:100,height:100,borderRadius:16,background:'linear-gradient(160deg,#F0E7E0,#EADFD8)',flexShrink:0,overflow:'hidden',border:'1px solid rgba(192,138,126,.15)'}}>
                <img src={matched.image_url} alt={matched.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:22,color:T.ink,lineHeight:1.1,marginBottom:8}}>{matched.name}</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:10}}>
                  {matched.top_notes.map((n,i)=>(
                    <span key={i} style={{padding:'3px 9px',borderRadius:999,background:'rgba(192,138,126,.12)',border:'1px solid rgba(192,138,126,.22)',fontSize:11.5,color:T.soft}}>{n}</span>
                  ))}
                </div>
                <a href={matched.web_url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:T.soft,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>Ürünü İncele →</a>
              </div>
            </div>
          </div>

          {/* ASYA message about top notes */}
          <div style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:16}}>
            <AsyaAvatar size={32}/>
            <div style={{flex:1}}>
              <ChatBubble from="asya">
                {`Gözlerini kapat ve derin bir nefes al... 🌟 ${matched.story} Bu ilk temas — tenine değen o anlık etki — parfümünün sana uzattığı ilk el sıkışması.${matched.top_notes.length>0?` ${matched.top_notes.slice(0,2).join(' ve ')} şu an yükseliyor; bunu hissedebiliyorsun.`:''} Bu sadece başlangıç.`}
              </ChatBubble>
            </div>
          </div>

          {/* 15 dk button – only when notes are available */}
          {!showHeart && (
            <div style={{marginLeft:42,marginBottom:16}}>
              <button onClick={()=>setShowHeart(true)} style={{padding:'12px 22px',borderRadius:16,border:'none',background:'linear-gradient(135deg,rgba(192,138,126,.15),rgba(154,91,80,.15))',fontSize:14,color:T.ink,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:8,fontWeight:500}}>
                ⏳ 15 Dakika Sonra Ne Olacak?
              </button>
            </div>
          )}

          {/* Heart notes reveal – only when notes available */}
          {showHeart && (
            <>
              <div style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:16}}>
                <AsyaAvatar size={32}/>
                <div style={{flex:1}}>
                  <ChatBubble from="asya">
                    {matched.heart_notes.length>0
  ? `Şu an bir şeyler değişmeye başladı, değil mi? ${matched.heart_notes[0]} yavaş yavaş ortaya çıkıyor — bu tamamen normal, parfüm teninde tam da böyle açılır. 🌸 Kalp notalar devreye girdi: ${matched.heart_notes.join(', ')}. Bu kokunun gerçek kimliği, saatlerce seninle kalacak olan kısmı. Akşama doğru ise dip notalar — ${matched.base_notes.slice(0,2).join(' ve ')} — çok daha sıcak ve derin bir iz bırakacak. Bu senin gece imzan. ✨`
  : `Hissediyorsun değil mi — ilk keskinlik yavaş yavaş yumuşuyor, yerini daha sıcak bir şeye bırakıyor. Parfüm teninde böyle açılır; kendi hızında, kendi karakteriyle. Bu iz saatlerce seninle kalacak — senin benzersiz koku imzan. 🌸`}
                  </ChatBubble>
                </div>
              </div>

              {/* Notes pyramid */}
              {matched.heart_notes.length>0 && (
              <div style={{marginLeft:42,padding:'16px 18px',borderRadius:18,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 6px 18px rgba(90,70,55,.06)',marginBottom:16}}>
                <div style={{fontSize:10,letterSpacing:'0.24em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:12}}>Notalar Piramidi</div>
                {[{label:'ÜST NOTALAR',notes:matched.top_notes,c:'rgba(192,138,126,.15)'},{label:'KALP NOTALAR',notes:matched.heart_notes,c:'rgba(154,91,80,.15)'},{label:'DİP NOTALAR',notes:matched.base_notes,c:'rgba(192,138,126,.10)'}].map((tier,i)=>(
                  <div key={i} style={{paddingBottom:i<2?12:0,marginBottom:i<2?12:0,borderBottom:i<2?'1px solid rgba(90,70,55,.06)':'none'}}>
                    <div style={{fontSize:9,letterSpacing:'0.20em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:6}}>{tier.label}</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {tier.notes.map((n,j)=>(
                        <span key={j} style={{padding:'4px 11px',borderRadius:999,background:tier.c,border:'1px solid rgba(192,138,126,.20)',fontSize:12.5,color:T.ink}}>{n}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              )}

              {/* CTA */}
              <div style={{marginLeft:42,display:'flex',gap:10,flexWrap:'wrap',marginBottom:28}}>
                <a href={matched.web_url} target="_blank" rel="noopener noreferrer" style={{padding:'10px 20px',borderRadius:999,border:'none',background:'linear-gradient(135deg,#C08A7E,#9A5B50)',color:'#FFF',fontSize:13,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:6}}>
                  Ürün Sayfasına Git →
                </a>
                <button onClick={onGoChat} style={{padding:'10px 18px',borderRadius:999,border:'1px solid rgba(192,138,126,.25)',background:'rgba(255,255,255,.75)',fontSize:13,color:T.soft,cursor:'pointer',fontFamily:'inherit',fontWeight:500}}>
                  Başka Parfüm Seç →
                </button>
              </div>
            </>
          )}

          {/* ── Mini chat ── */}
          <div style={{marginLeft:isDesktop?42:0,marginTop:8}}>
            <div style={{fontSize:10,letterSpacing:'0.20em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:10}}>ASYA ile Sohbet Et</div>
            {uxChat.map((m,i)=>(
              <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:10,flexDirection:m.role==='user'?'row-reverse':'row'}}>
                {m.role==='asya' && <AsyaAvatar size={28}/>}
                <div style={{maxWidth:'78%',padding:'10px 14px',borderRadius:16,background:m.role==='user'?'linear-gradient(135deg,#C08A7E,#9A5B50)':'rgba(255,255,255,.80)',color:m.role==='user'?'#FFF':T.ink,fontSize:13.5,lineHeight:1.55,boxShadow:'0 4px 12px rgba(90,70,55,.08)',border:m.role==='asya'?`1px solid ${T.glassE}`:'none'}}>
                  {m.text}
                </div>
              </div>
            ))}
            {uxLoading && (
              <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
                <AsyaAvatar size={28}/>
                <div style={{padding:'10px 16px',borderRadius:16,background:'rgba(255,255,255,.80)',border:`1px solid ${T.glassE}`}}>
                  <div style={{display:'flex',gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:T.soft,opacity:.5,animation:`bounce 1.2s ${i*0.2}s infinite`}}/>)}</div>
                </div>
              </div>
            )}
            <div style={{display:'flex',gap:8,marginTop:4}}>
              <input
                value={uxInput}
                onChange={e=>setUxInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&sendUxMessage()}
                placeholder="Bir şey sor ya da düşünceni paylaş…"
                style={{flex:1,height:46,borderRadius:14,border:'1.5px solid rgba(192,138,126,.35)',background:'rgba(255,255,255,.85)',padding:'0 14px',fontSize:16,fontFamily:'inherit',color:T.ink,outline:'none'}}
              />
              <button onClick={sendUxMessage} disabled={uxLoading} style={{height:46,padding:'0 18px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#C08A7E,#9A5B50)',color:'#FFF',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',opacity:uxLoading?.5:1}}>
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

/* ═══ GIFTING ENGINE ═══ */
const GIFT_OCCASIONS = ['Doğum Günü 🎂','Yıl Dönümü 💕','Anneler Günü 🌹','Sevgililer Günü 💝','Sürpriz ✨']

function GiftingEngine({leadId,top3}:{leadId:string;top3:TopProduct[]}) {
  const [step,setStep] = useState<'prompt'|'form'|'done'>('prompt')
  const [occasions,setOccasions] = useState<{name:string;date:string}[]>([{name:'',date:''}])
  const [saving,setSaving] = useState(false)

  const addOccasion = () => setOccasions(o=>[...o,{name:'',date:''}])
  const update = (i:number,k:keyof typeof occasions[0],v:string) => setOccasions(o=>o.map((x,j)=>j===i?{...x,[k]:v}:x))
  const remove = (i:number) => setOccasions(o=>o.filter((_,j)=>j!==i))

  const save = async () => {
    const valid = occasions.filter(o=>o.name&&o.date)
    if (!valid.length) return
    setSaving(true)
    try {
      const product = top3[1] || top3[0]
      await fetch('/api/gift-occasions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        lead_id:leadId,
        occasions:valid.map(o=>({occasion_name:o.name,occasion_date:o.date,product_name:product?.name,product_url:product?.web_url}))
      })})
      setStep('done')
    } catch {}
    setSaving(false)
  }

  if (step==='done') return (
    <div style={{marginTop:12,padding:'14px 18px',borderRadius:16,background:'linear-gradient(135deg,rgba(110,80,56,.08),rgba(192,138,126,.08))',border:'1px solid rgba(192,138,126,.20)',display:'flex',gap:10,alignItems:'center'}}>
      <span style={{fontSize:18}}>✅</span>
      <div>
        <div style={{fontSize:13,fontWeight:600,color:T.ink}}>Hatırlatmalar kaydedildi!</div>
        <div style={{fontSize:11.5,color:T.soft}}>Özel günden 7 gün önce e-posta göndereceğim.</div>
      </div>
    </div>
  )

  if (step==='prompt') return (
    <div style={{marginTop:12,padding:'14px 18px',borderRadius:16,background:'rgba(255,255,255,.65)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 6px 16px rgba(90,70,55,.08)'}}>
      <div style={{fontSize:13,color:T.ink,lineHeight:1.5,marginBottom:10}}>
        🎁 Bir sevdiğiniz için özel bir tarihi kaydetmemi ister misiniz? Özel günden önce hatırlatırım!
      </div>
      <div style={{display:'flex',gap:8}}>
        <button onClick={()=>setStep('form')} style={{padding:'8px 16px',borderRadius:999,border:'none',background:'linear-gradient(135deg,#C08A7E,#9A5B50)',color:'#FFF',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Evet, kaydet →</button>
        <button onClick={()=>setStep('done')} style={{padding:'8px 14px',borderRadius:999,border:'1px solid rgba(90,70,55,.15)',background:'transparent',color:T.muted,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>Şimdi değil</button>
      </div>
    </div>
  )

  return (
    <div style={{marginTop:12,padding:'16px 18px',borderRadius:16,background:'rgba(255,255,255,.65)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 6px 16px rgba(90,70,55,.08)'}}>
      <div style={{fontSize:12,letterSpacing:'0.16em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:12}}>Özel Tarihler</div>
      {occasions.map((o,i)=>(
        <div key={i} style={{display:'flex',gap:8,marginBottom:10,alignItems:'center'}}>
          <select value={o.name} onChange={e=>update(i,'name',e.target.value)} style={{flex:1,height:44,borderRadius:12,border:'1.5px solid rgba(192,138,126,.35)',background:'rgba(255,255,255,.8)',padding:'0 12px',fontSize:16,fontFamily:'inherit',color:T.ink,outline:'none'}}>
            <option value="">Özel gün seçin…</option>
            {GIFT_OCCASIONS.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
          <input type="date" value={o.date} onChange={e=>update(i,'date',e.target.value)} style={{flex:1,height:44,borderRadius:12,border:'1.5px solid rgba(192,138,126,.35)',background:'rgba(255,255,255,.8)',padding:'0 12px',fontSize:16,fontFamily:'inherit',color:T.ink,outline:'none'}}/>
          {occasions.length>1&&<button onClick={()=>remove(i)} style={{width:36,height:36,borderRadius:'50%',border:'none',background:'rgba(220,100,100,.08)',color:'rgba(180,80,80,.7)',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>}
        </div>
      ))}
      <div style={{display:'flex',gap:8,marginTop:4}}>
        <button onClick={addOccasion} style={{padding:'7px 14px',borderRadius:999,border:'1px solid rgba(192,138,126,.30)',background:'transparent',color:T.soft,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>+ Tarih Ekle</button>
        <button onClick={save} disabled={saving} style={{padding:'7px 18px',borderRadius:999,border:'none',background:'linear-gradient(135deg,#C08A7E,#9A5B50)',color:'#FFF',fontSize:12,fontWeight:600,cursor:saving?'default':'pointer',fontFamily:'inherit',opacity:saving?.7:1}}>
          {saving?'Kaydediliyor…':'Kaydet ✓'}
        </button>
      </div>
    </div>
  )
}

/* ═══ GIFT WIZARD ═══ */
const GIFT_QS = [
  { q:'Hediye kime?', opts:['Annem 👩','Babam 👨','Sevgilim / Eşim 💕','Arkadaşım 🤝','Kendime 🎀'] },
  { q:'Hangi vesileyle?', opts:['Doğum Günü 🎂','Yıl Dönümü 💍','Bayram / Özel Gün 🌙','Sürpriz bir hediye 🎁'] },
  { q:'Koku karakteri nasıl olsun?', opts:['Tatlı & Romantik 🌹','Taze & Ferah 🌊','Güçlü & Derin 🔥','Zarif & Narin 🌸'] },
  { q:'Ne arıyorsun?', opts:['Parfüm','Oda Kokusu','Fark Etmez'] },
]

type GiftPoolItem = { name:string; img:string; url:string; series:string; scent:string; gender:string }

function pickGiftProducts(answers:string[]): GiftPoolItem[] {
  const [recipient,,character,productType] = answers
  const genderPref = recipient.includes('Annem')||recipient.includes('Sevgilim') ? ['kadin','unisex']
    : recipient.includes('Babam') ? ['erkek','unisex']
    : ['kadin','erkek','unisex']
  const scentKeys = character.includes('Tatlı') ? ['Oryantal','Çiçeksi','Meyvemsi','Pudralı']
    : character.includes('Taze') ? ['Taze','Aquatik','Sitrus']
    : character.includes('Güçlü') ? ['Oryantal','Odunsu','Deri']
    : ['Çiçeksi','Pudralı','Yeşil']

  let pool: GiftPoolItem[] = []
  if (productType==='Oda Kokusu') {
    pool = (homeData as RawProduct[]).filter(p=>p.in_stock!==false).map(p=>({name:p.name,img:p.image_url||'',url:p.web_url||'',series:'home',scent:p.scent_family||'',gender:'unisex'}))
  } else {
    pool = [...goldProducts,...eleganciaProducts].map(p=>({name:p.name,img:p.img,url:p.url,series:p.series,scent:p.scent,gender:p.gender}))
  }
  const scored = pool.map(p=>{
    let s = Math.random()*0.6
    if (genderPref.includes(p.gender)) s+=3
    if (scentKeys.some(k=>p.scent.toLowerCase().includes(k.toLowerCase()))) s+=4
    return {p,s}
  })
  return scored.sort((a,b)=>b.s-a.s).slice(0,3).map(x=>x.p)
}

function GiftWizard({onBack,onSaveToGardrop}:{onBack:()=>void;onSaveToGardrop?:(p:Prod)=>void}) {
  const [step,setStep] = useState(0)
  const [answers,setAnswers] = useState<string[]>([])
  const [results,setResults] = useState<GiftPoolItem[]|null>(null)

  const handleOpt = (opt:string) => {
    const na = [...answers,opt]
    if (step<GIFT_QS.length-1) { setAnswers(na); setStep(s=>s+1) }
    else { setResults(pickGiftProducts(na)); setAnswers(na) }
  }
  const reset = () => { setStep(0); setAnswers([]); setResults(null) }

  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:'calc(108px + env(safe-area-inset-bottom, 0px))',fontFamily:'Inter,sans-serif'}}>
      <Bg variant="b"/>
      <div style={{position:'relative',zIndex:2,padding:'18px 22px 0'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <button onClick={onBack} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:999,background:T.glassS,backdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,fontSize:13,fontWeight:500,color:T.soft,cursor:'pointer',fontFamily:'inherit'}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Geri
          </button>
          <div style={{fontSize:10,letterSpacing:'0.22em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>Hediye Sihirbazı</div>
        </div>

        <div style={{fontSize:10,letterSpacing:'0.24em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:6}}>AI Hediye Rehberi</div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:32,color:T.ink,margin:'0 0 24px',lineHeight:1.1}}>
          {results ? 'İşte önerilerim 🎁' : 'Doğru kokuyu<br/>birlikte bulalım.'.split('<br/>').map((l,i)=><span key={i}>{i>0&&<br/>}{l}</span>)}
        </h1>

        {!results && (
          <>
            {/* Progress */}
            <div style={{display:'flex',gap:6,marginBottom:28}}>
              {GIFT_QS.map((_,i)=>(
                <div key={i} style={{flex:1,height:3,borderRadius:99,background:i<=step?T.accent:'rgba(192,138,126,.20)',transition:'background .3s'}}/>
              ))}
            </div>
            <div style={{padding:'20px 20px',borderRadius:24,background:T.glass,backdropFilter:'blur(18px)',border:`1px solid ${T.glassE}`,boxShadow:'0 10px 28px rgba(90,70,55,.10)',marginBottom:20}}>
              <div style={{fontSize:12,letterSpacing:'0.16em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:10}}>Soru {step+1} / {GIFT_QS.length}</div>
              <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:24,fontWeight:500,color:T.ink,marginBottom:20,lineHeight:1.2}}>{GIFT_QS[step].q}</div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {GIFT_QS[step].opts.map(opt=>(
                  <button key={opt} onClick={()=>handleOpt(opt)} style={{padding:'14px 18px',borderRadius:16,border:`1.5px solid rgba(192,138,126,.30)`,background:'rgba(255,255,255,.75)',fontSize:14,fontWeight:500,color:T.ink,cursor:'pointer',fontFamily:'inherit',textAlign:'left',transition:'all .15s',boxShadow:'0 3px 10px rgba(90,70,55,.06)'}}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            {answers.length>0 && (
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                {answers.map((a,i)=>(
                  <div key={i} style={{padding:'4px 12px',borderRadius:999,background:'rgba(192,138,126,.18)',fontSize:11,color:T.soft,fontWeight:500}}>{a.split(' ')[0]}</div>
                ))}
              </div>
            )}
          </>
        )}

        {results && (
          <>
            <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:20}}>
              {results.map((p,i)=>(
                <div key={i} style={{borderRadius:22,background:T.glass,backdropFilter:'blur(18px)',border:`1px solid ${T.glassE}`,boxShadow:'0 8px 22px rgba(90,70,55,.10)',overflow:'hidden'}}>
                  <div style={{display:'flex',gap:14,padding:'14px 16px',alignItems:'center'}}>
                    <div style={{width:72,height:72,borderRadius:16,background:'linear-gradient(160deg,#EADFD8,#FFF)',flexShrink:0,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {p.img ? <img src={p.img} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={40} hue="#EADFD8"/>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:9,letterSpacing:'0.18em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>
                        {({elegancia:'Elegancia Niche',hunter:'Hunter / Creasyon',home:'Oda Kokusu'} as Record<string,string>)[p.series]||'Gold Serisi'}
                      </div>
                      <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:19,color:T.ink,lineHeight:1.15,marginTop:2}}>{p.name.split('–')[0].split('(')[0].trim()}</div>
                      {p.scent && <div style={{fontSize:11,color:T.soft,marginTop:3}}>{p.scent}</div>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,padding:'0 16px 14px'}}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{flex:1,height:40,borderRadius:999,background:T.accent,color:'#FFF',fontSize:12,fontWeight:500,display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',boxShadow:'0 6px 14px rgba(154,91,80,.25)'}}>
                      Ürünü İncele →
                    </a>
                    {onSaveToGardrop && (
                      <button onClick={()=>onSaveToGardrop({name:p.name,image_url:p.img,web_url:p.url,series:p.series})} style={{height:40,padding:'0 14px',borderRadius:999,border:`1px solid ${T.glassE}`,background:'rgba(255,255,255,.7)',fontSize:12,color:T.ink,cursor:'pointer',fontFamily:'inherit',fontWeight:500,flexShrink:0}}>
                        + Gardırop
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={reset} style={{width:'100%',padding:'13px',borderRadius:16,border:`1px solid rgba(192,138,126,.30)`,background:'rgba(255,255,255,.6)',fontSize:13,color:T.soft,cursor:'pointer',fontFamily:'inherit',fontWeight:500}}>
              ↩ Yeniden Sor
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ═══ MUADIL SCREEN ═══ */
type MuadilResult = { type:string; identified?:string; confidence?:number; output:string; product?:{ code?:string; name:string; series?:string; notes?:string; image_url?:string; web_url?:string; woo_id?:number } }

const POPULAR_BRANDS = ['Tom Ford','Dior Sauvage','Chanel No 5','Versace Eros','Paco Rabanne 1 Million','Armani Acqua di Giò','Creed Aventus','YSL Black Opium','Viktor&Rolf Flowerbomb','Thierry Mugler Angel']

function MuadilScreen({onBack,onSaveToGardrop}:{onBack:()=>void;onSaveToGardrop?:(p:Prod)=>void}) {
  const [query,setQuery] = useState('')
  const [mode,setMode] = useState<'text'|'photo'>('text')
  const [status,setStatus] = useState<'idle'|'loading'|'done'|'error'>('idle')
  const [result,setResult] = useState<MuadilResult|null>(null)
  const [photoPreview,setPhotoPreview] = useState<string|null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)

  const search = async (q: string) => {
    if (!q.trim()) return
    setStatus('loading')
    setResult(null)
    try {
      const res = await fetch('/api/muadil', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ query: q }) })
      const data: MuadilResult = await res.json()
      setResult(data)
      setStatus('done')
    } catch { setStatus('error') }
  }

  const searchByPhoto = async (file: File) => {
    setStatus('loading')
    setResult(null)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1]
        const mimeType = file.type || 'image/jpeg'
        try {
          const res = await fetch('/api/vision', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ image: base64, mimeType })
          })
          const data: MuadilResult = await res.json()
          setResult(data)
          setStatus('done')
        } catch { setStatus('error') }
      }
      reader.readAsDataURL(file)
    } catch { setStatus('error') }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    searchByPhoto(file)
    e.target.value = ''
  }

  const reset = () => {
    setQuery('')
    setStatus('idle')
    setResult(null)
    setPhotoPreview(null)
    setTimeout(()=>{ if(mode==='text') inputRef.current?.focus() },100)
  }

  const switchMode = (m:'text'|'photo') => {
    setMode(m)
    setStatus('idle')
    setResult(null)
    setPhotoPreview(null)
    setQuery('')
  }

  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:'calc(108px + env(safe-area-inset-bottom, 0px))',fontFamily:'Inter,sans-serif'}}>
      <Bg variant="c"/>
      <div style={{position:'relative',zIndex:2,padding:'18px 22px 0'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <button onClick={onBack} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:999,background:T.glassS,backdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,fontSize:13,fontWeight:500,color:T.soft,cursor:'pointer',fontFamily:'inherit'}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Geri
          </button>
          <div style={{fontSize:10,letterSpacing:'0.22em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>Muadil Bul</div>
        </div>

        <div style={{fontSize:10,letterSpacing:'0.24em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:6}}>Koku Muadili</div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:32,color:T.ink,margin:'0 0 8px',lineHeight:1.1}}>
          Sevdiğin kokuyu<br/><em style={{fontStyle:'italic'}}>bütçene uygun bul.</em>
        </h1>
        <p style={{fontSize:13,color:T.soft,margin:'0 0 20px',lineHeight:1.5}}>Marka adını yaz veya şişenin fotoğrafını çek — en yakın kokuyu bulalım.</p>

        {/* Mode tabs */}
        <div style={{display:'flex',gap:8,marginBottom:20,background:'rgba(255,255,255,.55)',borderRadius:14,padding:4,border:`1px solid ${T.glassE}`}}>
          {([['text','Yazarak Ara',<svg key="t" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 21l-4.35-4.35"/><circle cx="11" cy="11" r="7"/></svg>],['photo','Fotoğrafla Ara',<svg key="p" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>]] as [string,string,React.ReactNode][]).map(([m,label,icon])=>(
            <button key={m} onClick={()=>switchMode(m as 'text'|'photo')} style={{flex:1,padding:'9px 12px',borderRadius:10,border:'none',background:mode===m?T.accent:'transparent',color:mode===m?'#FFF':T.soft,fontSize:12.5,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'all .18s',boxShadow:mode===m?'0 4px 12px rgba(154,91,80,.25)':'none'}}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Text search */}
        {mode==='text' && (
          <>
            <div style={{display:'flex',gap:10,marginBottom:16}}>
              <input
                ref={inputRef}
                value={query}
                onChange={e=>setQuery(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter')search(query)}}
                placeholder="Örn: Tom Ford Oud Wood, Dior Sauvage…"
                style={{flex:1,height:52,borderRadius:16,border:`1.5px solid rgba(192,138,126,.40)`,background:'rgba(255,255,255,.80)',padding:'0 18px',fontSize:16,fontFamily:'inherit',color:T.ink,outline:'none',boxShadow:'0 4px 12px rgba(90,70,55,.08)'}}
              />
              <button
                onClick={()=>search(query)}
                disabled={!query.trim()||status==='loading'}
                style={{width:52,height:52,borderRadius:16,border:'none',background:query.trim()?T.accent:'rgba(192,138,126,.20)',color:'#FFF',cursor:query.trim()?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s',boxShadow:query.trim()?'0 8px 18px rgba(154,91,80,.28)':'none'}}
              >
                {status==='loading'
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".3"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/></path></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                }
              </button>
            </div>
            {/* Popular brands */}
            {status==='idle' && (
              <div style={{marginBottom:24}}>
                <div style={{fontSize:11,letterSpacing:'0.16em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:10}}>Popüler Aramalar</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {POPULAR_BRANDS.map(b=>(
                    <button key={b} onClick={()=>{setQuery(b);search(b)}} style={{padding:'7px 14px',borderRadius:999,border:`1px solid rgba(192,138,126,.30)`,background:'rgba(255,255,255,.70)',fontSize:12,color:T.soft,cursor:'pointer',fontFamily:'inherit',fontWeight:500,transition:'all .15s'}}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Photo upload */}
        {mode==='photo' && status==='idle' && (
          <div style={{marginBottom:20}}>
            <input ref={imgInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoChange}/>
            <button
              onClick={()=>imgInputRef.current?.click()}
              style={{width:'100%',borderRadius:20,border:`2px dashed rgba(192,138,126,.45)`,background:'rgba(255,255,255,.60)',aspectRatio:'1',maxHeight:260,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 8px 24px rgba(90,70,55,.08)',transition:'all .18s'}}
            >
              <div style={{width:64,height:64,borderRadius:20,background:'linear-gradient(145deg,rgba(192,138,126,.25),rgba(154,91,80,.10))',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:15,fontWeight:600,color:T.ink,marginBottom:4}}>Şişe Fotoğrafı Yükle</div>
                <div style={{fontSize:12,color:T.muted}}>Parfüm şişesini çek veya galeriden seç</div>
              </div>
              <div style={{padding:'8px 20px',borderRadius:999,background:T.accent,color:'#FFF',fontSize:12.5,fontWeight:600,boxShadow:'0 6px 16px rgba(154,91,80,.30)'}}>
                Fotoğraf Seç
              </div>
            </button>
          </div>
        )}

        {/* Photo preview while loading */}
        {mode==='photo' && status==='loading' && photoPreview && (
          <div style={{marginBottom:20,borderRadius:20,overflow:'hidden',position:'relative',aspectRatio:'1',maxHeight:260}}>
            <img src={photoPreview} alt="Yüklenen" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            <div style={{position:'absolute',inset:0,background:'rgba(110,80,56,.45)',backdropFilter:'blur(4px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".3"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/></path></svg>
              <div style={{fontSize:13,fontWeight:500,color:'#FFF'}}>Koku tanımlanıyor…</div>
            </div>
          </div>
        )}

        {/* Error */}
        {status==='error' && (
          <div style={{padding:'14px 18px',borderRadius:16,background:'rgba(220,100,100,.08)',border:'1px solid rgba(220,100,100,.15)',marginBottom:16}}>
            <div style={{fontSize:13,color:'rgba(180,60,60,.9)'}}>Bir sorun oluştu. Tekrar dene.</div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{borderRadius:24,background:T.glass,backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',border:`1px solid ${T.glassE}`,boxShadow:'0 10px 28px rgba(90,70,55,.10)',overflow:'hidden',marginBottom:16}}>
            {/* Photo preview strip when result came from photo */}
            {mode==='photo' && photoPreview && (
              <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',background:'rgba(192,138,126,.08)',borderBottom:`1px solid ${T.glassE}`}}>
                <img src={photoPreview} alt="Yüklenen şişe" style={{width:52,height:52,borderRadius:10,objectFit:'cover',border:`1px solid ${T.glassE}`}}/>
                <div>
                  <div style={{fontSize:10,letterSpacing:'0.18em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>Yüklenen Fotoğraf</div>
                  <div style={{fontSize:12,color:T.soft,marginTop:2}}>Şişe tanımlandı ↓</div>
                </div>
              </div>
            )}
            {result.identified && (
              <div style={{padding:'12px 18px',background:'rgba(192,138,126,.12)',borderBottom:`1px solid ${T.glassE}`,display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:18}}>{mode==='photo'?'📷':'🔍'}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,letterSpacing:'0.18em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>{mode==='photo'?'Tanımlanan Koku':'Aranan'}</div>
                  <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{result.identified}</div>
                </div>
                {result.confidence && <div style={{padding:'3px 10px',borderRadius:999,background:'rgba(110,80,56,.12)',fontSize:11,fontWeight:600,color:T.soft}}>%{result.confidence} eşleşme</div>}
              </div>
            )}
            <div style={{padding:'14px 18px'}}>
              <p style={{fontSize:14,color:T.ink,lineHeight:1.5,margin:'0 0 14px'}}>{result.output}</p>
              {result.product && (
                <>
                  <div style={{borderRadius:18,background:'rgba(255,255,255,.75)',border:`1px solid ${T.glassE}`,padding:'14px 16px',display:'flex',gap:14,alignItems:'center',marginBottom:12}}>
                    <div style={{width:72,height:72,borderRadius:14,background:'linear-gradient(160deg,#EADFD8,#FFF)',flexShrink:0,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {result.product.image_url ? <img src={result.product.image_url} alt={result.product.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={38} hue="#EADFD8"/>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:10,letterSpacing:'0.16em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>
                        {({elegancia:'Elegancia Niche',hunter:'Hunter / Creasyon',home:'Oda Kokusu'} as Record<string,string>)[result.product.series||'']||'Gold Serisi'}
                      </div>
                      <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:20,color:T.ink,lineHeight:1.1,marginTop:2}}>{result.product.name}</div>
                      {result.product.notes && <div style={{fontSize:11,color:T.soft,marginTop:4}}>{result.product.notes}</div>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    {result.product.web_url && (
                      <a href={result.product.web_url} target="_blank" rel="noopener noreferrer" style={{flex:1,height:44,borderRadius:999,background:T.accent,color:'#FFF',fontSize:13,fontWeight:500,display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',boxShadow:'0 8px 18px rgba(154,91,80,.28)'}}>
                        Ürünü İncele →
                      </a>
                    )}
                    {onSaveToGardrop && result.product && (
                      <button onClick={()=>onSaveToGardrop({name:result.product!.name,image_url:result.product!.image_url||'',web_url:result.product!.web_url||'',woo_id:result.product!.woo_id,code:result.product!.code,series:result.product!.series,notes:result.product!.notes})} style={{height:44,padding:'0 16px',borderRadius:999,border:`1px solid ${T.glassE}`,background:'rgba(255,255,255,.7)',fontSize:13,color:T.ink,cursor:'pointer',fontFamily:'inherit',fontWeight:500,flexShrink:0}}>
                        + Gardırop
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {result && (
          <div style={{display:'flex',gap:8,marginBottom:8}}>
            <button onClick={reset} style={{flex:1,padding:'13px',borderRadius:16,border:`1px solid rgba(192,138,126,.30)`,background:'rgba(255,255,255,.6)',fontSize:13,color:T.soft,cursor:'pointer',fontFamily:'inherit',fontWeight:500}}>
              {mode==='photo' ? '↩ Başka Fotoğraf Yükle' : '↩ Başka Bir Koku Ara'}
            </button>
            {mode==='photo' && (
              <button onClick={()=>switchMode('text')} style={{padding:'13px 16px',borderRadius:16,border:`1px solid rgba(192,138,126,.30)`,background:'rgba(255,255,255,.6)',fontSize:12,color:T.soft,cursor:'pointer',fontFamily:'inherit',fontWeight:500,flexShrink:0}}>
                Yazarak Ara
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══ WEATHER HOOK ═══ */
function useWeather() {
  const [data, setData] = useState<{city?:string;temp?:number;wcode?:number}|null>(null)
  useEffect(()=>{
    if (typeof navigator==='undefined'||!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async pos=>{
      try {
        const {latitude:lat,longitude:lon} = pos.coords
        const [wRes,gRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`),
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        ])
        const w = await wRes.json()
        const g = await gRes.json()
        setData({
          city: g.address?.city||g.address?.town||g.address?.province||undefined,
          temp: Math.round(w.current?.temperature_2m??20),
          wcode: w.current?.weather_code??0
        })
      } catch {}
    },()=>{})
  },[])
  return data
}

function weatherDesc(code:number,temp:number):string {
  if (code===0&&temp>22) return 'güneşli ve sıcak ☀️'
  if (code===0) return 'açık ve serin 🌤️'
  if (code<=3) return 'parçalı bulutlu ⛅'
  if (code<=48) return 'sisli 🌫️'
  if (code<=67) return 'yağmurlu 🌧️'
  if (code<=77) return 'karlı ❄️'
  return 'fırtınalı ⛈️'
}

function weatherPerfumeTip(code:number,temp:number,gardrop:GItem[]):string {
  const warm = gardrop.find(g=>g.notes&&['oud','sandal','amber','vanilya','oryantal','odunsu'].some(k=>g.notes!.toLowerCase().includes(k)))
  const fresh = gardrop.find(g=>g.notes&&['bergamot','limon','taze','ferah','narenciye'].some(k=>g.notes!.toLowerCase().includes(k)))
  if (temp<15||code>=61) {
    if (warm) return `Bu serin havada gardırobundaki <strong>${warm.name.split(' ').slice(0,2).join(' ')}</strong> sana harika bir sıcaklık katacak.`
    return 'Soğuk ve yağmurlu havalarda oryantal ve odunsu notalar kıyafetlerinle bütünleşerek sizi sarar.'
  }
  if (temp>26&&code===0) {
    if (fresh) return `Sıcakta gardırobundaki <strong>${fresh.name.split(' ').slice(0,2).join(' ')}</strong> taze ve ferah hissettirecek.`
    return 'Sıcak günlerde bergamot ve narenciyeli taze notalar enerjini yüksek tutar.'
  }
  if (gardrop.length>0) {
    const pick = gardrop[0]
    return `Bugün için gardırobundaki <strong>${pick.name.split(' ').slice(0,2).join(' ')}</strong> güzel bir seçim.`
  }
  return ''
}

function getScentCategory(item:GItem):string {
  // Check catalog by name to get real series & scent_family
  const allCat = [...goldProducts,...eleganciaProducts]
  const cat = allCat.find(p=>p.name===item.name || p.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]))
  const resolvedSeries = item.series || cat?.series || ''
  if (resolvedSeries==='elegancia') return '✦ Lüks'

  // Build text from notes + catalog scent_family
  const sf = (cat?.scent||'').toLowerCase()
  const txt = ((item.notes||'')+' '+sf).toLowerCase()

  // Direct scent_family map
  const sfMap: Record<string,string> = {
    'oryantal':'🔥 Oryantal','oriental':'🔥 Oryantal','oryanta':'🔥 Oryantal',
    'odunsu':'🌙 Gece','woody':'🌙 Gece','ahşap':'🌙 Gece',
    'çiçeksi':'🌸 Romantik','floral':'🌸 Romantik',
    'taze':'☀️ Günlük','ferah':'☀️ Günlük','aromatik':'☀️ Günlük','aromatic':'☀️ Günlük',
    'gourmand':'🔥 Oryantal','baharatlı':'🔥 Oryantal','spicy':'🔥 Oryantal',
  }
  for (const [k,v] of Object.entries(sfMap)) if (sf.includes(k)) return v

  // Keyword fallback from notes (priority: Gece > Oryantal > Romantik > Günlük)
  if (['oud',' ud ','sandal','sedir','patchouli','odunsu','deri','woody','derin','ahşap'].some(k=>txt.includes(k))) return '🌙 Gece'
  if (['amber','vanilya','baharat','oryantal','tütsü','baharatlı','gourmand'].some(k=>txt.includes(k))) return '🔥 Oryantal'
  if (['gül','yasemin','çiçek','iris','şakayık','floral','rose','çiçeksi'].some(k=>txt.includes(k))) return '🌸 Romantik'
  if (['bergamot','limon','narenciye','taze','ferah','aqua','okyanus','aromatik'].some(k=>txt.includes(k))) return '☀️ Günlük'
  return '☀️ Günlük'
}

/* ═══ KOKU AURASI MODAL ═══ */
function KokuAurasiModal({profile,lead,onClose}:{profile:ScentProfile;lead:Lead|null;onClose:()=>void}) {
  const [shareState,setShareState] = useState<'idle'|'loading'|'done'>('idle')
  const [refState,setRefState] = useState<'idle'|'loading'|'copied'>('idle')
  const [refUrl,setRefUrl] = useState<string|null>(null)

  const handleReferralShare = async () => {
    if (!lead?.lead_id || !lead?.name || !lead?.email) return
    setRefState('loading')
    try {
      const res = await fetch('/api/referral/create', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ lead_id: lead.lead_id, name: lead.name, email: lead.email }),
      })
      const data = await res.json()
      if (data.url) {
        setRefUrl(data.url)
        if (navigator.share) {
          await navigator.share({ title: 'ASYA Koku Testi', text: `${lead.name} seni ASYA koku testine davet etti! Tamamla, 2. üründe %50 indirim kazan 🎁`, url: data.url })
        } else {
          await navigator.clipboard.writeText(data.url)
          setRefState('copied')
          setTimeout(() => setRefState('idle'), 2500)
          return
        }
      }
    } catch {}
    setRefState('idle')
  }

  const handleShare = async ()=>{
    setShareState('loading')
    try {
      const params = new URLSearchParams({
        title: profile.title,
        top1: profile.top3[0]?.name||'',
        fal: profile.fal_hikaye||profile.subtitle||'',
        families: JSON.stringify(profile.scent_families.slice(0,4)),
      })
      const imageUrl = `/api/aura-image?${params}`
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const file = new File([blob],'koku-auram.png',{type:'image/png'})
      if (navigator.canShare&&navigator.canShare({files:[file]})) {
        await navigator.share({files:[file],title:'ASYA — Koku Aurası'})
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'koku-auram.png'
        a.click()
      }
    } catch {}
    setShareState('done')
    setTimeout(()=>setShareState('idle'),2000)
  }

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(20,16,40,.75)',backdropFilter:'blur(10px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:360,borderRadius:28,overflow:'hidden',boxShadow:'0 40px 80px rgba(0,0,0,.5)'}}>
        {/* Card face */}
        <div style={{background:'linear-gradient(160deg,#2B2640 0%,#6E5038 55%,#9B7EC0 100%)',padding:'32px 26px 24px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,.06)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:-20,left:-30,width:120,height:120,borderRadius:'50%',background:'rgba(192,138,126,.10)',pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:9,letterSpacing:'0.38em',color:'rgba(192,138,126,.75)',fontWeight:700,textTransform:'uppercase',marginBottom:8,fontFamily:'Inter,sans-serif'}}>ASYA · Elegance VIP · Koku Aurası</div>
            <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:36,color:'#FFF',fontWeight:500,lineHeight:1.05,marginBottom:18,letterSpacing:'-0.01em'}}>
              {profile.title.split(' ').map((w,i)=>i===0?<span key={i}>{w} </span>:<em key={i} style={{fontStyle:'italic'}}>{w}</em>)}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:18}}>
              {profile.scent_families.slice(0,4).map((sf,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{height:3,borderRadius:999,background:'rgba(255,255,255,.55)',width:`${Math.min(sf.pct*2,100)}%`,maxWidth:120,flexShrink:0}}/>
                  <span style={{fontSize:11.5,color:'rgba(255,255,255,.72)',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>{sf.name} <strong style={{color:'rgba(255,255,255,.9)'}}>{sf.pct}%</strong></span>
                </div>
              ))}
            </div>
            {profile.top3[0] && (
              <div style={{padding:'10px 13px',borderRadius:12,background:'rgba(255,255,255,.09)',border:'1px solid rgba(255,255,255,.14)'}}>
                <div style={{fontSize:8,letterSpacing:'0.24em',color:'rgba(192,138,126,.7)',fontWeight:600,textTransform:'uppercase',marginBottom:2,fontFamily:'Inter,sans-serif'}}>İmza Koku</div>
                <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:17,color:'#FFF',fontWeight:500,lineHeight:1.2}}>{profile.top3[0].name}</div>
              </div>
            )}
            {profile.fal_hikaye && (
              <div style={{marginTop:14,padding:'10px 13px',borderRadius:12,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.10)'}}>
                <div style={{fontSize:11.5,color:'rgba(255,255,255,.78)',lineHeight:1.55,fontStyle:'italic',fontFamily:'"Cormorant Garamond",serif'}}>{profile.fal_hikaye}</div>
              </div>
            )}
            <div style={{marginTop:16,padding:'10px 13px',borderRadius:10,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
  <div>
    <div style={{fontSize:9,letterSpacing:'0.22em',color:'rgba(255,255,255,.40)',textTransform:'uppercase',fontFamily:'Inter,sans-serif'}}>Koku testini sen de dene</div>
    <a href="https://asya.elegancevipperfume.com" target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:'rgba(192,138,126,.85)',fontFamily:'Inter,sans-serif',marginTop:1,display:'block',textDecoration:'none'}}>asya.elegancevipperfume.com →</a>
  </div>
  <div style={{fontSize:20}}>✨</div>
</div>
          </div>
        </div>
        {/* Actions */}
        {/* Paylaş ve Kazan banner */}
        {lead?.lead_id && (
          <div style={{background:'linear-gradient(145deg,#1C1630 0%,#2E2050 100%)',padding:'18px 18px 16px',borderTop:'1px solid rgba(255,200,80,.18)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#F59E0B,#D97706)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>🎁</div>
              <div>
                <div style={{fontSize:10,letterSpacing:'0.22em',color:'rgba(255,200,80,.75)',fontWeight:700,textTransform:'uppercase',fontFamily:'Inter,sans-serif'}}>Paylaş ve Kazan</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.90)',fontWeight:500,marginTop:1}}>Arkadaşını davet et, ikiniz de <span style={{color:'#FCD34D',fontWeight:700}}>%50 indirim</span> kazan!</div>
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,.06)',borderRadius:10,padding:'8px 12px',marginBottom:10,border:'1px solid rgba(255,200,80,.12)'}}>
              <div style={{fontSize:10.5,color:'rgba(255,255,255,.55)',lineHeight:1.5,fontFamily:'Inter,sans-serif'}}>
                Arkadaşın testi tamamlasın → ikiniz de 2. üründe <strong style={{color:'rgba(252,211,77,.85)'}}>%50 indirim</strong> hakkı kazanırsınız. 14 gün geçerli, tek kullanım.
              </div>
            </div>
            {refUrl && (
              <div style={{background:'rgba(255,255,255,.08)',borderRadius:10,padding:'8px 12px',fontSize:10.5,color:'rgba(192,138,126,.85)',fontFamily:'monospace',marginBottom:10,wordBreak:'break-all',border:'1px solid rgba(255,255,255,.08)'}}>{refUrl}</div>
            )}
            <button
              onClick={handleReferralShare}
              disabled={refState==='loading'}
              style={{width:'100%',padding:'12px',borderRadius:12,border:'none',background:refState==='copied'?'linear-gradient(135deg,#16A34A,#15803D)':'linear-gradient(135deg,#F59E0B,#D97706)',color:'#FFF',fontSize:13.5,fontWeight:700,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:refState==='copied'?'0 6px 16px rgba(22,163,74,.35)':'0 6px 16px rgba(217,119,6,.35)',transition:'all .2s',letterSpacing:'0.01em'}}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M13 6l3 4-3 4M7 6L4 10l3 4M11 3l-2 14" stroke="#FFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {refState==='loading' ? 'Davet Linki Oluşturuluyor…' : refState==='copied' ? '✓ Link Kopyalandı!' : 'Davet Linki Oluştur ve Paylaş'}
            </button>
          </div>
        )}
        <div style={{background:'rgba(255,255,255,.96)',padding:'14px 18px',display:'flex',gap:10}}>
          <button onClick={handleShare} style={{flex:1,padding:'12px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#6E5038,#8B6FB5)',color:'#FFF',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'opacity .15s'}}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M14 3l-4-2.5L6 3M10 .5V13M4 11v5h12v-5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {shareState==='loading'?'Hazırlanıyor…':shareState==='done'?'Kaydedildi ✓':'📱 Koku Auramı Paylaş'}
          </button>
          <button onClick={onClose} style={{padding:'12px 16px',borderRadius:14,border:'1px solid rgba(90,70,55,.18)',background:'transparent',color:T.soft,fontSize:14,cursor:'pointer',fontFamily:'inherit'}}>✕</button>
        </div>
      </div>
    </div>
  )
}

/* ═══ WARDROBE HELPERS ═══ */
function WeatherGreeting({gardrop}:{gardrop:GItem[]}) {
  const weather = useWeather()
  const [dismissed,setDismissed] = useState(false)
  if (!weather||dismissed||gardrop.length===0) return null
  const hour = new Date().getHours()
  const greet = hour<12?'Günaydın':hour<18?'İyi günler':'İyi akşamlar'
  const desc = weatherDesc(weather.wcode||0,weather.temp||20)
  const tip = weatherPerfumeTip(weather.wcode||0,weather.temp||20,gardrop)
  return (
    <div style={{marginBottom:16,padding:'14px 16px',borderRadius:18,background:'linear-gradient(135deg,rgba(192,138,126,.12),rgba(154,91,80,.10))',border:'1px solid rgba(192,138,126,.22)',display:'flex',gap:12,alignItems:'flex-start',position:'relative'}}>
      <AsyaAvatar size={32}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:600,color:T.ink,marginBottom:3,lineHeight:1.3}}>
          {greet}! {weather.city&&`${weather.city}'de `}hava {desc} — {weather.temp}°C
        </div>
        {tip&&<div style={{fontSize:12.5,color:T.soft,lineHeight:1.5}} dangerouslySetInnerHTML={{__html:tip}}/>}
      </div>
      <button onClick={()=>setDismissed(true)} style={{flexShrink:0,background:'none',border:'none',cursor:'pointer',color:T.muted,fontSize:18,lineHeight:1,padding:'0 2px',marginTop:-2}}>×</button>
    </div>
  )
}

function WardrobeGapAnalysis({gardrop}:{gardrop:GItem[]}) {
  if (gardrop.length<2) return null
  const hasElegancia = gardrop.some(g=>g.series==='elegancia')
  const hasWoody = gardrop.some(g=>{const t=(g.notes||'').toLowerCase();return ['oud','sandal','sedir','patchouli','vetiver','derin'].some(k=>t.includes(k))})
  const hasFresh = gardrop.some(g=>{const t=(g.notes||'').toLowerCase();return ['bergamot','limon','narenciye','taze','ferah'].some(k=>t.includes(k))})
  const hasFloral = gardrop.some(g=>{const t=(g.notes||'').toLowerCase();return ['gül','yasemin','iris','şakayık','zambak','floral'].some(k=>t.includes(k))})

  const missing = !hasElegancia?{label:'✦ Lüks Niş',text:'Koleksiyonunda henüz bir Elegancia Niche ürünü yok — 100ml Extrait premium kalıcılığıyla imza kokunun zirvesi.'}
    :!hasWoody?{label:'🌙 Gece Kokusu',text:'Koleksiyonunda güçlü bir gece kokusu eksik. Odunsu-oryantal bir parfüm davetlere imzan olur.'}
    :!hasFresh?{label:'☀️ Günlük Koku',text:'Günlük, hafif bir koku eksik. Bergamot ve narenciyeli notalar sabah enerjini tamamlar.'}
    :!hasFloral?{label:'🌸 Romantik Koku',text:'Çiçeksi, romantik bir koku eksik. Özel anlara layık gül veya yasemin notaları koleksiyonu tamamlar.'}
    :null
  if (!missing) return null
  return (
    <div style={{marginTop:16,padding:'16px 18px',borderRadius:18,background:'linear-gradient(135deg,rgba(110,80,56,.05),rgba(154,91,80,.05))',border:'1px solid rgba(192,138,126,.18)',display:'flex',gap:12,alignItems:'flex-start'}}>
      <div style={{width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,rgba(192,138,126,.18),rgba(154,91,80,.18))',border:'1px solid rgba(192,138,126,.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:15}}>🧩</div>
      <div style={{flex:1}}>
        <div style={{fontSize:10,letterSpacing:'0.16em',color:T.soft,fontWeight:700,textTransform:'uppercase',marginBottom:5,fontFamily:'Inter,sans-serif'}}>ASYA Analizi · Eksik Parça: {missing.label}</div>
        <div style={{fontSize:13,color:T.ink,lineHeight:1.55,marginBottom:10}}>{missing.text}</div>
        <button onClick={()=>window.open('https://www.elegancevipperfume.com','_blank')} style={{padding:'7px 16px',borderRadius:999,border:'none',background:T.accent,color:'#FFF',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Koleksiyonu Keşfet →</button>
      </div>
    </div>
  )
}

/* ═══ CHAT LOGIC HOOK ═══ */
function useChatLogic(mode: ChatMode = 'profil') {
  const [messages, setMessages] = useState<Msg[]>([])
  const [chatPhase, setChatPhase] = useState<'register'|'chat'>('register')
  const [lead, setLead] = useState<Lead|null>(null)
  const [gardrop, setGardrop] = useState<GItem[]>([])
  const [coupon, setCoupon] = useState<string|null>(null)
  const [scentProfile, setScentProfile] = useState<ScentProfile|null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const emailSentRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    try { setGardrop(JSON.parse(localStorage.getItem('asya_gardrop')||'[]')) } catch {}
    try {
      const s = localStorage.getItem('asya_lead')
      if (s) {
        const l = JSON.parse(s)
        setLead(l)
        if (l.email) {
          fetch('/api/lookup-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:l.email})})
            .then(r=>r.json())
            .then(data=>{
              if (data.found) {
                if (data.scent_profile) setScentProfile(data.scent_profile)
                if (data.gardrop?.length) {
                  setGardrop(data.gardrop)
                  localStorage.setItem('asya_gardrop',JSON.stringify(data.gardrop))
                }
                setChatPhase('chat')
                if (l.lead_id) {
                  fetch('/api/referral/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lead_id:l.lead_id})})
                    .then(r=>r.json())
                    .then(rd=>{
                      if (rd.coupon) {
                        setMessages([{
                          role:'assistant',
                          content:`🎉 Tebrikler ${l.name}! Davet ettiğin arkadaşın koku testini tamamladı. İşte senin özel indirim kodun: **${rd.coupon}** — 2. üründe %50 indirim, 14 gün geçerli! 🎁`,
                          type:'referral_reward',
                        }])
                      } else {
                        setMessages([{role:'assistant',content:`Tekrar hoş geldin, ${l.name}. ✨ İmza kokun seni bekliyor. Ne yapmak istersin?`,type:'welcome'}])
                      }
                    })
                    .catch(()=>{ setMessages([{role:'assistant',content:`Tekrar hoş geldin, ${l.name}. ✨ İmza kokun seni bekliyor. Ne yapmak istersin?`,type:'welcome'}]) })
                } else {
                  setMessages([{role:'assistant',content:`Tekrar hoş geldin, ${l.name}. ✨ İmza kokun seni bekliyor. Ne yapmak istersin?`,type:'welcome'}])
                }
              }
            })
            .catch(()=>{})
        }
      }
    } catch {}
  },[])

  useEffect(()=>{
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  },[messages,loading])

  const saveToGardrop = useCallback((p:Prod) => {
    setGardrop(prev => {
      const item:GItem = {name:p.name,image_url:p.image_url,web_url:p.web_url,woo_id:p.woo_id,addedAt:new Date().toISOString(),series:p.series,notes:p.notes}
      const next = [item,...prev.filter(g=>g.name!==p.name)]
      localStorage.setItem('asya_gardrop',JSON.stringify(next))
      return next
    })
    // Ana site favorilerine de ekle (iframe köprüsü — gardırop = site favorileri)
    try { if (typeof window!=='undefined' && window.parent!==window) { const slug=(p.web_url||'').match(/\/urun\/([^/]+)/)?.[1]; if(slug) window.parent.postMessage({source:'asya',type:'fav:add',slug,name:p.name,image:p.image_url,url:p.web_url},'*') } } catch {}
  },[])

  const isInGardrop = useCallback((name:string) => gardrop.some(g=>g.name===name),[gardrop])

  const removeFromGardrop = useCallback((name:string) => {
    setGardrop(prev => {
      const target = prev.find(g=>g.name===name)
      const next = prev.filter(g=>g.name!==name)
      localStorage.setItem('asya_gardrop',JSON.stringify(next))
      try { if (typeof window!=='undefined' && window.parent!==window && target) { const slug=(target.web_url||'').match(/\/urun\/([^/]+)/)?.[1]; if(slug) window.parent.postMessage({source:'asya',type:'fav:remove',slug},'*') } } catch {}
      return next
    })
  },[])

  // Gömülüyse (iframe) gardırobu ana site favori listesiyle eşitle
  useEffect(()=>{
    if (typeof window==='undefined' || window.parent===window) return
    const onMsg=(e:MessageEvent)=>{ const d=e.data; if(d&&d.type==='site:fav:list'&&Array.isArray(d.items)){ const mapped:GItem[]=d.items.map((it:{slug?:string;name:string;image?:string;url?:string})=>({name:it.name,image_url:it.image||'',web_url:it.url||(it.slug?('https://elegancevipperfume.com/urun/'+it.slug):''),addedAt:new Date().toISOString()})); setGardrop(mapped); try{localStorage.setItem('asya_gardrop',JSON.stringify(mapped))}catch{} } }
    window.addEventListener('message',onMsg)
    window.parent.postMessage({source:'asya',type:'fav:list'},'*')
    return ()=>window.removeEventListener('message',onMsg)
  },[])

  // Auto-save gardrop to Supabase when it changes (debounced)
  useEffect(()=>{
    if (!lead?.lead_id || gardrop.length===0) return
    const t = setTimeout(()=>{
      fetch('/api/save-profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lead_id:lead.lead_id,gardrop})}).catch(()=>{})
    },2000)
    return ()=>clearTimeout(t)
  },[gardrop,lead?.lead_id])

  // Auto-save scent profile to Supabase when generated
  useEffect(()=>{
    if (!scentProfile || !lead?.lead_id) return
    fetch('/api/save-profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lead_id:lead.lead_id,scent_profile:scentProfile})}).catch(()=>{})
  },[scentProfile,lead?.lead_id])

  const capitalize = (s:string) => s.trim().split(/\s+/).map(w => w ? w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR') : w).join(' ')
  const handleRegister = async (rawName:string, email:string) => {
    const name = capitalize(rawName)
    try {
      const res = await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,mode:'koku_testi'})})
      const data = await res.json()
      const newLead:Lead = {name:data.name ? capitalize(data.name) : name,email,lead_id:data.lead_id,session_id:data.session_id}
      setLead(newLead)
      localStorage.setItem('asya_lead',JSON.stringify(newLead))
      if (data.returning) {
        if (data.scent_profile) setScentProfile(data.scent_profile)
        if (data.gardrop?.length) {
          setGardrop(data.gardrop)
          localStorage.setItem('asya_gardrop',JSON.stringify(data.gardrop))
        }
      }
      setChatPhase('chat')
      const displayName = data.name ? capitalize(data.name) : name
      // Show personalized welcome based on whether user is returning
      setMessages([{
        role:'assistant',
        content: data.returning
          ? `Tekrar hoş geldin, ${displayName.split(' ')[0]}! 💜\n\nKoku profil${data.scent_profile ? 'in hazır — aşağıdaki ✦ Profil sekmesinden inceleyebilirsin' : 'in kayıtlı'}. Yeniden analiz yapmak ya da farklı bir konuda yardım istersen buradayım.\n\nNe yapmak istersin?`
          : `Zarafet dünyasına hoş geldin, ${displayName}. ✨ Ben ASYA, Elegance VIP'nin yapay zeka destekli kişisel koku asistanıyım.\n\nTeninin notalarını, ruh halini ve yaşam stilini analiz ederek sana özel imza kokuyu birlikte tasarlayabiliriz. Nasıl başlamak istersin?`,
        type:'welcome',
        quick_replies: data.returning
          ? ['Yeniden analiz yap 🔄', 'Başka koku öner 💐', 'Muadil ara 🔍']
          : undefined,
      }])
    } catch {
      setChatPhase('chat')
      setMessages([{
        role:'assistant',
        content:`Zarafet dünyasına hoş geldin. ✨ Ben ASYA, Elegance VIP'nin yapay zeka destekli kişisel koku asistanıyım.\n\nTeninin notalarını, ruh halini ve yaşam stilini analiz ederek sana özel imza kokuyu birlikte tasarlayabiliriz. Nasıl başlamak istersin?`,
        type:'welcome',
      }])
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
      const res = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:newMsgs,session_id:l?.session_id,mode,userName:l?.name||''})})
      const data = await res.json()
      const assistantMsg:Msg = {role:'assistant',content:data.output,type:data.type,product:data.product,options:data.options,profile:data.profile,quick_replies:data.quick_replies}
      if (data.type==='profile_ready' && data.profile) setScentProfile(data.profile)
      const finalMsgs = [...newMsgs,assistantMsg]
      setMessages(finalMsgs)
      if (data.type==='profile_ready' && data.profile && l && !emailSentRef.current) {
        emailSentRef.current = true
        let cpn:string|null = null
        try {
          const cr = await fetch('/api/coupon',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lead_id:l.lead_id})})
          const cd = await cr.json(); cpn = cd.coupon||null
        } catch {}
        setCoupon(cpn)
        let refUrl:string|null = null
        try {
          const rr = await fetch('/api/referral/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lead_id:l.lead_id,name:l.name,email:l.email})})
          const rd = await rr.json(); refUrl = rd.url||null
        } catch {}
        fetch('/api/send-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
          lead_id:l.lead_id, name:l.name, email:l.email, session_id:l.session_id,
          top3: data.profile.top3||[], scent_profile:data.profile, coupon:cpn, referral_url:refUrl
        })}).catch(()=>{})

        // Gmail uyarısı — email gönderildikten sonra
        setMessages(m=>[...m,{
          role:'assistant',
          content:`Profilinizi e-posta adresinize gönderdim 📩\n\nGmail kullanıyorsanız **Tanıtımlar** sekmesinde olabilir — üzerine sağ tıklayıp **"Birincil'e taşı"** derseniz bundan sonrakiler direkt gelen kutunuza gelir!`,
          type:'chat',
        }])

        // Complete referral if user came via a referral link
        const refCode = typeof window!=='undefined' ? localStorage.getItem('asya_ref_code') : null
        if (refCode && l.lead_id && l.email) {
          fetch('/api/referral/complete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
            ref_code: refCode, invitee_lead_id: l.lead_id, invitee_name: l.name, invitee_email: l.email
          })}).then(r=>r.json()).then(rd=>{
            if (rd.invitee_coupon) setCoupon(prev=>prev||rd.invitee_coupon)
            localStorage.removeItem('asya_ref_code')
          }).catch(()=>{})
        }
      }
    } catch (e) {
      setMessages(m=>[...m,{role:'assistant',content:'Bir sorun oluştu, tekrar dener misin?'}])
    }
    setLoading(false)
  }

  const send = (text:string) => { if (!text.trim()||loading) return; sendMessage(text) }
  const reset = () => {
    setMessages([])
    setChatPhase('register')
    emailSentRef.current=false
    setCoupon(null)
    setScentProfile(null)
  }

  return { messages, chatPhase, lead, gardrop, coupon, scentProfile, input, setInput, loading, scrollRef, handleRegister, send, saveToGardrop, isInGardrop, removeFromGardrop, reset }
}

/* ═══ REGISTER FORM ═══ */
function RegisterForm({onSubmit,isDesktop}:{onSubmit:(name:string,email:string)=>void;isDesktop?:boolean}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [returning, setReturning] = useState<string|null>(null) // returning customer name
  const [checking, setChecking] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const valid = name.trim().length>=2 && /.+@.+\..+/.test(email)

  const scrollToBtn = () => { setTimeout(()=>{ btnRef.current?.scrollIntoView({behavior:'smooth',block:'nearest'}) },320) }

  const checkEmail = async (e: string) => {
    if (!/.+@.+\..+/.test(e)) return
    setChecking(true)
    try {
      const res = await fetch('/api/lookup-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e})})
      const data = await res.json()
      if (data.found) {
        setReturning(data.name)
        setName(data.name) // auto-fill name
      } else {
        setReturning(null)
      }
    } catch {}
    setChecking(false)
  }

  const submit = async (e:React.FormEvent) => {
    e.preventDefault()
    if (!valid||submitting) return
    setSubmitting(true)
    onSubmit(name,email)
  }
  return (
    <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',padding:isDesktop?'32px 40px':'10px 24px 20px'}}>
      <AsyaAvatar size={isDesktop?56:44}/>
      <h2 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:isDesktop?28:24,color:T.ink,textAlign:'center',margin:'8px 0 4px',lineHeight:1.15}}>
        Önce <em style={{fontStyle:'italic'}}>kısaca tanışalım</em>
      </h2>
      <p style={{fontSize:13,color:T.soft,textAlign:'center',maxWidth:300,lineHeight:1.4,margin:'0 0 10px'}}>
        Size özel koku önerileri için adınızı ve e-postanızı paylaşır mısınız?
      </p>
      {returning && (
        <div style={{width:'100%',maxWidth:360,marginBottom:10,padding:'8px 14px',borderRadius:14,background:'linear-gradient(135deg,rgba(110,80,56,.12),rgba(154,91,80,.10))',border:'1px solid rgba(110,80,56,.25)',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:16}}>👋</span>
          <div>
            <div style={{fontSize:12.5,fontWeight:600,color:T.ink}}>Tekrar hoş geldiniz, {returning.split(' ')[0]}!</div>
            <div style={{fontSize:11,color:T.soft}}>Koku profiliniz ve gardırobunuz yükleniyor…</div>
          </div>
        </div>
      )}
      <form onSubmit={submit} style={{width:'100%',maxWidth:360}}>
        <div style={{padding:14,borderRadius:20,background:T.glassS,backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',border:`1px solid ${T.glassE}`,boxShadow:'0 14px 36px rgba(90,70,55,.14),inset 0 1px 0 rgba(255,255,255,.85)'}}>
          <NeoField label="E-POSTA" placeholder="selin@ornek.com" value={email} onChange={setEmail} type="email" onBlur={()=>checkEmail(email)} onFocus={scrollToBtn}/>
          <div style={{height:8}}/>
          <NeoField label="İSİM" placeholder="örn. Selin Yıldız" value={name} onChange={setName} onFocus={scrollToBtn}/>
          {checking && <p style={{fontSize:11,color:T.muted,margin:'4px 0 0'}}>Hesabınız kontrol ediliyor…</p>}
          <p style={{fontSize:11,color:T.muted,margin:'8px 0 0',lineHeight:1.4,display:'flex',gap:6}}>
            <span style={{flexShrink:0}}>🔒</span>
            Bilgileriniz yalnızca koku önerileri için kullanılır.
          </p>
        </div>
        <button ref={btnRef} type="submit" disabled={!valid||submitting} style={{width:'100%',marginTop:10,height:50,borderRadius:999,border:'none',background:valid?T.accent:T.glassS,backdropFilter:valid?undefined:'blur(16px)',color:valid?'#FFF':T.soft,fontSize:15,fontWeight:500,cursor:valid?'pointer':'not-allowed',fontFamily:'inherit',boxShadow:valid?'0 14px 30px rgba(154,91,80,.30)':T.shadow,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 10px 0 24px',transition:'all .2s',opacity:submitting?.7:1}}>
          <span>{returning ? 'Profilime Devam Et' : 'Sohbete Başla'}</span>
          <div style={{width:40,height:40,borderRadius:'50%',background:valid?'rgba(255,255,255,.25)':'linear-gradient(145deg,#FFF,#EFE6DF)',boxShadow:valid?undefined:T.neoO,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke={valid?'#FFF':T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </button>
      </form>
    </div>
  )
}

function NeoField({label,placeholder,value,onChange,type='text',onBlur,onFocus}:{label:string;placeholder:string;value:string;onChange:(v:string)=>void;type?:string;onBlur?:()=>void;onFocus?:()=>void}) {
  const [focused,setFocused] = useState(false)
  return (
    <label style={{display:'block'}}>
      <div style={{fontSize:10,letterSpacing:'0.22em',fontWeight:600,color:T.muted,marginBottom:6}}>{label}</div>
      <div style={{height:50,borderRadius:16,background:'#FFF',boxShadow:focused?`inset 0 0 0 1.5px #C08A7E,${T.neoI}`:T.neoI,display:'flex',alignItems:'center',padding:'0 16px',gap:10,transition:'box-shadow .2s'}}>
        <input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} onFocus={()=>{setFocused(true);onFocus?.()}} onBlur={()=>{setFocused(false);onBlur?.()}} style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:16,color:T.ink,fontFamily:'inherit'}}/>
      </div>
    </label>
  )
}

/* ═══ CHAT PANEL (shared) ═══ */
const QUICK_STARTS: Array<{label:string;emoji:string;action:'send'|'muadil'|'gift'|'vision'|'catalog';value?:string}> = [
  {label:'Bana parfüm öner',emoji:'🌸',action:'send',value:'Bana uygun parfümü bul'},
  {label:'İmza kokumu bul',emoji:'✨',action:'send',value:'İmza kokumu arıyorum'},
  {label:'Hediye öner',emoji:'🎁',action:'gift'},
  {label:'Muadil Ara',emoji:'🔍',action:'muadil'},
  {label:'Şişe Tara',emoji:'📷',action:'vision'},
  {label:'Koleksiyona Bak',emoji:'🛍️',action:'catalog'},
]

function ChatPanel({chatLogic,onGoProfile,onGoScentProfile,isDesktop,mode,onGoMuadil,onGoGift,onGoVision,onGoCatalog}:{chatLogic:ReturnType<typeof useChatLogic>;onGoProfile?:()=>void;onGoScentProfile?:()=>void;isDesktop?:boolean;mode?:ChatMode;onGoMuadil?:()=>void;onGoGift?:()=>void;onGoVision?:()=>void;onGoCatalog?:()=>void}) {
  const {messages,chatPhase,lead,coupon,input,setInput,loading,scrollRef,handleRegister,send,saveToGardrop,isInGardrop} = chatLogic
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const handleKey = (e:React.KeyboardEvent) => { if (e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(input)} }

  const handleQuickStart = (qs: typeof QUICK_STARTS[number]) => {
    if (qs.action==='send' && qs.value) { send(qs.value); return }
    if (qs.action==='muadil' && onGoMuadil) { onGoMuadil(); return }
    if (qs.action==='gift' && onGoGift) { onGoGift(); return }
    if (qs.action==='vision' && onGoVision) { onGoVision(); return }
    if (qs.action==='catalog' && onGoCatalog) { onGoCatalog(); return }
    if (qs.value) send(qs.value)
  }

  const showQuickStarts = messages.length===1 && messages[0].role==='assistant' && !loading

  if (chatPhase==='register') {
    return <RegisterForm onSubmit={handleRegister} isDesktop={isDesktop}/>
  }

  return (
    <>
      <div ref={scrollRef} style={{flex:1,overflowY:'auto',padding:isDesktop?'18px 22px':'12px 18px 0',display:'flex',flexDirection:'column'}}>
        {messages.map((msg,i)=>(
          <div key={i}>
            {msg.role==='assistant' ? (
              <div>
                <div style={{display:'flex',gap:10,alignItems:'flex-end'}}>
                  <AsyaAvatar size={isDesktop?32:28}/>
                  <ChatBubble from="asya">{msg.content}</ChatBubble>
                </div>
                {/* Quick start chips — only after the first greeting */}
                {i===0 && showQuickStarts && (
                  <div style={{paddingLeft:isDesktop?42:38,marginTop:10,marginBottom:4}}>
                    <div style={{fontSize:10.5,letterSpacing:'0.14em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:8}}>Hızlı Başlangıç</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                      {QUICK_STARTS.map(qs=>(
                        <button key={qs.label} onClick={()=>handleQuickStart(qs)}
                          style={{padding:'9px 14px',borderRadius:999,border:`1.5px solid rgba(192,138,126,.35)`,background:'rgba(255,255,255,.80)',backdropFilter:'blur(10px)',fontSize:12.5,color:T.ink,cursor:'pointer',fontFamily:'inherit',fontWeight:500,display:'flex',alignItems:'center',gap:6,transition:'all .15s',boxShadow:'0 3px 8px rgba(90,70,55,.08)'}}>
                          <span style={{fontSize:14}}>{qs.emoji}</span>{qs.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {msg.options && (
                  <div style={{paddingLeft:isDesktop?42:38}}>
                    <OptionChips options={msg.options} onSelect={o=>send(o)}/>
                  </div>
                )}
                {msg.quick_replies && !msg.options && (
                  <div style={{paddingLeft:isDesktop?42:38}}>
                    <OptionChips options={msg.quick_replies} onSelect={o=>send(o)}/>
                  </div>
                )}
                {msg.type==='profile_ready' && mode==='hediye' && lead?.lead_id && msg.profile?.top3?.length && (
                  <div style={{paddingLeft:isDesktop?42:38}}>
                    <GiftingEngine leadId={lead.lead_id} top3={msg.profile.top3}/>
                  </div>
                )}
                {msg.type==='profile_ready' && mode!=='muadil' && onGoScentProfile && (
                  <div style={{paddingLeft:isDesktop?42:38,marginTop:10}}>
                    <button onClick={onGoScentProfile} style={{padding:'14px 20px',borderRadius:20,border:'none',background:'linear-gradient(135deg,#C08A7E,#9A5B50)',boxShadow:'0 14px 28px rgba(154,91,80,.30)',display:'flex',alignItems:'center',gap:14,cursor:'pointer',fontFamily:'inherit',textAlign:'left',position:'relative',overflow:'hidden',maxWidth:340,width:'100%'}}>
                      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 0% 0%,rgba(255,255,255,.3),transparent 60%)',pointerEvents:'none'}}/>
                      <div style={{width:44,height:44,borderRadius:14,background:'rgba(255,255,255,.22)',border:'1px solid rgba(255,255,255,.35)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,position:'relative',zIndex:1}}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="#FFF" strokeWidth="1.6"/><circle cx="12" cy="12" r="10.5" stroke="#FFF" strokeOpacity=".5" strokeWidth="1.6"/><circle cx="12" cy="12" r="2" fill="#FFF"/></svg>
                      </div>
                      <div style={{flex:1,position:'relative',zIndex:1}}>
                        <div style={{fontSize:10,letterSpacing:'0.22em',color:'rgba(255,255,255,.85)',fontWeight:600,textTransform:'uppercase'}}>Hazır</div>
                        <div style={{marginTop:2,fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:20,color:'#FFF',lineHeight:1.1}}>Koku Profilinizi Görün →</div>
                      </div>
                    </button>
                  </div>
                )}
                {msg.product && (
                  <div style={{paddingLeft:isDesktop?42:38}}>
                    <ProductCard product={msg.product} cardType={msg.type||'recommendation'} coupon={msg.type==='recommendation'?coupon||undefined:undefined} onSave={msg.type!=='home'?saveToGardrop:undefined} saved={isInGardrop(msg.product.name)}/>
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
            <div style={{padding:'12px 16px',background:T.glassS,backdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,borderRadius:'18px 18px 18px 6px',boxShadow:'0 6px 16px rgba(90,70,55,.10)'}}>
              <TypingDots/>
            </div>
          </div>
        )}
        <div style={{height:8,flexShrink:0}}/>
      </div>

      <div style={{flexShrink:0,paddingTop:isDesktop?10:8,paddingLeft:isDesktop?18:16,paddingRight:isDesktop?18:16,paddingBottom:isDesktop?18:'calc(104px + env(safe-area-inset-bottom, 0px))',display:'flex',gap:10,alignItems:'flex-end',background:'rgba(255,255,255,.55)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',borderTop:'1px solid rgba(255,255,255,.5)'}}>
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} placeholder="ASYA'ya bir mesaj yazın…" disabled={loading} rows={1}
          onFocus={()=>setTimeout(()=>inputRef.current?.scrollIntoView({behavior:'smooth',block:'nearest'}),320)}
          style={{flex:1,resize:'none',background:'rgba(255,255,255,.62)',border:`1.5px solid ${loading?'rgba(255,255,255,.85)':'rgba(192,138,126,.4)'}`,borderRadius:16,padding:'12px 16px',fontSize:16,fontFamily:'inherit',color:T.ink,outline:'none',lineHeight:1.5,minHeight:48,maxHeight:120,transition:'border-color .2s'}}/>
        <button onClick={()=>send(input)} disabled={loading||!input.trim()}
          style={{width:48,height:48,borderRadius:'50%',border:'none',flexShrink:0,cursor:loading||!input.trim()?'default':'pointer',background:'linear-gradient(145deg,#FFF,#EFE6DF)',boxShadow:loading||!input.trim()?'none':T.neoO,display:'flex',alignItems:'center',justifyContent:'center',opacity:loading||!input.trim()?.4:1,transition:'all .15s'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.soft} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </>
  )
}

/* ════════════════════════════════════════════
   SCENT PROFILE SCREEN
════════════════════════════════════════════ */
const SCENT_COLORS: Record<string, string> = {
  'Çiçeksi':  'linear-gradient(90deg,#E8C6D9,#D4A8C7)',
  'Oryantal': 'linear-gradient(90deg,#D4C6E8,#B9A5D8)',
  'Odunsu':   'linear-gradient(90deg,#C6D4B8,#A8C09A)',
  'Taze':     'linear-gradient(90deg,#B8D4E8,#9AC0D4)',
  'Aromatik': 'linear-gradient(90deg,#D4E8B8,#C0D4A0)',
  'Baharatlı':'linear-gradient(90deg,#E8D4B8,#D4C0A0)',
}

function ScentProfileScreen({profile,lead,coupon,gardrop,onBack,onProductTap,onSaveToGardrop,isInGardrop,isDesktop}:{
  profile:ScentProfile; lead:Lead|null; coupon:string|null; gardrop:GItem[]
  onBack:()=>void; onProductTap:(p:TopProduct)=>void
  onSaveToGardrop:(p:TopProduct)=>void; isInGardrop:(name:string)=>boolean; isDesktop?:boolean
}) {
  const [showAura,setShowAura] = useState(false)
  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',background:'linear-gradient(160deg,#FDFCFE,#F8F6FC)',paddingBottom:isDesktop?0:'calc(108px + env(safe-area-inset-bottom, 0px))'}}>
      {showAura && <KokuAurasiModal profile={profile} lead={lead} onClose={()=>setShowAura(false)}/>}
      <div style={{position:'relative',zIndex:2,padding:isDesktop?'36px 48px 48px':'24px 22px 32px',maxWidth:isDesktop?700:undefined,margin:isDesktop?'0 auto':undefined}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
          <button onClick={onBack} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:999,background:'rgba(255,255,255,.75)',backdropFilter:'blur(14px)',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 4px 12px rgba(90,70,55,.08)',fontSize:13,fontWeight:500,color:T.soft,cursor:'pointer',fontFamily:'inherit'}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Geri
          </button>
          <button onClick={()=>setShowAura(true)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:999,background:'linear-gradient(135deg,#6E5038,#8B6FB5)',border:'none',boxShadow:'0 6px 14px rgba(110,80,56,.30)',fontSize:13,fontWeight:600,color:'#FFF',cursor:'pointer',fontFamily:'inherit'}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="#FFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Koku Auramı Paylaş
          </button>
        </div>

        {/* Eyebrow + Title */}
        <div style={{fontSize:10,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:6}}>
          {lead?.name ? `${lead.name}'in Koku Portresi` : 'Koku Portreniz'}
        </div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:isDesktop?52:42,letterSpacing:'-0.01em',color:T.ink,lineHeight:1.05,margin:'0 0 20px'}}>
          {profile.title.split(' ').map((w,i)=>i===0?<span key={i}>{w} </span>:<em key={i} style={{fontStyle:'italic'}}>{w}</em>)}
        </h1>

        {/* Subtitle card */}
        <div style={{padding:'16px 18px',borderRadius:18,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 8px 22px rgba(90,70,55,.08)',display:'flex',gap:14,alignItems:'flex-start',marginBottom:28}}>
          <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,rgba(192,138,126,.15),rgba(154,91,80,.15))',border:'1px solid rgba(192,138,126,.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 17.5s-6.5-4-6.5-9a4.5 4.5 0 0 1 6.5-4 4.5 4.5 0 0 1 6.5 4c0 5-6.5 9-6.5 9z" stroke={T.soft} strokeWidth="1.4" strokeLinejoin="round"/></svg>
          </div>
          <p style={{fontSize:14,lineHeight:1.6,color:T.soft,margin:0}}>{profile.subtitle}</p>
        </div>

        {/* Fal hikayesi */}
        {profile.fal_hikaye && (
          <div style={{padding:'14px 18px',borderRadius:18,background:'linear-gradient(135deg,rgba(110,80,56,.06),rgba(192,138,126,.08))',border:'1px solid rgba(192,138,126,.18)',marginBottom:24,display:'flex',gap:12,alignItems:'flex-start'}}>
            <span style={{fontSize:18,flexShrink:0,marginTop:1}}>🔮</span>
            <p style={{fontSize:18,lineHeight:1.6,color:T.ink,margin:0,fontFamily:'"Cormorant Garamond",serif',fontWeight:500}}>{profile.fal_hikaye}</p>
          </div>
        )}

        {/* Scent families */}
        <div style={{fontSize:10,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:14}}>Koku Aileleriniz</div>
        <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:28}}>
          {profile.scent_families.map((sf,i)=>(
            <div key={i}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <span style={{fontSize:14,fontWeight:500,color:T.ink}}>{sf.name}</span>
                <span style={{fontSize:13,fontWeight:600,color:T.soft}}>%{sf.pct}</span>
              </div>
              <div style={{height:6,borderRadius:999,background:'rgba(0,0,0,.05)',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${sf.pct}%`,borderRadius:999,background:SCENT_COLORS[sf.name]||'linear-gradient(90deg,#D8B3A8,#C79E92)',transition:'width .6s ease'}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon */}
        {coupon && (
          <div style={{padding:'20px 22px',borderRadius:22,background:'linear-gradient(135deg,#2B2640 0%,#3E3458 60%,#6E5038 100%)',boxShadow:'0 18px 36px rgba(43,38,64,.28)',marginBottom:28,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 110% -20%,rgba(232,222,243,.30),transparent 55%)',pointerEvents:'none'}}/>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="3" y="7" width="14" height="9" rx="1.5" stroke="#FFF" strokeWidth="1.3"/><path d="M7 7V5a3 3 0 0 1 6 0v2" stroke="#FFF" strokeWidth="1.3" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div style={{fontSize:9,letterSpacing:'0.22em',color:'rgba(255,255,255,.65)',fontWeight:600,textTransform:'uppercase'}}>ASYA'ya Özel Hediye</div>
                  <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:20,color:'#FFF',lineHeight:1.1}}>İlk Kokunuzda <em style={{fontStyle:'italic'}}>%10</em> İndirim</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:12,background:'rgba(255,255,255,.10)',border:'1px dashed rgba(255,255,255,.3)'}}>
                <div>
                  <div style={{fontSize:9,letterSpacing:'0.18em',color:'rgba(255,255,255,.6)',fontWeight:600,textTransform:'uppercase',marginBottom:2}}>Kupon Kodu</div>
                  <div style={{fontFamily:'monospace',fontWeight:700,fontSize:16,color:'#FFF',letterSpacing:'0.2em'}}>{coupon}</div>
                </div>
                <button onClick={()=>navigator.clipboard?.writeText(coupon)} style={{marginLeft:'auto',padding:'7px 14px',borderRadius:999,border:'none',background:'rgba(255,255,255,.15)',color:'#FFF',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:6}}>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.2" stroke="#FFF" strokeWidth="1.3"/><path d="M2 10V3a1 1 0 0 1 1-1h7" stroke="#FFF" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  Kopyala
                </button>
              </div>
              <div style={{marginTop:10,fontSize:11,color:'rgba(255,255,255,.5)'}}>İlk siparişinizde geçerli · 30 gün</div>
            </div>
          </div>
        )}

        {/* Top 3 */}
        <div style={{fontSize:10,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:14}}>Size En Yakın 3 Koku</div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {profile.top3.map((p,i)=>{
            const saved = gardrop.some(g=>g.name===p.name)
            return (
              <div key={i} onClick={()=>onProductTap(p)} style={{padding:'14px 16px',borderRadius:20,background:p.series==='elegancia'?'linear-gradient(135deg,rgba(43,38,64,.04),rgba(110,80,56,.06))':'rgba(255,255,255,.75)',backdropFilter:'blur(14px)',border:p.series==='elegancia'?'1px solid rgba(110,80,56,.20)':'1px solid rgba(255,255,255,.9)',boxShadow:'0 6px 18px rgba(90,70,55,.08)',display:'flex',alignItems:'center',gap:14,cursor:'pointer',transition:'transform .15s'}}>
                <div style={{width:52,height:52,borderRadius:14,background:'linear-gradient(160deg,#EADFD8,#F5F0FA)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden',border:'1px solid rgba(192,138,126,.15)'}}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={26} hue="#E8DAD2"/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  {p.series==='elegancia' && <div style={{display:'inline-block',fontSize:9,letterSpacing:'0.18em',fontWeight:700,color:'rgba(110,80,56,.9)',textTransform:'uppercase',marginBottom:3,padding:'2px 7px',borderRadius:999,background:'rgba(110,80,56,.10)',border:'1px solid rgba(110,80,56,.18)'}}>✦ Elegancia Premium</div>}
                  <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:18,color:T.ink,lineHeight:1.1,marginBottom:2}}>{p.name}</div>
                  <div style={{fontSize:12,color:T.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.top_notes?.length ? p.top_notes.slice(0,3).join(' · ') : (p.notes && !p.notes.startsWith('Üst Not') ? p.notes : '')}</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,flexShrink:0}}>
                  <div style={{padding:'4px 10px',borderRadius:999,background:'linear-gradient(135deg,rgba(192,138,126,.20),rgba(154,91,80,.20))',border:'1px solid rgba(192,138,126,.30)',fontSize:12,fontWeight:600,color:T.soft}}>%{p.match_pct}</div>
                  <button onClick={e=>{e.stopPropagation();onSaveToGardrop(p)}} style={{width:32,height:32,borderRadius:'50%',border:'none',background:saved?'rgba(192,138,126,.15)':'rgba(0,0,0,.04)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill={saved?T.soft:'none'}><path d="M8 13.5s-5-3-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 4-5 7-5 7z" stroke={T.soft} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Oda Kokusu Cross-Sell */}
        {profile.oda_kokusu && (
          <div style={{marginTop:28}}>
            <div style={{fontSize:10,letterSpacing:'0.28em',color:'#5B7A52',fontWeight:600,textTransform:'uppercase',marginBottom:14}}>🏠 Eviniz İçin Özel Seçim</div>
            <div style={{borderRadius:20,overflow:'hidden',border:'1px solid rgba(91,138,82,.18)',boxShadow:'0 6px 18px rgba(91,138,82,.08)'}}>
              {/* Başlık bandı */}
              <div style={{background:'linear-gradient(135deg,#3D6B38,#5B7A52)',padding:'10px 16px',display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:14}}>🕯️</span>
                <span style={{fontSize:9,letterSpacing:'0.22em',fontWeight:700,color:'rgba(255,255,255,.85)',textTransform:'uppercase'}}>Koku Profilinize Özel · 130ml Reed Diffuser</span>
              </div>
              <div style={{background:'rgba(255,255,255,.88)',backdropFilter:'blur(14px)',padding:'14px 16px',display:'flex',alignItems:'center',gap:14}}>
                {/* Görsel */}
                <div style={{width:56,height:56,borderRadius:14,background:'linear-gradient(160deg,#D6EBD3,#F0FAF0)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden',border:'1px solid rgba(91,138,82,.15)'}}>
                  {profile.oda_kokusu.image_url
                    ? <img src={profile.oda_kokusu.image_url} alt={profile.oda_kokusu.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    : <span style={{fontSize:26}}>🌿</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:17,color:T.ink,lineHeight:1.15,marginBottom:4}}>{profile.oda_kokusu.name}</div>
                  {profile.oda_kokusu.match_reason && (
                    <div style={{fontSize:12,color:'#4A6B46',lineHeight:1.4,marginBottom:8,fontStyle:'italic'}}>{profile.oda_kokusu.match_reason}</div>
                  )}
                  {coupon && (
                    <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:999,background:'rgba(91,138,82,.10)',border:'1px solid rgba(91,138,82,.20)'}}>
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M7 1L9 5l4 .6-2.9 2.8.7 4L7 10.4 3.2 12.4l.7-4L1 5.6l4-.6L7 1z" fill="#3D6B38"/></svg>
                      <span style={{fontSize:11,fontWeight:700,color:'#3D6B38'}}>%10 indirim — kod: {coupon}</span>
                    </div>
                  )}
                  {!coupon && (
                    <div style={{fontSize:11,color:'#5B7A52',fontWeight:600}}>Parfümünüzle birlikte evinizi de kokutun ✨</div>
                  )}
                </div>
                {profile.oda_kokusu.web_url && (
                  <a href={profile.oda_kokusu.web_url} target="_blank" rel="noopener noreferrer"
                    onClick={e=>e.stopPropagation()}
                    style={{flexShrink:0,padding:'8px 14px',borderRadius:999,background:'linear-gradient(135deg,#3D6B38,#5B7A52)',color:'#FFF',fontSize:12,fontWeight:600,textDecoration:'none',whiteSpace:'nowrap'}}>
                    İncele →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   PRODUCT DETAIL SCREEN
════════════════════════════════════════════ */
function ProductDetailScreen({product,onBack,onSave,saved,isDesktop}:{
  product:TopProduct; onBack:()=>void; onSave:(p:TopProduct)=>void; saved:boolean; isDesktop?:boolean
}) {
  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',background:'#FDFCFE',paddingBottom:isDesktop?0:'calc(108px + env(safe-area-inset-bottom, 0px))',zIndex:20}}>
      <div style={{padding:isDesktop?'36px 48px 48px':'24px 22px 32px',maxWidth:isDesktop?620:undefined,margin:isDesktop?'0 auto':undefined}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
          <button onClick={onBack} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:999,background:'rgba(255,255,255,.85)',backdropFilter:'blur(14px)',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 4px 12px rgba(90,70,55,.08)',fontSize:13,fontWeight:500,color:T.soft,cursor:'pointer',fontFamily:'inherit'}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Geri
          </button>
          <button onClick={()=>onSave(product)} style={{width:40,height:40,borderRadius:'50%',border:'none',background:saved?'rgba(192,138,126,.15)':'rgba(255,255,255,.85)',boxShadow:'0 4px 12px rgba(90,70,55,.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill={saved?T.soft:'none'}><path d="M9 15s-6-3.5-6-8a4 4 0 0 1 6-3.46A4 4 0 0 1 15 7c0 4.5-6 8-6 8z" stroke={T.soft} strokeWidth="1.4" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* Product Image */}
        <div style={{borderRadius:24,overflow:'hidden',background:'linear-gradient(160deg,#F0E7E0,#EADFD8)',marginBottom:24,aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            : <BottleGlyph size={120} hue="#EADFD8"/>
          }
        </div>

        {/* Title */}
        {product.series==='elegancia' && <div style={{display:'inline-block',fontSize:10,letterSpacing:'0.18em',fontWeight:700,color:'rgba(110,80,56,.85)',textTransform:'uppercase',marginBottom:8,padding:'4px 12px',borderRadius:999,background:'rgba(110,80,56,.08)',border:'1px solid rgba(110,80,56,.18)'}}>✦ Elegancia Premium · 100ml Extrait</div>}
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:isDesktop?42:36,color:T.ink,letterSpacing:'-0.01em',margin:'0 0 20px',lineHeight:1.1}}>{product.name}</h1>

        {/* Notes pyramid */}
        <div style={{fontSize:10,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:12}}>Notalar Piramidi</div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:24,padding:18,borderRadius:20,background:'rgba(255,255,255,.75)',backdropFilter:'blur(14px)',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 6px 18px rgba(90,70,55,.06)'}}>
          {[{label:'ÜST NOTALAR',notes:product.top_notes},{label:'KALP',notes:product.heart_notes},{label:'DİP',notes:product.base_notes}].map((tier,i)=>(
            <div key={i} style={{paddingBottom:i<2?12:0,borderBottom:i<2?'1px solid rgba(90,70,55,.08)':'none'}}>
              <div style={{fontSize:9,letterSpacing:'0.22em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:6}}>{tier.label}</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {(tier.notes||[]).map((n,j)=>(
                  <span key={j} style={{padding:'4px 10px',borderRadius:999,background:'rgba(192,138,126,.10)',border:'1px solid rgba(192,138,126,.20)',fontSize:13,color:T.ink}}>{n}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Story */}
        {product.story && (
          <>
            <div style={{fontSize:10,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:10}}>Hikaye</div>
            <p style={{fontSize:14.5,lineHeight:1.65,color:T.soft,marginBottom:28}}>{product.story}</p>
          </>
        )}

        {/* CTA buttons */}
        <div style={{display:'flex',gap:12,flexDirection:'column'}}>
          <a href={product.web_url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'16px 24px',borderRadius:999,background:'linear-gradient(135deg,#C08A7E,#9A5B50)',boxShadow:'0 14px 28px rgba(154,91,80,.28)',fontSize:15,fontWeight:500,color:'#FFF',textDecoration:'none',cursor:'pointer'}}>
            Ürünü İncele →
          </a>
          <button onClick={()=>onSave(product)} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'14px 24px',borderRadius:999,border:'1px solid rgba(192,138,126,.3)',background:'rgba(255,255,255,.75)',backdropFilter:'blur(14px)',fontSize:14,fontWeight:500,color:T.soft,cursor:'pointer',fontFamily:'inherit'}}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill={saved?T.soft:'none'}><path d="M9 15s-6-3.5-6-8a4 4 0 0 1 6-3.46A4 4 0 0 1 15 7c0 4.5-6 8-6 8z" stroke={T.soft} strokeWidth="1.4" strokeLinejoin="round"/></svg>
            {saved ? 'Gardıroba Eklendi' : 'Gardıroba Ekle'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   FAQ SCREEN
════════════════════════════════════════════ */
function FAQScreen({onBack,isDesktop,lead}:{onBack:()=>void;isDesktop?:boolean;lead:Lead|null}) {
  const [msgs,setMsgs] = useState<{role:'user'|'asya';text:string}[]>([])
  const [input,setInput] = useState('')
  const [loading,setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const send = async (text:string) => {
    if (!text.trim()||loading) return
    const newMsgs = [...msgs,{role:'user' as const,text}]
    setMsgs(newMsgs)
    setInput('')
    setLoading(true)
    try {
      const history = newMsgs.map(m=>({role:m.role==='user'?'user':'assistant',content:m.text}))
      const res = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history,mode:'faq'})})
      const data = await res.json()
      setMsgs(m=>[...m,{role:'asya',text:data.output||''}])
    } catch { setMsgs(m=>[...m,{role:'asya',text:'Üzgünüm, şu an yanıt veremiyorum. Lütfen tekrar deneyin.'}]) }
    setLoading(false)
  }

  useEffect(()=>{
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  },[msgs,loading])

  // Initial quick replies on first render
  const quickReplies = [
    'Kargo ücreti nedir?',
    'Siparişim ne zaman kargoya verilir?',
    'Elegancia serisi nedir?',
    'Toptan satış yapıyor musunuz?',
    'Franchise / bayilik mümkün mü?',
    'Ürünleriniz orijinal mi?',
  ]

  return (
    <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',background:'#FDFCFE',zIndex:isDesktop?undefined:15}}>
      {/* Header */}
      <div style={{flexShrink:0,padding:isDesktop?'28px 48px 20px':'20px 22px 14px',borderBottom:'1px solid rgba(90,70,55,.08)',background:'rgba(255,255,255,.75)',backdropFilter:'blur(14px)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:isDesktop?12:10}}>
          {!isDesktop && (
            <button onClick={onBack} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:999,background:'rgba(255,255,255,.85)',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 4px 10px rgba(90,70,55,.07)',fontSize:13,fontWeight:500,color:T.soft,cursor:'pointer',fontFamily:'inherit'}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Geri
            </button>
          )}
          <span style={{fontSize:10,letterSpacing:'0.22em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>Hakkımızda · SSS</span>
          <span style={{fontSize:11,fontWeight:600,color:T.soft,padding:'4px 10px',borderRadius:999,background:'rgba(192,138,126,.12)',border:'1px solid rgba(192,138,126,.25)'}}>Yardım</span>
        </div>
        <h2 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:isDesktop?40:32,color:T.ink,margin:'0 0 4px',letterSpacing:'-0.01em'}}>Bize <em style={{fontStyle:'italic'}}>sorun.</em></h2>
        <p style={{fontSize:13,color:T.muted,margin:0,lineHeight:1.5}}>Kargo, üyelik, toptan sipariş veya parfümler hakkında her soruyu yanıtlarım.</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{flex:1,overflowY:'auto',padding:'16px 22px'}}>
        {msgs.length===0 && (
          <div style={{paddingTop:8}}>
            <div style={{fontSize:10,letterSpacing:'0.20em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:10}}>Sık Sorulanlar</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {quickReplies.map(q=>(
                <button key={q} onClick={()=>send(q)} style={{padding:'13px 18px',borderRadius:14,background:'rgba(255,255,255,.75)',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 4px 12px rgba(90,70,55,.06)',fontSize:14,color:T.ink,textAlign:'left',cursor:'pointer',fontFamily:'inherit',fontWeight:400}}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',marginTop:12}}>
            {m.role==='asya' && <AsyaAvatar size={28}/>}
            <div style={{maxWidth:'78%',marginLeft:m.role==='asya'?10:0,padding:'11px 14px',borderRadius:m.role==='asya'?'16px 16px 16px 5px':'16px 16px 5px 16px',background:m.role==='asya'?'rgba(255,255,255,.75)':'linear-gradient(135deg,#D8B3A8,#C79E92)',border:m.role==='asya'?'1px solid rgba(255,255,255,.9)':'none',boxShadow:m.role==='asya'?'0 4px 12px rgba(90,70,55,.08)':'0 6px 16px rgba(154,91,80,.20)',fontSize:14,lineHeight:1.5,color:m.role==='asya'?T.ink:'#FFF',backdropFilter:m.role==='asya'?'blur(10px)':undefined}}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:'flex',gap:10,alignItems:'flex-end',marginTop:12}}>
            <AsyaAvatar size={28}/>
            <div style={{padding:'11px 14px',background:'rgba(255,255,255,.75)',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,.9)',borderRadius:'16px 16px 16px 5px',boxShadow:'0 4px 12px rgba(90,70,55,.08)'}}>
              <TypingDots/>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{flexShrink:0,paddingTop:12,paddingLeft:22,paddingRight:22,paddingBottom:'calc(16px + env(safe-area-inset-bottom, 0px))',display:'flex',gap:10,alignItems:'flex-end',borderTop:'1px solid rgba(90,70,55,.06)',background:'rgba(255,255,255,.6)',backdropFilter:'blur(16px)'}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send(input)}} placeholder="Sorunuzu yazın..." style={{flex:1,height:48,borderRadius:14,border:'1.5px solid rgba(192,138,126,.35)',background:'rgba(255,255,255,.8)',padding:'0 16px',fontSize:16,fontFamily:'inherit',color:T.ink,outline:'none'}}/>
        <button onClick={()=>send(input)} disabled={loading||!input.trim()} style={{width:48,height:48,borderRadius:'50%',border:'none',flexShrink:0,cursor:loading||!input.trim()?'default':'pointer',background:'linear-gradient(135deg,#C08A7E,#9A5B50)',boxShadow:loading||!input.trim()?'none':'0 8px 20px rgba(154,91,80,.28)',display:'flex',alignItems:'center',justifyContent:'center',opacity:loading||!input.trim()?.4:1,transition:'all .15s'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
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
      <p style={{position:'relative',zIndex:2,fontSize:11,letterSpacing:'0.28em',textTransform:'uppercase',fontWeight:500,color:T.muted}}>Yapay Zeka Destekli Kişisel Koku Asistanı</p>
      <div style={{position:'relative',zIndex:2,marginTop:32,width:260,height:340,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
        <div style={{position:'absolute',inset:-24,borderRadius:'50%',background:'radial-gradient(ellipse at 50% 35%,rgba(244,238,252,.95),transparent 65%)',filter:'blur(10px)'}}/>
        <div style={{position:'relative',zIndex:1,width:224,height:300,borderRadius:22,boxShadow:'0 30px 60px rgba(90,70,55,.18),0 0 0 1px rgba(255,255,255,.6)',overflow:'hidden',background:'linear-gradient(160deg,#F3EAE4,#E3ECF5)'}}>
          <img src="/hero-welcome.jpg" alt="ASYA" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}}/>
          <div style={{position:'absolute',left:0,right:0,bottom:0,height:80,background:'linear-gradient(to bottom,transparent,#FAFAFE 95%)',pointerEvents:'none'}}/>
        </div>
      </div>
      <h1 style={{position:'relative',zIndex:2,fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:42,color:T.ink,letterSpacing:'-0.01em',margin:'20px 0 4px',textAlign:'center'}}>ASYA ile Tanışın</h1>
      <p style={{position:'relative',zIndex:2,fontSize:13,letterSpacing:'0.18em',textTransform:'uppercase',fontWeight:500,color:T.soft,margin:0}}>ASYA Kişisel Koku Asistanı · Elegance VIP</p>
      <div style={{flex:1}}/>
      <div ref={trackRef} style={{position:'relative',zIndex:2,width:280,height:64,marginBottom:56,borderRadius:999,background:T.glassS,backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:`1px solid ${T.glassE}`,boxShadow:T.shadow,display:'flex',alignItems:'center',justifyContent:'center',userSelect:'none',touchAction:'none'}}>
        <span style={{fontSize:12,letterSpacing:'0.18em',color:T.soft,textTransform:'uppercase',fontWeight:500,opacity:Math.max(0,1-dragX/110),paddingLeft:72}}>Başlamak için kaydır</span>
        <div style={{position:'absolute',left:3,top:3,height:58,width:dragX+58,borderRadius:999,background:'linear-gradient(90deg,rgba(192,138,126,.45),rgba(154,91,80,.45))',transition:dragging?'none':'width .25s ease',pointerEvents:'none'}}/>
        <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} style={{position:'absolute',left:3+dragX,top:3,width:58,height:58,borderRadius:'50%',background:'linear-gradient(145deg,#FFF,#EFE6DF)',boxShadow:T.neoO,display:'flex',alignItems:'center',justifyContent:'center',cursor:'grab',transition:dragging?'none':'left .25s ease'}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M7 5l6 6-6 6" stroke={T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 5l6 6-6 6" stroke={T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity=".5"/></svg>
        </div>
      </div>
    </div>
  )
}

const mTabs = [
  {id:'home',label:'Ana Sayfa',g:(a:boolean)=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10l7-6 7 6v6a1 1 0 0 1-1 1h-3v-5h-6v5H4a1 1 0 0 1-1-1z" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4" strokeLinejoin="round"/></svg>},
  {id:'chat',label:'Sohbet',g:(a:boolean)=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 9.5C3 6 6 4 10 4s7 2 7 5.5S14 15 10 15c-.7 0-1.4-.06-2-.18L5 16l.5-2.4A5 5 0 0 1 3 9.5z" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4" strokeLinejoin="round"/></svg>},
  {id:'wardrobe',label:'Gardırop',g:(a:boolean)=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 7.2a1.7 1.7 0 1 1 1.7-1.7" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4" strokeLinecap="round"/><path d="M10 7.2v1.5L2 14h16L10 8.7" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4" strokeLinejoin="round"/></svg>},
  {id:'profile',label:'Koku Profili',g:(a:boolean)=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4"/><path d="M3 17c.8-3.4 3.7-5 7-5s6.2 1.6 7 5" stroke={a?'#FFF':'#5E5878'} strokeWidth="1.4" strokeLinecap="round"/></svg>},
] as const

function MobileTabBar({active,onChange}:{active:MainTab;onChange:(t:MainTab)=>void}) {
  return (
    <div style={{position:'absolute',left:14,right:14,bottom:'calc(env(safe-area-inset-bottom, 0px) + 8px)',zIndex:10,paddingTop:8,paddingLeft:6,paddingRight:6,paddingBottom:'calc(8px + env(safe-area-inset-bottom, 0px))',borderRadius:999,background:'rgba(255,255,255,.78)',backdropFilter:'blur(22px) saturate(1.3)',WebkitBackdropFilter:'blur(22px) saturate(1.3)',border:'1px solid rgba(255,255,255,.9)',boxShadow:'0 18px 40px rgba(90,70,55,.18),inset 0 1px 0 rgba(255,255,255,.9)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      {mTabs.map(t=>{
        const isA = active===t.id
        return (
          <button key={t.id} onClick={()=>onChange(t.id as MainTab)} style={{flex:1,padding:'8px 4px',borderRadius:999,border:'none',background:isA?T.accent:'transparent',boxShadow:isA?'0 6px 14px rgba(154,91,80,.25)':'none',display:'flex',flexDirection:'column',alignItems:'center',gap:2,cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}}>
            {t.g(isA)}
            <span style={{fontSize:9.5,fontWeight:isA?600:500,color:isA?'#FFF':T.muted,letterSpacing:'0.04em'}}>{t.label}</span>
          </button>
        )
      })}
      <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer" style={{flex:1,padding:'8px 4px',borderRadius:999,border:'none',background:'transparent',display:'flex',flexDirection:'column',alignItems:'center',gap:2,cursor:'pointer',textDecoration:'none'}}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={T.soft} strokeWidth="1.4"/><path d="M10 2.5C10 2.5 7 5.5 7 10s3 7.5 3 7.5" stroke={T.soft} strokeWidth="1.4" strokeLinecap="round"/><path d="M10 2.5C10 2.5 13 5.5 13 10s-3 7.5-3 7.5" stroke={T.soft} strokeWidth="1.4" strokeLinecap="round"/><path d="M2.5 10h15" stroke={T.soft} strokeWidth="1.4" strokeLinecap="round"/></svg>
        <span style={{fontSize:9.5,fontWeight:500,color:T.muted,letterSpacing:'0.04em'}}>Siteye Dön</span>
      </a>
    </div>
  )
}

const dashTiles: Array<{title:string;titleB:string;g:React.ReactElement;mode:ChatMode|'vision'}> = [
  {title:'Koku Profilini',titleB:'Keşfet',mode:'profil',g:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="6" stroke="#5E5878" strokeWidth="1.4"/><circle cx="14" cy="14" r="10.5" stroke="#5E5878" strokeWidth="1.4" opacity=".45"/><circle cx="14" cy="14" r="1.6" fill="#5E5878"/></svg>},
  {title:'Muadil',titleB:'Bul',mode:'muadil',g:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><rect x="6" y="9" width="7" height="14" rx="1.5" stroke="#5E5878" strokeWidth="1.4"/><rect x="15" y="5" width="7" height="18" rx="1.5" stroke="#5E5878" strokeWidth="1.4" opacity=".55"/></svg>},
  {title:'Şişe',titleB:'Tara',mode:'vision',g:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><rect x="4" y="8" width="20" height="15" rx="2.5" stroke="#5E5878" strokeWidth="1.4"/><circle cx="14" cy="15.5" r="4" stroke="#5E5878" strokeWidth="1.4"/><path d="M10 8V6.5A1.5 1.5 0 0 1 11.5 5h5A1.5 1.5 0 0 1 18 6.5V8" stroke="#5E5878" strokeWidth="1.4"/></svg>},
  {title:'Hediye',titleB:'Sihirbazı',mode:'hediye',g:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><rect x="5" y="11" width="18" height="12" rx="1.5" stroke="#5E5878" strokeWidth="1.4"/><path d="M5 15h18M14 11v12" stroke="#5E5878" strokeWidth="1.4"/></svg>},
  {title:'Günün',titleB:'İlhamı',mode:'ilham',g:<svg width="26" height="26" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="4.5" stroke="#5E5878" strokeWidth="1.4"/><path d="M14 3v3M14 22v3M3 14h3M22 14h3" stroke="#5E5878" strokeWidth="1.4" strokeLinecap="round"/></svg>},
]

function MobileHome({lead,onGoChat,onGoUnboxing,onGoFaq}:{lead:Lead|null;onGoChat:(mode:ChatMode|'vision')=>void;onGoUnboxing:()=>void;onGoFaq:()=>void}) {
  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:'calc(108px + env(safe-area-inset-bottom, 0px))'}}>
      <Bg variant="b"/>
      <div style={{position:'relative',zIndex:2,padding:'18px 28px 0'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:40}}>
          <div style={{padding:'10px 18px',borderRadius:999,background:T.glassS,backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 4px 12px rgba(90,70,55,.08)',fontSize:13,fontWeight:500,color:T.ink,display:'flex',alignItems:'center',gap:8}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke={T.soft} strokeWidth="1.4" strokeLinecap="round"/></svg>
            Koku Testi
          </div>
        </div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:36,lineHeight:1.08,color:T.ink,letterSpacing:'-0.01em',margin:'0 0 12px'}}>
          Selam{lead?`, ${lead.name.split(' ')[0]}`:''},<br/>Ben <em style={{fontStyle:'italic'}}>ASYA</em>.<br/>Bugün ruhunuzu<br/>yansıtacak kokuyu<br/>bulalım.
        </h1>
        {/* Lifestyle hero banner */}
        <div style={{position:'relative',borderRadius:22,overflow:'hidden',marginBottom:24,height:220,boxShadow:'0 12px 28px rgba(90,70,55,.16)'}}>
          <img src="/hero-mobile.jpg" alt="Elegance VIP" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 20%'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(43,38,64,0) 45%,rgba(43,38,64,.62) 100%)'}}/>
          <div style={{position:'absolute',bottom:16,left:18,color:'#FFF'}}>
            <div style={{fontSize:10,letterSpacing:'0.22em',fontWeight:600,textTransform:'uppercase',opacity:.75,fontFamily:'Arial,sans-serif'}}>Elegance VIP Perfume</div>
            <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:20,fontWeight:500,lineHeight:1.1,marginTop:2}}>Sizin İçin Seçilmiş Kokular</div>
          </div>
        </div>
        <p style={{fontSize:13.5,color:T.soft,lineHeight:1.55,margin:'0 0 24px'}}>Koku dünyanızı keşfetmek için bir seçenek belirleyin:</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
          {dashTiles.map((t,i)=>(
            <button key={i} onClick={()=>onGoChat(t.mode)} style={{height:108,padding:'14px 16px',borderRadius:22,background:T.glass,backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',border:`1px solid ${T.glassE}`,boxShadow:'0 10px 24px rgba(90,70,55,.10),inset 0 1px 0 rgba(255,255,255,.8)',display:'flex',flexDirection:'column',justifyContent:'space-between',cursor:'pointer',fontFamily:'inherit',textAlign:'left'}}>
              <div>{t.g}</div>
              <div style={{fontSize:14,fontWeight:500,lineHeight:1.2,color:T.ink}}>{t.title}<br/>{t.titleB}</div>
            </button>
          ))}
        </div>
        <button onClick={()=>onGoChat('profil')} style={{width:'100%',height:60,borderRadius:999,padding:'0 10px 0 24px',background:T.glassS,backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:`1px solid ${T.glassE}`,boxShadow:T.shadow,display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',fontFamily:'inherit',marginBottom:12}}>
          <span style={{fontSize:15,color:T.ink,fontWeight:500}}>ASYA ile sohbete başla</span>
          <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(145deg,#FFF,#EFE6DF)',boxShadow:T.neoO,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M10.5 4.5L15 9l-4.5 4.5" stroke={T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </button>
        <button onClick={onGoFaq} style={{width:'100%',height:52,borderRadius:999,padding:'0 10px 0 24px',background:'rgba(255,255,255,.55)',backdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',fontFamily:'inherit',marginBottom:20}}>
          <span style={{fontSize:14,color:T.soft,fontWeight:500}}>💬 Hakkımızda & Sık Sorulanlar</span>
          <div style={{width:36,height:36,borderRadius:'50%',background:'rgba(90,70,55,.06)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 5.5C5 4 6 3 7 3s2 .9 2 2c0 .9-.5 1.5-1.2 2L7 8" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"/><circle cx="7" cy="10.5" r=".8" fill={T.muted}/></svg>
          </div>
        </button>
      </div>
    </div>
  )
}

function MobileChat({chatLogic,onGoProfile,onGoScentProfile,chatMode,onGoMuadil,onGoGift,onGoVision,onGoCatalog}:{chatLogic:ReturnType<typeof useChatLogic>;onGoProfile:()=>void;onGoScentProfile:()=>void;chatMode:ChatMode;onGoMuadil?:()=>void;onGoGift?:()=>void;onGoVision?:()=>void;onGoCatalog?:()=>void}) {
  return (
    <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',zIndex:5}}>
      <Bg variant="c"/>
      <div style={{position:'relative',zIndex:3,padding:'14px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'6px 14px 6px 6px',borderRadius:999,background:T.glassS,backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 4px 12px rgba(90,70,55,.08)'}}>
          <AsyaAvatar size={30}/>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:T.ink}}>ASYA</div>
            <div style={{fontSize:10.5,color:T.muted,display:'flex',alignItems:'center',gap:4}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#7FB48C',display:'inline-block'}}/>çevrimiçi
            </div>
          </div>
        </div>
        <button onClick={chatLogic.reset} style={{padding:'8px 14px',borderRadius:999,background:T.glassS,backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 4px 12px rgba(90,70,55,.08)',fontSize:12.5,fontWeight:500,color:T.soft,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:6}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.soft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
          Baştan Başla
        </button>
      </div>
      <div style={{position:'relative',zIndex:2,flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <ChatPanel chatLogic={chatLogic} onGoProfile={onGoProfile} onGoScentProfile={onGoScentProfile} mode={chatMode} onGoMuadil={onGoMuadil} onGoGift={onGoGift} onGoVision={onGoVision} onGoCatalog={onGoCatalog}/>
      </div>
    </div>
  )
}

function CatalogGrid({products}:{products:CatProduct[]}) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {products.map((p,i)=>(
        <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',padding:14,borderRadius:20,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 8px 22px rgba(90,70,55,.08)',display:'block',position:'relative'}}>
          {p.series==='elegancia' && (
            <div style={{position:'absolute',top:10,right:10,padding:'3px 8px',borderRadius:999,background:'rgba(110,80,56,.85)',color:'#FFF',fontSize:9,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',zIndex:2}}>✦ Niş</div>
          )}
          <div style={{aspectRatio:'1',borderRadius:14,background:'linear-gradient(160deg,#EADFD8,#FFF)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10,overflow:'hidden'}}>
            {p.img ? <img src={p.img} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={60} hue="#EADFD8"/>}
          </div>
          <div style={{fontSize:10,letterSpacing:'0.14em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>{p.scent}</div>
          <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:17,color:T.ink,lineHeight:1.15,marginTop:2}}>{p.name}</div>
        </a>
      ))}
    </div>
  )
}

function MobileCatalog() {
  const [section,setSection] = useState<'gold'|'elegancia'>('gold')
  const [gender,setGender] = useState('Tümü')
  const [scent,setScent] = useState('Tümü')

  const isNis = section==='elegancia'
  const pool = isNis ? eleganciaProducts : goldProducts
  const scentFams = isNis ? elegScentFamilies : goldScentFamilies

  const filtered = pool
    .filter(p => gender==='Tümü' || p.gender===GENDER_MAP[gender])
    .filter(p => scent==='Tümü' || p.scent===scent)

  const resetFilters = (s:typeof section) => { setSection(s); setGender('Tümü'); setScent('Tümü') }

  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:'calc(108px + env(safe-area-inset-bottom, 0px))'}}>
      <Bg variant="b"/>
      <div style={{position:'relative',zIndex:2,padding:'18px 20px 0'}}>
        <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>Elegance VIP</div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:34,color:T.ink,letterSpacing:'-0.01em',margin:'0 0 16px'}}>Koku <em style={{fontStyle:'italic'}}>Koleksiyonu</em></h1>

        {/* Section tabs */}
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {([['gold','Gold & Classic'],['elegancia','✦ Niş Parfüm']] as const).map(([s,label])=>(
            <button key={s} onClick={()=>resetFilters(s)} style={{flex:1,padding:'10px 8px',borderRadius:14,border:'none',background:section===s?s==='elegancia'?'linear-gradient(135deg,#6E5038,#8B6FB5)':T.accent:'rgba(255,255,255,.7)',color:section===s?'#FFF':T.soft,fontSize:13,fontWeight:section===s?700:500,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',boxShadow:section===s?'0 6px 14px rgba(154,91,80,.25)':undefined}}>
              {label}
            </button>
          ))}
        </div>

        {/* Gender filter (Gold only) */}
        {!isNis && (
          <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:6,marginBottom:10}}>
            {GENDERS.map(g=>(
              <button key={g} onClick={()=>setGender(g)} style={{padding:'6px 14px',borderRadius:999,border:gender===g?'none':'1px solid rgba(90,70,55,.12)',background:gender===g?'rgba(192,138,126,.25)':'rgba(255,255,255,.7)',color:gender===g?T.ink:T.soft,fontSize:12,fontWeight:gender===g?600:400,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',flexShrink:0}}>
                {g}
              </button>
            ))}
          </div>
        )}

        {/* Scent filter */}
        <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:12,marginBottom:12}}>
          {scentFams.map(f=>(
            <button key={f} onClick={()=>setScent(f)} style={{padding:'8px 16px',borderRadius:999,border:'none',background:f===scent?T.accent:'rgba(255,255,255,.7)',color:f===scent?'#FFF':T.soft,fontSize:13,fontWeight:f===scent?600:500,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',boxShadow:f===scent?'0 6px 14px rgba(154,91,80,.25)':undefined,flexShrink:0}}>
              {f}
            </button>
          ))}
        </div>

        <div style={{fontSize:11,color:T.muted,marginBottom:12}}>{filtered.length} koku</div>

        <CatalogGrid products={filtered}/>
      </div>
    </div>
  )
}

function MobileWardrobe({gardrop,onRemove,onGoChat}:{gardrop:GItem[];onRemove:(name:string)=>void;onGoChat:()=>void}) {
  const [catFilter,setCatFilter] = useState('Tümü')
  const categories = ['Tümü','☀️ Günlük','🌸 Romantik','🌙 Gece','🔥 Oryantal','✦ Lüks']
  const filtered = catFilter==='Tümü' ? gardrop : gardrop.filter(g=>getScentCategory(g)===catFilter)
  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:'calc(108px + env(safe-area-inset-bottom, 0px))'}}>
      <Bg variant="c"/>
      <div style={{position:'relative',zIndex:2,padding:'18px 20px 0'}}>
        <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>Koleksiyonunuz</div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:34,color:T.ink,letterSpacing:'-0.01em',margin:'0 0 16px'}}>Koku <em style={{fontStyle:'italic'}}>Gardırobum</em></h1>
        <WeatherGreeting gardrop={gardrop}/>
        {/* Category tabs */}
        {gardrop.length>0 && (
          <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:8,marginBottom:14}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>setCatFilter(c)} style={{padding:'6px 13px',borderRadius:999,border:'none',background:c===catFilter?T.accent:'rgba(255,255,255,.75)',color:c===catFilter?'#FFF':T.soft,fontSize:11.5,fontWeight:c===catFilter?600:400,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',flexShrink:0,boxShadow:c===catFilter?'0 4px 10px rgba(154,91,80,.25)':undefined}}>
                {c}
              </button>
            ))}
          </div>
        )}
        {filtered.length===0 && gardrop.length>0 && (
          <p style={{fontSize:13,color:T.muted,marginBottom:16}}>Bu kategoride kayıtlı koku yok.</p>
        )}
        {gardrop.length===0 ? (
          <div style={{background:'rgba(255,255,255,.55)',backdropFilter:'blur(14px)',borderRadius:22,border:`1px solid ${T.glassE}`,overflow:'hidden'}}>
            <div style={{position:'relative',height:240}}>
              <img src="/koku gardrobu.jpg" alt="Koku Gardırobu" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center center'}}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(43,38,64,0) 40%,rgba(43,38,64,.65) 100%)'}}/>
              <div style={{position:'absolute',bottom:16,left:18,color:'#FFF'}}>
                <div style={{fontSize:9,letterSpacing:'0.26em',fontWeight:600,textTransform:'uppercase',opacity:.75,fontFamily:'Inter,sans-serif'}}>Kişisel Koleksiyonunuz</div>
                <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:20,fontWeight:500,marginTop:3}}>Koku <em style={{fontStyle:'italic'}}>Gardırobum</em></div>
              </div>
            </div>
            <div style={{textAlign:'center',padding:'24px 20px 28px'}}>
              <p style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:22,color:T.ink,margin:'0 0 8px'}}>Gardırobunuz henüz boş</p>
              <p style={{fontSize:13,color:T.soft,marginBottom:22}}>ASYA ile sohbet ederek imza kokunuzu keşfedin ve gardırobunuzu oluşturun.</p>
              <button onClick={onGoChat} style={{display:'inline-flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,#6E5038,#9A5B50)',color:'#FFF',border:'none',borderRadius:999,padding:'12px 24px',fontSize:13.5,fontWeight:600,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 8px 20px rgba(110,80,56,.35)',letterSpacing:'0.01em'}}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 9.5C3 6 6 4 10 4s7 2 7 5.5S14 15 10 15c-.7 0-1.4-.06-2-.18L5 16l.5-2.4A5 5 0 0 1 3 9.5z" stroke="#FFF" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                ASYA ile Koku Gardırobumu Oluştur
              </button>
            </div>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {filtered.map((item,i)=>(
              <div key={i} style={{padding:16,borderRadius:20,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 8px 22px rgba(90,70,55,.08)',display:'flex',gap:14,alignItems:'center'}}>
                {item.series==='elegancia' && <div style={{position:'absolute',fontSize:9,padding:'2px 7px',borderRadius:999,background:'rgba(110,80,56,.85)',color:'#FFF',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',top:10,right:52}}>✦</div>}
                <div style={{width:64,height:64,borderRadius:14,background:'linear-gradient(160deg,#EADFD8,#FFF)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'}}>
                  {item.image_url ? <img src={item.image_url} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={28} hue="#EADFD8"/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:18,color:T.ink,lineHeight:1.15}}>{item.name}</div>
                  <a href={item.web_url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:T.soft,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4,marginTop:4}}>İncele →</a>
                </div>
                <button onClick={()=>onRemove(item.name)} title="Gardıroptan çıkar" style={{width:36,height:36,borderRadius:'50%',border:'none',background:'rgba(220,100,100,.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,color:'rgba(180,80,80,.7)',transition:'all .15s'}}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V3h4v1M5 4l.5 8h5L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <WardrobeGapAnalysis gardrop={gardrop}/>
      </div>
    </div>
  )
}

function MobileProfile({lead,coupon,onGoChat}:{lead:Lead|null;coupon:string|null;onGoChat:()=>void}) {
  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:'calc(108px + env(safe-area-inset-bottom, 0px))'}}>
      <Bg variant="a"/>
      <div style={{position:'relative',zIndex:2,padding:'18px 28px 0'}}>
        {!lead ? (
          <div style={{background:'rgba(255,255,255,.55)',backdropFilter:'blur(14px)',borderRadius:22,border:`1px solid ${T.glassE}`,overflow:'hidden'}}>
            <div style={{position:'relative',height:240}}>
              <img src="/koku profili.jpg" alt="Koku Profili" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center center'}}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(43,38,64,0) 40%,rgba(43,38,64,.68) 100%)'}}/>
              <div style={{position:'absolute',bottom:16,left:18,color:'#FFF'}}>
                <div style={{fontSize:9,letterSpacing:'0.26em',fontWeight:600,textTransform:'uppercase',opacity:.75,fontFamily:'Inter,sans-serif'}}>Kişisel Koku Portresi</div>
                <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:20,fontWeight:500,marginTop:3}}>Koku <em style={{fontStyle:'italic'}}>Profiliniz</em></div>
              </div>
            </div>
            <div style={{textAlign:'center',padding:'24px 20px 28px'}}>
              <p style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:22,color:T.ink,margin:'0 0 8px'}}>Henüz profiliniz oluşturulmadı</p>
              <p style={{fontSize:13,color:T.soft,lineHeight:1.55,marginBottom:22}}>ASYA ile sohbet ettikten sonra kişisel koku profiliniz burada görünür.</p>
              <button onClick={onGoChat} style={{display:'inline-flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,#6E5038,#9A5B50)',color:'#FFF',border:'none',borderRadius:999,padding:'12px 24px',fontSize:13.5,fontWeight:600,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 8px 20px rgba(110,80,56,.35)',letterSpacing:'0.01em'}}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 9.5C3 6 6 4 10 4s7 2 7 5.5S14 15 10 15c-.7 0-1.4-.06-2-.18L5 16l.5-2.4A5 5 0 0 1 3 9.5z" stroke="#FFF" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                ASYA ile Profil Oluştur
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>{lead.name}'in Koku Portresi</div>
            <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:34,color:T.ink,letterSpacing:'-0.01em',margin:'0 0 24px'}}>Koku <em style={{fontStyle:'italic'}}>Profilim</em></h1>
            {coupon && (
              <div style={{padding:20,borderRadius:20,background:'linear-gradient(135deg,#2B2640 0%,#3E3458 60%,#6E5038 100%)',boxShadow:'0 18px 36px rgba(43,38,64,.30)',color:'#FFF',marginBottom:20,position:'relative',overflow:'hidden'}}>
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
            <div style={{padding:20,borderRadius:20,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 8px 22px rgba(90,70,55,.08)'}}>
              <p style={{fontSize:13.5,color:T.soft,lineHeight:1.6,margin:0}}>Koku profiliniz sohbet geçmişinize göre oluşturulur. ASYA ile konuşmaya devam ederek profilinizi zenginleştirin.</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   VİZYON (ŞİŞE TARA) SCREEN
════════════════════════════════════════════ */
type VisionResult = { type: string; identified?: string; confidence?: number; output: string; product?: { code?: string; name: string; series?: string; notes?: string; image_url?: string; web_url?: string; woo_id?: number } }

function VisionScreen({onBack,onGoChat,onSaveToGardrop,onGoMuadil}:{onBack:()=>void;onGoChat:(mode:ChatMode)=>void;onSaveToGardrop?:(p:Prod)=>void;onGoMuadil?:()=>void}) {
  const [status,setStatus] = useState<'idle'|'compressing'|'loading'|'done'|'error'>('idle')
  const [result,setResult] = useState<VisionResult|null>(null)
  const [preview,setPreview] = useState<string|null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setStatus('compressing')
    setResult(null)
    try {
      const compressed = await compressImage(file)
      setPreview(compressed)
      setStatus('loading')
      const res = await fetch('/api/vision', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ imageDataUrl: compressed }) })
      const data: VisionResult = await res.json()
      setResult(data)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const onDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) handleFile(f) }

  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:'calc(108px + env(safe-area-inset-bottom, 0px))',fontFamily:'Inter,sans-serif'}}>
      <Bg variant="a"/>
      <div style={{position:'relative',zIndex:2,padding:'18px 22px 0'}}>
        {/* header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <button onClick={onBack} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:999,background:T.glassS,backdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,fontSize:13,fontWeight:500,color:T.soft,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 10px rgba(90,70,55,.07)'}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Geri
          </button>
          <div style={{fontSize:10,letterSpacing:'0.22em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>Şişe Tarayıcı</div>
        </div>

        <div style={{fontSize:10,letterSpacing:'0.24em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:6}}>AI Görsel Analiz</div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:32,color:T.ink,margin:'0 0 6px',lineHeight:1.1}}>
          Bir fotoğraf yükle,<br/><em style={{fontStyle:'italic'}}>kokuyu bulalım.</em>
        </h1>
        <p style={{fontSize:13,color:T.soft,margin:'0 0 24px',lineHeight:1.5}}>Parfüm şişesi, kozmetik ürün, renk paleti veya sevdiğin bir atmosfer — ASYA hepsini okur.</p>

        {/* Upload zone */}
        <div
          onDrop={onDrop} onDragOver={e=>e.preventDefault()}
          onClick={()=>inputRef.current?.click()}
          style={{borderRadius:24,border:`2px dashed rgba(192,138,126,.45)`,background:'rgba(255,255,255,.60)',backdropFilter:'blur(14px)',textAlign:'center',cursor:'pointer',marginBottom:16,transition:'border-color .2s',width:'100%',maxWidth:320,aspectRatio:'1',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,position:'relative',overflow:'hidden',margin:'0 auto 16px',boxShadow:'0 8px 24px rgba(90,70,55,.10)'}}
        >
          {preview && <img src={preview} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:.18}}/>}
          <input ref={inputRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f)}}/>
          <div style={{position:'relative',zIndex:1}}>
            {status==='idle' && <>
              <div style={{fontSize:28}}>📷</div>
              <div style={{fontSize:14,fontWeight:500,color:T.ink}}>Fotoğraf çek veya yükle</div>
              <div style={{fontSize:11,color:T.muted}}>Parfüm şişesi · Kozmetik ürün · Herhangi bir görsel</div>
            </>}
            {status==='compressing' && <><div style={{fontSize:24}}>⚙️</div><div style={{fontSize:13,color:T.soft}}>Görsel hazırlanıyor…</div></>}
            {status==='loading' && <><div style={{fontSize:24}}>🔍</div><div style={{fontSize:13,color:T.soft,fontWeight:500}}>ASYA inceliyor…</div></>}
            {(status==='done'||status==='error') && preview && <>
              <img src={preview} alt="" style={{width:72,height:72,objectFit:'cover',borderRadius:12,boxShadow:'0 6px 16px rgba(90,70,55,.2)'}}/>
              <div style={{fontSize:11,color:T.soft}}>Başka bir görsel için dokun</div>
            </>}
            {status==='error' && <div style={{fontSize:12,color:'#e05a5a'}}>Bir hata oluştu, tekrar dene.</div>}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div style={{borderRadius:24,background:T.glass,backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',border:`1px solid ${T.glassE}`,boxShadow:'0 10px 28px rgba(90,70,55,.10)',overflow:'hidden',marginBottom:20}}>
            {result.identified && (
              <div style={{padding:'12px 18px',background:'rgba(192,138,126,.12)',borderBottom:`1px solid ${T.glassE}`,display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:18}}>🔍</span>
                <div>
                  <div style={{fontSize:10,letterSpacing:'0.18em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>Tanımlanan</div>
                  <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{result.identified}</div>
                </div>
                {result.confidence && <div style={{marginLeft:'auto',padding:'3px 10px',borderRadius:999,background:'rgba(110,80,56,.12)',fontSize:11,fontWeight:600,color:T.soft}}>%{result.confidence} eşleşme</div>}
              </div>
            )}
            <div style={{padding:'14px 18px'}}>
              <p style={{fontSize:14,color:T.ink,lineHeight:1.5,margin:'0 0 14px'}}>{result.output}</p>
              {result.product && (
                <div style={{borderRadius:18,background:'rgba(255,255,255,.7)',border:`1px solid ${T.glassE}`,padding:'14px 16px',display:'flex',gap:14,alignItems:'center'}}>
                  <div style={{width:64,height:64,borderRadius:14,background:'linear-gradient(160deg,#EADFD8,#FFF)',flexShrink:0,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {result.product.image_url ? <img src={result.product.image_url} alt={result.product.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={36} hue="#EADFD8"/>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:10,letterSpacing:'0.16em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>{({elegancia:'Elegancia Niche',hunter:'Hunter / Creasyon',kolonya:'Tarihi İstanbul Kolonyası',home:'Oda Kokusu'} as Record<string,string>)[result.product.series||'']||'Gold Serisi'}</div>
                    <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:20,color:T.ink,lineHeight:1.1,marginTop:2}}>{result.product.name}</div>
                    {result.product.notes && <div style={{fontSize:11,color:T.soft,marginTop:4}}>{result.product.notes}</div>}
                  </div>
                </div>
              )}
              {result.product && (
                <div style={{display:'flex',gap:10,marginTop:12}}>
                  {result.product.web_url && (
                    <a href={result.product.web_url} target="_blank" rel="noopener noreferrer" style={{flex:1,height:44,borderRadius:999,background:T.accent,color:'#FFF',fontSize:13,fontWeight:500,display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',boxShadow:'0 8px 18px rgba(154,91,80,.28)'}}>
                      Ürünü İncele →
                    </a>
                  )}
                  {onSaveToGardrop && (() => {
                    const p = result.product!
                    const prod: Prod = { name: p.name, image_url: p.image_url||'', web_url: p.web_url||'', woo_id: p.woo_id, code: p.code, series: p.series, notes: p.notes }
                    return (
                      <button onClick={()=>onSaveToGardrop(prod)} style={{height:44,padding:'0 16px',borderRadius:999,border:`1px solid ${T.glassE}`,background:'rgba(255,255,255,.7)',fontSize:13,color:T.ink,cursor:'pointer',fontFamily:'inherit',fontWeight:500,flexShrink:0}}>
                        + Gardırop
                      </button>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Muadil link after result */}
        {result && onGoMuadil && (
          <button onClick={onGoMuadil} style={{width:'100%',padding:'13px',borderRadius:16,border:`1px solid rgba(192,138,126,.30)`,background:'rgba(255,255,255,.6)',fontSize:13,color:T.soft,cursor:'pointer',fontFamily:'inherit',fontWeight:500,marginBottom:16,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke={T.muted} strokeWidth="1.4"/><path d="M9.5 9.5L13 13" stroke={T.muted} strokeWidth="1.4" strokeLinecap="round"/></svg>
            Başka bir kokuyu metin ile ara →
          </button>
        )}

        {/* Tips */}
        {status==='idle' && (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[
              {e:'🍾',t:'Parfüm Şişesi',d:'Markalı şişenin fotoğrafını çek — muadilini bulalım'},
              {e:'🧴',t:'Kozmetik / Bakım',d:'Losyon, krem, sabun — etiketteki notaları okuruz'},
              {e:'🎨',t:'Renk & Atmosfer',d:'Favori rengin, bir fotoğraf, bir his — vibe\'ına göre öneririz'},
            ].map(({e,t,d})=>(
              <div key={t} style={{padding:'12px 16px',borderRadius:16,background:'rgba(255,255,255,.55)',border:`1px solid ${T.glassE}`,display:'flex',gap:12,alignItems:'center'}}>
                <span style={{fontSize:24,flexShrink:0}}>{e}</span>
                <div><div style={{fontSize:13,fontWeight:600,color:T.ink}}>{t}</div><div style={{fontSize:12,color:T.soft,marginTop:2}}>{d}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   GÜNÜN İLHAMI SCREEN
════════════════════════════════════════════ */
function IlhamScreen({onBack,onGoChat}:{onBack:()=>void;onGoChat:(mode:ChatMode)=>void}) {
  const today = new Date()
  const seed = today.getDate() + today.getMonth()*31
  const all = [...goldProducts,...eleganciaProducts].filter(p=>p.img&&p.url&&p.name)
  const pick = (off:number) => all[(seed*7+off*13)%all.length]

  const dayPart = today.getHours()<12?'sabah':today.getHours()<18?'öğleden sonra':'akşam'
  const vibes = [
    {emoji:'🌅',label:'Sabahın Enerjisi',desc:'Güne taze ve aydınlık başlamak için — hafif, ferah, kendinden emin.'},
    {emoji:'☀️',label:'Gün Boyu Eşliği',desc:'İş, sokak, her ortama uyan — dengeli, şık, her an yanında.'},
    {emoji:'🌙',label:'Akşamın Derinliği',desc:'Geceye özel bir iz bırak — gizemli, sıcak, kalıcı.'},
  ]

  const cards = [0,1,2].map(i=>({p:pick(i),v:vibes[i]}))

  return (
    <div style={{position:'absolute',inset:0,overflowY:'auto',paddingBottom:'calc(108px + env(safe-area-inset-bottom, 0px))',fontFamily:'Inter,sans-serif'}}>
      <Bg variant="a"/>
      <div style={{position:'relative',zIndex:2,padding:'18px 22px 0'}}>
        {/* header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <button onClick={onBack} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:999,background:T.glassS,backdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,fontSize:13,fontWeight:500,color:T.soft,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 10px rgba(90,70,55,.07)'}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke={T.soft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Geri
          </button>
          <div style={{fontSize:11,color:T.muted,fontWeight:500}}>{today.toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'})}</div>
        </div>

        <div style={{fontSize:10,letterSpacing:'0.24em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:6}}>Günün İlhamı</div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:34,color:T.ink,margin:'0 0 4px',lineHeight:1.1}}>
          Bu {dayPart} için<br/><em style={{fontStyle:'italic'}}>üç öneri.</em>
        </h1>
        <p style={{fontSize:13,color:T.soft,margin:'0 0 28px',lineHeight:1.5}}>Her gün yeni bir ilham — bugünün enerjisine göre seçildi.</p>

        {/* cards */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {cards.map(({p,v},i)=>(
            <div key={i} style={{borderRadius:24,background:T.glass,backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',border:`1px solid ${T.glassE}`,boxShadow:'0 10px 28px rgba(90,70,55,.10),inset 0 1px 0 rgba(255,255,255,.8)',overflow:'hidden'}}>
              {/* top image */}
              <div style={{height:160,background:'linear-gradient(160deg,#EADFD8,#FFF)',position:'relative',overflow:'hidden'}}>
                {p.img && <img src={p.img} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
                <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 50%,rgba(43,38,64,.45) 100%)'}}/>
                <div style={{position:'absolute',top:12,left:14,padding:'4px 10px',borderRadius:999,background:'rgba(255,255,255,.85)',backdropFilter:'blur(8px)',fontSize:10,fontWeight:600,color:T.ink,letterSpacing:'0.14em',textTransform:'uppercase'}}>
                  {v.emoji} {v.label}
                </div>
              </div>
              {/* content */}
              <div style={{padding:'16px 18px 18px'}}>
                <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:22,color:T.ink,marginBottom:6,lineHeight:1.1}}>{p.name}</div>
                <p style={{fontSize:12.5,color:T.soft,margin:'0 0 14px',lineHeight:1.5}}>{v.desc}</p>
                <div style={{display:'flex',gap:10}}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" style={{flex:1,height:42,borderRadius:999,background:T.accent,color:'#FFF',fontSize:13,fontWeight:500,display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',boxShadow:'0 8px 18px rgba(154,91,80,.28)'}}>
                    Satın Al →
                  </a>
                  <button onClick={()=>onGoChat('profil')} style={{height:42,padding:'0 16px',borderRadius:999,border:`1px solid ${T.glassE}`,background:'rgba(255,255,255,.7)',fontSize:13,color:T.ink,cursor:'pointer',fontFamily:'inherit',fontWeight:500}}>
                    Profil Bul
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop:20,padding:'14px 18px',borderRadius:18,background:'rgba(192,138,126,.10)',border:'1px solid rgba(192,138,126,.20)',textAlign:'center'}}>
          <div style={{fontSize:12,color:T.soft,lineHeight:1.5}}>Her gün 3 yeni öneri 🌙<br/>Kendi profiline özel öneriler için ASYA ile konuş.</div>
          <button onClick={()=>onGoChat('profil')} style={{marginTop:10,padding:'10px 22px',borderRadius:999,border:'none',background:T.accent,color:'#FFF',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 8px 18px rgba(154,91,80,.25)'}}>
            Koku Profilimi Bul →
          </button>
        </div>
      </div>
    </div>
  )
}

function useReferralParam() {
  const [refName,setRefName] = useState<string|null>(null)
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      localStorage.setItem('asya_ref_code', ref)
      // Extract readable name from ref code (e.g. "MUSTAFA-4K2P" → "Mustafa")
      const namePart = ref.split('-')[0]
      const readable = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase()
      setRefName(readable)
    }
  },[])
  return refName
}

function ReferralWelcomeBanner({referrerName,onDismiss}:{referrerName:string;onDismiss:()=>void}) {
  return (
    <div style={{position:'fixed',top:0,left:0,right:0,zIndex:300,padding:'env(safe-area-inset-top, 0px) 16px 0'}}>
      <div style={{margin:'12px 0',borderRadius:18,background:'linear-gradient(135deg,#2B2640,#6E5038)',padding:'16px 18px',boxShadow:'0 12px 32px rgba(43,38,64,.45)',border:'1px solid rgba(192,138,126,.25)',display:'flex',gap:14,alignItems:'flex-start'}}>
        <div style={{width:40,height:40,borderRadius:12,background:'rgba(255,255,255,.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>🎁</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:'#FFF',marginBottom:4}}>{referrerName} seni davet etti!</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.72)',lineHeight:1.5}}>Koku testini tamamla — ikisi de <strong style={{color:'#FFD700'}}>2. üründe %50 indirim</strong> kazanıyorsunuz!</div>
        </div>
        <button onClick={onDismiss} style={{background:'none',border:'none',color:'rgba(255,255,255,.5)',fontSize:20,cursor:'pointer',padding:0,lineHeight:1,flexShrink:0}}>×</button>
      </div>
    </div>
  )
}

// URL parametresine göre açılış ekranı: ?chat=1 → sohbet, ?tab=profile → koku profili, yoksa ana sayfa
function initialScreenFromUrl(): 'chat'|'profile'|'home' {
  try {
    if (typeof window === 'undefined') return 'home'
    const p = new URLSearchParams(window.location.search)
    if (p.get('chat') === '1') return 'chat'
    if (p.get('tab') === 'profile') return 'profile'
    return 'home'
  } catch { return 'home' }
}

function MobileApp({initialUnboxing}:{initialUnboxing?:boolean}) {
  // Karşılama/"kaydır" ekranı kaldırıldı — direkt uygulama açılır
  const [mobileScreen,setMobileScreen] = useState<'welcome'|'app'>('app')
  const [activeTab,setActiveTab] = useState<MainTab>(initialUnboxing?'unboxing':initialScreenFromUrl())
  const [homeOverlay,setHomeOverlay] = useState<'none'|'ilham'|'vision'|'faq'|'giftwiz'|'muadil'>('none')
  const [chatMode,setChatMode] = useState<ChatMode>('profil')
  const [selectedProduct,setSelectedProduct] = useState<TopProduct|null>(null)
  const [showRefBanner,setShowRefBanner] = useState(true)
  const refName = useReferralParam()
  const chatLogic = useChatLogic(chatMode)
  const {lead,gardrop,coupon,scentProfile} = chatLogic

  if (mobileScreen==='welcome') return <MobileWelcome onAdvance={()=>setMobileScreen('app')}/>

  const goChat = (mode:ChatMode='profil') => { setChatMode(mode); setHomeOverlay('none'); setActiveTab('chat') }
  const goScentProfile = () => { setSelectedProduct(null); setActiveTab('profile') }
  const handleTile = (mode:ChatMode|'vision') => {
    if (mode==='ilham') { setHomeOverlay('ilham'); setActiveTab('home') }
    else if (mode==='vision') { setHomeOverlay('vision'); setActiveTab('home') }
    else if (mode==='hediye') { setHomeOverlay('giftwiz'); setActiveTab('home') }
    else if (mode==='muadil') { setHomeOverlay('muadil'); setActiveTab('home') }
    else goChat(mode as ChatMode)
  }

  return (
    <div style={{position:'fixed',inset:0,overflow:'hidden',fontFamily:'Inter,sans-serif'}}>
      {refName && showRefBanner && <ReferralWelcomeBanner referrerName={refName} onDismiss={()=>setShowRefBanner(false)}/>}
      <div style={{position:'absolute',inset:0}}>
        {activeTab==='home' && homeOverlay==='none' && <MobileHome lead={lead} onGoChat={handleTile} onGoUnboxing={()=>setActiveTab('unboxing')} onGoFaq={()=>setHomeOverlay('faq')}/>}
        {activeTab==='home' && homeOverlay==='ilham' && <IlhamScreen onBack={()=>setHomeOverlay('none')} onGoChat={goChat}/>}
        {activeTab==='home' && homeOverlay==='vision' && <VisionScreen onBack={()=>setHomeOverlay('none')} onGoChat={goChat} onSaveToGardrop={chatLogic.saveToGardrop} onGoMuadil={()=>setHomeOverlay('muadil')}/>}
        {activeTab==='home' && homeOverlay==='faq' && <FAQScreen onBack={()=>setHomeOverlay('none')} lead={lead}/>}
        {activeTab==='home' && homeOverlay==='giftwiz' && <GiftWizard onBack={()=>setHomeOverlay('none')} onSaveToGardrop={chatLogic.saveToGardrop}/>}
        {activeTab==='home' && homeOverlay==='muadil' && <MuadilScreen onBack={()=>setHomeOverlay('none')} onSaveToGardrop={chatLogic.saveToGardrop}/>}
        {activeTab==='catalog' && <MobileCatalog/>}
        {activeTab==='chat' && <MobileChat chatLogic={chatLogic} onGoProfile={()=>setActiveTab('profile')} onGoScentProfile={goScentProfile} chatMode={chatMode} onGoMuadil={()=>{setHomeOverlay('muadil');setActiveTab('home')}} onGoGift={()=>{setHomeOverlay('giftwiz');setActiveTab('home')}} onGoVision={()=>{setHomeOverlay('vision');setActiveTab('home')}} onGoCatalog={()=>setActiveTab('catalog')}/>}
        {activeTab==='wardrobe' && <MobileWardrobe gardrop={gardrop} onRemove={chatLogic.removeFromGardrop} onGoChat={()=>setActiveTab('chat')}/>}
        {activeTab==='unboxing' && (
          <div style={{position:'absolute',inset:0,overflowY:'auto',paddingTop:14}}>
            <Bg variant="a"/>
            <div style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',minHeight:'100%'}}>
              <UnboxingScreen onGoChat={()=>{goChat('profil')}}/>
            </div>
          </div>
        )}
        {activeTab==='profile' && (
          selectedProduct
            ? <ProductDetailScreen product={selectedProduct} onBack={()=>setSelectedProduct(null)} onSave={p=>chatLogic.saveToGardrop(p as Prod)} saved={chatLogic.isInGardrop(selectedProduct.name)}/>
            : scentProfile
              ? <ScentProfileScreen profile={scentProfile} lead={lead} coupon={coupon} gardrop={gardrop} onBack={()=>setActiveTab('chat')} onProductTap={setSelectedProduct} onSaveToGardrop={p=>chatLogic.saveToGardrop(p as Prod)} isInGardrop={chatLogic.isInGardrop}/>
              : <MobileProfile lead={lead} coupon={coupon} onGoChat={()=>goChat('profil')}/>
        )}
      </div>
      <MobileTabBar active={activeTab} onChange={(t)=>{ setActiveTab(t); setHomeOverlay('none'); }}/>
    </div>
  )
}

/* ════════════════════════════════════════════
   DESKTOP APP
════════════════════════════════════════════ */
const dNavItems = [
  {id:'home' as Screen,label:'Ana Sayfa',g:(a:boolean)=><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 10l7-6 7 6v6a1 1 0 0 1-1 1h-3v-5h-6v5H4a1 1 0 0 1-1-1z" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4" strokeLinejoin="round"/></svg>},
  {id:'chat' as Screen,label:'ASYA (AI Koku Asistanı)',g:(a:boolean)=><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 9.5C3 6 6 4 10 4s7 2 7 5.5S14 15 10 15c-.7 0-1.4-.06-2-.18L5 16l.5-2.4A5 5 0 0 1 3 9.5z" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4" strokeLinejoin="round"/></svg>},
  {id:'wardrobe' as Screen,label:'Koku Gardırobum',g:(a:boolean)=><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 7.2a1.7 1.7 0 1 1 1.7-1.7" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4" strokeLinecap="round"/><path d="M10 7.2v1.5L2 14h16L10 8.7" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4" strokeLinejoin="round"/></svg>},
  {id:'profile' as Screen,label:'Koku Profilim',g:(a:boolean)=><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4"/><path d="M3 17c.8-3.4 3.7-5 7-5s6.2 1.6 7 5" stroke={a?'#2B2640':'#5E5878'} strokeWidth="1.4" strokeLinecap="round"/></svg>},
]

function DesktopSidebar({active,onChange,lead,onFaq}:{active:Screen;onChange:(s:Screen)=>void;lead:Lead|null;onFaq:()=>void}) {
  return (
    <aside style={{width:240,padding:'32px 18px',boxSizing:'border-box',borderRight:'1px solid rgba(90,70,55,.08)',display:'flex',flexDirection:'column',background:'rgba(255,255,255,.55)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',position:'relative',zIndex:2,flexShrink:0}}>
      <div style={{padding:'0 8px 24px',borderBottom:'1px solid rgba(90,70,55,.10)',marginBottom:20}}>
        <a href="/" style={{display:'block',textDecoration:'none',cursor:'pointer'}}>
          <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:400,fontSize:30,color:T.ink,lineHeight:1.05,letterSpacing:'0.01em',marginTop:6}}>Perfume <em style={{fontStyle:'italic'}}>Maison</em></div>
          <div style={{fontSize:10,letterSpacing:'0.28em',color:'rgba(90,70,55,.50)',fontWeight:600,textTransform:'uppercase',marginTop:6,fontFamily:'Inter,sans-serif'}}>Parfüm Evi</div>
        </a>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:2}}>
        {dNavItems.map(it=>{
          const isA=it.id===active
          return (
            <button key={it.id} onClick={()=>onChange(it.id)} style={{padding:'10px 12px',borderRadius:12,border:'none',background:isA?'rgba(192,138,126,.18)':'transparent',display:'flex',alignItems:'center',gap:12,fontSize:13.5,fontWeight:isA?600:500,color:'#000',cursor:'pointer',fontFamily:'inherit',textAlign:'left',transition:'background .15s',width:'100%'}}>
              {it.g(isA)}
              {it.label}
              {isA && <div style={{marginLeft:'auto',width:4,height:4,borderRadius:'50%',background:'#C08A7E'}}/>}
            </button>
          )
        })}
      </div>
      <div style={{marginTop:24,padding:'12px 4px',borderTop:'1px solid rgba(90,70,55,.08)'}}>
        <div style={{fontSize:9,letterSpacing:'0.22em',color:T.muted,fontWeight:600,textTransform:'uppercase',padding:'0 8px 10px'}}>Daha Fazlası</div>
        <button onClick={()=>onChange('muadil')} style={{width:'100%',padding:'8px 12px',borderRadius:10,border:'none',background:active==='muadil'?'rgba(192,138,126,.12)':'transparent',textAlign:'left',fontSize:12.5,fontWeight:active==='muadil'?600:500,color:'#000',cursor:'pointer',fontFamily:'inherit'}}>Muadil Bul</button>
        <button onClick={()=>onChange('gift')} style={{width:'100%',padding:'8px 12px',borderRadius:10,border:'none',background:active==='gift'?'rgba(192,138,126,.12)':'transparent',textAlign:'left',fontSize:12.5,fontWeight:active==='gift'?600:500,color:'#000',cursor:'pointer',fontFamily:'inherit'}}>Hediye Sihirbazı</button>
        <button onClick={onFaq} style={{width:'100%',padding:'8px 12px',borderRadius:10,border:'none',background:active==='faq'?'rgba(192,138,126,.12)':'transparent',textAlign:'left',fontSize:12.5,fontWeight:active==='faq'?600:500,color:'#000',cursor:'pointer',fontFamily:'inherit'}}>Hakkımızda · SSS</button>
      </div>
      <div style={{flex:1}}/>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:10,borderRadius:14,background:'rgba(255,255,255,.65)',border:`1px solid ${T.glassE}`,boxShadow:'0 4px 12px rgba(90,70,55,.08)'}}>
        <div style={{width:36,height:36,borderRadius:'50%',flexShrink:0,background:'linear-gradient(145deg,#FFF,#E8DAD2)',display:'flex',alignItems:'center',justifyContent:'center',font:'italic 600 14px "Cormorant Garamond",serif',color:T.soft}}>
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

function DesktopTopBar({onSearch}:{onSearch?:(q:string)=>void}) {
  const [q,setQ] = useState('')
  // Arama ana sitede yapılır (üst pencere ana siteye gider)
  const siteSearch=(s:string)=>{ onSearch?.(s); if(typeof window!=='undefined'&&s.trim()) window.open('https://elegancevipperfume.com/arama?q='+encodeURIComponent(s.trim()),'_top') }
  return (
    <div style={{height:64,padding:'0 36px',boxSizing:'border-box',display:'flex',alignItems:'center',gap:16,borderBottom:'1px solid rgba(90,70,55,.06)',background:'rgba(255,255,255,.55)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',position:'relative',zIndex:3,flexShrink:0}}>
      <div style={{flex:1,maxWidth:480,height:38,padding:'0 16px',display:'flex',alignItems:'center',gap:10,borderRadius:999,background:'rgba(255,255,255,.75)',border:'1px solid rgba(90,70,55,.10)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.7)'}}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke={T.muted} strokeWidth="1.4"/><path d="M9.5 9.5L13 13" stroke={T.muted} strokeWidth="1.4" strokeLinecap="round"/></svg>
        <input
          value={q} onChange={e=>setQ(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&q.trim()){siteSearch(q.trim());setQ('')}}}
          placeholder="Koku, nota ya da koleksiyon ara…"
          style={{flex:1,border:'none',background:'transparent',outline:'none',fontSize:13,color:T.ink,fontFamily:'inherit'}}
        />
        {q && <button onClick={()=>{siteSearch(q.trim());setQ('')}} style={{border:'none',background:'none',cursor:'pointer',padding:0,display:'flex',color:T.muted}}>→</button>}
      </div>
      <div style={{flex:1}}/>
      <a href="https://www.elegancevipperfume.com" target="_blank" rel="noopener noreferrer" style={{padding:'8px 16px',borderRadius:999,border:'1px solid rgba(90,70,55,.12)',background:'rgba(255,255,255,.7)',fontSize:12.5,fontWeight:500,color:T.ink,textDecoration:'none',display:'flex',alignItems:'center',gap:6}}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={T.soft} strokeWidth="1.3"/><path d="M7 1c0 0-3 2.5-3 6s3 6 3 6" stroke={T.soft} strokeWidth="1.3" strokeLinecap="round"/><path d="M7 1c0 0 3 2.5 3 6s-3 6-3 6" stroke={T.soft} strokeWidth="1.3" strokeLinecap="round"/><path d="M1 7h12" stroke={T.soft} strokeWidth="1.3" strokeLinecap="round"/></svg>
        Web Sitesi
      </a>
    </div>
  )
}

function DesktopHome({onGoChat,onGoCatalog,onGoUnboxing}:{onGoChat:(mode?:ChatMode|'vision')=>void;onGoCatalog:()=>void;onGoUnboxing:()=>void}) {
  const featured = catalogProducts.slice(0,4)
  return (
    <div style={{flex:1,overflowY:'auto',padding:'36px 48px 48px'}}>
      {/* Hero */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:40,padding:'28px 36px',borderRadius:28,background:'rgba(255,255,255,.55)',backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',border:`1px solid ${T.glassE}`,boxShadow:'0 24px 50px rgba(90,70,55,.10),inset 0 1px 0 rgba(255,255,255,.85)',marginBottom:40}}>
        <div style={{padding:'16px 0'}}>
          <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>Türkiye'nin İlk Akıllı Parfüm Platformu</div>
          <h1 style={{margin:'14px 0',fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:58,lineHeight:1.0,color:T.ink,letterSpacing:'-0.015em'}}>
            Kendi <em style={{fontStyle:'italic'}}>koku<br/>imzanızı</em> Yapay Zeka ile bulun.
          </h1>
          <p style={{margin:'0 0 28px',maxWidth:460,fontSize:15,color:T.soft,lineHeight:1.55}}>
            Kör alışa son verin. ASYA; teninizi, ruh halinizi ve hatta bugünün hava durumunu analiz ederek binlerce nota arasından kusursuz imza kokunuzu tasarlayan yapay zeka destekli kişisel koku asistanınızdır.
          </p>
          <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
            <button onClick={()=>onGoChat('profil')} style={{padding:'0 26px',height:52,borderRadius:999,border:'none',background:T.accent,boxShadow:'0 14px 28px rgba(154,91,80,.30)',display:'flex',alignItems:'center',gap:10,fontSize:14.5,fontWeight:500,color:'#FFF',cursor:'pointer',fontFamily:'inherit'}}>
              İmza Kokumu Keşfet →
            </button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:28}}>
            {dashTiles.map(tile=>(
              <button key={tile.mode} onClick={()=>onGoChat(tile.mode)} style={{padding:'14px 16px',borderRadius:16,border:`1px solid ${T.glassE}`,background:'rgba(255,255,255,.65)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',boxShadow:'0 4px 14px rgba(90,70,55,.07)',cursor:'pointer',fontFamily:'inherit',textAlign:'left',display:'flex',flexDirection:'column',gap:10,transition:'transform .15s'}}>
                <div style={{width:36,height:36,borderRadius:10,background:'rgba(90,70,55,.07)',display:'flex',alignItems:'center',justifyContent:'center'}}>{tile.g}</div>
                <div style={{fontSize:13,fontWeight:500,color:T.ink,lineHeight:1.2}}>{tile.title}<br/>{tile.titleB}</div>
              </button>
            ))}
          </div>
          <div style={{display:'flex',gap:32,paddingTop:4,borderTop:'1px solid rgba(90,70,55,.07)'}}>
            {[['12.000+','aktif kullanıcı'],['180+','koku formülü'],['%97','müşteri memnuniyeti']].map(([v,l],i)=>(
              <div key={i}>
                <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:28,color:T.ink,lineHeight:1}}>{v}</div>
                <div style={{marginTop:4,fontSize:11,color:T.muted,letterSpacing:'0.10em',textTransform:'uppercase'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{position:'relative',borderRadius:22,overflow:'hidden',boxShadow:'0 20px 40px rgba(90,70,55,.18)',minHeight:320}}>
          <img src="/hero-desktop.jpg" alt="Elegance VIP" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top',position:'absolute',inset:0}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(43,38,64,0) 55%,rgba(43,38,64,.55) 100%)'}}/>
          <div style={{position:'absolute',top:20,right:20,padding:'8px 14px',borderRadius:999,background:'rgba(255,255,255,.85)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',fontSize:11,fontWeight:600,color:T.ink,letterSpacing:'0.12em',textTransform:'uppercase'}}>Elegance VIP</div>
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
          <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',padding:16,borderRadius:22,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 8px 22px rgba(90,70,55,.08)',display:'block',transition:'transform .2s'}}>
            <div style={{aspectRatio:'1',borderRadius:16,background:'linear-gradient(160deg,#EADFD8,#FFF)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,overflow:'hidden'}}>
              {p.img ? <img src={p.img} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={80} hue="#EADFD8"/>}
            </div>
            <div style={{fontSize:10,letterSpacing:'0.18em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>{p.scent}</div>
            <div style={{marginTop:2,fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:20,color:T.ink,lineHeight:1.1}}>{p.name}</div>
          </a>
        ))}
      </div>
    </div>
  )
}

function DesktopCatalog({initialSearch}:{initialSearch?:string}) {
  const [section,setSection] = useState<'gold'|'elegancia'>('gold')
  const [gender,setGender] = useState('Tümü')
  const [scent,setScent] = useState('Tümü')
  const [localSearch,setLocalSearch] = useState(initialSearch||'')

  useEffect(()=>{ if(initialSearch) setLocalSearch(initialSearch) },[initialSearch])

  const isNis = section==='elegancia'
  const pool = isNis ? eleganciaProducts : goldProducts
  const scentFams = isNis ? elegScentFamilies : goldScentFamilies

  const filtered = pool
    .filter(p => gender==='Tümü' || p.gender===GENDER_MAP[gender])
    .filter(p => scent==='Tümü' || p.scent===scent)
    .filter(p => !localSearch || p.name.toLowerCase().includes(localSearch.toLowerCase()) || p.scent.toLowerCase().includes(localSearch.toLowerCase()) || p.code.toLowerCase().includes(localSearch.toLowerCase()))

  const resetFilters = (s:typeof section) => { setSection(s); setGender('Tümü'); setScent('Tümü') }

  return (
    <div style={{flex:1,overflowY:'auto',padding:'32px 48px 48px'}}>
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:20}}>
        <div>
          <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase'}}>Elegance VIP</div>
          <h1 style={{margin:'8px 0 0',fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:48,color:T.ink,letterSpacing:'-0.015em'}}>Koku <em style={{fontStyle:'italic'}}>Koleksiyonu</em></h1>
        </div>
        <span style={{fontSize:12.5,color:T.muted}}>{filtered.length} koku</span>
      </div>

      {/* Search bar in catalog */}
      {localSearch && (
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 16px',borderRadius:14,background:'rgba(192,138,126,.12)',border:'1px solid rgba(192,138,126,.25)',marginBottom:16}}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke={T.muted} strokeWidth="1.4"/><path d="M9.5 9.5L13 13" stroke={T.muted} strokeWidth="1.4" strokeLinecap="round"/></svg>
          <span style={{flex:1,fontSize:13,color:T.ink}}>"{localSearch}" için sonuçlar</span>
          <button onClick={()=>setLocalSearch('')} style={{border:'none',background:'none',cursor:'pointer',fontSize:13,color:T.muted,fontFamily:'inherit'}}>× Temizle</button>
        </div>
      )}

      {/* Section tabs */}
      <div style={{display:'flex',gap:10,marginBottom:20}}>
        {([['gold','Gold & Classic'],['elegancia','✦ Niş Parfüm']] as const).map(([s,label])=>(
          <button key={s} onClick={()=>resetFilters(s)} style={{padding:'10px 22px',borderRadius:14,border:'none',background:section===s?s==='elegancia'?'linear-gradient(135deg,#6E5038,#8B6FB5)':T.accent:'rgba(255,255,255,.7)',color:section===s?'#FFF':T.soft,fontSize:14,fontWeight:section===s?700:500,cursor:'pointer',fontFamily:'inherit',boxShadow:section===s?'0 8px 18px rgba(154,91,80,.25)':undefined}}>
            {label}
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:28}}>
        <aside>
          {/* Gender filter */}
          {!isNis && (
            <>
              <div style={{fontSize:10,letterSpacing:'0.22em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:8}}>Cinsiyet</div>
              <div style={{display:'flex',flexDirection:'column',gap:2,marginBottom:18}}>
                {GENDERS.map(g=>(
                  <button key={g} onClick={()=>setGender(g)} style={{padding:'7px 12px',borderRadius:10,border:'none',background:g===gender?'rgba(192,138,126,.25)':'transparent',color:g===gender?T.ink:T.soft,fontSize:13,fontWeight:g===gender?600:400,cursor:'pointer',fontFamily:'inherit',textAlign:'left',transition:'all .15s'}}>
                    {g}
                  </button>
                ))}
              </div>
            </>
          )}
          <div style={{fontSize:10,letterSpacing:'0.22em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:8}}>Koku Ailesi</div>
          <div style={{display:'flex',flexDirection:'column',gap:3}}>
            {scentFams.map(f=>(
              <button key={f} onClick={()=>setScent(f)} style={{padding:'8px 12px',borderRadius:10,border:'none',background:f===scent?T.accent:'transparent',color:f===scent?'#FFF':T.soft,fontSize:13,fontWeight:f===scent?600:500,cursor:'pointer',fontFamily:'inherit',textAlign:'left',boxShadow:f===scent?'0 6px 14px rgba(154,91,80,.25)':'none',transition:'all .15s'}}>
                {f}
              </button>
            ))}
          </div>
        </aside>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {filtered.map((p,i)=>(
            <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',padding:16,borderRadius:22,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${T.glassE}`,boxShadow:'0 8px 22px rgba(90,70,55,.08)',display:'block',position:'relative'}}>
              {p.series==='elegancia' && (
                <div style={{position:'absolute',top:10,right:10,padding:'4px 10px',borderRadius:999,background:'rgba(110,80,56,.85)',color:'#FFF',fontSize:9,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',zIndex:2}}>✦ Niş</div>
              )}
              <div style={{aspectRatio:'1',borderRadius:16,background:'linear-gradient(160deg,#EADFD8,#FFF)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,overflow:'hidden'}}>
                {p.img ? <img src={p.img} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={96} hue="#EADFD8"/>}
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

function DesktopChat({chatLogic,onGoProfile,onGoScentProfile,chatMode,onGoMuadil,onGoGift,onGoVision,onGoCatalog}:{chatLogic:ReturnType<typeof useChatLogic>;onGoProfile:()=>void;onGoScentProfile:()=>void;chatMode:ChatMode;onGoMuadil?:()=>void;onGoGift?:()=>void;onGoVision?:()=>void;onGoCatalog?:()=>void}) {
  const {reset} = chatLogic
  return (
    <div style={{flex:1,display:'flex',overflow:'hidden',justifyContent:'center'}}>
      <section style={{display:'flex',flexDirection:'column',flex:'0 1 680px',minWidth:0,overflow:'hidden',background:'rgba(255,255,255,.55)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)'}}>
        <div style={{padding:'18px 22px 14px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid rgba(90,70,55,.06)',flexShrink:0}}>
          <AsyaAvatar size={38}/>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:T.ink}}>ASYA</div>
            <div style={{fontSize:11,color:T.muted,display:'flex',alignItems:'center',gap:4}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#7FB48C',display:'inline-block'}}/>
              çevrimiçi · genelde 2 saniyede yanıtlar
            </div>
          </div>
          <button onClick={reset} style={{padding:'7px 14px',borderRadius:999,border:`1px solid rgba(90,70,55,.12)`,background:'transparent',fontSize:12,color:T.soft,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:6}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.soft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
            Baştan Başla
          </button>
        </div>
        <ChatPanel chatLogic={chatLogic} onGoProfile={onGoProfile} onGoScentProfile={onGoScentProfile} isDesktop mode={chatMode} onGoMuadil={onGoMuadil} onGoGift={onGoGift} onGoVision={onGoVision} onGoCatalog={onGoCatalog}/>
      </section>
    </div>
  )
}

function DesktopWardrobe({gardrop,onRemove,onGoChat}:{gardrop:GItem[];onRemove:(name:string)=>void;onGoChat:()=>void}) {
  const [catFilter,setCatFilter] = useState('Tümü')
  const categories = ['Tümü','☀️ Günlük','🌸 Romantik','🌙 Gece','🔥 Oryantal','✦ Lüks']
  const dFiltered = catFilter==='Tümü' ? gardrop : gardrop.filter(g=>getScentCategory(g)===catFilter)
  return (
    <div style={{flex:1,overflowY:'auto',padding:'36px 48px 48px'}}>
      <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>Koleksiyonunuz</div>
      <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:48,color:T.ink,letterSpacing:'-0.015em',margin:'0 0 16px'}}>Koku <em style={{fontStyle:'italic'}}>Gardırobum</em></h1>
      <WeatherGreeting gardrop={gardrop}/>
      {gardrop.length>0 && (
        <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
          {categories.map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)} style={{padding:'7px 16px',borderRadius:999,border:'none',background:c===catFilter?T.accent:'rgba(255,255,255,.75)',color:c===catFilter?'#FFF':T.soft,fontSize:12.5,fontWeight:c===catFilter?600:400,cursor:'pointer',fontFamily:'inherit',boxShadow:c===catFilter?'0 4px 10px rgba(154,91,80,.25)':undefined}}>
              {c}
            </button>
          ))}
        </div>
      )}
      {dFiltered.length===0&&gardrop.length>0&&<p style={{fontSize:13,color:T.muted,marginBottom:16}}>Bu kategoride kayıtlı koku yok.</p>}
      {gardrop.length===0 ? (
        <div style={{background:'rgba(255,255,255,.55)',backdropFilter:'blur(14px)',borderRadius:28,border:`1px solid ${T.glassE}`,overflow:'hidden'}}>
          <div style={{position:'relative',height:360}}>
            <img src="/koku gardrobu.jpg" alt="Koku Gardırobu" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center center'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(43,38,64,0) 40%,rgba(43,38,64,.65) 100%)'}}/>
            <div style={{position:'absolute',bottom:24,left:32,color:'#FFF'}}>
              <div style={{fontSize:10,letterSpacing:'0.28em',fontWeight:600,textTransform:'uppercase',opacity:.75,fontFamily:'Inter,sans-serif'}}>Kişisel Koleksiyonunuz</div>
              <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:28,fontWeight:500,marginTop:4}}>Koku <em style={{fontStyle:'italic'}}>Gardırobum</em></div>
            </div>
          </div>
          <div style={{textAlign:'center',padding:'32px 40px 40px'}}>
            <p style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:26,color:T.ink,margin:'0 0 8px'}}>Gardırobunuz henüz boş</p>
            <p style={{fontSize:14,color:T.soft,marginBottom:28}}>ASYA ile sohbet ederek teninize ve ruh halinize özel imza kokunuzu keşfedin.</p>
            <button onClick={onGoChat} style={{display:'inline-flex',alignItems:'center',gap:10,padding:'14px 32px',borderRadius:999,border:'none',background:'linear-gradient(135deg,#6E5038,#9A5B50)',color:'#FFF',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 14px 28px rgba(110,80,56,.28)'}}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 9.5C3 6 6 4 10 4s7 2 7 5.5S14 15 10 15c-.7 0-1.4-.06-2-.18L5 16l.5-2.4A5 5 0 0 1 3 9.5z" stroke="#FFF" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              ASYA ile Koku Gardırobumu Oluştur
            </button>
          </div>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
          {dFiltered.map((item,i)=>(
            <div key={i} style={{padding:16,borderRadius:22,background:'rgba(255,255,255,.70)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:item.series==='elegancia'?'1px solid rgba(110,80,56,.20)':`1px solid ${T.glassE}`,boxShadow:'0 8px 22px rgba(90,70,55,.08)',display:'flex',flexDirection:'column',position:'relative'}}>
              {item.series==='elegancia'&&<div style={{position:'absolute',top:8,left:8,padding:'2px 7px',borderRadius:999,background:'rgba(110,80,56,.85)',color:'#FFF',fontSize:8,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase'}}>✦ Niş</div>}
              <a href={item.web_url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',display:'block',flex:1}}>
                <div style={{aspectRatio:'1',borderRadius:16,background:'linear-gradient(160deg,#EADFD8,#FFF)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,overflow:'hidden'}}>
                  {item.image_url ? <img src={item.image_url} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <BottleGlyph size={60} hue="#EADFD8"/>}
                </div>
                <div style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:20,color:T.ink,lineHeight:1.15}}>{item.name}</div>
                <div style={{fontSize:12,color:T.soft,marginTop:4}}>İncele →</div>
              </a>
              <button onClick={()=>onRemove(item.name)} title="Gardıroptan çıkar" style={{marginTop:10,width:'100%',padding:'8px',borderRadius:10,border:'1px solid rgba(220,100,100,.15)',background:'rgba(220,100,100,.05)',fontSize:12,color:'rgba(180,80,80,.8)',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'all .15s'}}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V3h4v1M5 4l.5 8h5L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Çıkar
              </button>
            </div>
          ))}
        </div>
      )}
      <WardrobeGapAnalysis gardrop={gardrop}/>
    </div>
  )
}

function DesktopProfile({lead,coupon,scentProfile,gardrop,onProductTap,onSaveToGardrop,isInGardrop,onBack,onGoChat}:{
  lead:Lead|null; coupon:string|null; scentProfile:ScentProfile|null; gardrop:GItem[]
  onProductTap:(p:TopProduct)=>void; onSaveToGardrop:(p:TopProduct)=>void; isInGardrop:(name:string)=>boolean; onBack:()=>void; onGoChat:()=>void
}) {
  if (scentProfile) {
    return (
      <div style={{flex:1,position:'relative'}}>
        <ScentProfileScreen profile={scentProfile} lead={lead} coupon={coupon} gardrop={gardrop} onBack={onBack} onProductTap={onProductTap} onSaveToGardrop={onSaveToGardrop} isInGardrop={isInGardrop} isDesktop/>
      </div>
    )
  }
  return (
    <div style={{flex:1,overflowY:'auto',padding:'36px 48px 48px'}}>
      <div style={{fontSize:11,letterSpacing:'0.28em',color:T.muted,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>{lead?.name||'Sizin'} Koku Portresi</div>
      <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:48,color:T.ink,letterSpacing:'-0.015em',margin:'0 0 28px'}}>Koku <em style={{fontStyle:'italic'}}>Profilim</em></h1>
      <div style={{background:'rgba(255,255,255,.55)',backdropFilter:'blur(14px)',borderRadius:28,border:`1px solid ${T.glassE}`,overflow:'hidden'}}>
        <div style={{position:'relative',height:300}}>
          <img src="/koku profili.jpg" alt="Koku Profili" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center center'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(43,38,64,0) 45%,rgba(43,38,64,.60) 100%)'}}/>
          <div style={{position:'absolute',bottom:24,left:32,color:'#FFF'}}>
            <div style={{fontSize:9,letterSpacing:'0.28em',fontWeight:600,textTransform:'uppercase',opacity:.75,fontFamily:'Inter,sans-serif'}}>Kişisel Koku Portresi</div>
            <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:28,fontWeight:500,marginTop:4}}>Koku <em style={{fontStyle:'italic'}}>Profiliniz</em></div>
          </div>
        </div>
        <div style={{textAlign:'center',padding:'32px 40px 40px'}}>
          <p style={{fontFamily:'"Cormorant Garamond",serif',fontWeight:500,fontSize:26,color:T.ink,margin:'0 0 8px'}}>Henüz profiliniz oluşturulmadı</p>
          <p style={{fontSize:14,color:T.soft,marginBottom:28}}>ASYA ile sohbet ederek teninize, ruh halinize ve yaşam stilinize özel koku profilinizi oluşturun.</p>
          <button onClick={onGoChat} style={{display:'inline-flex',alignItems:'center',gap:10,padding:'14px 32px',borderRadius:999,border:'none',background:'linear-gradient(135deg,#6E5038,#9A5B50)',color:'#FFF',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 14px 28px rgba(110,80,56,.28)'}}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 9.5C3 6 6 4 10 4s7 2 7 5.5S14 15 10 15c-.7 0-1.4-.06-2-.18L5 16l.5-2.4A5 5 0 0 1 3 9.5z" stroke="#FFF" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            ASYA ile Profil Oluştur
          </button>
        </div>
      </div>
    </div>
  )
}

function DesktopApp({initialUnboxing}:{initialUnboxing?:boolean}) {
  const [screen,setScreen] = useState<Screen>(initialUnboxing?'unboxing':initialScreenFromUrl())
  const [chatMode,setChatMode] = useState<ChatMode>('profil')
  const [selectedProduct,setSelectedProduct] = useState<TopProduct|null>(null)
  const chatLogic = useChatLogic(chatMode)
  const {lead,gardrop,coupon,scentProfile} = chatLogic
  const [showRefBanner,setShowRefBanner] = useState(true)
  const refName = useReferralParam()

  const [desktopVision,setDesktopVision] = useState(false)
  const [catalogSearch,setCatalogSearch] = useState('')
  const goChat = (mode:ChatMode='profil') => { setChatMode(mode); setDesktopVision(false); setScreen('chat') }
  const goScentProfile = () => { setSelectedProduct(null); setScreen('profile') }
  const handleDesktopTile = (m?:ChatMode|'vision') => { if(m==='vision'){setDesktopVision(true);setScreen('home')}else if(m==='hediye'){setScreen('gift')}else if(m==='muadil'){setScreen('muadil')}else goChat(m as ChatMode) }
  const handleSearch = (q:string) => { setCatalogSearch(q); setScreen('catalog') }

  return (
    <div style={{position:'fixed',inset:0,display:'flex',fontFamily:'Inter,sans-serif',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0}}>
        <div style={{position:'absolute',top:-180,left:-120,width:520,height:520,borderRadius:'50%',background:'#F3E9E3',opacity:.5,filter:'blur(100px)'}}/>
        <div style={{position:'absolute',top:280,right:-200,width:500,height:500,borderRadius:'50%',background:'#EFE7E1',opacity:.45,filter:'blur(100px)'}}/>
        <div style={{position:'absolute',bottom:-200,left:280,width:460,height:460,borderRadius:'50%',background:'#F4ECE6',opacity:.35,filter:'blur(110px)'}}/>
        <div style={{position:'absolute',inset:0,background:T.bg}}/>
      </div>
      {refName && showRefBanner && (
        <div style={{position:'absolute',top:16,left:'50%',transform:'translateX(-50%)',zIndex:300,width:'min(480px,90vw)'}}>
          <ReferralWelcomeBanner referrerName={refName} onDismiss={()=>setShowRefBanner(false)}/>
        </div>
      )}
      <DesktopSidebar active={screen} onChange={s=>{setDesktopVision(false);setScreen(s)}} lead={lead} onFaq={()=>setScreen('faq')}/>
      <main style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative',zIndex:1}}>
        <DesktopTopBar onSearch={handleSearch}/>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {screen==='home' && !desktopVision && <DesktopHome onGoChat={handleDesktopTile} onGoCatalog={()=>setScreen('catalog')} onGoUnboxing={()=>setScreen('unboxing')}/>}
          {screen==='home' && desktopVision && <div style={{flex:1,position:'relative'}}><VisionScreen onBack={()=>setDesktopVision(false)} onGoChat={goChat} onSaveToGardrop={chatLogic.saveToGardrop} onGoMuadil={()=>{setDesktopVision(false);setScreen('muadil')}}/></div>}
          {screen==='unboxing' && <div style={{flex:1,overflowY:'auto'}}><UnboxingScreen isDesktop onGoChat={()=>goChat('profil')}/></div>}
          {screen==='catalog' && <DesktopCatalog initialSearch={catalogSearch}/>}
          {screen==='chat' && <DesktopChat chatLogic={chatLogic} onGoProfile={()=>setScreen('profile')} onGoScentProfile={goScentProfile} chatMode={chatMode} onGoMuadil={()=>setScreen('muadil')} onGoGift={()=>setScreen('gift')} onGoVision={()=>{setDesktopVision(true);setScreen('home')}} onGoCatalog={()=>setScreen('catalog')}/>}
          {screen==='wardrobe' && <DesktopWardrobe gardrop={gardrop} onRemove={chatLogic.removeFromGardrop} onGoChat={()=>setScreen('chat')}/>}
          {screen==='profile' && (
            selectedProduct
              ? <div style={{flex:1,position:'relative'}}><ProductDetailScreen product={selectedProduct} onBack={()=>setSelectedProduct(null)} onSave={p=>chatLogic.saveToGardrop(p as Prod)} saved={chatLogic.isInGardrop(selectedProduct.name)} isDesktop/></div>
              : <DesktopProfile lead={lead} coupon={coupon} scentProfile={scentProfile} gardrop={gardrop} onProductTap={setSelectedProduct} onSaveToGardrop={p=>chatLogic.saveToGardrop(p as Prod)} isInGardrop={chatLogic.isInGardrop} onBack={()=>setScreen('chat')} onGoChat={()=>goChat('profil')}/>
          )}
          {screen==='faq' && <div style={{flex:1,position:'relative'}}><FAQScreen onBack={()=>setScreen('home')} isDesktop lead={lead}/></div>}
          {screen==='gift' && <div style={{flex:1,position:'relative'}}><GiftWizard onBack={()=>setScreen('home')} onSaveToGardrop={chatLogic.saveToGardrop}/></div>}
          {screen==='muadil' && <div style={{flex:1,position:'relative'}}><MuadilScreen onBack={()=>setScreen('home')} onSaveToGardrop={chatLogic.saveToGardrop}/></div>}
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
  const [isUnboxing,setIsUnboxing] = useState(false)
  useEffect(()=>{
    setMounted(true)
    const check=()=>setIsDesktop(window.innerWidth>=1024)
    check()
    window.addEventListener('resize',check)
    const params = new URLSearchParams(window.location.search)
    if (params.get('mode')==='unboxing') setIsUnboxing(true)
    return ()=>window.removeEventListener('resize',check)
  },[])
  if (!mounted) return <div style={{position:'fixed',inset:0,background:'#FFFFFF'}}/>
  return isDesktop ? <DesktopApp initialUnboxing={isUnboxing}/> : <MobileApp initialUnboxing={isUnboxing}/>
}
