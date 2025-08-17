import { supabase } from './supabase';
import type { 
  Client, Project, Package, AddOn, TeamMember, Transaction, 
  Card, FinancialPocket, Lead, Asset, Contract, ClientFeedback,
  SocialMediaPost, PromoCode, SOP, Notification, TeamProjectPayment,
  TeamPaymentRecord, RewardLedgerEntry, Profile, User
} from '../types';

// Helper function to transform database rows to application types
const transformDatabaseRow = (row: any, type: string) => {
  if (!row) return null;
  
  const transformed = { ...row };
  
  // Convert snake_case to camelCase for specific fields
  const fieldMappings: { [key: string]: { [dbField: string]: string } } = {
    client: {
      portal_access_id: 'portalAccessId',
      client_type: 'clientType',
      last_contact: 'lastContact'
    },
    project: {
      project_name: 'projectName',
      client_name: 'clientName',
      client_id: 'clientId',
      project_type: 'projectType',
      package_name: 'packageName',
      package_id: 'packageId',
      add_ons: 'addOns',
      deadline_date: 'deadlineDate',
      active_sub_statuses: 'activeSubStatuses',
      total_cost: 'totalCost',
      amount_paid: 'amountPaid',
      payment_status: 'paymentStatus',
      drive_link: 'driveLink',
      client_drive_link: 'clientDriveLink',
      final_drive_link: 'finalDriveLink',
      start_time: 'startTime',
      end_time: 'endTime',
      promo_code_id: 'promoCodeId',
      discount_amount: 'discountAmount',
      shipping_details: 'shippingDetails',
      dp_proof_url: 'dpProofUrl',
      printing_details: 'printingDetails',
      printing_cost: 'printingCost',
      transport_cost: 'transportCost',
      is_editing_confirmed_by_client: 'isEditingConfirmedByClient',
      is_printing_confirmed_by_client: 'isPrintingConfirmedByClient',
      is_delivery_confirmed_by_client: 'isDeliveryConfirmedByClient',
      confirmed_sub_statuses: 'confirmedSubStatuses',
      client_sub_status_notes: 'clientSubStatusNotes',
      sub_status_confirmation_sent_at: 'subStatusConfirmationSentAt',
      completed_digital_items: 'completedDigitalItems',
      invoice_signature: 'invoiceSignature',
      custom_sub_statuses: 'customSubStatuses'
    },
    package: {
      physical_items: 'physicalItems',
      digital_items: 'digitalItems',
      processing_time: 'processingTime',
      default_printing_cost: 'defaultPrintingCost',
      default_transport_cost: 'defaultTransportCost'
    },
    teamMember: {
      standard_fee: 'standardFee',
      no_rek: 'noRek',
      reward_balance: 'rewardBalance',
      performance_notes: 'performanceNotes',
      portal_access_id: 'portalAccessId'
    },
    card: {
      card_holder_name: 'cardHolderName',
      bank_name: 'bankName',
      card_type: 'cardType',
      last_four_digits: 'lastFourDigits',
      expiry_date: 'expiryDate',
      color_gradient: 'colorGradient'
    },
    pocket: {
      goal_amount: 'goalAmount',
      lock_end_date: 'lockEndDate',
      source_card_id: 'sourceCardId'
    },
    asset: {
      purchase_date: 'purchaseDate',
      purchase_price: 'purchasePrice',
      serial_number: 'serialNumber'
    },
    contract: {
      contract_number: 'contractNumber',
      client_id: 'clientId',
      project_id: 'projectId',
      signing_date: 'signingDate',
      signing_location: 'signingLocation',
      client_name1: 'clientName1',
      client_address1: 'clientAddress1',
      client_phone1: 'clientPhone1',
      client_name2: 'clientName2',
      client_address2: 'clientAddress2',
      client_phone2: 'clientPhone2',
      shooting_duration: 'shootingDuration',
      guaranteed_photos: 'guaranteedPhotos',
      album_details: 'albumDetails',
      digital_files_format: 'digitalFilesFormat',
      other_items: 'otherItems',
      personnel_count: 'personnelCount',
      delivery_timeframe: 'deliveryTimeframe',
      dp_date: 'dpDate',
      final_payment_date: 'finalPaymentDate',
      cancellation_policy: 'cancellationPolicy',
      vendor_signature: 'vendorSignature',
      client_signature: 'clientSignature'
    },
    feedback: {
      client_name: 'clientName'
    },
    socialPost: {
      project_id: 'projectId',
      client_name: 'clientName',
      post_type: 'postType',
      scheduled_date: 'scheduledDate',
      media_url: 'mediaUrl'
    },
    promoCode: {
      discount_type: 'discountType',
      discount_value: 'discountValue',
      is_active: 'isActive',
      usage_count: 'usageCount',
      max_usage: 'maxUsage',
      expiry_date: 'expiryDate'
    },
    sop: {
      last_updated: 'lastUpdated'
    },
    notification: {
      is_read: 'isRead',
      link_view: 'linkView',
      link_action: 'linkAction'
    },
    teamPayment: {
      project_id: 'projectId',
      team_member_name: 'teamMemberName',
      team_member_id: 'teamMemberId'
    },
    paymentRecord: {
      record_number: 'recordNumber',
      team_member_id: 'teamMemberId',
      project_payment_ids: 'projectPaymentIds',
      total_amount: 'totalAmount',
      vendor_signature: 'vendorSignature'
    },
    rewardEntry: {
      team_member_id: 'teamMemberId',
      project_id: 'projectId'
    },
    profile: {
      user_id: 'userId',
      full_name: 'fullName',
      company_name: 'companyName',
      bank_account: 'bankAccount',
      authorized_signer: 'authorizedSigner',
      id_number: 'idNumber',
      income_categories: 'incomeCategories',
      expense_categories: 'expenseCategories',
      project_types: 'projectTypes',
      event_types: 'eventTypes',
      asset_categories: 'assetCategories',
      sop_categories: 'sopCategories',
      project_status_config: 'projectStatusConfig',
      notification_settings: 'notificationSettings',
      security_settings: 'securitySettings',
      briefing_template: 'briefingTemplate',
      terms_and_conditions: 'termsAndConditions'
    },
    user: {
      password_hash: 'password',
      full_name: 'fullName'
    }
  };

  const mappings = fieldMappings[type] || {};
  Object.keys(mappings).forEach(dbField => {
    if (transformed[dbField] !== undefined) {
      transformed[mappings[dbField]] = transformed[dbField];
      delete transformed[dbField];
    }
  });

  // Convert timestamps
  if (transformed.created_at) transformed.createdAt = transformed.created_at;
  if (transformed.updated_at) transformed.updatedAt = transformed.updated_at;
  delete transformed.created_at;
  delete transformed.updated_at;

  return transformed;
};

