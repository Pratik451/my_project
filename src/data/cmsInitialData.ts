import {
  CmsPagesState,
  DepartmentCMS,
  ServiceCenterCMS,
  ReportCMS,
  CareerCMS,
  PrivacyPolicyCMS,
  SocialLinksCMS,
  BrandThemeCMS,
  DocumentItemCMS,
  NewsActivityItemCMS,
  SuggestionItemCMS,
  FaqItemCMS,
  HistoryMilestonesPageCMS,
  WhyChooseUsPageCMS,
  ExchangeRateItemCMS,
  InstitutionalProfileItemCMS,
  MonthlyFinancialReportCMS,
  HeadOfficeInfoCMS,
  LeadershipMemberCMS,
} from '../types';

export const INITIAL_MONTHLY_FINANCIAL_REPORTS: MonthlyFinancialReportCMS[] = [
  {
    id: 'rep-m-2083-06',
    fiscalYear: 'आ.व. २०८३/८४',
    monthNp: 'असोज',
    monthEn: 'Ashwin',
    reportDateNp: '२०८३-०६-०१',
    reportDateEn: '2026-09-17',
    totalMembers: '44,520',
    shareCapital: 'रु. ३१,५०,००,०००/-',
    shareCapitalGrowth: '0.00% वृद्धि',
    reserveFund: 'रु. ४१,५०,००,०००/-',
    reserveFundGrowth: '0.00% वृद्धि',
    totalInstitutionalCapital: 'रु. ४३,१०,००,०००/-',
    totalInstitutionalCapitalNote: 'जगेडा + अन्य',
    otherFunds: 'रु. १,६०,००,०००/-',
    totalSavings: 'रु. ३,९२,००,००,०००/-',
    totalSavingsGrowth: '0.00% वृद्धि',
    loansDisbursed: 'रु. ३,७०,००,००,०००/-',
    borrowerMembersCount: '10,540 ऋणी सदस्य',
    liquidityAmount: 'रु. १,१०,००,००,०००/-',
    liquidityPercent: '28.06%',
    fixedAssets: 'रु. ८,९०,००,०००/-',
    totalAssets: 'रु. ४,९५,३५,४०,०००/-',
    npaPercent: 'NPA 4.75%',
    nplPercent: 'NPL 2.40%',
    liqPercentBadge: 'Liq 28.06%',
    isPublished: true,
    isLatest: true,
    sortOrder: 1,
    remarksNp: 'आ.व. २०८३/८४ असोज मसान्तसम्मको मासिक संस्थागत वित्तीय विवरण',
    remarksEn: 'Monthly institutional financial summary up to end of Ashwin 2083',
    updatedAt: '2083-06-01',
  },
  {
    id: 'rep-m-2083-05',
    fiscalYear: 'आ.व. २०८३/८४',
    monthNp: 'भदौ',
    monthEn: 'Bhadra',
    reportDateNp: '२०८३-०५-०१',
    reportDateEn: '2026-08-17',
    totalMembers: '44,180',
    shareCapital: 'रु. ३१,२५,००,०००/-',
    shareCapitalGrowth: '0.00% वृद्धि',
    reserveFund: 'रु. ४१,३०,००,०००/-',
    reserveFundGrowth: '0.00% वृद्धि',
    totalInstitutionalCapital: 'रु. ४२,८०,००,०००/-',
    totalInstitutionalCapitalNote: 'जगेडा + अन्य',
    otherFunds: 'रु. १,५०,००,०००/-',
    totalSavings: 'रु. ३,८८,००,००,०००/-',
    totalSavingsGrowth: '0.00% वृद्धि',
    loansDisbursed: 'रु. ३,६८,००,००,०००/-',
    borrowerMembersCount: '10,450 ऋणी सदस्य',
    liquidityAmount: 'रु. १,०८,५०,००,०००/-',
    liquidityPercent: '27.96%',
    fixedAssets: 'रु. ८,८५,००,०००/-',
    totalAssets: 'रु. ४,९१,१०,२०,०००/-',
    npaPercent: 'NPA 4.78%',
    nplPercent: 'NPL 2.42%',
    liqPercentBadge: 'Liq 27.96%',
    isPublished: true,
    isLatest: false,
    sortOrder: 2,
    remarksNp: 'आ.व. २०८३/८४ भदौ मसान्तसम्मको मासिक संस्थागत वित्तीय विवरण',
    remarksEn: 'Monthly institutional financial summary up to end of Bhadra 2083',
    updatedAt: '2083-05-01',
  },
  {
    id: 'rep-m-2083-03',
    fiscalYear: 'आ.व. २०८२/८३',
    monthNp: 'असार',
    monthEn: 'Ashadh',
    reportDateNp: '२०८३-०३-०१',
    reportDateEn: '2026-06-15',
    totalMembers: '43,892',
    shareCapital: 'रु. ३१,०८,४०,४००/-',
    shareCapitalGrowth: '0.00% वृद्धि',
    reserveFund: 'रु. ४१,१८,२४,२८०/-',
    reserveFundGrowth: '0.00% वृद्धि',
    totalInstitutionalCapital: 'रु. ४२,६६,४४,५५८/-',
    totalInstitutionalCapitalNote: 'जगेडा + अन्य',
    otherFunds: 'रु. १,४८,२०,२७८/-',
    totalSavings: 'रु. ३,८०,१८,०७,८६०/-',
    totalSavingsGrowth: '0.00% वृद्धि',
    loansDisbursed: 'रु. ३,६४,७०,९१,०६६/-',
    borrowerMembersCount: '10,380 ऋणी सदस्य',
    liquidityAmount: 'रु. १,०७,५३,५४,०५५/-',
    liquidityPercent: '27.56%',
    fixedAssets: 'रु. ८,८३,४७,०५४/-',
    totalAssets: 'रु. ४,८८,२२,३८,५६१/-',
    npaPercent: 'NPA 4.82%',
    nplPercent: 'NPL 2.45%',
    liqPercentBadge: 'Liq 27.56%',
    isPublished: true,
    isLatest: false,
    sortOrder: 3,
    remarksNp: 'आ.व. २०८२/८३ असार मसान्तसम्मको मासिक संस्थागत वित्तीय सारांश',
    remarksEn: 'Monthly institutional financial summary up to end of Ashadh 2083',
    updatedAt: '2083-03-01',
  },
  {
    id: 'rep-m-2083-02',
    fiscalYear: 'आ.व. २०८२/८३',
    monthNp: 'जेठ',
    monthEn: 'Jestha',
    reportDateNp: '२०८३-०२-०१',
    reportDateEn: '2026-05-15',
    totalMembers: '43,369',
    shareCapital: 'रु. ३०,८६,४३,४००/-',
    shareCapitalGrowth: '0.00% वृद्धि',
    reserveFund: 'रु. ४१,१८,२४,२८०/-',
    reserveFundGrowth: '0.00% वृद्धि',
    totalInstitutionalCapital: 'रु. ४२,६६,४४,५५८/-',
    totalInstitutionalCapitalNote: 'जगेडा + अन्य',
    otherFunds: 'रु. १,४८,२०,२८८/-',
    totalSavings: 'रु. ३,८५,६५,६१,५७८/-',
    totalSavingsGrowth: '0.00% वृद्धि',
    loansDisbursed: 'रु. ३,५८,५९,३७,८०९/-',
    borrowerMembersCount: '11,309 ऋणी सदस्य',
    liquidityAmount: 'रु. १,०७,१८,६५,६८६/-',
    liquidityPercent: '27.79%',
    fixedAssets: 'रु. ८,८८,६७,४३७/-',
    totalAssets: 'रु. ४,८१,६०,७२,८२४/-',
    npaPercent: 'NPA 4.66%',
    nplPercent: 'NPL 2.67%',
    liqPercentBadge: 'Liq 27.79%',
    isPublished: true,
    isLatest: false,
    sortOrder: 4,
    remarksNp: 'आ.व. २०८२/८३ जेठ मसान्तसम्मको मासिक संस्थागत वित्तीय सारांश',
    remarksEn: 'Monthly institutional financial summary up to end of Jestha 2083',
    updatedAt: '2083-02-01',
  },
];

export const INITIAL_CMS_PAGES: CmsPagesState = {
  profile: {
    titleEn: 'About Ankur Saving & Credit Cooperative Ltd.',
    titleNp: 'अंकुर बचत तथा ऋण सहकारी संस्था लि. को संक्षिप्त परिचय',
    subtitleEn: 'Institutional Profile, Heritage & Cooperative Identity',
    subtitleNp: 'संस्थागत परिचय, इतिहास तथा सहकारी पहिचान',
    establishedBs: '2057',
    establishedAd: '2000',
    regdNo: '421/057/058',
    panNo: '301548921',
    historyEn:
      'Established in 2057 B.S. under the Cooperative Act 2048, Ankur Saving & Credit Cooperative Ltd. has evolved into one of the most resilient and community-trusted financial cooperatives in Rupandehi and Lumbini Province. Founded with an initial cohort of 35 dedicated visionaries, Ankur now proudly serves more than 15,420 esteemed members with audited assets exceeding Rs. 1.28 Arba. Our institution operates under modern prudential norms, international cooperative standards (ICA), and rigorous internal risk management protocols.',
    historyNp:
      'सहकारी ऐन २०४८ अन्तर्गत वि.सं. २०५७ सालमा विधिवत् दर्ता भई सञ्चालनमा आएको अंकुर बचत तथा ऋण सहकारी संस्था लि. आज रुपन्देही तथा समग्र लुम्बिनी प्रदेशकै एक अग्रणी र विश्वसनीय वित्तीय संस्थाका रूपमा स्थापित भएको छ। प्रारम्भमा ३५ जना उत्साही संस्थापक सदस्यहरूबाट सुरु भएको यस संस्थाले हाल १५,४२० भन्दा बढी शेयर सदस्यहरूलाई आधुनिक बैंकिङ सेवा प्रदान गर्दै १ अर्ब २८ करोडभन्दा बढी कुल पुँजी परिचालन गरिरहेको छ। संस्थाले अन्तर्राष्ट्रिय सहकारी सिद्धान्त र कडा वित्तीय अनुशासनको पूर्ण पालना गर्दै आएको छ।',
    pointsEn: [
      'Registered under Cooperative Department (Regd. No: 421/057/058).',
      'Operational Area: Entire Rupandehi District & Lumbini Province.',
      'Audited Total Balance Sheet: Over Rs. 1.28 Arba with zero institutional bad debt.',
      'Active Members Base: 15,420+ proud shareholders across urban and rural wards.',
      'Pioneering digital cooperative solutions including NepalPay QR and Mobile Banking.',
      'Awarded "Exemplary Community Financial Cooperative" by District Cooperative Union.',
    ],
    pointsNp: [
      'सहकारी विभागमा विधिवत् दर्ता (दर्ता नं: ४२१/०५७/०५८)।',
      'कार्यक्षेत्र: सम्पूर्ण रुपन्देही जिल्ला तथा लुम्बिनी प्रदेशका पायक पर्ने स्थानहरू।',
      'कुल वासलात: १ अर्ब २८ करोड रुपैयाँभन्दा बढी, सुरक्षित तथा भरपर्दो पुँजी संरचना।',
      'शेयर सदस्य संख्या: १५,४२० भन्दा बढी सक्रिय तथा सन्तुष्ट सदस्यहरू।',
      'नेपालपे क्युआर र मोबाइल बैंकिङ सहितका अत्याधुनिक डिजिटल सेवाहरू सञ्चालन।',
      'जिल्ला सहकारी संघद्वारा "उत्कृष्ट सामुदायिक वित्तीय सहकारी" का रूपमा पुरस्कृत।',
    ],
    pdfUrl: '/downloads/ekata-profile-2080.pdf',
    bannerImage: '/uploads/media/notice-agm.svg',
  },

  missionVision: {
    titleEn: 'Mission, Vision, Strategic Objectives & Core Values',
    titleNp: 'संस्थाको ध्येय, दृष्टि, रणनीतिक उद्देश्य तथा मूल्यमान्यता',
    visionEn:
      'To be the most reliable, inclusive, and technologically advanced community-based financial cooperative in Nepal, ensuring sustainable prosperity and socioeconomic dignity for every member.',
    visionNp:
      'नेपालकै सर्वाधिक विश्वसनीय, प्रविधिमैत्री, समावेशी र आत्मनिर्भर समुदायमा आधारित बचत तथा ऋण सहकारी बन्दै सम्पूर्ण सदस्यहरूको दिगो आर्थिक उन्नति र सामाजिक प्रतिष्ठा सुनिश्चित गर्ने।',
    missionEn:
      'To deliver transparent, affordable, and member-centric microfinance, competitive savings, productive enterprise credit, and cutting-edge digital banking services while fostering grassroots solidarity and cooperative education.',
    missionNp:
      'पारदर्शी, सुलभ र सदस्य-केन्द्रित बचत तथा निक्षेप योजना, उत्पादनशील कर्जा लगानी, र आधुनिक डिजिटल बैंकिङ सेवाहरू प्रवाह गर्दै समुदायमा उद्यमशीलता प्रवर्द्धन र सहकारी शिक्षा विस्तार गर्ने।',
    valuesEn: [
      'Member First & Fiduciary Trust: Total safety of public savings is our sacred pledge.',
      'Ethical Transparency: Zero tolerance for non-compliance and proactive disclosure.',
      'Democratic Governance: One member, one vote; egalitarian representation in leadership.',
      'Social Responsibility: Dedicating 10% of operational surplus to community welfare and education.',
      'Innovation & Inclusivity: Bridging traditional rural banking with modern fintech convenience.',
    ],
    valuesNp: [
      'सदस्य प्राथमिकता र निक्षेप सुरक्षा: सदस्यको पसिनाको कमाइको १००% सुरक्षा हाम्रो मुख्य धर्म हो।',
      'पारदर्शिता र सुशासन: नियमनकारी निकायका मापदण्डहरूको पूर्ण परिपालना र खुला अडिट।',
      'लोकतान्त्रिक सहभागिता: एक सदस्य, एक मत; समतामूलक नेतृत्व र संस्थागत निर्णय।',
      'सामाजिक उत्तरदायित्व: वार्षिक बचत नाफाको १०% समुदायको स्वास्थ्य, शिक्षा र कल्याणमा लगानी।',
      'प्रविधि र नवप्रवर्तन: परम्परागत ग्रामीण बैंकिङलाई आधुनिक डिजिटल प्रविधिसँग जोड्ने अभियान।',
    ],
    goalsEn: [
      'Expand branchless teller desks to all municipal wards by 2082 B.S.',
      'Achieve 100% paperless eKYM and loan evaluation through core CBS integration.',
      'Disburse Rs. 50 Crore dedicated subsidized credit to organic farming and youth start-ups.',
      'Maintain PEARLS financial ratios within national regulatory gold standards.',
    ],
    goalsNp: [
      'वि.सं. २०८२ भित्र सम्पूर्ण स्थानीय वडाहरूमा आधुनिक डिजिटल सेवा डेस्क विस्तार गर्ने।',
      'कोर बैंकिङ प्रणाली मार्फत शतप्रतिशत कागजरहित eKYM र तत्काल कर्जा मूल्याङ्कन लागू गर्ने।',
      'जैविक कृषि तथा युवा स्वरोजगारका लागि रु. ५० करोड बराबरको सहुलियतपूर्ण ऋण प्रवाह गर्ने।',
      'पर्ल्स (PEARLS) वित्तीय सूचकांकहरूमा उत्कृष्ट नतिजा निरन्तर कायम राख्ने।',
    ],
  },

  chairman: {
    titleEn: 'Official Message from the Chairman of the Board',
    titleNp: 'सञ्चालक समितिका अध्यक्षज्यूको शुभकामना सन्देश',
    nameEn: 'Mr. Bharat Sharma Pokhrel',
    nameNp: 'श्री भरत शर्मा पोखरेल',
    roleEn: 'Chairman, Board of Directors',
    roleNp: 'अध्यक्ष, सञ्चालक समिति',
    photoUrl: '/uploads/media/team-chair.svg',
    dateEn: 'Ashwin 2081 B.S. / October 2024',
    dateNp: '२०८१ आश्विन महिना, बुटवल',
    messageEn:
      'Warm greetings to all our respected members, well-wishers, and community partners.\n\nOver the past 24 years, Ankur Saving & Credit Cooperative Ltd. has stood firm on the rock of integrity, accountability, and collective empowerment. Even in challenging macroeconomic landscapes, our cooperative has recorded steady growth in deposits, prudent loan management, and robust reserve capital. This resilience is solely due to the unwavering trust of our 15,420+ members.\n\nOur focus today is dual: deepening grassroots member welfare through affordable agricultural and enterprise credit, while rapidly adopting world-class digital banking systems such as NepalPay QR, instant interbank transfers, and 24/7 mobile access. We reiterate our sacred pledge that every single rupee entrusted to Ankur Cooperative remains completely secure, productive, and transparently accounted for.\n\nI convey my profound gratitude to our Board members, statutory committees, dedicated employees, and especially our shareholder members whose active participation is the beating heart of Ankur.',
    messageNp:
      'अंकुर बचत तथा ऋण सहकारी संस्था लि. का सम्पूर्ण आदरणीय शेयर सदस्य महानुभावहरू, नियमनकारी निकाय तथा शुभचिन्तकहरूमा हार्दिक नमस्कार तथा न्यानो अभिवादन व्यक्त गर्दछु।\n\nविगत २४ वर्षको गौरवमय यात्रामा यस संस्थाले समुदायको विश्वास, पारदर्शिता र वित्तीय सुशासनलाई आफ्नो मूल मन्त्र बनाएको छ। आर्थिक चुनौतीका बाबजुद हाम्रो संस्थाले निक्षेप संकलन, सुरक्षित कर्जा प्रवाह र जगेडा कोष सुदृढीकरणमा ऐतिहासिक सफलता हासिल गरेको छ। यो सफलता सम्पूर्ण १५,४२० भन्दा बढी सदस्यहरूको अविचल भरोसाको प्रतिफल हो।\n\nआजको युग प्रविधिको युग हो। हामीले सदस्यहरूको सुविधाका लागि मोबाइल बैंकिङ, नेपालपे क्युआर भुक्तानी र अनलाइन eKYM जस्ता आधुनिक सेवाहरू घरघरमै पुर्याएका छौं। संस्थामा जम्मा भएको हरेक पैसा १००% सुरक्षित र उत्पादनशील क्षेत्रमा परिचालन भइरहेको व्यहोरा म स्पष्ट पार्न चाहन्छु।\n\nसंस्थालाई यहाँसम्म पुर्याउन अहोरात्र खट्नुहुने सञ्चालक समिति, लेखा सुपरिवेक्षण समिति, सम्पूर्ण समर्पित कर्मचारी तथा सदैव मार्गदर्शन गर्नुहुने सम्पूर्ण शेयर सदस्यज्यूहरूमा हार्दिक कृतज्ञता व्यक्त गर्दछु।',
  },

  ceo: {
    titleEn: 'Operational Insights & Commitment from the Chief Executive Officer',
    titleNp: 'प्रमुख कार्यकारी अधिकृत (CEO) को प्रतिबद्धता तथा सन्देश',
    nameEn: 'Mr. Ramesh Kumar Gautam',
    nameNp: 'श्री रमेश कुमार गौतम',
    roleEn: 'Chief Executive Officer (CEO)',
    roleNp: 'प्रमुख कार्यकारी अधिकृत',
    photoUrl: '/uploads/media/team-ceo.svg',
    dateEn: 'Current Fiscal Year 2081/82',
    dateNp: 'चालु आर्थिक वर्ष २०८१/८२',
    messageEn:
      'Dear Esteemed Members and Stakeholders,\n\nIt is an honor to steer the operational management of Ankur Saving & Credit Cooperative Ltd. Our core mission as the executive team is to translate the vision of the Board of Directors into swift, transparent, and seamless daily financial services for every member visiting our counters or tapping on our mobile app.\n\nIn Fiscal Year 2081/82, we have upgraded our Core Banking System (CBS) to an enterprise-grade platform with real-time audit controls, automated interest postings, and multi-factor TLS encryption. Our turnaround time for personal and micro-business credit evaluation has been reduced from days to under 48 hours. Furthermore, our risk appraisal committee conducts direct site visits to ensure productive capital utilization and high loan recovery rates.\n\nWhether you need a safe avenue for daily savings, funding for children\'s higher education, business expansion loans, or instant worldwide remittances, our competent team across all service centers is at your service with humility and professional competence.',
    messageNp:
      'आदरणीय शेयर सदस्य महानुभावहरू तथा सरोकारवालाहरूमा नमस्कार।\n\nअंकुर बचत तथा ऋण सहकारी संस्थाको दैनिक कार्य सञ्चालन र व्यवस्थापकीय नेतृत्व सम्हाल्न पाउँदा म अत्यन्त गौरवान्वित छु। हाम्रो व्यवस्थापन टोलीको मुख्य ध्येय भनेको सञ्चालक समितिले तय गरेका रणनीतिक नीतिहरूलाई व्यवहारमा उतारी सदस्यहरूलाई छिटोछरितो, पारदर्शी र आधुनिक वित्तीय सेवा प्रवाह गर्नु हो।\n\nचालु आर्थिक वर्षमा हामीले हाम्रो कोर बैंकिङ प्रणाली (CBS) लाई अत्याधुनिक बनाउँदै स्वचालित ब्याज भुक्तानी, दैनिक कारोबार अडिट र सुरक्षित डिजिटल बैंकिङ सुनिश्चित गरेका छौं। कर्जा आवेदन परेको ४८ घण्टाभित्रै स्थलगत निरीक्षण र मूल्याङ्कन सम्पन्न गरी ऋण प्रवाह गर्ने प्रणाली स्थापित गरिएको छ।\n\nतपाईंलाई दैनिक बचत, बालबालिकाको उच्च शिक्षा, व्यापार विस्तार कर्जा वा अन्तर्राष्ट्रिय रेमिट्यान्स सेवा आवश्यक पर्दा हाम्रा सम्पूर्ण सेवा केन्द्रका कर्मचारी साथीहरू सदैव यहाँहरूको सेवामा समर्पित रहनेछन्।',
  },
};

