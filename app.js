/**
 * ============================================================================
 * VYSION - O FUTURO DA VISTORIA
 * Motor de Interação, Áudio Apple Synthesized, Onboarding & Câmera com IA
 * Arquitetura Modular & Robusta
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. MAPEAMENTO DE ELEMENTOS DO DOM
  // --------------------------------------------------------------------------
  const scenes = {
    ola: document.getElementById('sceneOla'),
    antes: document.getElementById('sceneAntes'),
    requisitos: document.getElementById('sceneRequisitos'),
    dados: document.getElementById('sceneDados'),
    reveal: document.getElementById('sceneReveal'),
    workspace: document.getElementById('sceneWorkspace'),
    review: document.getElementById('sceneReview'),
  };

  const topbar = document.getElementById('vysionTopbar');
  const stepDots = document.querySelectorAll('.step-dot');
  
  const btnProsseguir = document.getElementById('btnProsseguir');
  const vysionForm = document.getElementById('vysionForm');
  const btnRestartFlow = document.getElementById('btnRestartFlow');
  
  const inputNome = document.getElementById('inputNome');
  const inputPlaca = document.getElementById('inputPlaca');
  const inputWhatsapp = document.getElementById('inputWhatsapp');
  const inputCpf = document.getElementById('inputCpf');
  const userNameDisplay = document.getElementById('userNameDisplay');

  // Elementos da Tela de Revisão de Fotos
  const reviewPhotosList = document.getElementById('reviewPhotosList');
  const btnProsseguirReview = document.getElementById('btnProsseguirReview');

  // Elementos do Viewfinder da Câmera
  const cameraStage = document.getElementById('cameraStage');
  const cameraFeedBg = document.getElementById('cameraFeedBg');
  const cameraFlash = document.getElementById('cameraFlash');
  const aiScannerOverlay = document.getElementById('aiScannerOverlay');
  const aiSuccessOverlay = document.getElementById('aiSuccessOverlay');
  const btnCaptureMock = document.getElementById('btnCaptureMock');
  const workspaceStepTitle = document.getElementById('workspaceStepTitle');

  // Botão Expandir / Reduzir no Rodapé
  const btnToggleFramedView = document.getElementById('btnToggleFramedView');
  const iconFrameToggle = document.getElementById('iconFrameToggle');

  // Pop-up Modal de Instruções
  const photoGuideModal = document.getElementById('photoGuideModal');
  const guidePreviewImg = document.getElementById('guidePreviewImg');
  const guideStepTag = document.getElementById('guideStepTag');
  const guideModalTitle = document.getElementById('guideModalTitle');
  const guideModalDesc = document.getElementById('guideModalDesc');
  const btnGuideDismiss = document.getElementById('btnGuideDismiss');
  const countdownFill = document.getElementById('countdownFill');
  const countdownCounter = document.getElementById('countdownCounter');

  // Estado da Aplicação
  let currentScene = null;
  let autoAdvanceTimer = null;
  let currentPhotoStep = 0;
  let isCapturing = false;
  let countdownTimer = null;

  // --------------------------------------------------------------------------
  // 2. BASE DE DADOS DOS PASSOS DA VISTORIA COM IMAGENS REAIS
  // --------------------------------------------------------------------------
  const photoSteps = [
    {
      title: 'Frente do Veículo',
      desc: 'Posicione-se a cerca de 2 metros de distância e enquadre toda a frente do carro com faróis e para-choque visíveis.',
      image: 'assets/photos/frente.png',
      tips: ['Placa legível e limpa', 'Faróis e para-choque visíveis']
    },
    {
      title: 'Traseira do Veículo',
      desc: 'Enquadre a traseira completa do carro garantindo visibilidade da placa e lanternas.',
      image: 'assets/photos/traseira.png',
      tips: ['Lanterna traseira nítida', 'Placa e tampa do porta-malas']
    },
    {
      title: 'Lateral Direita',
      desc: 'Capture a lateral direita completa, desde o para-lama dianteiro até a traseira.',
      image: 'assets/photos/lateral_dir.png',
      tips: ['Veículo inteiro na horizontal', 'Portas e rodas visíveis']
    },
    {
      title: 'Lateral Esquerda',
      desc: 'Capture toda a extensão lateral esquerda do motorista com boa iluminação.',
      image: 'assets/photos/lateral_esq.png',
      tips: ['Linha de cintura visível', 'Retrovisor e portas completas']
    },
    {
      title: 'Painel & Odômetro',
      desc: 'Fotografe o painel ligado com o hodômetro e luzes de alerta claramente legíveis.',
      image: 'assets/photos/painel.png',
      tips: ['Quilometragem nítida', 'Painel de instrumentos aceso']
    },
    {
      title: 'Pneu Dianteiro Direito',
      desc: 'Aproxime a câmera da banda de rodagem para conferir o sulco e estado do pneu.',
      image: 'assets/photos/pneu_diant_dir.png',
      tips: ['Banda de rodagem nítida', 'TWI visível']
    },
    {
      title: 'Pneu Traseiro Direito',
      desc: 'Fotografe a lateral e o sulco da borracha do pneu traseiro do lado do passageiro.',
      image: 'assets/photos/pneu_tras_dir.png',
      tips: ['Roda e calota alinhadas', 'Sem cortes ou bolhas']
    },
    {
      title: 'Pneu Traseiro Esquerdo',
      desc: 'Capture o pneu traseiro esquerdo mostrando o aro da roda e as ranhuras de segurança.',
      image: 'assets/photos/pneu_tras_esq.png',
      tips: ['Banda de rodagem nítida', 'Aro sem avarias críticas']
    }
  ];

  // --------------------------------------------------------------------------
  // 3. EFEITOS SONOROS SINTETIZADOS (APPLE AUDIO ENGINE)
  // --------------------------------------------------------------------------
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTapSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  function playShutterSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  function playApprovalSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.29);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.09);
      gain2.gain.setValueAtTime(0.22, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.36);
    } catch (e) {}
  }

  function triggerHaptic(pattern = [10]) {
    if (navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  // --------------------------------------------------------------------------
  // 4. CONTROLE DE TEMA (MODO CLARO APPLE EXCLUSIVO)
  // --------------------------------------------------------------------------
  function initTheme() {
    document.body.classList.add('light-theme');
    localStorage.setItem('vysion_theme', 'light');
  }

  // --------------------------------------------------------------------------
  // 5. MOTOR DE TRANSIÇÃO DE CENAS CINEMATOGRÁFICO
  // --------------------------------------------------------------------------
  function goToScene(sceneName) {
    if (!scenes[sceneName]) return;
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }

    // Fecha qualquer modal remanescente ao mudar de cena
    if (sceneName !== 'workspace') {
      hidePhotoGuide();
    }

    if (currentScene && scenes[currentScene]) {
      const prev = scenes[currentScene];
      prev.classList.add('exiting');
      setTimeout(() => {
        prev.classList.remove('active', 'exiting');
      }, 350);
    }

    currentScene = sceneName;
    const next = scenes[sceneName];
    if (next) {
      next.classList.remove('exiting');
      setTimeout(() => {
        next.classList.add('active');
      }, 30);
    }

    updateStepProgress(sceneName);

    // Ajuste da Topbar
    if (sceneName === 'workspace') {
      topbar?.classList.add('is-camera-mode');
    } else {
      topbar?.classList.remove('is-camera-mode');
    }

    // Regras automáticas por cena
    if (sceneName === 'ola') {
      const storedName = inputNome?.value.trim() || 'Victor';
      const firstName = storedName.split(' ')[0];
      if (userNameDisplay) userNameDisplay.textContent = firstName;

      autoAdvanceTimer = setTimeout(() => {
        goToScene('antes');
      }, 2200);
    } 
    else if (sceneName === 'antes') {
      autoAdvanceTimer = setTimeout(() => {
        goToScene('requisitos');
      }, 2000);
    }
    else if (sceneName === 'reveal') {
      autoAdvanceTimer = setTimeout(() => {
        goToScene('workspace');
        renderPhotoStep(0);
      }, 2600);
    }
    else if (sceneName === 'review') {
      renderPhotosReview();
    }
  }

  function updateStepProgress(sceneName) {
    let activeIndex = 0;
    // 1. Início / Dados
    if (sceneName === 'ola' || sceneName === 'antes' || sceneName === 'requisitos' || sceneName === 'dados' || sceneName === 'reveal') {
      activeIndex = 1;
    } 
    // 2. Câmera
    else if (sceneName === 'workspace') {
      activeIndex = 2;
    } 
    // 3. Revisão
    else if (sceneName === 'review') {
      activeIndex = 3;
    }

    stepDots.forEach((dot, idx) => {
      dot.classList.remove('active', 'passed');
      if (idx + 1 < activeIndex) dot.classList.add('passed');
      if (idx + 1 === activeIndex) dot.classList.add('active');
    });
  }

  function startFlow() {
    currentPhotoStep = 0;
    isCapturing = false;
    hidePhotoGuide();
    Object.values(scenes).forEach(s => {
      if (s) s.classList.remove('active', 'exiting');
    });
    goToScene('ola');
  }

  // --------------------------------------------------------------------------
  // 6. EVENTOS DE FLUXO
  // --------------------------------------------------------------------------
  btnProsseguir?.addEventListener('click', () => {
    playTapSound();
    goToScene('dados');
  });

  vysionForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    playTapSound();
    goToScene('reveal');
  });

  // Modal de Instruções com Countdown de 3s (Preenchimento Verde da Esquerda pra Direita)
  function showPhotoGuide(index) {
    const step = photoSteps[index] || photoSteps[0];
    if (!photoGuideModal) return;

    if (guidePreviewImg) guidePreviewImg.src = step.image;
    if (guideStepTag) guideStepTag.textContent = `FOTO ${index + 1} DE ${photoSteps.length}`;
    if (guideModalTitle) guideModalTitle.textContent = step.title;
    if (guideModalDesc) guideModalDesc.textContent = step.desc;

    // Reseta preenchimento verde do botão
    if (countdownFill) {
      countdownFill.style.transition = 'none';
      countdownFill.style.width = '0%';
    }

    let timeLeft = 3;
    if (countdownCounter) countdownCounter.textContent = `(${timeLeft}s)`;
    if (btnGuideDismiss) btnGuideDismiss.disabled = true;

    photoGuideModal.classList.add('active');

    setTimeout(() => {
      if (countdownFill) {
        countdownFill.style.transition = 'width 3s linear';
        countdownFill.style.width = '100%';
      }
    }, 50);

    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      timeLeft--;
      if (countdownCounter) {
        if (timeLeft > 0) {
          countdownCounter.textContent = `(${timeLeft}s)`;
        } else {
          countdownCounter.textContent = '';
        }
      }

      if (timeLeft <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        if (btnGuideDismiss) btnGuideDismiss.disabled = false;
      }
    }, 1000);
  }

  function hidePhotoGuide() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    photoGuideModal?.classList.remove('active');
  }

  btnGuideDismiss?.addEventListener('click', () => {
    playTapSound();
    hidePhotoGuide();
  });

  // Alternar Visualização Enquadrada (Moldura Reduzida vs Fullscreen)
  btnToggleFramedView?.addEventListener('click', () => {
    playTapSound();
    scenes.workspace.classList.toggle('is-framed');
    const isFramed = scenes.workspace.classList.contains('is-framed');
    if (iconFrameToggle) {
      iconFrameToggle.className = isFramed ? 'bi bi-arrows-angle-expand' : 'bi bi-arrows-angle-contract';
    }
  });

  // --------------------------------------------------------------------------
  // 7. MOTOR DA CÂMERA
  // --------------------------------------------------------------------------
  function renderPhotoStep(index) {
    const step = photoSteps[index] || photoSteps[0];
    if (workspaceStepTitle) workspaceStepTitle.textContent = step.title;
    if (cameraFeedBg && step.image) {
      cameraFeedBg.style.backgroundImage = `url('${step.image}')`;
    }

    // Atualiza anel de progresso da câmera no topo
    const ringProgress = document.getElementById('ringProgress');
    const ringStepText = document.getElementById('ringStepText');
    if (ringStepText) ringStepText.textContent = index + 1;
    if (ringProgress) {
      const total = photoSteps.length;
      const progress = (index + 1) / total;
      const offset = 88 - (88 * progress);
      ringProgress.style.strokeDashoffset = offset;
    }

    showPhotoGuide(index);
  }

  btnCaptureMock?.addEventListener('click', () => {
    if (isCapturing) return;
    isCapturing = true;

    playShutterSound();
    triggerHaptic([25]);

    cameraFlash.classList.add('flash-active');
    setTimeout(() => { cameraFlash.classList.remove('flash-active'); }, 80);

    cameraStage.classList.add('is-scanning');
    aiScannerOverlay.classList.add('active');

    setTimeout(() => {
      aiScannerOverlay.classList.remove('active');
      cameraStage.classList.remove('is-scanning');
      cameraStage.classList.add('is-success');
      aiSuccessOverlay.classList.add('active');
      playApprovalSound();
      triggerHaptic([15, 30, 25]);

      setTimeout(() => {
        aiSuccessOverlay.classList.remove('active');
        cameraStage.classList.remove('is-success');

        currentPhotoStep++;
        if (currentPhotoStep < photoSteps.length) {
          playTapSound();
          renderPhotoStep(currentPhotoStep);
        } else {
          hidePhotoGuide();
          playTapSound();
          goToScene('review');
        }
        isCapturing = false;
      }, 900);
    }, 850);
  });

  // --------------------------------------------------------------------------
  // 8. TELA DE REVISÃO DAS FOTOS (CARDS APPLE COM NÚMEROS MONTSERRAT LIGHT)
  // --------------------------------------------------------------------------
  function renderPhotosReview() {
    if (!reviewPhotosList) return;
    reviewPhotosList.innerHTML = '';

    const stepNumbers = ['01', '02', '03', '04', '05', '06', '07', '08'];

    photoSteps.forEach((step, idx) => {
      const card = document.createElement('div');
      card.className = 'photo-review-card';
      card.style.setProperty('--item-index', idx);

      card.innerHTML = `
        <div class="photo-card-prefix-col">
          <span class="prefix-num">${stepNumbers[idx] || (idx + 1)}</span>
        </div>
        <div class="photo-card-thumb-wrap">
          <img src="${step.image}" alt="${step.title}" class="photo-card-thumb-img" />
        </div>
        <div class="photo-card-body">
          <h4 class="photo-card-title">${step.title}</h4>
          <span class="photo-card-subtitle">Aprovada pela IA</span>
        </div>
        <button type="button" class="photo-card-check-action" title="Refazer ou Revisar Foto">
          <i class="bi bi-check2"></i>
        </button>
      `;

      // Ação de refazer / rever a foto
      const redoBtn = card.querySelector('.photo-card-check-action');
      redoBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        playTapSound();
        currentPhotoStep = idx;
        goToScene('workspace');
        renderPhotoStep(idx);
      });

      reviewPhotosList.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 9. CONCLUSÃO DA VISTORIA NA REVISÃO DAS FOTOS
  // --------------------------------------------------------------------------
  btnProsseguirReview?.addEventListener('click', () => {
    playTapSound();
    playApprovalSound();
    triggerHaptic([20, 40, 20]);
    alert('✨ Vistoria Concluída com Sucesso!\n\nTodas as fotos foram auditadas e aprovadas pelo sistema VYSION.');
  });

  btnRestartFlow?.addEventListener('click', () => {
    playTapSound();
    startFlow();
  });

  // --------------------------------------------------------------------------
  // 10. MÁSCARAS E FORMATAÇÕES DE INPUTS
  // --------------------------------------------------------------------------
  inputPlaca?.addEventListener('input', (e) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 7) val = val.substring(0, 7);
    e.target.value = val;
  });

  inputWhatsapp?.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);
    if (val.length > 10) {
      val = val.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (val.length > 6) {
      val = val.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (val.length > 2) {
      val = val.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    } else if (val.length > 0) {
      val = val.replace(/^(\d*)$/, '($1');
    }
    e.target.value = val;
  });

  inputCpf?.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);
    if (val.length > 9) {
      val = val.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, '$1.$2.$3-$4');
    } else if (val.length > 6) {
      val = val.replace(/^(\d{3})(\d{3})(\d{0,3})$/, '$1.$2.$3');
    } else if (val.length > 3) {
      val = val.replace(/^(\d{3})(\d{0,3})$/, '$1.$2');
    }
    e.target.value = val;
  });

  // Inicialização
  initTheme();
  startFlow();
});
