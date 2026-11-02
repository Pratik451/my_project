export type Language = 'en' | 'np';

export interface MegaMenuItem {
  id: string;
  titleEn: string;
  titleNp: string;
  subtitleEn: string;
  subtitleNp: string;
  icon: string;
  link: string;
  tag?: string;
}

export interface NavItem {
  id: string;
  labelEn: string;
  labelNp: string;
  icon?: string;
  link?: string;
  hasMegaMenu?: boolean;
  megaMenuItems?: MegaMenuItem[];
}

export interface ServiceItem {
  id: string;
  titleEn: string;
  titleNp: string;
  descriptionEn: string;
  descriptionNp: string;
  icon: string;
  category: 'member' | 'savings' | 'loan' | 'remittance' | 'insurance' | 'digital' | 'welfare' | string;
  badge?: string;
  imageUrl?: string;
}

export interface InterestRate {
  id: string;
  schemeEn: string;
  schemeNp: string;
  rate: string;
  period: string;
  category?: 'Deposit' | 'Loan' | 'Fixed' | string;
  ratePercent?: number;
  basisEn?: string;
  basisNp?: string;
  minBalance?: number;
}

export interface NoticeItem {
  id: string;
  titleEn: string;
  titleNp: string;
  contentEn: string;
  contentNp: string;
  date: string;
  month: string;
  day: string;
  category: string;
}

export interface GalleryItem {
  id: string;
  titleEn: string;
  titleNp: string;
  category: string;
  image: string;
}

export interface AuthUser {
  id?: string;
  role: 'admin' | 'member' | 'staff';
  username?: string;
  fullName: string;
  email?: string;
  memberCode?: string;
  phone?: string;
  branch?: string;
  designation?: string;
  shareAmount?: number;
  savingsBalance?: number;
  loanBalance?: number;
}

export interface EkymFormData {
  // Step 1: Personal Information & Identification Documents
  membershipType: 'New Member' | 'Existing Member';
  membershipNo?: string;
  fullNameEn: string;
  fullNameNp: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  idType: 'Citizenship' | 'National ID (NID)' | 'Passport';
  citizenshipNo: string;
  citizenshipIssueDate: string;
  citizenshipDistrict: string;
  fatherName: string;
  motherName: string;
  grandfatherName: string;
  maritalStatus: 'Unmarried' | 'Married' | 'Divorced' | 'Widowed';
  spouseName?: string;
  education: string;
  occupation: string;
  panNumber?: string;
  memberPhoto: string;
  citizenshipFront: string;
  citizenshipBack: string;

  // Step 2: Address Information
  permProvince: string;
  permDistrict: string;
  permMunicipality: string;
  permWard: string;
  permTole?: string;
  permHouseNo?: string;
  sameAsPermanent: boolean;
  tempProvince: string;
  tempDistrict: string;
  tempMunicipality: string;
  tempWard: string;
  tempTole?: string;
  mobile: string;
  telephone?: string;
  email: string;
  emergencyContactPerson?: string;
  emergencyContactPhone?: string;

  // Step 3: Corporate / Business Information
  hasBusiness: 'No' | 'Yes';
  businessName?: string;
  businessType?: string;
  registrationNo?: string;
  registeredAuthority?: string;
  panVatNumber?: string;
  establishedDate?: string;
  natureOfBusiness?: string;
  businessAddress?: string;
  designationInFirm?: string;
  employeeCount?: string;
  annualTurnover?: string;

  // Step 4: Income Information
  primaryIncomeSource: string;
  secondaryIncomeSource?: string;
  estimatedMonthlyIncome: string;
  estimatedAnnualIncome: string;
  otherFinancialDetails?: string;
  taxPayerCategory: string;
  bankName: string;
  bankBranch: string;
  bankAccountNo: string;
  bankAccountName: string;

  // Step 5: Transaction Information
  preferredBranch: string;
  accountTypeInterest: string;
  expectedMonthlyDeposit: string;
  expectedMonthlyWithdrawal: string;
  expectedAnnualTurnover: string;
  purposeOfAccount: string;
  digitalBankingOptIn: boolean;
  smsAlertOptIn: boolean;
  nomineeName: string;
  nomineeRelation: string;
  nomineeCitizenship?: string;
  nomineeDobOrAge?: string;
  nomineeContact?: string;
}