export const INITIAL_CMS_DEPARTMENTS: DepartmentCMS[] = [
  {
    id: 'dept-1',
    nameEn: 'Credit Appraisal & Risk Management Department',
    nameNp: 'कर्जा मूल्याङ्कन तथा जोखिम व्यवस्थापन विभाग',
    headEn: 'Mr. Krishna Prasad Sharma (Senior Credit Officer)',
    headNp: 'श्री कृष्णप्रसाद शर्मा (वरिष्ठ कर्जा अधिकृत)',
    phone: '071-540123 (Ext. 104)',
    email: 'credit@ekatacoop.com.np',
    descriptionEn:
      'Responsible for analyzing member loan applications, conducting independent collateral appraisals, performing credit bureau screening, and supervising portfolio health.',
    descriptionNp:
      'सदस्यहरूको कर्जा माग निवेदन विश्लेषण, स्थलगत धितो मूल्याङ्कन, कर्जा सूचना जाँच तथा ऋण लगानीको सुरक्षा र असुली अनुगमन गर्ने मुख्य विभाग।',
    responsibilitiesEn: [
      'Assessment of agricultural, business, enterprise, and residential mortgages.',
      'Field inspection, property boundary validation, and municipal document verification.',
      'Non-Performing Loan (NPL) containment and continuous borrower counseling.',
      'Regulatory reporting to Cooperative Ministry and Credit Information Center.',
    ],
    responsibilitiesNp: [
      'कृषि, व्यवसाय, उद्योग र घरजग्गा धितो कर्जाको विस्तृत वित्तीय विश्लेषण।',
      'स्थलगत जग्गा तथा घरको नापजाँच, चारकिल्ला र मालपोत श्रेस्ता प्रमाणिकरण।',
      'भाखा नाघेको ऋण नियन्त्रण तथा ऋणी सदस्यहरूलाई वित्तीय परामर्श।',
      'सहकारी विभाग तथा कर्जा सूचना केन्द्रमा आवधिक प्रतिवेदन सम्प्रेषण।',
    ],
    sortOrder: 1,
  },
  {
    id: 'dept-2',
    nameEn: 'Finance, Accounts & Compliance Department',
    nameNp: 'वित्त, लेखा तथा परिपालना विभाग',
    headEn: 'Mrs. Sunita Pandey, MBS (Chief Accountant)',
    headNp: 'श्रीमती सुनिता पाण्डे (प्रमुख लेखापाल)',
    phone: '071-540123 (Ext. 102)',
    email: 'accounts@ekatacoop.com.np',
    descriptionEn:
      'Oversees statutory financial ledgers, balance sheet reconciliation, tax deductions (TDS), regulatory compliance, annual budgeting, and internal liquidity reserves.',
    descriptionNp:
      'संस्थाको दैनिक वित्तीय हिसाबकिताब, वासलात मिलान, कर कट्टी (TDS), वैधानिक परिपालना, वार्षिक बजेट तथा तरलता व्यवस्थापन गर्ने जिम्मेवार विभाग।',
    responsibilitiesEn: [
      'Preparation of daily Trial Balance, Profit & Loss, and Balance Sheet.',
      'Liquidity tracking ensuring minimum 15% statutory cash reserve ratio (CRR).',
      'Coordination with external Chartered Accountants during statutory audits.',
      'Accurate tax filings and payment of government revenue dues on time.',
    ],
    responsibilitiesNp: [
      'दैनिक वासलात, नाफा-नोक्सान र नगद प्रवाहको वास्तविक-समय अभिलेख।',
      'संस्थामा कम्तीमा १५% अनिवार्य तरलता अनुपात (CRR) को दैनिक व्यवस्थापन।',
      'बाह्य चार्टर्ड एकाउन्ट्यान्टहरूसँग समन्वय गरी निष्पक्ष लेखापरीक्षण सम्पन्न गर्ने।',
      'समयमै सरकारी राजस्व, आयकर तथा कर विवरणहरू दाखिला गर्ने कार्य।',
    ],
    sortOrder: 2,
  },
  {
    id: 'dept-3',
    nameEn: 'Information Technology & Digital Banking Division',
    nameNp: 'सूचना प्रविधि तथा डिजिटल बैंकिङ विभाग',
    headEn: 'Er. Sujan Adhikari, B.E. Computer (IT Lead)',
    headNp: 'इन्जि. सुजन अधिकारी (सूचना प्रविधि प्रमुख)',
    phone: '071-540123 (Ext. 108)',
    email: 'it@ekatacoop.com.np',
    descriptionEn:
      'Drives CBS infrastructure, mobile app uptime, NepalPay QR merchant network, automated SMS alerts, and cyber security safeguards.',
    descriptionNp:
      'कोर बैंकिङ सफ्टवेयर सञ्चालन, मोबाइल बैंकिङ एप, नेपालपे क्युआर नेटवर्क, एसएमएस अलर्ट र साइबर सुरक्षाको सम्पूर्ण प्राविधिक व्यवस्थापन।',
    responsibilitiesEn: [
      '24/7 CBS server maintenance and automated off-site database backups.',
      'Mobile banking onboarding, password/PIN assistance, and QR deployments.',
      'End-to-end data encryption and strict network access control policies.',
      'Real-time disaster recovery testing and failover system integrity.',
    ],
    responsibilitiesNp: [
      '२४सै घण्टा कोर बैंकिङ सर्भर सञ्चालन तथा दैनिक स्वचालित सुरक्षित ब्याकअप।',
      'सदस्य मोबाइल एप व्यवस्थापन, पिन रिसेट तथा बजारमा क्युआर कोड वितरण।',
      'डाटा इन्क्रिप्शन तथा अनधिकृत पहुँच नियन्त्रणका लागि साइबर सुरक्षा।',
      'विपद् व्यवस्थापन (DR Site) तयारी र प्रणालीको उच्च विश्वसनीयता।',
    ],
    sortOrder: 3,
  },
  {
    id: 'dept-4',
    nameEn: 'Member Relations, eKYM & Front Office Division',
    nameNp: 'सदस्य सेवा, eKYM तथा ग्राहक सम्बन्ध विभाग',
    headEn: 'Mr. Deepak Thapa (Customer Relations Manager)',
    headNp: 'श्री दीपक थापा (सदस्य सेवा प्रबन्धक)',
    phone: '071-540123 (Ext. 101)',
    email: 'members@ekatacoop.com.np',
    descriptionEn:
      'Directly handles member onboarding, online eKYM digital verification, share certificate issuance, passbook printing, and prompt teller services.',
    descriptionNp:
      'नयाँ सदस्यता दर्ता, अनलाइन eKYM डिजिटल प्रमाणिकरण, शेयर प्रमाणपत्र वितरण, पासबुक अध्यावधिक र काउन्टर सेवा सहजीकरण गर्ने विभाग।',
    responsibilitiesEn: [
      'New member registration and biometric digital identity verification.',
      'Immediate cash deposit and withdrawal counter services with high courtesy.',
      'Instant issuance of Cheque Books and Statement Account summaries.',
      'Member grievance registration, feedback gathering, and resolution.',
    ],
    responsibilitiesNp: [
      'नयाँ सदस्य दर्ता तथा बायोमेट्रिक डिजिटल eKYM रुजु र स्वीकृत।',
      'काउन्टरमा छिटोछरितो र मर्यादित नगद जम्मा तथा भुक्तानी सेवा।',
      'तुरुन्तै चेकबुक जारी तथा खाताको कारोबार स्टेटमेन्ट प्रिन्टिङ।',
      'सदस्यहरूका गुनासो सुनुवाइ तथा समस्याको तत्काल समाधान।',
    ],
    sortOrder: 4,
  },
  {
    id: 'dept-5',
    nameEn: 'Internal Audit & Regulatory Compliance Unit',
    nameNp: 'आन्तरिक लेखापरीक्षण तथा अनुगमन विभाग',
    headEn: 'Mr. Manoj Poudel (Head of Internal Audit)',
    headNp: 'श्री मनोज पौडेल (आन्तरिक लेखापरीक्षण प्रमुख)',
    phone: '071-540123 (Ext. 106)',
    email: 'audit@ekatacoop.com.np',
    descriptionEn:
      'Operates independently under the direct supervision of the elected Audit & Inspection Committee to inspect daily transactions and regulatory norms.',
    descriptionNp:
      'निर्वाचित लेखा सुपरिवेक्षण समितिको प्रत्यक्ष मातहतमा रही संस्थाका दैनिक आर्थिक कारोबार, नियमनकारी ऐन र आन्तरिक कार्यविधिको सूक्ष्म अनुगमन गर्ने विभाग।',
    responsibilitiesEn: [
      'Quarterly unannounced inspection of cash vaults and teller drawer balances.',
      'Sampling of loan files for mortgage document sufficiency and loan covenant compliance.',
      'Review of procurement vouchers, expenses, and administrative budgets.',
      'Direct submission of confidential oversight reports to the Supervisory Committee.',
    ],
    responsibilitiesNp: [
      'काउन्टर तथा मुख्य भल्टमा रहेको नगद मौज्दातको आकस्मिक जाँच।',
      'कर्जा फाइलहरूको धितो कागजपत्र, दृष्टिबन्धक र कानुनी प्रक्रियाको परीक्षण।',
      'संस्थाको खर्च, खरिद प्रक्रिया र वार्षिक बजेट सीमाको अडिट।',
      'लेखा समितिलाई प्रत्यक्ष रूपमा आवधिक गोप्य प्रतिवेदन पेस गर्ने।',
    ],
    sortOrder: 5,
  },
];

