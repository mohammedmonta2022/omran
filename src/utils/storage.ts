import {
  Student,
  AttendanceRecord,
  EvaluationCriterion,
  StudentEvaluation,
  AppSettings,
  ChatMessage,
  PlatformDataBackup,
  User,
} from '../types';

const STORAGE_KEY = 'omran_quran_platform_data_v1';
const AUTH_KEY = 'omran_quran_auth_user_v1';

export const DEFAULT_CRITERIA: EvaluationCriterion[] = [
  {
    id: 'crit-1',
    title: 'التسميع الجديد (الحفظ المقرر)',
    type: 'numeric',
    maxScore: 10,
    isDefault: true,
  },
  {
    id: 'crit-2',
    title: 'المراجعة والربط السابق',
    type: 'numeric',
    maxScore: 10,
    isDefault: true,
  },
  {
    id: 'crit-3',
    title: 'أحكام التجويد ومخارج الحروف',
    type: 'stars',
    maxScore: 5,
    isDefault: true,
  },
  {
    id: 'crit-4',
    title: 'الطلاقة وحسن الترتيل',
    type: 'options',
    options: ['ممتاز ومتقن 🌟', 'جيد جداً 👍', 'جيد مع بعض التردد', 'يحتاج إعادة وتثبيت ⚠️'],
    isDefault: true,
  },
  {
    id: 'crit-5',
    title: 'ملاحظة وتوجيه المقرئ',
    type: 'text',
    isDefault: true,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  allowStudentRegistration: true,
  weeklyWorkDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  halagahName: 'حلقة الإمام الشاطبي لتحفيظ القرآن الكريم',
  teacherName: 'الشيخ عبد الله بن عبد العزيز المقرئ',
  teacherPhone: '+966501234567',
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'عمر عبد الرحمن المنصور',
    password: '123',
    phone: '+966551112233',
    parentName: 'عبد الرحمن المنصور',
    parentPhones: [
      { label: 'الأب (واتساب)', phone: '+966551112233' },
      { label: 'الأم', phone: '+966552223344' },
    ],
    age: 12,
    startingSurahId: 2,
    startingAyah: 1,
    currentSurahId: 2,
    currentAyah: 45,
    dailyNewCapacity: 'وجه كامل (١٥ آية)',
    dailyRevisionCapacity: 'نصف جزء (١٠ أوجه)',
    level: 'قوي',
    notes: 'طالب مجتهد، صوت ندي، يحفظ بسرعة ويضبط الأحكام.',
    createdAt: '2026-08-01',
    aiPlan: {
      currentGoal: 'إتمام الربع الأول من سورة البقرة مع ضبط المتشابهات',
      todayAssignedSurah: 'البقرة',
      todayAssignedSurahId: 2,
      todayAssignedFromAyah: 46,
      todayAssignedToAyah: 60,
      todayAssignedRevision: 'سورة البقرة من آية ١ إلى ٤٥',
      recommendedSheikh: 'الشيخ محمود خليل الحصري (المصحف المعلم)',
      difficultyRating: 'متوسط',
      memorizationStrategy: 'الربط بين معاني قصص بني إسرائيل وضبط رؤوس الآيات بالتكرار ٧ مرات',
      tajweedFocus: 'أحكام النون الساكنة والتنوين (الإظهار والإدغام)',
      lastCalculatedDate: new Date().toISOString().split('T')[0],
      planHistoryNote: 'الخطة في نسق متصاعد نظراً لتميز الطالب في التسميع السابق.',
    },
  },
  {
    id: 'std-2',
    name: 'يوسف أحمد السعيد',
    password: '123',
    phone: '+966553334455',
    parentName: 'أحمد السعيد',
    parentPhones: [
      { label: 'ولي الأمر (الأب)', phone: '+966553334455' },
    ],
    age: 10,
    startingSurahId: 67,
    startingAyah: 1,
    currentSurahId: 67,
    currentAyah: 18,
    dailyNewCapacity: 'نصف وجه (٧ آيات)',
    dailyRevisionCapacity: 'سورتان من جزء تبارك',
    level: 'متوسط',
    notes: 'يحتاج تشجيعاً مستمراً وتركيزاً على مخارج حرف الضاد والقاف.',
    createdAt: '2026-08-05',
    aiPlan: {
      currentGoal: 'إتقان سورة الملك كاملة وحفظ سورة القلم',
      todayAssignedSurah: 'الملك',
      todayAssignedSurahId: 67,
      todayAssignedFromAyah: 19,
      todayAssignedToAyah: 30,
      todayAssignedRevision: 'سورة الملك من آية ١ إلى ١٨',
      recommendedSheikh: 'الشيخ محمد صديق المنشاوي (المعلم)',
      difficultyRating: 'سهل',
      memorizationStrategy: 'الترديد مع الشيخ مرتين ثم التسميع على أحد الوالدين',
      tajweedFocus: 'المد المتصل والمنفصل ومقدار المد ٤ حركات',
      lastCalculatedDate: new Date().toISOString().split('T')[0],
    },
  },
  {
    id: 'std-3',
    name: 'بلال محمد الشريف',
    password: '123',
    phone: '+966554445566',
    parentName: 'محمد الشريف',
    parentPhones: [
      { label: 'الأب', phone: '+966554445566' },
      { label: 'الأخ الأكبر', phone: '+966555556677' },
    ],
    age: 9,
    startingSurahId: 78,
    startingAyah: 1,
    currentSurahId: 80,
    currentAyah: 1,
    dailyNewCapacity: 'نصف صفحة',
    dailyRevisionCapacity: 'سورة النبأ والنازعات',
    level: 'ضعيف',
    notes: 'يتشتت بسهولة، تم وضع خطة تخفيفية لتشجيعه وتثبيت سورة النبأ والنازعات.',
    createdAt: '2026-08-10',
    aiPlan: {
      currentGoal: 'تثبيت قصار السور من جزء عم وحفظ سورة عبس',
      todayAssignedSurah: 'عبس',
      todayAssignedSurahId: 80,
      todayAssignedFromAyah: 1,
      todayAssignedToAyah: 16,
      todayAssignedRevision: 'سورة النبأ كاملة',
      recommendedSheikh: 'الشيخ مشاري راشد العفاسي',
      difficultyRating: 'سهل',
      memorizationStrategy: 'تجزئة المقطع إلى ٣ آيات وتكرار كل مجموعة ٥ مرات',
      tajweedFocus: 'القلقلة في قطب جد',
      lastCalculatedDate: new Date().toISOString().split('T')[0],
    },
  },
  {
    id: 'std-4',
    name: 'عبد الله فيصل القحطاني',
    password: '123',
    phone: '+966556667788',
    parentName: 'فيصل القحطاني',
    parentPhones: [
      { label: 'ولي الأمر (الأب)', phone: '+966556667788' },
    ],
    age: 14,
    startingSurahId: 18,
    startingAyah: 1,
    currentSurahId: 18,
    currentAyah: 75,
    dailyNewCapacity: 'صفحة ونصف',
    dailyRevisionCapacity: 'جزء كامل',
    level: 'قوي',
    notes: 'يستعد للمشاركة في مسابقة القرآن المحلية، حفظه متقن ومتميز.',
    createdAt: '2026-08-12',
    aiPlan: {
      currentGoal: 'ختم سورة الكهف والبدء في سورة مريم',
      todayAssignedSurah: 'الكهف',
      todayAssignedSurahId: 18,
      todayAssignedFromAyah: 76,
      todayAssignedToAyah: 98,
      todayAssignedRevision: 'سورة الإسراء كاملة وسورة الكهف حتى آية ٧٥',
      recommendedSheikh: 'الشيخ علي الحذيفي',
      difficultyRating: 'متوسط',
      memorizationStrategy: 'التلاوة مع تدبر قصة موسى والخضر وقصة ذي القرنين',
      tajweedFocus: 'تطبيق أحكام الراءات تفخيماً وترقيقاً',
      lastCalculatedDate: new Date().toISOString().split('T')[0],
    },
  },
  {
    id: 'std-5',
    name: 'زياد خالد الدوسري',
    password: '123',
    phone: '+966557778899',
    parentName: 'خالد الدوسري',
    parentPhones: [
      { label: 'الأب', phone: '+966557778899' },
    ],
    age: 11,
    startingSurahId: 55,
    startingAyah: 1,
    currentSurahId: 55,
    currentAyah: 30,
    dailyNewCapacity: 'وجه كامل',
    dailyRevisionCapacity: 'نصف جزء',
    level: 'متوسط',
    notes: 'يحفظ سورة الرحمن، بحاجة لضبط الآيات المتكررة (فبأي آلاء ربكما تكذبان).',
    createdAt: '2026-08-15',
    aiPlan: {
      currentGoal: 'إتمام سورة الرحمن والواقعة',
      todayAssignedSurah: 'الرحمن',
      todayAssignedSurahId: 55,
      todayAssignedFromAyah: 31,
      todayAssignedToAyah: 55,
      todayAssignedRevision: 'سورة الرحمن من آية ١ إلى ٣٠',
      recommendedSheikh: 'الشيخ عبد الباسط عبد الصمد',
      difficultyRating: 'متوسط',
      memorizationStrategy: 'العد اليدوي للآيات المكررة وربط كل نعمة بالآية التي تليها',
      tajweedFocus: 'الغنة بمقدار حركتين في الميم والنون المشددتين',
      lastCalculatedDate: new Date().toISOString().split('T')[0],
    },
  },
];