// Helper function to transform application types to database format
const transformToDatabase = (data: any, type: string) => {
  const transformed = { ...data };
  
  // Remove id if it's being generated
  if (transformed.id && transformed.id.startsWith('CLI') || transformed.id.startsWith('PRJ') || transformed.id.startsWith('PKG')) {
    delete transformed.id;
  }

  // Convert camelCase to snake_case
  const fieldMappings: { [key: string]: { [appField: string]: string } } = {
    client: {
      portalAccessId: 'portal_access_id',
      clientType: 'client_type',
      lastContact: 'last_contact'
    },
    project: {
      projectName: 'project_name',
      clientName: 'client_name',
      clientId: 'client_id',
      projectType: 'project_type',
      packageName: 'package_name',
      packageId: 'package_id',
      addOns: 'add_ons',
      deadlineDate: 'deadline_date',
      activeSubStatuses: 'active_sub_statuses',
      totalCost: 'total_cost',
      amountPaid: 'amount_paid',
      paymentStatus: 'payment_status',
      driveLink: 'drive_link',
      clientDriveLink: 'client_drive_link',
      finalDriveLink: 'final_drive_link',
      startTime: 'start_time',
      endTime: 'end_time',
      promoCodeId: 'promo_code_id',
      discountAmount: 'discount_amount',
      shippingDetails: 'shipping_details',
      dpProofUrl: 'dp_proof_url',
      printingDetails: 'printing_details',
      printingCost: 'printing_cost',
      transportCost: 'transport_cost',
      isEditingConfirmedByClient: 'is_editing_confirmed_by_client',
      isPrintingConfirmedByClient: 'is_printing_confirmed_by_client',
      isDeliveryConfirmedByClient: 'is_delivery_confirmed_by_client',
      confirmedSubStatuses: 'confirmed_sub_statuses',
      clientSubStatusNotes: 'client_sub_status_notes',
      subStatusConfirmationSentAt: 'sub_status_confirmation_sent_at',
      completedDigitalItems: 'completed_digital_items',
      invoiceSignature: 'invoice_signature',
      customSubStatuses: 'custom_sub_statuses'
    },
    package: {
      physicalItems: 'physical_items',
      digitalItems: 'digital_items',
      processingTime: 'processing_time',
      defaultPrintingCost: 'default_printing_cost',
      defaultTransportCost: 'default_transport_cost'
    },
    teamMember: {
      standardFee: 'standard_fee',
      noRek: 'no_rek',
      rewardBalance: 'reward_balance',
      performanceNotes: 'performance_notes',
      portalAccessId: 'portal_access_id'
    },
    card: {
      cardHolderName: 'card_holder_name',
      bankName: 'bank_name',
      cardType: 'card_type',
      lastFourDigits: 'last_four_digits',
      expiryDate: 'expiry_date',
      colorGradient: 'color_gradient'
    },
    pocket: {
      goalAmount: 'goal_amount',
      lockEndDate: 'lock_end_date',
      sourceCardId: 'source_card_id'
    },
    asset: {
      purchaseDate: 'purchase_date',
      purchasePrice: 'purchase_price',
      serialNumber: 'serial_number'
    },
    contract: {
      contractNumber: 'contract_number',
      clientId: 'client_id',
      projectId: 'project_id',
      signingDate: 'signing_date',
      signingLocation: 'signing_location',
      clientName1: 'client_name1',
      clientAddress1: 'client_address1',
      clientPhone1: 'client_phone1',
      clientName2: 'client_name2',
      clientAddress2: 'client_address2',
      clientPhone2: 'client_phone2',
      shootingDuration: 'shooting_duration',
      guaranteedPhotos: 'guaranteed_photos',
      albumDetails: 'album_details',
      digitalFilesFormat: 'digital_files_format',
      otherItems: 'other_items',
      personnelCount: 'personnel_count',
      deliveryTimeframe: 'delivery_timeframe',
      dpDate: 'dp_date',
      finalPaymentDate: 'final_payment_date',
      cancellationPolicy: 'cancellation_policy',
      vendorSignature: 'vendor_signature',
      clientSignature: 'client_signature'
    },
    feedback: {
      clientName: 'client_name'
    },
    socialPost: {
      projectId: 'project_id',
      clientName: 'client_name',
      postType: 'post_type',
      scheduledDate: 'scheduled_date',
      mediaUrl: 'media_url'
    },
    promoCode: {
      discountType: 'discount_type',
      discountValue: 'discount_value',
      isActive: 'is_active',
      usageCount: 'usage_count',
      maxUsage: 'max_usage',
      expiryDate: 'expiry_date'
    },
    sop: {
      lastUpdated: 'last_updated'
    },
    notification: {
      isRead: 'is_read',
      linkView: 'link_view',
      linkAction: 'link_action'
    },
    teamPayment: {
      projectId: 'project_id',
      teamMemberName: 'team_member_name',
      teamMemberId: 'team_member_id'
    },
    paymentRecord: {
      recordNumber: 'record_number',
      teamMemberId: 'team_member_id',
      projectPaymentIds: 'project_payment_ids',
      totalAmount: 'total_amount',
      vendorSignature: 'vendor_signature'
    },
    rewardEntry: {
      teamMemberId: 'team_member_id',
      projectId: 'project_id'
    },
    profile: {
      userId: 'user_id',
      fullName: 'full_name',
      companyName: 'company_name',
      bankAccount: 'bank_account',
      authorizedSigner: 'authorized_signer',
      idNumber: 'id_number',
      incomeCategories: 'income_categories',
      expenseCategories: 'expense_categories',
      projectTypes: 'project_types',
      eventTypes: 'event_types',
      assetCategories: 'asset_categories',
      sopCategories: 'sop_categories',
      projectStatusConfig: 'project_status_config',
      notificationSettings: 'notification_settings',
      securitySettings: 'security_settings',
      briefingTemplate: 'briefing_template',
      termsAndConditions: 'terms_and_conditions'
    },
    user: {
      fullName: 'full_name',
      passwordHash: 'password_hash'
    }
  };

  const mappings = fieldMappings[type] || {};
  Object.keys(mappings).forEach(appField => {
    if (transformed[appField] !== undefined) {
      transformed[mappings[appField]] = transformed[appField];
      delete transformed[appField];
    }
  });

  // Remove undefined fields
  Object.keys(transformed).forEach(key => {
    if (transformed[key] === undefined) {
      delete transformed[key];
    }
  });

  return transformed;
};