export const INITIAL_CMS_SERVICE_CENTERS: ServiceCenterCMS[] = [
  {
    id: 'center-1',
    nameEn: 'Central Head Office & Main Banking Hall',
    nameNp: 'केन्द्रीय कार्यालय तथा मुख्य बैंकिङ भवन',
    code: 'BTL-01',
    addressEn: 'Main Road, Traffic Chowk, Butwal-4, Rupandehi, Nepal',
    addressNp: 'मुख्य सडक, ट्राफिक चोक, बुटवल-४, रुपन्देही, नेपाल',
    managerEn: 'Mr. Ramesh Kumar Gautam (CEO / Head Office In-charge)',
    managerNp: 'श्री रमेश कुमार गौतम (प्रमुख कार्यकारी अधिकृत)',
    phone: '071-540123, 071-540456',
    email: 'headoffice@ekatacoop.com.np',
    operatingHours: 'Sunday - Friday: 10:00 AM - 5:00 PM (Cash Counter till 4:00 PM)',
    mapUrl: 'https://maps.google.com/?q=Butwal+Traffic+Chowk+Ankur+Cooperative',
    servicesProvidedEn: [
      'All Deposit & Loan Schemes',
      'eKYM Digital Onboarding Desk',
      'Corporate Remittance Hub',
      'Board & Executive Management Office',
      'Locker & Vault Storage Facility',
    ],
    servicesProvidedNp: [
      'सम्पूर्ण बचत तथा उत्पादनशील कर्जा सेवा',
      'अनलाइन eKYM डिजिटल प्रमाणिकरण डेस्क',
      'अन्तर्राष्ट्रिय रेमिट्यान्स तथा क्युआर सेवा',
      'सञ्चालक समिति तथा प्रशासनिक सेवा',
      'सुरक्षित लकर तथा भल्ट सुविधा',
    ],
    sortOrder: 1,
  },
  {
    id: 'center-2',
    nameEn: 'Milanchowk Service Center & Business Desk',
    nameNp: 'मिलनचोक सेवा केन्द्र तथा व्यापारिक डेस्क',
    code: 'BTL-02',
    addressEn: 'Siddhartha Highway, Milanchowk, Butwal-8, Rupandehi',
    addressNp: 'सिद्धार्थ राजमार्ग, मिलनचोक, बुटवल-८, रुपन्देही',
    managerEn: 'Mr. Prakash Shrestha (Branch In-charge)',
    managerNp: 'श्री प्रकाश श्रेष्ठ (शाखा प्रमुख)',
    phone: '071-542345, 9857012345',
    email: 'milanchowk@ekatacoop.com.np',
    operatingHours: 'Sunday - Friday: 10:00 AM - 5:00 PM (Cash Counter till 4:00 PM)',
    mapUrl: 'https://maps.google.com/?q=Milanchowk+Butwal+Ankur+Cooperative',
    servicesProvidedEn: [
      'SME & Retail Business Loans',
      'Daily Pigmy Market Savings Collection',
      'Prabhu & IME Remittance Payout',
      'NepalPay QR Merchant Deployment',
    ],
    servicesProvidedNp: [
      'साना तथा मझौला व्यापार व्यवसाय कर्जा',
      'दैनिक बजार बचत संकलन सेवा',
      'प्रभु, आइएमई तथा वेस्टर्न युनियन रेमिट्यान्स',
      'नेपालपे क्युआर मर्चेन्ट भुक्तानी सेवा',
    ],
    sortOrder: 2,
  },
  {
    id: 'center-3',
    nameEn: 'Golpark Service Center & Northern Counter',
    nameNp: 'गोलपार्क सेवा केन्द्र तथा उत्तरी काउन्टर',
    code: 'BTL-03',
    addressEn: 'Golpark Chowk, Ward No. 3, Butwal, Rupandehi',
    addressNp: 'गोलपार्क चोक, वडा नं. ३, बुटवल, रुपन्देही',
    managerEn: 'Mrs. Maya Devi Karki (Branch In-charge)',
    managerNp: 'श्रीमती मायादेवी कार्की (शाखा प्रमुख)',
    phone: '071-543456, 9857023456',
    email: 'golpark@ekatacoop.com.np',
    operatingHours: 'Sunday - Friday: 10:00 AM - 4:30 PM (Cash Counter till 3:30 PM)',
    mapUrl: 'https://maps.google.com/?q=Golpark+Butwal+Ankur+Cooperative',
    servicesProvidedEn: [
      'Agricultural & Livestock Credit Counseling',
      'Regular & Term Deposit Schemes',
      'Member Welfare & Insurance Claims Desk',
      'Utility Bill Payments Counter',
    ],
    servicesProvidedNp: [
      'कृषि तथा पशुपालन कर्जा परामर्श',
      'साधारण तथा आवधिक मुद्दती बचत योजना',
      'सदस्य कल्याण कोष तथा बिमा दाबी डेस्क',
      'खानेपानी र विद्युत महसुल भुक्तानी काउन्टर',
    ],
    sortOrder: 3,
  },
  {
    id: 'center-4',
    nameEn: 'Amarpath Commercial Extension Counter',
    nameNp: 'अमरपथ व्यापारिक सेवा काउन्टर',
    code: 'BTL-04',
    addressEn: 'Amarpath Commercial Market, Ward No. 4, Butwal',
    addressNp: 'अमरपथ मुख्य बजार, वडा नं. ४, बुटवल, रुपन्देही',
    managerEn: 'Mr. Bikash Aryal (Extension Officer)',
    managerNp: 'श्री विकास अर्याल (काउन्टर अधिकृत)',
    phone: '071-545678, 9857034567',
    email: 'amarpath@ekatacoop.com.np',
    operatingHours: 'Sunday - Friday: 10:30 AM - 5:30 PM (Evening Market Counter)',
    mapUrl: 'https://maps.google.com/?q=Amarpath+Butwal+Ankur+Cooperative',
    servicesProvidedEn: [
      'Evening Market Cash Deposit Collection',
      'Retail Merchant Digital Transactions',
      'Instant Account Passbook Updates',
    ],
    servicesProvidedNp: [
      'साँझको बजार नगद संकलन सेवा',
      'खुदरा व्यापारी डिजिटल क्युआर भुक्तानी',
      'तत्काल खाता पासबुक तथा स्टेटमेन्ट प्रिन्टिङ',
    ],
    sortOrder: 4,
  },
];

export const INITIAL_CMS_REPORTS: ReportCMS[] = [
  {
    id: 'rep-1',
    titleEn: '24th Annual General Meeting (AGM) Comprehensive Annual Report 2080/81',
    titleNp: '२४औं वार्षिक साधारण सभाको विस्तृत वार्षिक प्रतिवेदन तथा वासलात पुस्तक (आ.व. २०८०/८१)',
    category: 'annual',
    fiscalYear: '2080/81 B.S.',
    fileSize: '4.8 MB',
    fileUrl: '/downloads/reports/ekata-24th-annual-report.pdf',
    publishDate: 'Ashwin 2081 B.S.',
    descriptionEn:
      'Complete audited financial statements, Board Chairman report, CEO operational review, audit committee findings, and 15.5% dividend resolution passed by the AGM.',
    descriptionNp:
      'सञ्चालक समितिको प्रतिवेदन, प्रमुख कार्यकारी अधिकृतको कार्य समीक्षा, लेखा सुपरिवेक्षण प्रतिवेदन तथा साधारण सभाबाट पारित १५.५% लाभांश सम्बन्धी आधिकारिक पुस्तक।',
  },
  {
    id: 'rep-2',
    titleEn: 'Independent Statutory Auditor Report & Final Financial Statements',
    titleNp: 'स्वतन्त्र वैधानिक लेखापरीक्षकको प्रतिवेदन तथा प्रमाणित वित्तीय विवरण',
    category: 'audit',
    fiscalYear: '2080/81 B.S.',
    fileSize: '3.2 MB',
    fileUrl: '/downloads/reports/ekata-statutory-audit-2080-81.pdf',
    publishDate: 'Bhadra 2081 B.S.',
    descriptionEn:
      'Unqualified audit opinion issued by registered Chartered Accountants confirming strict adherence to Nepal Financial Reporting Standards (NFRS) and Cooperative Directives.',
    descriptionNp:
      'नेपाल चार्टर्ड एकाउन्ट्यान्ट्स संस्था (ICAN) का दर्तावाल लेखापरीक्षकद्वारा जारी गरिएको बिना कैफियतको स्वच्छ लेखापरीक्षण प्रतिवेदन।',
  },
  {
    id: 'rep-3',
    titleEn: 'Institutional Bylaws, Governance Guidelines & Service Regulations 2080',
    titleNp: 'अंकुर बचत तथा ऋण सहकारी संस्थाको आधिकारिक विनियम तथा विनियमावली २०८०',
    category: 'bylaws',
    fiscalYear: '2080 Revised',
    fileSize: '2.4 MB',
    fileUrl: '/downloads/reports/ekata-cooperative-bylaws-2080.pdf',
    publishDate: 'Mangsir 2080 B.S.',
    descriptionEn:
      'Approved institutional bylaws covering membership rights, credit appraisal rules, member safety fund guidelines, and election codes of conduct.',
    descriptionNp:
      'सदस्यता अधिकार, ऋण लगानी कार्यविधि, सदस्य सुरक्षा कोष नियमावली तथा लोकतान्त्रिक निर्वाचन आचारसंहिता समेटिएको आधिकारिक विनियम।',
  },
  {
    id: 'rep-4',
    titleEn: 'Quarterly Financial Health & PEARLS Prudential Disclosure (Q4 2080/81)',
    titleNp: 'त्रैमासिक वित्तीय विवरण तथा पर्ल्स (PEARLS) अनुगमन प्रतिवेदन (चौथो त्रैमास)',
    category: 'monthly',
    fiscalYear: '2080/81 Q4',
    fileSize: '1.1 MB',
    fileUrl: '/downloads/reports/ekata-pearls-disclosure-q4.pdf',
    publishDate: 'Shrawan 2081 B.S.',
    descriptionEn:
      'Quarterly disclosure detailing capital adequacy ratio (CAR), delinquency rate (under 1.2%), liquidity ratio (19.4%), and return on equity (ROE).',
    descriptionNp:
      'पुँजी पर्याप्तता कोष, निष्क्रिय कर्जा अनुपात (१.२% भन्दा कम), तरलता अनुपात (१९.४%) र कुल शेयर प्रतिफल सम्बन्धी सार्वजनिक वित्तीय विवरण।',
  },
  {
    id: 'rep-5',
    titleEn: 'Official Membership & eKYM Verification Physical Form (Downloadable)',
    titleNp: 'नयाँ सदस्यता आवेदन तथा भौतिक eKYM फाराम (डाउनलोड गर्नुहोस्)',
    category: 'form',
    fiscalYear: 'Current 2081/82',
    fileSize: '850 KB',
    fileUrl: '/downloads/forms/ekata-membership-ekym-form.pdf',
    publishDate: 'Baishakh 2081 B.S.',
    descriptionEn:
      'Official printable PDF form for offline membership requests, share application, and nominee declaration.',
    descriptionNp:
      'काउन्टरमा बुझाउन मिल्ने नयाँ शेयर सदस्यता, इच्छाएको व्यक्ति घोषणा तथा खाता खोल्ने आधिकारिक प्रिन्टयोग्य फाराम।',
  },
];

export const INITIAL_CMS_CAREERS: CareerCMS[] = [
  {
    id: 'job-1',
    jobTitleEn: 'Senior Credit & Risk Evaluation Officer',
    jobTitleNp: 'वरिष्ठ कर्जा तथा जोखिम मूल्याङ्कन अधिकृत',
    department: 'Credit Appraisal & Risk Department',
    positionsCount: 2,
    deadline: '2081 Kartik 15 (November 2024)',
    employmentType: 'Full Time',
    experience: 'Minimum 3 years in Bank or Financial Cooperative credit department',
    education: 'Bachelor Degree in Business Administration (BBA) / BBS / MBS or equivalent',
    descriptionEn:
      'We are looking for a proactive Credit Officer responsible for analyzing business and agricultural loan proposals, inspecting mortgages, assessing repayment capacity, and ensuring regulatory compliance.',
    descriptionNp:
      'सहकारी वा बैंक तथा वित्तीय संस्थामा कर्जा विश्लेषण तथा धितो मूल्याङ्कन सम्बन्धी कम्तीमा ३ वर्षको अनुभव भएका दक्ष अधिकृतको आवश्यकता छ।',
    requirementsEn: [
      'In-depth knowledge of land registration, four-boundary mortgage procedures, and credit appraisal.',
      'Proficiency with Core Banking Software (CBS) and Excel financial modeling.',
      'Valid driving license (Two-wheeler is mandatory).',
      'Strong Nepali and English written and verbal communication skills.',
    ],
    requirementsNp: [
      'मालपोत रोक्का, दृष्टिबन्धक, चारकिल्ला प्रमाणिकरण र कर्जा तमसुक सम्बन्धी पूर्ण ज्ञान।',
      'कोर बैंकिङ सफ्टवेयर तथा कम्प्युटरमा पोख्त।',
      'दुई पाङ्ग्रे सवारी चालक अनुमतिपत्र (लाइसेन्स) भएको।',
      'नेपाली तथा अंग्रेजी भाषामा स्पष्ट संवाद र प्रतिवेदन लेखन दक्षता।',
    ],
    status: 'Open',
  },
  {
    id: 'job-2',
    jobTitleEn: 'Assistant IT & Digital Banking Specialist',
    jobTitleNp: 'सहायक सूचना प्रविधि तथा डिजिटल बैंकिङ अधिकृत',
    department: 'IT & Digital Banking Division',
    positionsCount: 1,
    deadline: '2081 Kartik 20 (November 2024)',
    employmentType: 'Full Time',
    experience: '1-2 years experience in IT support, database management or network systems',
    education: 'BSc. CSIT / BCA / BIT or equivalent computer degree',
    descriptionEn:
      'Responsible for daily CBS database operations, network security, QR code merchant integration, hardware maintenance, and digital banking member support.',
    descriptionNp:
      'कोर बैंकिङ सफ्टवेयर सञ्चालन, सर्भर नेटवर्क सुरक्षा, क्युआर मर्चेन्ट व्यवस्थापन तथा डिजिटल बैंकिङ प्राविधिक सहायताका लागि।',
    requirementsEn: [
      'Hands-on experience with SQL databases, Windows Server, and local network routers.',
      'Familiarity with digital payment gateways (NepalPay, QR, API integrations).',
      'Quick problem-solving skills for branch hardware, printers, and teller workstations.',
    ],
    requirementsNp: [
      'एसक्युएल (SQL) डाटाबेस, विन्डोज सर्भर र लोकल नेटवर्क सम्बन्धी व्यवहारिक ज्ञान।',
      'डिजिटल भुक्तानी प्रणाली तथा क्युआर कोड इन्टिग्रेसनमा अनुभव।',
      'शाखा कम्प्युटर तथा प्रिन्टर मर्मत सम्भारमा छिटो समाधान दिन सक्ने।',
    ],
    status: 'Open',
  },
  {
    id: 'job-3',
    jobTitleEn: 'Branch Cashier & Front Desk Teller',
    jobTitleNp: 'शाखा क्यासियर तथा फ्रन्ट डेस्क टेलर',
    department: 'Member Relations & Tellering Desk',
    positionsCount: 3,
    deadline: '2081 Kartik 25 (November 2024)',
    employmentType: 'Full Time',
    experience: 'Fresh graduates encouraged; 1 year cashiering experience preferred',
    education: '+2 in Management / Commerce or Bachelor (BBS / BBA)',
    descriptionEn:
      'Responsible for handling member cash deposits, processing withdrawal slips, updating passbooks, issuing account balances, and greeting members with warmth and efficiency.',
    descriptionNp:
      'काउन्टरमा सदस्यहरूको नगद जम्मा तथा भुक्तानी, पासबुक इन्ट्री, स्टेटमेन्ट प्रिन्टिङ र मर्यादित ग्राहक सेवा प्रवाह गर्न।',
    requirementsEn: [
      'High numerical accuracy and genuine currency note verification knowledge.',
      'Pleasant personality, patience, and customer-first service ethos.',
      'Basic knowledge of typing in both Nepali (Preeti/Unicode) and English.',
    ],
    requirementsNp: [
      'नगद कारोबारमा उच्च सतर्कता तथा जाली नोट पहिचान सम्बन्धी ज्ञान।',
      'शिष्ट बोली, विनम्र व्यवहार तथा ग्राहक सेवामा लगनशीलता।',
      'नेपाली युनिकोड र अंग्रेजी टाइपिङमा दक्षता।',
    ],
    status: 'Open',
  },
];

