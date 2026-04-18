import { supabase } from '../supabaseClient';

// Helper to simulate Axios response format { data: ... }
const withData = async (promise) => {
  const { data, error } = await promise;
  if (error) {
    console.error("API Error: ", error);
    throw error;
  }
  return { data };
};

export const electionService = {
  getAll: () => withData(supabase.rpc('get_election_metrics')),
  getOne: (id) => withData(supabase.from('elections').select('*').eq('id', id).single()),
  create: (data) => withData(supabase.from('elections').insert(data)),
};

export const candidateService = {
  getRankings: () => withData(supabase.rpc('get_candidate_rankings')),
  create: (data) => withData(supabase.from('candidates').insert(data)),
};

export const alertService = {
  getAll: () => withData(supabase.from('alerts').select('*, anomaly:anomalies(*)').order('created_at', { ascending: false })),
  getOne: (id) => withData(supabase.from('alerts').select('*').eq('id', id).single()),
  investigate: (id, data) => withData(supabase.rpc('investigate_alert', { 
    alert_id: id, 
    new_status: data.status, 
    note: data.verification_note || '', 
    new_action: data.action || data.action_taken || 'approve'
  })),
};

export const analyticsService = {
  getStats: () => withData(supabase.rpc('get_analytics')),
};

export const activityLogService = {
  getAll: () => withData(supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20)),
};

export const exportService = {
  getVoteReport: () => withData(supabase.from('vote_records').select('candidate:candidate_id(name, party), votes').eq('status', 'Approved')),
  getCandidates: () => withData(supabase.from('candidates').select('id, name, party, election:election_id(name)')),
  getVoters: () => withData(supabase.from('vote_records').select('timestamp, votes, candidate:candidate_id(name, party, election:election_id(name))').eq('status', 'Approved').order('timestamp', { ascending: false })),
};

export default supabase;
