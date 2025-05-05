export type Language = "en" | "ar"

export type TranslationKey =
  | "loading"
  | "error"
  | "success"
  | "confirm"
  | "save"
  | "cancel"
  | "edit"
  | "delete"
  | "search"
  | "filter"
  | "refresh"
  | "actions"
  | "status"
  | "details"
  | "date"
  | "amount"
  | "quantity"
  | "price"
  | "total"
  | "submit"
  | "back"
  | "next"
  | "previous"
  | "yes"
  | "no"
  | "dashboard"
  | "services"
  | "orders"
  | "users"
  | "balance"
  | "rechargeRequests"
  | "coupons"
  | "notifications"
  | "activity"
  | "settings"
  | "clientArea"
  | "signOut"
  | "login"
  | "register"
  | "forgotPassword"
  | "resetPassword"
  | "emailAddress"
  | "password"
  | "confirmPassword"
  | "rememberMe"
  | "dontHaveAccount"
  | "alreadyHaveAccount"
  | "welcomeBack"
  | "yourBalance"
  | "recentOrders"
  | "recentActivity"
  | "viewAll"
  | "servicesManagement"
  | "addService"
  | "editService"
  | "deleteService"
  | "serviceName"
  | "serviceDescription"
  | "serviceCategory"
  | "servicePrice"
  | "minOrder"
  | "maxOrder"
  | "dailyLimit"
  | "weeklyLimit"
  | "visibleToUsers"
  | "searchServices"
  | "filterByCategory"
  | "filterByVisibility"
  | "allCategories"
  | "allServices"
  | "visibleOnly"
  | "hiddenOnly"
  | "syncFromApi"
  | "enterServiceName"
  | "enterServiceDescription"
  | "apiPrice"
  | "customPrice"
  | "pricePerThousand"
  | "pricePerThousandTooltip"
  | "minMaxOrder"
  | "features"
  | "visible"
  | "dripFeed"
  | "refill"
  | "updateService"
  | "databaseUpdateRequired"
  | "pricePerThousandMissing"
  | "servicesPageHelp"
  | "orderId"
  | "orderDate"
  | "orderStatus"
  | "orderDetails"
  | "placeOrder"
  | "placingOrder"
  | "orderPlaced"
  | "orderFailed"
  | "enterQuantity"
  | "insufficientBalance"
  | "API Logs"
  | "Monitor all interactions with the SPFollow API. This page shows the most recent API calls, their status, and response data. Use this to troubleshoot any issues with order processing."
  | "Search logs"
  | "Filter by endpoint"
  | "Filter by status"
  | "All endpoints"
  | "All statuses"
  | "Time"
  | "Endpoint"
  | "Request"
  | "Response"
  | "Processing Time"
  | "No API logs found"
  | "N/A"