export const INITIAL_CMS_PRIVACY_POLICY: PrivacyPolicyCMS = {
  titleEn: 'Privacy Policy & Member Data Protection Guidelines',
  titleNp: 'गोपनीयता नीति तथा सदस्य तथ्याङ्क सुरक्षा निर्देशिका',
  lastUpdated: '2081 Ashwin (October 2024)',
  sections: [
    {
      headingEn: '1. Institutional Commitment to Member Privacy',
      headingNp: '१. गोपनीयता तथा सदस्य सुरक्षा प्रतिबद्धता',
      bodyEn:
        'Ankur Saving & Credit Cooperative Ltd. is firmly committed to safeguarding the personal and financial privacy of every member shareholder. Operating in strict conformity with the Cooperative Act 2074, Nepal Privacy Act 2075, and regulatory prudential norms, we ensure that member information is preserved with fiduciary care.',
      bodyNp:
        'अंकुर बचत तथा ऋण सहकारी संस्था लि. सहकारी ऐन २०७४, वैयक्तिक गोपनीयता सम्बन्धी ऐन २०७५ तथा नियामक निकायका वित्तीय मापदण्डहरू बमोजिम आफ्ना सम्पूर्ण सेयर सदस्यहरूको व्यक्तिगत तथा वित्तीय विवरणको उच्च सुरक्षा र गोपनीयता कायम राख्न दृढ संकल्पित छ।',
    },
    {
      headingEn: '2. Information Collected & KYC / eKYM Verification',
      headingNp: '२. संकलित विवरण तथा eKYM प्रमाणीकरण',
      bodyEn:
        'To establish verified membership, maintain Core Banking Software (CBS) ledgers, prevent money laundering (AML/CFT), and disburse loan funds, we collect lawful details including citizenship numbers, biometric photographs, source of funds declarations, family genealogy, and tax compliance records.',
      bodyNp:
        'सदस्य पहिचान (eKYM), कोर बैंकिङ सफ्टवेयर (CBS) खाता सञ्चालन, सम्पत्ति शुद्धीकरण (AML) निवारण र कर्जा लगानी प्रयोजनका लागि नागरिकता नम्बर, फोटो, तीन पुस्ते विवरण तथा आयस्रोत सम्बन्धी आवश्यक कानुनी विवरण संकलन गरिन्छ।',
    },
    {
      headingEn: '3. Data Security, Non-Disclosure & Confidentiality',
      headingNp: '३. तथ्याङ्क सुरक्षा तथा गैर-प्रकटीकरण',
      bodyEn:
        'We never sell, trade, or distribute your private contact or financial balance information to external marketing agencies or commercial third parties. Disclosure only occurs when required by law under official court warrant or authorized state regulatory audits.',
      bodyNp:
        'हामी कुनै पनि सदस्यको व्यक्तिगत, टेलिफोन वा बचत तथा ऋण मौज्दात सम्बन्धी जानकारी कुनै पनि बाह्य व्यापारिक संस्थालाई बिक्री वा सम्प्रेषण गर्दैनौं। कानुनी अदालत वा सरकारी नियामक निकायको आधिकारिक आदेश बाहेक सम्पूर्ण विवरण पूर्ण गोप्य रहन्छ।',
    },
    {
      headingEn: '4. Digital Banking, Mobile App & Payment Security',
      headingNp: '४. डिजिटल बैंकिङ तथा अनलाइन भुक्तानी सुरक्षा',
      bodyEn:
        'Our digital mobile application and web portals employ TLS 256-bit bank-grade SSL encryption, biometric login tokens, and time-sensitive SMS OTP verification to prevent unauthorized account access and secure electronic transfers.',
      bodyNp:
        'हाम्रो स्मार्ट मोबाइल बैंकिङ र अनलाइन पोर्टलमा २५६-बिट ईन्क्रिप्शन, बायोमेट्रिक फिंगरप्रिन्ट लगइन र सुरक्षित एसएमएस ओटिपी प्रविधिको प्रयोग गरिएको छ, जसले अनधिकृत पहुँचबाट खातालाई पूर्ण सुरक्षा प्रदान गर्दछ।',
    },
    {
      headingEn: '5. Grievance Redressal & Compliance Inquiries',
      headingNp: '५. गुनासो सुनुवाइ तथा सम्पर्क',
      bodyEn:
        'If you have questions, wish to inspect your registered records, or need clarification regarding our privacy practices, contact our Senior Compliance Officer at grievance@ekatacoop.com.np or telephone 071-540123 (Ext. 106).',
      bodyNp:
        'गोपनीयता नीति सम्बन्धी कुनै सुझाव, विवरण संशोधन वा गुनासो भएमा हाम्रा वरिष्ठ अनुपालन अधिकृतलाई grievance@ekatacoop.com.np वा फोन ०७१-५४०१२३ (एक्स्टेन्सन १०६) मा सम्पर्क गर्न सक्नुहुनेछ।',
    },
  ],
};

export const INITIAL_CMS_SOCIAL_LINKS: SocialLinksCMS = {
  facebook: 'https://facebook.com/ekatacooperative.butwal',
  twitter: 'https://twitter.com/ekatacoop_np',
  instagram: 'https://instagram.com/ekatacooperative',
  youtube: 'https://youtube.com/@ekatacooperative',
  linkedin: 'https://linkedin.com/company/ekata-cooperative',
  whatsapp: '9857099441',
  tiktok: 'https://tiktok.com/@ekatacoop',
};

export const INITIAL_CMS_BRAND_THEME: BrandThemeCMS = {
  themePreset: 'cyan',
  primaryColor: '#0981ae',
  primaryHover: '#07678d',
  primaryLight: '#eef8fc',
  secondaryColor: '#0cb3f0',
  accentColor: '#0284c7',
  headerBg: '#0981ae',
  topbarBg: '#052636',
};

export const INITIAL_CMS_DOCUMENTS: DocumentItemCMS[] = [
  {
    id: 'doc-1',
    titleEn: '24th Annual General Meeting (AGM) Comprehensive Annual Report 2080/81',
    titleNp: '२४औं वार्षिक साधारण सभाको विस्तृत वार्षिक प्रतिवेदन पुस्तक (आ.व. २०८०/८१)',
    category: 'reports',
    fiscalYear: '2080/81 B.S.',
    fileSize: '4.8 MB',
    fileUrl: '/uploads/documents/ekata-annual-report-2080-81.pdf',
    publishDate: 'Ashwin 2081 B.S.',
    descriptionEn: 'Audited balance sheets, Board report, supervisory committee audit and dividend distribution statement.',
    descriptionNp: 'लेखापरीक्षित वासलात, सञ्चालक समिति प्रतिवेदन र लाभांश वितरण सम्बन्धी आधिकारिक पुस्तक।'
  },
  {
    id: 'doc-2',
    titleEn: 'Independent Statutory Chartered Accountant Audit Report (FY 2080/81)',
    titleNp: 'स्वतन्त्र वैधानिक लेखापरीक्षकको प्रतिवेदन तथा वासलात विवरण (आ.व. २०८०/८१)',
    category: 'reports',
    fiscalYear: '2080/81 B.S.',
    fileSize: '3.2 MB',
    fileUrl: '/uploads/documents/ekata-statutory-audit-2080-81.pdf',
    publishDate: 'Bhadra 2081 B.S.',
    descriptionEn: 'Unqualified statutory audit opinion issued by registered Chartered Accountants under NFRS norms.',
    descriptionNp: 'नेपाल चार्टर्ड एकाउन्ट्यान्ट्स संस्था (ICAN) का दर्तावाल लेखापरीक्षकद्वारा जारी गरिएको आधिकारिक लेखापरीक्षण प्रतिवेदन।'
  },
  {
    id: 'doc-3',
    titleEn: 'Approved Institutional Bylaws & Governance Regulations 2080 (Viniyamavali)',
    titleNp: 'संस्थाको स्वीकृत विनियम तथा विनियमावली २०८०',
    category: 'bylaws',
    fiscalYear: '2080 Revised',
    fileSize: '2.4 MB',
    fileUrl: '/uploads/documents/ekata-cooperative-bylaws-2080.pdf',
    publishDate: 'Mangsir 2080 B.S.',
    descriptionEn: 'Official bylaws governing share capital, savings accounts, credit appraisal, and member rights.',
    descriptionNp: 'सेयर पुँजी, बचत खाता, कर्जा लगानी तथा सदस्य अधिकार सम्बन्धी आधिकारिक विनियम।'
  },
  {
    id: 'doc-4',
    titleEn: 'Member Account Opening & eKYM Verification Physical Application Form',
    titleNp: 'नयाँ सदस्यता तथा भौतिक eKYM फाराम (डाउनलोड)',
    category: 'forms',
    fiscalYear: 'Current 2081/82',
    fileSize: '850 KB',
    fileUrl: '/uploads/documents/ekata-membership-ekym-form.pdf',
    publishDate: 'Baishakh 2081 B.S.',
    descriptionEn: 'Printable application form for offline counter submission, share issuance, and nominee registration.',
    descriptionNp: 'काउन्टरमा बुझाउन मिल्ने नयाँ शेयर सदस्यता तथा खाता खोल्ने आधिकारिक प्रिन्टयोग्य फाराम।'
  },
  {
    id: 'doc-5',
    titleEn: 'Cooperative Department PEARLS Prudential Standards & Supervision Directives',
    titleNp: 'सहकारी विभाग पर्ल्स (PEARLS) अनुगमन तथा वित्तीय मापदण्ड निर्देशिका',
    category: 'directives',
    fiscalYear: '2081 Directive',
    fileSize: '1.6 MB',
    fileUrl: '/uploads/documents/cooperative-pearls-directives.pdf',
    publishDate: 'Jestha 2081 B.S.',
    descriptionEn: 'Prudential norms, capital adequacy directives and risk management guidelines followed by Ankur Cooperative.',
    descriptionNp: 'पुँजी पर्याप्तता, तरलता व्यवस्थापन र कर्जा जोखिम सम्बन्धी कानुनी वित्तीय निर्देशिका।'
  }
];

