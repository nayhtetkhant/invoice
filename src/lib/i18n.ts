import type { Language } from "@/types/voucher";

export interface Dictionary {
  // App header & navigation
  appTitle: string;
  appSubtitle: string;
  languageLabel: string;
  langMy: string;
  langEn: string;
  tabEdit: string;
  tabPreviewExport: string;
  previewButton: string;
  backToEdit: string;

  // Shop profile
  shopProfileTitle: string;
  shopProfileDescription: string;
  shopProfileSummaryEmpty: string;
  editShopProfile: string;
  collapseShopProfile: string;
  cancelAction: string;
  shopName: string;
  shopNamePlaceholder: string;
  shopPhones: string;
  shopPhonesPlaceholder: string;
  shopAddressOrSocial: string;
  shopAddressOrSocialPlaceholder: string;
  shopLogo: string;
  uploadLogo: string;
  removeLogo: string;
  accentColor: string;
  customColor: string;
  paymentAccounts: string;
  paymentAccountsHint: string;
  addPaymentAccount: string;
  removePaymentAccount: string;
  paymentLabel: string;
  paymentLabelPlaceholder: string;
  paymentAccountName: string;
  paymentAccountNamePlaceholder: string;
  paymentAccountNumber: string;
  paymentAccountNumberPlaceholder: string;
  paymentQrImage: string;
  uploadQr: string;
  removeQr: string;
  defaultFooter: string;
  defaultFooterPlaceholder: string;
  resetShopProfile: string;
  resetShopProfileConfirm: string;
  shopProfileSavedNotice: string;

  // Voucher order form
  fromLabel: string;
  managePaymentAccounts: string;
  voucherOrderTitle: string;
  newClearVoucher: string;
  clearVoucherConfirm: string;
  voucherNumber: string;
  voucherNumberPlaceholder: string;
  voucherDate: string;
  customerSectionTitle: string;
  customerName: string;
  customerNamePlaceholder: string;
  customerPhone: string;
  customerPhonePlaceholder: string;
  customerAddress: string;
  customerAddressPlaceholder: string;
  addAddress: string;
  itemsSectionTitle: string;
  addItem: string;
  removeItem: string;
  itemName: string;
  itemNamePlaceholder: string;
  quantity: string;
  decreaseQty: string;
  increaseQty: string;
  unitPrice: string;
  lineTotal: string;
  adjustmentsSectionTitle: string;
  currency: string;
  discount: string;
  addDiscount: string;
  deliveryFee: string;
  addDeliveryFee: string;
  deposit: string;
  addDeposit: string;
  markPaidInFull: string;
  notes: string;
  notesPlaceholder: string;
  addNote: string;
  summarySectionTitle: string;
  subtotal: string;
  grandTotal: string;
  balanceDueCod: string;
  paidInFull: string;

  // Voucher preview
  previewTitle: string;
  voucherHeading: string;
  voucherNoLabel: string;
  dateLabel: string;
  billToLabel: string;
  phoneLabel: string;
  addressLabel: string;
  itemCol: string;
  qtyCol: string;
  priceCol: string;
  amountCol: string;
  subtotalLabel: string;
  discountLabel: string;
  deliveryFeeLabel: string;
  grandTotalLabel: string;
  depositLabel: string;
  balanceDueLabel: string;
  paymentMethodsLabel: string;
  notesLabel: string;
  thankYouFallback: string;
  noItemsPlaceholder: string;

  // Export
  exportTitle: string;
  exportFormatLabel: string;
  formatPng: string;
  formatPdf: string;
  formatBoth: string;
  pdfPaperSizeLabel: string;
  paperA4: string;
  paperA5: string;
  downloadButton: string;
  exportingButton: string;
  exportSuccess: string;
  exportError: string;
  copyImageButton: string;
  copyingImageButton: string;
  copyImageSuccess: string;
  copyImageError: string;

