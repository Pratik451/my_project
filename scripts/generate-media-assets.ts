import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'public', 'uploads', 'media');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const assets = [
  {
    filename: 'slide-banking.svg',
    width: 1600,
    height: 900,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b3820"/>
      <stop offset="50%" stop-color="#07512a"/>
      <stop offset="100%" stop-color="#042815"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#042815" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bgGrad)"/>
  <circle cx="800" cy="450" r="600" fill="url(#glow)"/>
  
  <!-- Subtle decorative grid -->
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
    <line x1="0" y1="150" x2="1600" y2="150"/>
    <line x1="0" y1="300" x2="1600" y2="300"/>
    <line x1="0" y1="450" x2="1600" y2="450"/>
    <line x1="0" y1="600" x2="1600" y2="600"/>
    <line x1="0" y1="750" x2="1600" y2="750"/>
    <line x1="200" y1="0" x2="200" y2="900"/>
    <line x1="400" y1="0" x2="400" y2="900"/>
    <line x1="600" y1="0" x2="600" y2="900"/>
    <line x1="800" y1="0" x2="800" y2="900"/>
    <line x1="1000" y1="0" x2="1000" y2="900"/>
    <line x1="1200" y1="0" x2="1200" y2="900"/>
    <line x1="1400" y1="0" x2="1400" y2="900"/>
  </g>

  <!-- Financial Banking Building & Pillar Illustration -->
  <g transform="translate(900, 240)">
    <!-- Base Platform -->
    <path d="M 50 420 L 550 420 L 520 450 L 80 450 Z" fill="#082b19" stroke="#10b981" stroke-width="2"/>
    <rect x="80" y="380" width="440" height="40" rx="6" fill="#0d4727" stroke="#10b981" stroke-width="2"/>
    
    <!-- Classical Banking Pillars -->
    <rect x="110" y="160" width="45" height="220" rx="4" fill="#0e5a31" stroke="#34d399" stroke-width="1.5"/>
    <rect x="195" y="160" width="45" height="220" rx="4" fill="#0e5a31" stroke="#34d399" stroke-width="1.5"/>
    <rect x="280" y="160" width="45" height="220" rx="4" fill="#0e5a31" stroke="#34d399" stroke-width="1.5"/>
    <rect x="365" y="160" width="45" height="220" rx="4" fill="#0e5a31" stroke="#34d399" stroke-width="1.5"/>
    <rect x="450" y="160" width="45" height="220" rx="4" fill="#0e5a31" stroke="#34d399" stroke-width="1.5"/>
    
    <!-- Pediment / Roof Triangle -->
    <polygon points="300,40 70,160 530,160" fill="#0a3f23" stroke="#f59e0b" stroke-width="3"/>
    
    <!-- Golden Seal inside Pediment -->
    <circle cx="300" cy="115" r="28" fill="url(#goldGrad)" stroke="#ffffff" stroke-width="2"/>
    <text x="300" y="122" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#0b3820" text-anchor="middle">★</text>
  </g>

  <!-- Growth Trends Line -->
  <path d="M 150 680 C 350 620, 500 550, 700 420 C 900 320, 1100 340, 1450 180" fill="none" stroke="url(#goldGrad)" stroke-width="6" stroke-linecap="round" stroke-dasharray="10 6"/>
  <circle cx="1450" cy="180" r="14" fill="#fbbf24" stroke="#ffffff" stroke-width="4"/>

  <!-- Typography & Badges in Illustration -->
  <text x="140" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="#ffffff">EKATA COOPERATIVE</text>
  <text x="140" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="700" fill="#34d399">एकता बचत तथा ऋण सहकारी संस्था लि.</text>
  <text x="140" y="460" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="500" fill="#d1fae5">Trusted Financial Pillar of Rupandehi • Established 2057 B.S.</text>
  
  <g transform="translate(140, 520)">
    <rect width="280" height="58" rx="29" fill="url(#goldGrad)"/>
    <text x="140" y="36" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#0b3820" text-anchor="middle">COMMUNITY BANKING</text>
  </g>
</svg>`
  },
  {
    filename: 'slide-deposits.svg',
    width: 1600,
    height: 900,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <defs>
    <linearGradient id="depBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#072b1d"/>
      <stop offset="50%" stop-color="#0b4528"/>
      <stop offset="100%" stop-color="#143621"/>
    </linearGradient>
    <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#depBg)"/>

  <!-- High-Yield Badge & Vault Elements -->
  <g transform="translate(950, 200)">
    <!-- Vault Door Illustration -->
    <rect x="0" y="0" width="500" height="500" rx="30" fill="#09351e" stroke="#34d399" stroke-width="4"/>
    <circle cx="250" cy="250" r="180" fill="#0f4a2b" stroke="#f59e0b" stroke-width="8"/>
    <circle cx="250" cy="250" r="120" fill="#072b1d" stroke="#10b981" stroke-width="4"/>
    
    <!-- Combination Wheel Spokes -->
    <circle cx="250" cy="250" r="45" fill="url(#coinGrad)" stroke="#ffffff" stroke-width="4"/>
    <line x1="250" y1="130" x2="250" y2="370" stroke="#f59e0b" stroke-width="8"/>
    <line x1="130" y1="250" x2="370" y2="250" stroke="#f59e0b" stroke-width="8"/>
    
    <!-- Vault Bolted Accents -->
    <circle cx="50" cy="50" r="12" fill="#34d399"/>
    <circle cx="450" cy="50" r="12" fill="#34d399"/>
    <circle cx="50" cy="450" r="12" fill="#34d399"/>
    <circle cx="450" cy="450" r="12" fill="#34d399"/>
  </g>

  <!-- Big Interest Rate Callout -->
  <text x="140" y="320" font-family="system-ui, sans-serif" font-size="44" font-weight="900" fill="#a7f3d0">HIGH YIELD TERM DEPOSITS</text>
  <text x="140" y="440" font-family="system-ui, sans-serif" font-size="110" font-weight="900" fill="#fbbf24">11.75%</text>
  <text x="560" y="420" font-family="system-ui, sans-serif" font-size="38" font-weight="700" fill="#ffffff">वार्षिक ब्याजदर</text>
  <text x="560" y="460" font-family="system-ui, sans-serif" font-size="22" font-weight="500" fill="#d1fae5">Per Annum Compounded Return</text>

  <text x="140" y="530" font-family="system-ui, sans-serif" font-size="26" font-weight="600" fill="#ecfdf5">
    • Flexible tenure from 3 months to 5 years
  </text>
  <text x="140" y="575" font-family="system-ui, sans-serif" font-size="26" font-weight="600" fill="#ecfdf5">
    • Instant 90% loan facility against fixed deposit receipts
  </text>
  <text x="140" y="620" font-family="system-ui, sans-serif" font-size="26" font-weight="600" fill="#ecfdf5">
    • Quarterly interest payout directly to active savings account
  </text>
</svg>`
  },
  {
    filename: 'slide-agriculture.svg',
    width: 1600,
    height: 900,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <defs>
    <linearGradient id="agroBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06321c"/>
      <stop offset="60%" stop-color="#0b4e2a"/>
      <stop offset="100%" stop-color="#042413"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#agroBg)"/>

  <!-- Rolling Hills & Farming Landscape -->
  <path d="M 0 650 Q 400 500, 850 680 T 1600 620 L 1600 900 L 0 900 Z" fill="#0e5a31"/>
  <path d="M 0 720 Q 500 620, 1050 750 T 1600 700 L 1600 900 L 0 900 Z" fill="#083e20"/>

  <!-- Tractor / Agro Tech Illustration on Right -->
  <g transform="translate(1000, 360)">
    <!-- Sun / Prosperity Orb -->
    <circle cx="200" cy="40" r="100" fill="#f59e0b" opacity="0.8"/>
    
    <!-- Corn / Wheat Stalks -->
    <g fill="#fef08a" stroke="#d97706" stroke-width="2">
      <ellipse cx="60" cy="180" rx="14" ry="36" transform="rotate(-25 60 180)"/>
      <ellipse cx="100" cy="160" rx="14" ry="36" transform="rotate(20 100 160)"/>
      <ellipse cx="80" cy="120" rx="12" ry="40"/>
      <line x1="80" y1="120" x2="80" y2="280" stroke="#10b981" stroke-width="6"/>
    </g>
    <!-- Agro Machinery Silhouette -->
    <rect x="220" y="160" width="160" height="100" rx="12" fill="#042010" stroke="#34d399" stroke-width="3"/>
    <circle cx="240" cy="270" r="40" fill="#02140a" stroke="#f59e0b" stroke-width="6"/>
    <circle cx="360" cy="270" r="30" fill="#02140a" stroke="#f59e0b" stroke-width="5"/>
  </g>

  <!-- Left Content Info -->
  <text x="140" y="320" font-family="system-ui, sans-serif" font-size="44" font-weight="900" fill="#34d399">AGRICULTURE &amp; MICRO-ENTERPRISE</text>
  <text x="140" y="390" font-family="system-ui, sans-serif" font-size="52" font-weight="900" fill="#ffffff">कृषि, पशुपालन तथा उद्यमशीलता कर्जा</text>
  <text x="140" y="460" font-family="system-ui, sans-serif" font-size="26" font-weight="500" fill="#d1fae5">Subsidized productive loans from 8.75% for modern agro-tools, livestock, and green farming</text>

  <g transform="translate(140, 520)">
    <rect width="320" height="60" rx="12" fill="#052e16" stroke="#34d399" stroke-width="2"/>
    <text x="160" y="38" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#a7f3d0" text-anchor="middle">सहुलियतपूर्ण कृषि कर्जा</text>
  </g>
</svg>`
  },
  {
    filename: 'slide-digital.svg',
    width: 1600,
    height: 900,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <defs>
    <linearGradient id="digBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#082918"/>
      <stop offset="50%" stop-color="#0b4025"/>
      <stop offset="100%" stop-color="#041a0e"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#digBg)"/>

  <!-- Smartphone Mockup on Right -->
  <g transform="translate(1050, 160)">
    <rect x="0" y="0" width="340" height="600" rx="40" fill="#051c11" stroke="#34d399" stroke-width="6"/>
    <!-- Screen -->
    <rect x="18" y="45" width="304" height="510" rx="20" fill="#0b3820"/>
    <!-- QR Code Mockup -->
    <rect x="65" y="100" width="210" height="210" rx="16" fill="#ffffff"/>
    <rect x="90" y="125" width="60" height="60" fill="#0b3820"/>
    <rect x="190" y="125" width="60" height="60" fill="#0b3820"/>
    <rect x="90" y="225" width="60" height="60" fill="#0b3820"/>
    <rect x="170" y="210" width="30" height="30" fill="#f59e0b"/>
    <rect x="215" y="240" width="35" height="45" fill="#0b3820"/>
    
    <!-- Balance Card on Screen -->
    <rect x="40" y="340" width="260" height="90" rx="14" fill="#087a45" stroke="#34d399" stroke-width="2"/>
    <text x="60" y="375" font-family="system-ui, sans-serif" font-size="14" fill="#d1fae5">Available Savings</text>
    <text x="60" y="410" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#ffffff">Rs. 1,45,280.00</text>
  </g>

  <!-- Left Content -->
  <text x="140" y="310" font-family="system-ui, sans-serif" font-size="44" font-weight="900" fill="#34d399">MOBILE BANKING 3.0</text>
  <text x="140" y="380" font-family="system-ui, sans-serif" font-size="52" font-weight="900" fill="#ffffff">स्मार्टफोनबाटै सम्पूर्ण सहकारी सेवा</text>
  <text x="140" y="450" font-family="system-ui, sans-serif" font-size="24" font-weight="500" fill="#d1fae5">Instant QR Merchant Payments • Inter-Cooperative Fund Transfer • Biometric Security</text>

  <g transform="translate(140, 520)">
    <rect width="280" height="60" rx="12" fill="#f59e0b"/>
    <text x="140" y="38" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#0b3820" text-anchor="middle">DOWNLOAD APP</text>
  </g>
</svg>`
  },
  {
    filename: 'gallery-agm.svg',
    width: 800,
    height: 600,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="agmG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#093820"/>
      <stop offset="100%" stop-color="#041a0e"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#agmG)"/>
  <!-- Stage Backdrop Banner -->
  <rect x="80" y="80" width="640" height="240" rx="12" fill="#0b4a29" stroke="#f59e0b" stroke-width="3"/>
  <text x="400" y="150" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">२४औं वार्षिक साधारण सभा</text>
  <text x="400" y="195" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#fef08a" text-anchor="middle">24th Annual General Meeting (AGM)</text>
  <text x="400" y="240" font-family="system-ui, sans-serif" font-size="16" fill="#a7f3d0" text-anchor="middle">एकता बचत तथा ऋण सहकारी संस्था लि., बुटवल</text>

  <!-- Audience & Stage Dais -->
  <rect x="250" y="340" width="300" height="120" rx="8" fill="#082b19" stroke="#34d399" stroke-width="2"/>
  <circle cx="330" cy="390" r="22" fill="#f59e0b"/>
  <circle cx="400" cy="385" r="25" fill="#ffffff"/>
  <circle cx="470" cy="390" r="22" fill="#f59e0b"/>
  <!-- Podium -->
  <rect x="380" y="420" width="40" height="60" fill="#d97706"/>
  <text x="400" y="550" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle">सेयर सदस्य महानुभावहरूको भव्य सहभागिता</text>
</svg>`
  },
  {
    filename: 'gallery-literacy.svg',
    width: 800,
    height: 600,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#06321b"/>
  <!-- Classroom / Workshop Board -->
  <rect x="100" y="80" width="600" height="260" rx="14" fill="#084725" stroke="#34d399" stroke-width="3"/>
  <text x="400" y="150" font-family="system-ui, sans-serif" font-size="26" font-weight="900" fill="#ffffff" text-anchor="middle">महिला लघुउद्यमी वित्तीय साक्षरता</text>
  <text x="400" y="195" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#fef08a" text-anchor="middle">Women Entrepreneur Financial Literacy &amp; Skill Development</text>
  <text x="400" y="240" font-family="system-ui, sans-serif" font-size="16" fill="#a7f3d0" text-anchor="middle">लेखा व्यवस्थापन, बचत वृद्धि र व्यवसाय प्रवर्द्धन तालिम</text>

  <!-- Group figures with certificate -->
  <g transform="translate(240, 360)">
    <circle cx="80" cy="50" r="28" fill="#fbbf24"/>
    <path d="M 40 120 C 40 85 120 85 120 120 Z" fill="#0e5a31"/>
    <circle cx="180" cy="45" r="28" fill="#34d399"/>
    <path d="M 140 120 C 140 85 220 85 220 120 Z" fill="#0e5a31"/>
    <circle cx="280" cy="50" r="28" fill="#fbbf24"/>
    <path d="M 240 120 C 240 85 320 85 320 120 Z" fill="#0e5a31"/>
    <!-- Certificate -->
    <rect x="145" y="80" width="70" height="50" rx="4" fill="#ffffff" stroke="#d97706" stroke-width="2"/>
    <line x1="155" y1="95" x2="205" y2="95" stroke="#06321b" stroke-width="2"/>
    <line x1="155" y1="110" x2="195" y2="110" stroke="#06321b" stroke-width="2"/>
  </g>
  <text x="400" y="550" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">समुदाय स्तरमा स्वरोजगार तथा सशक्तिकरण</text>
</svg>`
  },
  {
    filename: 'gallery-healthcamp.svg',
    width: 800,
    height: 600,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#07301c"/>
  <!-- Medical / CSR Banner -->
  <rect x="100" y="80" width="600" height="260" rx="14" fill="#094727" stroke="#ef4444" stroke-width="3"/>
  <!-- Red Cross Badge -->
  <circle cx="400" cy="140" r="32" fill="#ffffff"/>
  <rect x="392" y="120" width="16" height="40" fill="#ef4444"/>
  <rect x="380" y="132" width="40" height="16" fill="#ef4444"/>

  <text x="400" y="210" font-family="system-ui, sans-serif" font-size="26" font-weight="900" fill="#ffffff" text-anchor="middle">सामुदायिक स्वास्थ्य शिविर तथा रक्तदान</text>
  <text x="400" y="250" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#fef08a" text-anchor="middle">Free Community Health Checkup &amp; Blood Donation Drive</text>
  <text x="400" y="290" font-family="system-ui, sans-serif" font-size="16" fill="#a7f3d0" text-anchor="middle">एकता सहकारीको सामाजिक उत्तरदायित्व (CSR) कार्यक्रम</text>

  <g transform="translate(300, 370)">
    <!-- Heartbeat ECG line -->
    <path d="M 0 50 L 50 50 L 70 20 L 90 80 L 110 30 L 130 65 L 145 50 L 200 50" fill="none" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>
  </g>
  <text x="400" y="520" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">५००+ सदस्य तथा स्थानीय बासिन्दा लाभान्वित</text>
</svg>`
  },
  {
    filename: 'gallery-tech.svg',
    width: 800,
    height: 600,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#082b19"/>
  <rect x="100" y="80" width="600" height="260" rx="14" fill="#0b4526" stroke="#38bdf8" stroke-width="3"/>
  <text x="400" y="150" font-family="system-ui, sans-serif" font-size="26" font-weight="900" fill="#ffffff" text-anchor="middle">डिजिटल बैंकिङ तथा युवा वित्तीय गोष्ठी</text>
  <text x="400" y="195" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#7dd3fc" text-anchor="middle">Digital Cooperative Technology &amp; Youth Summit</text>
  <text x="400" y="240" font-family="system-ui, sans-serif" font-size="16" fill="#d1fae5" text-anchor="middle">क्यूआर भुक्तानी, मोबाइल सुरक्षा र साइबर सचेतना</text>
  
  <g transform="translate(280, 360)">
    <rect x="40" y="20" width="160" height="100" rx="10" fill="#031b0e" stroke="#38bdf8" stroke-width="3"/>
    <rect x="70" y="40" width="100" height="50" rx="6" fill="#0b4526"/>
    <circle cx="120" cy="105" r="5" fill="#38bdf8"/>
  </g>
  <text x="400" y="520" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">सुरक्षित डिजिटल नेपालको निर्माणमा एकता</text>
</svg>`
  },
  {
    filename: 'notice-agm.svg',
    width: 1200,
    height: 600,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="1200" height="600">
  <rect width="1200" height="600" fill="#06321b"/>
  <rect x="60" y="60" width="1080" height="480" rx="20" fill="#0a4626" stroke="#f59e0b" stroke-width="4"/>
  <circle cx="600" cy="170" r="60" fill="#f59e0b"/>
  <text x="600" y="188" font-family="system-ui, sans-serif" font-size="52" font-weight="bold" fill="#06321b" text-anchor="middle">AGM</text>
  <text x="600" y="290" font-family="system-ui, sans-serif" font-size="36" font-weight="900" fill="#ffffff" text-anchor="middle">२४औं वार्षिक साधारण सभा तथा १५.५% लाभांश वितरण</text>
  <text x="600" y="345" font-family="system-ui, sans-serif" font-size="24" font-weight="700" fill="#fef08a" text-anchor="middle">24th AGM &amp; 15.5% Dividend Distribution Notice</text>
  <text x="600" y="400" font-family="system-ui, sans-serif" font-size="20" fill="#d1fae5" text-anchor="middle">स्थान: केन्द्रीय सभाहल, बुटवल-०४ • मिति: २०८३ असोज १८ गते</text>
  <rect x="450" y="440" width="300" height="50" rx="25" fill="#052011" stroke="#34d399" stroke-width="2"/>
  <text x="600" y="472" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#34d399" text-anchor="middle">सूचना नं. ०४/२०८३-८४</text>
</svg>`
  },
  {
    filename: 'notice-ekym.svg',
    width: 1200,
    height: 600,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="1200" height="600">
  <rect width="1200" height="600" fill="#052715"/>
  <rect x="60" y="60" width="1080" height="480" rx="20" fill="#0b4023" stroke="#34d399" stroke-width="4"/>
  <!-- Digital Shield -->
  <path d="M 600 110 L 670 145 L 670 215 Q 670 280 600 310 Q 530 280 530 215 L 530 145 Z" fill="#f59e0b" stroke="#ffffff" stroke-width="3"/>
  <text x="600" y="225" font-family="system-ui, sans-serif" font-size="34" font-weight="bold" fill="#052715" text-anchor="middle">eKYM</text>
  <text x="600" y="370" font-family="system-ui, sans-serif" font-size="36" font-weight="900" fill="#ffffff" text-anchor="middle">अनिवार्य eKYM डिजिटल सदस्य विवरण अद्यावधिक</text>
  <text x="600" y="420" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="#fef08a" text-anchor="middle">Mandatory Member Digital Identity Verification Portal</text>
  <text x="600" y="465" font-family="system-ui, sans-serif" font-size="18" fill="#d1fae5" text-anchor="middle">३ मिनेटमा अनलाइन फाराम भर्नुहोस् • नागरिकता र तस्बिर सुरक्षित अपलोड</text>
</svg>`
  },
  {
    filename: 'notice-festive.svg',
    width: 1200,
    height: 600,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="1200" height="600">
  <rect width="1200" height="600" fill="#0b3820"/>
  <rect x="60" y="60" width="1080" height="480" rx="20" fill="#0d4d29" stroke="#fbbf24" stroke-width="4"/>
  <!-- Festive Lamp Diya -->
  <g transform="translate(600, 160)">
    <ellipse cx="0" cy="30" rx="60" ry="24" fill="#b45309" stroke="#f59e0b" stroke-width="2"/>
    <path d="M -15 25 Q 0 -20 15 25 Z" fill="#ef4444"/>
    <path d="M -8 20 Q 0 -10 8 20 Z" fill="#fbbf24"/>
  </g>
  <text x="600" y="270" font-family="system-ui, sans-serif" font-size="36" font-weight="900" fill="#ffffff" text-anchor="middle">दशैं-तिहार विशेष सहुलियत कर्जा योजना २०८३</text>
  <text x="600" y="325" font-family="system-ui, sans-serif" font-size="28" font-weight="800" fill="#fef08a" text-anchor="middle">Festive Productive &amp; Agricultural Loan Scheme</text>
  <text x="600" y="375" font-family="system-ui, sans-serif" font-size="22" fill="#d1fae5" text-anchor="middle">८.७५% विशेष ब्याजदर • कुनै पनि अग्रिम सेवा शुल्क नलाग्ने</text>
  <rect x="420" y="420" width="360" height="50" rx="25" fill="#f59e0b"/>
  <text x="600" y="452" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#0b3820" text-anchor="middle">२४ घण्टाभित्र कर्जा स्वीकृति</text>
</svg>`
  }
];

for (const asset of assets) {
  const filePath = path.join(outDir, asset.filename);
  fs.writeFileSync(filePath, asset.svg.trim(), 'utf8');
  console.log(`Created media asset: ${asset.filename}`);
}

console.log('All local self-hosted SVG assets generated successfully!');