export const INITIAL_CMS_NEWS_ACTIVITIES: NewsActivityItemCMS[] = [
  {
    id: 'news-1',
    titleEn: '25th Annual General Meeting (AGM) Notice & Dividend Distribution Schedule',
    titleNp: '२५औं वार्षिक साधारण सभा सम्बन्धी सूचना तथा लाभांश वितरण तालिका',
    category: 'AGM',
    publishDate: '2081 Kartik 12 (October 28, 2024)',
    locationEn: 'Butwal City Hall, Butwal-10, Rupandehi',
    locationNp: 'बुटवल सिटी हल, बुटवल-१०, रुपन्देही',
    summaryEn: 'Official notice calling all shareholder members to attend the 25th Annual General Meeting for approval of the FY 2080/81 audit report and 15% dividend payout.',
    summaryNp: 'आ.व. २०८०/८१ को लेखापरीक्षण प्रतिवेदन पारित तथा १५% सेयर लाभांश वितरण प्रस्ताव स्वीकृतिका लागि सम्पूर्ण सेयर सदस्यहरूलाई २५औं वार्षिक साधारण सभामा उपस्थितिको लागि हार्दिक अनुरोध।',
    imageUrl: '/uploads/media/slide-banking.svg',
    highlightsEn: [
      '15% Share Dividend and Patronage Refund approved for distribution.',
      'Free health screening desk and senior member felicitation at the venue.',
      'Attendance pass and AGM report book distributed at all branch counters.'
    ],
    highlightsNp: [
      '१५% सेयर लाभांश तथा संरक्षित पुँजी फिर्ता कोष वितरण प्रस्ताव।',
      'सभा स्थलमा निःशुल्क स्वास्थ्य परीक्षण तथा ज्येष्ठ सदस्य सम्मान कार्यक्रम।',
      'सबै सेवा केन्द्रहरूबाट साधारण सभा प्रवेश पास तथा प्रतिवेदन वितरण सुरु।'
    ],
    status: 'Published'
  },
  {
    id: 'news-2',
    titleEn: 'Free Community Health & Blood Donation Camp Concluded in Butwal',
    titleNp: 'बुटवलमा बृहत् निःशुल्क स्वास्थ्य शिविर तथा रक्तदान कार्यक्रम सम्पन्न',
    category: 'CSR',
    publishDate: '2081 Ashwin 22 (October 8, 2024)',
    locationEn: 'Head Office Premises, Traffic Chowk, Butwal',
    locationNp: 'केन्द्रीय कार्यालय परिसर, ट्राफिक चोक, बुटवल',
    summaryEn: 'Under our Corporate Social Responsibility (CSR) initiative, 145 pints of blood were collected and 420+ senior citizens received free diabetes and cardiac checkups.',
    summaryNp: 'संस्थागत सामाजिक उत्तरदायित्व (CSR) अन्तर्गत आयोजित शिविरमा १४५ युनिट रगत संकलन हुनुका साथै ४२० भन्दा बढी ज्येष्ठ नागरिक तथा सदस्यहरूको निःशुल्क स्वास्थ्य परीक्षण सम्पन्न भयो।',
    imageUrl: '/uploads/media/slide-deposits.svg',
    highlightsEn: [
      '145 pints of blood donated to Nepal Red Cross Society Blood Bank, Butwal.',
      '420+ community members received free blood sugar, ECG, and eye checkups.',
      'Free essential medicines distributed in collaboration with Lumbini Provincial Hospital doctors.'
    ],
    highlightsNp: [
      'नेपाल रेडक्रस सोसाइटी रक्तसञ्चार केन्द्र बुटवललाई १४५ पिन्ट रगत हस्तान्तरण।',
      '४२० जनाभन्दा बढी सदस्यहरूको मधुमेह, रक्तचाप, ईसीजी तथा आँखा परीक्षण सम्पन्न।',
      'विशेषज्ञ चिकित्सकहरूको परामर्श र निःशुल्क औषधि वितरण।'
    ],
    status: 'Published'
  },
  {
    id: 'news-3',
    titleEn: 'Digital Financial Literacy & Women Entrepreneurship Workshop',
    titleNp: 'डिजिटल वित्तीय साक्षरता तथा महिला उद्यमशीलता तालिम सम्पन्न',
    category: 'Activity',
    publishDate: '2081 Bhadra 18 (September 3, 2024)',
    locationEn: 'Manigram Service Center Hall, Tilottama',
    locationNp: 'मणिग्राम सेवा केन्द्र सभाहल, तिलोत्तमा',
    summaryEn: 'Over 180 women entrepreneurs participated in a 2-day intensive training on small business bookkeeping, QR digital payments, and subsidized agro-enterprise credit.',
    summaryNp: '१८० भन्दा बढी महिला उद्यमी सेयर सदस्यहरूको सहभागितामा व्यावसायिक लेखापालन, सुरक्षित मोबाइल बैंकिङ र सहुलियतपूर्ण उद्यम कर्जा सम्बन्धी २ दिने तालिम सम्पन्न।',
    imageUrl: '/uploads/media/gallery-tech.svg',
    highlightsEn: [
      'Hands-on training on NepalPay QR merchant transactions and cybersecurity.',
      'Guidance on preparing business plans for concessional micro-enterprise loans.',
      'Certificates awarded to 180 participating women member entrepreneurs.'
    ],
    highlightsNp: [
      'नेपालपे क्युआर मर्चेन्ट भुक्तानी तथा डिजिटल सुरक्षा सम्बन्धी प्रयोगात्मक प्रशिक्षण।',
      'सहुलियतपूर्ण लघु उद्यम कर्जाका लागि व्यावसायिक योजना तर्जुमा मार्गदर्शन।',
      'सहभागी १८० महिला सदस्यहरूलाई प्रमाणपत्र वितरण।'
    ],
    status: 'Published'
  },
  {
    id: 'news-4',
    titleEn: 'Best Saver & Progressive Farmer Member Felicitation Program 2081',
    titleNp: 'उत्कृष्ट बचतकर्ता तथा प्रगतिशील कृषक सदस्य सम्मान कार्यक्रम २०८१',
    category: 'Event',
    publishDate: '2081 Shrawan 18 (August 2, 2024)',
    locationEn: 'Butwal Head Office Auditorium',
    locationNp: 'केन्द्रीय कार्यालय सभाहल, बुटवल',
    summaryEn: 'On the occasion of our 24th Anniversary, Ankur Cooperative honored 24 exemplary regular savers, model dairy farmers, and top academic achiever children of members.',
    summaryNp: 'संस्थाको २४औं स्थापना दिवसको अवसरमा उत्कृष्ट बचतकर्ता, नमुना व्यावसायिक कृषक तथा सदस्यका जेहेन्दार छोराछोरीहरूलाई नगद पुरस्कार र सम्मानपत्रद्वारा सम्मानित गरियो।',
    imageUrl: '/uploads/media/slide-agriculture.svg',
    highlightsEn: [
      '24 exemplary regular savers and prompt loan borrowers honored.',
      'Ankur Merit Scholarship awarded to 12 SEE/Plus-Two topper students of member families.',
      'Special recognition for organic vegetable and livestock entrepreneur members.'
    ],
    highlightsNp: [
      '२४ जना सर्वोत्कृष्ट नियमित बचतकर्ता र असल ऋणी सदस्यहरूलाई सम्मान।',
      'एसईई र कक्षा १२ मा उत्कृष्ट अंक ल्याउने १२ जना सदस्यका सन्ततिलाई छात्रवृत्ति प्रदान।',
      'व्यावसायिक पशुपालन तथा अर्गानिक तरकारी खेती गर्ने नमुना कृषक पुरस्कृत।'
    ],
    status: 'Published'
  }
];

export const INITIAL_CMS_SUGGESTIONS: SuggestionItemCMS[] = [
  {
    id: 'sug-1',
    ticketNo: 'SUG-2081-101',
    senderName: 'Bishnu Prasad पौडेल (Paudel)',
    phone: '9857045112',
    email: 'bishnu.paudel@gmail.com',
    memberCode: 'EK-04128',
    category: 'Digital Banking',
    subject: 'Add NEA Electricity & Khanepani Auto-Pay Option in Mobile App',
    suggestionText: 'It would be very helpful for busy business members if the Ankur Smart Mobile App included an automatic monthly standing instruction for electricity and water bills.',
    submittedAt: '2081-06-14',
    status: 'Implemented',
    adminNotes: 'Integrated auto-bill reminder and one-tap utility payment in v2.4 mobile banking update.',
    isAnonymous: false
  },
  {
    id: 'sug-2',
    ticketNo: 'SUG-2081-102',
    senderName: 'Kamala Devi Shrestha',
    phone: '9847088231',
    email: 'kamala.shrestha@yahoo.com',
    memberCode: 'EK-08219',
    category: 'Branch Facility',
    subject: 'Extend Evening Counter Hours at Traffic Chowk Service Center',
    suggestionText: 'Many retail shopkeepers around Traffic Chowk close their shops after 4:00 PM. An evening deposit collection counter until 5:30 PM on Tuesdays and Fridays would help us deposit daily cash safely.',
    submittedAt: '2081-06-25',
    status: 'Reviewed',
    adminNotes: 'Forwarded to Operations Department and Supervisory Committee for evening teller roster scheduling.',
    isAnonymous: false
  },
  {
    id: 'sug-3',
    ticketNo: 'SUG-2081-103',
    senderName: 'Anonymous Member',
    phone: '9867112098',
    memberCode: 'EK-10204',
    category: 'Loan Process',
    subject: 'Digital SMS Notification at Each Step of Loan File Appraisal',
    suggestionText: 'When applying for an agricultural or SME loan, sending automatic SMS alerts when field valuation is completed and when the credit committee approves the file would save members from calling the office repeatedly.',
    submittedAt: '2081-07-02',
    status: 'New',
    adminNotes: 'Pending review in upcoming fortnightly Internal Supervisory Committee meeting.',
    isAnonymous: true
  }
];

export const INITIAL_CMS_FAQS: FaqItemCMS[] = [
  {
    id: 'faq-1',
    questionEn: 'Who is eligible to become a member of Ankur Saving & Credit Cooperative?',
    questionNp: 'अंकुर बचत तथा ऋण सहकारी संस्थाको सदस्य बन्न के कस्ता योग्यता चाहिन्छ?',
    answerEn: 'Any Nepali citizen aged 16 years or above residing, working, or operating a registered business within our approved service jurisdiction (Rupandehi District / Lumbini Province) can become a shareholder member by submitting a copy of their Citizenship Certificate, 2 passport-size photos, and purchasing a minimum of 10 shares (Rs. 1,000).',
    answerNp: 'संस्थाको कार्यक्षेत्र (रुपन्देही जिल्ला / लुम्बिनी प्रदेश) भित्र स्थायी वा अस्थायी बसोबास गर्ने, पेशा वा व्यवसाय गर्ने १६ वर्ष पूरा भएका नेपाली नागरिकले नागरिकताको प्रमाणपत्रको प्रतिलिपि, २ प्रति पासपोर्ट साइजको फोटो र न्यूनतम १० कित्ता सेयर (रु. १,०००) खरिद गरी सदस्य बन्न सक्नुहुन्छ।',
    category: 'Membership',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'faq-2',
    questionEn: 'How often is interest calculated and credited on savings accounts?',
    questionNp: 'बचत खातामा ब्याज गणना कसरी र कहिले-कहिले जम्मा गरिन्छ?',
    answerEn: 'Interest on all regular and special savings accounts is calculated on the daily closing balance and capitalized (credited directly into your account) every quarter at the end of Ashoj, Poush, Chaitra, and Ashadh.',
    answerNp: 'साधारण तथा विशेष बचत खातामा दैनिक मौज्दात (Daily Balance) का आधारमा ब्याज गणना गरिन्छ र प्रत्येक त्रैमासिक (असोज, पुस, चैत र असार मसान्त) मा स्वतः सदस्यको खातामा ब्याज जम्मा गरिन्छ।',
    category: 'Savings & Deposits',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'faq-3',
    questionEn: 'What is the processing time and required documentation for a loan application?',
    questionNp: 'कर्जा (ऋण) स्वीकृत हुन कति समय लाग्छ र के-के कागजात आवश्यक पर्दछ?',
    answerEn: 'Once complete documents (citizenship, land ownership certificate Lalpurja, four-boundary blueprint, tax receipt, and income proof) are submitted, productive agricultural and business loans are appraised and approved within 3 to 5 working days. Fixed deposit loans are disbursed instantly within 30 minutes.',
    answerNp: 'आवश्यक सम्पूर्ण कागजातहरू (नागरिकता, लालपुर्जा, चारकिल्ला सिफारिस, मालपोत रसिद र आयस्रोत प्रमाण) पेश भएको ३ देखि ५ कार्यदिनभित्र धितो मूल्याङ्कन भई कर्जा स्वीकृत हुन्छ। मुद्दती रसिद धितो कर्जा भने ३० मिनेटमै उपलब्ध गराइन्छ।',
    category: 'Loans & Credit',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'faq-4',
    questionEn: 'How can I activate Ankur Smart Mobile Banking and update my eKYM online?',
    questionNp: 'अंकुर स्मार्ट मोबाइल बैंकिङ कसरी सुचारु गर्ने र अनलाइन eKYM कसरी भर्ने?',
    answerEn: 'You can click the "eKYM Form" button on our website header to fill out your digital KYC verification online, or visit any of our branch service centers to activate Smart Mobile Banking, NepalPay QR, and SMS Alert facilities immediately.',
    answerNp: 'यस वेबसाइटको माथिल्लो भागमा रहेको "eKYM Form" मा क्लिक गरी घरमै बसेर अनलाइन केवाइसी अद्यावधिक गर्न सकिन्छ। साथै, नजिकको सेवा केन्द्रमा सम्पर्क गरी तत्काल स्मार्ट मोबाइल बैंकिङ र क्युआर सेवा सुचारु गर्न सकिन्छ।',
    category: 'Digital Banking',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'faq-5',
    questionEn: 'What welfare benefits do members receive from the Member Security & Relief Fund?',
    questionNp: 'सदस्य सुरक्षा तथा राहत कोषबाट सदस्यहरूले के-कस्ता सुविधा पाउँछन्?',
    answerEn: 'Active shareholder members are eligible for up to Rs. 50,000 emergency medical hospitalization relief, Rs. 10,000 maternity nutrition allowance per childbirth, accidental micro-insurance coverage up to Rs. 200,000, and annual SEE/Plus-Two merit scholarships for member children.',
    answerNp: 'सक्रिय सेयर सदस्यहरूले आकस्मिक गम्भीर स्वास्थ्य उपचारमा रु. ५०,००० सम्म सहयोग, सुत्केरी पोषण भत्ता रु. १०,०००, दुर्घटना लघुबिमा रु. २,००,००० सम्म र सदस्यका जेहेन्दार सन्ततिलाई वार्षिक छात्रवृत्ति सुविधा प्राप्त गर्दछन्।',
    category: 'General',
    sortOrder: 5,
    isActive: true
  }
];

