export interface VideoTemplate {
  id: number;
  name: string;
  backgroundType: 'gradient' | 'solid' | 'pattern';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layoutType: 'modern' | 'classic' | 'minimal';
  animationStyle: 'smooth' | 'dynamic' | 'subtle';
  headerFontSize: string;
  questionFontSize: string;
  optionFontSize: string;
  captionStyle: 'none' | 'box' | 'highlight';
}

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 1,
    name: 'Teal Gradient Professional',
    backgroundType: 'gradient',
    primaryColor: '#0d9488',
    secondaryColor: '#14b8a6',
    fontFamily: 'Inter, sans-serif',
    layoutType: 'modern',
    animationStyle: 'smooth',
    headerFontSize: '48px',
    questionFontSize: '28px',
    optionFontSize: '24px',
    captionStyle: 'none'
  },
  {
    id: 2,
    name: 'Warm Gradient Modern',
    backgroundType: 'gradient',
    primaryColor: '#0d9488',
    secondaryColor: '#6366f1',
    fontFamily: 'Poppins, sans-serif',
    layoutType: 'modern',
    animationStyle: 'dynamic',
    headerFontSize: '52px',
    questionFontSize: '30px',
    optionFontSize: '26px',
    captionStyle: 'none'
  },
  {
    id: 3,
    name: 'Cool Blue Academic',
    backgroundType: 'gradient',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Inter, sans-serif',
    layoutType: 'classic',
    animationStyle: 'smooth',
    headerFontSize: '46px',
    questionFontSize: '28px',
    optionFontSize: '24px',
    captionStyle: 'none'
  },
  {
    id: 4,
    name: 'Clean Minimal',
    backgroundType: 'solid',
    primaryColor: '#f3f4f6',
    secondaryColor: '#1f2937',
    fontFamily: 'Inter, sans-serif',
    layoutType: 'minimal',
    animationStyle: 'subtle',
    headerFontSize: '44px',
    questionFontSize: '26px',
    optionFontSize: '22px',
    captionStyle: 'none'
  }
];

export function generateTemplateCSS(template: VideoTemplate): string {
  let background = '';

  if (template.backgroundType === 'gradient') {
    background = `linear-gradient(135deg, ${template.primaryColor} 0%, ${template.secondaryColor} 100%)`;
  } else {
    background = template.primaryColor;
  }

  const textColor = template.backgroundType === 'solid' && template.primaryColor.includes('f3f4f6')
    ? template.secondaryColor
    : '#ffffff';

  return `
    body {
      margin: 0;
      padding: 0;
      width: 1080px;
      height: 1920px;
      background: ${background};
      font-family: ${template.fontFamily};
      color: ${textColor};
      overflow: hidden;
      position: relative;
    }

    .header {
      position: absolute;
      top: 40px;
      left: 0;
      right: 0;
      text-align: center;
      padding: 20px 40px;
    }

    .header-title {
      font-size: ${template.headerFontSize};
      font-weight: 700;
      letter-spacing: 2px;
      margin: 0;
      ${template.backgroundType === 'solid' ? `color: ${template.primaryColor === '#f3f4f6' ? '#0d9488' : textColor};` : ''}
    }

    .content-container {
      position: absolute;
      top: 200px;
      left: 60px;
      right: 60px;
      bottom: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 40px;
    }

    .question-container {
      width: 100%;
      max-width: 900px;
      margin-bottom: 60px;
    }

    .question-type {
      font-size: 24px;
      font-weight: 600;
      color: ${template.backgroundType === 'solid' ? '#f59e0b' : '#fbbf24'};
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 30px;
      text-align: center;
    }

    .question-text {
      font-size: ${template.questionFontSize};
      font-weight: 500;
      line-height: 1.6;
      text-align: center;
      margin: 0 0 40px 0;
      padding: 0 20px;
    }

    .options-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .option {
      background: ${template.backgroundType === 'solid' ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'};
      border: 3px solid ${template.backgroundType === 'solid' ? '#d1d5db' : 'rgba(255, 255, 255, 0.3)'};
      border-radius: 20px;
      padding: 24px 30px;
      font-size: ${template.optionFontSize};
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s ease;
      ${template.backgroundType === 'solid' ? `color: ${template.secondaryColor};` : ''}
    }

    .option-letter {
      background: ${template.backgroundType === 'solid' ? template.secondaryColor : 'rgba(255, 255, 255, 0.25)'};
      color: ${template.backgroundType === 'solid' ? '#ffffff' : textColor};
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 28px;
      flex-shrink: 0;
    }

    .option-text {
      flex: 1;
    }

    .timer-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .timer-box {
      background: rgba(255, 255, 255, 0.2);
      border: 4px solid ${template.backgroundType === 'solid' ? '#f59e0b' : '#fbbf24'};
      border-radius: 30px;
      padding: 30px 60px;
      margin-bottom: 40px;
    }

    .timer-number {
      font-size: 120px;
      font-weight: 800;
      line-height: 1;
      margin: 0;
      ${template.backgroundType === 'solid' ? `color: ${template.secondaryColor};` : ''}
    }

    .timer-label {
      font-size: 32px;
      font-weight: 600;
      margin-top: 10px;
    }

    .answer-container {
      width: 100%;
      max-width: 900px;
      margin-top: 40px;
    }

    .answer-box {
      background: ${template.backgroundType === 'solid' ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'};
      border: 4px solid ${template.backgroundType === 'solid' ? '#10b981' : '#34d399'};
      border-radius: 20px;
      padding: 30px 40px;
      margin-bottom: 30px;
    }

    .answer-title {
      font-size: 32px;
      font-weight: 700;
      color: ${template.backgroundType === 'solid' ? '#10b981' : '#34d399'};
      margin: 0 0 15px 0;
      text-align: center;
    }

    .answer-text {
      font-size: 28px;
      font-weight: 600;
      margin: 0;
      text-align: center;
      ${template.backgroundType === 'solid' ? `color: ${template.secondaryColor};` : ''}
    }

    .solution-box {
      background: ${template.backgroundType === 'solid' ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'};
      border: 3px solid ${template.backgroundType === 'solid' ? '#d1d5db' : 'rgba(255, 255, 255, 0.3)'};
      border-radius: 20px;
      padding: 30px 40px;
    }

    .solution-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 20px 0;
      text-align: center;
    }

    .solution-text {
      font-size: 22px;
      line-height: 1.6;
      margin: 0;
      ${template.backgroundType === 'solid' ? `color: ${template.secondaryColor};` : ''}
    }

    .decoration-icon {
      position: absolute;
      opacity: 0.1;
      font-size: 120px;
    }

    .icon-top-left {
      top: 150px;
      left: 40px;
    }

    .icon-top-right {
      top: 150px;
      right: 40px;
    }

    .icon-bottom-right {
      bottom: 100px;
      right: 40px;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    .animate-fade-in {
      animation: fadeIn ${template.animationStyle === 'dynamic' ? '0.4s' : '0.6s'} ease-out;
    }

    .animate-slide-in {
      animation: slideIn ${template.animationStyle === 'dynamic' ? '0.3s' : '0.5s'} ease-out;
    }

    .animate-pulse {
      animation: pulse ${template.animationStyle === 'subtle' ? '2s' : '1.5s'} ease-in-out infinite;
    }
  `;
}

export function getRandomTemplate(): VideoTemplate {
  return VIDEO_TEMPLATES[Math.floor(Math.random() * VIDEO_TEMPLATES.length)];
}
