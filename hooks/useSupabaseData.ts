import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { 
  Client, Project, Package, AddOn, TeamMember, Transaction, 
  Card, FinancialPocket, Lead, Asset, Contract, ClientFeedback,
  SocialMediaPost, PromoCode, SOP, Notification, TeamProjectPayment,
  TeamPaymentRecord, RewardLedgerEntry, Profile, User
} from '../types';

export const useSupabaseData = () => {
  // State for all data
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [pockets, setPockets] = useState<FinancialPocket[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clientFeedback, setClientFeedback] = useState<ClientFeedback[]>([]);
  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [sops, setSops] = useState<SOP[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [teamProjectPayments, setTeamProjectPayments] = useState<TeamProjectPayment[]>([]);
  const [teamPaymentRecords, setTeamPaymentRecords] = useState<TeamPaymentRecord[]>([]);
  const [rewardLedgerEntries, setRewardLedgerEntries] = useState<RewardLedgerEntry[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          clientsData,
          projectsData,
          packagesData,
          addOnsData,
          teamMembersData,
          transactionsData,
          cardsData,
          pocketsData,
          leadsData,
          assetsData,
          contractsData,
          feedbackData,
          socialPostsData,
          promoCodesData,
          sopsData,
          notificationsData,
          teamPaymentsData,
          paymentRecordsData,
          rewardEntriesData,
          profileData,
          usersData
        ] = await Promise.all([
          api.clients.getAll(),
          api.projects.getAll(),
          api.packages.getAll(),
          api.addOns.getAll(),
          api.teamMembers.getAll(),
          api.transactions.getAll(),
          api.cards.getAll(),
          api.pockets.getAll(),
          api.leads.getAll(),
          api.assets.getAll(),
          api.contracts.getAll(),
          api.feedback.getAll(),
          api.socialPosts.getAll(),
          api.promoCodes.getAll(),
          api.sops.getAll(),
          api.notifications.getAll(),
          api.teamPayments.getAll(),
          api.paymentRecords.getAll(),
          api.rewardEntries.getAll(),
          api.profile.get(),
          api.users.getAll()
        ]);

        setClients(clientsData);
        setProjects(projectsData);
        setPackages(packagesData);
        setAddOns(addOnsData);
        setTeamMembers(teamMembersData);
        setTransactions(transactionsData);
        setCards(cardsData);
        setPockets(pocketsData);
        setLeads(leadsData);
        setAssets(assetsData);
        setContracts(contractsData);
        setClientFeedback(feedbackData);
        setSocialMediaPosts(socialPostsData);
        setPromoCodes(promoCodesData);
        setSops(sopsData);
        setNotifications(notificationsData);
        setTeamProjectPayments(teamPaymentsData);
        setTeamPaymentRecords(paymentRecordsData);
        setRewardLedgerEntries(rewardEntriesData);
        setProfile(profileData);
        setUsers(usersData);

      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // CRUD operations with state updates
  const clientsApi = {
    create: async (client: Omit<Client, 'id'>) => {
      const newClient = await api.clients.create(client);
      setClients(prev => [newClient, ...prev]);
      return newClient;
    },
    update: async (id: string, updates: Partial<Client>) => {
      const updatedClient = await api.clients.update(id, updates);
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
      return updatedClient;
    },
    delete: async (id: string) => {
      await api.clients.delete(id);
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const projectsApi = {
    create: async (project: Omit<Project, 'id'>) => {
      const newProject = await api.projects.create(project);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    },
    update: async (id: string, updates: Partial<Project>) => {
      const updatedProject = await api.projects.update(id, updates);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    },
    delete: async (id: string) => {
      await api.projects.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const packagesApi = {
    create: async (pkg: Omit<Package, 'id'>) => {
      const newPackage = await api.packages.create(pkg);
      setPackages(prev => [...prev, newPackage].sort((a, b) => a.name.localeCompare(b.name)));
      return newPackage;
    },
    update: async (id: string, updates: Partial<Package>) => {
      const updatedPackage = await api.packages.update(id, updates);
      setPackages(prev => prev.map(p => p.id === id ? updatedPackage : p).sort((a, b) => a.name.localeCompare(b.name)));
      return updatedPackage;
    },
    delete: async (id: string) => {
      await api.packages.delete(id);
      setPackages(prev => prev.filter(p => p.id !== id));
    }
  };

  const addOnsApi = {
    create: async (addOn: Omit<AddOn, 'id'>) => {
      const newAddOn = await api.addOns.create(addOn);
      setAddOns(prev => [...prev, newAddOn].sort((a, b) => a.name.localeCompare(b.name)));
      return newAddOn;
    },
    update: async (id: string, updates: Partial<AddOn>) => {
      const updatedAddOn = await api.addOns.update(id, updates);
      setAddOns(prev => prev.map(a => a.id === id ? updatedAddOn : a).sort((a, b) => a.name.localeCompare(b.name)));
      return updatedAddOn;
    },
    delete: async (id: string) => {
      await api.addOns.delete(id);
      setAddOns(prev => prev.filter(a => a.id !== id));
    }
  };

  const teamMembersApi = {
    create: async (member: Omit<TeamMember, 'id'>) => {
      const newMember = await api.teamMembers.create(member);
      setTeamMembers(prev => [...prev, newMember].sort((a, b) => a.name.localeCompare(b.name)));
      return newMember;
    },
    update: async (id: string, updates: Partial<TeamMember>) => {
      const updatedMember = await api.teamMembers.update(id, updates);
      setTeamMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
      return updatedMember;
    },
    delete: async (id: string) => {
      await api.teamMembers.delete(id);
      setTeamMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const transactionsApi = {
    create: async (transaction: Omit<Transaction, 'id'>) => {
      const newTransaction = await api.transactions.create(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    },
    update: async (id: string, updates: Partial<Transaction>) => {
      const updatedTransaction = await api.transactions.update(id, updates);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
      return updatedTransaction;
    },
    delete: async (id: string) => {
      await api.transactions.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const cardsApi = {
    create: async (card: Omit<Card, 'id'>) => {
      const newCard = await api.cards.create(card);
      setCards(prev => [...prev, newCard]);
      return newCard;
    },
    update: async (id: string, updates: Partial<Card>) => {
      const updatedCard = await api.cards.update(id, updates);
      setCards(prev => prev.map(c => c.id === id ? updatedCard : c));
      return updatedCard;
    },
    delete: async (id: string) => {
      await api.cards.delete(id);
      setCards(prev => prev.filter(c => c.id !== id));
    }
  };

  const pocketsApi = {
    create: async (pocket: Omit<FinancialPocket, 'id'>) => {
      const newPocket = await api.pockets.create(pocket);
      setPockets(prev => [...prev, newPocket]);
      return newPocket;
    },
    update: async (id: string, updates: Partial<FinancialPocket>) => {
      const updatedPocket = await api.pockets.update(id, updates);
      setPockets(prev => prev.map(p => p.id === id ? updatedPocket : p));
      return updatedPocket;
    },
    delete: async (id: string) => {
      await api.pockets.delete(id);
      setPockets(prev => prev.filter(p => p.id !== id));
    }
  };

  const leadsApi = {
    create: async (lead: Omit<Lead, 'id'>) => {
      const newLead = await api.leads.create(lead);
      setLeads(prev => [newLead, ...prev]);
      return newLead;
    },
    update: async (id: string, updates: Partial<Lead>) => {
      const updatedLead = await api.leads.update(id, updates);
      setLeads(prev => prev.map(l => l.id === id ? updatedLead : l));
      return updatedLead;
    },
    delete: async (id: string) => {
      await api.leads.delete(id);
      setLeads(prev => prev.filter(l => l.id !== id));
    }
  };

  const assetsApi = {
    create: async (asset: Omit<Asset, 'id'>) => {
      const newAsset = await api.assets.create(asset);
      setAssets(prev => [newAsset, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      return newAsset;
    },
    update: async (id: string, updates: Partial<Asset>) => {
      const updatedAsset = await api.assets.update(id, updates);
      setAssets(prev => prev.map(a => a.id === id ? updatedAsset : a).sort((a, b) => a.name.localeCompare(b.name)));
      return updatedAsset;
    },
    delete: async (id: string) => {
      await api.assets.delete(id);
      setAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  const contractsApi = {
    create: async (contract: Omit<Contract, 'id'>) => {
      const newContract = await api.contracts.create(contract);
      setContracts(prev => [newContract, ...prev]);
      return newContract;
    },
    update: async (id: string, updates: Partial<Contract>) => {
      const updatedContract = await api.contracts.update(id, updates);
      setContracts(prev => prev.map(c => c.id === id ? updatedContract : c));
      return updatedContract;
    },
    delete: async (id: string) => {
      await api.contracts.delete(id);
      setContracts(prev => prev.filter(c => c.id !== id));
    }
  };

  const feedbackApi = {
    create: async (feedback: Omit<ClientFeedback, 'id'>) => {
      const newFeedback = await api.feedback.create(feedback);
      setClientFeedback(prev => [newFeedback, ...prev]);
      return newFeedback;
    }
  };

  const socialPostsApi = {
    create: async (post: Omit<SocialMediaPost, 'id'>) => {
      const newPost = await api.socialPosts.create(post);
      setSocialMediaPosts(prev => [newPost, ...prev]);
      return newPost;
    },
    update: async (id: string, updates: Partial<SocialMediaPost>) => {
      const updatedPost = await api.socialPosts.update(id, updates);
      setSocialMediaPosts(prev => prev.map(p => p.id === id ? updatedPost : p));
      return updatedPost;
    },
    delete: async (id: string) => {
      await api.socialPosts.delete(id);
      setSocialMediaPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  const promoCodesApi = {
    create: async (promoCode: Omit<PromoCode, 'id'>) => {
      const newPromoCode = await api.promoCodes.create(promoCode);
      setPromoCodes(prev => [newPromoCode, ...prev]);
      return newPromoCode;
    },
    update: async (id: string, updates: Partial<PromoCode>) => {
      const updatedPromoCode = await api.promoCodes.update(id, updates);
      setPromoCodes(prev => prev.map(p => p.id === id ? updatedPromoCode : p));
      return updatedPromoCode;
    },
    delete: async (id: string) => {
      await api.promoCodes.delete(id);
      setPromoCodes(prev => prev.filter(p => p.id !== id));
    }
  };

  const sopsApi = {
    create: async (sop: Omit<SOP, 'id'>) => {
      const newSop = await api.sops.create(sop);
      setSops(prev => [...prev, newSop].sort((a, b) => a.title.localeCompare(b.title)));
      return newSop;
    },
    update: async (id: string, updates: Partial<SOP>) => {
      const updatedSop = await api.sops.update(id, updates);
      setSops(prev => prev.map(s => s.id === id ? updatedSop : s));
      return updatedSop;
    },
    delete: async (id: string) => {
      await api.sops.delete(id);
      setSops(prev => prev.filter(s => s.id !== id));
    }
  };

  const notificationsApi = {
    create: async (notification: Omit<Notification, 'id'>) => {
      const newNotification = await api.notifications.create(notification);
      setNotifications(prev => [newNotification, ...prev]);
      return newNotification;
    },
    markAsRead: async (id: string) => {
      const updatedNotification = await api.notifications.update(id, { isRead: true });
      setNotifications(prev => prev.map(n => n.id === id ? updatedNotification : n));
    },
    markAllAsRead: async () => {
      await api.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const teamPaymentsApi = {
    create: async (payment: Omit<TeamProjectPayment, 'id'>) => {
      const newPayment = await api.teamPayments.create(payment);
      setTeamProjectPayments(prev => [newPayment, ...prev]);
      return newPayment;
    },
    update: async (id: string, updates: Partial<TeamProjectPayment>) => {
      const updatedPayment = await api.teamPayments.update(id, updates);
      setTeamProjectPayments(prev => prev.map(p => p.id === id ? updatedPayment : p));
      return updatedPayment;
    }
  };

  const paymentRecordsApi = {
    create: async (record: Omit<TeamPaymentRecord, 'id'>) => {
      const newRecord = await api.paymentRecords.create(record);
      setTeamPaymentRecords(prev => [newRecord, ...prev]);
      return newRecord;
    },
    update: async (id: string, updates: Partial<TeamPaymentRecord>) => {
      const updatedRecord = await api.paymentRecords.update(id, updates);
      setTeamPaymentRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
      return updatedRecord;
    }
  };

  const rewardEntriesApi = {
    create: async (entry: Omit<RewardLedgerEntry, 'id'>) => {
      const newEntry = await api.rewardEntries.create(entry);
      setRewardLedgerEntries(prev => [newEntry, ...prev]);
      return newEntry;
    }
  };

  const profileApi = {
    update: async (updates: Partial<Profile>) => {
      if (!profile) return;
      const updatedProfile = await api.profile.update(profile.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    }
  };

  const usersApi = {
    create: async (user: Omit<User, 'id'>) => {
      const newUser = await api.users.create(user);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    },
    update: async (id: string, updates: Partial<User>) => {
      const updatedUser = await api.users.update(id, updates);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      return updatedUser;
    },
    delete: async (id: string) => {
      await api.users.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return {
    // Data
    clients, projects, packages, addOns, teamMembers, transactions,
    cards, pockets, leads, assets, contracts, clientFeedback,
    socialMediaPosts, promoCodes, sops, notifications,
    teamProjectPayments, teamPaymentRecords, rewardLedgerEntries,
    profile, users,
    
    // State setters (for direct manipulation when needed)
    setClients, setProjects, setPackages, setAddOns, setTeamMembers,
    setTransactions, setCards, setPockets, setLeads, setAssets,
    setContracts, setClientFeedback, setSocialMediaPosts, setPromoCodes,
    setSops, setNotifications, setTeamProjectPayments, setTeamPaymentRecords,
    setRewardLedgerEntries, setProfile, setUsers,
    
    // API operations
    clientsApi, projectsApi, packagesApi, addOnsApi, teamMembersApi,
    transactionsApi, cardsApi, pocketsApi, leadsApi, assetsApi,
    contractsApi, feedbackApi, socialPostsApi, promoCodesApi,
    sopsApi, notificationsApi, teamPaymentsApi, paymentRecordsApi,
    rewardEntriesApi, profileApi, usersApi,
    
    // Loading states
    loading, error
  };
};