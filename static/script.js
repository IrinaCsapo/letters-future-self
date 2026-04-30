// ── Internationalisation ──────────────────────────────

const LOCALES = {
  en:'en-GB', es:'es-ES', fr:'fr-FR', de:'de-DE', pt:'pt-PT',
  ro:'ro-RO', hu:'hu-HU', pl:'pl-PL', uk:'uk-UA', ru:'ru-RU',
  it:'it-IT', sv:'sv-SE', nl:'nl-NL', da:'da-DK', no:'nb-NO',
  fi:'fi-FI', cs:'cs-CZ', sk:'sk-SK', hr:'hr-HR', bg:'bg-BG',
  el:'el-GR', tr:'tr-TR', lt:'lt-LT', lv:'lv-LV', sl:'sl-SI',
};

const LANG_NAMES = {
  en:'English',    es:'Español',     fr:'Français',   de:'Deutsch',
  pt:'Português',  ro:'Română',      hu:'Magyar',      pl:'Polski',
  uk:'Українська', ru:'Русский',     it:'Italiano',    sv:'Svenska',
  nl:'Nederlands', da:'Dansk',       no:'Norsk',       fi:'Suomi',
  cs:'Čeština',    sk:'Slovenčina',  hr:'Hrvatski',    bg:'Български',
  el:'Ελληνικά',   tr:'Türkçe',      lt:'Lietuvių',    lv:'Latviešu',
  sl:'Slovenščina',
};

// ── PDF font cache — preloaded at startup ─────────────
// jsPDF built-in fonts only cover Latin-1, which garbles Romanian,
// Polish, Czech, Greek etc. We fetch Lora TTF from jsDelivr and embed
// it via addFileToVFS so every language renders correctly.
const PDF_FONTS = { regular: null, italic: null, bolditalic: null };

(async function preloadPDFFonts() {
  const CDN = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/lora/static/';
  const files = [
    { key: 'regular',    file: 'Lora-Regular.ttf'    },
    { key: 'italic',     file: 'Lora-Italic.ttf'     },
    { key: 'bolditalic', file: 'Lora-BoldItalic.ttf' },
  ];
  await Promise.all(files.map(async ({ key, file }) => {
    try {
      const res  = await fetch(CDN + file);
      const buf  = await res.arrayBuffer();
      const b64  = btoa(String.fromCharCode(...new Uint8Array(buf)));
      PDF_FONTS[key] = b64;
    } catch (e) {
      console.warn('PDF font preload failed for', file, e);
    }
  }));
})();

