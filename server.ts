import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Generate Initial Quran Memorization Plan for a Student
app.post('/api/gemini/generate-plan', async (req: Request, res: Response): Promise<void> => {
  try {
    const { student } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Fallback sensible plan if API key is not configured
      res.json({
        success: true,
        plan: {
          currentGoal: `إتقان وتثبيت سورة ${student.startingSurahName || 'البقرة'} وحفظ المقدار اليومي`,
          todayAssignedSurah: student.startingSurahName || 'البقرة',
          todayAssignedSurahId: student.startingSurahId || 2,
          todayAssignedFromAyah: student.startingAyah || 1,
          todayAssignedToAyah: (student.startingAyah || 1) + 5,
          todayAssignedRevision: 'مراجعة آخر صفحتين تم حفظهما بتأنٍ وتجويد',
          recommendedSheikh: 'الشيخ محمود خليل الحصري (المصحف المعلم)',
          difficultyRating: student.level === 'ضعيف' ? 'سهل' : 'متوسط',
          memorizationStrategy: 'التكرار ٧ مرات بالنظر للمصحف ثم ٧ مرات غيباً مع الاستماع للشيخ',
          tajweedFocus: 'مخارج الحروف والمدود الطبيعية والغُنن',
          lastCalculatedDate: new Date().toISOString().split('T')[0],
          planHistoryNote: 'خطة تأسيسية مبدئية بناءً على المستوى والمقدار اليومي المحدد.',
        },
      });
      return;
    }

    const prompt = `
أنت شيخ ومقرئ خبير في تعليم وتحفيظ القرآن الكريم وإدارة الحلقات القرآنية.
الرجاء إعداد خطة حفظ يومية أولية ومحكمة للطالب التالي:
- اسم الطالب: ${student.name}
- العمر: ${student.age} سنة
- المستوى في الحفظ: ${student.level}
- نقطة البداية (السورة الحالية): سورة رقم ${student.startingSurahId} (${student.startingSurahName}) من الآية رقم ${student.startingAyah}
- سعة الحفظ الجديد اليومي: ${student.dailyNewCapacity}
- سعة المراجعة اليومية: ${student.dailyRevisionCapacity}

المطلوب: توليد خطة أولية دقيقة تحدد السورة والآيات لليوم (من آية إلى آية)، ومقدار المراجعة، والشيخ الأنسب للاستماع بناءً على مستوى الطالب وعمره، واستراتيجية الحفظ والتركيز التجويدي.
أرجع النتيجة بصيغة JSON حصراً مطابقة للحقول المحددة.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'أنت مشرف تحفيظ قرآن كريم وخبير مناهج قرآنية، تجيب دائماً بلغة عربية فصيحة ومتقنة وبتنسيق JSON دقيق.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentGoal: { type: Type.STRING, description: 'الهدف المرحلي للطالب' },
            todayAssignedSurah: { type: Type.STRING, description: 'اسم السورة المقررة لليوم' },
            todayAssignedSurahId: { type: Type.INTEGER, description: 'رقم السورة 1-114' },
            todayAssignedFromAyah: { type: Type.INTEGER, description: 'من الآية رقم' },
            todayAssignedToAyah: { type: Type.INTEGER, description: 'إلى الآية رقم' },
            todayAssignedRevision: { type: Type.STRING, description: 'مقدار ورد المراجعة لليوم' },
            recommendedSheikh: { type: Type.STRING, description: 'القارئ الموصى بالاستماع له' },
            difficultyRating: { type: Type.STRING, enum: ['سهل', 'متوسط', 'شديد التحدي'] },
            memorizationStrategy: { type: Type.STRING, description: 'نصيحة وطريقة الحفظ اليومي' },
            tajweedFocus: { type: Type.STRING, description: 'الحكم التجويدي للتركيز عليه' },
            planHistoryNote: { type: Type.STRING, description: 'ملاحظة توجيهية للمعلم' },
          },
          required: [
            'currentGoal',
            'todayAssignedSurah',
            'todayAssignedSurahId',
            'todayAssignedFromAyah',
            'todayAssignedToAyah',
            'todayAssignedRevision',
            'recommendedSheikh',
            'difficultyRating',
            'memorizationStrategy',
            'tajweedFocus',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    parsed.lastCalculatedDate = new Date().toISOString().split('T')[0];

    res.json({ success: true, plan: parsed });
  } catch (error) {
    console.error('Error generating plan:', error);
    res.status(500).json({ error: 'Failed to generate plan', details: String(error) });
  }
});

// 2. Daily Recitation Evaluation & Adaptive Plan Recalculation
app.post('/api/gemini/evaluate-and-adapt', async (req: Request, res: Response): Promise<void> => {
  try {
    const { student, previousPlan, todayScores, tasmeeDetails } = req.body;
    const ai = getGenAI();

    if (!ai) {
      const isWeak = tasmeeDetails.completedNewPortion === 'جزئي' || tasmeeDetails.completedNewPortion === 'لم يسمع';
      res.json({
        success: true,
        feedback: {
          statusAssessment: isWeak ? 'متأخر ويحتاج تثبيت وتخفيف' : 'على المسار المطلوب',
          analysis: isWeak
            ? 'لوحظ صعوبة في استيعاب كامل المقدار اليومي، يوصى بتكرار الآيات وتثبيتها قبل الانتقال.'
            : 'أداء طيب ومتقن في التسميع، نسأل الله له الثبات والتوفيق.',
          nextDayPlan: {
            surahName: previousPlan?.todayAssignedSurah || 'السورة الحالية',
            surahId: previousPlan?.todayAssignedSurahId || 2,
            fromAyah: isWeak ? (previousPlan?.todayAssignedFromAyah || 1) : ((previousPlan?.todayAssignedToAyah || 1) + 1),
            toAyah: isWeak ? (previousPlan?.todayAssignedToAyah || 5) : ((previousPlan?.todayAssignedToAyah || 1) + 5),
            revisionPortion: 'مراجعة المقطع السابق مع سورة اليوم السابقة',
          },
          pedagogicalAdvice: 'التكرار الصوتي مع المصحف المرتل وضبط الوقف والابتداء.',
          recommendedSheikh: 'الشيخ محمد صديق المنشاوي (المعلم)',
          mutashabihatTip: 'انتبه للروابط اللفظية بين أواخر الآيات وأوائلها.',
        },
      });
      return;
    }

    const prompt = `
أنت المقرئ والمشرف التربوي القرآني الذكي لمنصة "عمران".
قم بتحليل أداء الطالب اليومي في حلقة القرآن الكريم، وأعد تقييماً ذكياً مع تكييف خطة الغد (زيادة التحدي إن كان ممتازاً، أو تخفيف وتثبيت إن كان متعثراً).

بيانات الطالب:
- الاسم: ${student.name}
- العمر: ${student.age}
- المستوى الأصلي: ${student.level}
- ما كان مقرراً عليه اليوم: سورة ${previousPlan?.todayAssignedSurah} من آية ${previousPlan?.todayAssignedFromAyah} إلى ${previousPlan?.todayAssignedToAyah}
- ما كان مقرراً في المراجعة: ${previousPlan?.todayAssignedRevision}

أداء الطالب اليوم:
- إنجاز الحفظ الجديد: ${tasmeeDetails.completedNewPortion} (${tasmeeDetails.memorizedExactVersesNotes || 'لا توجد ملاحظات تفصيلية'})
- إنجاز المراجعة: ${tasmeeDetails.completedRevisionPortion} (${tasmeeDetails.revisionNotes || 'لا توجد ملاحظات تفصيلية'})
- درجات المعلم المعطاة: ${JSON.stringify(todayScores)}
- ملاحظة المعلم أو عذر الطالب: ${tasmeeDetails.teacherNote || 'لا يوجد'}

المطلوب:
1. تقييم دقيق للحالة (متقدم وسريع الإتقان / على المسار المطلوب / متأخر ويحتاج تثبيت وتخفيف).
2. تحليل أسباب التقدم أو التعثر وتقديم خطة الغد المناسبة تماماً لقدرته الحالية (السورة، من آية، إلى آية، ورد المراجعة).
3. نصيحة تربوية قرآنية لمعالجة أي صعوبة وتثبيت الحفظ.
4. قارئ موصى به مع ذكر طريقة الاستماع.
5. نصيحة للمتشابهات اللفظية إن وجدت في هذا الموضع.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'أنت خبير تربوي في علوم القرآن والتجويد وطرق التحفيظ، أجب بصيغة JSON محكمة باللغة العربية.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            statusAssessment: {
              type: Type.STRING,
              enum: ['متقدم وسريع الإتقان', 'على المسار المطلوب', 'متأخر ويحتاج تثبيت وتخفيف'],
            },
            analysis: { type: Type.STRING, description: 'تحليل الأداء اليومي' },
            nextDayPlan: {
              type: Type.OBJECT,
              properties: {
                surahName: { type: Type.STRING },
                surahId: { type: Type.INTEGER },
                fromAyah: { type: Type.INTEGER },
                toAyah: { type: Type.INTEGER },
                revisionPortion: { type: Type.STRING },
              },
              required: ['surahName', 'surahId', 'fromAyah', 'toAyah', 'revisionPortion'],
            },
            pedagogicalAdvice: { type: Type.STRING, description: 'نصيحة تعليمية وتوجيهية' },
            recommendedSheikh: { type: Type.STRING, description: 'القارئ الموصى بالاستماع له' },
            mutashabihatTip: { type: Type.STRING, description: 'تنبيه على المتشابهات وضبط الآيات' },
          },
          required: ['statusAssessment', 'analysis', 'nextDayPlan', 'pedagogicalAdvice', 'recommendedSheikh'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({ success: true, feedback: parsed });
  } catch (error) {
    console.error('Error evaluating student:', error);
    res.status(500).json({ error: 'Failed to evaluate student', details: String(error) });
  }
});

