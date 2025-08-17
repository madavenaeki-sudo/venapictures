import { supabase } from './supabase';
import type { 
  Client, Project, Package, AddOn, Lead, ClientFeedback, 
  PromoCode, TeamMember, Profile, Card, Transaction
} from '../types';

// Public API for forms that don't require authentication
export const publicApi = {
  // Get packages for public display
  getPackages: async (): Promise<Package[]> => {
    const { data, error } = await supabase.from('packages').select('*').order('name');
    if (error) throw error;
    
    return data.map(row => ({
      ...row,
      physicalItems: row.physical_items,
      digitalItems: row.digital_items,
      processingTime: row.processing_time,
      defaultPrintingCost: row.default_printing_cost,
      defaultTransportCost: row.default_transport_cost
    }));
  },

  // Get add-ons for public display
  getAddOns: async (): Promise<AddOn[]> => {
    const { data, error } = await supabase.from('add_ons').select('*').order('name');
    if (error) throw error;
    return data;
  },

  // Get profile for public display
  getProfile: async (): Promise<Profile | null> => {
    const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
    if (error) return null;
    
    return {
      ...data,
      fullName: data.full_name,
      companyName: data.company_name,
      bankAccount: data.bank_account,
      authorizedSigner: data.authorized_signer,
      idNumber: data.id_number,
      incomeCategories: data.income_categories,
      expenseCategories: data.expense_categories,
      projectTypes: data.project_types,
      eventTypes: data.event_types,
      assetCategories: data.asset_categories,
      sopCategories: data.sop_categories,
      projectStatusConfig: data.project_status_config,
      notificationSettings: data.notification_settings,
      securitySettings: data.security_settings,
      briefingTemplate: data.briefing_template,
      termsAndConditions: data.terms_and_conditions
    };
  },

  // Get promo codes for validation
  getPromoCode: async (code: string): Promise<PromoCode | null> => {
    const { data, error } = await supabase.from('promo_codes').select('*').eq('code', code.toUpperCase()).single();
    if (error) return null;
    
    return {
      ...data,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      isActive: data.is_active,
      usageCount: data.usage_count,
      maxUsage: data.max_usage,
      expiryDate: data.expiry_date
    };
  },

  // Update promo code usage
  updatePromoCodeUsage: async (id: string, newUsageCount: number): Promise<void> => {
    const { error } = await supabase.from('promo_codes').update({ usage_count: newUsageCount }).eq('id', id);
    if (error) throw error;
  },

  // Create lead from public form
  createLead: async (lead: Omit<Lead, 'id'>): Promise<Lead> => {
    const { data, error } = await supabase.from('leads').insert(lead).select().single();
    if (error) throw error;
    return data;
  },

  // Create client feedback from public form
  createFeedback: async (feedback: Omit<ClientFeedback, 'id'>): Promise<ClientFeedback> => {
    const dbData = {
      client_name: feedback.clientName,
      satisfaction: feedback.satisfaction,
      rating: feedback.rating,
      feedback: feedback.feedback,
      date: feedback.date
    };
    const { data, error } = await supabase.from('client_feedback').insert(dbData).select().single();
    if (error) throw error;
    
    return {
      ...data,
      clientName: data.client_name
    };
  },

  // Create client from booking form
  createClient: async (client: Omit<Client, 'id'>): Promise<Client> => {
    const dbData = {
      name: client.name,
      email: client.email,
      phone: client.phone,
      whatsapp: client.whatsapp,
      instagram: client.instagram,
      since: client.since,
      status: client.status,
      client_type: client.clientType,
      last_contact: client.lastContact,
      portal_access_id: client.portalAccessId
    };
    const { data, error } = await supabase.from('clients').insert(dbData).select().single();
    if (error) throw error;
    
    return {
      ...data,
      clientType: data.client_type,
      lastContact: data.last_contact,
      portalAccessId: data.portal_access_id
    };
  },

  // Create project from booking form
  createProject: async (project: Omit<Project, 'id'>): Promise<Project> => {
    const dbData = {
      project_name: project.projectName,
      client_name: project.clientName,
      client_id: project.clientId,
      project_type: project.projectType,
      package_name: project.packageName,
      package_id: project.packageId,
      add_ons: project.addOns,
      date: project.date,
      deadline_date: project.deadlineDate,
      location: project.location,
      progress: project.progress,
      status: project.status,
      active_sub_statuses: project.activeSubStatuses,
      total_cost: project.totalCost,
      amount_paid: project.amountPaid,
      payment_status: project.paymentStatus,
      team: project.team,
      notes: project.notes,
      promo_code_id: project.promoCodeId,
      discount_amount: project.discountAmount,
      dp_proof_url: project.dpProofUrl
    };
    const { data, error } = await supabase.from('projects').insert(dbData).select().single();
    if (error) throw error;
    
    return {
      ...data,
      projectName: data.project_name,
      clientName: data.client_name,
      clientId: data.client_id,
      projectType: data.project_type,
      packageName: data.package_name,
      packageId: data.package_id,
      addOns: data.add_ons,
      deadlineDate: data.deadline_date,
      activeSubStatuses: data.active_sub_statuses,
      totalCost: data.total_cost,
      amountPaid: data.amount_paid,
      paymentStatus: data.payment_status,
      promoCodeId: data.promo_code_id,
      discountAmount: data.discount_amount,
      dpProofUrl: data.dp_proof_url
    };
  },

  // Create transaction from booking form
  createTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const { data, error } = await supabase.from('transactions').insert(transaction).select().single();
    if (error) throw error;
    return data;
  },

  // Update card balance
  updateCardBalance: async (cardId: string, newBalance: number): Promise<void> => {
    const { error } = await supabase.from('cards').update({ balance: newBalance }).eq('id', cardId);
    if (error) throw error;
  },

  // Get cards for payment processing
  getCards: async (): Promise<Card[]> => {
    const { data, error } = await supabase.from('cards').select('*');
    if (error) throw error;
    
    return data.map(row => ({
      ...row,
      cardHolderName: row.card_holder_name,
      bankName: row.bank_name,
      cardType: row.card_type,
      lastFourDigits: row.last_four_digits,
      expiryDate: row.expiry_date,
      colorGradient: row.color_gradient
    }));
  },

  // Portal APIs
  getClientByPortalId: async (portalId: string): Promise<Client | null> => {
    const { data, error } = await supabase.from('clients').select('*').eq('portal_access_id', portalId).single();
    if (error) return null;
    
    return {
      ...data,
      clientType: data.client_type,
      lastContact: data.last_contact,
      portalAccessId: data.portal_access_id
    };
  },

  getProjectsByClientId: async (clientId: string): Promise<Project[]> => {
    const { data, error } = await supabase.from('projects').select('*').eq('client_id', clientId);
    if (error) throw error;
    
    return data.map(row => ({
      ...row,
      projectName: row.project_name,
      clientName: row.client_name,
      clientId: row.client_id,
      projectType: row.project_type,
      packageName: row.package_name,
      packageId: row.package_id,
      addOns: row.add_ons,
      deadlineDate: row.deadline_date,
      activeSubStatuses: row.active_sub_statuses,
      totalCost: row.total_cost,
      amountPaid: row.amount_paid,
      paymentStatus: row.payment_status,
      driveLink: row.drive_link,
      clientDriveLink: row.client_drive_link,
      finalDriveLink: row.final_drive_link,
      startTime: row.start_time,
      endTime: row.end_time,
      promoCodeId: row.promo_code_id,
      discountAmount: row.discount_amount,
      shippingDetails: row.shipping_details,
      dpProofUrl: row.dp_proof_url,
      printingDetails: row.printing_details,
      printingCost: row.printing_cost,
      transportCost: row.transport_cost,
      isEditingConfirmedByClient: row.is_editing_confirmed_by_client,
      isPrintingConfirmedByClient: row.is_printing_confirmed_by_client,
      isDeliveryConfirmedByClient: row.is_delivery_confirmed_by_client,
      confirmedSubStatuses: row.confirmed_sub_statuses,
      clientSubStatusNotes: row.client_sub_status_notes,
      subStatusConfirmationSentAt: row.sub_status_confirmation_sent_at,
      completedDigitalItems: row.completed_digital_items,
      invoiceSignature: row.invoice_signature,
      customSubStatuses: row.custom_sub_statuses
    }));
  },

  getContractsByClientId: async (clientId: string): Promise<Contract[]> => {
    const { data, error } = await supabase.from('contracts').select('*').eq('client_id', clientId);
    if (error) throw error;
    
    return data.map(row => ({
      ...row,
      contractNumber: row.contract_number,
      clientId: row.client_id,
      projectId: row.project_id,
      signingDate: row.signing_date,
      signingLocation: row.signing_location,
      clientName1: row.client_name1,
      clientAddress1: row.client_address1,
      clientPhone1: row.client_phone1,
      clientName2: row.client_name2,
      clientAddress2: row.client_address2,
      clientPhone2: row.client_phone2,
      shootingDuration: row.shooting_duration,
      guaranteedPhotos: row.guaranteed_photos,
      albumDetails: row.album_details,
      digitalFilesFormat: row.digital_files_format,
      otherItems: row.other_items,
      personnelCount: row.personnel_count,
      deliveryTimeframe: row.delivery_timeframe,
      dpDate: row.dp_date,
      finalPaymentDate: row.final_payment_date,
      cancellationPolicy: row.cancellation_policy,
      vendorSignature: row.vendor_signature,
      clientSignature: row.client_signature
    }));
  },

  getTransactionsByProjectId: async (projectId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase.from('transactions').select('*').eq('project_id', projectId);
    if (error) throw error;
    return data;
  },

  // Update project confirmations
  updateProjectConfirmation: async (projectId: string, updates: Partial<Project>): Promise<void> => {
    const dbUpdates: any = {};
    
    if (updates.isEditingConfirmedByClient !== undefined) {
      dbUpdates.is_editing_confirmed_by_client = updates.isEditingConfirmedByClient;
    }
    if (updates.isPrintingConfirmedByClient !== undefined) {
      dbUpdates.is_printing_confirmed_by_client = updates.isPrintingConfirmedByClient;
    }
    if (updates.isDeliveryConfirmedByClient !== undefined) {
      dbUpdates.is_delivery_confirmed_by_client = updates.isDeliveryConfirmedByClient;
    }
    if (updates.confirmedSubStatuses !== undefined) {
      dbUpdates.confirmed_sub_statuses = updates.confirmedSubStatuses;
    }
    if (updates.clientSubStatusNotes !== undefined) {
      dbUpdates.client_sub_status_notes = updates.clientSubStatusNotes;
    }

    const { error } = await supabase.from('projects').update(dbUpdates).eq('id', projectId);
    if (error) throw error;
  },

  // Update contract signatures
  updateContractSignature: async (contractId: string, signature: string, signer: 'vendor' | 'client'): Promise<void> => {
    const field = signer === 'vendor' ? 'vendor_signature' : 'client_signature';
    const { error } = await supabase.from('contracts').update({ [field]: signature }).eq('id', contractId);
    if (error) throw error;
  },

  // Freelancer portal APIs
  getTeamMemberByPortalId: async (portalId: string): Promise<TeamMember | null> => {
    const { data, error } = await supabase.from('team_members').select('*').eq('portal_access_id', portalId).single();
    if (error) return null;
    
    return {
      ...data,
      standardFee: data.standard_fee,
      noRek: data.no_rek,
      rewardBalance: data.reward_balance,
      performanceNotes: data.performance_notes,
      portalAccessId: data.portal_access_id
    };
  },

  getProjectsByTeamMemberId: async (teamMemberId: string): Promise<Project[]> => {
    // Get projects where team member is assigned
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    
    return data
      .filter(row => {
        const team = row.team as any[];
        return team.some(member => member.memberId === teamMemberId);
      })
      .map(row => ({
        ...row,
        projectName: row.project_name,
        clientName: row.client_name,
        clientId: row.client_id,
        projectType: row.project_type,
        packageName: row.package_name,
        packageId: row.package_id,
        addOns: row.add_ons,
        deadlineDate: row.deadline_date,
        activeSubStatuses: row.active_sub_statuses,
        totalCost: row.total_cost,
        amountPaid: row.amount_paid,
        paymentStatus: row.payment_status,
        driveLink: row.drive_link,
        clientDriveLink: row.client_drive_link,
        finalDriveLink: row.final_drive_link,
        startTime: row.start_time,
        endTime: row.end_time,
        promoCodeId: row.promo_code_id,
        discountAmount: row.discount_amount,
        shippingDetails: row.shipping_details,
        dpProofUrl: row.dp_proof_url,
        printingDetails: row.printing_details,
        printingCost: row.printing_cost,
        transportCost: row.transport_cost,
        isEditingConfirmedByClient: row.is_editing_confirmed_by_client,
        isPrintingConfirmedByClient: row.is_printing_confirmed_by_client,
        isDeliveryConfirmedByClient: row.is_delivery_confirmed_by_client,
        confirmedSubStatuses: row.confirmed_sub_statuses,
        clientSubStatusNotes: row.client_sub_status_notes,
        subStatusConfirmationSentAt: row.sub_status_confirmation_sent_at,
        completedDigitalItems: row.completed_digital_items,
        invoiceSignature: row.invoice_signature,
        customSubStatuses: row.custom_sub_statuses
      }));
  },

  // Update project revisions
  updateProjectRevision: async (projectId: string, revisions: any[]): Promise<void> => {
    const { error } = await supabase.from('projects').update({ revisions }).eq('id', projectId);
    if (error) throw error;
  },

  // Get SOPs for freelancer portal
  getSOPs: async (): Promise<SOP[]> => {
    const { data, error } = await supabase.from('sops').select('*').order('title');
    if (error) throw error;
    
    return data.map(row => ({
      ...row,
      lastUpdated: row.last_updated
    }));
  }
};