export const INITIAL_CMS_HISTORY_MILESTONES: HistoryMilestonesPageCMS = {
  titleEn: 'History & Evolutionary Milestones',
  titleNp: 'इतिहास तथा ऐतिहासिक विकासक्रम',
  subtitleEn: 'Over Two Decades of Community Trust, Democratic Governance & Financial Empowerment Since 2057 B.S.',
  subtitleNp: 'वि.सं. २०५७ देखि सामुदायिक विश्वास, लोकतान्त्रिक सुशासन र आर्थिक सशक्तीकरणको गौरवमय यात्रा',
  overviewEn:
    'Founded in 2057 B.S. (2000 A.D.) by 35 pioneering visionaries in Butwal with a modest initial share capital, Ankur Saving & Credit Cooperative Ltd. has grown through dedication, transparent member governance, and unwavering financial integrity into a tier-one community financial institution with over Rs. 1.28 Arba in audited assets.',
  overviewNp:
    'वि.सं. २०५७ सालमा बुटवलका ३५ जना दूरदर्शी समाजसेवी तथा व्यावसायिक व्यक्तित्वहरूको अग्रसरतामा सानो पुँजीबाट सुरु भएको अंकुर बचत तथा ऋण सहकारी आज पारदर्शी सुशासन, निष्ठावान नेतृत्व र सदस्यहरूको अटुट विश्वासका कारण १ अर्ब २८ करोडभन्दा बढी कुल पुँजी परिचालन गर्ने अग्रणी संस्थामा रूपान्तरित भएको छ।',
  milestones: [
    {
      id: 'ms-2057',
      yearBs: '2057 B.S.',
      yearAd: '2000 A.D.',
      titleEn: 'Institutional Founding & Official Registration',
      titleNp: 'संस्था स्थापना तथा विधिवत् दर्ता',
      descriptionEn:
        'Formally registered under Cooperative Act 2048 at the Division Cooperative Office, Rupandehi (Regd. No: 421/057/058) by 35 founding promoter shareholders to promote thrift and eradicate informal high-interest lending.',
      descriptionNp:
        'सहकारी ऐन २०४८ बमोजिम ३५ जना संस्थापक सेयर सदस्यहरूको सक्रियतामा डिभिजन सहकारी कार्यालय रुपन्देहीमा (दर्ता नं. ४२१/०५७/०५८) विधिवत् दर्ता भई बचत तथा ऋण कारोबार शुभारम्भ।',
      badgeEn: 'Foundation Era',
      badgeNp: 'स्थापना काल',
      icon: '🏛️',
      sortOrder: 1,
    },
    {
      id: 'ms-2065',
      yearBs: '2065 B.S.',
      yearAd: '2008 A.D.',
      titleEn: '1,000+ Member Families & First Service Extension',
      titleNp: '१,०००+ सदस्य परिवार र सेवा विस्तार',
      descriptionEn:
        'Crossed 1,000 active shareholder families across Butwal and launched dedicated agricultural & micro-enterprise credit schemes along with our first market collection desk.',
      descriptionNp:
        'शेयर सदस्य संख्या १,००० परिवार नाघेको र साना व्यवसायी तथा कृषकहरूका लागि विशेष सहुलियत कर्जा एवं पहिलो सेवा केन्द्र विस्तार।',
      badgeEn: 'Community Expansion',
      badgeNp: 'सेवा विस्तार',
      icon: '🌱',
      sortOrder: 2,
    },
    {
      id: 'ms-2072',
      yearBs: '2072 B.S.',
      yearAd: '2015 A.D.',
      titleEn: 'Core Banking System (CBS) Digitalization',
      titleNp: 'केन्द्रीय कोर बैंकिङ सफ्टवेयर (CBS) जडान',
      descriptionEn:
        'Upgraded all manual ledgers to a centralized computerized Core Banking System (CBS) with automated daily off-site backups, instant passbook printing, and inter-branch any-branch banking.',
      descriptionNp:
        'सम्पूर्ण हस्तलिखित ढड्डा प्रणालीलाई विस्थापित गरी आधुनिक कम्प्युटरयुक्त केन्द्रीय कोर बैंकिङ प्रणाली (CBS) र अन्तर-शाखा कारोबार सुरु।',
      badgeEn: 'Digital Leap',
      badgeNp: 'प्रविधि रूपान्तरण',
      icon: '💻',
      sortOrder: 3,
    },
    {
      id: 'ms-2076',
      yearBs: '2076 B.S.',
      yearAd: '2019 A.D.',
      titleEn: 'Exemplary Cooperative Award & Multi-Branch Network',
      titleNp: 'उत्कृष्ट सहकारी सम्मान तथा बहु-सेवा केन्द्र सञ्जाल',
      descriptionEn:
        'Honored as "Exemplary Community Financial Cooperative" in Lumbini Province and expanded service counters to Milanchowk, Golpark, and Amarpath commercial hubs.',
      descriptionNp:
        'जिल्ला तथा प्रदेश स्तरमा "उत्कृष्ट सामुदायिक वित्तीय सहकारी" बाट सम्मानित र मिलनचोक, गोलपार्क तथा अमरपथमा सेवा केन्द्र विस्तार।',
      badgeEn: 'Excellence Award',
      badgeNp: 'उत्कृष्ट सम्मान',
      icon: '🏆',
      sortOrder: 4,
    },
    {
      id: 'ms-2078',
      yearBs: '2078 B.S.',
      yearAd: '2021 A.D.',
      titleEn: 'Smart Mobile Banking, NepalPay QR & Online eKYM',
      titleNp: 'स्मार्ट मोबाइल बैंकिङ, नेपालपे क्युआर र अनलाइन eKYM',
      descriptionEn:
        'Launched 24/7 Ankur Smart Mobile Banking App, nationwide NepalPay QR merchant payments, connectIPS inter-bank fund transfers, and paperless digital eKYM member verification.',
      descriptionNp:
        '२४सै घण्टा चल्ने स्मार्ट मोबाइल बैंकिङ एप, नेपालपे क्युआर भुक्तानी, अन्तर-बैंक ट्रान्सफर र अनलाइन eKYM डिजिटल प्रमाणीकरण सेवाको शुभारम्भ।',
      badgeEn: 'Fintech Pioneer',
      badgeNp: 'डिजिटल बैंकिङ',
      icon: '📱',
      sortOrder: 5,
    },
    {
      id: 'ms-2081',
      yearBs: '2081 B.S.',
      yearAd: 'Present',
      titleEn: '15,420+ Members & Rs. 1.28 Arba Audited Balance Sheet',
      titleNp: '१५,४२०+ शेयर सदस्य र रु. १.२८ अर्ब कुल पुँजी',
      descriptionEn:
        'Serving over 15,420 proud shareholder members across Rupandehi District with 4 modern service centers, PEARLS gold-standard ratios, and 100% safe, transparent governance.',
      descriptionNp:
        '१५,४२० भन्दा बढी सन्तुष्ट शेयर सदस्यहरू, ४ वटा आधुनिक सेवा केन्द्र र १ अर्ब २८ करोडभन्दा बढी सुरक्षित पुँजीसहित लुम्बिनी प्रदेशकै अग्रणी सहकारी।',
      badgeEn: 'Present Milestone',
      badgeNp: 'वर्तमान उपलब्धि',
      icon: '🌟',
      sortOrder: 6,
    },
  ],
};

const INITIAL_WHY_CHOOSE_US_ITEMS = [
  {
    id: 'why-1',
    icon: '🤝',
    titleEn: 'Member First & Democratic Ownership',
    titleNp: 'सदस्य पहिलो र लोकतान्त्रिक स्वामित्व',
    descriptionEn:
      'All financial policies, savings schemes, and credit products are carefully engineered around authentic member needs, equitable dividend returns, and community growth.',
    descriptionNp:
      'हाम्रा सम्पूर्ण बचत तथा कर्जा सेवाहरू सदस्यका वास्तविक आवश्यकता, न्यायोचित लाभांश वितरण र सामुदायिक उत्थानलाई केन्द्रमा राखेर तयार गरिन्छ।',
    descEn:
      'All financial policies, savings schemes, and credit products are carefully engineered around authentic member needs, equitable dividend returns, and community growth.',
    descNp:
      'हाम्रा सम्पूर्ण बचत तथा कर्जा सेवाहरू सदस्यका वास्तविक आवश्यकता, न्यायोचित लाभांश वितरण र सामुदायिक उत्थानलाई केन्द्रमा राखेर तयार गरिन्छ।',
    badgeEn: '100% Member Owned',
    badgeNp: 'सदस्य-केन्द्रित',
    showOnHome: true,
    sortOrder: 1,
  },
  {
    id: 'why-2',
    icon: '🛡️',
    titleEn: 'Transparent Governance & Deposit Safety',
    titleNp: 'पारदर्शी सुशासन र निक्षेप सुरक्षा',
    descriptionEn:
      'Uncompromising institutional integrity with quarterly PEARLS audit disclosures, strict statutory liquidity reserves (19.4%), and democratic member oversight.',
    descriptionNp:
      'नियमित बाह्य लेखापरीक्षण, खुला वित्तीय प्रतिवेदन, १९.४% तरलता कोष र लोकतान्त्रिक निर्णय प्रक्रियामा आधारित पूर्ण सुरक्षित सुशासन।',
    descEn:
      'Uncompromising institutional integrity with quarterly PEARLS audit disclosures, strict statutory liquidity reserves (19.4%), and democratic member oversight.',
    descNp:
      'नियमित बाह्य लेखापरीक्षण, खुला वित्तीय प्रतिवेदन, १९.४% तरलता कोष र लोकतान्त्रिक निर्णय प्रक्रियामा आधारित पूर्ण सुरक्षित सुशासन।',
    badgeEn: 'Audited & Safe',
    badgeNp: 'पूर्ण सुरक्षित',
    showOnHome: true,
    sortOrder: 2,
  },
  {
    id: 'why-3',
    icon: '🏢',
    titleEn: 'Accessible Everywhere Across Rupandehi',
    titleNp: 'सहज पहुँच र शाखा सञ्जाल',
    descriptionEn:
      'Reliable physical touchpoints across central and branch service centers in Butwal, alongside doorstep daily savings collection and quick member helplines.',
    descriptionNp:
      'बुटवलका मुख्य तथा सेवा केन्द्रहरू, घरदैलो दैनिक बचत संकलन र सहयोगी सदस्य सहायता डेस्कमार्फत छिटोछरितो सेवा।',
    descEn:
      'Reliable physical touchpoints across central and branch service centers in Butwal, alongside doorstep daily savings collection and quick member helplines.',
    descNp:
      'बुटवलका मुख्य तथा सेवा केन्द्रहरू, घरदैलो दैनिक बचत संकलन र सहयोगी सदस्य सहायता डेस्कमार्फत छिटोछरितो सेवा।',
    badgeEn: '4 Service Centers',
    badgeNp: '४ सेवा केन्द्र',
    showOnHome: true,
    sortOrder: 3,
  },
  {
    id: 'why-4',
    icon: '⚡',
    titleEn: 'Progressive Digital Banking Technology',
    titleNp: 'प्रगतिशील स्मार्ट डिजिटल प्रविधि',
    descriptionEn:
      'Pioneering member convenience with online eKYM digital verification, instant NepalPay QR merchant payments, utility bill pay, and core CBS safety.',
    descriptionNp:
      'अनलाइन eKYM डिजिटल प्रमाणीकरण, नेपालपे क्युआर भुक्तानी प्रणाली, मोबाइल बैंकिङ र अत्याधुनिक सुरक्षित कोर-बैंकिङ प्रविधिको प्रयोग।',
    descEn:
      'Pioneering member convenience with online eKYM digital verification, instant NepalPay QR merchant payments, utility bill pay, and core CBS safety.',
    descNp:
      'अनलाइन eKYM डिजिटल प्रमाणीकरण, नेपालपे क्युआर भुक्तानी प्रणाली, मोबाइल बैंकिङ र अत्याधुनिक सुरक्षित कोर-बैंकिङ प्रविधिको प्रयोग।',
    badgeEn: '24/7 Smart App',
    badgeNp: '२४सै घण्टा डिजिटल',
    showOnHome: true,
    sortOrder: 4,
  },
  {
    id: 'why-5',
    icon: '📈',
    titleEn: 'Competitive Savings Returns (Up to 11.75%)',
    titleNp: 'आकर्षक बचत प्रतिफल (११.७५% सम्म)',
    descriptionEn:
      'Earn industry-leading quarterly compounded interest on regular, child, senior citizen, and fixed term deposits with zero hidden service charges.',
    descriptionNp:
      'साधारण, बाल भविष्य, ज्येष्ठ नागरिक तथा मुद्दती निक्षेपमा बिना कुनै अतिरिक्त शुल्क वार्षिक ११.७५% सम्म सुनिश्चित उच्च ब्याज प्रतिफल।',
    descEn:
      'Earn industry-leading quarterly compounded interest on regular, child, senior citizen, and fixed term deposits with zero hidden service charges.',
    descNp:
      'साधारण, बाल भविष्य, ज्येष्ठ नागरिक तथा मुद्दती निक्षेपमा बिना कुनै अतिरिक्त शुल्क वार्षिक ११.७५% सम्म सुनिश्चित उच्च ब्याज प्रतिफल।',
    badgeEn: 'High Yield',
    badgeNp: 'उच्च प्रतिफल',
    showOnHome: false,
    sortOrder: 5,
  },
  {
    id: 'why-6',
    icon: '❤️',
    titleEn: 'Comprehensive Member Welfare & Relief Fund',
    titleNp: 'सदस्य सुरक्षा तथा कल्याणकारी राहत कोष',
    descriptionEn:
      'Dedicated social protection including up to Rs. 50,000 medical emergency hospitalization relief, Rs. 10,000 maternity nutrition grant, and Rs. 2 Lakh accident cover.',
    descriptionNp:
      'आकस्मिक स्वास्थ्य उपचारमा रु. ५०,००० सम्म सहयोग, सुत्केरी पोषण भत्ता रु. १०,००० र रु. २ लाखसम्म दुर्घटना बिमा सुविधा।',
    descEn:
      'Dedicated social protection including up to Rs. 50,000 medical emergency hospitalization relief, Rs. 10,000 maternity nutrition grant, and Rs. 2 Lakh accident cover.',
    descNp:
      'आकस्मिक स्वास्थ्य उपचारमा रु. ५०,००० सम्म सहयोग, सुत्केरी पोषण भत्ता रु. १०,००० र रु. २ लाखसम्म दुर्घटना बिमा सुविधा।',
    badgeEn: 'Welfare Shield',
    badgeNp: 'कल्याणकारी सुरक्षा',
    showOnHome: false,
    sortOrder: 6,
  },
];

export const INITIAL_CMS_WHY_CHOOSE_US: WhyChooseUsPageCMS = {
  badgeEn: 'WHY ANKUR COOPERATIVE?',
  badgeNp: 'किन अंकुर सहकारी?',
  titleEn: 'Built Around Trust, Security & Member Value',
  titleNp: 'विश्वास र सदस्य मूल्यमा आधारित सुदृढ सहकारी',
  subtitleEn:
    'Serving over 15,420 member families since 2057 BS with transparent stewardship, ethical finance, and innovative services.',
  subtitleNp:
    'वि.सं. २०५७ देखि निरन्तर रूपन्देहीवासी सदस्यहरूको आर्थिक समुन्नतिमा समर्पित एक विश्वसनीय वित्तीय साझेदार।',
  overviewEn:
    'Choosing the right financial partner is pivotal for your family’s dreams and enterprise security. Here is why thousands of members trust Ankur Saving & Credit Cooperative Ltd. as their lifelong financial ally.',
  overviewNp:
    'आफ्नो र परिवारको आर्थिक भविष्य सुरक्षित गर्न सही वित्तीय साझेदार रोज्नु महत्त्वपूर्ण हुन्छ। यहाँ अंकुर सहकारीलाई हजारौं सदस्यहरूले किन पहिलो रोजाइ बनाएका छन् भन्ने मुख्य आधारहरू प्रस्तुत गरिएको छ।',
  introEn:
    'Choosing the right financial partner is pivotal for your family’s dreams and enterprise security. Here is why thousands of members trust Ankur Saving & Credit Cooperative Ltd. as their lifelong financial ally.',
  introNp:
    'आफ्नो र परिवारको आर्थिक भविष्य सुरक्षित गर्न सही वित्तीय साझेदार रोज्नु महत्त्वपूर्ण हुन्छ। यहाँ अंकुर सहकारीलाई हजारौं सदस्यहरूले किन पहिलो रोजाइ बनाएका छन् भन्ने मुख्य आधारहरू प्रस्तुत गरिएको छ।',
  items: INITIAL_WHY_CHOOSE_US_ITEMS,
  pillars: INITIAL_WHY_CHOOSE_US_ITEMS,
};