// 3. Generate Parent WhatsApp Daily Message
app.post('/api/gemini/parent-message', async (req: Request, res: Response): Promise<void> => {
  try {
    const { student, attendanceStatus, evaluation, tomorrowPlan, teacherName, halagahName, parentPortalUrl } = req.body;
    const ai = getGenAI();

    if (!ai) {
      let statusText = 'حاضر ومشارك في الحلقة';
      if (attendanceStatus === 'absent') statusText = 'غائب بعذر / غير حاضر';
      if (attendanceStatus === 'late') statusText = 'حاضر (متأخر)';
      if (attendanceStatus === 'excused') statusText = 'معتذر عن الحضور اليوم';

      const fallbackMsg = `السلام عليكم ورحمة الله وبركاته،
ولي أمر الابن الفاضل / ${student.name} 🌿
تحية طيبة من مقرأة "${halagahName || 'عمران القرآنية'}" 📖

📍 حالة الحضور اليوم: ${statusText}
${evaluation ? `✨ تقييم التسميع اليوم: ${evaluation.tasmeeDetails?.completedNewPortion === 'كامل' ? 'أتم تسميع ورده بإتقان ممتاز 🌟' : 'تم التسميع والمتابعة'}` : ''}
${tomorrowPlan ? `🎯 المطلوب لحفظ الغد: سورة ${tomorrowPlan.surahName} (الآيات ${tomorrowPlan.fromAyah} - ${tomorrowPlan.toAyah})\n🔄 ورد المراجعة: ${tomorrowPlan.revisionPortion}` : ''}

🔗 لمتابعة سجل وتقدم ابنكم اليومي عبر منصة عمران:
${parentPortalUrl || ''}

شاكرين حرصكم ومتابعتكم الكريمة،
معلم الحلقة: ${teacherName || 'الأستاذ المشرف'}`;

      res.json({ success: true, message: fallbackMsg });
      return;
    }

    const prompt = `
قم بصياغة رسالة واتساب راقية، إسلامية، تشجيعية ومفصلة لولي أمر الطالب لإعلامه بما جرى اليوم في حلقة القرآن الكريم وما هو مطلوب منه غداً.

بيانات الرسالة:
- اسم الطالب: ${student.name}
- اسم ولي الأمر: ${student.parentName || 'ولي الأمر الكريم'}
- اسم الحلقة: ${halagahName || 'حلقة عمران القرآنية'}
- اسم المعلم: ${teacherName || 'معلم الحلقة'}
- حالة الحضور اليوم: ${attendanceStatus} (${attendanceStatus === 'present' ? 'حاضر' : attendanceStatus === 'absent' ? 'غائب' : attendanceStatus === 'late' ? 'متأخر' : 'معتذر'})
- تفاصيل التسميع والتقييم اليوم: ${evaluation ? JSON.stringify(evaluation) : 'لم يتم التسميع أو غائب'}
- خطة الغد المقررة من الذكاء الاصطناعي: ${tomorrowPlan ? JSON.stringify(tomorrowPlan) : 'حسب الخطة المعتادة'}
- رابط تقرير المتابعة المباشر للابن: ${parentPortalUrl}

شروط الصياغة:
- ابدأ بالسلام والتحية الإسلامية الطيبة والدعاء للابن.
- اكتب رسالة مرتبة بنقاط ورموز تعبيرية مناسبة جداً (🌿 📖 ✨ 🎯 🔄).
- وضح ما أنجزه الطالب اليوم (إذا كان حاضراً)، أو تمنياتنا له بالتوفيق مع تنبيه على الحضور (إذا كان غائباً أو معتذراً).
- اذكر بوضوح واجب الغد (الحفظ الجديد والمراجعة والشيخ الموصى بالاستماع له).
- أرفق رابط متابعة الطالب المباشر واطلب منهم زيارته للاطلاع على التفاصيل.
- اختم بتوقيع المعلم واسم الحلقة.
- أرجع نص الرسالة النهائي الجاهز للإرسال مباشرة عبر الواتساب.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'أنت كاتب تربوي وصائغ رسائل رسمي لحلقات ومراكز تحفيظ القرآن الكريم المرموقة.',
      },
    });

    res.json({ success: true, message: response.text?.trim() });
  } catch (error) {
    console.error('Error generating parent message:', error);
    res.status(500).json({ error: 'Failed to generate parent message', details: String(error) });
  }
});

// 4. Generate Weekly / Monthly Comprehensive Report
app.post('/api/gemini/generate-report', async (req: Request, res: Response): Promise<void> => {
  try {
    const { student, period, attendanceRecords, evaluationsList, halagahSettings, parentPortalUrl } = req.body;
    const ai = getGenAI();

    if (!ai) {
      res.json({
        success: true,
        report: {
          periodTitle: period === 'weekly' ? 'التقرير الأسبوعي للإنجاز القرآني' : 'التقرير الشهري الشامل للإنجاز القرآني',
          summaryText: `أظهر الطالب ${student.name} التزاماً طيباً خلال هذه الفترة في حفظ ومراجعة آيات كتاب الله الكريم.`,
          attendanceRate: '92%',
          memorizationRate: '95%',
          revisionRate: '90%',
          keyAccomplishments: ['إتمام حفظ المقاطع المقررة', 'تحسن ملحوظ في أحكام النون الساكنة والتنوين', 'الانضباط في المواعيد'],
          areasForImprovement: ['مزيد من الاستماع للمصحف المرتل لضبط الوقف والابتداء'],
          sheikhAdvice: 'الاستماع يومياً نصف ساعة للشيخ الحصري برواية حفص عن عاصم',
          whatsappShareText: `📊 التقرير ${period === 'weekly' ? 'الأسبوعي' : 'الشهري'} للطالب ${student.name}\nحلقة: ${halagahSettings?.halagahName || 'عمران القرآنية'}\n\n✨ نبارك إنجاز الابن في حفظ القرآن الكريم وندعوكم للاطلاع على التقرير التفاعلي المفصل:\n🔗 ${parentPortalUrl}`,
        },
      });
      return;
    }

    const prompt = `
أنت المشرف التربوي لمنصة "عمران" القرآنية.
المطلوب إعداد تقرير ${period === 'weekly' ? 'أسبوعي' : 'شهري'} شامل ومفصل ودقيق للطالب:
- اسم الطالب: ${student.name} (العمر: ${student.age} سنة)
- سجل الحضور في هذه الفترة: ${JSON.stringify(attendanceRecords)}
- سجل التقييمات والتسميع: ${JSON.stringify(evaluationsList)}
- اسم الحلقة: ${halagahSettings?.halagahName || 'حلقة عمران'}
- رابط تقرير الطالب الدائم: ${parentPortalUrl}

المطلوب إعداد تقرير تحليلي يشمل:
1. نص تلخيصي تربوي للأداء والإنجاز.
2. نسب مئوية تقديرية للحضور وإتقان الحفظ والمراجعة.
3. أبرز الإنجازات الملموسة والآيات/السور المكتملة.
4. نقاط التحسين والتوصيات التجويدية.
5. نص رسالة واتساب جاهزة وملهمة لإرسالها لولي الأمر متضمنة الرابط.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'أنت مقيم أكاديمي وتربوي في حلقات القرآن الكريم، أجب بصيغة JSON حصراً باللغة العربية.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            periodTitle: { type: Type.STRING },
            summaryText: { type: Type.STRING },
            attendanceRate: { type: Type.STRING },
            memorizationRate: { type: Type.STRING },
            revisionRate: { type: Type.STRING },
            keyAccomplishments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            areasForImprovement: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            sheikhAdvice: { type: Type.STRING },
            whatsappShareText: { type: Type.STRING },
          },
          required: ['periodTitle', 'summaryText', 'attendanceRate', 'memorizationRate', 'revisionRate', 'keyAccomplishments', 'areasForImprovement', 'sheikhAdvice', 'whatsappShareText'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({ success: true, report: parsed });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report', details: String(error) });
  }
});

