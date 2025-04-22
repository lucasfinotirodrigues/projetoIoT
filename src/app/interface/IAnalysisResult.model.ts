export interface AnalysisResult {
  queda_umidade_por_segundo: number;
  momento_maior_queda: string;
  intervalo_recomendado_em_minutos: number;
  umidade_atual: number;
  precisao_da_predicao: number;
}