const TRANSLATIONS = {
  en: {
    eyebrow:'A letter through time',
    h1:'Letters from<br><em>Your Future Self</em>',
    subtitle:'Write honestly. Write in {lang}, your future self will reply in kind.',
    prompt_label:"What's been weighing on you lately?",
    placeholder:"Start writing… there's no wrong way to do this.",
    note_language:'Write in any language — your future self will reply in kind.',
    note_private:'Your letters are private. We never store or read your words.',
    hint:'Press ⌘ + Enter to send',
    prompts_toggle:"Don't know what to write about?",
    prompts_heading:'Write about yourself',
    prompts_sub:'You could write about…',
    p1:'your hopes and dreams for the years ahead',
    p2:"something that's been on your mind lately",
    p3:"who or what you're grateful for right now",
    p4:"something difficult you've been through",
    p5:"something you've recently learned about yourself",
    p6:'a recent moment of pride or quiet joy',
    p7:"something that's been weighing heavy on your heart",
    p8:"a worry you hope won't matter in ten years",
    send:'Send',
    loading_eyebrow:'From {year}',
    loading_text:'Your future self\nis writing',
    save_pdf:'Save as PDF',
    copy_link:'Copy link',
    write_another:'Write another',
    link_copied:'Link copied to clipboard',
    shared_text:'This letter was written using Letters from Your Future Self.',
    write_own:'Write your own',
    with_love:'With love,',
    sig_name:'You, from {year}',
    pdf_title:'LETTERS FROM YOUR FUTURE SELF',
    pdf_written:'Written on:',
    pdf_from:'From:',
    pdf_footer:'Letters from Your Future Self',
  },
  es: {
    eyebrow:'Una carta a través del tiempo',
    h1:'Cartas de<br><em>Tu Yo Futuro</em>',
    subtitle:'Escribe con honestidad. Escribe en {lang} — tu yo futuro te responderá.',
    prompt_label:'¿Qué ha pesado en ti últimamente?',
    placeholder:'Empieza a escribir… no hay forma incorrecta de hacerlo.',
    note_language:'Escribe en cualquier idioma — tu yo futuro responderá en el mismo.',
    note_private:'Tus cartas son privadas. Nunca almacenamos ni leemos tus palabras.',
    hint:'Presiona ⌘ + Enter para enviar',
    prompts_toggle:'¿No sabes sobre qué escribir?',
    prompts_heading:'Escribe sobre ti mismo',
    prompts_sub:'Podrías escribir sobre…',
    p1:'tus esperanzas y sueños para los años venideros',
    p2:'algo que ha estado en tu mente últimamente',
    p3:'por quién o qué estás agradecido ahora mismo',
    p4:'algo difícil que hayas atravesado',
    p5:'algo que hayas aprendido recientemente sobre ti mismo',
    p6:'un momento reciente de orgullo o alegría silenciosa',
    p7:'algo que ha pesado en tu corazón',
    p8:'una preocupación que esperas que no importe en diez años',
    send:'Enviar',
    loading_eyebrow:'Desde {year}',
    loading_text:'Tu yo futuro\nestá escribiendo',
    save_pdf:'Guardar como PDF',
    copy_link:'Copiar enlace',
    write_another:'Escribir otra',
    link_copied:'Enlace copiado al portapapeles',
    shared_text:'Esta carta fue escrita usando Cartas de Tu Yo Futuro.',
    write_own:'Escribe la tuya',
    with_love:'Con amor,',
    sig_name:'Tú, desde {year}',
    pdf_title:'CARTAS DE TU YO FUTURO',
    pdf_written:'Escrito el:',
    pdf_from:'De:',
    pdf_footer:'Cartas de Tu Yo Futuro',
  },
  fr: {
    eyebrow:'Une lettre à travers le temps',
    h1:'Lettres de<br><em>Ton Futur Toi</em>',
    subtitle:'Écris honnêtement. Écris en {lang} — ton futur toi te répondra.',
    prompt_label:'Qu’est-ce qui te pèse en ce moment ?',
    placeholder:'Commence à écrire… il n’y a pas de mauvaise façon.',
    note_language:'Écris dans n’importe quelle langue — ton futur toi répondra de même.',
    note_private:'Tes lettres sont privées. Nous ne stockons ni ne lisons jamais tes mots.',
    hint:'Appuie sur ⌘ + Entrée pour envoyer',
    prompts_toggle:'Tu ne sais pas quoi écrire ?',
    prompts_heading:'Écris sur toi-même',
    prompts_sub:'Tu pourrais écrire sur…',
    p1:'tes espoirs et rêves pour les années à venir',
    p2:'quelque chose qui occupe ton esprit dernièrement',
    p3:'ce ou qui tu es reconnaissant·e en ce moment',
    p4:'quelque chose de difficile que tu as traversé',
    p5:'quelque chose que tu as récemment appris sur toi-même',
    p6:'un moment récent de fierté ou de joie tranquille',
    p7:'quelque chose qui pèse lourd sur ton cœur',
    p8:'une inquiétude que tu espères voir disparaître dans dix ans',
    send:'Envoyer',
    loading_eyebrow:'Depuis {year}',
    loading_text:'Ton futur toi\nécrit',
    save_pdf:'Enregistrer en PDF',
    copy_link:'Copier le lien',
    write_another:'Écrire une autre',
    link_copied:'Lien copié dans le presse-papiers',
    shared_text:'Cette lettre a été écrite grâce à Lettres de Ton Futur Toi.',
    write_own:'Écris la tienne',
    with_love:'Avec amour,',
    sig_name:'Toi, en {year}',
    pdf_title:'LETTRES DE TON FUTUR TOI',
    pdf_written:'Écrit le :',
    pdf_from:'De :',
    pdf_footer:'Lettres de Ton Futur Toi',
  },
  de: {
    eyebrow:'Ein Brief durch die Zeit',
    h1:'Briefe von<br><em>Deinem Zukünftigen Ich</em>',
    subtitle:'Schreib ehrlich. Schreib auf {lang} — dein zukünftiges Ich antwortet.',
    prompt_label:'Was beschäftigt dich gerade?',
    placeholder:'Fang einfach an zu schreiben… es gibt keinen falschen Weg.',
    note_language:'Schreib in jeder Sprache — dein zukünftiges Ich antwortet in derselben.',
    note_private:'Deine Briefe sind privat. Wir speichern oder lesen deine Worte niemals.',
    hint:'Drücke ⌘ + Enter zum Senden',
    prompts_toggle:'Weißt du nicht, worüber du schreiben sollst?',
    prompts_heading:'Schreib über dich selbst',
    prompts_sub:'Du könntest schreiben über…',
    p1:'deine Hoffnungen und Träume für die kommenden Jahre',
    p2:'etwas, das dich in letzter Zeit beschäftigt',
    p3:'wofür oder für wen du gerade dankbar bist',
    p4:'etwas Schwieriges, das du durchgemacht hast',
    p5:'etwas, das du kürzlich über dich selbst gelernt hast',
    p6:'einen kürzlichen Moment des Stolzes oder der stillen Freude',
    p7:'etwas, das schwer auf deinem Herzen liegt',
    p8:'eine Sorge, von der du hoffst, dass sie in zehn Jahren keine Rolle mehr spielt',
    send:'Senden',
    loading_eyebrow:'Aus dem Jahr {year}',
    loading_text:'Dein zukünftiges Ich\nschreibt',
    save_pdf:'Als PDF speichern',
    copy_link:'Link kopieren',
    write_another:'Einen weiteren schreiben',
    link_copied:'Link in die Zwischenablage kopiert',
    shared_text:'Dieser Brief wurde mit Briefe von Deinem Zukünftigen Ich verfasst.',
    write_own:'Schreib deinen eigenen',
    with_love:'In Liebe,',
    sig_name:'Du, aus dem Jahr {year}',
    pdf_title:'BRIEFE VON DEINEM ZUKÜNFTIGEN ICH',
    pdf_written:'Geschrieben am:',
    pdf_from:'Von:',
    pdf_footer:'Briefe von Deinem Zukünftigen Ich',
  },
  pt: {
    eyebrow:'Uma carta através do tempo',
    h1:'Cartas do<br><em>Seu Eu Futuro</em>',
    subtitle:'Escreva com honestidade. Escreva em {lang} — seu eu futuro vai responder.',
    prompt_label:'O que tem pesado em você ultimamente?',
    placeholder:'Comece a escrever… não há forma errada de fazer isso.',
    note_language:'Escreva em qualquer idioma — seu eu futuro responderá na mesma língua.',
    note_private:'Suas cartas são privadas. Nunca armazenamos ou lemos suas palavras.',
    hint:'Pressione ⌘ + Enter para enviar',
    prompts_toggle:'Não sabe sobre o que escrever?',
    prompts_heading:'Escreva sobre você mesmo',
    prompts_sub:'Você poderia escrever sobre…',
    p1:'suas esperanças e sonhos para os anos que virão',
    p2:'algo que tem estado em sua mente ultimamente',
    p3:'por quem ou pelo que você é grato agora',
    p4:'algo difícil pelo qual você passou',
    p5:'algo que você aprendeu recentemente sobre si mesmo',
    p6:'um momento recente de orgulho ou alegria tranquila',
    p7:'algo que tem pesado em seu coração',
    p8:'uma preocupação que você espera que não importe em dez anos',
    send:'Enviar',
    loading_eyebrow:'De {year}',
    loading_text:'Seu eu futuro\nestá escrevendo',
    save_pdf:'Salvar como PDF',
    copy_link:'Copiar link',
    write_another:'Escrever outra',
    link_copied:'Link copiado para a área de transferência',
    shared_text:'Esta carta foi escrita usando Cartas do Seu Eu Futuro.',
    write_own:'Escreva a sua',
    with_love:'Com amor,',
    sig_name:'Você, em {year}',
    pdf_title:'CARTAS DO SEU EU FUTURO',
    pdf_written:'Escrito em:',
    pdf_from:'De:',
    pdf_footer:'Cartas do Seu Eu Futuro',
  },
  ro: {
    eyebrow:'O scrisoare prin timp',
    h1:'Scrisori de la<br><em>Eul Tău Viitor</em>',
    subtitle:'Scrie sincer. Scrie în {lang} — eul tău viitor îți va răspunde.',
    prompt_label:'Ce te apasă în ultima vreme?',
    placeholder:'Începe să scrii… nu există o modalitate greșită.',
    note_language:'Scrie în orice limbă — eul tău viitor va răspunde în aceeași limbă.',
    note_private:'Scrisorile tale sunt private. Nu stocăm și nu citim niciodată cuvintele tale.',
    hint:'Apasă ⌘ + Enter pentru a trimite',
    prompts_toggle:'Nu știi despre ce să scrii?',
    prompts_heading:'Scrie despre tine',
    prompts_sub:'Ai putea scrie despre…',
    p1:'speranțele și visurile tale pentru anii care urmează',
    p2:'ceva care ți-a ocupat mintea recent',
    p3:'pentru cine sau ce ești recunoscător acum',
    p4:'ceva dificil prin care ai trecut',
    p5:'ceva ce ai învățat recent despre tine',
    p6:'un moment recent de mândrie sau bucurie liniștită',
    p7:'ceva ce apasă greu pe inima ta',
    p8:'o grijă pe care speri că nu va mai conta în zece ani',
    send:'Trimite',
    loading_eyebrow:'Din {year}',
    loading_text:'Eul tău viitor\nscrie',
    save_pdf:'Salvează ca PDF',
    copy_link:'Copiază link-ul',
    write_another:'Scrie o alta',
    link_copied:'Link copiat în clipboard',
    shared_text:'Această scrisoare a fost scrisă folosind Scrisori de la Eul Tău Viitor.',
    write_own:'Scrie propria ta',
    with_love:'Cu drag,',
    sig_name:'Tu, din {year}',
    pdf_title:'SCRISORI DE LA EOUL TĂU VIITOR',
    pdf_written:'Scris pe:',
    pdf_from:'De la:',
    pdf_footer:'Scrisori de la Eul Tău Viitor',
  },
  hu: {
    eyebrow:'Egy levél az időn át',
    h1:'Levelek<br><em>Jövőbeli Éned Tollából</em>',
    subtitle:'Írj őszintén, {lang} nyelven — jövőbeli éned válaszolni fog.',
    prompt_label:'Mi nyomasztott az utóbbi időben?',
    placeholder:'Kezdj el írni… nincs rossz módszer.',
    note_language:'Írj bármilyen nyelven — jövőbeli éned ugyanazon a nyelven válaszol.',
    note_private:'Leveleid privátak. Soha nem tároljuk vagy olvassuk el szavaidat.',
    hint:'Nyomj ⌘ + Enter a küldéshez',
    prompts_toggle:'Nem tudod, miről írj?',
    prompts_heading:'Írj magadról',
    prompts_sub:'Írhatsz például…',
    p1:'reményeidről és álmaidról az elkövetkező évekre',
    p2:'valamiről, ami mostanában foglalkoztat',
    p3:'miért vagy hálás most',
    p4:'valamiről, amin nehezen mentél keresztül',
    p5:'valamiről, amit nemrég tanultál magadról',
    p6:'egy közelmúltbeli büszkeség vagy csendes öröm pillanatáról',
    p7:'valamiről, ami nehéz terhet jelent a szívednek',
    p8:'egy aggodalmadról, amelyet remélsz, hogy tíz év múlva már nem fog számítani',
    send:'Küldés',
    loading_eyebrow:'{year}-ből',
    loading_text:'Jövőbeli éned\nír',
    save_pdf:'Mentés PDF-ként',
    copy_link:'Link másolása',
    write_another:'Írj egy másik levelet',
    link_copied:'Link a vágólapra másolva',
    shared_text:'Ez a levél a Levelek Jövőbeli Éned Tollából alkalmazással készült.',
    write_own:'Írj sajátot',
    with_love:'Szeretettel,',
    sig_name:'{year}-ből, Te',
    pdf_title:'LEVELEK JÖVŐBELI ÉNED TOLLÁBÓL',
    pdf_written:'Írva:',
    pdf_from:'Feladó:',
    pdf_footer:'Levelek Jövőbeli Éned Tollából',
  },
  pl: {
    eyebrow:'List przez czas',
    h1:'Listy od<br><em>Twojego Przyszłego Ja</em>',
    subtitle:'Pisz szczerze, w języku {lang} — twoje przyszłe ja odpisze.',
    prompt_label:'Co ostatnio Cię przygnębia?',
    placeholder:'Zacznij pisać… nie ma złego sposobu na to.',
    note_language:'Pisz w dowolnym języku — Twoje przyszłe ja odpowie w tym samym.',
    note_private:'Twoje listy są prywatne. Nigdy nie przechowujemy ani nie czytamy Twoich słów.',
    hint:'Naciśnij ⌘ + Enter, aby wysłać',
    prompts_toggle:'Nie wiesz o czym pisać?',
    prompts_heading:'Pisz o sobie',
    prompts_sub:'Możesz pisać o…',
    p1:'swoich nadziejach i marzeniach na nadchodzące lata',
    p2:'czymś, co ostatnio zaprzątało Ci myśli',
    p3:'za kogo lub za co jesteś teraz wdzięczny',
    p4:'czymś trudnym, przez co przeszłeś',
    p5:'czymś, czego ostatnio dowiedziałeś się o sobie',
    p6:'niedawnym momencie dumy lub cichej radości',
    p7:'czymś, co ciąży na Twoim sercu',
    p8:'zmartwieniu, które masz nadzieję, że za dziesięć lat nie będzie miało znaczenia',
    send:'Wyślij',
    loading_eyebrow:'Z roku {year}',
    loading_text:'Twoje przyszłe ja\npisze',
    save_pdf:'Zapisz jako PDF',
    copy_link:'Kopiuj link',
    write_another:'Napisz kolejny',
    link_copied:'Link skopiowany do schowka',
    shared_text:'Ten list został napisany przy użyciu Listy od Twojego Przyszłego Ja.',
    write_own:'Napisz swój własny',
    with_love:'Z miłością,',
    sig_name:'Ty, z {year}',
    pdf_title:'LISTY OD TWOJEGO PRZYSZŁEGO JA',
    pdf_written:'Napisano:',
    pdf_from:'Od:',
    pdf_footer:'Listy od Twojego Przyszłego Ja',
  },
  uk: {
    eyebrow:'Лист крізь час',
    h1:'Листи від<br><em>Твого Майбутнього Я</em>',
    subtitle:'Пиши відверто, мовою {lang} — твоє майбутнє я відповість.',
    prompt_label:'Що тебе турбує останнім часом?',
    placeholder:'Починай писати… немає неправильного способу.',
    note_language:'Пиши будь-якою мовою — твоє майбутнє я відповість тією самою.',
    note_private:'Твої листи приватні. Ми ніколи не зберігаємо і не читаємо твоїх слів.',
    hint:'Натисни ⌘ + Enter, щоб надіслати',
    prompts_toggle:'Не знаєш, про що писати?',
    prompts_heading:'Пиши про себе',
    prompts_sub:'Ти можеш писати про…',
    p1:'свої надії та мрії на роки вперед',
    p2:'щось, що займало твої думки останнім часом',
    p3:'за кого або за що ти вдячний прямо зараз',
    p4:'щось важке, через що тобі довелось пройти',
    p5:'щось, що ти нещодавно дізнався про себе',
    p6:'недавній момент гордості або тихої радості',
    p7:'щось, що важко лежить на твоєму серці',
    p8:'тривогу, яку ти сподіваєшся, що через десять років вона не матиме значення',
    send:'Надіслати',
    loading_eyebrow:'З {year} року',
    loading_text:'Твоє майбутнє я\nпише',
    save_pdf:'Зберегти як PDF',
    copy_link:'Копіювати посилання',
    write_another:'Написати ще',
    link_copied:'Посилання скопійовано',
    shared_text:'Цей лист написано за допомогою Листи від Твого Майбутнього Я.',
    write_own:'Напиши своє',
    with_love:"З любов'ю,",
    sig_name:'Ти, з {year}',
    pdf_title:'ЛИСТИ ВІД ТВОГО МАЙБУТНЬОГО Я',
    pdf_written:'Написано:',
    pdf_from:'Від:',
    pdf_footer:'Листи від Твого Майбутнього Я',
  },
  ru: {
    eyebrow:'Письмо сквозь время',
    h1:'Письма от<br><em>Твоего Будущего Я</em>',
    subtitle:'Пиши честно, на {lang} — твоё будущее я ответит.',
    prompt_label:'Что тебя тревожит в последнее время?',
    placeholder:'Начни писать… нет неправильного способа.',
    note_language:'Пиши на любом языке — твоё будущее я ответит на том же.',
    note_private:'Твои письма приватны. Мы никогда не храним и не читаем твои слова.',
    hint:'Нажми ⌘ + Enter для отправки',
    prompts_toggle:'Не знаешь, о чём писать?',
    prompts_heading:'Пиши о себе',
    prompts_sub:'Ты можешь писать о…',
    p1:'своих надеждах и мечтах на предстоящие годы',
    p2:'чём-то, что занимало твои мысли в последнее время',
    p3:'за кого или за что ты благодарен прямо сейчас',
    p4:'чём-то трудном, через что тебе пришлось пройти',
    p5:'чём-то, что ты недавно узнал о себе',
    p6:'недавнем моменте гордости или тихой радости',
    p7:'чём-то, что лежит тяжёлым грузом на твоём сердце',
    p8:'тревоге, которую ты надеешься, что через десять лет не будет важна',
    send:'Отправить',
    loading_eyebrow:'Из {year} года',
    loading_text:'Твоё будущее я\nпишет',
    save_pdf:'Сохранить как PDF',
    copy_link:'Копировать ссылку',
    write_another:'Написать ещё',
    link_copied:'Ссылка скопирована',
    shared_text:'Это письмо написано с помощью Письма от Твоего Будущего Я.',
    write_own:'Напиши своё',
    with_love:'С любовью,',
    sig_name:'Ты, из {year}',
    pdf_title:'ПИСЬМА ОТ ТВОЕГО БУДУЩЕГО Я',
    pdf_written:'Написано:',
    pdf_from:'От:',
    pdf_footer:'Письма от Твоего Будущего Я',
  },
  it: {
    eyebrow:'Una lettera attraverso il tempo',
    h1:'Lettere dal<br><em>Tuo Sé Futuro</em>',
    subtitle:'Scrivi onestamente. Scrivi in {lang} — il tuo sé futuro risponderà.',
    prompt_label:'Cosa ti pesa ultimamente?',
    placeholder:'Inizia a scrivere… non esiste un modo sbagliato.',
    note_language:'Scrivi in qualsiasi lingua — il tuo sé futuro risponderà nella stessa.',
    note_private:'Le tue lettere sono private. Non archiviamo né leggiamo mai le tue parole.',
    hint:'Premi ⌘ + Invio per inviare',
    prompts_toggle:'Non sai di cosa scrivere?',
    prompts_heading:'Scrivi di te stesso',
    prompts_sub:'Potresti scrivere di…',
    p1:'le tue speranze e i tuoi sogni per gli anni a venire',
    p2:'qualcosa che ti ha occupato la mente ultimamente',
    p3:'di chi o cosa sei grato in questo momento',
    p4:'qualcosa di difficile che hai attraversato',
    p5:'qualcosa che hai scoperto di recente su te stesso',
    p6:'un recente momento di orgoglio o gioia silenziosa',
    p7:'qualcosa che pesa sul tuo cuore',
    p8:'una preoccupazione che speri non conti più tra dieci anni',
    send:'Invia',
    loading_eyebrow:'Dal {year}',
    loading_text:'Il tuo sé futuro\nsta scrivendo',
    save_pdf:'Salva come PDF',
    copy_link:'Copia link',
    write_another:"Scrivi un'altra",
    link_copied:'Link copiato negli appunti',
    shared_text:'Questa lettera è stata scritta usando Lettere dal Tuo Sé Futuro.',
    write_own:'Scrivi la tua',
    with_love:'Con amore,',
    sig_name:'Tu, dal {year}',
    pdf_title:'LETTERE DAL TUO SÉ FUTURO',
    pdf_written:'Scritta il:',
    pdf_from:'Da:',
    pdf_footer:'Lettere dal Tuo Sé Futuro',
  },
  sv: {
    eyebrow:'Ett brev genom tiden',
    h1:'Brev från<br><em>Ditt Framtida Jag</em>',
    subtitle:'Skriv ärligt. Skriv på {lang} — ditt framtida jag svarar.',
    prompt_label:'Vad har tyngt dig på sistone?',
    placeholder:'Börja skriva… det finns inget fel sätt.',
    note_language:'Skriv på vilket språk som helst — ditt framtida jag svarar på samma.',
    note_private:'Dina brev är privata. Vi lagrar eller läser aldrig dina ord.',
    hint:'Tryck ⌘ + Enter för att skicka',
    prompts_toggle:'Vet du inte vad du ska skriva om?',
    prompts_heading:'Skriv om dig själv',
    prompts_sub:'Du kan skriva om…',
    p1:'dina förhoppningar och drömmar för de kommande åren',
    p2:'något som har upptagit dina tankar på sistone',
    p3:'vem eller vad du är tacksam för just nu',
    p4:'något svårt du har gått igenom',
    p5:'något du nyligen lärt dig om dig själv',
    p6:'ett nyligt ögonblick av stolthet eller stilla glädje',
    p7:'något som tynger tungt på ditt hjärta',
    p8:'en oro du hoppas inte kommer att spela någon roll om tio år',
    send:'Skicka',
    loading_eyebrow:'Från {year}',
    loading_text:'Ditt framtida jag\nskriver',
    save_pdf:'Spara som PDF',
    copy_link:'Kopiera länk',
    write_another:'Skriv ett till',
    link_copied:'Länk kopierad till urklipp',
    shared_text:'Det här brevet skrevs med Brev från Ditt Framtida Jag.',
    write_own:'Skriv ditt eget',
    with_love:'Med kärlek,',
    sig_name:'Du, från {year}',
    pdf_title:'BREV FRÅN DITT FRAMTIDA JAG',
    pdf_written:'Skrivet den:',
    pdf_from:'Från:',
    pdf_footer:'Brev från Ditt Framtida Jag',
  },
  nl: {
    eyebrow:'Een brief door de tijd',
    h1:'Brieven van<br><em>Jouw Toekomstige Zelf</em>',
    subtitle:'Schrijf eerlijk. Schrijf in {lang} — jouw toekomstige zelf antwoordt.',
    prompt_label:'Wat houdt je de laatste tijd bezig?',
    placeholder:'Begin te schrijven… er is geen verkeerde manier.',
    note_language:'Schrijf in elke taal — jouw toekomstige zelf antwoordt in dezelfde taal.',
    note_private:'Jouw brieven zijn privé. We slaan jouw woorden nooit op en lezen ze nooit.',
    hint:'Druk op ⌘ + Enter om te verzenden',
    prompts_toggle:'Weet je niet waarover te schrijven?',
    prompts_heading:'Schrijf over jezelf',
    prompts_sub:'Je kunt schrijven over…',
    p1:'jouw hoop en dromen voor de komende jaren',
    p2:'iets wat je de laatste tijd bezighoudt',
    p3:'voor wie of wat je nu dankbaar bent',
    p4:'iets moeilijks wat je hebt meegemaakt',
    p5:'iets wat je onlangs over jezelf hebt geleerd',
    p6:'een recent moment van trots of stille vreugde',
    p7:'iets wat zwaar op je hart weegt',
    p8:'een zorg waarvan je hoopt dat die over tien jaar niet meer telt',
    send:'Versturen',
    loading_eyebrow:'Uit {year}',
    loading_text:'Jouw toekomstige zelf\nis aan het schrijven',
    save_pdf:'Opslaan als PDF',
    copy_link:'Link kopiëren',
    write_another:'Nog een schrijven',
    link_copied:'Link gekopieerd naar klembord',
    shared_text:'Deze brief is geschreven met Brieven van Jouw Toekomstige Zelf.',
    write_own:'Schrijf jouw eigen',
    with_love:'Met liefde,',
    sig_name:'Jij, uit {year}',
    pdf_title:'BRIEVEN VAN JOUW TOEKOMSTIGE ZELF',
    pdf_written:'Geschreven op:',
    pdf_from:'Van:',
    pdf_footer:'Brieven van Jouw Toekomstige Zelf',
  },
  da: {
    eyebrow:'Et brev gennem tiden',
    h1:'Breve fra<br><em>Dit Fremtidige Selv</em>',
    subtitle:'Skriv ærligt. Skriv på {lang} — dit fremtidige selv vil svare.',
    prompt_label:'Hvad har tynget dig for nylig?',
    placeholder:'Begynd at skrive… der er ingen forkert måde.',
    note_language:'Skriv på ethvert sprog — dit fremtidige selv svarer på samme.',
    note_private:'Dine breve er private. Vi gemmer eller læser aldrig dine ord.',
    hint:'Tryk ⌘ + Enter for at sende',
    prompts_toggle:'Ved du ikke, hvad du skal skrive om?',
    prompts_heading:'Skriv om dig selv',
    prompts_sub:'Du kan skrive om…',
    p1:'dine håb og drømme for de kommende år',
    p2:'noget, der har fyldt dine tanker på det seneste',
    p3:'hvem eller hvad du er taknemmelig for lige nu',
    p4:'noget svært, du har været igennem',
    p5:'noget, du for nylig har lært om dig selv',
    p6:'et nyligt øjeblik af stolthed eller stille glæde',
    p7:'noget, der vejer tungt på dit hjerte',
    p8:'en bekymring, du håber ikke vil betyde noget om ti år',
    send:'Send',
    loading_eyebrow:'Fra {year}',
    loading_text:'Dit fremtidige selv\nskriver',
    save_pdf:'Gem som PDF',
    copy_link:'Kopiér link',
    write_another:'Skriv endnu et',
    link_copied:'Link kopieret til udklipsholder',
    shared_text:'Dette brev blev skrevet med Breve fra Dit Fremtidige Selv.',
    write_own:'Skriv dit eget',
    with_love:'Med kærlighed,',
    sig_name:'Du, fra {year}',
    pdf_title:'BREVE FRA DIT FREMTIDIGE SELV',
    pdf_written:'Skrevet den:',
    pdf_from:'Fra:',
    pdf_footer:'Breve fra Dit Fremtidige Selv',
  },
  no: {
    eyebrow:'Et brev gjennom tid',
    h1:'Brev fra<br><em>Ditt Fremtidige Jeg</em>',
    subtitle:'Skriv ærlig. Skriv på {lang} — ditt fremtidige jeg vil svare.',
    prompt_label:'Hva har tynget deg i det siste?',
    placeholder:'Begynn å skrive… det finnes ingen feil måte.',
    note_language:'Skriv på et hvilket som helst språk — ditt fremtidige jeg svarer på samme.',
    note_private:'Brevene dine er private. Vi lagrer eller leser aldri ordene dine.',
    hint:'Trykk ⌘ + Enter for å sende',
    prompts_toggle:'Vet du ikke hva du skal skrive om?',
    prompts_heading:'Skriv om deg selv',
    prompts_sub:'Du kan skrive om…',
    p1:'dine håp og drømmer for de kommende årene',
    p2:'noe som har opptatt tankene dine i det siste',
    p3:'hvem eller hva du er takknemlig for akkurat nå',
    p4:'noe vanskelig du har vært gjennom',
    p5:'noe du nylig har lært om deg selv',
    p6:'et nylig øyeblikk av stolthet eller stille glede',
    p7:'noe som veier tungt på hjertet ditt',
    p8:'en bekymring du håper ikke vil bety noe om ti år',
    send:'Send',
    loading_eyebrow:'Fra {year}',
    loading_text:'Ditt fremtidige jeg\nskriver',
    save_pdf:'Lagre som PDF',
    copy_link:'Kopier lenke',
    write_another:'Skriv et til',
    link_copied:'Lenke kopiert til utklippstavle',
    shared_text:'Dette brevet ble skrevet med Brev fra Ditt Fremtidige Jeg.',
    write_own:'Skriv ditt eget',
    with_love:'Med kjærlighet,',
    sig_name:'Du, fra {year}',
    pdf_title:'BREV FRA DITT FREMTIDIGE JEG',
    pdf_written:'Skrevet den:',
    pdf_from:'Fra:',
    pdf_footer:'Brev fra Ditt Fremtidige Jeg',
  },
  fi: {
    eyebrow:'Kirje ajassa',
    h1:'Kirjeitä<br><em>Tulevalta Sinältä</em>',
    subtitle:'Kirjoita rehellisesti, {lang} — tuleva sinä vastaa.',
    prompt_label:'Mikä on painanut mieltäsi viime aikoina?',
    placeholder:'Aloita kirjoittaminen… ei ole väärää tapaa.',
    note_language:'Kirjoita millä kielellä tahansa — tuleva sinä vastaa samalla kielellä.',
    note_private:'Kirjeesi ovat yksityisiä. Emme koskaan tallenna tai lue sanojasi.',
    hint:'Paina ⌘ + Enter lähettääksesi',
    prompts_toggle:'Etkö tiedä mistä kirjoittaisit?',
    prompts_heading:'Kirjoita itsestäsi',
    prompts_sub:'Voisit kirjoittaa…',
    p1:'toiveistasi ja unelmistasi tulevina vuosina',
    p2:'jostakin, joka on pyörinyt mielessäsi viime aikoina',
    p3:'kenelle tai mille olet kiitollinen juuri nyt',
    p4:'jostakin vaikeasta, mitä olet käynyt läpi',
    p5:'jostakin, mitä olet hiljattain oppinut itsestäsi',
    p6:'tuoreesta ylpeyden tai hiljaisen ilon hetkestä',
    p7:'jostakin, joka painaa sydäntäsi raskaasti',
    p8:'huolesta, jonka toivot ettei enää merkitse mitään kymmenen vuoden päästä',
    send:'Lähetä',
    loading_eyebrow:'Vuodesta {year}',
    loading_text:'Tuleva sinä\nkirjoittaa',
    save_pdf:'Tallenna PDF:nä',
    copy_link:'Kopioi linkki',
    write_another:'Kirjoita toinen',
    link_copied:'Linkki kopioitu leikepöydälle',
    shared_text:'Tämä kirje kirjoitettiin Kirjeitä Tulevalta Sinältä -palvelulla.',
    write_own:'Kirjoita omasi',
    with_love:'Rakkaudella,',
    sig_name:'Sinä, vuodesta {year}',
    pdf_title:'KIRJEITÄ TULEVALTA SINÄLTÄ',
    pdf_written:'Kirjoitettu:',
    pdf_from:'Lähettäjä:',
    pdf_footer:'Kirjeitä Tulevalta Sinältä',
  },
  cs: {
    eyebrow:'Dopis skrze čas',
    h1:'Dopisy od<br><em>Tvého Budoucího Já</em>',
    subtitle:'Piš upřímně, v {lang} — tvé budoucí já odepíše.',
    prompt_label:'Co tě v poslední době tíží?',
    placeholder:'Začni psát… neexistuje špatný způsob.',
    note_language:'Piš v jakémkoli jazyce — tvé budoucí já odpoví ve stejném.',
    note_private:'Tvoje dopisy jsou soukromé. Tvoje slova nikdy neukládáme ani nečteme.',
    hint:'Stiskni ⌘ + Enter pro odeslání',
    prompts_toggle:'Nevíš, o čem psát?',
    prompts_heading:'Piš o sobě',
    prompts_sub:'Mohl/a bys psát o…',
    p1:'svých nadějích a snech pro nadcházející léta',
    p2:'něčem, co tě v poslední době zaměstnává',
    p3:'za koho nebo za co jsi teď vděčný/á',
    p4:'něčem těžkém, čím jsi prošel/prošla',
    p5:'něčem, co jsi o sobě nedávno zjistil/a',
    p6:'nedávném okamžiku hrdosti nebo tiché radosti',
    p7:'něčem, co tíží tvé srdce',
    p8:'starostí, o níž doufáš, že za deset let nebude důležitá',
    send:'Odeslat',
    loading_eyebrow:'Z roku {year}',
    loading_text:'Tvoje budoucí já\npíše',
    save_pdf:'Uložit jako PDF',
    copy_link:'Kopírovat odkaz',
    write_another:'Napsat další',
    link_copied:'Odkaz zkopírován do schránky',
    shared_text:'Tento dopis byl napsán pomocí Dopisy od Tvého Budoucího Já.',
    write_own:'Napiš svůj vlastní',
    with_love:'S láskou,',
    sig_name:'Ty, z roku {year}',
    pdf_title:'DOPISY OD TVÉHO BUDOUCÍHO JÁ',
    pdf_written:'Napsáno:',
    pdf_from:'Od:',
    pdf_footer:'Dopisy od Tvého Budoucího Já',
  },
  sk: {
    eyebrow:'List cez čas',
    h1:'Listy od<br><em>Tvojho Budúceho Ja</em>',
    subtitle:'Píš úprimne, v {lang} — tvoje budúce ja odpíše.',
    prompt_label:'Čo ťa v poslednom čase trápi?',
    placeholder:'Začni písať… neexistuje zlý spôsob.',
    note_language:'Píš v akomkoľvek jazyku — tvoje budúce ja odpovie v rovnakom.',
    note_private:'Tvoje listy sú súkromné. Tvoje slová nikdy neukladáme ani nečítame.',
    hint:'Stlač ⌘ + Enter na odoslanie',
    prompts_toggle:'Nevieš, o čom písať?',
    prompts_heading:'Píš o sebe',
    prompts_sub:'Môžeš písať o…',
    p1:'svojich nádejach a snoch na nadchádzajúce roky',
    p2:'niečom, čo ťa v poslednom čase zamestnáva',
    p3:'za koho alebo za čo si teraz vďačný/á',
    p4:'niečom ťažkom, čím si prešiel/prešla',
    p5:'niečom, čo si o sebe nedávno zistil/a',
    p6:'nedávnom okamihu hrdosti alebo tichej radosti',
    p7:'niečom, čo ťaží tvoje srdce',
    p8:'starosťou, o ktorej dúfaš, že za desať rokov nebude dôležitá',
    send:'Odoslať',
    loading_eyebrow:'Z roku {year}',
    loading_text:'Tvoje budúce ja\npíše',
    save_pdf:'Uložiť ako PDF',
    copy_link:'Kopírovať odkaz',
    write_another:'Napísať ďalší',
    link_copied:'Odkaz skopírovaný do schránky',
    shared_text:'Tento list bol napísaný pomocou Listy od Tvojho Budúceho Ja.',
    write_own:'Napíš vlastný',
    with_love:'S láskou,',
    sig_name:'Ty, z roku {year}',
    pdf_title:'LISTY OD TVOJHO BUDÚCEHO JA',
    pdf_written:'Napísané:',
    pdf_from:'Od:',
    pdf_footer:'Listy od Tvojho Budúceho Ja',
  },
  hr: {
    eyebrow:'Pismo kroz vrijeme',
    h1:'Pisma od<br><em>Tvog Budućeg Ja</em>',
    subtitle:'Piši iskreno. Piši na {lang} — tvoje buduće ja odgovorit će.',
    prompt_label:'Što te opterećuje posljednje vrijeme?',
    placeholder:'Počni pisati… nema pogrešnog načina.',
    note_language:'Piši na bilo kojem jeziku — tvoje buduće ja odgovorit će na istom.',
    note_private:'Tvoja pisma su privatna. Nikada ne pohranjujemo niti čitamo tvoje riječi.',
    hint:'Pritisni ⌘ + Enter za slanje',
    prompts_toggle:'Ne znaš o čemu pisati?',
    prompts_heading:'Piši o sebi',
    prompts_sub:'Možeš pisati o…',
    p1:'svojim nadama i snovima za nadolazeće godine',
    p2:'nečemu što ti je nedavno zaokupljalo misli',
    p3:'za koga ili što si zahvalan/zahvalna sada',
    p4:'nečemu teškom kroz što si prošao/prošla',
    p5:'nečemu što si nedavno naučio/naučila o sebi',
    p6:'nedavnom trenutku ponosa ili tihe radosti',
    p7:'nečemu što teško leži na tvom srcu',
    p8:'brigom za koju se nadaš da za deset godina neće biti važna',
    send:'Pošalji',
    loading_eyebrow:'Iz {year}',
    loading_text:'Tvoje buduće ja\npiše',
    save_pdf:'Spremi kao PDF',
    copy_link:'Kopiraj link',
    write_another:'Napiši još jedno',
    link_copied:'Link kopiran u međuspremnik',
    shared_text:'Ovo pismo je napisano koristeći Pisma od Tvog Budućeg Ja.',
    write_own:'Napiši vlastito',
    with_love:'S ljubavlju,',
    sig_name:'Ti, iz {year}',
    pdf_title:'PISMA OD TVOG BUDUĆEG JA',
    pdf_written:'Napisano:',
    pdf_from:'Od:',
    pdf_footer:'Pisma od Tvog Budućeg Ja',
  },
  bg: {
    eyebrow:'Писмо през времето',
    h1:'Писма от<br><em>Бъдещото Ти Аз</em>',
    subtitle:'Пиши честно, на {lang} — бъдещото ти аз ще отговори.',
    prompt_label:'Какво те тревожи напоследък?',
    placeholder:'Започни да пишеш… няма грешен начин.',
    note_language:'Пиши на всеки език — бъдещото ти аз ще отговори на същия.',
    note_private:'Писмата ти са частни. Никога не съхраняваме или четем думите ти.',
    hint:'Натисни ⌘ + Enter за изпращане',
    prompts_toggle:'Не знаеш за какво да пишеш?',
    prompts_heading:'Пиши за себе си',
    prompts_sub:'Можеш да пишеш за…',
    p1:'надеждите и мечтите си за предстоящите години',
    p2:'нещо, което напоследък те е занимавало',
    p3:'за кого или за какво си благодарен/а сега',
    p4:'нещо трудно, през което си преминал/а',
    p5:'нещо, което наскоро си научил/а за себе си',
    p6:'скорошен момент на гордост или тихо щастие',
    p7:'нещо, което лежи тежко на сърцето ти',
    p8:'тревога, за която се надяваш да не е важна след десет години',
    send:'Изпрати',
    loading_eyebrow:'От {year}',
    loading_text:'Бъдещото ти аз\nпише',
    save_pdf:'Запази като PDF',
    copy_link:'Копирай връзка',
    write_another:'Напиши още едно',
    link_copied:'Връзката е копирана',
    shared_text:'Това писмо е написано с Писма от Бъдещото Ти Аз.',
    write_own:'Напиши своето',
    with_love:'С любов,',
    sig_name:'Ти, от {year}',
    pdf_title:'ПИСМА ОТ БЪДЕЩОТО ТИ АЗ',
    pdf_written:'Написано на:',
    pdf_from:'От:',
    pdf_footer:'Писма от Бъдещото Ти Аз',
  },
  el: {
    eyebrow:'Ένα γράμμα μέσα στον χρόνο',
    h1:'Γράμματα από<br><em>τον Μελλοντικό σου Εαυτό</em>',
    subtitle:'Γράψε ειλικρινά. Γράψε στα {lang} — ο μελλοντικός σου εαυτός θα απαντήσει.',
    prompt_label:'Τι σε βαραίνει τον τελευταίο καιρό;',
    placeholder:'Ξεκίνα να γράφεις… δεν υπάρχει λάθος τρόπος.',
    note_language:'Γράψε σε οποιαδήποτε γλώσσα — ο μελλοντικός σου εαυτός θα απαντήσει στην ίδια.',
    note_private:'Τα γράμματά σου είναι ιδιωτικά. Δεν αποθηκεύουμε ούτε διαβάζουμε ποτέ τα λόγια σου.',
    hint:'Πάτα ⌘ + Enter για αποστολή',
    prompts_toggle:'Δεν ξέρεις τι να γράψεις;',
    prompts_heading:'Γράψε για τον εαυτό σου',
    prompts_sub:'Θα μπορούσες να γράψεις για…',
    p1:'τις ελπίδες και τα όνειρά σου για τα επόμενα χρόνια',
    p2:'κάτι που σου απασχολεί το μυαλό τον τελευταίο καιρό',
    p3:'για ποιον ή για τι είσαι ευγνώμων τώρα',
    p4:'κάτι δύσκολο που πέρασες',
    p5:'κάτι που έμαθες πρόσφατα για τον εαυτό σου',
    p6:'μια πρόσφατη στιγμή υπερηφάνειας ή ήσυχης χαράς',
    p7:'κάτι που βαραίνει την καρδιά σου',
    p8:'μια ανησυχία που ελπίζεις να μην έχει σημασία σε δέκα χρόνια',
    send:'Αποστολή',
    loading_eyebrow:'Από το {year}',
    loading_text:'Ο μελλοντικός σου εαυτός\nγράφει',
    save_pdf:'Αποθήκευση ως PDF',
    copy_link:'Αντιγραφή συνδέσμου',
    write_another:'Γράψε άλλο ένα',
    link_copied:'Ο σύνδεσμος αντιγράφηκε',
    shared_text:'Αυτό το γράμμα γράφτηκε με τη χρήση Γράμματα από τον Μελλοντικό σου Εαυτό.',
    write_own:'Γράψε το δικό σου',
    with_love:'Με αγάπη,',
    sig_name:'Εσύ, από το {year}',
    pdf_title:'ΓΡΑΜΜΑΤΑ ΑΠΌ ΤΟΝ ΜΕΛΛΟΝΤΙΚΌ ΣΟΥ ΕΑΥΤΌ',
    pdf_written:'Γράφτηκε:',
    pdf_from:'Από:',
    pdf_footer:'Γράμματα από τον Μελλοντικό σου Εαυτό',
  },
  tr: {
    eyebrow:'Zamanda bir mektup',
    h1:'Gelecekteki Kendinizden<br><em>Mektuplar</em>',
    subtitle:'Dürüstçe yaz. {lang} dilinde yaz — gelecekteki kendin yanıt verecek.',
    prompt_label:'Son zamanlarda seni ne ağırladı?',
    placeholder:'Yazmaya başla… yanlış bir yolu yok.',
    note_language:'Herhangi bir dilde yaz — gelecekteki kendin aynı dilde yanıt verir.',
    note_private:'Mektupların özeldir. Kelimelerini asla saklamıyor veya okumuyoruz.',
    hint:'Göndermek için ⌘ + Enter\'a bas',
    prompts_toggle:'Ne hakkında yazacağını bilmiyor musun?',
    prompts_heading:'Kendin hakkında yaz',
    prompts_sub:'Şunlar hakkında yazabilirsin…',
    p1:'gelecek yıllar için umutların ve hayallerin',
    p2:'son zamanlarda aklını meşgul eden bir şey',
    p3:'şu an için kim ya da neye minnettarsın',
    p4:'yaşadığın zorlu bir şey',
    p5:'kendin hakkında yakın zamanda öğrendiğin bir şey',
    p6:'yakın zamanda yaşadığın bir gurur veya sessiz sevinç anı',
    p7:'kalbini ağırlaştıran bir şey',
    p8:'on yıl sonra önemli olmayacağını umduğun bir endişe',
    send:'Gönder',
    loading_eyebrow:'{year}\'dan',
    loading_text:'Gelecekteki kendin\nyazıyor',
    save_pdf:'PDF olarak kaydet',
    copy_link:'Bağlantıyı kopyala',
    write_another:'Bir tane daha yaz',
    link_copied:'Bağlantı panoya kopyalandı',
    shared_text:'Bu mektup Gelecekteki Kendinizden Mektuplar kullanılarak yazıldı.',
    write_own:'Kendininkini yaz',
    with_love:'Sevgiyle,',
    sig_name:'{year}\'dan, Sen',
    pdf_title:'GELECEKTEKİ KENDİNİZDEN MEKTUPLAR',
    pdf_written:'Yazıldı:',
    pdf_from:'Kimden:',
    pdf_footer:'Gelecekteki Kendinizden Mektuplar',
  },
  lt: {
    eyebrow:'Laiškas per laiką',
    h1:'Laiškai nuo<br><em>Tavo Būsimojo Aš</em>',
    subtitle:'Rašyk nuoširdžiai, {lang} — tavo būsimasis aš atsakys.',
    prompt_label:'Kas tave slegia pastaruoju metu?',
    placeholder:'Pradėk rašyti… nėra netinkamo būdo.',
    note_language:'Rašyk bet kuria kalba — tavo būsimasis aš atsakys ta pačia.',
    note_private:'Tavo laiškai yra privatūs. Mes niekada nesaugome ir neskaitome tavo žodžių.',
    hint:'Paspausk ⌘ + Enter siųsti',
    prompts_toggle:'Nežinai, apie ką rašyti?',
    prompts_heading:'Rašyk apie save',
    prompts_sub:'Galėtum rašyti apie…',
    p1:'savo viltis ir svajones ateinantiems metams',
    p2:'ką nors, kas pastaruoju metu užima tavo mintis',
    p3:'už ką ar už ką esi dėkingas/-a šiuo metu',
    p4:'ką nors sunkaus, ką teko patirti',
    p5:'ką nors, ką neseniai sužinojai apie save',
    p6:'neseną pasididžiavimo ar tylos džiaugsmo akimirką',
    p7:'ką nors, kas slegia tavo širdį',
    p8:'rūpestį, kurio tikiesi, kad po dešimties metų nebesvarbu',
    send:'Siųsti',
    loading_eyebrow:'Iš {year}',
    loading_text:'Tavo būsimasis aš\nrašo',
    save_pdf:'Išsaugoti kaip PDF',
    copy_link:'Kopijuoti nuorodą',
    write_another:'Rašyti kitą',
    link_copied:'Nuoroda nukopijuota į iškarpinę',
    shared_text:'Šis laiškas parašytas naudojant Laiškai nuo Tavo Būsimojo Aš.',
    write_own:'Parašyk savąjį',
    with_love:'Su meile,',
    sig_name:'Tu, iš {year}',
    pdf_title:'LAIŠKAI NUO TAVO BŪSIMOJO AŠ',
    pdf_written:'Parašyta:',
    pdf_from:'Nuo:',
    pdf_footer:'Laiškai nuo Tavo Būsimojo Aš',
  },
  lv: {
    eyebrow:'Vēstule cauri laikam',
    h1:'Vēstules no<br><em>Tava Nākotnes Es</em>',
    subtitle:'Raksti godīgi, {lang} — tavs nākotnes es atbildēs.',
    prompt_label:'Kas tevi ir slogojis pēdējā laikā?',
    placeholder:'Sāc rakstīt… nav nepareizas metodes.',
    note_language:'Raksti jebkurā valodā — tavs nākotnes es atbildēs tajā pašā.',
    note_private:'Tavas vēstules ir privātas. Mēs nekad neglabājam vai nelasām tavus vārdus.',
    hint:'Nospied ⌘ + Enter, lai nosūtītu',
    prompts_toggle:'Nezini, par ko rakstīt?',
    prompts_heading:'Raksti par sevi',
    prompts_sub:'Tu varētu rakstīt par…',
    p1:'savām cerībām un sapņiem nākamajiem gadiem',
    p2:'kaut ko, kas pēdējā laikā aizņēmis tavas domas',
    p3:'par ko vai par ko tu esi pateicīgs/-a šobrīd',
    p4:'kaut ko sarežģītu, ko esi piedzīvojis/-jusi',
    p5:'kaut ko, ko esi nesen uzzinājis/-jusi par sevi',
    p6:'nesenu lepnuma vai klusas prieka mirkli',
    p7:'kaut ko, kas smagi gulstas uz tava sirds',
    p8:'raizes, kuras ceri, ka pēc desmit gadiem vairs nebūs svarīgas',
    send:'Nosūtīt',
    loading_eyebrow:'No {year}',
    loading_text:'Tavs nākotnes es\nraksta',
    save_pdf:'Saglabāt kā PDF',
    copy_link:'Kopēt saiti',
    write_another:'Uzrakstīt vēl vienu',
    link_copied:'Saite nokopēta starpliktuvē',
    shared_text:'Šī vēstule rakstīta, izmantojot Vēstules no Tava Nākotnes Es.',
    write_own:'Uzraksti savu',
    with_love:'Ar mīlestību,',
    sig_name:'Tu, no {year}',
    pdf_title:'VĒSTULES NO TAVA NĀKOTNES ES',
    pdf_written:'Uzrakstīts:',
    pdf_from:'No:',
    pdf_footer:'Vēstules no Tava Nākotnes Es',
  },
  sl: {
    eyebrow:'Pismo skozi čas',
    h1:'Pisma od<br><em>Tvojega Prihodnjega Jaza</em>',
    subtitle:'Piši iskreno. Piši v {lang} — tvoj prihodnji jaz bo odgovoril.',
    prompt_label:'Kaj te zadnje čase teži?',
    placeholder:'Začni pisati… ni napačnega načina.',
    note_language:'Piši v katerem koli jeziku — tvoj prihodnji jaz bo odgovoril v istem.',
    note_private:'Tvoja pisma so zasebna. Tvojih besed nikoli ne shranjujemo ali beremo.',
    hint:'Pritisni ⌘ + Enter za pošiljanje',
    prompts_toggle:'Ne veš, o čem pisati?',
    prompts_heading:'Piši o sebi',
    prompts_sub:'Lahko pišeš o…',
    p1:'svojih upih in sanjah za prihajajoča leta',
    p2:'nečem, kar te je zadnje čase zaposlovalo',
    p3:'komu ali čemu si hvaležen/-a zdaj',
    p4:'nečem težkem, skozi kar si šel/šla',
    p5:'nečem, kar si o sebi nedavno izvedel/izvedela',
    p6:'nedavnem trenutku ponosa ali tihe radosti',
    p7:'nečem, kar teži na tvojem srcu',
    p8:'skrbi, za katero upaš, da čez deset let ne bo pomembna',
    send:'Pošlji',
    loading_eyebrow:'Iz {year}',
    loading_text:'Tvoj prihodnji jaz\npiše',
    save_pdf:'Shrani kot PDF',
    copy_link:'Kopiraj povezavo',
    write_another:'Napiši še eno',
    link_copied:'Povezava kopirana v odložišče',
    shared_text:'To pismo je bilo napisano z Pisma od Tvojega Prihodnjega Jaza.',
    write_own:'Napiši svojo',
    with_love:'Z ljubeznijo,',
    sig_name:'Ti, iz {year}',
    pdf_title:'PISMA OD TVOJEGA PRIHODNJEGA JAZA',
    pdf_written:'Napisano:',
    pdf_from:'Od:',
    pdf_footer:'Pisma od Tvojega Prihodnjega Jaza',
  },
};

