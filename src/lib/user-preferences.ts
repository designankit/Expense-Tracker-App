import { supabase } from './supabaseClient'

export interface UserPreferences {
  currency: string
  language: string
  timezone: string
  budget_style: string
  default_savings_percentage: number
  selected_categories: string[]
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  currency: 'INR',
  language: 'en',
  timezone: 'Asia/Kolkata',
  budget_style: 'balanced',
  default_savings_percentage: 20,
  selected_categories: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare']
}

/**
 * Get user preferences from the database
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('currency, language, timezone, budget_style, default_savings_percentage, selected_categories')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      console.warn('Could not fetch user preferences, using defaults:', error)
      return DEFAULT_PREFERENCES
    }

    return {
      currency: (profile as Record<string, unknown>).currency as string || DEFAULT_PREFERENCES.currency,
      language: (profile as Record<string, unknown>).language as string || DEFAULT_PREFERENCES.language,
      timezone: (profile as Record<string, unknown>).timezone as string || DEFAULT_PREFERENCES.timezone,
      budget_style: (profile as Record<string, unknown>).budget_style as string || DEFAULT_PREFERENCES.budget_style,
      default_savings_percentage: (profile as Record<string, unknown>).default_savings_percentage as number || DEFAULT_PREFERENCES.default_savings_percentage,
      selected_categories: (profile as Record<string, unknown>).selected_categories as string[] || DEFAULT_PREFERENCES.selected_categories
    }
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return DEFAULT_PREFERENCES
  }
}

/**
 * Format currency based on user preferences
 */
export function formatCurrency(amount: number, currency: string = 'INR', locale?: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    SEK: 'kr',
    NZD: 'NZ$',
    MXN: '$',
    SGD: 'S$',
    HKD: 'HK$',
    NOK: 'kr',
    KRW: '₩',
    TRY: '₺',
    RUB: '₽',
    BRL: 'R$',
    ZAR: 'R'
  }

  // Use Intl.NumberFormat for proper localization
  try {
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ko': 'ko-KR'
    }
    
    const formattedLocale = locale ? localeMap[locale] || 'en-US' : 'en-US'
    
    // For currencies that have proper Intl support
    if (['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'SGD'].includes(currency)) {
      return new Intl.NumberFormat(formattedLocale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount)
    }
  } catch (error) {
    console.warn('Intl.NumberFormat failed, falling back to manual formatting:', error)
  }

  // Fallback to manual formatting
  const symbol = symbols[currency] || '₹'
  const formattedAmount = amount.toLocaleString(locale || 'en-US')
  return `${symbol}${formattedAmount}`
}

/**
 * Get localized text based on user language preference
 */
