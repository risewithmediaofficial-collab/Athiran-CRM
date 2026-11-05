export const LEAD_STATUSES = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  follow_up_required: 'Follow-up Required',
  visit_planned: 'Visit Planned',
  negotiation: 'Negotiation',
  demo_planned: 'Demo Planned',
  booking_pending: 'Booking Pending',
  booked: 'Booked',
  converted: 'Converted',
  lost: 'Lost',
  not_interested: 'Not Interested',
}

export const LEAD_TEMPERATURES = {
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
}

export const LEAD_SOURCES = {
  meta_ads: 'Meta Ads',
  facebook: 'Facebook',
  instagram: 'Instagram',
  website: 'Website',
  google_ads: 'Google Ads',
  google_search: 'Google Search',
  whatsapp: 'WhatsApp',
  phone_call: 'Phone Call',
  walk_in: 'Walk-in',
  referral: 'Referral',
  existing_customer: 'Existing Customer',
  exhibition_event: 'Exhibition / Event',
  other: 'Other',
}

export const LEAD_PRIORITIES = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const ROLES = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  sales_manager: 'Sales Manager',
  sales_executive: 'Sales Executive',
  telecaller: 'Telecaller',
  service_manager: 'Service Manager',
  service_advisor: 'Service Advisor',
  service_technician: 'Service Technician',
}

export const DEPARTMENTS = {
  sales: 'Sales',
  service: 'Service',
  management: 'Management',
  admin: 'Admin',
}

export const DEPARTMENT_DESIGNATIONS = {
  sales: [
    'Sales Manager',
    'Senior Sales Executive',
    'Sales Executive',
    'Telecaller / Inquiry Specialist',
    'Field Sales Officer',
    'Showroom Sales Representative',
  ],
  service: [
    'Service Manager',
    'Senior Service Advisor',
    'Service Advisor',
    'Chief Workshop Technician',
    'Tractor Service Technician',
    'Field Breakdown Engineer',
  ],
  management: [
    'Dealership General Manager',
    'Sales & Operations Director',
    'Finance & Accounts Manager',
    'Inventory & Logistics Head',
  ],
  admin: [
    'System Administrator',
    'CRM & IT Coordinator',
    'Administrative Officer',
    'Data Entry Specialist',
  ],
}

export const TAMIL_NADU_DISTRICTS = [
  'Tiruppur',
  'Coimbatore',
  'Erode',
  'Salem',
  'Namakkal',
  'Dindigul',
  'Karur',
  'Madurai',
  'Dharmapuri',
  'Krishnagiri',
  'Trichy',
  'Thanjavur',
  'Theni',
  'Virudhunagar',
  'Tirunelveli',
  'Thoothukudi',
  'Chennai',
  'Kanchipuram',
  'Vellore',
  'Cuddalore',
  'Villupuram',
  'Pudukkottai',
  'Nagapattinam',
  'Ariyalur',
  'Perambalur',
  'Nilgiris',
  'Sivaganga',
  'Ramanathapuram',
  'Kanyakumari',
]

export const INDIAN_STATES = [
  'Tamil Nadu',
  'Kerala',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Pondicherry',
  'Other State',
]

export const TRACTOR_MODELS = [
  'Athiran PowerTrac 45 HP (2WD)',
  'Athiran PowerTrac 50 HP (4WD)',
  'Athiran FarmTrac 55 HP (4WD)',
  'Athiran AgroTrac 60 HP Heavy Duty',
  'Athiran CompactTrac 35 HP Orchard Special',
  'Athiran SuperTrac 75 HP Turbo',
  'Mahindra 575 DI (45 HP)',
  'Mahindra 475 DI (42 HP)',
  'Swaraj 744 FE (48 HP)',
  'Swaraj 855 FE (52 HP)',
  'John Deere 5050 D (50 HP)',
  'Massey Ferguson 241 DI (42 HP)',
  'Powertrac Euro 50 (50 HP)',
  'Sonalika DI 42 RX (42 HP)',
  'Other Model',
]

export const LEAVE_TYPES = {
  casual: 'Casual Leave (CL)',
  sick: 'Sick Leave (SL)',
  emergency: 'Emergency / Personal Leave',
  earned: 'Earned / Privilege Leave',
}