// Current language and helper
let currentLang = 'en';
function T(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key])
      || TRANSLATIONS.en[key]
      || key;
}

// ── Canvas setup ──────────────────────────────────────
const canvas = document.getElementById('dot-canvas');
const ctx    = canvas.getContext('2d');

let W = window.innerWidth;
let H = window.innerHeight;

// ── State ─────────────────────────────────────────────
let dotMode     = 'idle'; // 'idle' | 'loading' | 'letter'
let time        = 0;
let hueShift    = 0;
let flowers     = [];
let flowerGrowth = 0;
let twirls      = [];
let sunAngle    = 0;
let sunAlpha    = 0;
let sunHue      = 0;

// Cherry petals — loading state only
let petals      = [];
let petalAlpha  = 0;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  if (flowers.length)  buildFlowers();
  if (twirls.length)   buildTwirls();
}

window.addEventListener('resize', () => { resizeCanvas(); initDots(); });
resizeCanvas();


// ── Stipple dots — palette from reference images ───────
// Cobalt, electric blue, teal, orange, coral, gold, hot pink, violet

const DOT_COUNT = 280;
let dots = [];

function dotHue() {
  const r = Math.random();
  if (r < 0.28) return 222 + Math.random() * 18;  // cobalt → electric blue
  if (r < 0.42) return 175 + Math.random() * 18;  // teal / turquoise
  if (r < 0.56) return 18  + Math.random() * 18;  // warm orange
  if (r < 0.68) return 4   + Math.random() * 14;  // coral / red-orange
  if (r < 0.78) return 38  + Math.random() * 14;  // gold / amber
  if (r < 0.88) return 325 + Math.random() * 25;  // hot pink / rose
  return               270 + Math.random() * 22;   // violet
}