const todayStr = new Date().toISOString().split('T')[0];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', date: todayStr, studentId: 'std-1', status: 'present', updatedAt: todayStr },
  { id: 'att-2', date: todayStr, studentId: 'std-2', status: 'present', updatedAt: todayStr },
  { id: 'att-3', date: todayStr, studentId: 'std-3', status: 'late', note: 'تأخر ١٠ دقائق بسبب الازدحام', updatedAt: todayStr },
  { id: 'att-4', date: todayStr, studentId: 'std-4', status: 'excused', note: 'معتذر لظرف عائلي', updatedAt: todayStr },
  { id: 'att-5', date: todayStr, studentId: 'std-5', status: 'absent', updatedAt: todayStr },
];

export const INITIAL_EVALUATIONS: StudentEvaluation[] = [
  {
    id: 'eval-1',
    date: todayStr,
    studentId: 'std-1',
    attendanceStatus: 'present',
    scores: {
      'crit-1': 10,
      'crit-2': 9.5,
      'crit-3': 5,
      'crit-4': 'ممتاز ومتقن 🌟',
      'crit-5': 'ما شاء الله تبارك الله، تلاوة خاشعة وإتقان بديع للورد.',
    },
    tasmeeDetails: {
      completedNewPortion: 'كامل',
      memorizedExactVersesNotes: 'سرد سورة البقرة من آية ٤٦ إلى ٦٠ دون أي توقف أو خطأ',
      completedRevisionPortion: 'كامل',
      revisionNotes: 'راجع من آية ١ إلى ٤٥ بإتقان',
      teacherNote: 'طالب نموذجي، تم منحه وسام النجوم للحلقة.',
    },
    aiFeedback: {
      statusAssessment: 'متقدم وسريع الإتقان',
      analysis: 'أظهر عمر سرعة بديهة وتمكناً تاماً من الآيات المقررة، ويمكن رفع التحدي تدريجياً لزيادة الحصيلة.',
      nextDayPlan: {
        surahName: 'البقرة',
        surahId: 2,
        fromAyah: 61,
        toAyah: 75,
        revisionPortion: 'سورة البقرة من آية ١ إلى ٦٠',
      },
      pedagogicalAdvice: 'تعزيز الربط بين قصة البقرة وسياق الآيات وتثبيت الحفظ بالصلاة بها في السنن.',
      recommendedSheikh: 'الشيخ محمود خليل الحصري (المصحف المعلم)',
      mutashabihatTip: 'انتبه للمتشابهات في (وإذ قلتم يا موسى لن نصبر على طعام واحد).',
    },
    createdAt: todayStr,
  },
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: 'السلام عليكم ورحمة الله وبركاته يا شيخنا الفاضل. أهلاً بك في منصة "عمران" القرآنية الذكية. أنا مساعدك في إدارة الحلقة وتكييف خطط الطلاب ومتابعة إنجازهم. كيف يمكنني خدمتك اليوم في حلقتنا المباركة؟',
    timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
  },
];