export interface EkymRecord {
  id: string;
  applicationNo: string;
  fullNameEn: string;
  fullNameNp: string;
  fatherName: string;
  grandfatherName: string;
  motherName?: string;
  spouseName?: string;
  dob: string;
  gender: string;
  citizenshipNo: string;
  citizenshipDistrict: string;
  phone: string;
  email?: string;
  permanentAddress: string;
  currentAddress: string;
  permProvince?: string;
  permDistrict?: string;
  tempProvince?: string;
  tempDistrict?: string;
  occupation: string;
  annualIncome: string;
  bankName: string;
  bankAccountNo: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeCitizenship?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  submittedAt: string;
  remarks?: string;
  memberPhoto?: string;
  citizenshipFront?: string;
  citizenshipBack?: string;
  details?: Partial<EkymFormData>;
}

export interface LoanRecord {
  id: string;
  trackingCode: string;
  applicantName: string;
  phone: string;
  email?: string;
  memberCode?: string;
  citizenshipNo?: string;
  address?: string;
  province?: string;
  district?: string;
  branch?: string;
  occupation?: string;
  collateralType?: string;
  loanScheme: string;
  amount: number;
  tenureMonths: number;
  monthlyIncome: number;
  purpose: string;
  status: 'Under Review' | 'Approved' | 'Rejected' | 'Disbursed';
  appliedDate: string;
  interestRate: number;
  remarks?: string;
  details?: Record<string, any>;
}

export interface MemberRecord {
  id: string;
  memberCode: string;
  fullName: string;
  phone: string;
  email?: string;
  citizenshipNo?: string;
  address?: string;
  branch: string;
  shareAmount: number;
  regularSavingBalance: number;
  loanBalance: number;
  joinedDate: string;
  status: 'Active' | 'Dormant' | 'Pending KYC';
}

export interface TransactionRecord {
  id: string;
  memberCode: string;
  transDate: string;
  particulars: string;
  type: 'CR' | 'DR';
  amount: number;
  balance: number;
}

export interface SiteSettingsCMS {
  coopNameEn: string;
  coopNameNp: string;
  coopLogoUrl: string;
  taglineEn: string;
  taglineNp: string;
  establishedBs: string;
  establishedAd?: string;
  establishedYear?: string;
  establishedYearNp?: string;
  establishedDateEn?: string;
  establishedDateNp?: string;
  establishedDateFullEn?: string;
  establishedDateFullNp?: string;
  tickerTextEn: string;
  tickerTextNp: string;
  tickerActive: boolean;
  phoneHeadOffice: string;
  phoneTollFree: string;
  emailOfficial: string;
  addressHeadOffice: string;
  addressHeadOfficeNp?: string;
  phone?: string;
  altPhone?: string;
  tollFree?: string;
  email?: string;
  addressEn?: string;
  addressNp?: string;
  province?: string;
  provinceEn?: string;
  district?: string;
  districtEn?: string;
  cityMunicipality?: string;
  municipalityEn?: string;
  wardNo?: string;
  toleStreet?: string;
  streetTole?: string;
  serviceAreaEn?: string;
  serviceAreaNp?: string;
  branchNetworkInfo?: string;
  serviceCoverageEn?: string;
  serviceCoverageNp?: string;
  branchNetworkTextEn?: string;
  branchNetworkTextNp?: string;
  googleMapsEmbedUrl?: string;
  mapsEmbedUrl?: string;
  officeHours: string;
  regdNo: string;
  panNo: string;
  statMembers: string;
  statSavings: string;
  statLoans: string;
  statCapital: string;
  statBranches: string;
}

