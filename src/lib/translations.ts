export type Locale = "en" | "es" | "ru";

export const defaultLocale: Locale = "en";

export const translations = {
  en: {
    brand: "Appointly",
    login: "Log in",
    getStarted: "Get started",
    heroBadge: "Booking system for beauty masters",
    heroTitle: "Let clients book online without endless Instagram messages",
    heroText:
      "Appointly helps independent beauty masters manage bookings, working hours, reminders, and client appointments in one simple place.",
    createPage: "Create your page",
    viewDemo: "View demo",
    feature1Title: "Accept bookings 24/7",
    feature1Text:
      "Clients choose a free slot on your page and book without calls or direct messages.",
    feature2Title: "Stay in control",
    feature2Text:
      "Set working hours, block days off, manage services, and keep your calendar organized.",
    feature3Title: "Send reminders",
    feature3Text:
      "Email reminders come by default. Premium masters can also enable SMS reminders for US phone numbers.",
    footerText: "Simple booking system for beauty masters.",
    createdBy: "created by",
    tengisTitle: "Need a booking website like this?",
    tengisText: "Leave your contact details and a short message.",
    formName: "Name",
    formEmail: "Email",
    formPhone: "Phone",
    formMessage: "Short message",
    sendRequest: "Send request",
  },
  es: {
    brand: "Appointly",
    login: "Iniciar sesión",
    getStarted: "Empezar",
    heroBadge: "Sistema de reservas para profesionales de belleza",
    heroTitle: "Permite que tus clientes reserven online sin mensajes interminables en Instagram",
    heroText:
      "Appointly ayuda a profesionales de belleza independientes a gestionar reservas, horarios de trabajo, recordatorios y citas en un solo lugar.",
    createPage: "Crear tu página",
    viewDemo: "Ver demo",
    feature1Title: "Acepta reservas 24/7",
    feature1Text:
      "Los clientes eligen un horario libre en tu página y reservan sin llamadas ni mensajes directos.",
    feature2Title: "Mantén el control",
    feature2Text:
      "Configura tu horario, bloquea días libres, administra servicios y mantén tu calendario organizado.",
    feature3Title: "Envía recordatorios",
    feature3Text:
      "Los recordatorios por email están incluidos. Los usuarios premium también pueden activar SMS para números de EE. UU.",
    footerText: "Sistema simple de reservas para profesionales de belleza.",
    createdBy: "created by",
    tengisTitle: "¿Quieres un sitio web de reservas como este?",
    tengisText: "Deja tus datos de contacto y un mensaje corto.",
    formName: "Nombre",
    formEmail: "Email",
    formPhone: "Teléfono",
    formMessage: "Mensaje corto",
    sendRequest: "Enviar solicitud",
  },
  ru: {
    brand: "Appointly",
    login: "Войти",
    getStarted: "Начать",
    heroBadge: "Система онлайн-записи для бьюти-мастеров",
    heroTitle: "Пусть клиенты записываются онлайн без бесконечных сообщений в Instagram",
    heroText:
      "Appointly помогает независимым бьюти-мастерам управлять записями, рабочими часами, напоминаниями и клиентскими визитами в одном месте.",
    createPage: "Создать страницу",
    viewDemo: "Смотреть пример",
    feature1Title: "Принимайте записи 24/7",
    feature1Text:
      "Клиенты выбирают свободное окно на вашей странице и записываются без звонков и переписок.",
    feature2Title: "Держите всё под контролем",
    feature2Text:
      "Настраивайте рабочие часы, блокируйте выходные, управляйте услугами и держите календарь в порядке.",
    feature3Title: "Отправляйте напоминания",
    feature3Text:
      "Email-напоминания включены по умолчанию. Премиум-мастера также могут включить SMS для номеров США.",
    footerText: "Простая система онлайн-записи для бьюти-мастеров.",
    createdBy: "created by",
    tengisTitle: "Хотите такой же сайт для записи клиентов?",
    tengisText: "Оставьте свои контакты и короткое сообщение.",
    formName: "Имя",
    formEmail: "Email",
    formPhone: "Телефон",
    formMessage: "Короткий текст",
    sendRequest: "Отправить заявку",
  },
} satisfies Record<Locale, Record<string, string>>;