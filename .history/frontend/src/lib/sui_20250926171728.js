import { api } from './api';

export async function getSuiConfig() {
  const { data } = await api.get('/sui/config');
  return { network: 'custom', url: data.rpcUrl, packageId: data.packageId, logisticsPublicKey: data.logisticsPublicKey };
}