  // Image / validation feedback
  invalidImageType: string;
  imageProcessError: string;
}

const my: Dictionary = {
  appTitle: "အွန်လိုင်းဆိုင် ဘောက်ချာ",
  appSubtitle: "မြန်ဆန်လွယ်ကူသော ဘောက်ချာထုတ်စက်",
  languageLabel: "ဘာသာစကား",
  langMy: "မြန်မာ",
  langEn: "EN",
  tabEdit: "ဖြည့်သွင်းရန်",
  tabPreviewExport: "ကြည့်ရှု & ထုတ်ယူရန်",
  previewButton: "အကြိုကြည့်ရန်",
  backToEdit: "ပြင်ဆင်ရန်",

  shopProfileTitle: "ဆိုင်အချက်အလက်",
  shopProfileDescription: "ဤစက်ထဲတွင် အလိုအလျောက် သိမ်းဆည်းထားပါမည်။",
  shopProfileSummaryEmpty: "ဆိုင်အမည်နှင့် ငွေလက်ခံအကောင့်များ ထည့်သွင်းပါ",
  editShopProfile: "ပြင်ဆင်ရန်",
  collapseShopProfile: "ပြီးပါပြီ",
  cancelAction: "မလုပ်တော့ပါ",
  shopName: "ဆိုင်အမည်",
  shopNamePlaceholder: "ဥပမာ - မမလေး ဖက်ရှင်",
  shopPhones: "ဖုန်းနံပါတ်",
  shopPhonesPlaceholder: "09-123456789, 09-987654321",
  shopAddressOrSocial: "လိပ်စာ / ဆိုရှယ်လင့်ခ်",
  shopAddressOrSocialPlaceholder: "ရန်ကုန် / fb.com/yourshop",
  shopLogo: "ဆိုင်လိုဂို",
  uploadLogo: "လိုဂိုတင်ရန်",
  removeLogo: "လိုဂိုဖယ်ရှားရန်",
  accentColor: "အဓိကအရောင်",
  customColor: "အရောင်ရွေးရန်",
  paymentAccounts: "ငွေလက်ခံအကောင့်များ",
  paymentAccountsHint: "KBZPay, WavePay သို့မဟုတ် ဘဏ်အကောင့်နှင့် QR ပုံများ ထည့်သွင်းပါက ဘောက်ချာတွင် ဖော်ပြပေးပါမည်။",
  addPaymentAccount: "အကောင့်ထပ်ထည့်ရန်",
  removePaymentAccount: "ဖယ်ရှားရန်",
  paymentLabel: "ငွေပေးချေမှုနည်းလမ်း",
  paymentLabelPlaceholder: "KBZPay / WavePay / CB Bank",
  paymentAccountName: "အကောင့်အမည်",
  paymentAccountNamePlaceholder: "Daw Mya Mya",
  paymentAccountNumber: "အကောင့်နံပါတ် / ဖုန်း",
  paymentAccountNumberPlaceholder: "09-123456789",
  paymentQrImage: "QR ပုံ (ထည့်လိုပါက)",
  uploadQr: "QR တင်ရန်",
  removeQr: "QR ဖယ်ရန်",
  defaultFooter: "မူလအောက်ခြေစာသား",
  defaultFooterPlaceholder: "ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ပါသည်။",
  resetShopProfile: "ဆိုင်အချက်အလက် ရှင်းလင်းရန်",
  resetShopProfileConfirm: "သိမ်းထားသော ဆိုင်အချက်အလက်အားလုံးကို ဖျက်မလား?",
  shopProfileSavedNotice: "စက်ထဲတွင် အလိုအလျောက် သိမ်းပြီး",

  fromLabel: "ဆိုင်မှ (From)",
  managePaymentAccounts: "ငွေလက်ခံအကောင့် / QR စီမံရန်",
  voucherOrderTitle: "ဘောက်ချာအချက်အလက်",
  newClearVoucher: "ဘောက်ချာအသစ် / ရှင်းရန်",
  clearVoucherConfirm: "လက်ရှိဖြည့်ထားသော ဘောက်ချာအချက်အလက်များကို ရှင်းလင်းမလား?",
  voucherNumber: "ဘောက်ချာနံပါတ်",
  voucherNumberPlaceholder: "ဥပမာ - V-001",
  voucherDate: "ရက်စွဲ",
  customerSectionTitle: "ဝယ်သူအချက်အလက်",
  customerName: "ဝယ်သူအမည်",
  customerNamePlaceholder: "အမည်ထည့်ပါ",
  customerPhone: "ဖုန်းနံပါတ်",
  customerPhonePlaceholder: "09-xxxxxxxxx",
  customerAddress: "ပို့ဆောင်မည့်လိပ်စာ",
  customerAddressPlaceholder: "မြို့နယ်၊ လိပ်စာအပြည့်အစုံ",
  addAddress: "ပို့ဆောင်မည့်လိပ်စာ ထည့်ရန်",
  itemsSectionTitle: "မှာယူသည့်ပစ္စည်းများ",
  addItem: "ပစ္စည်းထပ်ထည့်ရန်",
  removeItem: "ဖျက်ရန်",
  itemName: "ပစ္စည်းအမည်",
  itemNamePlaceholder: "ပစ္စည်းအမည်ရေးပါ",
  quantity: "အရေအတွက်",
  decreaseQty: "အရေအတွက် လျှော့ရန်",
  increaseQty: "အရေအတွက် တိုးရန်",
  unitPrice: "နှုန်း",
  lineTotal: "သင့်ငွေ",
  adjustmentsSectionTitle: "ငွေပေးချေမှုနှင့် တွက်ချက်မှု",
  currency: "ငွေကြေး",
  discount: "လျှော့ဈေး",
  addDiscount: "လျှော့ဈေး ထည့်ရန်",
  deliveryFee: "ပို့ခ",
  addDeliveryFee: "ပို့ခ ထည့်ရန်",
  deposit: "စရန်ငွေ / ကြိုတင်ငွေ",
  addDeposit: "စရန်ငွေ ထည့်ရန်",
  markPaidInFull: "အပြည့်ပေးပြီး",
  notes: "မှတ်ချက်",
  notesPlaceholder: "ပို့ဆောင်ချိန် သို့မဟုတ် မှာကြားချက်",
  addNote: "မှတ်ချက် ထည့်ရန်",
  summarySectionTitle: "စုစုပေါင်းစာရင်း",
  subtotal: "ပစ္စည်းစုစုပေါင်း",
  grandTotal: "ကျသင့်ငွေစုစုပေါင်း",
  balanceDueCod: "ပေးချေရန်ကျန်ငွေ (COD)",
  paidInFull: "ငွေအပြည့်ပေးချေပြီး",

  previewTitle: "ဘောက်ချာအကြိုကြည့်ရှုရန်",
  voucherHeading: "အရောင်းဘောက်ချာ",
  voucherNoLabel: "ဘောက်ချာအမှတ်",
  dateLabel: "ရက်စွဲ",
  billToLabel: "ဝယ်သူ",
  phoneLabel: "ဖုန်း",
  addressLabel: "လိပ်စာ",
  itemCol: "ပစ္စည်း",
  qtyCol: "အရေအတွက်",
  priceCol: "နှုန်း",
  amountCol: "သင့်ငွေ",
  subtotalLabel: "စုစုပေါင်း",
  discountLabel: "လျှော့ဈေး",
  deliveryFeeLabel: "ပို့ခ",
  grandTotalLabel: "စုစုပေါင်းကျသင့်ငွေ",
  depositLabel: "ကြိုတင်ပေးငွေ",
  balanceDueLabel: "ပေးချေရန်ကျန်ငွေ (COD)",
  paymentMethodsLabel: "ငွေလွှဲရန် အကောင့်များ",
  notesLabel: "မှတ်ချက်",
  thankYouFallback: "ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ပါသည်။",
  noItemsPlaceholder: "ပစ္စည်းစာရင်း မရှိသေးပါ",

  exportTitle: "ဘောက်ချာထုတ်ယူရန်",
  exportFormatLabel: "ဖိုင်အမျိုးအစား",
  formatPng: "PNG ပုံ",
  formatPdf: "PDF ဖိုင်",
  formatBoth: "PNG + PDF",
  pdfPaperSizeLabel: "PDF စာရွက်အရွယ်အစား",
  paperA4: "A4",
  paperA5: "A5",
  downloadButton: "ဘောက်ချာဒေါင်းလုဒ်လုပ်မည်",
  exportingButton: "ဖိုင်ထုတ်နေပါသည်...",
  exportSuccess: "ဘောက်ချာဖိုင် ဒေါင်းလုဒ်ဆွဲပြီးပါပြီ။",
  exportError: "ဘောက်ချာထုတ်ယူရာတွင် အမှားဖြစ်ပွားပါသည်။ ထပ်မံကြိုးစားပါ။",
  copyImageButton: "ပုံကူးယူရန်",
  copyingImageButton: "ကူးယူနေပါသည်...",
  copyImageSuccess: "ကူးယူပြီးပါပြီ",
  copyImageError: "ပုံကူးယူ၍မရပါ။ ဒေါင်းလုဒ်ဆွဲ၍ သုံးပါ။",

  invalidImageType: "PNG, JPG သို့မဟုတ် WebP ပုံဖိုင်သာ ရွေးချယ်ပါ။",
  imageProcessError: "ပုံဖိုင်ကို ပြင်ဆင်ရာတွင် မအောင်မြင်ပါ။",
};