function makeDot() {
  const h = dotHue();
  return {
    x:          Math.random() * W,
    y:          Math.random() * H,
    baseSize:   Math.random() * 2.4 + 0.5,
    size:       0,
    hue:        h,
    baseHue:    h,
    hueRange:   12,
    hueDir:     Math.random() > 0.5 ? 1 : -1,
    hueTick:    0,
    alpha:      Math.random() * 0.50 + 0.22,
    vx:         (Math.random() - 0.5) * 0.20,
    vy:         (Math.random() - 0.5) * 0.20,
    pulse:      Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.014 + 0.004,
  };
}

function initDots() {
  dots = Array.from({ length: DOT_COUNT }, makeDot);
}
initDots();

function drawDot(d) {
  const r = Math.max(0.3, d.size);
  if (r <= 0) return;

  // Stipple: solid-ish dot with a soft highlight pop
  ctx.beginPath();
  ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
  ctx.fillStyle = `hsla(${d.hue},85%,58%,${d.alpha})`;
  ctx.fill();

  // Tiny bright centre sparkle
  ctx.beginPath();
  ctx.arc(d.x - r * 0.25, d.y - r * 0.25, r * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = `hsla(${d.hue},60%,90%,${d.alpha * 0.7})`;
  ctx.fill();
}

function updateDot(d) {
  const speed = dotMode === 'loading' ? 2.6
              : dotMode === 'letter'  ? 0.3
              : 1;

  d.x += d.vx * speed;
  d.y += d.vy * speed;

  if (d.x < -10) d.x = W + 10;
  if (d.x > W + 10) d.x = -10;
  if (d.y < -10) d.y = H + 10;
  if (d.y > H + 10) d.y = -10;

  // Collective breathing wave
  const wave   = Math.sin(time * 0.012 + d.x * 0.006 + d.y * 0.004);
  const energy = dotMode === 'loading' ? 2.0 : 0.8;
  d.size = Math.max(0.3, d.baseSize + wave * energy);

  // Gentle hue drift within colour family
  d.hueTick += 0.12 * d.hueDir * (dotMode === 'loading' ? 3 : 1);
  if (Math.abs(d.hueTick) > d.hueRange) d.hueDir *= -1;
  d.hue = d.baseHue + d.hueTick;
}


// ── Color zones — orange blob + violet blob + pink bloom ──
// Base positions; each orbits slowly for a living, circulating feel

const ZONE_DEFS = [
  { bx: 0.28, by: 0.55, r: 0.55, h: 22,  s: 95, l: 65, a: 1.8, spd: 0.00055, phase: 0.0 },
  { bx: 0.80, by: 0.42, r: 0.50, h: 268, s: 55, l: 52, a: 1.4, spd: 0.00042, phase: 1.1 },
  { bx: 0.12, by: 0.28, r: 0.42, h: 335, s: 80, l: 68, a: 1.2, spd: 0.00068, phase: 2.2 },
  { bx: 0.85, by: 0.15, r: 0.38, h: 8,   s: 88, l: 68, a: 1.0, spd: 0.00038, phase: 3.3 },
  { bx: 0.08, by: 0.82, r: 0.36, h: 182, s: 60, l: 62, a: 0.9, spd: 0.00058, phase: 4.4 },
  { bx: 0.90, by: 0.88, r: 0.34, h: 15,  s: 70, l: 78, a: 0.8, spd: 0.00048, phase: 5.5 },
];

function drawColorZones() {
  const isLoad = dotMode === 'loading';
  const base   = dotMode === 'letter' ? 0.062 : isLoad ? 0.20 : 0.115;
  const spdMul = isLoad ? 5.5 : 1;
  const orbitX = isLoad ? 0.22 : 0.10;
  const orbitY = isLoad ? 0.17 : 0.08;

  ZONE_DEFS.forEach(z => {
    const orbit = time * z.spd * spdMul + z.phase;
    const ox = Math.cos(orbit)        * W * orbitX;
    const oy = Math.sin(orbit * 0.75) * H * orbitY;
    const zx = W * z.bx + ox;
    const zy = H * z.by + oy;
    const zr = W * z.r * (isLoad ? 1.25 : 1);

    const s = isLoad ? Math.min(z.s + 18, 100) : z.s;
    const l = isLoad ? Math.max(z.l - 6,  42)  : z.l;
    const h = (z.h + hueShift * (isLoad ? 1.1 : 0.45)) % 360;

    const g = ctx.createRadialGradient(zx, zy, 0, zx, zy, zr);
    g.addColorStop(0,    `hsla(${h},${s}%,${l}%,${base * z.a * 2.2})`);
    g.addColorStop(0.42, `hsla(${h},${s}%,${l}%,${base * z.a})`);
    g.addColorStop(1,    `hsla(${h},${s}%,${l}%,0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  });
}


// ── Flowers ───────────────────────────────────────────

// ── Twirls ────────────────────────────────────────────

function buildTwirls() {
  twirls = [
    { x: W * 0.06, y: H * 0.14, r: 52, hue: 228, speed:  0.0025, phase: 0.0 },
    { x: W * 0.94, y: H * 0.22, r: 42, hue: 18,  speed: -0.0032, phase: 1.2 },
    { x: W * 0.04, y: H * 0.72, r: 48, hue: 330, speed:  0.0018, phase: 2.4 },
    { x: W * 0.96, y: H * 0.75, r: 38, hue: 175, speed: -0.0022, phase: 3.6 },
    { x: W * 0.50, y: H * 0.04, r: 34, hue: 8,   speed:  0.0038, phase: 4.8 },
    { x: W * 0.22, y: H * 0.92, r: 30, hue: 268, speed: -0.0028, phase: 0.6 },
    { x: W * 0.78, y: H * 0.94, r: 36, hue: 350, speed:  0.0021, phase: 1.8 },
  ];
}
buildTwirls();

function drawTwirls(alpha) {
  if (alpha <= 0) return;
  twirls.forEach(t => {
    const hue   = (t.hue + hueShift * 0.12) % 360;
    const tSpd  = dotMode === 'loading' ? 4.2 : 1;
    const angle = time * t.speed * tSpd + t.phase;
    const turns = 4;
    const pts   = 260;

    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(angle);

    // Outer spiral
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const θ = (i / pts) * Math.PI * 2 * turns;
      const r = (i / pts) * t.r;
      const x = Math.cos(θ) * r;
      const y = Math.sin(θ) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsla(${hue},72%,58%,${alpha * 0.38})`;
    ctx.lineWidth   = 0.9;
    ctx.stroke();

    // Inner counter-spiral (thinner, offset hue)
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const θ = -(i / pts) * Math.PI * 2 * (turns * 0.6);
      const r = (i / pts) * t.r * 0.55;
      const x = Math.cos(θ) * r;
      const y = Math.sin(θ) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsla(${(hue + 45) % 360},65%,68%,${alpha * 0.22})`;
    ctx.lineWidth   = 0.5;
    ctx.stroke();

    ctx.restore();
  });
}


// Flower palette — coral, orange, electric blue, teal, pink, rose
const FLOWER_HUES = [8, 22, 225, 178, 335, 350, 42, 300];

function buildFlowers() {
  flowers = [];
  const count = Math.max(5, Math.floor(W / 150));
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    flowers.push({
      x:          W * (t * 0.90 + 0.05),
      baseY:      H + 2,
      height:     H * (0.20 + Math.random() * 0.16),
      lean:       (Math.random() - 0.5) * 0.22,
      petalHue:   FLOWER_HUES[i % FLOWER_HUES.length],
      petalCount: 7 + Math.floor(Math.random() * 4),   // 7–10 petals
      petalSize:  9 + Math.random() * 9,
      petalLayers: Math.random() > 0.5 ? 2 : 1,        // some flowers have inner layer
      leafSide:   Math.random() > 0.5 ? 1 : -1,
      phase:      Math.random() * Math.PI * 2,
      speed:      0.006 + Math.random() * 0.003,
      isBud:      Math.random() > 0.7,                  // some stay as buds
    });
  }
}
buildFlowers();

function drawFlower(f, growth) {
  if (growth <= 0) return;

  const stemH = f.height * Math.min(growth * 1.35, 1);
  const tipX  = f.x + Math.sin(f.lean) * stemH;
  const tipY  = f.baseY - stemH;

  // Gentle sway
  const sway = Math.sin(time * f.speed + f.phase) * 4 * growth;
  const cpX  = f.x + f.lean * stemH * 0.45 + sway * 0.5;
  const cpY  = f.baseY - stemH * 0.58;

  // Slender stem
  ctx.beginPath();
  ctx.moveTo(f.x, f.baseY);
  ctx.quadraticCurveTo(cpX, cpY, tipX + sway * 0.5, tipY);
  ctx.strokeStyle = `rgba(140,210,160,${0.38 * growth})`;
  ctx.lineWidth   = 1.1;
  ctx.stroke();

  // Delicate leaf — at 38% growth
  if (growth > 0.38) {
    const la = Math.min((growth - 0.38) / 0.28, 1);
    const lt = 0.5;
    const lx = f.x + (cpX - f.x) * lt;
    const ly = f.baseY + (cpY - f.baseY) * lt;
    const ld = f.leafSide * 18 * la;
    const ph = (f.petalHue + 120) % 360; // green-adjacent tint

    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.quadraticCurveTo(lx + ld, ly - 11 * la, lx + ld * 1.7, ly + 1 * la);
    ctx.quadraticCurveTo(lx + ld * 0.5, ly + 7 * la, lx, ly);
    ctx.fillStyle = `rgba(110,190,130,${0.42 * la * growth})`;
    ctx.fill();
  }

  // Bloom — above 80%
  if (growth > 0.80) {
    const bloom = Math.min((growth - 0.80) / 0.20, 1);
    const px = tipX + sway * 0.5;
    const py = tipY;
    const ps = f.petalSize * bloom;
    const ph = (f.petalHue + hueShift * 0.25) % 360;   // drift slowly with hue

    // Outer petal layer
    for (let p = 0; p < f.petalCount; p++) {
      const angle  = (p / f.petalCount) * Math.PI * 2 + time * 0.003;
      const cx2    = px + Math.cos(angle) * ps * 0.52;
      const cy2    = py + Math.sin(angle) * ps * 0.42;
      const tipPx  = px + Math.cos(angle) * ps;
      const tipPy  = py + Math.sin(angle) * ps * 0.82;

      ctx.beginPath();
      ctx.ellipse(cx2, cy2, ps * 0.42, ps * 0.22, angle, 0, Math.PI * 2);

      const pg = ctx.createRadialGradient(px, py, 0, tipPx, tipPy, ps * 0.9);
      pg.addColorStop(0,   `hsla(${ph},80%,92%,${0.78 * bloom})`);
      pg.addColorStop(0.5, `hsla(${ph},75%,80%,${0.55 * bloom})`);
      pg.addColorStop(1,   `hsla(${(ph + 20) % 360},65%,62%,${0.18 * bloom})`);
      ctx.fillStyle = pg;
      ctx.fill();
    }

    // Inner petal layer (for fuller flowers)
    if (f.petalLayers === 2) {
      const innerCount = Math.floor(f.petalCount * 0.7);
      for (let p = 0; p < innerCount; p++) {
        const angle = (p / innerCount) * Math.PI * 2 + time * 0.003 + Math.PI / innerCount;
        const cx2   = px + Math.cos(angle) * ps * 0.28;
        const cy2   = py + Math.sin(angle) * ps * 0.22;

        ctx.beginPath();
        ctx.ellipse(cx2, cy2, ps * 0.26, ps * 0.14, angle, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${(ph + 15) % 360},85%,88%,${0.6 * bloom})`;
        ctx.fill();
      }
    }

    // Soft glowing centre
    const cg = ctx.createRadialGradient(px, py, 0, px, py, ps * 0.22);
    cg.addColorStop(0,   `hsla(${(ph + 40) % 360},100%,97%,${0.95 * bloom})`);
    cg.addColorStop(0.5, `hsla(${(ph + 25) % 360},90%,82%,${0.6 * bloom})`);
    cg.addColorStop(1,   `hsla(${ph},70%,65%,0)`);
    ctx.beginPath();
    ctx.arc(px, py, ps * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();
  }
}


// ── Rotating sun / mandala (loading state) ────────────

function drawSun() {
  if (sunAlpha <= 0.005) return;

  const cx = W / 2;
  const cy = H / 2;

  const isLoad = dotMode === 'loading';
  sunHue   = (sunHue + (isLoad ? 3.2 : 0.9)) % 360;
  sunAngle += isLoad ? 0.048 : 0.012;

  const rays = 18;

  // Outer spiral arms
  for (let s = 0; s < 3; s++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sunAngle * (s % 2 === 0 ? 1 : -1) + s * Math.PI * 0.66);

    for (let i = 0; i < rays; i++) {
      const a   = (i / rays) * Math.PI * 2;
      const r1  = 50 + s * 35;
      const r2  = 80 + s * 42 + Math.sin(time * 0.04 + i) * 12;
      const hue = (sunHue + i * (360 / rays) + s * 40) % 360;
      const alpha = sunAlpha * (0.25 - s * 0.07);

      const x1 = Math.cos(a) * r1;
      const y1 = Math.sin(a) * r1;
      const x2 = Math.cos(a + 0.18) * r2;
      const y2 = Math.sin(a + 0.18) * r2;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(${hue},95%,75%,${alpha})`;
      ctx.lineWidth   = 1.5 - s * 0.3;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Inner ring of petals
  const petalRays = 12;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-sunAngle * 0.7);
  for (let i = 0; i < petalRays; i++) {
    const a   = (i / petalRays) * Math.PI * 2;
    const hue = (sunHue + i * 30) % 360;
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(a) * 32, Math.sin(a) * 32,
      18, 8, a,
      0, Math.PI * 2
    );
    ctx.fillStyle = `hsla(${hue},90%,75%,${sunAlpha * 0.3})`;
    ctx.fill();
  }
  ctx.restore();

  // Glowing core
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 42);
  cg.addColorStop(0,   `hsla(${sunHue},100%,98%,${sunAlpha * 0.9})`);
  cg.addColorStop(0.4, `hsla(${(sunHue + 40) % 360},90%,75%,${sunAlpha * 0.4})`);
  cg.addColorStop(1,   `hsla(${(sunHue + 80) % 360},80%,50%,0)`);
  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI * 2);
  ctx.fillStyle = cg;
  ctx.fill();
}


// ── Cherry petals (loading state) ─────────────────────

function makePetal() {
  const fromLeft = Math.random() > 0.42;
  const hue      = Math.random() > 0.35
    ? 335 + Math.random() * 28   // pink / rose
    : 355 + Math.random() * 18;  // white-pink
  const speed    = 2.8 + Math.random() * 4.5;
  return {
    x:         fromLeft ? -18 : W + 18,
    y:         Math.random() * H * 1.1 - H * 0.05,
    vx:        fromLeft ? speed : -speed,
    vy:        (Math.random() - 0.35) * 1.6,
    flutter:   Math.random() * Math.PI * 2,
    flutterS:  0.038 + Math.random() * 0.055,
    flutterA:  0.9   + Math.random() * 1.8,
    rot:       Math.random() * Math.PI * 2,
    rotS:      (Math.random() - 0.5) * 0.14,
    size:      3.5   + Math.random() * 5,
    hue,
    alpha:     0.45  + Math.random() * 0.45,
    fade:      0,
  };
}

function updatePetals() {
  // Fade system in/out
  const target = dotMode === 'loading' ? 1 : 0;
  petalAlpha  += (target - petalAlpha) * 0.045;

  // Spawn while loading
  if (dotMode === 'loading' && petals.length < 90 && Math.random() < 0.42) {
    petals.push(makePetal());
  }

  petals = petals.filter(p => {
    p.fade   = Math.min(p.fade + 0.06, 1);
    p.x     += p.vx;
    p.y     += p.vy + Math.sin(p.flutter) * p.flutterA;
    p.flutter += p.flutterS;
    p.rot   += p.rotS;
    return p.x > -40 && p.x < W + 40 && p.y > -60 && p.y < H + 60;
  });
}

function drawPetals() {
  if (petalAlpha < 0.01) return;
  petals.forEach(p => {
    const a = p.alpha * p.fade * petalAlpha;
    if (a < 0.01) return;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);

    // Teardrop / blossom petal shape
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(
       p.size * 0.68, -p.size * 0.42,
       p.size * 0.68,  p.size * 0.42,
       0,              p.size
    );
    ctx.bezierCurveTo(
      -p.size * 0.68,  p.size * 0.42,
      -p.size * 0.68, -p.size * 0.42,
       0,             -p.size
    );

    const g = ctx.createRadialGradient(0, -p.size * 0.18, 0, 0, p.size * 0.22, p.size * 1.15);
    g.addColorStop(0,    `hsla(${p.hue},  80%, 98%, ${a})`);
    g.addColorStop(0.5,  `hsla(${p.hue},  78%, 90%, ${a * 0.82})`);
    g.addColorStop(1,    `hsla(${p.hue + 18}, 62%, 76%, ${a * 0.22})`);
    ctx.fillStyle = g;
    ctx.fill();

    // Delicate centre vein line
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.8);
    ctx.lineTo(0,  p.size * 0.8);
    ctx.strokeStyle = `hsla(${p.hue + 10}, 55%, 82%, ${a * 0.3})`;
    ctx.lineWidth   = 0.4;
    ctx.stroke();

    ctx.restore();
  });
}

// ── Main animation loop ───────────────────────────────

function animate() {
  time++;
  // Hue shift accelerates during loading for a time-travel feel
  hueShift = (hueShift + (dotMode === 'loading' ? 1.9 : 0.38)) % 36000;

  ctx.clearRect(0, 0, W, H);

  drawColorZones();

  // Flowers: grow in on idle/letter, retract on loading
  if (dotMode === 'loading') {
    flowerGrowth = Math.max(0, flowerGrowth - 0.015);
    sunAlpha     = Math.min(1, sunAlpha + 0.025);
  } else {
    flowerGrowth = Math.min(1, flowerGrowth + 0.004);
    sunAlpha     = Math.max(0, sunAlpha - 0.04);
  }

  // Twirls: spin faster during loading, always visible
  const twirlAlpha = dotMode === 'loading'
    ? Math.min(1, sunAlpha * 1.8)  // fade in with sun
    : flowerGrowth;
  drawTwirls(twirlAlpha);

  flowers.forEach(f => drawFlower(f, flowerGrowth));
  drawSun();

  // Cherry petals blow through during loading
  updatePetals();
  drawPetals();

  dots.forEach(d => { updateDot(d); drawDot(d); });

  requestAnimationFrame(animate);
}
animate();


// ── Dates ─────────────────────────────────────────────

const today      = new Date();
const futureDate = new Date(today.getFullYear() + 10, today.getMonth(), today.getDate());

function formatDate(d) {
  const locale = LOCALES[currentLang] || 'en-GB';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  // Header
  document.getElementById('i18n-h1').innerHTML = T('h1');

  // Subtitle with inline language trigger
  const subtitleEl = document.getElementById('i18n-subtitle');
  const subtitleText = T('subtitle');
  const triggerHTML = `<button class="lang-inline-trigger" id="lang-pill" onclick="toggleLangPicker()" aria-haspopup="true" aria-expanded="false">${LANG_NAMES[lang]}<span class="lang-chevron-inline">↓</span></button>`;
  subtitleEl.innerHTML = subtitleText.replace('{lang}', triggerHTML);

  // Write card
  document.getElementById('i18n-prompt-label').textContent = T('prompt_label');
  document.getElementById('user-message').placeholder      = T('placeholder');
  document.getElementById('i18n-card-note').textContent = T('note_private');
  document.getElementById('send-btn').innerHTML            = T('send') + ' &rarr;';

  // Writing prompts
  document.getElementById('i18n-prompts-toggle').textContent  = T('prompts_toggle');
  document.getElementById('i18n-prompts-heading').textContent = T('prompts_heading');
  document.getElementById('i18n-prompts-sub').textContent     = T('prompts_sub');
  for (let i = 1; i <= 8; i++) {
    document.getElementById(`i18n-p${i}`).textContent = T(`p${i}`);
  }

  // Loading screen
  document.getElementById('i18n-loading-eyebrow').textContent = T('loading_eyebrow').replace('{year}', futureDate.getFullYear());
  const lt = T('loading_text').split('\n');
  document.getElementById('i18n-loading-text').innerHTML = lt[0] + '<br>' + (lt[1] || '') + '<span class="dots"></span>';

  // Letter actions
  document.getElementById('save-btn').textContent    = T('save_pdf');
  document.getElementById('share-btn').textContent   = T('copy_link');
  document.getElementById('again-btn').textContent   = T('write_another');
  document.getElementById('copy-confirm').textContent = T('link_copied');

  // Letter signature
  document.getElementById('i18n-with-love').textContent = T('with_love');
  document.getElementById('sig-name').textContent        = T('sig_name').replace('{year}', futureDate.getFullYear());

  // Shared banner
  document.getElementById('i18n-shared-text').textContent  = T('shared_text');
  document.getElementById('i18n-write-own').innerHTML       = T('write_own') + ' &rarr;';

  // Dates (locale-aware)
  document.getElementById('today-date').textContent  = formatDate(today);
  document.getElementById('letter-date').textContent = formatDate(futureDate);

  // Sync hidden select
  const sel = document.getElementById('lang-select');
  if (sel) sel.value = lang;

  // Update active state on grid buttons
  document.querySelectorAll('.lang-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// ── Language auto-detect + init ────────────────────────
(function initLang() {
  const saved     = localStorage.getItem('lang');
  const browser   = (navigator.language || 'en').split('-')[0].toLowerCase();
  const detected  = TRANSLATIONS[browser] ? browser : 'en';
  setLanguage(saved || detected);
})();

// ── Language picker toggle ─────────────────────────────
function toggleLangPicker() {
  const pill  = document.getElementById('lang-pill');
  const panel = document.getElementById('lang-panel');
  const isOpen = pill.classList.contains('open');
  if (isOpen) {
    pill.classList.remove('open');
    panel.classList.remove('open');
    pill.setAttribute('aria-expanded', 'false');
  } else {
    pill.classList.add('open');
    panel.classList.add('open');
    pill.setAttribute('aria-expanded', 'true');
  }
}

function closeLangPicker() {
  const pill  = document.getElementById('lang-pill');
  const panel = document.getElementById('lang-panel');
  if (pill)  { pill.classList.remove('open');  pill.setAttribute('aria-expanded', 'false'); }
  if (panel) panel.classList.remove('open');
}

// Close when clicking outside the subtitle-wrap / panel
document.addEventListener('click', e => {
  if (!e.target.closest('#subtitle-wrap')) closeLangPicker();
});

// Language option click handlers
document.querySelectorAll('.lang-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    setLanguage(btn.dataset.lang);
    closeLangPicker();
  });
});

// Keep hidden select in sync (if changed programmatically elsewhere)
document.getElementById('lang-select').addEventListener('change', e => {
  setLanguage(e.target.value);
});


// ── Elements ──────────────────────────────────────────

const writeScreen   = document.getElementById('write-screen');
const loadingScreen = document.getElementById('loading-screen');
const letterScreen  = document.getElementById('letter-screen');
const userMessage   = document.getElementById('user-message');
const sendBtn       = document.getElementById('send-btn');
const letterPaper   = document.getElementById('letter-paper');
const letterBody    = document.getElementById('letter-body');
const letterSig     = document.getElementById('letter-signature');
const letterActions = document.getElementById('letter-actions');
const saveBtn       = document.getElementById('save-btn');
const shareBtn      = document.getElementById('share-btn');
const againBtn      = document.getElementById('again-btn');
const copyConfirm   = document.getElementById('copy-confirm');
const sharedBanner  = document.getElementById('shared-banner');

let currentParagraphs  = [];
let currentUserMessage = '';


// ── Screen switching ──────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  dotMode = id === 'loading-screen' ? 'loading'
          : id === 'letter-screen'  ? 'letter'
          : 'idle';
}


// ── Auto-resize textarea ──────────────────────────────

userMessage.addEventListener('input', () => {
  userMessage.style.height = 'auto';
  userMessage.style.height = userMessage.scrollHeight + 'px';
});


// ── Generate letter ───────────────────────────────────

async function generateLetter() {
  const message = userMessage.value.trim();
  if (!message) return;

  currentUserMessage = message;
  sendBtn.disabled = true;
  showScreen('loading-screen');

  try {
    const res  = await fetch('/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message, lang: currentLang }),
    });
    const data = await res.json();

    if (data.error) {
      alert(data.error);
      showScreen('write-screen');
      sendBtn.disabled = false;
      return;
    }

    if (data.letter) {
      currentParagraphs = data.letter.split('\n').filter(p => p.trim().length > 0);
      renderLetter(currentParagraphs, false);
    }

  } catch (err) {
    console.error(err);
    alert('Something went wrong. Please try again.');
    showScreen('write-screen');
    sendBtn.disabled = false;
  }
}


// ── Render letter ─────────────────────────────────────

function renderLetter(paragraphs, isShared) {
  letterBody.innerHTML = '';
  letterPaper.classList.remove('visible');
  letterSig.classList.remove('revealed');
  letterActions.classList.remove('revealed');

  paragraphs.forEach((para, i) => {
    const p = document.createElement('p');
    p.textContent = para.trim();
    if (i === paragraphs.length - 1) p.classList.add('quiet-truth');
    letterBody.appendChild(p);
  });

  sharedBanner.classList.toggle('show', isShared);
  showScreen('letter-screen');

  requestAnimationFrame(() => {
    setTimeout(() => {
      letterPaper.classList.add('visible');

      letterBody.querySelectorAll('p').forEach((p, i) => {
        setTimeout(() => p.classList.add('revealed'), 400 + i * 300);
      });

      const total = paragraphs.length;
      setTimeout(() => letterSig.classList.add('revealed'),     400 + total * 300 + 150);
      setTimeout(() => letterActions.classList.add('revealed'), 400 + total * 300 + 500);
    }, 80);
  });
}


// ── PDF generation ────────────────────────────────────

function extractQuotes(paragraphs) {
  // Collect complete sentences only — never truncate mid-sentence
  const sentences = [];
  paragraphs.forEach(p => {
    const parts = p.match(/[^.!?]+[.!?]+/g) || [];
    parts.forEach(s => sentences.push(s.trim()));
  });

  // Score: prefer 50–200 chars (sweet spot for a quote page)
  // Heavily penalise very long sentences so they're a last resort
  const scored = sentences
    .filter(s => s.length >= 45 && s.length <= 280)
    .map(s => {
      let score = s.length <= 160 ? s.length : 160 - (s.length - 160) * 0.8;
      if (/^(I |You )/i.test(s)) score -= 20;
      if (/\b(always|never|every|still|already|somehow|quietly|slowly)\b/i.test(s)) score += 20;
      return { s, score };
    })
    .sort((a, b) => b.score - a.score);

  // Return top 1 complete sentence — no truncation, ever
  const picks = [];
  for (const { s } of scored) {
    if (!picks.includes(s)) picks.push(s);
    if (picks.length === 1) break;
  }
  return picks;
}

// ── PDF quote-page helpers ────────────────────────────

// Soft colour blob: concentric filled circles with opacity falloff
function drawPDFBlob(doc, cx, cy, maxR, r, g, b) {
  const steps = 20;
  for (let i = steps; i >= 1; i--) {
    const t      = i / steps;
    const radius = maxR * t;
    const alpha  = 0.11 * (1 - t * 0.55);
    doc.setGState(doc.GState({ opacity: alpha }));
    doc.setFillColor(r, g, b);
    doc.circle(cx, cy, radius, 'F');
  }
  doc.setGState(doc.GState({ opacity: 1 }));
}

// Flower: ring of petal circles around a centre
function drawPDFFlower(doc, cx, cy, petalCount, petalR, dist, r, g, b) {
  doc.setFillColor(r, g, b);
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const px    = cx + Math.cos(angle) * dist;
    const py    = cy + Math.sin(angle) * dist;
    doc.setGState(doc.GState({ opacity: 0.52 }));
    doc.circle(px, py, petalR, 'F');
  }
  // centre dot
  doc.setGState(doc.GState({ opacity: 0.72 }));
  doc.circle(cx, cy, petalR * 0.62, 'F');
  doc.setGState(doc.GState({ opacity: 1 }));
}

// Archimedean spiral drawn as connected line segments
function drawPDFSpiral(doc, cx, cy, maxR, turns, r, g, b) {
  const steps = Math.round(turns * 52);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.32);
  doc.setGState(doc.GState({ opacity: 0.38 }));
  for (let i = 1; i < steps; i++) {
    const t0 = (i - 1) / steps;
    const t1 = i       / steps;
    const a0 = t0 * turns * Math.PI * 2;
    const a1 = t1 * turns * Math.PI * 2;
    doc.line(
      cx + Math.cos(a0) * maxR * t0,  cy + Math.sin(a0) * maxR * t0,
      cx + Math.cos(a1) * maxR * t1,  cy + Math.sin(a1) * maxR * t1
    );
  }
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.setLineWidth(0.2);
}

function addQuotePage(doc, quote) {
  doc.addPage();
  const pw = doc.internal.pageSize.getWidth();   // 210 mm
  const ph = doc.internal.pageSize.getHeight();  // 297 mm

  // ── Background: pale lavender (matches --bg on the site) ──
  doc.setFillColor(245, 241, 250);
  doc.rect(0, 0, pw, ph, 'F');

  // ── Corner colour blobs ────────────────────────────────
  drawPDFBlob(doc,   0,   0,  82, 220, 160, 210);  // top-left:     soft rose/pink
  drawPDFBlob(doc,  pw,   0,  74, 255, 190, 155);  // top-right:    peach / coral
  drawPDFBlob(doc,   0,  ph,  88, 160, 120, 220);  // bottom-left:  lavender / purple
  drawPDFBlob(doc,  pw,  ph,  78, 230, 170, 230);  // bottom-right: pink-violet

  // ── Flowers ────────────────────────────────────────────
  // bottom-left cluster
  drawPDFFlower(doc,  20,  ph - 24,  8,  6,   10,  175, 115, 215);
  drawPDFFlower(doc,   7,  ph - 44,  6,  4.2,  7,  235, 145, 190);
  drawPDFFlower(doc,  34,  ph - 10,  5,  3.4,  6,  215, 168, 232);

  // top-right cluster
  drawPDFFlower(doc, pw - 20,  24,   8,  6,   10,  255, 165, 145);
  drawPDFFlower(doc, pw -  7,  44,   6,  4.2,  7,  240, 155, 205);
  drawPDFFlower(doc, pw - 34,  10,   5,  3.4,  6,  195, 148, 228);

  // ── Spirals / twirls ──────────────────────────────────
  drawPDFSpiral(doc,  40, ph - 44,  24, 2.5,  185, 135, 218);
  drawPDFSpiral(doc, pw - 40, 44,   20, 2.2,  240, 155, 178);

  // ── Quote text ─────────────────────────────────────────
  // Adaptive font — complete sentence always shown
  const margin   = 22;
  const fontSize = quote.length < 110 ? 30 : quote.length < 180 ? 26 : 22;
  const lineH    = quote.length < 110 ? 13 : quote.length < 180 ? 12 : 10.5;
  doc.setFont(pdfFont(), 'italic');
  doc.setFontSize(fontSize);
  doc.setTextColor(40, 34, 65);

  const lines  = doc.splitTextToSize(`\u201C${quote}\u201D`, pw - margin * 2);
  const blockH = lines.length * lineH;
  let y = (ph - blockH) / 2 + 4;

  lines.forEach(line => {
    doc.text(line, pw / 2, y, { align: 'center' });
    y += lineH;
  });

  // Thin decorative rule — fixed position above footer, never overlaps quote
  const ruleY = ph - 26;
  doc.setDrawColor(175, 148, 215);
  doc.setLineWidth(0.28);
  doc.setGState(doc.GState({ opacity: 0.45 }));
  doc.line(margin + 28, ruleY, pw - margin - 28, ruleY);
  doc.setGState(doc.GState({ opacity: 1 }));

  // ── Branding footer ────────────────────────────────────
  doc.setFont(pdfFont(), 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(145, 132, 170);
  doc.text(T('pdf_footer'), pw / 2, ph - 16, { align: 'center' });
  doc.text(formatDate(today), pw / 2, ph - 10, { align: 'center' });
}

function addUserMessagePage(doc, message) {
  doc.addPage();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // Same lavender background
  doc.setFillColor(245, 241, 250);
  doc.rect(0, 0, pw, ph, 'F');
  drawPDFBlob(doc,   0,   0,  65, 210, 175, 230);
  drawPDFBlob(doc,  pw,   0,  55, 240, 185, 220);
  drawPDFBlob(doc,   0,  ph,  60, 175, 145, 220);
  drawPDFBlob(doc,  pw,  ph,  58, 225, 170, 235);

  const margin = 28;
  let y = 28;

  // Header
  doc.setDrawColor(185, 175, 205);
  doc.setLineWidth(0.28);
  doc.line(margin, y, pw - margin, y);
  y += 6;

  doc.setFont(pdfFont(), 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(150, 138, 175);
  const label = currentLang === 'en' ? 'WHAT YOU WROTE' : 'YOUR WORDS';
  doc.text(label, pw / 2, y, { align: 'center' });
  y += 4;

  doc.line(margin, y, pw - margin, y);
  y += 10;

  doc.setFontSize(7.5);
  doc.setTextColor(160, 148, 185);
  doc.text(formatDate(today), margin, y);
  y += 12;

  // User message body
  doc.setFont(pdfFont(), 'italic');
  doc.setFontSize(11.5);
  doc.setTextColor(45, 40, 70);

  const paras = message.split(/\n+/).filter(p => p.trim());
  paras.forEach(para => {
    const lines = doc.splitTextToSize(para.trim(), pw - margin * 2);
    if (y + lines.length * 6 > ph - 24) { doc.addPage(); y = 28; }
    doc.text(lines, margin, y);
    y += lines.length * 6 + 2;
  });

  // Footer
  doc.setFont(pdfFont(), 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(155, 140, 178);
  doc.text(T('pdf_footer'), pw / 2, ph - 12, { align: 'center' });
}

// Register Lora fonts into a jsPDF doc instance (no-op if not yet loaded)
function registerLoraFonts(doc) {
  if (PDF_FONTS.regular) {
    doc.addFileToVFS('Lora-Regular.ttf',    PDF_FONTS.regular);
    doc.addFont('Lora-Regular.ttf',    'Lora', 'normal');
  }
  if (PDF_FONTS.italic) {
    doc.addFileToVFS('Lora-Italic.ttf',     PDF_FONTS.italic);
    doc.addFont('Lora-Italic.ttf',     'Lora', 'italic');
  }
  if (PDF_FONTS.bolditalic) {
    doc.addFileToVFS('Lora-BoldItalic.ttf', PDF_FONTS.bolditalic);
    doc.addFont('Lora-BoldItalic.ttf', 'Lora', 'bolditalic');
  }
}

// Choose font family — Lora when available (full Unicode), times as fallback
function pdfFont(style) {
  const hasLora = !!PDF_FONTS.regular;
  return hasLora ? 'Lora' : 'times';
}

function saveAsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  registerLoraFonts(doc);

  const pw           = doc.internal.pageSize.getWidth();
  const ph           = doc.internal.pageSize.getHeight();
  const margin       = 28;
  const pageWidth    = pw;
  const contentWidth = pageWidth - margin * 2;

  // ── Letter page: lavender background + soft blobs ────
  doc.setFillColor(245, 241, 250);
  doc.rect(0, 0, pw, ph, 'F');
  drawPDFBlob(doc,   0,   0,  70, 195, 165, 225);
  drawPDFBlob(doc,  pw,   0,  60, 230, 175, 215);
  drawPDFBlob(doc,   0,  ph,  65, 165, 135, 215);
  drawPDFBlob(doc,  pw,  ph,  62, 215, 160, 230);

  let y = 22;

  // Header rule
  doc.setDrawColor(185, 175, 205);
  doc.setLineWidth(0.28);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Title
  doc.setFont(pdfFont(), 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(145, 132, 168);
  doc.text(T('pdf_title'), pageWidth / 2, y, { align: 'center' });
  y += 4;

  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Dates
  doc.setFontSize(8);
  doc.setTextColor(155, 142, 172);
  doc.text(`${T('pdf_written')} ${formatDate(today)}`, margin, y);
  doc.text(`${T('pdf_from')} ${formatDate(futureDate)}`, pageWidth - margin, y, { align: 'right' });
  y += 14;

  // Letter body
  doc.setFont(pdfFont(), 'normal');
  doc.setFontSize(12);
  doc.setTextColor(30, 28, 45);

  currentParagraphs.forEach((para, i) => {
    const isLast = i === currentParagraphs.length - 1;

    if (isLast) {
      y += 3;
      doc.setDrawColor(190, 175, 215);
      doc.setGState(doc.GState({ opacity: 0.5 }));
      doc.line(margin, y - 2, pageWidth - margin, y - 2);
      doc.setGState(doc.GState({ opacity: 1 }));
      doc.setFont(pdfFont(), 'italic');
      doc.setTextColor(100, 92, 128);
    }

    const lines = doc.splitTextToSize(para.trim(), contentWidth);

    if (y + lines.length * 6 > ph - 22) {
      doc.addPage();
      doc.setFillColor(245, 241, 250);
      doc.rect(0, 0, pw, ph, 'F');
      y = 22;
    }

    doc.text(lines, margin, y);
    y += lines.length * 6 + 2;
  });

  // Signature
  y += 7;
  doc.setFont(pdfFont(), 'italic');
  doc.setFontSize(11);
  doc.setTextColor(115, 105, 138);
  doc.text(T('with_love'), margin, y);
  doc.setFont(pdfFont(), 'bolditalic');
  doc.setTextColor(35, 30, 55);
  doc.text(T('sig_name').replace('{year}', futureDate.getFullYear()), margin, y + 7);

  // Footer
  doc.setFont(pdfFont(), 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(155, 140, 178);
  doc.text(T('pdf_footer'), pw / 2, ph - 12, { align: 'center' });

  // ── User's original message ──────────────────────────
  if (currentUserMessage) addUserMessagePage(doc, currentUserMessage);

  // ── Quote page (1 only, complete sentence) ───────────
  const quotes = extractQuotes(currentParagraphs);
  quotes.forEach(q => addQuotePage(doc, q));

  doc.save(`letter-from-future-self-${today.toISOString().split('T')[0]}.pdf`);
}


// ── Share link — promotional text + homepage ─────────

async function copyShareLink() {
  try {
    const text = `${T('pdf_footer')}\n${T('subtitle')}\n\n${window.location.origin}`;
    await navigator.clipboard.writeText(text);
    copyConfirm.classList.add('show');
    setTimeout(() => copyConfirm.classList.remove('show'), 2500);
  } catch (err) {
    console.error('Share failed:', err);
  }
}


// ── Load shared letter (short ID or legacy hash) ──────

async function loadFromShared() {
  // New format: ?l=<id>
  const params = new URLSearchParams(window.location.search);
  const id = params.get('l');
  if (id) {
    try {
      const res = await fetch(`/letter/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.paragraphs) && data.paragraphs.length > 0) {
          currentParagraphs = data.paragraphs;
          renderLetter(data.paragraphs, true);
          return;
        }
      }
    } catch (e) { console.error(e); }
  }

  // Legacy format: #<base64>
  const hash = window.location.hash.slice(1);
  if (!hash) return;
  try {
    const paragraphs = JSON.parse(decodeURIComponent(atob(hash)));
    if (Array.isArray(paragraphs) && paragraphs.length > 0) {
      currentParagraphs = paragraphs;
      renderLetter(paragraphs, true);
    }
  } catch (e) { /* invalid — show normal page */ }
}


// ── Reset ─────────────────────────────────────────────

function reset() {
  userMessage.value        = '';
  userMessage.style.height = 'auto';
  currentParagraphs        = [];
  currentUserMessage       = '';
  sendBtn.disabled         = false;
  window.location.hash     = '';
  showScreen('write-screen');
  setTimeout(() => userMessage.focus(), 100);
}


// ── Event listeners ───────────────────────────────────

sendBtn.addEventListener('click',  generateLetter);
saveBtn.addEventListener('click',  saveAsPDF);
shareBtn.addEventListener('click', copyShareLink);
againBtn.addEventListener('click', reset);

userMessage.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generateLetter();
});


// ── Writing prompts toggle ────────────────────────────

function togglePrompts() {
  const body  = document.getElementById('prompts-body');
  const arrow = document.getElementById('prompts-arrow');
  const open  = body.classList.toggle('open');
  arrow.classList.toggle('open', open);
}


// ── Init ──────────────────────────────────────────────

loadFromShared();