export function getLocalizedText(key: string, language: string = 'en'): string {
  const translations: Record<string, Record<string, string>> = {
    // Navigation & Sidebar
    'nav.dashboard': {
      'en': 'Dashboard',
      'hi': 'डैशबोर्ड',
      'es': 'Panel de control',
      'fr': 'Tableau de bord',
      'de': 'Dashboard',
      'zh': '仪表板',
      'ja': 'ダッシュボード',
      'ko': '대시보드'
    },
    'nav.expenses': {
      'en': 'Expenses',
      'hi': 'व्यय',
      'es': 'Gastos',
      'fr': 'Dépenses',
      'de': 'Ausgaben',
      'zh': '支出',
      'ja': '支出',
      'ko': '지출'
    },
    'nav.savings': {
      'en': 'Savings',
      'hi': 'बचत',
      'es': 'Ahorros',
      'fr': 'Épargne',
      'de': 'Ersparnisse',
      'zh': '储蓄',
      'ja': '貯金',
      'ko': '저축'
    },
    'nav.analytics': {
      'en': 'Analytics',
      'hi': 'विश्लेषण',
      'es': 'Análisis',
      'fr': 'Analytique',
      'de': 'Analytik',
      'zh': '分析',
      'ja': '分析',
      'ko': '분석'
    },
    'nav.settings': {
      'en': 'Settings',
      'hi': 'सेटिंग्स',
      'es': 'Configuración',
      'fr': 'Paramètres',
      'de': 'Einstellungen',
      'zh': '设置',
      'ja': '設定',
      'ko': '설정'
    },
    'nav.logout': {
      'en': 'Logout',
      'hi': 'लॉग आउट',
      'es': 'Cerrar sesión',
      'fr': 'Déconnexion',
      'de': 'Abmelden',
      'zh': '登出',
      'ja': 'ログアウト',
      'ko': '로그아웃'
    },

    // Common Actions
    'action.add': {
      'en': 'Add',
      'hi': 'जोड़ें',
      'es': 'Agregar',
      'fr': 'Ajouter',
      'de': 'Hinzufügen',
      'zh': '添加',
      'ja': '追加',
      'ko': '추가'
    },
    'action.save': {
      'en': 'Save',
      'hi': 'सहेजें',
      'es': 'Guardar',
      'fr': 'Enregistrer',
      'de': 'Speichern',
      'zh': '保存',
      'ja': '保存',
      'ko': '저장'
    },
    'action.cancel': {
      'en': 'Cancel',
      'hi': 'रद्द करें',
      'es': 'Cancelar',
      'fr': 'Annuler',
      'de': 'Abbrechen',
      'zh': '取消',
      'ja': 'キャンセル',
      'ko': '취소'
    },
    'action.edit': {
      'en': 'Edit',
      'hi': 'संपादित करें',
      'es': 'Editar',
      'fr': 'Modifier',
      'de': 'Bearbeiten',
      'zh': '编辑',
      'ja': '編集',
      'ko': '편집'
    },
    'action.delete': {
      'en': 'Delete',
      'hi': 'हटाएं',
      'es': 'Eliminar',
      'fr': 'Supprimer',
      'de': 'Löschen',
      'zh': '删除',
      'ja': '削除',
      'ko': '삭제'
    },
    'action.submit': {
      'en': 'Submit',
      'hi': 'जमा करें',
      'es': 'Enviar',
      'fr': 'Soumettre',
      'de': 'Einreichen',
      'zh': '提交',
      'ja': '送信',
      'ko': '제출'
    },

    // Forms & Inputs
    'form.title': {
      'en': 'Title',
      'hi': 'शीर्षक',
      'es': 'Título',
      'fr': 'Titre',
      'de': 'Titel',
      'zh': '标题',
      'ja': 'タイトル',
      'ko': '제목'
    },
    'form.amount': {
      'en': 'Amount',
      'hi': 'राशि',
      'es': 'Cantidad',
      'fr': 'Montant',
      'de': 'Betrag',
      'zh': '金额',
      'ja': '金額',
      'ko': '금액'
    },
    'form.category': {
      'en': 'Category',
      'hi': 'श्रेणी',
      'es': 'Categoría',
      'fr': 'Catégorie',
      'de': 'Kategorie',
      'zh': '类别',
      'ja': 'カテゴリ',
      'ko': '카테고리'
    },
    'form.date': {
      'en': 'Date',
      'hi': 'दिनांक',
      'es': 'Fecha',
      'fr': 'Date',
      'de': 'Datum',
      'zh': '日期',
      'ja': '日付',
      'ko': '날짜'
    },
    'form.description': {
      'en': 'Description',
      'hi': 'विवरण',
      'es': 'Descripción',
      'fr': 'Description',
      'de': 'Beschreibung',
      'zh': '描述',
      'ja': '説明',
      'ko': '설명'
    },
    'form.type': {
      'en': 'Type',
      'hi': 'प्रकार',
      'es': 'Tipo',
      'fr': 'Type',
      'de': 'Typ',
      'zh': '类型',
      'ja': 'タイプ',
      'ko': '유형'
    },

    // Transaction Types
    'transaction.income': {
      'en': 'Income',
      'hi': 'आय',
      'es': 'Ingreso',
      'fr': 'Revenu',
      'de': 'Einkommen',
      'zh': '收入',
      'ja': '収入',
      'ko': '수입'
    },
    'transaction.expense': {
      'en': 'Expense',
      'hi': 'व्यय',
      'es': 'Gasto',
      'fr': 'Dépense',
      'de': 'Ausgabe',
      'zh': '支出',
      'ja': '支出',
      'ko': '지출'
    },

    // Dashboard
    'dashboard.welcome': {
      'en': 'Welcome Back',
      'hi': 'वापस स्वागत है',
      'es': 'Bienvenido de vuelta',
      'fr': 'Bon retour',
      'de': 'Willkommen zurück',
      'zh': '欢迎回来',
      'ja': 'おかえりなさい',
      'ko': '다시 오신 것을 환영합니다'
    },
    'dashboard.income': {
      'en': 'This Month\'s Income',
      'hi': 'इस महीने की आय',
      'es': 'Ingresos de este mes',
      'fr': 'Revenus de ce mois',
      'de': 'Einkommen dieses Monats',
      'zh': '本月收入',
      'ja': '今月の収入',
      'ko': '이번 달 수입'
    },
    'dashboard.expenses': {
      'en': 'This Month\'s Expenses',
      'hi': 'इस महीने के खर्च',
      'es': 'Gastos de este mes',
      'fr': 'Dépenses de ce mois',
      'de': 'Ausgaben dieses Monats',
      'zh': '本月支出',
      'ja': '今月の支出',
      'ko': '이번 달 지출'
    },
    'dashboard.savings': {
      'en': 'This Month\'s Savings',
      'hi': 'इस महीने की बचत',
      'es': 'Ahorros de este mes',
      'fr': 'Épargne de ce mois',
      'de': 'Ersparnisse dieses Monats',
      'zh': '本月储蓄',
      'ja': '今月の貯金',
      'ko': '이번 달 저축'
    },
    'dashboard.savingsRate': {
      'en': 'Savings Rate',
      'hi': 'बचत दर',
      'es': 'Tasa de ahorro',
      'fr': 'Taux d\'épargne',
      'de': 'Sparrate',
      'zh': '储蓄率',
      'ja': '貯蓄率',
      'ko': '저축률'
    },
    'dashboard.budgetProgress': {
      'en': 'Monthly Budget Progress',
      'hi': 'मासिक बजट प्रगति',
      'es': 'Progreso del presupuesto mensual',
      'fr': 'Progrès du budget mensuel',
      'de': 'Fortschritt des monatlichen Budgets',
      'zh': '月度预算进度',
      'ja': '月次予算の進捗',
      'ko': '월간 예산 진행률'
    },
    'dashboard.savingsGoal': {
      'en': 'Savings Goal Progress',
      'hi': 'बचत लक्ष्य प्रगति',
      'es': 'Progreso del objetivo de ahorro',
      'fr': 'Progrès de l\'objectif d\'épargne',
      'de': 'Fortschritt des Sparziels',
      'zh': '储蓄目标进度',
      'ja': '貯蓄目標の進捗',
      'ko': '저축 목표 진행률'
    },
    'dashboard.categoryBreakdown': {
      'en': 'Expense Category Breakdown',
      'hi': 'व्यय श्रेणी विभाजन',
      'es': 'Desglose de categorías de gastos',
      'fr': 'Répartition des catégories de dépenses',
      'de': 'Aufschlüsselung der Ausgabenkategorien',
      'zh': '支出类别细分',
      'ja': '支出カテゴリの内訳',
      'ko': '지출 카테고리 분석'
    },
    'dashboard.recentTransactions': {
      'en': 'Recent Transactions',
      'hi': 'हाल के लेनदेन',
      'es': 'Transacciones recientes',
      'fr': 'Transactions récentes',
      'de': 'Aktuelle Transaktionen',
      'zh': '最近交易',
      'ja': '最近の取引',
      'ko': '최근 거래'
    },
    'dashboard.incomeVsExpenses': {
      'en': 'Income vs Expenses (6 Months)',
      'hi': 'आय बनाम व्यय (6 महीने)',
      'es': 'Ingresos vs Gastos (6 meses)',
      'fr': 'Revenus vs Dépenses (6 mois)',
      'de': 'Einkommen vs Ausgaben (6 Monate)',
      'zh': '收入与支出对比（6个月）',
      'ja': '収入と支出（6ヶ月）',
      'ko': '수입 대 지출 (6개월)'
    },

    // Pages
    'page.expenses': {
      'en': 'Expenses',
      'hi': 'व्यय',
      'es': 'Gastos',
      'fr': 'Dépenses',
      'de': 'Ausgaben',
      'zh': '支出',
      'ja': '支出',
      'ko': '지출'
    },
    'page.savings': {
      'en': 'Savings',
      'hi': 'बचत',
      'es': 'Ahorros',
      'fr': 'Épargne',
      'de': 'Ersparnisse',
      'zh': '储蓄',
      'ja': '貯金',
      'ko': '저축'
    },
    'page.analytics': {
      'en': 'Analytics',
      'hi': 'विश्लेषण',
      'es': 'Análisis',
      'fr': 'Analytique',
      'de': 'Analytik',
      'zh': '分析',
      'ja': '分析',
      'ko': '분석'
    },
    'page.settings': {
      'en': 'Settings',
      'hi': 'सेटिंग्स',
      'es': 'Configuración',
      'fr': 'Paramètres',
      'de': 'Einstellungen',
      'zh': '设置',
      'ja': '設定',
      'ko': '설정'
    },

    // Messages & Notifications
    'message.success': {
      'en': 'Success',
      'hi': 'सफलता',
      'es': 'Éxito',
      'fr': 'Succès',
      'de': 'Erfolg',
      'zh': '成功',
      'ja': '成功',
      'ko': '성공'
    },
    'message.error': {
      'en': 'Error',
      'hi': 'त्रुटि',
      'es': 'Error',
      'fr': 'Erreur',
      'de': 'Fehler',
      'zh': '错误',
      'ja': 'エラー',
      'ko': '오류'
    },
    'message.loading': {
      'en': 'Loading...',
      'hi': 'लोड हो रहा है...',
      'es': 'Cargando...',
      'fr': 'Chargement...',
      'de': 'Laden...',
      'zh': '加载中...',
      'ja': '読み込み中...',
      'ko': '로딩 중...'
    },
    'message.noData': {
      'en': 'No data available',
      'hi': 'कोई डेटा उपलब्ध नहीं',
      'es': 'No hay datos disponibles',
      'fr': 'Aucune donnée disponible',
      'de': 'Keine Daten verfügbar',
      'zh': '无可用数据',
      'ja': 'データがありません',
      'ko': '사용 가능한 데이터가 없습니다'
    },

    // Onboarding
    'onboarding.welcome': {
      'en': 'Welcome',
      'hi': 'स्वागत है',
      'es': 'Bienvenido',
      'fr': 'Bienvenue',
      'de': 'Willkommen',
      'zh': '欢迎',
      'ja': 'ようこそ',
      'ko': '환영합니다'
    },
    'onboarding.basicInfo': {
      'en': 'Basic Info',
      'hi': 'मूल जानकारी',
      'es': 'Información básica',
      'fr': 'Informations de base',
      'de': 'Grundinformationen',
      'zh': '基本信息',
      'ja': '基本情報',
      'ko': '기본 정보'
    },
    'onboarding.personalization': {
      'en': 'Personalization',
      'hi': 'व्यक्तिगतकरण',
      'es': 'Personalización',
      'fr': 'Personnalisation',
      'de': 'Personalisierung',
      'zh': '个性化',
      'ja': 'パーソナライゼーション',
      'ko': '개인화'
    },
    'onboarding.financePreferences': {
      'en': 'Finance Preferences',
      'hi': 'वित्तीय प्राथमिकताएं',
      'es': 'Preferencias financieras',
      'fr': 'Préférences financières',
      'de': 'Finanzielle Präferenzen',
      'zh': '财务偏好',
      'ja': '財務設定',
      'ko': '재정 설정'
    },
    'onboarding.confirmation': {
      'en': 'All Set!',
      'hi': 'सब तैयार!',
      'es': '¡Todo listo!',
      'fr': 'Tout est prêt !',
      'de': 'Alles bereit!',
      'zh': '全部设置完成！',
      'ja': 'すべて完了！',
      'ko': '모든 설정 완료!'
    },

    // Dashboard specific text
    'dashboard.overview': {
      'en': 'Here\'s your financial overview for today',
      'hi': 'आज के लिए आपका वित्तीय अवलोकन यहाँ है',
      'es': 'Aquí está tu resumen financiero de hoy',
      'fr': 'Voici votre aperçu financier d\'aujourd\'hui',
      'de': 'Hier ist Ihr finanzieller Überblick für heute',
      'zh': '这是您今天的财务概览',
      'ja': '今日の財務概要はこちらです',
      'ko': '오늘의 재정 개요입니다'
    },
    'dashboard.liveData': {
      'en': 'Live data',
      'hi': 'लाइव डेटा',
      'es': 'Datos en vivo',
      'fr': 'Données en direct',
      'de': 'Live-Daten',
      'zh': '实时数据',
      'ja': 'ライブデータ',
      'ko': '실시간 데이터'
    },
    'dashboard.addTransaction': {
      'en': 'Add Transaction',
      'hi': 'लेनदेन जोड़ें',
      'es': 'Agregar Transacción',
      'fr': 'Ajouter une Transaction',
      'de': 'Transaktion hinzufügen',
      'zh': '添加交易',
      'ja': '取引を追加',
      'ko': '거래 추가'
    },
    'dashboard.incomeSources': {
      'en': 'Income sources',
      'hi': 'आय के स्रोत',
      'es': 'Fuentes de ingresos',
      'fr': 'Sources de revenus',
      'de': 'Einkommensquellen',
      'zh': '收入来源',
      'ja': '収入源',
      'ko': '수입원'
    },
    'dashboard.totalSpending': {
      'en': 'Total spending',
      'hi': 'कुल खर्च',
      'es': 'Gasto total',
      'fr': 'Dépenses totales',
      'de': 'Gesamtausgaben',
      'zh': '总支出',
      'ja': '総支出',
      'ko': '총 지출'
    },
    'dashboard.positiveSavings': {
      'en': 'Positive savings',
      'hi': 'सकारात्मक बचत',
      'es': 'Ahorros positivos',
      'fr': 'Épargne positive',
      'de': 'Positive Ersparnisse',
      'zh': '正储蓄',
      'ja': '正の貯金',
      'ko': '양의 저축'
    },
    'dashboard.overBudget': {
      'en': 'Over budget',
      'hi': 'बजट से अधिक',
      'es': 'Sobre presupuesto',
      'fr': 'Dépassement de budget',
      'de': 'Über Budget',
      'zh': '超预算',
      'ja': '予算超過',
      'ko': '예산 초과'
    },
    'dashboard.spentThisMonth': {
      'en': 'Spent this month',
      'hi': 'इस महीने खर्च किया',
      'es': 'Gastado este mes',
      'fr': 'Dépensé ce mois',
      'de': 'Diesen Monat ausgegeben',
      'zh': '本月支出',
      'ja': '今月の支出',
      'ko': '이번 달 지출'
    },
    'dashboard.budget': {
      'en': 'Budget',
      'hi': 'बजट',
      'es': 'Presupuesto',
      'fr': 'Budget',
      'de': 'Budget',
      'zh': '预算',
      'ja': '予算',
      'ko': '예산'
    },
    'dashboard.onTrack': {
      'en': 'On Track',
      'hi': 'ट्रैक पर',
      'es': 'En camino',
      'fr': 'Sur la bonne voie',
      'de': 'Auf Kurs',
      'zh': '正常',
      'ja': '順調',
      'ko': '정상'
    },
    'dashboard.savedAmount': {
      'en': 'Saved amount',
      'hi': 'बचाई गई राशि',
      'es': 'Cantidad ahorrada',
      'fr': 'Montant épargné',
      'de': 'Gesparte Summe',
      'zh': '已储蓄金额',
      'ja': '貯金額',
      'ko': '저축 금액'
    },
    'dashboard.target': {
      'en': 'Target',
      'hi': 'लक्ष्य',
      'es': 'Objetivo',
      'fr': 'Objectif',
      'de': 'Ziel',
      'zh': '目标',
      'ja': '目標',
      'ko': '목표'
    },
    'dashboard.activeGoals': {
      'en': 'Active Goals',
      'hi': 'सक्रिय लक्ष्य',
      'es': 'Objetivos Activos',
      'fr': 'Objectifs Actifs',
      'de': 'Aktive Ziele',
      'zh': '活跃目标',
      'ja': 'アクティブな目標',
      'ko': '활성 목표'
    },
    'dashboard.noSavingsGoals': {
      'en': 'No savings goals set',
      'hi': 'कोई बचत लक्ष्य निर्धारित नहीं',
      'es': 'No hay objetivos de ahorro establecidos',
      'fr': 'Aucun objectif d\'épargne défini',
      'de': 'Keine Sparziele festgelegt',
      'zh': '未设置储蓄目标',
      'ja': '貯蓄目標が設定されていません',
      'ko': '저축 목표가 설정되지 않음'
    },
    'dashboard.createFirstGoal': {
      'en': 'Create your first savings goal to track progress',
      'hi': 'प्रगति को ट्रैक करने के लिए अपना पहला बचत लक्ष्य बनाएं',
      'es': 'Crea tu primer objetivo de ahorro para rastrear el progreso',
      'fr': 'Créez votre premier objectif d\'épargne pour suivre les progrès',
      'de': 'Erstellen Sie Ihr erstes Sparziel, um den Fortschritt zu verfolgen',
      'zh': '创建您的第一个储蓄目标来跟踪进度',
      'ja': '進捗を追跡するために最初の貯蓄目標を作成してください',
      'ko': '진행 상황을 추적하기 위해 첫 번째 저축 목표를 만드세요'
    },
    'dashboard.noExpenseData': {
      'en': 'No expense data available',
      'hi': 'कोई व्यय डेटा उपलब्ध नहीं',
      'es': 'No hay datos de gastos disponibles',
      'fr': 'Aucune donnée de dépenses disponible',
      'de': 'Keine Ausgabendaten verfügbar',
      'zh': '无可用支出数据',
      'ja': '支出データがありません',
      'ko': '사용 가능한 지출 데이터가 없습니다'
    },
    'dashboard.noTransactions': {
      'en': 'No transactions found',
      'hi': 'कोई लेनदेन नहीं मिला',
      'es': 'No se encontraron transacciones',
      'fr': 'Aucune transaction trouvée',
      'de': 'Keine Transaktionen gefunden',
      'zh': '未找到交易',
      'ja': '取引が見つかりません',
      'ko': '거래를 찾을 수 없습니다'
    },
    'dashboard.recentTransactionsWillAppear': {
      'en': 'Your recent transactions will appear here',
      'hi': 'आपके हाल के लेनदेन यहाँ दिखाई देंगे',
      'es': 'Tus transacciones recientes aparecerán aquí',
      'fr': 'Vos transactions récentes apparaîtront ici',
      'de': 'Ihre letzten Transaktionen werden hier angezeigt',
      'zh': '您最近的交易将显示在这里',
      'ja': '最近の取引がここに表示されます',
      'ko': '최근 거래가 여기에 표시됩니다'
    },

    // Expenses page
    'expenses.manage': {
      'en': 'Manage your income and expenses',
      'hi': 'अपनी आय और व्यय का प्रबंधन करें',
      'es': 'Gestiona tus ingresos y gastos',
      'fr': 'Gérez vos revenus et dépenses',
      'de': 'Verwalten Sie Ihre Einnahmen und Ausgaben',
      'zh': '管理您的收入和支出',
      'ja': '収入と支出を管理する',
      'ko': '수입과 지출을 관리하세요'
    },
    'expenses.addExpense': {
      'en': 'Add Expense',
      'hi': 'व्यय जोड़ें',
      'es': 'Agregar Gasto',
      'fr': 'Ajouter une Dépense',
      'de': 'Ausgabe hinzufügen',
      'zh': '添加支出',
      'ja': '支出を追加',
      'ko': '지출 추가'
    },
    'expenses.thisMonthExpenses': {
      'en': 'This Month\'s Expenses',
      'hi': 'इस महीने के खर्च',
      'es': 'Gastos de este mes',
      'fr': 'Dépenses de ce mois',
      'de': 'Ausgaben dieses Monats',
      'zh': '本月支出',
      'ja': '今月の支出',
      'ko': '이번 달 지출'
    },
    'expenses.totalSpentThisMonth': {
      'en': 'Total spent this month',
      'hi': 'इस महीने कुल खर्च',
      'es': 'Total gastado este mes',
      'fr': 'Total dépensé ce mois',
      'de': 'Diesen Monat insgesamt ausgegeben',
      'zh': '本月总支出',
      'ja': '今月の総支出',
      'ko': '이번 달 총 지출'
    },
    'expenses.totalTransactions': {
      'en': 'Total Transactions',
      'hi': 'कुल लेनदेन',
      'es': 'Total de Transacciones',
      'fr': 'Total des Transactions',
      'de': 'Gesamttransaktionen',
      'zh': '总交易数',
      'ja': '総取引数',
      'ko': '총 거래 수'
    },
    'expenses.visible': {
      'en': 'visible',
      'hi': 'दिखाई दे रहे',
      'es': 'visibles',
      'fr': 'visibles',
      'de': 'sichtbar',
      'zh': '可见',
      'ja': '表示中',
      'ko': '표시됨'
    },
    'expenses.categoryBreakdown': {
      'en': 'Category Breakdown',
      'hi': 'श्रेणी विभाजन',
      'es': 'Desglose por Categoría',
      'fr': 'Répartition par Catégorie',
      'de': 'Kategorieaufschlüsselung',
      'zh': '类别细分',
      'ja': 'カテゴリ別内訳',
      'ko': '카테고리 분석'
    },
    'expenses.noExpensesThisMonth': {
      'en': 'No expenses this month',
      'hi': 'इस महीने कोई खर्च नहीं',
      'es': 'Sin gastos este mes',
      'fr': 'Aucune dépense ce mois',
      'de': 'Keine Ausgaben diesen Monat',
      'zh': '本月无支出',
      'ja': '今月の支出なし',
      'ko': '이번 달 지출 없음'
    },
    'expenses.filters': {
      'en': 'Filters',
      'hi': 'फिल्टर',
      'es': 'Filtros',
      'fr': 'Filtres',
      'de': 'Filter',
      'zh': '筛选器',
      'ja': 'フィルター',
      'ko': '필터'
    },
    'expenses.searchExpenses': {
      'en': 'Search expenses...',
      'hi': 'व्यय खोजें...',
      'es': 'Buscar gastos...',
      'fr': 'Rechercher des dépenses...',
      'de': 'Ausgaben suchen...',
      'zh': '搜索支出...',
      'ja': '支出を検索...',
      'ko': '지출 검색...'
    },
    'expenses.allCategories': {
      'en': 'All Categories',
      'hi': 'सभी श्रेणियां',
      'es': 'Todas las Categorías',
      'fr': 'Toutes les Catégories',
      'de': 'Alle Kategorien',
      'zh': '所有类别',
      'ja': 'すべてのカテゴリ',
      'ko': '모든 카테고리'
    },
    'expenses.allTime': {
      'en': 'All Time',
      'hi': 'सभी समय',
      'es': 'Todo el Tiempo',
      'fr': 'Tout le Temps',
      'de': 'Alle Zeit',
      'zh': '所有时间',
      'ja': 'すべての時間',
      'ko': '모든 시간'
    },
    'expenses.clearFilters': {
      'en': 'Clear Filters',
      'hi': 'फिल्टर साफ़ करें',
      'es': 'Limpiar Filtros',
      'fr': 'Effacer les Filtres',
      'de': 'Filter löschen',
      'zh': '清除筛选器',
      'ja': 'フィルターをクリア',
      'ko': '필터 지우기'
    },
    'expenses.allExpenses': {
      'en': 'All Expenses',
      'hi': 'सभी व्यय',
      'es': 'Todos los Gastos',
      'fr': 'Toutes les Dépenses',
      'de': 'Alle Ausgaben',
      'zh': '所有支出',
      'ja': 'すべての支出',
      'ko': '모든 지출'
    },
    'expenses.dateNewestFirst': {
      'en': 'Date (Newest First)',
      'hi': 'दिनांक (नवीनतम पहले)',
      'es': 'Fecha (Más Reciente Primero)',
      'fr': 'Date (Plus Récent en Premier)',
      'de': 'Datum (Neueste zuerst)',
      'zh': '日期（最新优先）',
      'ja': '日付（新しい順）',
      'ko': '날짜 (최신순)'
    },

    // Savings page
    'savings.trackProgress': {
      'en': 'Track your progress towards financial goals with enhanced features',
      'hi': 'बेहतर सुविधाओं के साथ अपने वित्तीय लक्ष्यों की ओर प्रगति को ट्रैक करें',
      'es': 'Rastrea tu progreso hacia objetivos financieros con características mejoradas',
      'fr': 'Suivez vos progrès vers vos objectifs financiers avec des fonctionnalités améliorées',
      'de': 'Verfolgen Sie Ihren Fortschritt zu finanziellen Zielen mit erweiterten Funktionen',
      'zh': '使用增强功能跟踪您实现财务目标的进度',
      'ja': '強化された機能で財務目標への進捗を追跡',
      'ko': '향상된 기능으로 재정 목표 달성 진행 상황을 추적하세요'
    },
    'savings.totalGoals': {
      'en': 'Total Goals',
      'hi': 'कुल लक्ष्य',
      'es': 'Total de Objetivos',
      'fr': 'Total des Objectifs',
      'de': 'Gesamtziele',
      'zh': '总目标',
      'ja': '総目標数',
      'ko': '총 목표'
    },
    'savings.totalTarget': {
      'en': 'Total Target',
      'hi': 'कुल लक्ष्य',
      'es': 'Objetivo Total',
      'fr': 'Objectif Total',
      'de': 'Gesamtziel',
      'zh': '总目标',
      'ja': '総目標',
      'ko': '총 목표'
    },
    'savings.totalSaved': {
      'en': 'Total Saved',
      'hi': 'कुल बचत',
      'es': 'Total Ahorrado',
      'fr': 'Total Épargné',
      'de': 'Gesamt Gespart',
      'zh': '总储蓄',
      'ja': '総貯金額',
      'ko': '총 저축'
    },
    'savings.completed': {
      'en': 'Completed',
      'hi': 'पूर्ण',
      'es': 'Completado',
      'fr': 'Terminé',
      'de': 'Abgeschlossen',
      'zh': '已完成',
      'ja': '完了',
      'ko': '완료'
    },
    'savings.successRate': {
      'en': 'success rate',
      'hi': 'सफलता दर',
      'es': 'tasa de éxito',
      'fr': 'taux de réussite',
      'de': 'Erfolgsrate',
      'zh': '成功率',
      'ja': '成功率',
      'ko': '성공률'
    },
    'savings.yourSavingsGoals': {
      'en': 'Your Savings Goals',
      'hi': 'आपके बचत लक्ष्य',
      'es': 'Tus Objetivos de Ahorro',
      'fr': 'Vos Objectifs d\'Épargne',
      'de': 'Ihre Sparziele',
      'zh': '您的储蓄目标',
      'ja': 'あなたの貯蓄目標',
      'ko': '당신의 저축 목표'
    },
    'savings.noSavingsGoalsYet': {
      'en': 'No savings goals yet',
      'hi': 'अभी तक कोई बचत लक्ष्य नहीं',
      'es': 'Aún no hay objetivos de ahorro',
      'fr': 'Aucun objectif d\'épargne pour le moment',
      'de': 'Noch keine Sparziele',
      'zh': '还没有储蓄目标',
      'ja': 'まだ貯蓄目標がありません',
      'ko': '아직 저축 목표가 없습니다'
    },
    'savings.createFirstGoalDescription': {
      'en': 'Create your first savings goal to start tracking your progress towards financial milestones with enhanced features like contribution tracking, target dates, and priority levels.',
      'hi': 'योगदान ट्रैकिंग, लक्ष्य तिथियों और प्राथमिकता स्तरों जैसी बेहतर सुविधाओं के साथ वित्तीय माइलस्टोन की ओर अपनी प्रगति को ट्रैक करना शुरू करने के लिए अपना पहला बचत लक्ष्य बनाएं।',
      'es': 'Crea tu primer objetivo de ahorro para comenzar a rastrear tu progreso hacia hitos financieros con características mejoradas como seguimiento de contribuciones, fechas objetivo y niveles de prioridad.',
      'fr': 'Créez votre premier objectif d\'épargne pour commencer à suivre vos progrès vers des jalons financiers avec des fonctionnalités améliorées comme le suivi des contributions, les dates cibles et les niveaux de priorité.',
      'de': 'Erstellen Sie Ihr erstes Sparziel, um Ihren Fortschritt zu finanziellen Meilensteinen mit erweiterten Funktionen wie Beitragsverfolgung, Zielterminen und Prioritätsstufen zu verfolgen.',
      'zh': '创建您的第一个储蓄目标，开始使用增强功能（如贡献跟踪、目标日期和优先级）跟踪您实现财务里程碑的进度。',
      'ja': '貢献追跡、目標日、優先度レベルなどの強化された機能で、財務マイルストーンへの進捗を追跡し始めるために、最初の貯蓄目標を作成してください。',
      'ko': '기여 추적, 목표 날짜, 우선순위 수준과 같은 향상된 기능으로 재정 마일스톤 달성 진행 상황을 추적하기 시작하려면 첫 번째 저축 목표를 만드세요.'
    },
    'savings.createFirstGoal': {
      'en': 'Create Your First Goal',
      'hi': 'अपना पहला लक्ष्य बनाएं',
      'es': 'Crea Tu Primer Objetivo',
      'fr': 'Créez Votre Premier Objectif',
      'de': 'Erstellen Sie Ihr Erstes Ziel',
      'zh': '创建您的第一个目标',
      'ja': '最初の目標を作成',
      'ko': '첫 번째 목표 만들기'
    },

    // Settings page
    'settings.title': {
      'en': 'Settings',
      'hi': 'सेटिंग्स',
      'es': 'Configuración',
      'fr': 'Paramètres',
      'de': 'Einstellungen',
      'zh': '设置',
      'ja': '設定',
      'ko': '설정'
    },
    'settings.profile': {
      'en': 'Profile & Personalization',
      'hi': 'प्रोफ़ाइल और व्यक्तिगतकरण',
      'es': 'Perfil y Personalización',
      'fr': 'Profil et Personnalisation',
      'de': 'Profil und Personalisierung',
      'zh': '个人资料和个性化',
      'ja': 'プロフィールとパーソナライゼーション',
      'ko': '프로필 및 개인화'
    },
    'settings.account': {
      'en': 'Account Settings',
      'hi': 'खाता सेटिंग्स',
      'es': 'Configuración de Cuenta',
      'fr': 'Paramètres du Compte',
      'de': 'Kontoeinstellungen',
      'zh': '账户设置',
      'ja': 'アカウント設定',
      'ko': '계정 설정'
    },
    'settings.financial': {
      'en': 'Financial Preferences',
      'hi': 'वित्तीय प्राथमिकताएं',
      'es': 'Preferencias Financieras',
      'fr': 'Préférences Financières',
      'de': 'Finanzielle Präferenzen',
      'zh': '财务偏好',
      'ja': '財務設定',
      'ko': '재정 설정'
    },
    'settings.notifications': {
      'en': 'Notifications',
      'hi': 'सूचनाएं',
      'es': 'Notificaciones',
      'fr': 'Notifications',
      'de': 'Benachrichtigungen',
      'zh': '通知',
      'ja': '通知',
      'ko': '알림'
    },
    'settings.appearance': {
      'en': 'Appearance & Accessibility',
      'hi': 'दिखावट और पहुंच',
      'es': 'Apariencia y Accesibilidad',
      'fr': 'Apparence et Accessibilité',
      'de': 'Erscheinungsbild und Barrierefreiheit',
      'zh': '外观和可访问性',
      'ja': '外観とアクセシビリティ',
      'ko': '모양 및 접근성'
    },
    'settings.data': {
      'en': 'Data Management',
      'hi': 'डेटा प्रबंधन',
      'es': 'Gestión de Datos',
      'fr': 'Gestion des Données',
      'de': 'Datenverwaltung',
      'zh': '数据管理',
      'ja': 'データ管理',
      'ko': '데이터 관리'
    },
    'settings.about': {
      'en': 'About & Support',
      'hi': 'के बारे में और सहायता',
      'es': 'Acerca de y Soporte',
      'fr': 'À Propos et Support',
      'de': 'Über und Support',
      'zh': '关于和支持',
      'ja': 'についてとサポート',
      'ko': '정보 및 지원'
    },
    'settings.dangerZone': {
      'en': 'Danger Zone',
      'hi': 'खतरा क्षेत्र',
      'es': 'Zona de Peligro',
      'fr': 'Zone de Danger',
      'de': 'Gefahrenbereich',
      'zh': '危险区域',
      'ja': '危険ゾーン',
      'ko': '위험 구역'
    },
    'settings.save': {
      'en': 'Save Changes',
      'hi': 'परिवर्तन सहेजें',
      'es': 'Guardar Cambios',
      'fr': 'Enregistrer les Modifications',
      'de': 'Änderungen Speichern',
      'zh': '保存更改',
      'ja': '変更を保存',
      'ko': '변경사항 저장'
    },
    'settings.reset': {
      'en': 'Reset to Default',
      'hi': 'डिफ़ॉल्ट पर रीसेट करें',
      'es': 'Restablecer a Predeterminado',
      'fr': 'Réinitialiser par Défaut',
      'de': 'Auf Standard Zurücksetzen',
      'zh': '重置为默认',
      'ja': 'デフォルトにリセット',
      'ko': '기본값으로 재설정'
    }
  }

  return translations[key]?.[language] || translations[key]?.['en'] || key
}