export const translations = {
  en: {
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    confirm: "Are you sure you want to proceed?",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    filter: "Filter",
    refresh: "Refresh",
    actions: "Actions",
    status: "Status",
    details: "Details",
    date: "Date",
    amount: "Amount",
    quantity: "Quantity",
    price: "Price",
    total: "Total",
    submit: "Submit",
    back: "Back",
    next: "Next",
    previous: "Previous",
    yes: "Yes",
    no: "No",

    // Navigation
    dashboard: "Dashboard",
    services: "Services",
    orders: "Orders",
    users: "Users",
    balance: "Balance",
    rechargeRequests: "Recharge Requests",
    coupons: "Coupons",
    notifications: "Notifications",
    activity: "Activity",
    settings: "Settings",
    clientArea: "Client Area",
    signOut: "Sign Out",

    // Auth
    login: "Login",
    register: "Register",
    forgotPassword: "Forgot Password",
    resetPassword: "Reset Password",
    emailAddress: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    rememberMe: "Remember Me",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",

    // Dashboard
    welcomeBack: "Welcome back",
    yourBalance: "Your Balance",
    recentOrders: "Recent Orders",
    recentActivity: "Recent Activity",
    viewAll: "View All",

    // Services
    servicesManagement: "Services Management",
    addService: "Add Service",
    editService: "Edit Service",
    deleteService: "Delete Service",
    serviceName: "Service Name",
    serviceDescription: "Service Description",
    serviceCategory: "Service Category",
    servicePrice: "Service Price",
    minOrder: "Min Order",
    maxOrder: "Max Order",
    dailyLimit: "Daily Limit",
    weeklyLimit: "Weekly Limit",
    visibleToUsers: "Visible to Users",
    searchServices: "Search Services",
    filterByCategory: "Filter by Category",
    filterByVisibility: "Filter by Visibility",
    allCategories: "All Categories",
    allServices: "All Services",
    visibleOnly: "Visible Only",
    hiddenOnly: "Hidden Only",
    syncFromApi: "Sync from API",
    enterServiceName: "Enter service name",
    enterServiceDescription: "Enter service description",
    apiPrice: "API Price",
    customPrice: "Custom Price",
    pricePerThousand: "Price Per 1000",
    pricePerThousandTooltip: "This price is used to calculate the total cost for orders",
    minMaxOrder: "Min/Max Order",
    features: "Features",
    visible: "Visible",
    dripFeed: "Drip Feed",
    refill: "Refill",
    updateService: "Update Service",
    databaseUpdateRequired: "Database Update Required!",
    pricePerThousandMissing:
      "The price_per_1000 column is missing from the services table. Please run the migration to add it.",
    servicesPageHelp:
      "Manage your services here. You can add, edit, or delete services, as well as control their visibility to users. Use the sync button to import services from the API.",

    // Orders
    orderId: "Order ID",
    orderDate: "Order Date",
    orderStatus: "Order Status",
    orderDetails: "Order Details",
    placeOrder: "Place Order",
    placingOrder: "Placing Order...",
    orderPlaced: "Order Placed",
    orderFailed: "Order Failed",
    enterQuantity: "Enter quantity",
    insufficientBalance: "Insufficient balance",

    // API Logs
    "API Logs": "API Logs",
    "Monitor all interactions with the SPFollow API. This page shows the most recent API calls, their status, and response data. Use this to troubleshoot any issues with order processing.":
      "Monitor all interactions with the SPFollow API. This page shows the most recent API calls, their status, and response data. Use this to troubleshoot any issues with order processing.",
    "Search logs": "Search logs",
    "Filter by endpoint": "Filter by endpoint",
    "Filter by status": "Filter by status",
    "All endpoints": "All endpoints",
    "All statuses": "All statuses",
    Time: "Time",
    Endpoint: "Endpoint",
    Request: "Request",
    Response: "Response",
    "Processing Time": "Processing Time",
    "No API logs found": "No API logs found",
    "N/A": "N/A",
  },
  ar: {
    // Common
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "نجاح",
    confirm: "هل أنت متأكد من المتابعة؟",
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    search: "بحث",
    filter: "تصفية",
    refresh: "تحديث",
    actions: "إجراءات",
    status: "الحالة",
    details: "التفاصيل",
    date: "التاريخ",
    amount: "المبلغ",
    quantity: "الكمية",
    price: "السعر",
    total: "المجموع",
    submit: "إرسال",
    back: "رجوع",
    next: "التالي",
    previous: "السابق",
    yes: "نعم",
    no: "لا",

    // Navigation
    dashboard: "لوحة التحكم",
    services: "الخدمات",
    orders: "الطلبات",
    users: "المستخدمين",
    balance: "الرصيد",
    rechargeRequests: "طلبات الشحن",
    coupons: "القسائم",
    notifications: "الإشعارات",
    activity: "النشاط",
    settings: "الإعدادات",
    clientArea: "منطقة العميل",
    signOut: "تسجيل الخروج",

    // Auth
    login: "تسجيل الدخول",
    register: "تسجيل",
    forgotPassword: "نسيت كلمة المرور",
    resetPassword: "إعادة تعيين كلمة المرور",
    emailAddress: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    rememberMe: "تذكرني",
    dontHaveAccount: "ليس لديك حساب؟",
    alreadyHaveAccount: "لديك حساب بالفعل؟",

    // Dashboard
    welcomeBack: "مرحبًا بعودتك",
    yourBalance: "رصيدك",
    recentOrders: "الطلبات الأخيرة",
    recentActivity: "النشاط الأخير",
    viewAll: "عرض الكل",

    // Services
    servicesManagement: "إدارة الخدمات",
    addService: "إضافة خدمة",
    editService: "تعديل الخدمة",
    deleteService: "حذف الخدمة",
    serviceName: "اسم الخدمة",
    serviceDescription: "وصف الخدمة",
    serviceCategory: "فئة الخدمة",
    servicePrice: "سعر الخدمة",
    minOrder: "الحد الأدنى للطلب",
    maxOrder: "الحد الأقصى للطلب",
    dailyLimit: "الحد اليومي",
    weeklyLimit: "الحد الأسبوعي",
    visibleToUsers: "مرئي للمستخدمين",
    searchServices: "بحث في الخدمات",
    filterByCategory: "تصفية حسب الفئة",
    filterByVisibility: "تصفية حسب الرؤية",
    allCategories: "جميع الفئات",
    allServices: "جميع الخدمات",
    visibleOnly: "المرئية فقط",
    hiddenOnly: "المخفية فقط",
    syncFromApi: "مزامنة من API",
    enterServiceName: "أدخل اسم الخدمة",
    enterServiceDescription: "أدخل وصف الخدمة",
    apiPrice: "سعر API",
    customPrice: "السعر المخصص",
    pricePerThousand: "السعر لكل 1000",
    pricePerThousandTooltip: "يستخدم هذا السعر لحساب التكلفة الإجمالية للطلبات",
    minMaxOrder: "الحد الأدنى/الأقصى للطلب",
    features: "الميزات",
    visible: "مرئي",
    dripFeed: "تغذية بالتنقيط",
    refill: "إعادة تعبئة",
    updateService: "تحديث الخدمة",
    databaseUpdateRequired: "تحديث قاعدة البيانات مطلوب!",
    pricePerThousandMissing: "العمود price_per_1000 مفقود من جدول الخدمات. يرجى تشغيل الترحيل لإضافته.",
    servicesPageHelp:
      "إدارة خدماتك هنا. يمكنك إضافة أو تعديل أو حذف الخدمات، وكذلك التحكم في رؤيتها للمستخدمين. استخدم زر المزامنة لاستيراد الخدمات من API.",

    // Orders
    orderId: "رقم الطلب",
    orderDate: "تاريخ الطلب",
    orderStatus: "حالة الطلب",
    orderDetails: "تفاصيل الطلب",
    placeOrder: "تقديم الطلب",
    placingOrder: "جاري تقديم الطلب...",
    orderPlaced: "تم تقديم الطلب",
    orderFailed: "فشل الطلب",
    enterQuantity: "أدخل الكمية",
    insufficientBalance: "رصيد غير كافٍ",

    // API Logs
    "API Logs": "سجلات API",
    "Monitor all interactions with the SPFollow API. This page shows the most recent API calls, their status, and response data. Use this to troubleshoot any issues with order processing.":
      "مراقبة جميع التفاعلات مع SPFollow API. تعرض هذه الصفحة أحدث استدعاءات API وحالتها وبيانات الاستجابة. استخدم هذا لاستكشاف أي مشاكل في معالجة الطلبات وإصلاحها.",
    "Search logs": "بحث في السجلات",
    "Filter by endpoint": "تصفية حسب نقطة النهاية",
    "Filter by status": "تصفية حسب الحالة",
    "All endpoints": "جميع نقاط النهاية",
    "All statuses": "جميع الحالات",
    Time: "الوقت",
    Endpoint: "نقطة النهاية",
    Request: "الطلب",
    Response: "الاستجابة",
    "Processing Time": "وقت المعالجة",
    "No API logs found": "لم يتم العثور على سجلات API",
    "N/A": "غير متاح",
  },
}

export function getTranslation(key: TranslationKey, language: Language): string {
  return translations[language][key] || key
}