export interface TeamMemberCMS {
  id: string;
  nameEn: string;
  nameNp: string;
  roleEn: string;
  roleNp: string;
  category: 'board' | 'management' | 'staff' | 'committee';
  hierarchyLevel?: 'tier1' | 'tier2' | 'tier3' | 'tier4';
  reportsToId?: string;
  qualification?: string;
  tenure?: string;
  photoUrl?: string;
  imageUrl?: string;
  phone?: string;
  email?: string;
  department?: string;
  departmentEn?: string;
  departmentNp?: string;
  qualificationEn?: string;
  qualificationNp?: string;
  experienceYears?: string;
  bioEn?: string;
  bioNp?: string;
  sortOrder?: number;
  order?: number;
}

export interface SlideCMS {
  id: string;
  titleEn: string;
  titleNp: string;
  subtitleEn: string;
  subtitleNp: string;
  imageUrl: string;
  ctaTextEn: string;
  ctaTextNp: string;
  ctaLink: string;
  sortOrder: number;
}

export interface PopupNoticeItem {
  id: string;
  noticeKey?: string;
  active: boolean;
  titleEn: string;
  titleNp: string;
  categoryEn: string;
  categoryNp: string;
  imageUrl: string;
  contentEn: string;
  contentNp: string;
  bulletPointsEn?: string[];
  bulletPointsNp?: string[];
  dateEn: string;
  dateNp: string;
  noticeRef: string;
  actionTextEn?: string;
  actionTextNp?: string;
  actionLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaFile {
  id: string | number;
  mediaKey: string;
  title: string;
  filename: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  category: 'branding' | 'hero' | 'notice' | 'gallery' | 'ekym' | 'general';
  altText: string;
  isSystemDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CmsProfilePage {
  titleEn: string;
  titleNp: string;
  subtitleEn?: string;
  subtitleNp?: string;
  establishedBs?: string;
  establishedAd?: string;
  regdNo?: string;
  panNo?: string;
  historyEn?: string;
  historyNp?: string;
  pointsEn?: string[];
  pointsNp?: string[];
  contentEn?: string;
  contentNp?: string;
  bulletPointsEn?: string[];
  bulletPointsNp?: string[];
  imageUrl?: string;
  pdfUrl?: string;
  bannerImage?: string;
}

export interface CmsMissionVisionPage {
  titleEn: string;
  titleNp: string;
  visionEn?: string;
  visionNp?: string;
  missionEn?: string;
  missionNp?: string;
  valuesEn?: string[];
  valuesNp?: string[];
  goalsEn?: string[];
  goalsNp?: string[];
  contentEn?: string;
  contentNp?: string;
  bulletPointsEn?: string[];
  bulletPointsNp?: string[];
  imageUrl?: string;
}

export interface CmsLeaderMessage {
  titleEn: string;
  titleNp: string;
  nameEn: string;
  nameNp: string;
  roleEn: string;
  roleNp: string;
  photoUrl: string;
  imageUrl?: string;
  dateEn?: string;
  dateNp?: string;
  messageEn?: string;
  messageNp?: string;
  contentEn?: string;
  contentNp?: string;
  bulletPointsEn?: string[];
  bulletPointsNp?: string[];
  signatureUrl?: string;
}

export interface CmsPagesState {
  profile: CmsProfilePage;
  missionVision: CmsMissionVisionPage;
  chairman: CmsLeaderMessage;
  ceo: CmsLeaderMessage;
}

export type LeadershipRoleCategory =
  | 'chairman'
  | 'ceo'
  | 'info_officer'
  | 'grievance_officer'
  | 'other';

export interface LeadershipMemberCMS {
  id: string;
  category: LeadershipRoleCategory;
  nameEn: string;
  nameNp: string;
  designationEn: string;
  designationNp: string;
  photoUrl: string;
  shortMessageEn: string;
  shortMessageNp: string;
  fullMessageEn?: string;
  fullMessageNp?: string;
  phone?: string;
  email?: string;
  officeRoomEn?: string;
  officeRoomNp?: string;
  availabilityEn?: string;
  availabilityNp?: string;
  actionType: 'read_more' | 'view_details' | 'file_grievance' | 'contact' | 'custom';
  actionLabelEn?: string;
  actionLabelNp?: string;
  customActionUrl?: string;
  sortOrder: number;
  isActive: boolean;
  publishedDate?: string;
}

export interface DepartmentCMS {
  id: string;
  nameEn: string;
  nameNp: string;
  headEn: string;
  headNp: string;
  phone: string;
  email: string;
  descriptionEn: string;
  descriptionNp: string;
  responsibilitiesEn: string[];
  responsibilitiesNp: string[];
  sortOrder?: number;
}

export interface ServiceCenterCMS {
  id: string;
  nameEn: string;
  nameNp: string;
  code: string;
  addressEn: string;
  addressNp: string;
  managerEn: string;
  managerNp: string;
  phone: string;
  email: string;
  operatingHours: string;
  mapUrl: string;
  isHeadOffice?: boolean;
  servicesProvidedEn: string[];
  servicesProvidedNp: string[];
  sortOrder?: number;
}

export interface ReportCMS {
  id: string;
  titleEn: string;
  titleNp: string;
  category: 'annual' | 'audit' | 'monthly' | 'progress' | 'bylaws' | 'disclosure' | 'form';
  fiscalYear: string;
  fileSize: string;
  fileUrl: string;
  publishDate: string;
  descriptionEn?: string;
  descriptionNp?: string;
}

export interface CareerCMS {
  id: string;
  jobTitleEn: string;
  jobTitleNp: string;
  titleEn?: string;
  titleNp?: string;
  department: string;
  positionsCount: number;
  positions?: number | string;
  deadline: string;
  employmentType: 'Full Time' | 'Contract' | 'Part Time' | string;
  experience: string;
  education: string;
  descriptionEn: string;
  descriptionNp: string;
  requirementsEn: string[];
  requirementsNp: string[];
  status: 'Open' | 'Closed' | 'active' | 'closed' | 'open' | string;
  code?: string;
  locationEn?: string;
  locationNp?: string;
  applyEmail?: string;
}

export interface HeadOfficeDepartmentItem {
  id?: string;
  name: string;
  nameNp?: string;
  ext: string;
  incharge: string;
  inchargeNp?: string;
  phone?: string;
  email?: string;
}

export interface HeadOfficeInfoCMS {
  officeNameEn: string;
  officeNameNp: string;
  descriptionEn?: string;
  descriptionNp?: string;
  addressEn: string;
  addressNp: string;
  province: string;
  district: string;
  city: string;
  ward: string;
  primaryPhone: string;
  altPhone?: string;
  tollFreePhone?: string;
  fax?: string;
  officialEmail: string;
  supportEmail?: string;
  websiteUrl?: string;
  workingDaysEn: string;
  workingDaysNp: string;
  workingHoursEn: string;
  workingHoursNp: string;
  counterHoursEn: string;
  counterHoursNp: string;
  sunToThuHoursEn?: string;
  sunToThuHoursNp?: string;
  fridayHoursEn?: string;
  fridayHoursNp?: string;
  holidayNoticeEn?: string;
  holidayNoticeNp?: string;
  regdNo: string;
  panNo: string;
  regNumber?: string;
  panNumber?: string;
  establishedDate?: string;
  landmarkEn?: string;
  landmarkNp?: string;
  gpsCoordinates?: string;
  googleMapEmbedUrl?: string;
  poBox?: string;
  postalCode?: string;
  mapUrl?: string;
  emergencyContact?: string;
  bulletPointsEn?: string[];
  bulletPointsNp?: string[];
  departmentsDirectory?: HeadOfficeDepartmentItem[];
}

export interface GrievanceRecordCMS {
  id: string;
  ticketNo: string;
  senderName: string;
  phone: string;
  email?: string;
  memberCode?: string;
  subject: string;
  category: 'deposit' | 'loan' | 'service' | 'staff' | 'digital' | 'other' | string;
  message: string;
  status: 'Pending' | 'Under Review' | 'Resolved' | 'Closed';
  submittedAt: string;
  resolutionNotes?: string;
  officerAssigned?: string;
}

export interface GrievanceOfficerCMS {
  officerNameEn: string;
  officerNameNp: string;
  designationEn: string;
  designationNp: string;
  phone: string;
  directMobile: string;
  email: string;
  roomNo: string;
  availabilityEn: string;
  availabilityNp: string;
  redressalCommitmentEn: string;
  redressalCommitmentNp: string;
}

export interface PrivacyPolicySection {
  headingEn: string;
  headingNp: string;
  bodyEn: string;
  bodyNp: string;
}

export interface PrivacyPolicyCMS {
  titleEn: string;
  titleNp: string;
  lastUpdated: string;
  sections: PrivacyPolicySection[];
}

export interface SocialLinksCMS {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  whatsapp?: string;
  tiktok?: string;
}

export interface BrandThemeCMS {
  themePreset?: string;
  primaryColor: string;
  primaryHover: string;
  primaryLight: string;
  secondaryColor: string;
  accentColor: string;
  headerBg?: string;
  topbarBg?: string;
}

export interface DocumentItemCMS {
  id: string;
  titleEn: string;
  titleNp: string;
  category: 'reports' | 'bylaws' | 'forms' | 'policies' | 'directives' | 'notices' | 'general';
  fileUrl: string;
  fileSize?: string;
  fileType?: string;
  publishDate?: string;
  fiscalYear?: string;
  descriptionEn?: string;
  descriptionNp?: string;
}

export interface NewsActivityItemCMS {
  id: string;
  titleEn: string;
  titleNp: string;
  category: 'News' | 'Activity' | 'CSR' | 'Event' | 'AGM' | 'Notice' | string;
  publishDate: string;
  locationEn?: string;
  locationNp?: string;
  summaryEn: string;
  summaryNp: string;
  imageUrl?: string;
  highlightsEn?: string[];
  highlightsNp?: string[];
  status: 'Published' | 'Draft';
}

export interface SuggestionItemCMS {
  id: string;
  ticketNo: string;
  senderName: string;
  memberType?: 'member' | 'non-member';
  phone?: string;
  email?: string;
  memberCode?: string;
  category: 'Service Quality' | 'Digital Banking' | 'Savings & Interest' | 'Loan Process' | 'Branch Facility' | 'General Idea' | string;
  subject: string;
  suggestionText: string;
  submittedAt: string;
  status: 'New' | 'Reviewed' | 'Implemented' | 'Archived';
  adminNotes?: string;
  isAnonymous?: boolean;
}

export interface FaqItemCMS {
  id: string;
  questionEn: string;
  questionNp: string;
  answerEn: string;
  answerNp: string;
  category: 'Membership' | 'Savings & Deposits' | 'Loans & Credit' | 'Digital Banking' | 'General' | string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface HistoryMilestoneItemCMS {
  id: string;
  yearBs: string;
  yearAd: string;
  titleEn: string;
  titleNp: string;
  descriptionEn: string;
  descriptionNp: string;
  badgeEn?: string;
  badgeNp?: string;
  icon?: string;
  sortOrder?: number;
}

export interface HistoryMilestonesPageCMS {
  titleEn: string;
  titleNp: string;
  subtitleEn: string;
  subtitleNp: string;
  overviewEn: string;
  overviewNp: string;
  introEn?: string;
  introNp?: string;
  highlightsEn?: string[];
  highlightsNp?: string[];
  milestones: HistoryMilestoneItemCMS[];
}

export interface WhyChooseUsItemCMS {
  id: string;
  icon: string;
  titleEn: string;
  titleNp: string;
  descriptionEn: string;
  descriptionNp: string;
  descEn?: string;
  descNp?: string;
  badgeEn?: string;
  badgeNp?: string;
  showOnHome?: boolean;
  sortOrder?: number;
}

export interface WhyChooseUsPageCMS {
  badgeEn: string;
  badgeNp: string;
  titleEn: string;
  titleNp: string;
  subtitleEn: string;
  subtitleNp: string;
  overviewEn: string;
  overviewNp: string;
  introEn?: string;
  introNp?: string;
  highlightsEn?: string[];
  highlightsNp?: string[];
  items: WhyChooseUsItemCMS[];
  pillars?: WhyChooseUsItemCMS[];
}

export interface ExchangeRateItemCMS {
  id: string;
  currencyCode: string;
  currencyNameEn: string;
  currencyNameNp: string;
  flag: string;
  unit: number;
  buyingRate: string;
  sellingRate: string;
  isFixed: boolean;
  isEnabled: boolean;
  updatedAt?: string;
  sortOrder?: number;
}

export interface MonthlyFinancialReportCMS {
  id: string;
  fiscalYear: string;           // e.g. "आ.व. २०८२/८३" or "FY 2082/83"
  monthNp: string;              // e.g. "असार", "जेठ", "वैशाख"
  monthEn?: string;             // e.g. "Ashadh", "Jestha", "Baishakh"
  reportDateNp: string;         // e.g. "२०८३-०३-०१" or "2083-03-01"
  reportDateEn?: string;        // e.g. "2026-06-15"
  
  // Row 1: Total Members
  totalMembers: number | string;       // e.g. 43892 or "४३,८९२"
  
  // Row 2: Share Capital
  shareCapital: string;               // e.g. "रु. ३१,०८,४०,४००/-"
  shareCapitalGrowth?: string;        // e.g. "0.00% वृद्धि"
  
  // Row 3: Reserve Fund (जगेडा कोष)
  reserveFund: string;                // e.g. "रु. ४१,१८,२४,२८०/-"
  reserveFundGrowth?: string;         // e.g. "0.00% वृद्धि"
  
  // Row 4: Total Institutional Capital (कुल संस्थागत पूँजी)
  totalInstitutionalCapital: string;  // e.g. "रु. ४२,६६,४४,५५८/-"
  totalInstitutionalCapitalNote?: string; // e.g. "जगेडा + अन्य"
  
  // Row 5: Other Funds (अन्य कोष)
  otherFunds: string;                 // e.g. "रु. १,४८,२०,२७८/-"
  
  // Row 6: Total Savings (कुल बचत)
  totalSavings: string;               // e.g. "रु. ३,८०,१८,०७,८६०/-"
  totalSavingsGrowth?: string;        // e.g. "0.00% वृद्धि"
  
  // Row 7: Loans Outstanding (लगानीमा रहेको ऋण)
  loansDisbursed: string;             // e.g. "रु. ३,६४,७०,९१,०६६/-"
  borrowerMembersCount?: number | string; // e.g. 10380 or "१०,३८० ऋणी सदस्य"
  
  // Row 8: Liquidity (Bank & Cash) (तरलता - बैंक तथा नगद)
  liquidityAmount: string;            // e.g. "रु. १,०७,५३,५४,०५५/-"
  liquidityPercent: string;           // e.g. "27.56%"
  
  // Row 9: Fixed Assets (स्थिर सम्पत्ति)
  fixedAssets: string;                // e.g. "रु. ८,८३,४७,०५४/-"
  
  // Row 10: Total Assets (कुल सम्पत्ति)
  totalAssets: string;                // e.g. "रु. ४,८८,२२,३८,५६१/-"
  
  // Bottom Badges / KPI indicators
  npaPercent?: string;                // e.g. "NPA 4.82%"
  nplPercent?: string;                // e.g. "NPL 2.45%"
  liqPercentBadge?: string;           // e.g. "Liq 27.56%"
  
  // Metadata & flags
  isPublished: boolean;
  isLatest?: boolean;
  sortOrder?: number;
  remarksEn?: string;
  remarksNp?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstitutionalProfileItemCMS {
  id: string;
  titleEn: string;
  titleNp: string;
  categoryEn: string;
  categoryNp: string;
  subtitleEn?: string;
  subtitleNp?: string;
  contentEn: string;
  contentNp: string;
  highlightsEn: string[];
  highlightsNp: string[];
  badgeEn?: string;
  badgeNp?: string;
  icon?: string;
  imageUrl?: string;
  documentUrl?: string;
  isPublished: boolean;
  sortOrder?: number;
  updatedAt?: string;
  
  // Embedded monthly financial report data if this profile item represents a monthly institutional disclosure
  monthlyReport?: MonthlyFinancialReportCMS;
}