export function loadPlatformData(): PlatformDataBackup {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        version: parsed.version || '1.0.0',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        settings: parsed.settings || DEFAULT_SETTINGS,
        students: parsed.students || INITIAL_STUDENTS,
        attendance: parsed.attendance || INITIAL_ATTENDANCE,
        criteria: parsed.criteria || DEFAULT_CRITERIA,
        evaluations: parsed.evaluations || INITIAL_EVALUATIONS,
        chatMessages: parsed.chatMessages || INITIAL_CHAT,
      };
    }
  } catch (e) {
    console.error('Error loading platform data from localStorage:', e);
  }

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    settings: DEFAULT_SETTINGS,
    students: INITIAL_STUDENTS,
    attendance: INITIAL_ATTENDANCE,
    criteria: DEFAULT_CRITERIA,
    evaluations: INITIAL_EVALUATIONS,
    chatMessages: INITIAL_CHAT,
  };
}

export function savePlatformData(data: PlatformDataBackup): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving platform data to localStorage:', e);
  }
}

export function getAuthUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading auth user:', e);
  }
  // Default teacher account
  return {
    id: 'teacher-1',
    name: 'الشيخ عبد الله المقرئ',
    role: 'teacher',
    phone: '+966501234567',
    email: 'sheikh.abdullah@omran.edu',
  };
}

export function setAuthUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  } catch (e) {
    console.error('Error setting auth user:', e);
  }
}