// Generic CRUD operations
export const api = {
  // Clients
  clients: {
    getAll: async (): Promise<Client[]> => {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'client'));
    },
    
    getById: async (id: string): Promise<Client | null> => {
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
      if (error) throw error;
      return transformDatabaseRow(data, 'client');
    },
    
    getByPortalId: async (portalId: string): Promise<Client | null> => {
      const { data, error } = await supabase.from('clients').select('*').eq('portal_access_id', portalId).single();
      if (error) return null;
      return transformDatabaseRow(data, 'client');
    },
    
    create: async (client: Omit<Client, 'id'>): Promise<Client> => {
      const dbData = transformToDatabase(client, 'client');
      const { data, error } = await supabase.from('clients').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'client');
    },
    
    update: async (id: string, updates: Partial<Client>): Promise<Client> => {
      const dbData = transformToDatabase(updates, 'client');
      const { data, error } = await supabase.from('clients').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'client');
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Projects
  projects: {
    getAll: async (): Promise<Project[]> => {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'project'));
    },
    
    getById: async (id: string): Promise<Project | null> => {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (error) throw error;
      return transformDatabaseRow(data, 'project');
    },
    
    getByClientId: async (clientId: string): Promise<Project[]> => {
      const { data, error } = await supabase.from('projects').select('*').eq('client_id', clientId);
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'project'));
    },
    
    create: async (project: Omit<Project, 'id'>): Promise<Project> => {
      const dbData = transformToDatabase(project, 'project');
      const { data, error } = await supabase.from('projects').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'project');
    },
    
    update: async (id: string, updates: Partial<Project>): Promise<Project> => {
      const dbData = transformToDatabase(updates, 'project');
      const { data, error } = await supabase.from('projects').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'project');
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Packages
  packages: {
    getAll: async (): Promise<Package[]> => {
      const { data, error } = await supabase.from('packages').select('*').order('name');
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'package'));
    },
    
    create: async (pkg: Omit<Package, 'id'>): Promise<Package> => {
      const dbData = transformToDatabase(pkg, 'package');
      const { data, error } = await supabase.from('packages').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'package');
    },
    
    update: async (id: string, updates: Partial<Package>): Promise<Package> => {
      const dbData = transformToDatabase(updates, 'package');
      const { data, error } = await supabase.from('packages').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'package');
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('packages').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Add-ons
  addOns: {
    getAll: async (): Promise<AddOn[]> => {
      const { data, error } = await supabase.from('add_ons').select('*').order('name');
      if (error) throw error;
      return data;
    },
    
    create: async (addOn: Omit<AddOn, 'id'>): Promise<AddOn> => {
      const { data, error } = await supabase.from('add_ons').insert(addOn).select().single();
      if (error) throw error;
      return data;
    },
    
    update: async (id: string, updates: Partial<AddOn>): Promise<AddOn> => {
      const { data, error } = await supabase.from('add_ons').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('add_ons').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Team Members
  teamMembers: {
    getAll: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase.from('team_members').select('*').order('name');
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'teamMember'));
    },
    
    getByPortalId: async (portalId: string): Promise<TeamMember | null> => {
      const { data, error } = await supabase.from('team_members').select('*').eq('portal_access_id', portalId).single();
      if (error) return null;
      return transformDatabaseRow(data, 'teamMember');
    },
    
    create: async (member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
      const dbData = transformToDatabase(member, 'teamMember');
      const { data, error } = await supabase.from('team_members').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'teamMember');
    },
    
    update: async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
      const dbData = transformToDatabase(updates, 'teamMember');
      const { data, error } = await supabase.from('team_members').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'teamMember');
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Transactions
  transactions: {
    getAll: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    
    create: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
      const { data, error } = await supabase.from('transactions').insert(transaction).select().single();
      if (error) throw error;
      return data;
    },
    
    update: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
      const { data, error } = await supabase.from('transactions').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Cards
  cards: {
    getAll: async (): Promise<Card[]> => {
      const { data, error } = await supabase.from('cards').select('*').order('created_at');
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'card'));
    },
    
    create: async (card: Omit<Card, 'id'>): Promise<Card> => {
      const dbData = transformToDatabase(card, 'card');
      const { data, error } = await supabase.from('cards').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'card');
    },
    
    update: async (id: string, updates: Partial<Card>): Promise<Card> => {
      const dbData = transformToDatabase(updates, 'card');
      const { data, error } = await supabase.from('cards').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'card');
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('cards').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Financial Pockets
  pockets: {
    getAll: async (): Promise<FinancialPocket[]> => {
      const { data, error } = await supabase.from('financial_pockets').select('*').order('name');
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'pocket'));
    },
    
    create: async (pocket: Omit<FinancialPocket, 'id'>): Promise<FinancialPocket> => {
      const dbData = transformToDatabase(pocket, 'pocket');
      const { data, error } = await supabase.from('financial_pockets').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'pocket');
    },
    
    update: async (id: string, updates: Partial<FinancialPocket>): Promise<FinancialPocket> => {
      const dbData = transformToDatabase(updates, 'pocket');
      const { data, error } = await supabase.from('financial_pockets').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'pocket');
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('financial_pockets').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Leads
  leads: {
    getAll: async (): Promise<Lead[]> => {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    
    create: async (lead: Omit<Lead, 'id'>): Promise<Lead> => {
      const { data, error } = await supabase.from('leads').insert(lead).select().single();
      if (error) throw error;
      return data;
    },
    
    update: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
      const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Assets
  assets: {
    getAll: async (): Promise<Asset[]> => {
      const { data, error } = await supabase.from('assets').select('*').order('name');
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'asset'));
    },
    
    create: async (asset: Omit<Asset, 'id'>): Promise<Asset> => {
      const dbData = transformToDatabase(asset, 'asset');
      const { data, error } = await supabase.from('assets').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'asset');
    },
    
    update: async (id: string, updates: Partial<Asset>): Promise<Asset> => {
      const dbData = transformToDatabase(updates, 'asset');
      const { data, error } = await supabase.from('assets').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'asset');
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Contracts
  contracts: {
    getAll: async (): Promise<Contract[]> => {
      const { data, error } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'contract'));
    },
    
    create: async (contract: Omit<Contract, 'id'>): Promise<Contract> => {
      const dbData = transformToDatabase(contract, 'contract');
      const { data, error } = await supabase.from('contracts').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'contract');
    },
    
    update: async (id: string, updates: Partial<Contract>): Promise<Contract> => {
      const dbData = transformToDatabase(updates, 'contract');
      const { data, error } = await supabase.from('contracts').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'contract');
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('contracts').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Client Feedback
  feedback: {
    getAll: async (): Promise<ClientFeedback[]> => {
      const { data, error } = await supabase.from('client_feedback').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'feedback'));
    },
    
    create: async (feedback: Omit<ClientFeedback, 'id'>): Promise<ClientFeedback> => {
      const dbData = transformToDatabase(feedback, 'feedback');
      const { data, error } = await supabase.from('client_feedback').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'feedback');
    }
  },

  // Social Media Posts
  socialPosts: {
    getAll: async (): Promise<SocialMediaPost[]> => {
      const { data, error } = await supabase.from('social_media_posts').select('*').order('scheduled_date', { ascending: false });
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'socialPost'));
    },
    
    create: async (post: Omit<SocialMediaPost, 'id'>): Promise<SocialMediaPost> => {
      const dbData = transformToDatabase(post, 'socialPost');
      const { data, error } = await supabase.from('social_media_posts').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'socialPost');
    },
    
    update: async (id: string, updates: Partial<SocialMediaPost>): Promise<SocialMediaPost> => {
      const dbData = transformToDatabase(updates, 'socialPost');
      const { data, error } = await supabase.from('social_media_posts').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'socialPost');
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('social_media_posts').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Promo Codes
  promoCodes: {
    getAll: async (): Promise<PromoCode[]> => {
      const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'promoCode'));
    },
    
    getByCode: async (code: string): Promise<PromoCode | null> => {
      const { data, error } = await supabase.from('promo_codes').select('*').eq('code', code.toUpperCase()).single();
      if (error) return null;
      return transformDatabaseRow(data, 'promoCode');
    },
    
    create: async (promoCode: Omit<PromoCode, 'id'>): Promise<PromoCode> => {
      const dbData = transformToDatabase(promoCode, 'promoCode');
      const { data, error } = await supabase.from('promo_codes').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'promoCode');
    },
    
    update: async (id: string, updates: Partial<PromoCode>): Promise<PromoCode> => {
      const dbData = transformToDatabase(updates, 'promoCode');
      const { data, error } = await supabase.from('promo_codes').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'promoCode');
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // SOPs
  sops: {
    getAll: async (): Promise<SOP[]> => {
      const { data, error } = await supabase.from('sops').select('*').order('title');
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'sop'));
    },
    
    create: async (sop: Omit<SOP, 'id'>): Promise<SOP> => {
      const dbData = transformToDatabase(sop, 'sop');
      const { data, error } = await supabase.from('sops').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'sop');
    },
    
    update: async (id: string, updates: Partial<SOP>): Promise<SOP> => {
      const dbData = transformToDatabase(updates, 'sop');
      const { data, error } = await supabase.from('sops').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'sop');
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('sops').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // Notifications
  notifications: {
    getAll: async (): Promise<Notification[]> => {
      const { data, error } = await supabase.from('notifications').select('*').order('timestamp', { ascending: false });
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'notification'));
    },
    
    create: async (notification: Omit<Notification, 'id'>): Promise<Notification> => {
      const dbData = transformToDatabase(notification, 'notification');
      const { data, error } = await supabase.from('notifications').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'notification');
    },
    
    update: async (id: string, updates: Partial<Notification>): Promise<Notification> => {
      const dbData = transformToDatabase(updates, 'notification');
      const { data, error } = await supabase.from('notifications').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'notification');
    },
    
    markAllAsRead: async (): Promise<void> => {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      if (error) throw error;
    }
  },

  // Team Project Payments
  teamPayments: {
    getAll: async (): Promise<TeamProjectPayment[]> => {
      const { data, error } = await supabase.from('team_project_payments').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'teamPayment'));
    },
    
    create: async (payment: Omit<TeamProjectPayment, 'id'>): Promise<TeamProjectPayment> => {
      const dbData = transformToDatabase(payment, 'teamPayment');
      const { data, error } = await supabase.from('team_project_payments').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'teamPayment');
    },
    
    update: async (id: string, updates: Partial<TeamProjectPayment>): Promise<TeamProjectPayment> => {
      const dbData = transformToDatabase(updates, 'teamPayment');
      const { data, error } = await supabase.from('team_project_payments').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'teamPayment');
    }
  },

  // Team Payment Records
  paymentRecords: {
    getAll: async (): Promise<TeamPaymentRecord[]> => {
      const { data, error } = await supabase.from('team_payment_records').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'paymentRecord'));
    },
    
    create: async (record: Omit<TeamPaymentRecord, 'id'>): Promise<TeamPaymentRecord> => {
      const dbData = transformToDatabase(record, 'paymentRecord');
      const { data, error } = await supabase.from('team_payment_records').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'paymentRecord');
    },
    
    update: async (id: string, updates: Partial<TeamPaymentRecord>): Promise<TeamPaymentRecord> => {
      const dbData = transformToDatabase(updates, 'paymentRecord');
      const { data, error } = await supabase.from('team_payment_records').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'paymentRecord');
    }
  },

  // Reward Ledger Entries
  rewardEntries: {
    getAll: async (): Promise<RewardLedgerEntry[]> => {
      const { data, error } = await supabase.from('reward_ledger_entries').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'rewardEntry'));
    },
    
    create: async (entry: Omit<RewardLedgerEntry, 'id'>): Promise<RewardLedgerEntry> => {
      const dbData = transformToDatabase(entry, 'rewardEntry');
      const { data, error } = await supabase.from('reward_ledger_entries').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'rewardEntry');
    }
  },

  // Profile
  profile: {
    get: async (): Promise<Profile | null> => {
      const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
      if (error) return null;
      return transformDatabaseRow(data, 'profile');
    },
    
    create: async (profile: Omit<Profile, 'id'>): Promise<Profile> => {
      const dbData = transformToDatabase(profile, 'profile');
      const { data, error } = await supabase.from('profiles').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'profile');
    },
    
    update: async (id: string, updates: Partial<Profile>): Promise<Profile> => {
      const dbData = transformToDatabase(updates, 'profile');
      const { data, error } = await supabase.from('profiles').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'profile');
    }
  },

  // Users
  users: {
    getAll: async (): Promise<User[]> => {
      const { data, error } = await supabase.from('users').select('*').order('created_at');
      if (error) throw error;
      return data.map(row => transformDatabaseRow(row, 'user'));
    },
    
    getByEmail: async (email: string): Promise<User | null> => {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (error) return null;
      return transformDatabaseRow(data, 'user');
    },
    
    create: async (user: Omit<User, 'id'>): Promise<User> => {
      const dbData = transformToDatabase(user, 'user');
      const { data, error } = await supabase.from('users').insert(dbData).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'user');
    },
    
    update: async (id: string, updates: Partial<User>): Promise<User> => {
      const dbData = transformToDatabase(updates, 'user');
      const { data, error } = await supabase.from('users').update(dbData).eq('id', id).select().single();
      if (error) throw error;
      return transformDatabaseRow(data, 'user');
    },
    
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    }
  }
};

// Authentication helpers
export const auth = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined // Disable email confirmation
      }
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};