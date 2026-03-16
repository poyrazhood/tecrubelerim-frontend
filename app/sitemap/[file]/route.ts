
const SITE_URL = 'https://tecrubelerim.com'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const BATCH_SIZE = 50000

export async function GET(
  request: Request,
  { params }: { params: { file: string } }
) {
  const file = params.file
  const today = new Date().toISOString().split('T')[0]

  if (file === 'cities.xml') {
    const cities = ["adana","adiyaman","afyonkarahisar","aksaray","amasya","ankara","antalya","ardahan","artvin","aydin","agri","balikesir","bartin","batman","bayburt","bilecik","bingol","bitlis","bolu","burdur","bursa","denizli","diyarbakir","duzce","edirne","elazig","erzincan","erzurum","eskisehir","gaziantep","giresun","gumushane","hakkari","hatay","isparta","igdir","kahramanmaras","karabuk","karaman","kars","kastamonu","kayseri","kilis","kocaeli","konya","kutahya","kirklareli","kirikkale","kirsehir","malatya","manisa","mardin","mersin","mugla","mus","nevsehir","nigde","ordu","osmaniye","rize","sakarya","samsun","siirt","sinop","sivas","tekirdag","tokat","trabzon","tunceli","usak","van","yalova","yozgat","zonguldak","canakkale","cankiri","corum","istanbul","izmir","sanliurfa","sirnak"]
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${cities.map(c => `  <url>
    <loc>${SITE_URL}/${c}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
</urlset>`
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' }
    })
  }


  if (file === 'categories.xml') {
    const categories = ["alisveris","apart-kiralik","oto-kiralama","avm","barlar","dil-okulu","dis-sagligi","dovme-piercing","dugun-organizasyon","eczane","egitim","eglence-kultur","elektronik","evcil-hayvan","ev-mobilya","fast-food","giyim-moda","guzellik-bakim","guzellik-merkezi","hastane","hayvan-bakimevi","hizmetler","hukuk","kafe","kafeler","kahve-cay","kitap-kirtasiye","klinik-poliklinik","konaklama","kuafor-berber","kurs-dershane","market","market-supermarket","muhasebe-finans","muzeler","muzik-sanat","nakliyat","okul","otel","oto-galeri","oto-servis","oyun-eglence","pansiyon-hostel","parklar","pastane-firin","pet-shop","psikoloji-terapi","restoran","restoranlar","saglik-medikal","sinema","spa-masaj","spor-fitness","tadilat-insaat","taksi-servis","temizlik","tirnak-studio","ulasim","universite","veteriner","yeme-icme"]
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories.map(cat => `  <url>
    <loc>${SITE_URL}/kategori/${cat}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`).join('\n')}
</urlset>`
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' }
    })
  }

  if (file === 'districts.xml') {
    const IL_ILCE: Record<string, string[]> = {"adana":["aladag","ceyhan","cukurova","feke","i-mamoglu","karaisali","karatas","kozan","pozanti","saimbeyli","saricam","seyhan","tufanbeyli","yumurtalik","yuregir"],"adiyaman":["besni","celikhan","gerger","golbasi","kahta","merkez","samsat","sincik","tut"],"afyonkarahisar":["basmakci","bayat","bolvadin","cay","cobanlar","dazkiri","dinar","emirdag","evciler","hocalar","i-hsaniye","i-scehisar","kiziloren","merkez","sandikli","sinanpasa","sultandagi","suhut"],"agri":["diyadin","dogubayazit","eleskirt","hamur","merkez","patnos","taslicay","tutak"],"aksaray":["agacoren","eskil","gulagac","guzelyurt","merkez","ortakoy","sariyahsi","sultanhani"],"amasya":["goynucek","gumushacikoy","hamamozu","merkez","merzifon","suluova","tasova"],"ankara":["akyurt","altindag","ayas","bala","beypazari","camlidere","cankaya","cubuk","elmadag","etimesgut","evren","golbasi","gudul","haymana","kalecik","kahramankazan","kecioren","kizilcahamam","mamak","nallihan","polatli","pursaklar","sincan","sereflikochisar","yenimahalle"],"antalya":["akseki","aksu","alanya","demre","dosemealti","elmali","finike","gazipasa","gundogmus","i-bradi","kas","kemer","kepez","konyaalti","korkuteli","kumluca","manavgat","muratpasa","serik"],"ardahan":["cildir","damal","gole","hanak","merkez","posof"],"artvin":["ardanuc","arhavi","borcka","hopa","kemalpasa","merkez","murgul","savsat","yusufeli"],"aydin":["bozdogan","buharkent","cine","didim","efeler","germencik","i-ncirliova","karacasu","karpuzlu","kocarli","kosk","kusadasi","kuyucak","nazilli","soke","sultanhisar","yenipazar"],"balikesir":["altieylul","ayvalik","balya","bandirma","bigadic","burhaniye","dursunbey","edremit","erdek","gomec","gonen","havran","i-vrindi","karesi","kepsut","manyas","marmara","savastepe","sindirgi","susurluk"],"bartin":["amasra","kurucasile","merkez","ulus"],"batman":["besiri","gercus","hasankeyf","kozluk","merkez","sason"],"bayburt":["aydintepe","demirozu","merkez"],"bilecik":["bozuyuk","golpazari","i-nhisar","merkez","osmaneli","pazaryeri","sogut","yenipazar"],"bingol":["adakli","genc","karliova","kigi","merkez","solhan","yayladere","yedisu"],"bitlis":["adilcevaz","ahlat","guroymak","hizan","merkez","mutki","tatvan"],"bolu":["dortdivan","gerede","goynuk","kibriscik","mengen","merkez","mudurnu","seben","yenicaga"],"burdur":["aglasun","altinyayla","bucak","cavdir","celtikci","golhisar","karamanli","kemer","merkez","tefenni","yesilova"],"bursa":["buyukorhan","gemlik","gursu","harmancik","i-negol","i-znik","karacabey","keles","kestel","mudanya","mustafakemalpasa","nilufer","orhaneli","orhangazi","osmangazi","yenisehir","yildirim"],"canakkale":["ayvacik","bayramic","biga","bozcaada","can","eceabat","ezine","gelibolu","gokceada","lapseki","merkez","yenice"],"cankiri":["atkaracalar","bayramoren","cerkes","eldivan","ilgaz","kizilirmak","korgun","kursunlu","merkez","orta","sabanozu","yaprakli"],"corum":["alaca","bayat","bogazkale","dodurga","i-skilip","kargi","lacin","mecitozu","merkez","oguzlar","ortakoy","osmancik","sungurlu","ugurludag"],"denizli":["acipayam","babadag","baklan","bekilli","beyagac","bozkurt","buldan","cal","cameli","cardak","civril","guney","honaz","kale","merkezefendi","pamukkale","saraykoy","serinhisar","tavas"],"diyarbakir":["baglar","bismil","cermik","cinar","cungus","dicle","egil","ergani","hani","hazro","kayapinar","kocakoy","kulp","lice","silvan","sur","yenisehir"],"duzce":["akcakoca","cumayeri","cilimli","golyaka","gumusova","kaynasli","merkez","yigilca"],"edirne":["enez","havsa","i-psala","kesan","lalapasa","meric","merkez","suloglu","uzunkopru"],"elazig":["agin","alacakaya","aricak","baskil","karakocan","keban","kovancilar","maden","merkez","palu","sivrice"],"erzincan":["cayirli","i-lic","kemah","kemaliye","merkez","otlukbeli","refahiye","tercan","uzumlu"],"erzurum":["askale","aziziye","cat","hinis","horasan","i-spir","karacoban","karayazi","koprukoy","merkez","narman","oltu","olur","palandoken","pasinler","pazaryolu","senkaya","tekman","tortum","uzundere","yakutiye"],"eskisehir":["alpu","beylikova","cifteler","gunyuzu","han","i-nonu","mahmudiye","mihalgazi","mihaliccik","odunpazari","saricakaya","seyitgazi","sivrihisar","tepebasi"],"gaziantep":["araban","i-slahiye","karkamis","nizip","nurdagi","oguzeli","sahinbey","sehitkamil","yavuzeli"],"giresun":["alucra","bulancak","camoluk","canakci","dereli","dogankent","espiye","eynesil","gorele","guce","kesap","merkez","piraziz","sebinkarahisar","tirebolu","yaglidere"],"gumushane":["kelkit","kose","kurtun","merkez","siran","torul"],"hakkari":["cukurca","derecik","merkez","semdinli","yuksekova"],"hatay":["altinozu","antakya","arsuz","belen","defne","dortyol","erzin","hassa","i-skenderun","kirikhan","kumlu","mandaci","payas","reyhanli","samandag","serinyol","yayladagi"],"igdir":["aralik","karakoyunlu","merkez","tuzluca"],"isparta":["aksu","atabey","egirdir","gelendost","gonen","keciborlu","merkez","senirkent","sutculer","sarkikaraagac","uluborlu","yalvac","yenisarbademli"],"istanbul":["adalar","arnavutkoy","atasehir","avcilar","bagcilar","bahcelievler","bakirkoy","basaksehir","bayrampasa","besiktas","beykoz","beylikduzu","beyoglu","buyukcekmece","catalca","cekmekoy","esenler","esenyurt","eyupsultan","fatih","gaziosmanpasa","gungoren","kadikoy","kagithane","kartal","kucukcekmece","maltepe","pendik","sancaktepe","sariyer","silivri","sultanbeyli","sultangazi","sile","sisli","tuzla","umraniye","uskudar","zeytinburnu"],"izmir":["aliaga","balcova","bayindir","bayrakli","bergama","beydag","bornova","buca","cesme","cigli","dikili","foca","gaziemir","guzelbahce","karabaglar","karaburun","karsiyaka","kemalpasa","kinik","kiraz","konak","menderes","menemen","narlidere","odemis","seferihisar","selcuk","tire","torbali","urla"],"kahramanmaras":["afsin","andirin","caglayancerit","dulkadiroglu","ekinozu","elbistan","goksun","merkez","nurhak","onikisubat","pazarcik","turkoglu"],"karabuk":["eflani","eskipazar","merkez","ovacik","safranbolu","yenice"],"karaman":["ayranci","basyayla","ermenek","kazimkarabekir","merkez","sariveliler"],"kars":["akyaka","arpacay","digor","kagizman","merkez","sarikamis","selim","susuz"],"kastamonu":["abana","agli","arac","azdavay","bozkurt","cide","catalzeytin","daday","devrekani","doganyurt","hanonu","i-hsangazi","i-nebolu","kure","merkez","pinarbasi","seydiler","senpazar","taskopru","tosya"],"kayseri":["akkisla","bunyan","develi","felahiye","hacilar","i-ncesu","kocasinan","melikgazi","ozvatan","pinarbasi","sarioglan","sariz","talas","tomarza","yahyali","yesilhisar"],"kirikkale":["bahsili","baliseyh","celebi","delice","karakecili","keskin","merkez","sulakyurt","yahsihan"],"kirklareli":["babaeski","demirkoy","kofcaz","luleburgaz","merkez","pehlivankoy","pinarhisar","vize"],"kirsehir":["akcakent","akpinar","boztepe","cicekdagi","kaman","merkez","mucur"],"kilis":["elbeyli","merkez","musabeyli","polateli"],"kocaeli":["basiskele","cayirova","darica","derince","dilovasi","gebze","golcuk","i-zmit","kandira","karamursel","kartepe","korfez"],"konya":["ahirli","akoren","aksehir","altinekin","beysehir","bozkir","cihanbeyli","celtik","cumra","derbent","derebucak","doganhisar","emirgazi","eregli","guneysinir","hadim","halkapinar","huyuk","ilgin","kadinhani","karapinar","karatay","kulu","meram","sarayonu","selcuklu","seydisehir","taskent","tuzlukcu","yalihuyuk","yunak"],"kutahya":["altintas","aslanapa","cavdarhisar","domanic","dumlupinar","emet","gediz","hisarcik","merkez","pazarlar","simav","saphane","tavsanli"],"malatya":["akcadag","arapgir","arguvan","battalgazi","darende","dogansehir","doganyol","hekimhan","kale","kuluncak","merkez","puturge","yazihan","yesilyurt"],"manisa":["ahmetli","akhisar","alasehir","demirci","golmarmara","gordes","kirkagac","koprubasi","kula","merkez","salihli","sarigol","saruhanli","selendi","soma","sehzadeler","turgutlu","yunusemre"],"mardin":["artuklu","dargecit","derik","kiziltepe","mazidagi","merkez","midyat","nusaybin","omerli","savur","yesilli"],"mersin":["akdeniz","anamur","aydincik","bozyazi","camliyayla","erdemli","gulnar","mezitli","mut","silifke","tarsus","toroslar","yenisehir"],"mugla":["bodrum","dalaman","datca","fethiye","kavaklidere","koycegiz","marmaris","mentese","milas","ortaca","seydikemer","ula","yatagan"],"mus":["bulanik","haskoy","korkut","malazgirt","merkez","varto"],"nevsehir":["acigol","avanos","derinkuyu","gulsehir","hacibektas","kozakli","merkez","urgup"],"nigde":["altunhisar","bor","camardi","ciftlik","merkez","ulukisla"],"ordu":["akkus","altinordu","aybasti","camas","catalpinar","caybasi","fatsa","golkoy","gulyali","gurgentepe","i-kizce","kabaduz","kabatas","korgan","kumru","mesudiye","persembe","ulubey","unye"],"osmaniye":["bahce","duzici","hasanbeyli","kadirli","merkez","sumbas","toprakkale"],"rize":["ardesen","camlihemsin","cayeli","derepazari","findikli","guneysu","hemsin","i-kizdere","i-yidere","kalkandere","merkez","pazar"],"sakarya":["adapazari","akyazi","arifiye","erenler","ferizli","geyve","hendek","karapurcek","karasu","kaynarca","kocaali","mithatpasa","pamukova","sapanca","serdivan","sogutlu","tarakli"],"samsun":["alacam","asarcik","atakum","ayvacik","bafra","canik","carsamba","havza","i-lkadim","kavak","ladik","salipazari","tekkekoy","terme","vezirkopru","yakakent"],"siirt":["baykan","eruh","kurtalan","merkez","pervari","sirvan","tillo"],"sinop":["ayancik","boyabat","dikmen","duragan","erfelek","gerze","merkez","sarayduzu","turkeli"],"sivas":["akincilar","altinyayla","divrigi","dogansar","gemerek","golova","gurun","hafik","i-mranli","kangal","koyulhisar","merkez","susehri","sarkisla","ulas","yildizeli","zara"],"sanliurfa":["akcakale","birecik","bozova","ceylanpinar","eyyubiye","halfeti","haliliye","harran","hilvan","karakopru","merkez","siverek","suruc","viransehir"],"sirnak":["beytussebap","cizre","guclukonak","i-dil","merkez","silopi","uludere"],"tekirdag":["cerkezkoy","corlu","ergene","hayrabolu","kapakli","malkara","marmaraereglisi","merkez","muratli","saray","suleymanpasa","sarkoy"],"tokat":["almus","artova","basciftlik","erbaa","merkez","niksar","pazar","resadiye","sulusaray","turhal","yesilyurt","zile"],"trabzon":["akcaabat","arakli","arsin","besikduzu","carsibasi","caykara","dernekpazari","duzkoy","hayrat","koprubasi","macka","of","ortahisar","salpazari","surmene","tonya","vakfikebir","yomra"],"tunceli":["cemisgezek","hozat","mazgirt","merkez","nazimiye","ovacik","pertek","pulumur"],"usak":["banaz","esme","karahalli","merkez","sivasli","ulubey"],"van":["bahcesaray","baskale","caldiran","catak","edremit","ercis","gevas","gurpinar","i-pekyolu","merkez","muradiye","ozalp","saray","tusba"],"yalova":["altinova","armutlu","cinarcik","ciftlikkoy","merkez","termal"],"yozgat":["akdagmadeni","aydincik","bogazliyan","candir","cayiralan","cekerek","kadisehri","merkez","saraykent","sarikaya","sefaatli","sorgun","yenifakili","yerkoy"],"zonguldak":["alapli","caycuma","devrek","eregli","gokcebey","kilimli","kozlu","merkez"]}

    const urls: string[] = []
    for (const [city, districts] of Object.entries(IL_ILCE)) {
      for (const district of districts) {
        urls.push(`  <url>
    <loc>${SITE_URL}/${city}/${district}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>`)
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=86400' }
    })
  }


  if (file === 'kategori-cities.xml') {
    const SLUGS = ["alisveris","egitim","eglence-kultur","evcil-hayvan","guzellik-bakim","hizmetler","konaklama","saglik-medikal","ulasim","yeme-icme","restoran","kafe","oto-servis","spor-fitness","hastane","otel"]
    const CITIES = ["istanbul","ankara","izmir","bursa","antalya","adana","konya","gaziantep","mersin","kayseri","eskisehir","diyarbakir","samsun","denizli","trabzon"]
    const urls = []
    for (const slug of SLUGS) {
      urls.push(`  <url>
    <loc>${SITE_URL}/kategori/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`)
      for (const city of CITIES) {
        urls.push(`  <url>
    <loc>${SITE_URL}/kategori/${slug}/${city}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`)
      }
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' }
    })
  }

  const match = file.match(/^businesses-(\d+)\.xml$/)
  if (!match) return new Response('Not found', { status: 404 })

  const batchNum = parseInt(match[1])
  const startPage = Math.floor(((batchNum - 1) * BATCH_SIZE) / 1000) + 1

  try {
    const allSlugs: { slug: string; updatedAt: string }[] = []
    let currentPage = startPage

    while (allSlugs.length < BATCH_SIZE) {
      const res = await fetch(
        `${API_BASE}/businesses?page=${currentPage}&limit=1000&_sitemap=1`,
        { next: { revalidate: 86400 } }
      )
      if (!res.ok) break
      const data = await res.json()
      const businesses = data.businesses ?? data.data ?? []
      if (businesses.length === 0) break
      allSlugs.push(...businesses.map((b: any) => ({
        slug: b.slug,
        updatedAt: b.updatedAt ?? new Date().toISOString()
      })))
      currentPage++
      if (businesses.length < 1000) break
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allSlugs.map(b => `  <url>
    <loc>${SITE_URL}/isletme/${b.slug}</loc>
    <lastmod>${new Date(b.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`

    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=86400' }
    })
  } catch {
    return new Response('Error generating sitemap', { status: 500 })
  }
}