export const INITIAL_CMS_EXCHANGE_RATES: ExchangeRateItemCMS[] = [
  {
    id: 'fx-inr',
    currencyCode: 'INR',
    currencyNameEn: 'Indian Rupee',
    currencyNameNp: 'भारतीय रूपैयाँ',
    flag: '🇮🇳',
    unit: 100,
    buyingRate: '160.00',
    sellingRate: '160.15',
    isFixed: true,
    isEnabled: true,
    updatedAt: '2083-05-15',
    sortOrder: 1,
  },
  {
    id: 'fx-usd',
    currencyCode: 'USD',
    currencyNameEn: 'U.S. Dollar',
    currencyNameNp: 'अमेरिकी डलर',
    flag: '🇺🇸',
    unit: 1,
    buyingRate: '134.25',
    sellingRate: '134.85',
    isFixed: false,
    isEnabled: true,
    updatedAt: '2083-05-15',
    sortOrder: 2,
  },
  {
    id: 'fx-eur',
    currencyCode: 'EUR',
    currencyNameEn: 'European Euro',
    currencyNameNp: 'युरोपेली युरो',
    flag: '🇪🇺',
    unit: 1,
    buyingRate: '148.40',
    sellingRate: '149.06',
    isFixed: false,
    isEnabled: true,
    updatedAt: '2083-05-15',
    sortOrder: 3,
  },
  {
    id: 'fx-gbp',
    currencyCode: 'GBP',
    currencyNameEn: 'UK Pound Sterling',
    currencyNameNp: 'बेलायती पाउण्ड स्टर्लिङ',
    flag: '🇬🇧',
    unit: 1,
    buyingRate: '175.80',
    sellingRate: '176.59',
    isFixed: false,
    isEnabled: true,
    updatedAt: '2083-05-15',
    sortOrder: 4,
  },
  {
    id: 'fx-aud',
    currencyCode: 'AUD',
    currencyNameEn: 'Australian Dollar',
    currencyNameNp: 'अष्ट्रेलियन डलर',
    flag: '🇦🇺',
    unit: 1,
    buyingRate: '90.65',
    sellingRate: '91.06',
    isFixed: false,
    isEnabled: true,
    updatedAt: '2083-05-15',
    sortOrder: 5,
  },
  {
    id: 'fx-cad',
    currencyCode: 'CAD',
    currencyNameEn: 'Canadian Dollar',
    currencyNameNp: 'क्यानेडियन डलर',
    flag: '🇨🇦',
    unit: 1,
    buyingRate: '99.10',
    sellingRate: '99.55',
    isFixed: false,
    isEnabled: true,
    updatedAt: '2083-05-15',
    sortOrder: 6,
  },
  {
    id: 'fx-jpy',
    currencyCode: 'JPY',
    currencyNameEn: 'Japanese Yen',
    currencyNameNp: 'जापानी येन',
    flag: '🇯🇵',
    unit: 10,
    buyingRate: '9.32',
    sellingRate: '9.36',
    isFixed: false,
    isEnabled: true,
    updatedAt: '2083-05-15',
    sortOrder: 7,
  },
  {
    id: 'fx-sar',
    currencyCode: 'SAR',
    currencyNameEn: 'Saudi Arabian Riyal',
    currencyNameNp: 'साउदी अरेबियन रियाल',
    flag: '🇸🇦',
    unit: 1,
    buyingRate: '35.78',
    sellingRate: '35.94',
    isFixed: false,
    isEnabled: true,
    updatedAt: '2083-05-15',
    sortOrder: 8,
  },
  {
    id: 'fx-qar',
    currencyCode: 'QAR',
    currencyNameEn: 'Qatari Riyal',
    currencyNameNp: 'कतारी रियाल',
    flag: '🇶🇦',
    unit: 1,
    buyingRate: '36.82',
    sellingRate: '36.99',
    isFixed: false,
    isEnabled: true,
    updatedAt: '2083-05-15',
    sortOrder: 9,
  },
  {
    id: 'fx-aed',
    currencyCode: 'AED',
    currencyNameEn: 'UAE Dirham',
    currencyNameNp: 'युएई दिराम',
    flag: '🇦🇪',
    unit: 1,
    buyingRate: '36.55',
    sellingRate: '36.71',
    isFixed: false,
    isEnabled: true,
    updatedAt: '2083-05-15',
    sortOrder: 10,
  },
  {
    id: 'fx-myr',
    currencyCode: 'MYR',
    currencyNameEn: 'Malaysian Ringgit',
    currencyNameNp: 'मलेसियन रिंगिट',
    flag: '🇲🇾',
    unit: 1,
    buyingRate: '31.15',
    sellingRate: '31.29',
    isFixed: false,
    isEnabled: true,
    updatedAt: '2083-05-15',
    sortOrder: 11,
  },
  {
    id: 'fx-krw',
    currencyCode: 'KRW',
    currencyNameEn: 'South Korean Won',
    currencyNameNp: 'दक्षिण कोरियन वन',
    flag: '🇰🇷',
    unit: 100,
    buyingRate: '10.04',
    sellingRate: '10.09',
    isFixed: false,
    isEnabled: true,
    updatedAt: '2083-05-15',
    sortOrder: 12,
  },
];

export const INITIAL_CMS_INSTITUTIONAL_PROFILES: InstitutionalProfileItemCMS[] = [
  {
    id: 'inst-profile-1',
    titleEn: 'Corporate Identity & Statutory Charter',
    titleNp: 'संस्थागत पहिचान तथा वैधानिक वडापत्र',
    categoryEn: 'Statutory Profile',
    categoryNp: 'वैधानिक विवरण',
    subtitleEn: 'Registered under Cooperative Act 2048 & 2074 • Regd. No. 421/057/058',
    subtitleNp: 'सहकारी ऐन २०४८ र २०७४ बमोजिम दर्ता • दर्ता नं. ४२१/०५७/०५८',
    contentEn:
      'Ankur Saving & Credit Cooperative Ltd. was formally registered on Baishakh 15, 2057 B.S. (2000 A.D.) under the Department of Cooperatives, Government of Nepal. Headquartered at Main Road, Traffic Chowk, Butwal-04, Rupandehi, the cooperative operates as a member-owned, democratically governed financial institution dedicated to sustainable socio-economic transformation across Lumbini Province.',
    contentNp:
      'अंकुर बचत तथा ऋण सहकारी संस्था लि. नेपाल सरकार सहकारी विभाग अन्तर्गत वि.सं. २०५७ वैशाख १५ गते विधिवत् रूपमा दर्ता भई सञ्चालनमा रहेको सदस्य-केन्द्रित वित्तीय संस्था हो। बुटवल-४, ट्राफिक चोकमा केन्द्रीय कार्यालय रहेको यस संस्थाले लुम्बिनी प्रदेशका सदस्यहरूको आर्थिक तथा सामाजिक रूपान्तरणमा अग्रणी भूमिका निर्वाह गर्दै आएको छ।',
    highlightsEn: [
      'Registration No.: 421/057/058 (Cooperative Department)',
      'PAN No.: 301548921 (Inland Revenue Office, Butwal)',
      'Working Jurisdiction: Rupandehi District & Lumbini Province',
      'Core Banking System (CBS) with 100% digital ledger compliance',
    ],
    highlightsNp: [
      'दर्ता नं.: ४२१/०५७/०५८ (डिभिजन सहकारी कार्यालय, रूपन्देही)',
      'स्थायी लेखा नं. (PAN): ३०१५४८९२१ (आन्तरिक राजस्व कार्यालय, बुटवल)',
      'कार्यक्षेत्र: रूपन्देही जिल्ला तथा लुम्बिनी प्रदेश',
      'पूर्ण डिजिटल कोर बैंकिङ प्रणाली (CBS) बाट सुरक्षित कारोबार',
    ],
    badgeEn: 'Statutory Identity',
    badgeNp: 'वैधानिक पहिचान',
    imageUrl: '/uploads/media/slide-banking.svg',
    isPublished: true,
    sortOrder: 1,
    updatedAt: '2083-05-15',
  },
  {
    id: 'inst-profile-2',
    titleEn: 'Financial Strength & PEARLS Prudential Indicators',
    titleNp: 'वित्तीय सबलता तथा पर्ल्स (PEARLS) सूचकांक विवरण',
    categoryEn: 'Financial Standing',
    categoryNp: 'वित्तीय अवस्था',
    subtitleEn: 'Audited Balance Sheet & Capital Adequacy Highlights (FY 2082/83)',
    subtitleNp: 'लेखापरीक्षित वासलात तथा पुँजी पर्याप्तता विवरण (आ.व. २०८२/८३)',
    contentEn:
      'Guided by World Council of Credit Unions (WOCCU) PEARLS monitoring standards, Ankur Cooperative maintains a highly resilient balance sheet with Rs. 24.50 Crore in Institutional & Share Capital, Rs. 1.28 Arba in Member Savings, and 19.4% statutory liquid reserves. Every financial quarter undergoes rigorous internal audit by the Supervisory Committee and annual statutory audit by ICAN Chartered Accountants.',
    contentNp:
      'अन्तर्राष्ट्रिय पर्ल्स (PEARLS) अनुगमन प्रणालीको पूर्ण पालना गर्दै यस संस्थाले रु. २४.५० करोड सेयर पुँजी, रु. १.२८ अर्ब बचत निक्षेप र १९.४% तरलता कोष कायम गरेको छ। लेखा सुपरिवेक्षण समितिबाट त्रैमासिक आन्तरिक लेखापरीक्षण तथा चार्टर्ड एकाउन्ट्यान्टबाट वार्षिक वैधानिक लेखापरीक्षण सम्पन्न गरिन्छ।',
    highlightsEn: [
      'Total Shareholding Members: 15,420+ Active Shareholder Families',
      'Total Savings & Deposits: Rs. 1.28 Arba (Audited)',
      'Productive Credit Portfolio: Rs. 98.40 Crore (NPL below 1.35%)',
      'Statutory Liquidity Reserve: 19.4% (Above 15% regulatory norm)',
    ],
    highlightsNp: [
      'कुल सेयर सदस्य संख्या: १५,४२०+ सक्रिय सदस्य परिवारहरू',
      'कुल बचत तथा निक्षेप: रु. १.२८ अर्ब (लेखापरीक्षित)',
      'कुल कर्जा लगानी: रु. ९८.४० करोड (भाखा नाघेको कर्जा १.३५% भन्दा कम)',
      'संस्थागत तरलता अनुपात: १९.४% (नियामक मापदण्ड १५% भन्दा माथि)',
    ],
    badgeEn: 'PEARLS Compliant',
    badgeNp: 'सबल वित्तीय सूचकांक',
    imageUrl: '/uploads/media/slide-deposits.svg',
    isPublished: true,
    sortOrder: 2,
    updatedAt: '2083-05-15',
    monthlyReport: INITIAL_MONTHLY_FINANCIAL_REPORTS[0],
  },
  {
    id: 'inst-profile-3',
    titleEn: 'Governance Structure, Affiliations & Social Responsibility',
    titleNp: 'संस्थागत सुशासन, आबद्धता तथा सामाजिक उत्तरदायित्व',
    categoryEn: 'Governance & CSR',
    categoryNp: 'सुशासन र समाज',
    subtitleEn: 'Affiliated with NEFSCUN, District Cooperative Union & National Cooperative Bank',
    subtitleNp: 'नेफ्स्कून, जिल्ला सहकारी संघ तथा राष्ट्रिय सहकारी बैंकमा आबद्ध',
    contentEn:
      'Ankur Cooperative practices transparent three-tier democratic governance comprising the General Assembly, an elected 9-member Board of Directors, and an independent 3-member Account Supervisory Committee. Beyond financial intermediation, the institution invests 10% of annual net surplus into the Member Welfare, Health Relief, Scholarship, and Community Development Fund.',
    contentNp:
      'साधारण सभा सर्वोच्च निकाय रहने गरी ९ सदस्यीय निर्वाचित सञ्चालक समिति र ३ सदस्यीय स्वतन्त्र लेखा सुपरिवेक्षण समितिमार्फत पूर्ण लोकतान्त्रिक सुशासन अभ्यास गरिएको छ। वित्तीय सेवाका अतिरिक्त संस्थाले सदस्य स्वास्थ्य उपचार कोष, जेहेन्दार छात्रवृत्ति, रक्तदान तथा वित्तीय साक्षरता अभियानहरू नियमित सञ्चालन गर्दछ।',
    highlightsEn: [
      'Affiliated with NEFSCUN, National Cooperative Bank & District Union',
      'Independent Account Supervisory Committee & Credit Sub-Committee',
      'Up to Rs. 50,000 Medical Hospitalization Relief for Members',
      'Annual Blood Donation, Tree Plantation & Women Entrepreneurship Grants',
    ],
    highlightsNp: [
      'नेफ्स्कून (NEFSCUN), राष्ट्रिय सहकारी बैंक तथा जिल्ला संघमा आबद्ध',
      'स्वतन्त्र लेखा सुपरिवेक्षण समिति तथा कर्जा उप-समितिद्वारा नियमित अनुगमन',
      'सदस्य आकस्मिक औषधि उपचारमा रु. ५०,००० सम्म कल्याणकारी राहत',
      'वार्षिक रक्तदान, वृक्षारोपण, महिला उद्यमशीलता र वित्तीय साक्षरता कार्यक्रम',
    ],
    badgeEn: 'Democratic Governance',
    badgeNp: 'पारदर्शी सुशासन',
    imageUrl: '/uploads/media/gallery-agm.svg',
    isPublished: true,
    sortOrder: 3,
    updatedAt: '2083-05-15',
  },
];

export const INITIAL_CMS_HEAD_OFFICE: HeadOfficeInfoCMS = {
  officeNameEn: 'Ankur Saving & Credit Cooperative Ltd.',
  officeNameNp: 'अंकुर बचत तथा ऋण सहकारी संस्था लि.',
  descriptionEn:
    'Get in touch with the Central Head Office of Ankur Saving & Credit Cooperative Ltd., division desks, and member helpline for swift financial service assistance, account inquiries, credit consultation, or institutional correspondence.',
  descriptionNp:
    'अंकुर बचत तथा ऋण सहकारी संस्था लि. को केन्द्रीय मुख्य कार्यालय, आन्तरिक विभागीय डेस्कहरू र सदस्य सहायता कक्षमा सीधै सम्पर्क गरी वित्तीय सेवा परामर्श, खाता जानकारी वा संस्थागत सेवा लिनुहोस्।',
  addressEn: 'Main Road, Traffic Chowk, Butwal-04, Rupandehi, Lumbini Province, Nepal',
  addressNp: 'मुख्य सडक, ट्राफिक चोक, बुटवल-४, रुपन्देही, लुम्बिनी प्रदेश, नेपाल',
  province: 'Lumbini Province',
  district: 'Rupandehi',
  city: 'Butwal Sub-Metropolitan City',
  ward: '04',
  primaryPhone: '071-540123',
  altPhone: '071-540456',
  tollFreePhone: '1660-01-99887',
  fax: '071-540789',
  officialEmail: 'info@ekatacoop.com.np',
  supportEmail: 'support@ekatacoop.com.np',
  websiteUrl: 'www.ankurcoop.com.np',
  workingDaysEn: 'Sunday to Friday (6 Days a Week)',
  workingDaysNp: 'आइतबार देखि शुक्रबारसम्म (हप्ताको ६ दिन)',
  workingHoursEn: '10:00 AM - 5:00 PM',
  workingHoursNp: 'बिहान १०:०० बजे देखि साँझ ५:०० बजेसम्म',
  counterHoursEn: '10:00 AM - 4:00 PM',
  counterHoursNp: 'बिहान १०:०० बजे देखि दिउँसो ४:०० बजेसम्म',
  regdNo: '421/057/058',
  panNo: '301548921',
  postalCode: '32907',
  mapUrl: 'https://maps.google.com/?q=Butwal+Rupandehi+Nepal',
  emergencyContact: '9857099441',
  departmentsDirectory: [
    {
      id: 'ho-dept-1',
      name: 'Member Service & Account Opening',
      nameNp: 'सदस्य सेवा तथा खाता सञ्चालन कक्ष',
      ext: '101',
      incharge: 'Mr. Deepak Thapa',
      inchargeNp: 'श्री दीपक थापा',
      phone: '071-540123 (Ext. 101)',
      email: 'csd@ekatacoop.com.np',
    },
    {
      id: 'ho-dept-2',
      name: 'Credit & Business Loan Appraisal',
      nameNp: 'कर्जा प्रवाह तथा मूल्याङ्कन विभाग',
      ext: '103',
      incharge: 'Mr. Rajesh Shrestha',
      inchargeNp: 'श्री राजेश श्रेष्ठ',
      phone: '071-540123 (Ext. 103)',
      email: 'credit@ekatacoop.com.np',
    },
    {
      id: 'ho-dept-3',
      name: 'Internal Audit & Risk Compliance',
      nameNp: 'आन्तरिक लेखापरीक्षण तथा अनुपालन एकाइ',
      ext: '106',
      incharge: 'Mr. Manoj Poudel',
      inchargeNp: 'श्री मनोज पौडेल',
      phone: '071-540123 (Ext. 106)',
      email: 'audit@ekatacoop.com.np',
    },
    {
      id: 'ho-dept-4',
      name: 'IT Infrastructure & Digital Banking',
      nameNp: 'सूचना प्रविधि तथा डिजिटल बैंकिङ विभाग',
      ext: '108',
      incharge: 'Er. Sujan Adhikari',
      inchargeNp: 'इ. सुजन अधिकारी',
      phone: '071-540123 (Ext. 108)',
      email: 'it@ekatacoop.com.np',
    },
    {
      id: 'ho-dept-5',
      name: 'Executive Secretariat & Administration',
      nameNp: 'कार्यकारी सचिवालय तथा सामान्य प्रशासन',
      ext: '110',
      incharge: 'Mrs. Shanti Aryal',
      inchargeNp: 'श्रीमती शान्ति अर्याल',
      phone: '071-540123 (Ext. 110)',
      email: 'admin@ekatacoop.com.np',
    },
  ],
};

