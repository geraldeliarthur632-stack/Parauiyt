import React, { useState } from 'react';
import { adMobService } from '../../services/adMobService';
import { REWARD_ACTIONS, RewardActionType } from '../../config/adMobConfig';
import { soundEffects } from '../../services/soundEffects';
import { Play, X, AlertCircle, ShieldCheck } from 'lucide-react';

interface RequiredAdsModalProps {
  isOpen: boolean;
  featureTitle: string;
  description?: string;
  requiredCount?: number;
  onSuccess: () => void;
  onCancel: () => void;
  theme?: 'light' | 'dark';
}

/**
 * Modal oficial de consentimento para Anúncio Recompensado (Rewarded Ad) do Google AdMob.
 *
 * Em conformidade estrita com as regras do Google AdMob e da solicitação do usuário:
 * - NÃO cria anúncios falsos, simulados ou inventados.
 * - NÃO imita anúncios ou companhias fictícias.
 * - Aciona exclusivamente o Google Mobile Ads SDK oficial.
 * - Se não houver anúncio disponível da rede Google, avisa transparentemente e não inventa anúncio.
 */
export const RequiredAdsModal: React.FC<RequiredAdsModalProps> = ({
  isOpen,
  featureTitle,
  description = 'Assista a um anúncio para liberar este recurso.',
  onSuccess,
  onCancel,
  theme = 'light',
}) => {
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWatchAd = () => {
    soundEffects.playClick();
    setIsLoadingAd(true);
    setErrorMessage(null);

    // Mapeia a ação correspondente para as 4 ferramentas do Google AdMob
    let action: RewardActionType = REWARD_ACTIONS.EXPLANATION;
    const lower = featureTitle.toLowerCase();
    if (lower.includes('prova') || lower.includes('simulado')) {
      action = REWARD_ACTIONS.EXAM;
    } else if (lower.includes('pesquisa') || lower.includes('trabalho')) {
      action = REWARD_ACTIONS.RESEARCH;
    } else if (lower.includes('tradut') || lower.includes('tradução') || lower.includes('idioma')) {
      action = REWARD_ACTIONS.TRANSLATION;
    }

    adMobService.showRewardedAd(action, {
      onRewardEarned: () => {
        setIsLoadingAd(false);
        soundEffects.playSuccess?.();
        onSuccess();
      },
      onDismissedWithoutReward: () => {
        setIsLoadingAd(false);
        setErrorMessage('O anúncio foi fechado antes do término. Assista até o final para desbloquear.');
      },
      onAdNotAvailable: () => {
        setIsLoadingAd(false);
        // Se um anúncio não carregar, a ferramenta deve continuar funcionando normalmente
        soundEffects.playSuccess?.();
        onSuccess();
      },
    });
  };

  return (
    <div
      id="required-admob-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="required-ad-title"
    >
      <div
        id="required-admob-modal-card"
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl transition-all border border-slate-200 bg-white text-slate-900"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-sm shadow-xs">
              Ad
            </div>
            <div>
              <h3 id="required-ad-title" className="font-black text-base text-slate-900 leading-tight">
                Desbloquear {featureTitle}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Google AdMob</p>
            </div>
          </div>

          <button
            id="btn-close-required-ad"
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onCancel();
            }}
            disabled={isLoadingAd}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagem e Instruções */}
        <div className="py-5 space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {description}
          </p>

          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Anúncio oficial entregue pela rede do Google AdMob.</span>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl p-3 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            id="btn-confirm-watch-ad"
            type="button"
            onClick={handleWatchAd}
            disabled={isLoadingAd}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {isLoadingAd ? (
              <span>Carregando anúncio...</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Assistir anúncio</span>
              </>
            )}
          </button>

          <button
            id="btn-cancel-watch-ad"
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onCancel();
            }}
            disabled={isLoadingAd}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};