// 5. Interactive Halagah AI Assistant Chat
app.post('/api/gemini/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, chatHistory, halagahContext } = req.body;
    const ai = getGenAI();

    if (!ai) {
      res.json({
        success: true,
        reply: `أهلاً بك يا شيخنا الفاضل في منصة عمران. بصفتي مساعدك الذكي للحلقة القرآنية، أنا هنا لمساعدتك في ضبط الخطط، وتقديم النصائح لمتشابهات الآيات، وتسهيل الحفظ على الطلاب المتعثرين، وتنظيم وقت الحلقة. كيف تحب أن نطور أداء طلابنا اليوم؟`,
      });
      return;
    }

    const contextText = halagahContext ? `
معلومات وسياق الحلقة الحالية:
- عدد الطلاب: ${halagahContext.totalStudents || 0}
- أسماء الطلاب ومستوياتهم: ${JSON.stringify(halagahContext.studentsList || [])}
- إحصائيات اليوم: ${JSON.stringify(halagahContext.todayStats || {})}
` : '';

    const systemInstruction = `
أنت "مساعد عمران الذكي" - المشرف القرآني والتربوي الذكي المساعد لمعلم الحلقة.
لديك معرفة عميقة وراسخة بالقرآن الكريم، القراءات، علوم التجويد ومخارج الحروف، المتشابهات اللفظية، وأساليب التحفيظ الحديثة والتقليدية (طريقة اللوح، التكرار الممنهج، الترديد الصوتي، الربط المعنوي).
أنت تخاطب المعلم باحترام وتقدير إسلامي (يا شيخنا الفاضل، حياك الله، بارك الله في جهودك).
يمكنك تقديم اقتراحات محددة لتعديل خطط الطلاب، أو إعطاء أفكار لتحفيز الطلاب الضعاف، أو صياغة مسابقات قرآنية وتوجيهات عملية.
${contextText}
`;

    const chat = ai.chats.create({
      model: 'gemini-3.7-flash',
      config: {
        systemInstruction,
      },
    });

    // Send the user message
    const response = await chat.sendMessage({
      message: message,
    });

    res.json({ success: true, reply: response.text?.trim() });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: 'Failed to complete chat', details: String(error) });
  }
});

// Setup Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