export const SERVICE_TYPES = {
  first_free: '1st Free Service (50 Hours)',
  second_free: '2nd Free Service (250 Hours)',
  routine_paid: 'Routine Paid Maintenance (Every 250 Hours)',
  major_overhaul: 'Major Engine / Transmission Overhaul',
  breakdown_repair: 'Breakdown / Field Emergency Repair',
  warranty_repair: 'Warranty Part Replacement',
}

export const SERVICE_STATUSES = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress (Bay Occupied)',
  waiting_parts: 'Waiting for Spares / Parts',
  completed: 'Completed & Delivered',
  cancelled: 'Cancelled',
}

export const PERMISSIONS = {
  LEADS_VIEW_ALL: 'LEADS:VIEW_ALL',
  LEADS_VIEW_OWN: 'LEADS:VIEW_OWN',
  LEADS_CREATE: 'LEADS:CREATE',
  LEADS_EDIT_ALL: 'LEADS:EDIT_ALL',
  LEADS_EDIT_OWN: 'LEADS:EDIT_OWN',
  LEADS_ASSIGN: 'LEADS:ASSIGN',
  LEADS_REASSIGN: 'LEADS:REASSIGN',
  LEADS_DELETE: 'LEADS:DELETE',
  LEADS_ARCHIVE: 'LEADS:ARCHIVE',
  LEADS_EXPORT: 'LEADS:EXPORT',

  FOLLOWUPS_VIEW_ALL: 'FOLLOWUPS:VIEW_ALL',
  FOLLOWUPS_VIEW_OWN: 'FOLLOWUPS:VIEW_OWN',
  FOLLOWUPS_CREATE: 'FOLLOWUPS:CREATE',
  FOLLOWUPS_UPDATE: 'FOLLOWUPS:UPDATE',
  FOLLOWUPS_COMPLETE: 'FOLLOWUPS:COMPLETE',

  EMPLOYEES_VIEW_ALL: 'EMPLOYEES:VIEW_ALL',
  EMPLOYEES_VIEW_PROFILE: 'EMPLOYEES:VIEW_PROFILE',
  EMPLOYEES_CREATE: 'EMPLOYEES:CREATE',
  EMPLOYEES_EDIT: 'EMPLOYEES:EDIT',
  EMPLOYEES_DEACTIVATE: 'EMPLOYEES:DEACTIVATE',
  EMPLOYEES_RESET_PASSWORD: 'EMPLOYEES:RESET_PASSWORD',

  LEAVE_VIEW_ALL: 'LEAVE:VIEW_ALL',
  LEAVE_VIEW_OWN: 'LEAVE:VIEW_OWN',
  LEAVE_APPLY: 'LEAVE:APPLY',
  LEAVE_APPROVE: 'LEAVE:APPROVE',
  LEAVE_REJECT: 'LEAVE:REJECT',
  LEAVE_MANAGE_HANDOVER: 'LEAVE:MANAGE_HANDOVER',

  SERVICE_VIEW_ALL: 'SERVICE:VIEW_ALL',
  SERVICE_VIEW_OWN: 'SERVICE:VIEW_OWN',
  SERVICE_CREATE: 'SERVICE:CREATE',
  SERVICE_EDIT: 'SERVICE:EDIT',
  SERVICE_ASSIGN: 'SERVICE:ASSIGN',
  SERVICE_DELETE: 'SERVICE:DELETE',

  CUSTOMERS_VIEW_ALL: 'CUSTOMERS:VIEW_ALL',
  CUSTOMERS_CREATE: 'CUSTOMERS:CREATE',
  CUSTOMERS_EDIT: 'CUSTOMERS:EDIT',

  TRACTORS_VIEW_ALL: 'TRACTORS:VIEW_ALL',
  TRACTORS_CREATE: 'TRACTORS:CREATE',
  TRACTORS_EDIT: 'TRACTORS:EDIT',

  METER_READINGS_CREATE: 'METER_READINGS:CREATE',
  METER_READINGS_CORRECT: 'METER_READINGS:CORRECT',

  REPORTS_SALES: 'REPORTS:SALES',
  REPORTS_SERVICE: 'REPORTS:SERVICE',
  REPORTS_EMPLOYEES: 'REPORTS:EMPLOYEES',
  REPORTS_EXPORT: 'REPORTS:EXPORT',

  AUDIT_VIEW: 'AUDIT:VIEW',
  SETTINGS_MANAGE: 'SETTINGS:MANAGE',
  NOTIFICATIONS_VIEW_OWN: 'NOTIFICATIONS:VIEW_OWN',
  RBAC_MANAGE: 'RBAC:MANAGE',
}