export const INITIAL_CMS_LEADERSHIP_MEMBERS: LeadershipMemberCMS[] = [
  {
    id: 'lead-1',
    category: 'chairman',
    nameEn: 'Mr. Bharat Sharma Pokhrel',
    nameNp: 'श्री भरत शर्मा पोखरेल',
    designationEn: 'Chairman, Board of Directors',
    designationNp: 'अध्यक्ष, सञ्चालक समिति',
    photoUrl: '/uploads/media/team-chairman.svg',
    shortMessageEn:
      'Over 24 glorious years, Ankur Cooperative has stood firm on the rock of integrity, accountability, and collective member empowerment. Every rupee entrusted to Ankur remains 100% safe, productive, and transparent.',
    shortMessageNp:
      'विगत २४ वर्षको गौरवमय यात्रामा यस संस्थाले समुदायको विश्वास, पारदर्शिता र वित्तीय सुशासनलाई आफ्नो मूल मन्त्र बनाएको छ। संस्थामा जम्मा भएको हरेक पैसा १००% सुरक्षित र उत्पादनशील छ।',
    fullMessageEn:
      'Warm greetings to all our respected members, well-wishers, and community partners.\n\nOver the past 24 years, Ankur Saving & Credit Cooperative Ltd. has stood firm on the rock of integrity, accountability, and collective empowerment. Even in challenging macroeconomic landscapes, our cooperative has recorded steady growth in deposits, prudent loan management, and robust reserve capital. This resilience is solely due to the unwavering trust of our 15,420+ members.\n\nOur focus today is dual: deepening grassroots member welfare through affordable agricultural and enterprise credit, while rapidly adopting world-class digital banking systems such as NepalPay QR, instant interbank transfers, and 24/7 mobile access. We reiterate our sacred pledge that every single rupee entrusted to Ankur Cooperative remains completely secure, productive, and transparently accounted for.\n\nI convey my profound gratitude to our Board members, statutory committees, dedicated employees, and especially our shareholder members whose active participation is the beating heart of Ankur.',
    fullMessageNp:
      'अंकुर बचत तथा ऋण सहकारी संस्था लि. का सम्पूर्ण आदरणीय शेयर सदस्य महानुभावहरू, नियमनकारी निकाय तथा शुभचिन्तकहरूमा हार्दिक नमस्कार तथा न्यानो अभिवादन व्यक्त गर्दछु।\n\nविगत २४ वर्षको गौरवमय यात्रामा यस संस्थाले समुदायको विश्वास, पारदर्शिता र वित्तीय सुशासनलाई आफ्नो मूल मन्त्र बनाएको छ। आर्थिक चुनौतीका बाबजुद हाम्रो संस्थाले निक्षेप संकलन, सुरक्षित कर्जा प्रवाह र जगेडा कोष सुदृढीकरणमा ऐतिहासिक सफलता हासिल गरेको छ। यो सफलता सम्पूर्ण १५,४२० भन्दा बढी सदस्यहरूको अविचल भरोसाको प्रतिफल हो।\n\nआजको युग प्रविधिको युग हो। हामीले सदस्यहरूको सुविधाका लागि मोबाइल बैंकिङ, नेपालपे क्युआर भुक्तानी र अनलाइन eKYM जस्ता आधुनिक सेवाहरू घरघरमै पुर्याएका छौं। संस्थामा जम्मा भएको हरेक पैसा १००% सुरक्षित र उत्पादनशील क्षेत्रमा परिचालन भइरहेको व्यहोरा म स्पष्ट पार्न चाहन्छु।\n\nसंस्थालाई यहाँसम्म पुर्याउन अहोरात्र खट्नुहुने सञ्चालक समिति, लेखा सुपरिवेक्षण समिति, सम्पूर्ण समर्पित कर्मचारी तथा सदैव मार्गदर्शन गर्नुहुने सम्पूर्ण शेयर सदस्यज्यूहरूमा हार्दिक कृतज्ञता व्यक्त गर्दछु।',
    phone: '',
    email: '',
    officeRoomEn: '',
    officeRoomNp: '',
    availabilityEn: '',
    availabilityNp: '',
    actionType: 'read_more',
    actionLabelEn: 'Read More',
    actionLabelNp: 'विस्तृत सन्देश',
    sortOrder: 1,
    isActive: true,
    publishedDate: '2081 Ashwin',
  },
  {
    id: 'lead-2',
    category: 'ceo',
    nameEn: 'Mr. Ramesh Kumar Gautam',
    nameNp: 'श्री रमेश कुमार गौतम',
    designationEn: 'Chief Executive Officer (CEO)',
    designationNp: 'प्रमुख कार्यकारी अधिकृत (CEO)',
    photoUrl: '/uploads/media/team-ceo.svg',
    shortMessageEn:
      'Our executive priority is translating board policies into swift, transparent daily financial operations. In FY 2081/82, we upgraded our Core Banking System and streamlined loan turnaround to under 48 hours.',
    shortMessageNp:
      'हाम्रो व्यवस्थापकीय ध्येय भनेको सदस्यहरूलाई छिटोछरितो, पारदर्शी र आधुनिक वित्तीय सेवा प्रवाह गर्नु हो। आधुनिक सीबीएस, ४८ घण्टाभित्रै कर्जा प्रक्रिया र घरदैलो बैंकिङ हाम्रो प्रतिबद्धता हो।',
    fullMessageEn:
      'Dear Esteemed Members and Stakeholders,\n\nIt is an honor to steer the operational management of Ankur Saving & Credit Cooperative Ltd. Our core mission as the executive team is to translate the vision of the Board of Directors into swift, transparent, and seamless daily financial services for every member visiting our counters or tapping on our mobile app.\n\nIn Fiscal Year 2081/82, we have upgraded our Core Banking System (CBS) to an enterprise-grade platform with real-time audit controls, automated interest postings, and multi-factor TLS encryption. Our turnaround time for personal and micro-business credit evaluation has been reduced from days to under 48 hours. Furthermore, our risk appraisal committee conducts direct site visits to ensure productive capital utilization and high loan recovery rates.\n\nWhether you need a safe avenue for daily savings, funding for children\'s higher education, business expansion loans, or instant worldwide remittances, our competent team across all service centers is at your service with humility and professional competence.',
    fullMessageNp:
      'आदरणीय शेयर सदस्य महानुभावहरू तथा सरोकारवालाहरूमा नमस्कार।\n\nअंकुर बचत तथा ऋण सहकारी संस्थाको दैनिक कार्य सञ्चालन र व्यवस्थापकीय नेतृत्व सम्हाल्न पाउँदा म अत्यन्त गौरवान्वित छु। हाम्रो व्यवस्थापन टोलीको मुख्य ध्येय भनेको सञ्चालक समितिले तय गरेका रणनीतिक नीतिहरूलाई व्यवहारमा उतारी सदस्यहरूलाई छिटोछरितो, पारदर्शी र आधुनिक वित्तीय सेवा प्रवाह गर्नु हो।\n\nचालु आर्थिक वर्षमा हामीले हाम्रो कोर बैंकिङ प्रणाली (CBS) लाई अत्याधुनिक बनाउँदै स्वचालित ब्याज भुक्तानी, दैनिक कारोबार अडिट र सुरक्षित डिजिटल बैंकिङ सुनिश्चित गरेका छौं। कर्जा आवेदन परेको ४८ घण्टाभित्रै स्थलगत निरीक्षण र मूल्याङ्कन सम्पन्न गरी ऋण प्रवाह गर्ने प्रणाली स्थापित गरिएको छ।\n\nतपाईंलाई दैनिक बचत, बालबालिकाको उच्च शिक्षा, व्यापार विस्तार कर्जा वा अन्तर्राष्ट्रिय रेमिट्यान्स सेवा आवश्यक पर्दा हाम्रा सम्पूर्ण सेवा केन्द्रका कर्मचारी साथीहरू सदैव यहाँहरूको सेवामा समर्पित रहनेछन्।',
    phone: '',
    email: '',
    officeRoomEn: '',
    officeRoomNp: '',
    availabilityEn: '',
    availabilityNp: '',
    actionType: 'read_more',
    actionLabelEn: 'Read More',
    actionLabelNp: 'विस्तृत सन्देश',
    sortOrder: 2,
    isActive: true,
    publishedDate: '2081 Ashwin',
  },
  {
    id: 'lead-3',
    category: 'info_officer',
    nameEn: 'Er. Sujan Adhikari',
    nameNp: 'इ. सुजन अधिकारी',
    designationEn: 'Information Officer & IT Head',
    designationNp: 'सूचना अधिकारी तथा सूचना प्रविधि प्रमुख',
    photoUrl: '/uploads/media/team-info-officer.svg',
    shortMessageEn:
      'Right to Information (RTI) Desk: Respected members and citizens can freely access audited balance sheets, interest schedules, institutional decisions, and regulatory disclosures.',
    shortMessageNp:
      'सूचनाको हक (RTI) सम्बन्धी डेस्क: आदरणीय सदस्य महानुभावहरू तथा नागरिकहरूले संस्थागत विवरण, लेखापरीक्षण प्रतिवेदन, ब्याजदर तालिका र नियमनकारी सूचना सहजै प्राप्त गर्न सक्नुहुनेछ।',
    fullMessageEn:
      'Under Article 27 of the Constitution of Nepal and the Right to Information Act 2064, Ankur Saving & Credit Cooperative Ltd. upholds total institutional transparency.\n\nAll quarterly financial health statements, PEARLS monitoring indices, AGM decisions, and cooperative audit reports are proactively maintained and accessible to members. Should any member require specific public disclosures or official documentation, please reach out to the Information Desk via phone, email, or in-person visit during official business hours.',
    fullMessageNp:
      'नेपालको संविधानको धारा २७ तथा सूचनाको हक सम्बन्धी ऐन २०६४ को मर्म अनुरूप अंकुर बचत तथा ऋण सहकारी संस्था लि. ले संस्थागत पारदर्शितालाई पूर्ण रूपमा आत्मसात् गरेको छ।\n\nसंस्थाका त्रैमासिक वित्तीय विवरणहरू, पर्ल्स (PEARLS) अनुगमन सूचकांकहरू, साधारण सभाका निर्णयहरू तथा लेखापरीक्षण प्रतिवेदनहरू नियमति रूपमा सार्वजनिक गरिँदै आएको छ। कुनै पनि आधिकारिक सूचना वा विवरण आवश्यक परेमा सूचना अधिकारीको कार्यकक्षमा सम्पर्क गरी वा तोकिएको प्रक्रिया पूरा गरी प्राप्त गर्न सकिनेछ।',
    phone: '',
    email: '',
    officeRoomEn: '',
    officeRoomNp: '',
    availabilityEn: '',
    availabilityNp: '',
    actionType: 'view_details',
    actionLabelEn: 'View Details',
    actionLabelNp: 'विवरण हेर्नुहोस्',
    sortOrder: 3,
    isActive: true,
    publishedDate: '2081 Ashwin',
  },
  {
    id: 'lead-4',
    category: 'grievance_officer',
    nameEn: 'Mr. Manoj Poudel',
    nameNp: 'श्री मनोज पौडेल',
    designationEn: 'Grievance Hearing Officer & Senior Compliance Lead',
    designationNp: 'वरिष्ठ अनुपालन अधिकृत तथा गुनासो सुनुवाइ अधिकारी',
    photoUrl: '/uploads/media/team-grievance-officer.svg',
    shortMessageEn:
      'Member Grievance & Redressal Cell: All complaints, suggestions, and counter feedback are confidentially logged, acknowledged within 24 hours, and resolved within 3 to 7 working days.',
    shortMessageNp:
      'सदस्य गुनासो सुनुवाइ कक्ष: काउन्टर सेवा, एसएमएस, कर्जा वा बचत सम्बन्धी सम्पूर्ण गुनासाहरू २४ घण्टाभित्र प्रारम्भिक सुनुवाइ तथा ३ देखि ७ कार्यदिनभित्र निष्पक्ष रूपमा समाधान गरिनेछ।',
    fullMessageEn:
      'Ankur Saving & Credit Cooperative Ltd. maintains a zero-tolerance policy toward service lapses and member dissatisfaction. As the designated Grievance Hearing Officer, I personally oversee every formal complaint submitted through physical suggestion boxes, our digital website portal, or in-person petitions.\n\nOur institutional grievance charter guarantees:\n1. A unique tracking ticket code for every submission.\n2. Initial acknowledgement and triage within 24 business hours.\n3. Fair, confidential investigation by the Internal Audit & Supervisory Committee.\n4. Complete redressal and formal telephonic/written feedback within 3 to 7 working days.\n\nWe encourage all members to voice their honest concerns to help us continuously elevate our service standards.',
    fullMessageNp:
      'अंकुर बचत तथा ऋण सहकारी संस्था लि. ले सदस्य सन्तुष्टि र उपभोक्ता संरक्षणलाई सर्वोच्च प्राथमिकता दिएको छ। संस्थाको गुनासो सुनुवाइ अधिकारीका रूपमा वेबसाइट, सुझाव पेटिका वा प्रत्यक्ष दर्ता भएका सम्पूर्ण गुनासाहरूको निष्पक्ष छानबिन र सुनुवाइ गर्ने जिम्मेवारी म वहन गर्दछु।\n\nहाम्रो गुनासो सुनुवाइ कार्यविधि अनुसार:\n१. प्रत्येक गुनासोको छुट्टै ट्र्याकिङ टिकट कोड प्रदान गरिनेछ।\n२. २४ घण्टाभित्र प्रारम्भिक सुनुवाइ र सम्बन्धित शाखा/विभागमा छानबिन सुरु गरिनेछ।\n३. आन्तरिक लेखापरीक्षण एकाइद्वारा ३ देखि ७ कार्यदिनभित्र सन्तोषजनक समाधान गरिनेछ।\n४. गुनासोकर्ता सदस्यलाई समाधानको औपचारिक जानकारी टेलिफोन वा लिखित रूपमा दिइनेछ।\n\nकुनै पनि सेवा सम्बन्धी समस्या भएमा निर्धक्क भई आफ्नो गुनासो दर्ता गराउनुहोला।',
    phone: '',
    email: '',
    officeRoomEn: '',
    officeRoomNp: '',
    availabilityEn: '',
    availabilityNp: '',
    actionType: 'file_grievance',
    actionLabelEn: 'File Grievance',
    actionLabelNp: 'गुनासो दर्ता',
    sortOrder: 4,
    isActive: true,
    publishedDate: '2081 Ashwin',
  },
];