const en: Dictionary = {
  appTitle: "Social Shop Voucher",
  appSubtitle: "Fast single-use voucher generator",
  languageLabel: "Language",
  langMy: "မြန်မာ",
  langEn: "EN",
  tabEdit: "Edit",
  tabPreviewExport: "Preview & Export",
  previewButton: "Preview",
  backToEdit: "Edit",

  shopProfileTitle: "Shop Profile",
  shopProfileDescription: "Auto-saved locally in this browser.",
  shopProfileSummaryEmpty: "Add your shop name and payment accounts",
  editShopProfile: "Edit",
  collapseShopProfile: "Done",
  cancelAction: "Cancel",
  shopName: "Shop Name",
  shopNamePlaceholder: "e.g. Ma Ma Lay Fashion",
  shopPhones: "Phone Number(s)",
  shopPhonesPlaceholder: "09-123456789, 09-987654321",
  shopAddressOrSocial: "Address / Social Link",
  shopAddressOrSocialPlaceholder: "Yangon / fb.com/yourshop",
  shopLogo: "Shop Logo",
  uploadLogo: "Upload Logo",
  removeLogo: "Remove Logo",
  accentColor: "Accent Color",
  customColor: "Custom Color",
  paymentAccounts: "Payment Accounts",
  paymentAccountsHint: "Add KBZPay, WavePay, or bank accounts and QR codes to display on vouchers.",
  addPaymentAccount: "Add Payment Account",
  removePaymentAccount: "Remove",
  paymentLabel: "Payment Method",
  paymentLabelPlaceholder: "KBZPay / WavePay / CB Bank",
  paymentAccountName: "Account Name",
  paymentAccountNamePlaceholder: "Daw Mya Mya",
  paymentAccountNumber: "Account Number / Phone",
  paymentAccountNumberPlaceholder: "09-123456789",
  paymentQrImage: "QR Image (Optional)",
  uploadQr: "Upload QR",
  removeQr: "Remove QR",
  defaultFooter: "Default Footer Note",
  defaultFooterPlaceholder: "Thank you for shopping with us!",
  resetShopProfile: "Reset Shop Profile",
  resetShopProfileConfirm: "Clear all saved shop profile details?",
  shopProfileSavedNotice: "Auto-saved in browser",

  fromLabel: "From",
  managePaymentAccounts: "Payment Accounts & QR",
  voucherOrderTitle: "Voucher Order",
  newClearVoucher: "New / Clear Voucher",
  clearVoucherConfirm: "Clear the current voucher details?",
  voucherNumber: "Voucher #",
  voucherNumberPlaceholder: "e.g. V-001",
  voucherDate: "Date",
  customerSectionTitle: "Customer Details",
  customerName: "Customer Name",
  customerNamePlaceholder: "Enter customer name",
  customerPhone: "Phone Number",
  customerPhonePlaceholder: "09-xxxxxxxxx",
  customerAddress: "Delivery Address",
  customerAddressPlaceholder: "Township, full delivery address",
  addAddress: "Add delivery address",
  itemsSectionTitle: "Line Items",
  addItem: "Add Item",
  removeItem: "Remove",
  itemName: "Item Name",
  itemNamePlaceholder: "Enter item name",
  quantity: "Qty",
  decreaseQty: "Decrease quantity",
  increaseQty: "Increase quantity",
  unitPrice: "Unit Price",
  lineTotal: "Line Total",
  adjustmentsSectionTitle: "Adjustments & Payment",
  currency: "Currency",
  discount: "Discount",
  addDiscount: "Add discount",
  deliveryFee: "Delivery Fee",
  addDeliveryFee: "Add delivery",
  deposit: "Prepaid / Deposit",
  addDeposit: "Add deposit",
  markPaidInFull: "Paid in full",
  notes: "Order Notes",
  notesPlaceholder: "Delivery instructions or note",
  addNote: "Add note",
  summarySectionTitle: "Order Summary",
  subtotal: "Subtotal",
  grandTotal: "Grand Total",
  balanceDueCod: "Balance Due / COD",
  paidInFull: "Paid in Full",

  previewTitle: "Live Voucher Preview",
  voucherHeading: "ORDER VOUCHER",
  voucherNoLabel: "Voucher No",
  dateLabel: "Date",
  billToLabel: "Bill To",
  phoneLabel: "Phone",
  addressLabel: "Address",
  itemCol: "Item",
  qtyCol: "Qty",
  priceCol: "Price",
  amountCol: "Amount",
  subtotalLabel: "Subtotal",
  discountLabel: "Discount",
  deliveryFeeLabel: "Delivery Fee",
  grandTotalLabel: "Grand Total",
  depositLabel: "Prepaid / Deposit",
  balanceDueLabel: "Balance Due (COD)",
  paymentMethodsLabel: "Payment Accounts",
  notesLabel: "Notes",
  thankYouFallback: "Thank you for your order!",
  noItemsPlaceholder: "No items added yet",

  exportTitle: "Export Voucher",
  exportFormatLabel: "Export Format",
  formatPng: "PNG",
  formatPdf: "PDF",
  formatBoth: "PNG + PDF",
  pdfPaperSizeLabel: "PDF Paper Size",
  paperA4: "A4",
  paperA5: "A5",
  downloadButton: "Download Voucher",
  exportingButton: "Exporting...",
  exportSuccess: "Voucher downloaded successfully.",
  exportError: "Failed to export voucher. Please try again.",
  copyImageButton: "Copy Image",
  copyingImageButton: "Copying...",
  copyImageSuccess: "Copied!",
  copyImageError: "Could not copy image. Please download instead.",

  invalidImageType: "Please choose a PNG, JPG, or WebP image.",
  imageProcessError: "Could not process the selected image.",
};

export const dictionaries: Record<Language, Dictionary> = {
  my,
  en,
};

export function getDictionary(language: Language): Dictionary {
  return dictionaries[language];
}
